// Server side of the compliance checker: input checking, the signed "result ticket" a visitor carries from
// the homepage into their new account, and a small per-address request limit for the public endpoint.
import jwt from 'jsonwebtoken';
import { getPack } from '@/lib/compliance-catalog';
import { entityTypesFor, isRealDate, isRealMonthDay } from '@/lib/compliance/engine';
import type { Answers, CountryPack, Selection } from '@/lib/compliance/types';

const JWT_SECRET = process.env.JWT_SECRET || 'abidebylaw-dev-secret-change-in-production-2026';

export const today = () => new Date().toISOString().slice(0, 10);

/** Returns a clean selection and answers, or an error message. Nothing a visitor sends is trusted. */
export async function readInput(body: any): Promise<{ pack: CountryPack; sel: Selection; answers: Answers } | { error: string }> {
  const s = body?.sel ?? {};
  const pack = await getPack(String(s.country || ''));
  if (!pack) return { error: 'Choose a country' };
  const state = String(s.state || '');
  if (!pack.states.some((x) => x.code === state)) return { error: `Choose a ${pack.stateLabel.toLowerCase()}` };
  const entity = String(s.entity || '');
  if (!entityTypesFor(pack, state).some((e) => e.id === entity)) return { error: 'Choose an entity type' };
  const all = pack.departments.map((d) => d.id);
  // each type once, in the country's own order: a type ticked twice is one tick (and one cache key, one ticket size)
  const ticked = new Set<string>(Array.isArray(s.depts) ? s.depts.map(String) : []);
  const depts = all.filter((d: string) => ticked.has(d));
  if (depts.length === 0) return { error: 'Choose a department' };
  const known = new Map(pack.questions.map((q) => [q.id, q]));
  const answers: Answers = {};
  const raw = body?.answers && typeof body.answers === 'object' ? body.answers : {};
  for (const [k, v] of Object.entries(raw)) {
    const q = known.get(k);
    if (!q) continue;
    if (q.type === 'yn') { if (v === 'yes' || v === 'no' || v === 'unsure') answers[k] = v; }
    else if (q.type === 'choice') { if (typeof v === 'string' && (v === 'unsure' || q.options?.some((o) => o.v === v))) answers[k] = v; }
    else if (q.type === 'multi') { if (Array.isArray(v)) answers[k] = v.map(String).filter((x) => q.options?.some((o) => o.v === x)).slice(0, 40); }
    else if (q.type === 'date') { if (isRealDate(v)) answers[k] = v; }
    else if (q.type === 'monthday') { if (isRealMonthDay(v)) answers[k] = v; }
  }
  return { pack, sel: { country: pack.code, state, entity, depts }, answers };
}

/** The ticket holds the visitor's own selections and answers, signed so it cannot be altered. It carries no account. */
export function signTicket(sel: Selection, answers: Answers, version: string): string {
  return jwt.sign({ t: 'compliance-check', sel, answers, v: version }, JWT_SECRET, { expiresIn: '30d' });
}
export function readTicket(token: unknown): { sel: Selection; answers: Answers } | null {
  if (typeof token !== 'string' || token.length > 20000) return null;
  try {
    const p = jwt.verify(token, JWT_SECRET) as any;
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
export const ipOf = (req: Request) => (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'local';
