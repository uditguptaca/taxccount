// Server side of the compliance checker: input checking, the signed "result ticket" a visitor carries from
// the homepage into their new account, and a small per-address request limit for the public endpoint.
import jwt from 'jsonwebtoken';
import { getPack } from '@/lib/compliance-catalog';
import { entityTypesFor, isRealDate, isRealMonthDay, unanswered, visibleQuestions } from '@/lib/compliance/engine';
import type { Answers, CountryPack, Selection } from '@/lib/compliance/types';
import { jwtSecret } from '@/lib/jwt-secret';


/**
 * Today's date for a country: the date in its WESTERNMOST time zone, the last place where the day is still running.
 * It used to be the server's UTC date, which turns to tomorrow at 20:00 in Toronto and 17:00 in Vancouver: on the
 * evening of a due date that date vanished from the list and the next year's was shown. A country not listed here
 * (one added in Service Master) uses UTC-12, so no due date anywhere is dropped while it is still today somewhere.
 */
const WESTMOST: Record<string, string> = { CA: 'America/Vancouver', US: 'Pacific/Honolulu', IN: 'Asia/Kolkata', AE: 'Asia/Dubai' };
export const today = (country?: string) => {
  const tz = (country && WESTMOST[country]) || 'Etc/GMT+12';
  return new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
};

/** Returns a clean selection and answers, or an error message. Nothing a visitor sends is trusted. */
export async function readInput(body: any): Promise<{ pack: CountryPack; sel: Selection; answers: Answers; bad: string[] } | { error: string }> {
  const s = body?.sel ?? {};
  if ([s.country, s.state, s.entity].some((v) => v !== undefined && typeof v !== 'string')) return { error: 'Choose a country' };
  const pack = await getPack(String(s.country || ''));
  if (!pack) return { error: 'Choose a country' };
  const state = String(s.state || '');
  if (!pack.states.some((x) => x.code === state)) return { error: `Choose a ${pack.stateLabel.toLowerCase()}` };
  const entity = String(s.entity || '');
  if (!entityTypesFor(pack, state).some((e) => e.id === entity)) return { error: 'Choose an entity type' };
  const all = pack.departments.map((d) => d.id);
  // each type once, in the country's own order: a type ticked twice is one tick (and one cache key, one ticket size)
  const ticked = new Set<string>(Array.isArray(s.depts) ? s.depts.filter((d: unknown) => typeof d === 'string') : []);
  const depts = all.filter((d: string) => ticked.has(d));
  if (depts.length === 0) return { error: 'Choose a department' };
  const known = new Map(pack.questions.map((q) => [q.id, q]));
  const answers: Answers = {};
  const bad: string[] = [];   // a date given but not a real one: asked again even when the question is optional (phase 26)
  const raw = body?.answers && typeof body.answers === 'object' && !Array.isArray(body.answers) ? body.answers : {};
  // in the country's own question order, whatever order they arrived in: the same check is then the same text, and
  // saving it twice finds the first (independent audit, I6)
  for (const q of pack.questions) {
    if (!(q.id in raw)) continue;
    const k = q.id, v = (raw as any)[k];
    if (q.type === 'yn') { if (v === 'yes' || v === 'no' || v === 'unsure') answers[k] = v; }
    else if (q.type === 'choice') { if (typeof v === 'string' && (v === 'unsure' || q.options?.some((o) => o.v === v))) answers[k] = v; }
    else if (q.type === 'multi') { if (Array.isArray(v)) answers[k] = v.map(String).filter((x) => q.options?.some((o) => o.v === x)).slice(0, 40); }
    else if (q.type === 'date') { if (isRealDate(v)) answers[k] = v; else if (v !== undefined && v !== null && v !== '') bad.push(k); }
    else if (q.type === 'monthday') { if (isRealMonthDay(v)) answers[k] = v; else if (v !== undefined && v !== null && v !== '') bad.push(k); }
  }
  return { pack, sel: { country: pack.code, state, entity, depts }, answers, bad };
}

/** The questions still to answer: those left blank, and any date given that is not a real date (shown or not optional). */
export function stillToAnswer(input: { pack: CountryPack; sel: Selection; answers: Answers; bad: string[] }): string[] {
  const ids = unanswered(input.pack, input.sel, input.answers).map((q) => q.id);
  const shown = new Set(visibleQuestions(input.pack, input.sel, input.answers).map((q) => q.id));
  for (const k of input.bad) if (shown.has(k) && !ids.includes(k)) ids.push(k);
  return ids;
}

/** The ticket holds the visitor's own selections and answers, signed so it cannot be altered. It carries no account. */
export function signTicket(sel: Selection, answers: Answers, version: string): string {
  return jwt.sign({ t: 'compliance-check', sel, answers, v: version }, jwtSecret(), { expiresIn: '30d' });
}
export function readTicket(token: unknown): { sel: Selection; answers: Answers } | null {
  if (typeof token !== 'string' || token.length > 20000) return null;
  try {
    const p = jwt.verify(token, jwtSecret()) as any;
    if (p?.t !== 'compliance-check' || !p.sel) return null;
    return { sel: p.sel, answers: p.answers || {} };
  } catch { return null; }
}

// ── request limit for the public endpoint (per server instance; enough to stop a runaway script) ──
const hits = new Map<string, { n: number; t: number }>();
/**
 * `kind` keeps separate tallies: reading the questions must not use up the allowance for running a check. They shared
 * one tally, so a visitor who changed their selection a few times (each change reads a little) could find the check
 * itself refused.
 */
export function allow(ip: string, perMinute = 60, kind = ''): boolean {
  const key = kind ? `${kind}:${ip}` : ip;
  const now = Date.now(), cur = hits.get(key);
  if (!cur || now - cur.t > 60000) { hits.set(key, { n: 1, t: now }); if (hits.size > 5000) hits.clear(); return true; }
  cur.n++;
  return cur.n <= perMinute;
}
// The caller's address as the host saw it: Vercel sets x-real-ip and x-vercel-forwarded-for itself, so a visitor
// cannot choose them; the first x-forwarded-for entry is only the fallback for other hosts (independent audit, M6)
export const ipOf = (req: Request) => (req.headers.get('x-real-ip') || (req.headers.get('x-vercel-forwarded-for') || '').split(',')[0] || (req.headers.get('x-forwarded-for') || '').split(',')[0]).trim() || 'local';
/** A check is a few kilobytes; anything far larger is refused before it is read (independent audit, M6). */
export const tooBig = (req: Request) => Number(req.headers.get('content-length') || 0) > 200_000;
