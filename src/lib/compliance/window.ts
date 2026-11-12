// A duty with no calendar date still states a period: "within 15 days after the change", "at least once a year".
// This reads that period out of the rule's own words, so that once the person says when the thing happened (or
// when they last did it) the exact deadline can be worked out. Nothing is guessed: a rule whose words do not
// open with a plain period gives no window, and the row keeps showing the rule in words.
import type { DueRule } from './types.ts';

export type WindowUnit = 'days' | 'businessDays' | 'months' | 'years';
/**
 * `after`: due this long after something happens.
 * `every`: to be done again this long after the last time ("at least once a year").
 * `until`: a renewal that falls due on a date printed on the document or fixed by a birthday or an anniversary
 *          ("every 5 years, before the expiry date on the card"). The person gives THAT date and it is the deadline;
 *          the next one is the period after it. Counting from the day it was last renewed would show a later date
 *          than the real one whenever the last renewal was late.
 */
export interface Window { n: number; unit: WindowUnit; kind: 'after' | 'every' | 'until' }

const WORDS: Record<string, number> = {
  one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12, fourteen: 14, fifteen: 15,
  twenty: 20, thirty: 30, 'forty-five': 45, sixty: 60, ninety: 90, 'one hundred and twenty': 120, 'one hundred and eighty': 180,
};
const NUM = `(\\d+|${Object.keys(WORDS).sort((a, b) => b.length - a.length).join('|')})`;
const num = (s: string) => (/^\d+$/.test(s) ? Number(s) : WORDS[s.toLowerCase()]);
const UNIT = '(calendar\\s+|business\\s+|working\\s+)?(hour|day|week|month|year)s?';
const AFTER = [
  new RegExp(`^(?:within|no later than|not later than)\\s+(?:a period of\\s+)?(?:the\\s+)?${NUM}\\s+${UNIT}\\b`, 'i'),
  new RegExp(`^${NUM}\\s+${UNIT}\\s+(?:after|from|of)\\b`, 'i'),
];
const EVERY = [
  new RegExp(`^(?:at least\\s+)?(?:once\\s+)?every\\s+${NUM}\\s+${UNIT}\\b`, 'i'),
  new RegExp(`^(?:at least\\s+)?once\\s+in\\s+every\\s+${NUM}\\s+${UNIT}\\b`, 'i'),
];
const YEARLY = /^(?:(?:review|update|renew)\s+)?(?:at least\s+)?(?:once a year|once every year|every year|each year)\b/i;

function build(n: number, kind: string | undefined, unit: string, k: Window['kind']): Window | null {
  if (!n || n < 1) return null;
  const working = /business|working/i.test(kind ?? '');
  switch (unit.toLowerCase()) {
    case 'hour': return working || n % 24 !== 0 ? null : { n: n / 24, unit: 'days', kind: k };   // "within 8 hours" is not a date: the row keeps the words
    case 'day': return { n, unit: working ? 'businessDays' : 'days', kind: k };
    case 'week': return working ? null : { n: n * 7, unit: 'days', kind: k };
    case 'month': return working ? null : { n, unit: 'months', kind: k };
    case 'year': return working ? null : { n, unit: 'years', kind: k };
    default: return null;
  }
}

const MONTH = '(?:january|february|march|april|may|june|july|august|september|october|november|december)';
/** The sentence names a calendar date or a year: the deadline is that date, not a period from some other day. */
const NAMES_A_DATE = new RegExp(`\\b\\d{1,2}(?:st|nd|rd|th)?\\s+${MONTH}\\b|\\b${MONTH}\\s+\\d{1,2}\\b|\\b(?:19|20)\\d\\d\\b`, 'i');
/** The renewal is tied to a date on a document, a birthday or an anniversary. */
const ANCHORED = /\b(expir\w*|birthday|anniversar\w*|counted from|from the date|due date|before the end of)\b/i;
/** What may follow "every N years" for it to mean "this long after the last time". */
const PLAIN_TAIL = /^(\s*$|\s*[.;]|\s+(after|from) the (registration or )?last\b|,\s*and within\b|\s+for each\b)/i;
/** "30 days from the END OF THE MONTH of deduction", "seven days after THE 30 DAYS from ...": the count starts somewhere else than the day the person would give. */
const STARTS_ELSEWHERE = /\b(end of the (calendar\s+)?(month|quarter|week|period|\d+-month period)|after the \d+ (days|months))\b/i;
const ANY_PERIOD = new RegExp(`${NUM}\\s+${UNIT}\\b`, 'gi');
const approxDays = (n: number, unit: string) => n * ({ hour: 1 / 24, day: 1, week: 7, month: 30, year: 365 } as Record<string, number>)[unit.toLowerCase()];

/** `every` or `until` or nothing, from what follows the opening "every N years" / "every year". */
function repeatKind(rest: string): 'every' | 'until' | null {
  if (NAMES_A_DATE.test(rest)) return null;                     // "... next file by 30 June 2028": that is the date
  if (ANCHORED.test(rest)) return 'until';
  return PLAIN_TAIL.test(rest) ? 'every' : null;                // "every year (no date is stated)", "each year: 2 per cent more ..." state no period
}

/** The period a "when it happens" rule states, or null when its words do not open with one. */
export function windowOf(rule: DueRule): Window | null {
  if (rule.t !== 'event') return null;
  if (rule.within === null) return null;                          // the rule says so itself: its words are not a period to count
  if (rule.within) return rule.within;
  const text = rule.text.trim();
  for (const re of AFTER) {
    const m = re.exec(text);
    if (!m) continue;
    const rest = text.slice(m[0].length);
    // "not later than 30 days BEFORE the licence expires" counts backwards: not a period after something
    if (/^\s+before\b/i.test(rest) || STARTS_ELSEWHERE.test(rest)) return null;
    // a sentence with two periods ("within 20 days by mail; within 14 days online"): only the shortest is safe to count
    const first = approxDays(num(m[1]), m[3]);
    for (const o of Array.from(rest.matchAll(ANY_PERIOD))) if (approxDays(num(o[1]), o[3]) < first) return null;
    return build(num(m[1]), m[2], m[3], 'after');
  }
  for (const re of EVERY) {
    const m = re.exec(text);
    if (m) { const k = repeatKind(text.slice(m[0].length)); return k ? build(num(m[1]), m[2], m[3], k) : null; }
  }
  const y = YEARLY.exec(text);
  if (y) { const k = repeatKind(text.slice(y[0].length)); return k ? { n: 1, unit: 'years', kind: k } : null; }
  return null;
}

const utc = (iso: string) => new Date(iso + 'T00:00:00Z');
const out = (d: Date) => d.toISOString().slice(0, 10);

/** The deadline counted from a day: `from` is the day the thing happened, or the day it was last done. */
export function deadlineFrom(from: string, w: Window): string {
  const d = utc(from);
  if (w.unit === 'days') d.setUTCDate(d.getUTCDate() + w.n);
  else if (w.unit === 'businessDays') { let left = w.n; while (left > 0) { d.setUTCDate(d.getUTCDate() + 1); const wd = d.getUTCDay(); if (wd !== 0 && wd !== 6) left--; } }
  else {
    // the same day of the month N months on; a month that is too short ends on its last day (31 January + 1 month = 28 or 29 February)
    const day = d.getUTCDate(), months = w.unit === 'years' ? w.n * 12 : w.n;
    d.setUTCDate(1); d.setUTCMonth(d.getUTCMonth() + months);
    d.setUTCDate(Math.min(day, new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate()));
  }
  return out(d);
}

/** "15 days", "3 working days", "1 year": the window in words, for the screen. */
export function windowText(w: Window): string {
  const u = w.unit === 'businessDays' ? 'working day' : w.unit.slice(0, -1);
  return `${w.n} ${u}${w.n === 1 ? '' : 's'}`;
}
