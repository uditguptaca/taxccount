// ═══════════════════════════════════════════════════════════════════════════
// GLOBAL COMPLIANCE CHECKER: shared types
// ═══════════════════════════════════════════════════════════════════════════
// A person picks Country, State, Entity type and Department, answers the questions that apply to them, and
// gets the filings that apply with their due dates. Everything about WHAT to ask and WHICH filing applies
// lives in one file per country (src/lib/compliance/countries). Adding a country is adding one file and
// listing it in index.ts. This folder is plain TypeScript with no framework imports (".ts" import endings)
// so the homepage, the API, the user's account and the tests all run the same rules.

/** What sort of taxpayer this is. Questions and filings are written against these, not against local names. */
export type Kind = 'individual' | 'sole_prop' | 'partnership' | 'corporation' | 'llc' | 'trust' | 'nonprofit' | 'branch';

export interface State { code: string; name: string; tags?: string[] }
export interface EntityType { id: string; name: string; desc: string; kind: Kind; onlyStates?: string[]; notStates?: string[]; tags?: string[] }
export interface Department { id: string; name: string; desc: string }
export interface Option { v: string; label: string }

/** A condition on the person's selections and answers. */
export type Cond =
  | { q: string; yes: true }                    // answered Yes
  | { q: string; no: true }                     // answered No
  | { q: string; is: string | string[] }        // a choice equals one of these
  | { q: string; has: string | string[] }       // a multi-select includes one of these
  | { q: string; answered: true }
  | { kind: Kind[] }
  | { entity: string[] }
  | { etag: string }                            // the entity type carries this tag
  | { state: string[] }
  | { stag: string }                            // the state carries this tag
  | { dept: string[] }
  | { all: Cond[] } | { any: Cond[] } | { not: Cond };

export type QType = 'yn' | 'choice' | 'multi' | 'date' | 'monthday';
export interface Question {
  id: string;
  step: string;                                 // which step of the questionnaire it sits in
  text: string;
  help?: string;                                // plain-language explanation behind the "?"
  type: QType;
  options?: Option[];
  show?: Cond;                                  // asked only when this holds
  optional?: boolean;                           // dates the person may not know yet
}
export interface Step { id: string; title: string; desc?: string }

/** How a due date is worked out. `basis` says whether periods follow the person's financial year or the calendar year. */
export type DueRule =
  | { t: 'fixed'; dates: [month: number, day: number][]; forYear?: number }                       // the same date(s) every year; forYear -1 = it reports the year before
  | { t: 'afterYearEnd'; basis: 'fy' | 'cal'; months?: number; days?: number; day?: number }      // N months (or days) after the year ends; `day` pins the day of that month
  | { t: 'afterPeriodEnd'; freq: 'monthly' | 'quarterly' | 'semiannual'; basis: 'fy' | 'cal'; months?: number; days?: number; day?: number; ask?: string }
  | { t: 'anniversary'; of: string; days?: number; monthStart?: boolean; monthEnd?: boolean }     // tied to a date the person gives (incorporation, registration)
  | { t: 'event'; text: string };                                                                  // no fixed date: due after something happens

export type Frequency = 'annual' | 'semiannual' | 'quarterly' | 'monthly' | 'event' | 'once';

export interface Compliance {
  id: string;
  name: string;
  form?: string;
  dept: string;
  head: string;                                 // Income tax, Sales tax, Payroll, Information returns, Registration, Foreign reporting...
  authority: string;
  brief: string;                                // what it is, in plain words
  why: string;                                  // why it applies, shown to the person
  applies: Cond;
  frequency: Frequency;
  due: DueRule;
  dueText: string;                              // the rule in words, exactly as the official source states it
  penalty?: string;
  weight: number;                               // how central this filing is (used to pick the three shown first)
  source: string;                               // id in the country's source list
  verified: boolean;                            // true only when the due date and trigger were read on the official page
  note?: string;
}

export interface Source { id: string; title: string; url: string; publisher: string; checked: string }

export interface CountryPack {
  code: string;                                 // ISO code
  name: string;
  version: string;
  currency: string;
  stateLabel: string;                           // "Province or territory", "State", "Emirate"...
  /** When the country fixes the financial year for everyone (India: 31 March), its end as [month, day]. */
  fixedYearEnd?: [number, number];
  /** Kinds whose tax year is always the calendar year (individuals in most countries). */
  calendarYearKinds: Kind[];
  /** Deadlines that land on a Saturday or Sunday move to the next working day. Public holidays are not modelled. */
  rollWeekend: boolean;
  weekendNote: string;
  states: State[];
  entityTypes: EntityType[];
  departments: Department[];
  steps: Step[];
  questions: Question[];
  compliances: Compliance[];
  sources: Source[];
  disclaimer?: string;
}

export interface Selection { country: string; state: string; entity: string; depts: string[] }
/** Answers by question id: 'yes' | 'no' | 'unsure', a choice value, a list of values, or a date string. */
export type Answers = Record<string, string | string[] | undefined>;

export interface DueDate { date: string; period: string }
export type Certainty = 'applies' | 'check';
export interface Result {
  id: string; name: string; form?: string; head: string; dept: string; authority: string; brief: string; why: string;
  frequency: Frequency; dueText: string; penalty?: string; note?: string;
  certainty: Certainty;                         // 'check' = it applies only if a "not sure" answer turns out to be yes
  next: DueDate[];                              // upcoming due dates, soonest first
  needs?: string;                               // the date we still need to work out a due date
  sourceUrl: string; sourceTitle: string; verified: boolean; weight: number;
}
