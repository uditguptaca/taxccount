// Is this item well-formed? Service Master refuses to save anything that is not, so a half-filled or
// mistyped rule can never reach the checker and break it for visitors. Pure: the tests run every
// built-in rule through it, which keeps it from being stricter than the real rules.
import type { Kind as ItemKind } from './catalog.ts';

const KINDS = ['individual', 'sole_prop', 'partnership', 'corporation', 'llc', 'trust', 'nonprofit', 'branch'];
const FREQS = ['annual', 'semiannual', 'quarterly', 'monthly', 'event', 'once'];
const QTYPES = ['yn', 'choice', 'multi', 'date', 'monthday'];
const ISO = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
const str = (v: unknown) => typeof v === 'string' && v.trim().length > 0;
const optStr = (v: unknown) => v === undefined || typeof v === 'string';
const optBool = (v: unknown) => v === undefined || typeof v === 'boolean';
const int = (v: unknown, min: number, max: number) => typeof v === 'number' && Number.isInteger(v) && v >= min && v <= max;
const optInt = (v: unknown, min: number, max: number) => v === undefined || int(v, min, max);
const strList = (v: unknown) => Array.isArray(v) && v.every((x) => typeof x === 'string' && x.length > 0);
const optStrList = (v: unknown) => v === undefined || strList(v);
const md = (v: unknown) => Array.isArray(v) && v.length === 2 && int(v[0], 1, 12) && int(v[1], 1, 31);
const isDate = (v: unknown) => typeof v === 'string' && ISO.test(v) && !Number.isNaN(Date.parse(v));

/** Problems with a condition, in plain words. */
export function condShape(c: any, depth = 0): string[] {
  if (!c || typeof c !== 'object' || Array.isArray(c)) return ['a condition is empty'];
  if (depth > 8) return ['the conditions are nested too deeply'];
  if ('all' in c) return Array.isArray(c.all) ? c.all.flatMap((k: any) => condShape(k, depth + 1)) : ['a group of conditions is not a list'];
  if ('any' in c) return Array.isArray(c.any) ? (c.any.length === 0 ? ['an "any of these" group is empty, so it can never be true'] : c.any.flatMap((k: any) => condShape(k, depth + 1))) : ['a group of conditions is not a list'];
  if ('not' in c) return condShape(c.not, depth + 1);
  if ('q' in c) {
    if (!str(c.q)) return ['a condition does not say which question it is about'];
    if (c.yes === true || c.no === true || c.answered === true) return [];
    for (const k of ['is', 'has']) if (k in c) return (str(c[k]) || (strList(c[k]) && c[k].length > 0)) ? [] : ['a condition on a question has no answer chosen'];
    return ['a condition on a question does not say which answer it needs'];
  }
  if ('kind' in c) return strList(c.kind) && c.kind.length > 0 && c.kind.every((k: string) => KINDS.includes(k)) ? [] : ['a "kind of taxpayer" condition has nothing chosen'];
  for (const k of ['entity', 'state', 'dept']) if (k in c) return strList(c[k]) && c[k].length > 0 ? [] : ['a condition has nothing chosen'];
  for (const k of ['etag', 'stag']) if (k in c) return str(c[k]) ? [] : ['a condition on a tag has no tag'];
  return ['a condition is of a kind the checker does not know'];
}

/** Problems with a due-date rule. */
export function dueShape(r: any): string[] {
  if (!r || typeof r !== 'object') return ['the due date rule is missing'];
  const basis = () => (r.basis === 'fy' || r.basis === 'cal' ? [] : ['the due date rule must say whether it follows the financial year or the calendar year']);
  switch (r.t) {
    case 'event': return str(r.text) ? [] : ['describe what triggers the due date'];
    case 'on': return Array.isArray(r.dates) && r.dates.length > 0 && r.dates.every(isDate) ? [] : ['a one-off due date needs at least one real date'];
    case 'fixed': return [
      ...(Array.isArray(r.dates) && r.dates.length > 0 && r.dates.every(md) ? [] : ['a yearly due date needs at least one real month and day']),
      ...(r.forYear === undefined || r.forYear === 0 || r.forYear === -1 ? [] : ['"it reports the year before" is not set properly']),
      ...(r.years === undefined || r.years === 'even' || r.years === 'odd' ? [] : ['"every" must be year, even-numbered year or odd-numbered year'])];
    case 'afterYearEnd': return [...basis(),
      ...(optInt(r.months, 0, 60) && optInt(r.days, -366, 800) && optInt(r.day, 1, 31) ? [] : ['the months, days or day of the month of the due date are out of range']),
      ...(r.capNextCal === undefined || md(r.capNextCal) ? [] : ['the "never later than" date is not a real month and day']),
      ...(r.except === undefined || (typeof r.except === 'object' && !Array.isArray(r.except) && Object.entries(r.except).every(([y, d]) => /^\d{4}$/.test(y) && isDate(d))) ? [] : ['an exception for one year is not a real date'])];
    case 'afterPeriodEnd': return [...basis(),
      ...(['monthly', 'quarterly', 'semiannual'].includes(r.freq) ? [] : ['choose month, quarter or half-year']),
      ...(optInt(r.months, 0, 12) && optInt(r.days, -366, 366) && optInt(r.day, 1, 31) ? [] : ['the months, days or day of the month of the due date are out of range']),
      ...(optStr(r.ask) && optBool(r.skipQuarterEnd) ? [] : ['the due date rule is not filled in properly']),
      ...(r.alt === undefined || (r.alt && int(r.alt.endMonth, 1, 12) && int(r.alt.day, 1, 31)) ? [] : ['the different day for one period is not a real day'])];
    case 'inYear': return [...basis(), ...(Array.isArray(r.months) && r.months.length > 0 && r.months.every((m: unknown) => int(m, 1, 12)) && int(r.day, 1, 31) ? [] : ['instalment months must be between 1 and 12, on a real day'])];
    case 'anniversary': return [
      ...(str(r.of) ? [] : ['choose the date question the due date is counted from']),
      ...(optInt(r.days, -366, 800) && optInt(r.months, 0, 60) && optInt(r.every, 1, 10) && optInt(r.offset, 0, 9) ? [] : ['the months, days or years of the due date are out of range']),
      ...(optBool(r.monthStart) && optBool(r.monthEnd) && optBool(r.quarterEnd) && (r.at === undefined || md(r.at)) ? [] : ['the due date rule is not filled in properly'])];
    default: return ['the due date rule is of a kind the checker does not know'];
  }
}

/** Everything wrong with one item's own fields. An empty list means it can be saved. */
export function shapeProblems(kind: ItemKind, d: any): string[] {
  if (!d || typeof d !== 'object' || Array.isArray(d)) return ['Nothing to save'];
  const out: string[] = [];
  const need = (ok: boolean, msg: string) => { if (!ok) out.push(msg); };
  switch (kind) {
    case 'country':
      need(str(d.name), 'Give the country a name');
      need(optStr(d.currency) && optStr(d.stateLabel) && optStr(d.weekendNote) && optStr(d.disclaimer) && optStr(d.builtinVersion), 'A country setting is not text');
      need(d.calendarYearKinds === undefined || (strList(d.calendarYearKinds) && d.calendarYearKinds.every((k: string) => KINDS.includes(k))), 'The list of who uses the calendar year is not valid');
      need(optBool(d.rollWeekend), 'The weekend setting is not valid');
      need(d.fixedYearEnd === undefined || md(d.fixedYearEnd), 'The financial year end is not a real month and day');
      break;
    case 'state': need(str(d.name), 'Give it a name'); need(optStrList(d.tags), 'The tags are not a list of words'); break;
    case 'entity':
      need(str(d.name), 'Give the entity type a name'); need(optStr(d.desc), 'The description is not text'); need(KINDS.includes(d.kind), 'Choose what kind of taxpayer it is');
      need(optStrList(d.onlyStates) && optStrList(d.notStates) && optStrList(d.tags), 'A list on the entity type is not valid'); break;
    case 'department': need(str(d.name), 'Give the department a name'); need(optStr(d.desc), 'The description is not text'); break;
    case 'step': need(str(d.title), 'Give the group a title'); need(optStr(d.desc), 'The explanation is not text'); need(optBool(d.checklist), 'The tick-list setting is not valid'); break;
    case 'source':
      need(str(d.title), 'Give the source a title'); need(str(d.publisher), 'Say who publishes the source');
      need(typeof d.url === 'string' && /^https:\/\/[^\s/]+\.[^\s]+$/.test(d.url), 'The link must be a full address starting with https://'); need(isDate(d.checked), 'The date the source was last read is not a real date'); break;
    case 'question':
      need(str(d.text), 'Write the question'); need(str(d.step), 'Choose the group the question is asked in'); need(QTYPES.includes(d.type), 'Choose the kind of answer');
      need(optStr(d.help) && optBool(d.optional), 'The question is not filled in properly');
      if (d.type === 'choice' || d.type === 'multi') {
        const ok = Array.isArray(d.options) && d.options.length >= 2 && d.options.every((o: any) => o && str(o.v) && str(o.label));
        need(ok, 'Give at least two answers to choose from, each with its wording');
        if (ok) need(new Set(d.options.map((o: any) => o.v)).size === d.options.length, 'Two answers have the same code');
      }
      if (d.show !== undefined) out.push(...condShape(d.show).map((p) => `Asked when: ${p}`));
      break;
    case 'compliance':
      for (const [f, label] of [['name', 'a name'], ['dept', 'a department'], ['head', 'a compliance head'], ['authority', 'the authority it is filed with'], ['brief', 'what it is, in plain words'], ['why', 'why it applies'], ['dueText', 'the due date in words'], ['source', 'an official source']] as const) need(str(d[f]), `Give the compliance ${label}`);
      need(optStr(d.form) && optStr(d.penalty) && optStr(d.note) && optStr(d.penaltySource), 'The form, penalty or note is not text');
      need(FREQS.includes(d.frequency), 'Choose how often it is due');
      need(typeof d.weight === 'number' && d.weight >= 0 && d.weight <= 100, 'The importance must be between 0 and 100');
      need(typeof d.verified === 'boolean', 'Say whether it was checked on the official page');
      need(d.roll === undefined || typeof d.roll === 'boolean', 'The weekend setting is not valid');
      out.push(...(d.applies === undefined ? ['Say who it applies to'] : condShape(d.applies).map((p) => `Who it applies to: ${p}`)));
      out.push(...dueShape(d.due));
      if (d.moved !== undefined) need(Array.isArray(d.moved) && d.moved.every((m: any) => m && isDate(m.from) && isDate(m.to) && optStr(m.note)), 'A moved deadline needs both the usual date and the new date');
      break;
  }
  return Array.from(new Set(out));
}
