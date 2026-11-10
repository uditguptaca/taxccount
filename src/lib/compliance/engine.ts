// The rules engine of the compliance checker. Pure functions: selections and answers in, questions and
// filings with due dates out. A blank answer is never read as "No": an unanswered or "not sure" question
// can only ever make a filing show as "check whether this applies", never hide it.
import type { Answers, Certainty, Compliance, Cond, CountryPack, DueDate, DueRule, EntityType, Question, Result, Selection, State } from './types.ts';

export interface Ctx { pack: CountryPack; sel: Selection; answers: Answers; entity: EntityType; state: State | undefined; lenient: boolean }

export function makeCtx(pack: CountryPack, sel: Selection, answers: Answers, lenient = false): Ctx | null {
  const entity = pack.entityTypes.find((e) => e.id === sel.entity);
  if (!entity) return null;
  return { pack, sel, answers, entity, state: pack.states.find((s) => s.code === sel.state), lenient };
}

const isUnsure = (v: unknown) => v === undefined || v === '' || v === 'unsure' || (Array.isArray(v) && v.length === 0);

export function evalCond(c: Cond | undefined, x: Ctx): boolean {
  if (!c) return true;
  if ('all' in c) return c.all.every((k) => evalCond(k, x));
  if ('any' in c) return c.any.some((k) => evalCond(k, x));
  if ('not' in c) return !evalCond(c.not, { ...x, lenient: false }) ;
  if ('kind' in c) return c.kind.includes(x.entity.kind);
  if ('entity' in c) return c.entity.includes(x.entity.id);
  if ('etag' in c) return !!x.entity.tags?.includes(c.etag);
  if ('state' in c) return c.state.includes(x.sel.state);
  if ('stag' in c) return !!x.state?.tags?.includes(c.stag);
  if ('dept' in c) return c.dept.some((d) => x.sel.depts.includes(d));
  const v = x.answers[c.q];
  if ('answered' in c) return !isUnsure(v);
  // "not sure" (or no answer) counts as a possible yes only in the lenient pass
  if (isUnsure(v)) return x.lenient && !('no' in c);
  if ('yes' in c) return v === 'yes';
  if ('no' in c) return v === 'no';
  if ('is' in c) return (Array.isArray(c.is) ? c.is : [c.is]).includes(String(v));
  if ('has' in c) { const want = Array.isArray(c.has) ? c.has : [c.has]; return Array.isArray(v) && v.some((k) => want.includes(k)); }
  return false;
}

// ── selectors ──
export const statesOf = (pack: CountryPack) => pack.states;
export function entityTypesFor(pack: CountryPack, state: string): EntityType[] {
  return pack.entityTypes.filter((e) => (!e.onlyStates || e.onlyStates.includes(state)) && (!e.notStates || !e.notStates.includes(state)));
}

/** The questions this person is asked, in order. A question whose condition hangs on a "not sure" answer is still asked. */
export function visibleQuestions(pack: CountryPack, sel: Selection, answers: Answers): Question[] {
  const x = makeCtx(pack, sel, answers, true);
  if (!x) return [];
  return pack.questions.filter((q) => evalCond(q.show, x));
}

// ── dates ──
const pad = (n: number) => String(n).padStart(2, '0');
const iso = (d: Date) => `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
const utc = (y: number, m: number, d: number) => new Date(Date.UTC(y, m - 1, d));       // m is 1-12 and may overflow
const lastDay = (y: number, m: number) => new Date(Date.UTC(y, m, 0)).getUTCDate();     // m is 1-12 and may overflow
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export const fmt = (d: string) => { const [y, m, dd] = d.split('-').map(Number); return `${dd} ${MONTHS[m - 1]} ${y}`; };

/** "N months after" a date: the last day of a month stays the last day; otherwise the same day number. */
function addMonths(d: Date, n: number): Date {
  const y = d.getUTCFullYear(), m = d.getUTCMonth() + 1, day = d.getUTCDate();
  const end = day === lastDay(y, m);
  const ty = y + Math.floor((m - 1 + n) / 12), tm = ((m - 1 + n) % 12 + 12) % 12 + 1;
  return utc(ty, tm, end ? lastDay(ty, tm) : Math.min(day, lastDay(ty, tm)));
}
const addDays = (d: Date, n: number) => new Date(d.getTime() + n * 86400000);
function roll(d: Date, on: boolean): Date {
  if (!on) return d;
  const w = d.getUTCDay();
  return w === 6 ? addDays(d, 2) : w === 0 ? addDays(d, 1) : d;
}

/** The person's year end as [month, day]: fixed by the country, the calendar year for individuals, or their own answer. */
export function yearEnd(x: Ctx): [number, number] | null {
  if (x.pack.fixedYearEnd) return x.pack.fixedYearEnd;
  if (x.pack.calendarYearKinds.includes(x.entity.kind)) return [12, 31];
  const v = x.answers['fye'];
  if (typeof v === 'string' && /^\d{2}-\d{2}$/.test(v)) { const [m, d] = v.split('-').map(Number); if (m >= 1 && m <= 12 && d >= 1 && d <= 31) return [m, d]; }
  return null;
}
export const needsYearEnd = (pack: CountryPack, entity: EntityType) => !pack.fixedYearEnd && !pack.calendarYearKinds.includes(entity.kind);

const yearEndDate = (ye: [number, number], y: number) => utc(y, ye[0], Math.min(ye[1], lastDay(y, ye[0])));
function afterEnd(end: Date, r: { months?: number; days?: number; day?: number }): Date {
  let d = end;
  if (r.months) d = addMonths(d, r.months);
  if (r.day) { const y = d.getUTCFullYear(), m = d.getUTCMonth() + 1; d = utc(y, m, Math.min(r.day, lastDay(y, m))); }
  if (r.days) d = addDays(d, r.days);
  return d;
}
const yearLabel = (end: Date, ye: [number, number]) => (ye[0] === 12 && ye[1] === 31 ? `${end.getUTCFullYear()}` : `year ended ${fmt(iso(end))}`);

/** Upcoming due dates for one rule, soonest first (at most `count`, all on or after `today`). */
export function dueDates(rule: DueRule, x: Ctx, today: string, count = 2): { dates: DueDate[]; needs?: string } {
  const t0 = new Date(today + 'T00:00:00Z');
  const rollOn = x.pack.rollWeekend;
  const out: DueDate[] = [];
  const push = (d: Date, period: string) => { const r = roll(d, rollOn); if (r.getTime() >= t0.getTime()) out.push({ date: iso(r), period }); };
  const y0 = t0.getUTCFullYear();

  if (rule.t === 'event') return { dates: [] };
  if (rule.t === 'fixed') {
    for (let y = y0; y <= y0 + 2; y++) for (const [m, d] of rule.dates) push(utc(y, m, d), rule.forYear === undefined ? '' : `${y + rule.forYear}`);
  } else if (rule.t === 'afterYearEnd') {
    const ye: [number, number] | null = rule.basis === 'cal' ? [12, 31] : yearEnd(x);
    if (!ye) return { dates: [], needs: 'fye' };
    for (let y = y0 - 2; y <= y0 + 2; y++) { const end = yearEndDate(ye, y); push(afterEnd(end, rule), yearLabel(end, ye)); }
  } else if (rule.t === 'afterPeriodEnd') {
    const ye: [number, number] | null = rule.basis === 'cal' ? [12, 31] : yearEnd(x);
    if (!ye) return { dates: [], needs: 'fye' };
    const step = rule.freq === 'monthly' ? 1 : rule.freq === 'quarterly' ? 3 : 6;
    // period ends are month ends counted back from the year-end month (a year end that is not a month end is treated as its month end)
    let offset = 0;
    if (rule.ask) { const a = x.answers[rule.ask]; if (typeof a === 'string' && /^\d+$/.test(a)) offset = Number(a) % step; }
    for (let k = -18; k <= 30; k++) {
      const mIndex = (y0 * 12 + (t0.getUTCMonth())) + k;                 // months since year 0
      const y = Math.floor(mIndex / 12), m = (mIndex % 12) + 1;
      if ((((m - ye[0] - offset) % step) + step) % step !== 0) continue;
      const end = utc(y, m, lastDay(y, m));
      const label = rule.freq === 'monthly' ? `${MONTHS[m - 1]} ${y}` : `${rule.freq === 'quarterly' ? 'quarter' : 'half-year'} ended ${fmt(iso(end))}`;
      push(afterEnd(end, rule), label);
    }
  } else if (rule.t === 'anniversary') {
    const v = x.answers[rule.of];
    if (typeof v !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return { dates: [], needs: rule.of };
    const [, m, d] = v.split('-').map(Number);
    for (let y = y0 - 1; y <= y0 + 2; y++) {
      let base = utc(y, m, Math.min(d, lastDay(y, m)));
      if (base.getTime() <= new Date(v + 'T00:00:00Z').getTime()) continue;   // the first one is a year after the start
      if (rule.monthStart) base = utc(y, m, 1);
      if (rule.monthEnd) base = utc(y, m, lastDay(y, m));
      if (rule.days) base = addDays(base, rule.days);
      push(base, `${y}`);
    }
  }
  out.sort((a, b) => a.date.localeCompare(b.date));
  // one row per date (a fixed list can repeat across the loop years)
  const seen = new Set<string>();
  return { dates: out.filter((d) => (seen.has(d.date) ? false : (seen.add(d.date), true))).slice(0, count) };
}

// ── the answer ──
export function evaluate(pack: CountryPack, sel: Selection, answers: Answers, today: string): Result[] {
  const strict = makeCtx(pack, sel, answers, false), lenient = makeCtx(pack, sel, answers, true);
  if (!strict || !lenient) return [];
  const src = new Map(pack.sources.map((s) => [s.id, s]));
  const out: Result[] = [];
  for (const c of pack.compliances) {
    if (!sel.depts.includes(c.dept)) continue;
    let certainty: Certainty;
    if (evalCond(c.applies, strict)) certainty = 'applies';
    else if (evalCond(c.applies, lenient)) certainty = 'check';
    else continue;
    const d = dueDates(c.due, strict, today);
    const s = src.get(c.source);
    out.push({
      id: c.id, name: c.name, form: c.form, head: c.head, dept: c.dept, authority: c.authority, brief: c.brief, why: c.why,
      frequency: c.frequency, dueText: c.dueText, penalty: c.penalty, note: c.note, certainty, next: d.dates, needs: d.needs,
      sourceUrl: s?.url ?? '', sourceTitle: s?.title ?? '', verified: c.verified, weight: c.weight,
    });
  }
  return rank(out);
}

/** Most central filings first; among equals, the one due soonest. Filings that only "may apply" come after those that do. */
export function rank(list: Result[]): Result[] {
  return [...list].sort((a, b) =>
    (a.certainty === b.certainty ? 0 : a.certainty === 'applies' ? -1 : 1) ||
    b.weight - a.weight ||
    (a.next[0]?.date ?? '9999').localeCompare(b.next[0]?.date ?? '9999') ||
    a.name.localeCompare(b.name));
}

/** Questions the person must still answer before we can give a result (dates may be left for later). */
export function unanswered(pack: CountryPack, sel: Selection, answers: Answers): Question[] {
  return visibleQuestions(pack, sel, answers).filter((q) => !q.optional && (answers[q.id] === undefined || answers[q.id] === '' || (Array.isArray(answers[q.id]) && (answers[q.id] as string[]).length === 0)));
}

export function compliancesOf(pack: CountryPack): Compliance[] { return pack.compliances; }
