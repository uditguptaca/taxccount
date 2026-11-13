// Plain-language descriptions of the rules, for Service Master and anywhere else a person has to read them.
// Pure functions over a CountryPack: no framework, no database.
import type { Compliance, Cond, CountryPack, DueRule, Kind, Question } from './types.ts';

export const KIND_LABEL: Record<Kind, string> = {
  individual: 'A person', sole_prop: 'A person in business (unincorporated)', partnership: 'A partnership', corporation: 'A corporation or company',
  llc: 'An LLC or LLP', trust: 'A trust, estate or foundation', nonprofit: 'A non-profit or charity', branch: 'A branch of a foreign company',
};
export const FREQ_LABEL: Record<string, string> = { annual: 'Every year', biennial: 'Every two years', semiannual: 'Twice a year', quarterly: 'Every quarter', monthly: 'Every month', event: 'When something happens', once: 'Once' };
export const QTYPE_LABEL: Record<string, string> = { yn: 'Yes / No', choice: 'Choose one', multi: 'Choose several', date: 'A date', monthday: 'A day of the year (month and day)' };
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const list = (a: string[], word = 'or') => (a.length <= 1 ? a.join('') : a.length === 2 ? a.join(` ${word} `) : `${a.slice(0, -1).join(', ')} ${word} ${a[a.length - 1]}`);
const arr = (v: string | string[]) => (Array.isArray(v) ? v : [v]);
const short = (s: string, n = 70) => (s.length > n ? s.slice(0, n - 1).trimEnd() + '…' : s);

/** A condition as a sentence fragment, for example: the entity type is Corporation and "Do you pay employees?" is Yes. */
export function describeCond(c: Cond | undefined, p: CountryPack, top = true): string {
  if (!c) return top ? 'Always' : 'always';
  const q = (id: string) => `“${short(p.questions.find((x) => x.id === id)?.text ?? id)}”`;
  const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  // a year end tested for one date ("06-30") is said as that date
  const optLabel = (qid: string, v: string) => p.questions.find((x) => x.id === qid)?.options?.find((o) => o.v === v)?.label ?? (/^\d{2}-\d{2}$/.test(v) ? `${Number(v.slice(3))} ${MONTH_NAMES[Number(v.slice(0, 2)) - 1]}` : v);
  if ('all' in c) { if (c.all.length === 0) return top ? 'Always' : 'always'; const parts = c.all.map((k) => wrap(k, p, 'any')); return parts.join(' AND '); }
  if ('any' in c) { if (c.any.length === 0) return 'never'; const parts = c.any.map((k) => wrap(k, p, 'all')); return parts.join(' OR '); }
  if ('not' in c) return `NOT (${describeCond(c.not, p, false)})`;
  if ('q' in c) {
    if ('yes' in c) return `${q(c.q)} is Yes`;
    if ('no' in c) return `${q(c.q)} is No`;
    if ('is' in c) return `${q(c.q)} is ${list(arr(c.is).map((v) => `“${short(optLabel(c.q, v), 40)}”`))}`;
    if ('has' in c) return `${q(c.q)} includes ${list(arr(c.has).map((v) => `“${short(optLabel(c.q, v), 40)}”`))}`;
    return `${q(c.q)} has been answered`;
  }
  if ('kind' in c) return `it is ${list(c.kind.map((k) => KIND_LABEL[k]?.toLowerCase() ?? k))}`;
  if ('entity' in c) return `the entity type is ${list(c.entity.map((e) => p.entityTypes.find((x) => x.id === e)?.name ?? e))}`;
  if ('etag' in c) return `the entity type is ${list(p.entityTypes.filter((e) => e.tags?.includes(c.etag)).map((e) => e.name)) || `tagged “${c.etag}”`}`;
  if ('state' in c) return `the ${p.stateLabel.toLowerCase()} is ${list(c.state.map((s) => p.states.find((x) => x.code === s)?.name ?? s))}`;
  if ('stag' in c) { const names = p.states.filter((s) => s.tags?.includes(c.stag)).map((s) => s.name); return names.length > 6 ? `the ${p.stateLabel.toLowerCase()} is one of the ${names.length} tagged “${c.stag}”` : `the ${p.stateLabel.toLowerCase()} is ${list(names) || `tagged “${c.stag}”`}`; }
  if ('dept' in c) return `the department chosen is ${list(c.dept.map((d) => p.departments.find((x) => x.id === d)?.name ?? d))}`;
  return 'a condition this screen cannot describe';
}
const wrap = (c: Cond, p: CountryPack, inner: 'all' | 'any') => { const s = describeCond(c, p, false); return (inner in c && (c as any)[inner].length > 1) ? `(${s})` : s; };

/** Everything a condition mentions, so screens can show what is linked to what. */
export function condRefs(c: Cond | undefined, out = { questions: new Set<string>(), entities: new Set<string>(), kinds: new Set<string>(), etags: new Set<string>(), states: new Set<string>(), stags: new Set<string>() }) {
  if (!c) return out;
  if ('all' in c) c.all.forEach((k) => condRefs(k, out));
  else if ('any' in c) c.any.forEach((k) => condRefs(k, out));
  else if ('not' in c) condRefs(c.not, out);
  else if ('q' in c) out.questions.add(c.q);
  else if ('kind' in c) c.kind.forEach((k) => out.kinds.add(k));
  else if ('entity' in c) c.entity.forEach((k) => out.entities.add(k));
  else if ('etag' in c) out.etags.add(c.etag);
  else if ('state' in c) c.state.forEach((k) => out.states.add(k));
  else if ('stag' in c) out.stags.add(c.stag);
  return out;
}

const md = ([m, d]: [number, number]) => `${d} ${MONTHS[m - 1]}`;
const nth = (n: number) => `${n}${n % 100 >= 11 && n % 100 <= 13 ? 'th' : ['th', 'st', 'nd', 'rd'][n % 10] ?? 'th'}`;
const plural = (n: number, w: string) => `${n} ${w}${n === 1 ? '' : 's'}`;

/** A due-date rule as a sentence, for example: 6 months after the financial year ends. */
export function describeDue(r: DueRule, p: CountryPack): string {
  const yr = (basis: 'fy' | 'cal') => (basis === 'cal' ? 'the calendar year' : p.fixedYearEnd ? `the financial year (${md(p.fixedYearEnd)})` : 'the financial year');
  const qtext = (id: string) => `“${short(p.questions.find((x) => x.id === id)?.text ?? id, 50)}”`;
  switch (r.t) {
    case 'event': return r.from ? `${r.text} (worked out from the date given in ${qtext(r.from)})` : `When it happens: ${r.text}`;
    case 'on': return `On ${list(r.dates, 'and')} (one-off)`;
    case 'fixed': return `${list(r.dates.map(md), 'and')}${r.years ? ` in ${r.years}-numbered years` : ' every year'}${r.forYear === -1 ? ', for the year before' : ''}`;
    case 'afterYearEnd': {
      const parts: string[] = [];
      if (r.months) parts.push(plural(r.months, 'month'));
      if (r.days && !r.months) parts.push(plural(r.days, 'day'));
      let s = parts.length ? `${parts.join(' and ')} after ${yr(r.basis)} ends` : `The day ${yr(r.basis)} ends`;
      if (r.day) s += `, on the ${nth(r.day)} of that month`;
      if (r.days && r.months) s += `, plus ${plural(r.days, 'day')}`;
      if (r.capNextCal) s += `, but no later than ${md(r.capNextCal)} of the following calendar year`;
      const ex = Object.entries(r.except ?? {});
      if (ex.length) s += `. Exceptions: ${ex.map(([y, d]) => `year ended in ${y} → ${d}`).join('; ')}`;
      return s;
    }
    case 'afterPeriodEnd': {
      const per = r.freq === 'monthly' ? 'month' : r.freq === 'quarterly' ? 'quarter' : 'half-year';
      let s = r.day && r.months ? `The ${nth(r.day)} of the ${r.months === 1 ? 'month' : `${nth(r.months)} month`} after each ${per}` : r.months ? `${plural(r.months, 'month')} after each ${per} ends` : r.days ? `${plural(r.days, 'day')} after each ${per} ends` : `The last day of each ${per}`;
      if (r.days && r.months) s += `, plus ${plural(r.days, 'day')}`;
      if (r.freq !== 'monthly') s += r.basis === 'fy' ? ` (${per}s of the financial year)` : ` (calendar ${per}s)`;
      if (r.ask) s += `; the ${per}s follow the answer to ${qtext(r.ask)}`;
      if (r.alt) s += `; for the period ending in ${MONTHS[r.alt.endMonth - 1]} the day is the ${nth(r.alt.day)}`;
      if (r.skipQuarterEnd) s += '; not for the last month of a quarter';
      return s;
    }
    case 'inYear': return `The ${nth(r.day)} day of the ${list(r.months.map(nth), 'and')} month${r.months.length > 1 ? 's' : ''} of ${yr(r.basis)}`;
    case 'anniversary': {
      // an expiry date given by the person is itself the deadline (phase 26: it read "The anniversary of" before)
      if (r.first && !r.at && !r.monthStart && !r.monthEnd && !r.quarterEnd && !r.months && !r.days) return `The date given in ${qtext(r.of)}, then the same day every ${r.every && r.every > 1 ? `${r.every} years` : 'year'}`;
      let s = r.at ? `${md(r.at)}` : r.monthStart ? 'The first day of the anniversary month' : r.monthEnd ? 'The last day of the anniversary month' : r.quarterEnd ? 'The end of the calendar quarter of the anniversary' : 'The anniversary';
      s += ` of the date given in ${qtext(r.of)}`;
      if (r.months) s += `, plus ${plural(r.months, 'month')}`;
      if (r.days) s += `, ${r.days < 0 ? `minus ${plural(-r.days, 'day')}` : `plus ${plural(r.days, 'day')}`}`;
      if (r.every && r.every > 1) s += `, every ${r.every} years${r.offset ? ` starting ${plural(r.offset, 'year')} after` : ''}`;
      return s;
    }
  }
}

/** Which date question (if any) a due-date rule is counted from. */
export function dueDependsOn(r: DueRule, p: CountryPack): string | null {
  if (r.t === 'anniversary') return r.of;
  if (r.t === 'event' && r.from) return r.from;
  if ((r.t === 'afterYearEnd' || r.t === 'afterPeriodEnd' || r.t === 'inYear') && r.basis === 'fy' && !p.fixedYearEnd) return 'fye';
  return null;
}

/** For each question, the filings and the other questions whose conditions mention it. */
export function questionLinks(p: CountryPack) {
  const map = new Map<string, { compliances: Compliance[]; questions: Question[]; dates: Compliance[] }>();
  const get = (id: string) => { let v = map.get(id); if (!v) { v = { compliances: [], questions: [], dates: [] }; map.set(id, v); } return v; };
  for (const q of p.questions) get(q.id);
  for (const c of p.compliances) {
    condRefs(c.applies).questions.forEach((id) => get(id).compliances.push(c));
    const dep = dueDependsOn(c.due, p); if (dep) get(dep).dates.push(c);
    if (c.due.t === 'afterPeriodEnd' && c.due.ask) get(c.due.ask).dates.push(c);
  }
  for (const q of p.questions) condRefs(q.show).questions.forEach((id) => get(id).questions.push(q));
  return map;
}
