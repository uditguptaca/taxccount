// Fills in a questionnaire the way a very cooperative client would, using only the engine's own rules:
// every applicable required question gets a plausible answer, repeating sections get one record, and the
// loop continues until nothing required is missing. Used to prove that every branch can be completed.
import { CATALOGUE as cat } from '../../src/lib/t1/catalogue/index.ts';
import { applicable, isRequired, questionVisible, recordsOf, sectionVisible } from '../../src/lib/t1/evaluate.ts';
import { isBlank } from '../../src/lib/t1/dsl.ts';
import { ak } from '../../src/lib/t1/types.ts';
import type { AnswerMap, AnswerValue, Ctx, Question } from '../../src/lib/t1/types.ts';

export type Strategy = 'min' | 'max';

export function plausible(q: Question, year: number, strategy: Strategy, rec: number): AnswerValue | undefined {
  switch (q.type) {
    case 'yn': return strategy === 'max' ? 'yes' : 'no';
    case 'radio': case 'select': return q.opts?.[0]?.v;
    case 'multi': return q.opts?.[0] ? [q.opts[0].v] : undefined;
    case 'text': return q.id.endsWith('.year') ? String(year) : q.id.endsWith('.recipient') ? 'Test Person' : `Test ${rec + 1}`;
    case 'long_text': return 'Test text';
    case 'currency': case 'number': return '100';
    case 'percentage': return '50';
    case 'date': return `${year}-06-15`;
    case 'sin': return '046 454 286';
    case 'phone': return '416 555 0123';
    case 'email': return 'test@example.com';
    case 'postal': return 'M5V 2T6';
    case 'rows': return q.cols ? [Object.fromEntries(q.cols.map((c) => [c.id, c.type === 'currency' || c.type === 'number' ? '10' : c.type === 'date' ? `${year}-06-15` : c.type === 'select' ? (c.opts?.[0]?.v ?? 'x') : 'x']))] : undefined;
    default: return undefined;
  }
}

/** Returns the finished answers and the record numbers created. Deterministic. */
export function walk(year: number, province: string, strategy: Strategy, seed: AnswerMap = {}): { answers: AnswerMap; records: Record<string, number[]>; rounds: number } {
  const answers: AnswerMap = { ...seed };
  const records: Record<string, number[]> = {};
  const set = (q: Question, rec: number, v: AnswerValue | undefined) => { if (v !== undefined) answers[ak(q.id, rec)] = { v }; };
  answers[ak('B.res.province')] = { v: province };
  let rounds = 0;
  for (; rounds < 60; rounds++) {
    const ctx: Ctx = { year, answers, records, province: province as any };
    let changed = false;
    // a repeating section that is visible needs its first record
    for (const m of cat.modules) for (const s of m.sections) {
      if (!s.repeat || !sectionVisible(cat, ctx, s)) continue;
      if (recordsOf(cat, ctx, s.id).length === 0 && (strategy === 'max' || (s.repeat.min ?? 0) >= 1)) { (records[s.id] ??= []).push(0); changed = true; }
    }
    const ctx2: Ctx = { year, answers, records, province: province as any };
    // answer everything that is required, plus every yes/no and screening question visible (the cooperative path)
    for (const m of cat.modules) for (const s of m.sections) {
      if (!sectionVisible(cat, ctx2, s)) continue;
      const recs = s.repeat ? recordsOf(cat, ctx2, s.id) : [0];
      for (const r of recs) for (const q of s.qs) {
        if (q.type === 'info' || !questionVisible(cat, ctx2, q, r)) continue;
        const has = !isBlank(answers[ak(q.id, r)]?.v) || !!answers[ak(q.id, r)]?.flag;
        if (has) continue;
        if (isRequired(cat, ctx2, q, r) || q.type === 'yn') {
          if (q.type === 'file') { answers[ak(q.id, r)] = { flag: 'later' }; changed = true; continue; }
          const v = plausible(q, year, strategy, r);
          if (v !== undefined) { set(q, r, v); changed = true; }
        }
      }
    }
    if (!changed) break;
  }
  return { answers, records, rounds };
}
