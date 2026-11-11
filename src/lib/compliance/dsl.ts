// Short forms for WRITING a country file. Nothing here runs at answer time.
import type { Compliance, Cond, DueRule, Frequency, Kind, Option, Question, QType, Source } from './types.ts';

export const yes = (q: string): Cond => ({ q, yes: true });
export const no = (q: string): Cond => ({ q, no: true });
export const is = (q: string, ...v: string[]): Cond => ({ q, is: v });
export const has = (q: string, ...v: string[]): Cond => ({ q, has: v });
export const kind = (...k: Kind[]): Cond => ({ kind: k });
export const ent = (...e: string[]): Cond => ({ entity: e });
export const etag = (t: string): Cond => ({ etag: t });
export const st = (...s: string[]): Cond => ({ state: s });
export const stag = (t: string): Cond => ({ stag: t });
export const all = (...c: Cond[]): Cond => ({ all: c });
export const any = (...c: Cond[]): Cond => ({ any: c });
export const not = (c: Cond): Cond => ({ not: c });
export const always: Cond = { all: [] };

export const opts = (...defs: string[]): Option[] => defs.map((d) => { const i = d.indexOf('|'); return i < 0 ? { v: d, label: d } : { v: d.slice(0, i), label: d.slice(i + 1) }; });

const mkq = (type: QType) => (id: string, step: string, text: string, extra: Partial<Question> = {}): Question => ({ id, step, text, type, ...extra });
export const yn = mkq('yn'), choice = mkq('choice'), multi = mkq('multi'), date = mkq('date'), monthday = mkq('monthday');

// ── due rules ──
/** The same date(s) every year, e.g. fixed([4, 30]). forYear -1 means the filing reports the previous year. */
export const fixed = (dates: [number, number][], forYear?: number): DueRule => ({ t: 'fixed', dates, forYear });
/** N months after the financial year ends (pass day to pin the day of that month, e.g. 15th day of the 4th month). */
export const afterFY = (months: number, day?: number): DueRule => ({ t: 'afterYearEnd', basis: 'fy', months, day });
export const afterFYDays = (days: number): DueRule => ({ t: 'afterYearEnd', basis: 'fy', days });
/** N months after the financial year ends, but never later than [month, day] of the calendar year after it ended. */
export const afterFYCapped = (months: number, cap: [number, number]): DueRule => ({ t: 'afterYearEnd', basis: 'fy', months, capNextCal: cap });
export const afterCalDays = (days: number): DueRule => ({ t: 'afterYearEnd', basis: 'cal', days });
export const afterCalYear = (months: number, day?: number): DueRule => ({ t: 'afterYearEnd', basis: 'cal', months, day });
/** After each month / quarter / half-year. basis 'fy' counts periods from the person's financial year, 'cal' from January. */
export const afterPeriod = (freq: 'monthly' | 'quarterly' | 'semiannual', basis: 'fy' | 'cal', r: { months?: number; days?: number; day?: number; ask?: string }): DueRule => ({ t: 'afterPeriodEnd', freq, basis, ...r });
/** The Nth day of the given months OF the tax year, e.g. inYear([4, 6, 9, 12], 15) for corporate estimated tax. */
export const inYear = (months: number[], day: number, basis: 'fy' | 'cal' = 'fy'): DueRule => ({ t: 'inYear', basis, months, day });
export const anniversary = (of: string, r: { days?: number; monthStart?: boolean; monthEnd?: boolean } = {}): DueRule => ({ t: 'anniversary', of, ...r });
export const event = (text: string): DueRule => ({ t: 'event', text });

export interface CDef {
  name: string; form?: string; dept: string; head: string; authority: string; brief: string; why: string; applies: Cond;
  frequency: Frequency; due: DueRule; dueText: string; penalty?: string; weight?: number; source: string; verified?: boolean; note?: string;
}
/** A filing. `verified` defaults to false: set it true only after reading the due date and trigger on the official page. */
export const C = (id: string, d: CDef): Compliance => ({ id, weight: 50, verified: false, ...d });
export const src = (id: string, publisher: string, title: string, url: string, checked: string): Source => ({ id, publisher, title, url, checked });
