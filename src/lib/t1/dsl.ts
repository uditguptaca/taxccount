// Small helpers for WRITING the questionnaire. Nothing here runs in the browser at answer time:
// it only turns the compact authoring form into the full Module objects the engine reads.
import type { AnswerValue, Cond, Col, CoverRow, DocRequest, InputType, L, Module, Option, Phase, Province, Question, ReviewRule, Repeat, Rule, Scalar, Section, FormMap } from './types.ts';

// ── conditions ──
export const yes = (q: string): Cond => ({ q, op: 'yes' });
export const no = (q: string): Cond => ({ q, op: 'no' });
export const maybe = (q: string): Cond => ({ q, op: 'maybe' });
export const eq = (q: string, v: Scalar): Cond => ({ q, op: 'eq', v });
export const ne = (q: string, v: Scalar): Cond => ({ q, op: 'ne', v });
export const isIn = (q: string, v: Scalar[]): Cond => ({ q, op: 'in', v });
export const has = (q: string, v: Scalar): Cond => ({ q, op: 'has', v });
export const answered = (q: string): Cond => ({ q, op: 'answered' });
export const gt = (q: string, v: number): Cond => ({ q, op: 'gt', v });
export const all = (...c: Cond[]): Cond => ({ all: c });
export const any = (...c: Cond[]): Cond => ({ any: c });
export const not = (c: Cond): Cond => ({ not: c });
export const prov = (...p: Province[]): Cond => ({ prov: p });
export const years = (from: number | null, to: number | null): [number | null, number | null] => [from, to];
export const rec = (group: string, where: Cond): Cond => ({ rec: { group, where } });
export const age = (q: string, op: 'gt' | 'gte' | 'lt' | 'lte', v: number): Cond => ({ age: { q, op, v } });
export const span = (from: string, to: string, op: 'lt' | 'lte' | 'gt' | 'gte', days: number): Cond => ({ span: { from, to, op, days } });
export const some = (group: string): Cond => ({ count: { group, op: 'gte', v: 1 } });

/** 'single|Single|Célibataire' → option. */
export const O = (...defs: string[]): Option[] => defs.map((d) => { const [v, en, fr] = d.split('|'); return { v, en, fr: fr ?? en }; });

export interface QD {
  t: L; type?: InputType; help?: L; why?: L; opts?: Option[]; cols?: Col[];
  req?: boolean | Cond; show?: Cond; years?: [number | null, number | null]; prov?: Province[];
  docs?: DocRequest[]; noUnsure?: boolean; noLater?: boolean; noAsk?: boolean; review?: ReviewRule[];
  map?: FormMap; src?: string[]; sens?: 'normal' | 'protected' | 'restricted'; rules?: Rule[];
  ph?: string; unit?: string; label?: boolean; readOnly?: boolean;
}
export interface QDraft extends QD { local: string }
const mk = (type: InputType) => (local: string, t: L, extra: Partial<QD> = {}): QDraft => ({ local, t, type, ...extra });
export const tx = mk('text'), ta = mk('long_text'), cur = mk('currency'), num = mk('number'), pct = mk('percentage'), dt = mk('date');
export const yn = mk('yn'), rd = mk('radio'), sl = mk('select'), mu = mk('multi'), fl = mk('file');
export const sin = mk('sin'), ph = mk('phone'), em = mk('email'), pc = mk('postal'), rw = mk('rows'), info = mk('info');

export interface SectionDraft { local: string; title: L; desc?: L; show?: Cond; repeat?: Repeat; qs: QDraft[]; src?: string[] }
export const S = (local: string, title: L, qs: QDraft[], extra: { desc?: L; show?: Cond; repeat?: Repeat; src?: string[] } = {}): SectionDraft => ({ local, title, qs, ...extra });

export interface ModDef { code: string; name: string; title: L; desc: L; phase: Phase; icon: string; always?: boolean; show?: Cond; src?: string[]; cover?: CoverRow[] }

/** A reference starting with "." means "in this section"; anything else is a full question id. */
function fix(c: Cond, base: string, groupBase?: string): Cond {
  if ('q' in c) return { ...c, q: c.q.startsWith('.') ? `${groupBase ?? base}${c.q}` : c.q };
  if ('all' in c) return { all: c.all.map((x) => fix(x, base, groupBase)) };
  if ('any' in c) return { any: c.any.map((x) => fix(x, base, groupBase)) };
  if ('not' in c) return { not: fix(c.not, base, groupBase) };
  if ('span' in c) return { span: { ...c.span, from: c.span.from.startsWith('.') ? `${groupBase ?? base}${c.span.from}` : c.span.from, to: c.span.to.startsWith('.') ? `${groupBase ?? base}${c.span.to}` : c.span.to } };
  if ('age' in c) return { age: { ...c.age, q: c.age.q.startsWith('.') ? `${groupBase ?? base}${c.age.q}` : c.age.q } };
  if ('rec' in c) return { rec: { group: c.rec.group, where: fix(c.rec.where, base, c.rec.group) } };
  return c;
}
const fx = (c: Cond | boolean | undefined, base: string): Cond | boolean | undefined => (c === undefined || typeof c === 'boolean' ? c : fix(c, base));

export function M(def: ModDef, drafts: SectionDraft[]): Module {
  const sections: Section[] = drafts.map((d) => {
    const secId = `${def.code}.${d.local}`;
    const qs: Question[] = d.qs.map((q) => {
      const { local, t, ...rest } = q;
      const out: Question = { ...rest, text: t, id: `${secId}.${local}`, sec: secId, mod: def.code, type: q.type ?? 'text' };
      if (out.show) out.show = fix(out.show, secId);
      if (out.req !== undefined) out.req = fx(out.req, secId) as boolean | Cond;
      if (out.docs) out.docs = out.docs.map((x) => ({ ...x, when: x.when ? fix(x.when, secId) : undefined }));
      if (out.review) out.review = out.review.map((r) => ({ ...r, when: fix(r.when, secId) }));
      if (out.rules) out.rules = out.rules.map((r) => ('q' in r ? { ...r, q: r.q.startsWith('.') ? `${secId}${r.q}` : r.q } : r));
      return out;
    });
    return { id: secId, mod: def.code, title: d.title, desc: d.desc, show: d.show ? fix(d.show, secId) : undefined, repeat: d.repeat, qs, src: d.src };
  });
  const { cover, ...rest } = def;
  return { ...rest, sections, cover: cover ?? [], show: def.show };
}

/** Normalise an answer for comparisons and "is it blank". */
export function isBlank(v: AnswerValue | undefined): boolean {
  if (v === undefined || v === null) return true;
  if (typeof v === 'string') return v.trim() === '';
  if (Array.isArray(v)) return v.length === 0;
  return false;
}
