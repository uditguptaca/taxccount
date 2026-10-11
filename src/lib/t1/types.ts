// ═══════════════════════════════════════════════════════════════════════════
// T1 INTAKE: shared types
// ═══════════════════════════════════════════════════════════════════════════
// Everything in src/lib/t1 is plain TypeScript with no framework imports, so the
// client screens, the preparer workspace, the API and the tests all run the SAME
// rules. Imports in this folder use explicit ".ts" endings and `import type` so the
// verification tests can load the files directly with Node.

export type Lang = 'en' | 'fr';
/** English and French text, always together. */
export type L = readonly [en: string, fr: string];

export type Province = 'AB' | 'BC' | 'MB' | 'NB' | 'NL' | 'NT' | 'NS' | 'NU' | 'ON' | 'PE' | 'QC' | 'SK' | 'YT';
export const PROVINCES: Province[] = ['AB', 'BC', 'MB', 'NB', 'NL', 'NT', 'NS', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT'];

export type InputType =
  | 'text' | 'long_text' | 'currency' | 'number' | 'percentage' | 'date'
  | 'yn'            // Yes / No / I'm not sure
  | 'radio' | 'select' | 'multi'
  | 'file' | 'sin' | 'phone' | 'email' | 'postal'
  | 'rows'          // a small table (for example "other information" box codes and amounts)
  | 'info';         // read-only text, never has an answer

export interface Option { v: string; en: string; fr: string }
export interface Col { id: string; t: L; type: 'text' | 'currency' | 'number' | 'date' | 'select'; opts?: Option[] }

export type Scalar = string | number | boolean;
export type Op =
  | 'eq' | 'ne' | 'in' | 'nin' | 'has'       // has: a multi-select contains the value
  | 'gt' | 'gte' | 'lt' | 'lte'
  | 'answered' | 'blank'
  | 'yes' | 'no' | 'maybe'                     // maybe = yes OR "I'm not sure": the safe way to open a branch
  | 'unsure' | 'later' | 'ask';                // the client's own flag on the answer

export type Cond =
  | { q: string; op: Op; v?: Scalar | Scalar[] }
  | { all: Cond[] }
  | { any: Cond[] }
  | { not: Cond }
  | { prov: Province[] }                       // province or territory of residence on 31 December
  | { years: [number | null, number | null] }  // tax year range, inclusive
  | { span: { from: string; to: string; op: 'lt' | 'lte' | 'gt' | 'gte'; days: number } }  // days between two date answers
  | { age: { q: string; op: 'gt' | 'gte' | 'lt' | 'lte'; v: number } }  // age at 31 December of the tax year, from a date-of-birth answer
  | { rec: { group: string; where: Cond } }    // at least one record of a repeating section satisfies this
  | { count: { group: string; op: 'gt' | 'gte' | 'eq' | 'lt'; v: number } };

export type Severity = 'info' | 'warning' | 'blocking' | 'specialist';

export interface DocRequest {
  key: string;                 // stable id of the document type, e.g. "T4"
  label: L;
  who?: 'taxpayer' | 'spouse' | 'dependant';
  optional?: boolean;
  when?: Cond;                 // extra condition on top of the question being visible
  perRecord?: boolean;         // one per record of a repeating section (default true inside repeating sections)
}

export interface ReviewRule { when: Cond; sev: Severity; title: L; detail?: L; specialist?: string }

export type Rule =
  | { t: 'min' | 'max'; v: number; msg?: L }
  | { t: 'len'; v: number; msg?: L }
  | { t: 'pattern'; v: string; msg: L }
  | { t: 'dateInYear'; msg?: L; allowNext?: boolean }                 // date falls inside the tax year
  | { t: 'dateNotBefore' | 'dateNotAfter'; q: string; msg?: L }
  | { t: 'lteQ' | 'gteQ'; q: string; msg?: L };

export interface FormMap { form: string; line?: string; box?: string; verified: boolean }

export interface Question {
  id: string;                  // stable, for example "B.name.first"
  sec: string;
  mod: string;
  text: L;
  type: InputType;
  help?: L;                    // plain-language help and examples
  why?: L;                     // "Why are we asking this?"
  opts?: Option[];
  cols?: Col[];
  req?: boolean | Cond;        // required always, or when the condition holds
  show?: Cond;
  years?: [number | null, number | null];
  prov?: Province[];
  docs?: DocRequest[];
  noUnsure?: boolean;          // hide "I'm not sure" (identity facts)
  noLater?: boolean;
  noAsk?: boolean;
  review?: ReviewRule[];
  map?: FormMap;
  src?: string[];              // source register ids
  sens?: 'normal' | 'protected' | 'restricted';
  rules?: Rule[];
  ph?: string;
  unit?: string;
  label?: boolean;             // this answer names its record ("Employer", "Property address")
  readOnly?: boolean;
}

export interface Repeat { label: L; max?: number; min?: number; add?: L }

export interface Section {
  id: string;
  mod: string;
  title: L;
  desc?: L;
  show?: Cond;
  repeat?: Repeat;
  qs: Question[];
  src?: string[];
}

export type Phase = 'start' | 'about' | 'income' | 'deductions' | 'province' | 'finish';

/** What an item of the official forms is, and how this questionnaire covers it. */
export type CoverKind = 'client' | 'derived' | 'documents' | 'preparer' | 'specialist' | 'na';
export interface CoverRow { item: string; ref?: string; kind: CoverKind; qs?: string[]; note?: string; reason?: string }

export interface Module {
  code: string;                // "B"
  name: string;                // "IDENTIFICATION"
  title: L;
  desc: L;
  phase: Phase;
  icon: string;
  always?: boolean;
  show?: Cond;                 // activation from the short situation questions
  sections: Section[];
  cover: CoverRow[];
  src?: string[];
}

export type RowValue = Record<string, string | number | null>;
export type AnswerValue = Scalar | Scalar[] | RowValue[] | null;
export interface Answer { v?: AnswerValue; flag?: 'unsure' | 'later' | 'ask'; note?: string }
/** Keyed by `${questionId}|${recordIndex}`. */
export type AnswerMap = Record<string, Answer>;
export const ak = (q: string, rec = 0) => `${q}|${rec}`;

export interface Ctx {
  year: number;
  answers: AnswerMap;
  /** Record numbers that exist per repeating section id (from the database); answers add to it. */
  records?: Record<string, number[]>;
  province?: Province | null;
  filingType?: 'original' | 'unfiled_prior_year' | 'adjustment';
}

export interface UploadedDoc {
  id: string; docKey?: string | null; questionId?: string | null; recordIndex?: number;
  fileName: string; taxYear?: string | null; slipStatus?: 'original' | 'amended' | 'cancelled' | 'replaced' | null;
  issuer?: string | null; hash?: string | null;
}

export type FindingKind = 'required' | 'unsure' | 'ask' | 'later' | 'invalid' | 'rule' | 'specialist' | 'duplicate' | 'mismatch' | 'contradiction';
export interface Finding {
  key: string;                 // stable, used to avoid creating the same review item twice
  kind: FindingKind;
  sev: Severity;
  title: L;
  detail?: L;
  questionId?: string;
  rec?: number;
  mod?: string;
  specialist?: string;
}
