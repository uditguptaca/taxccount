// The rules engine of the compliance checker. Pure functions: selections and answers in, questions and
// filings with due dates out. A blank answer is never read as "No": an unanswered or "not sure" question
// can only ever make a filing show as "check whether this applies", never hide it.
import { deadlineFrom, windowOf, windowText } from './window.ts';
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

/** Every question a condition reads. */
function questionsIn(c: Cond | undefined, out = new Set<string>()): Set<string> {
  if (!c) return out;
  if ('all' in c) c.all.forEach((k) => questionsIn(k, out));
  else if ('any' in c) c.any.forEach((k) => questionsIn(k, out));
  else if ('not' in c) questionsIn(c.not, out);
  else if ('q' in c) out.add(c.q);
  return out;
}

/**
 * The questions that could be put to this entity type in this place with these ticks, whatever is answered. A compliance
 * that hangs on a question nobody of this kind is ever asked can never apply to them.
 */
export function askableQuestions(pack: CountryPack, x: Ctx): Set<string> {
  const open: Ctx = { ...x, answers: {}, lenient: true };
  let asked = new Set(pack.questions.map((q) => q.id));
  for (let i = 0; i < 8; i++) {
    const vis = pack.questions.filter((q) => evalCond(q.show, { ...open, asked }));
    if (vis.length === asked.size && vis.every((q) => asked.has(q.id))) break;      // the same questions, not merely as many
    asked = new Set(vis.map((q) => q.id));
  }
  return asked;
}

/**
 * The questions that can change the answer for the types of compliance the person ticked: the ones a compliance of a
 * ticked type depends on (who it applies to, or the date it is counted from), and the questions that decide whether
 * those are asked. A person who ticks only sales tax is not asked about the small business deduction.
 */
const relevantCache = new WeakMap<CountryPack, Map<string, Set<string>>>();
/** One selection as a key: place, entity type and the ticked types in a fixed order. */
export const relevantKey = (sel: Selection) => `${sel.state}|${sel.entity}|${Array.from(new Set(sel.depts)).sort().join(',')}`;
export function relevantQuestions(pack: CountryPack, sel: Selection): Set<string> {
  const key = relevantKey(sel);
  let mine = relevantCache.get(pack); if (!mine) { mine = new Map(); relevantCache.set(pack, mine); }
  const hit = mine.get(key); if (hit) return hit;
  if (mine.size > 4000) mine.clear();                // a bound on memory: the sets are cheap to work out again
  const out = new Set<string>();
  const x = makeCtx(pack, sel, {}, true);
  if (x) {
    const byId = new Map(pack.questions.map((q) => [q.id, q]));
    const add = (id: string) => { const q = byId.get(id); if (!q || out.has(id)) return; out.add(id); questionsIn(q.show).forEach(add); };
    const can = { ...x, asked: askableQuestions(pack, x) };
    for (const c of pack.compliances) {
      if (!sel.depts.includes(c.dept)) continue;
      if (!evalCond(c.applies, can)) continue;                     // ruled out by the entity type, the place or the ticks alone, whatever is answered
      questionsIn(c.applies).forEach(add);
      const d = c.due;
      if (d.t === 'anniversary') add(d.of);
      if (d.t === 'event' && d.from) add(d.from);
      if (d.t === 'afterPeriodEnd' && d.ask) add(d.ask);
      if ((d.t === 'afterYearEnd' || d.t === 'afterPeriodEnd' || d.t === 'inYear') && d.basis === 'fy') add('fye');
    }
  }
  mine.set(key, out);
  return out;
}

/** The questions this person is asked, in order. A question whose condition hangs on a "not sure" answer is still asked. */
export function visibleQuestions(pack: CountryPack, sel: Selection, answers: Answers): Question[] {
  const x = makeCtx(pack, sel, answers, true);
  if (!x) return [];
  const mine = relevantQuestions(pack, sel);
  const pool = pack.questions.filter((q) => mine.has(q.id));
  // a question that hangs on a question that is itself not asked is not asked either: settle that first
  let asked = new Set(pool.map((q) => q.id));
  for (let i = 0; i < 8; i++) {
    const vis = pool.filter((q) => evalCond(q.show, { ...x, asked }));
    if (vis.length === asked.size && vis.every((q) => asked.has(q.id))) return vis;   // the same questions, not merely as many
    asked = new Set(vis.map((q) => q.id));
  }
  return pool.filter((q) => evalCond(q.show, { ...x, asked }));
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
export function dueDates(rule: DueRule, x: Ctx, today: string, count = 2, rollWeekend?: boolean, moved?: Compliance['moved']): { dates: DueDate[]; needs?: string; passed?: string } {
  const t0 = new Date(today + 'T00:00:00Z');
  const rollOn = rollWeekend ?? x.pack.rollWeekend;
  const out: DueDate[] = [];
  const push = (d: Date, period: string) => {
    let r = roll(d, rollOn);
    // an extension the authority gave for this one period replaces the usual date (even when the usual date has passed)
    const mv = moved?.find((m) => m.from === iso(d) || m.from === iso(r));
    if (mv && /^\d{4}-\d{2}-\d{2}$/.test(mv.to)) { const was = iso(r); r = new Date(mv.to + 'T00:00:00Z'); if (r.getTime() >= t0.getTime()) out.push({ date: iso(r), period, was, movedNote: mv.note }); return; }
    if (r.getTime() >= t0.getTime()) out.push({ date: iso(r), period });
  };
  const y0 = t0.getUTCFullYear();

  if (rule.t === 'event') {
    // "within 60 days after incorporation" has a date as soon as the person has said when it was incorporated
    const w = rule.from ? windowOf(rule) : null;
    if (!w || !rule.from) return { dates: [] };
    const v = x.answers[rule.from];
    if (typeof v !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return { dates: [], needs: rule.from };
    // `until`: the date the person gave IS the deadline (the expiry printed on the card); nothing is added to it
    let d = w.kind === 'until' ? v : deadlineFrom(v, w);
    if (w.kind === 'every') for (let i = 0; i < 600 && d < today; i++) d = deadlineFrom(d, w);     // a renewal: the next one still ahead
    // Never moved off a weekend: no official page was read that allows it for these, and a day early is the safe side.
    // A one-time deadline that has gone by is not dropped in silence: the person is told when it fell due.
    return d >= today ? { dates: [{ date: d, period: '' }] } : { dates: [], passed: d };
  }
  if (rule.t === 'on') {
    for (const d of rule.dates) push(new Date(d + 'T00:00:00Z'), '');
    out.sort((a, b) => a.date.localeCompare(b.date));
    // every listed date has gone by: say when it last fell due instead of showing nothing (independent audit, B3)
    if (!out.length) { const gone = rule.dates.filter((d) => d < today).sort().pop(); if (gone) return { dates: [], passed: gone }; }
    return { dates: out.slice(0, count) };
  }
  if (rule.t === 'fixed') {
    for (let y = y0 - 1; y <= y0 + 3; y++) { if (rule.years && (y % 2 === 0) !== (rule.years === 'even')) continue; for (const [m, d] of rule.dates) push(utc(y, m, d), rule.forYear === undefined ? '' : `${y + rule.forYear}`); }
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
    if (rule.ask) { const a = x.answers[rule.ask]; if (typeof a === 'string' && /^\d+$/.test(a)) offset = Number(a) % step; else return { dates: [], needs: rule.ask }; }
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
    // the date given is itself the deadline (an expiry date) and it has gone by: say so, never jump to the next cycle,
    // which would hide a renewal that is owed now (the person enters the new expiry date once it is renewed)
    if (rule.first && v < today) return { dates: [], passed: v };
    for (let y = y0 - 1; y <= y0 + 2 + every; y++) {
      if (rule.first ? y < sy : y <= sy) continue;                           // the first one is in a later year than the start, unless the date given is itself the first deadline
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

/** A real calendar date (2026-02-31 and 2026-99-99 match the pattern and are not dates). */
export const isRealDate = (s: unknown): s is string => {
  if (typeof s !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  // a year a person could mean: 1850 and 9999 are typing slips, and gave "95,794 months left" or a date no rule can use
  const y = Number(s.slice(0, 4)); if (y < 1900 || y > 2100) return false;
  const d = new Date(s + 'T00:00:00Z');
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
};
/** A real month and day, for a year end ("02-29" is one; "02-31" is not). */
export const isRealMonthDay = (s: unknown): s is string => typeof s === 'string' && /^\d{2}-\d{2}$/.test(s) && isRealDate(`2024-${s}`);

/**
 * The date that follows a filing the person marked as filed. Normally the first date of a different period. When
 * several dates share one period label (the four instalments of one year), or there is no label, the first later date.
 */
export function nextAfterFiled<T extends { date: string; period: string }>(dates: T[], filed: { date?: string | null; period?: string | null }): T | undefined {
  const same = filed.period ? dates.filter((d) => d.period === filed.period) : [];
  const after = filed.date ?? '';
  if (!filed.period || same.length > 1) return dates.find((d) => d.date > after);
  // the rule's own date for the filed period, when it is still in the list: a person who filed early, on a date they
  // set by hand, must not be handed the same period again
  const own = same[0]?.date;
  return dates.find((d) => d.period !== filed.period && d.date > (own && own > after ? own : after));
}

/** How often a filing comes round, as shown: a yearly rule that falls only in even or odd years, or an anniversary
 *  every two years, is shown as every two years (independent audit, I4: 13 such duties were labelled yearly). */
export function shownFrequency(c: Compliance): Result['frequency'] {
  const d: any = c.due;
  if (c.frequency === 'annual' && ((d.t === 'fixed' && d.years) || (d.t === 'anniversary' && d.every === 2))) return 'biennial';
  return c.frequency;
}

/** The upcoming due dates of one filing, with its own weekend setting and any moved deadlines. */
export function datesFor(c: Compliance, x: Ctx, today: string, count = 2) { return dueDates(c.due, x, today, count, c.roll === false ? false : undefined, c.moved); }

/** One compliance as the person sees it: its texts, its next due dates and its official source. */
export function toResult(pack: CountryPack, c: Compliance, x: Ctx, certainty: Certainty, today: string): Result {
  const d = datesFor(c, x, today, 2);
  const s = pack.sources.find((k) => k.id === c.source);
  const ps = c.penaltySource ? pack.sources.find((k) => k.id === c.penaltySource) : undefined;
  return {
    id: c.id, name: c.name, form: c.form, head: c.head, dept: c.dept, authority: c.authority, brief: c.brief, why: c.why,
    frequency: shownFrequency(c), dueText: c.dueText, penalty: c.penalty, note: c.note, certainty, next: d.dates, needs: d.needs,
    sourceUrl: s?.url ?? '', sourceTitle: s?.title ?? '', sourcePublisher: s?.publisher, sourceChecked: s?.checked, verified: c.verified, weight: c.weight,
    ...(ps ? { penaltySourceUrl: ps.url } : {}),
    ...(c.due.t === 'event' ? { rule: c.due.text, ...(windowOf(c.due) ? { window: { text: windowText(windowOf(c.due)!), kind: windowOf(c.due)!.kind } } : {}) } : {}),
    ...(d.passed ? { passed: d.passed } : {}),
  };
}

// ── the answer ──
export function evaluate(pack: CountryPack, sel: Selection, answers: Answers, today: string): Result[] {
  const s0 = makeCtx(pack, sel, answers, false), l0 = makeCtx(pack, sel, answers, true);
  if (!s0 || !l0) return [];
  const asked = new Set(visibleQuestions(pack, sel, answers).map((q) => q.id));
  const strict = { ...s0, asked }, lenient = { ...l0, asked };
  const out: Result[] = [];
  for (const c of pack.compliances) {
    if (!sel.depts.includes(c.dept)) continue;
    let certainty: Certainty;
    if (evalCond(c.applies, strict)) certainty = 'applies';
    else if (evalCond(c.applies, lenient)) certainty = 'check';
    else continue;
    out.push(toResult(pack, c, strict, certainty, today));
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
