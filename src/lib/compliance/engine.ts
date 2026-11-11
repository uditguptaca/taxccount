// The rules engine of the compliance checker. Pure functions: selections and answers in, questions and
// filings with due dates out. A blank answer is never read as "No": an unanswered or "not sure" question
// can only ever make a filing show as "check whether this applies", never hide it.
import type { Answers, Certainty, Compliance, Cond, CountryPack, DueDate, DueRule, EntityType, Question, Result, Selection, State } from './types.ts';

export interface Ctx { pack: CountryPack; sel: Selection; answers: Answers; entity: EntityType; state: State | undefined; lenient: boolean; /** questions this person is actually asked; a test on any other question is simply false */ asked?: Set<string> }

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
  // "not X" is certain only when X is certainly false, and possible whenever X is not certainly true
  if ('not' in c) return !evalCond(c.not, { ...x, lenient: !x.lenient });
  if ('kind' in c) return c.kind.includes(x.entity.kind);
  if ('entity' in c) return c.entity.includes(x.entity.id);
  if ('etag' in c) return !!x.entity.tags?.includes(c.etag);
  if ('state' in c) return c.state.includes(x.sel.state);
  if ('stag' in c) return !!x.state?.tags?.includes(c.stag);
  if ('dept' in c) return c.dept.some((d) => x.sel.depts.includes(d));
  if (x.asked && !x.asked.has(c.q)) return false;          // never asked: not "unsure", just not relevant
  const v = x.answers[c.q];
  if ('answered' in c) return !isUnsure(v);
  // "not sure" (or no answer) could be anything: it satisfies a test only in the lenient pass
  if (isUnsure(v)) return x.lenient;
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
  // a question that hangs on a question that is itself not asked is not asked either: settle that first
  let asked = new Set(pack.questions.map((q) => q.id));
  for (let i = 0; i < 8; i++) {
    const vis = pack.questions.filter((q) => evalCond(q.show, { ...x, asked }));
    if (vis.length === asked.size) return vis;
    asked = new Set(vis.map((q) => q.id));
  }
  return pack.questions.filter((q) => evalCond(q.show, { ...x, asked }));
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
export function dueDates(rule: DueRule, x: Ctx, today: string, count = 2, rollWeekend?: boolean): { dates: DueDate[]; needs?: string } {
  const t0 = new Date(today + 'T00:00:00Z');
  const rollOn = rollWeekend ?? x.pack.rollWeekend;
  const out: DueDate[] = [];
  const push = (d: Date, period: string) => { const r = roll(d, rollOn); if (r.getTime() >= t0.getTime()) out.push({ date: iso(r), period }); };
  const y0 = t0.getUTCFullYear();

  if (rule.t === 'event') return { dates: [] };
  if (rule.t === 'on') { for (const d of rule.dates) push(new Date(d + 'T00:00:00Z'), ''); out.sort((a, b) => a.date.localeCompare(b.date)); return { dates: out.slice(0, count) }; }
  if (rule.t === 'fixed') {
    for (let y = y0; y <= y0 + 3; y++) { if (rule.years && (y % 2 === 0) !== (rule.years === 'even')) continue; for (const [m, d] of rule.dates) push(utc(y, m, d), rule.forYear === undefined ? '' : `${y + rule.forYear}`); }
  } else if (rule.t === 'afterYearEnd') {
    const ye: [number, number] | null = rule.basis === 'cal' ? [12, 31] : yearEnd(x);
    if (!ye) return { dates: [], needs: 'fye' };
    for (let y = y0 - 2; y <= y0 + 2; y++) {
      const end = yearEndDate(ye, y);
      let d = afterEnd(end, rule);
      const ex = rule.except?.[end.getUTCFullYear()];                       // a one-off date the authority set for that year (an extension)
      if (ex) d = new Date(ex + 'T00:00:00Z');
      if (rule.capNextCal) { const cap = utc(end.getUTCFullYear() + 1, rule.capNextCal[0], rule.capNextCal[1]); if (d.getTime() > cap.getTime()) d = cap; }
      push(d, yearLabel(end, ye));
    }
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
      if (rule.skipQuarterEnd && m % 3 === 0) continue;                      // the last month of a quarter is covered by the quarterly return
      let due = afterEnd(end, rule);
      if (rule.alt && rule.alt.endMonth === m) due = utc(due.getUTCFullYear(), due.getUTCMonth() + 1, Math.min(rule.alt.day, lastDay(due.getUTCFullYear(), due.getUTCMonth() + 1)));
      push(due, label);
    }
  } else if (rule.t === 'inYear') {
    const ye: [number, number] | null = rule.basis === 'cal' ? [12, 31] : yearEnd(x);
    if (!ye) return { dates: [], needs: 'fye' };
    for (let y = y0 - 1; y <= y0 + 2; y++) {
      const end = yearEndDate(ye, y);                       // the tax year that ENDS in year y starts in the month after ye[0] of y-1
      for (const n of rule.months) { const d = utc(y - 1, ye[0] + n, 1); push(utc(d.getUTCFullYear(), d.getUTCMonth() + 1, rule.day), yearLabel(end, ye)); }
    }
  } else if (rule.t === 'anniversary') {
    const v = x.answers[rule.of];
    if (typeof v !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return { dates: [], needs: rule.of };
    const [sy, m, d] = v.split('-').map(Number);
    const every = rule.every ?? 1;
    for (let y = y0 - 1; y <= y0 + 2 + every; y++) {
      if (y <= sy) continue;                                                 // the first one is in a later year than the start
      if ((((y - sy - (rule.offset ?? 0)) % every) + every) % every !== 0) continue;   // every N years, counted from the start year (plus offset)
      let base = utc(y, m, Math.min(d, lastDay(y, m)));
      if (rule.monthStart) base = utc(y, m, 1);
      if (rule.monthEnd) base = utc(y, m, lastDay(y, m));
      if (rule.quarterEnd) { const qm = Math.ceil(m / 3) * 3; base = utc(y, qm, lastDay(y, qm)); }
      if (rule.at) base = utc(y, rule.at[0], rule.at[1]);
      if (rule.months) base = addMonths(base, rule.months);
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
  const s0 = makeCtx(pack, sel, answers, false), l0 = makeCtx(pack, sel, answers, true);
  if (!s0 || !l0) return [];
  const asked = new Set(visibleQuestions(pack, sel, answers).map((q) => q.id));
  const strict = { ...s0, asked }, lenient = { ...l0, asked };
  const src = new Map(pack.sources.map((s) => [s.id, s]));
  const out: Result[] = [];
  for (const c of pack.compliances) {
    if (!sel.depts.includes(c.dept)) continue;
    let certainty: Certainty;
    if (evalCond(c.applies, strict)) certainty = 'applies';
    else if (evalCond(c.applies, lenient)) certainty = 'check';
    else continue;
    const d = dueDates(c.due, strict, today, 2, c.roll === false ? false : undefined);
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
