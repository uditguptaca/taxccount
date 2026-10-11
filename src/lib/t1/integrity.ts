// Structural checks on the questionnaire itself. Run by the verification suite and by the preparer
// screen's "form health" panel: a catalogue that fails these must not be published.
import type { Cond, Question } from './types.ts';
import type { Catalogue } from './evaluate.ts';
import { SOURCE_BY_ID } from './sources.ts';

export interface Problem { where: string; problem: string }

function condRefs(c: Cond | undefined, out: { q: string[]; group: string[] }) {
  if (!c) return;
  if ('q' in c) out.q.push(c.q);
  else if ('all' in c) c.all.forEach((x) => condRefs(x, out));
  else if ('any' in c) c.any.forEach((x) => condRefs(x, out));
  else if ('not' in c) condRefs(c.not, out);
  else if ('rec' in c) { out.group.push(c.rec.group); condRefs(c.rec.where, out); }
  else if ('count' in c) out.group.push(c.count.group);
  else if ('age' in c) out.q.push(c.age.q);
  else if ('span' in c) { out.q.push(c.span.from, c.span.to); }
}

const FILLER = /please provide details for|item \d+\b|lorem ipsum|tbd|todo/i;

export function checkCatalogue(cat: Catalogue): Problem[] {
  const bad: Problem[] = [];
  const seen = new Set<string>();
  const codes = new Set<string>();
  for (const m of cat.modules) {
    if (codes.has(m.code)) bad.push({ where: m.code, problem: 'duplicate module code' });
    codes.add(m.code);
    if (!m.title[0] || !m.title[1]) bad.push({ where: m.code, problem: 'module title missing a language' });
    const refs = { q: [] as string[], group: [] as string[] };
    condRefs(m.show, refs);
    for (const s of m.sections) {
      if (!s.title[0] || !s.title[1]) bad.push({ where: s.id, problem: 'section title missing a language' });
      condRefs(s.show, refs);
      if (s.repeat && !s.qs.some((q) => q.label)) bad.push({ where: s.id, problem: 'repeating section has no question marked as its label' });
      for (const q of s.qs) {
        const w = q.id;
        if (seen.has(q.id)) bad.push({ where: w, problem: 'duplicate question id' });
        seen.add(q.id);
        if (!q.text[0] || !q.text[1]) bad.push({ where: w, problem: 'question text missing a language' });
        if (FILLER.test(q.text[0]) || FILLER.test(q.text[1]) || FILLER.test(q.help?.[0] ?? '')) bad.push({ where: w, problem: 'filler wording' });
        if (q.help && (!q.help[0] || !q.help[1])) bad.push({ where: w, problem: 'help missing a language' });
        if (q.why && (!q.why[0] || !q.why[1])) bad.push({ where: w, problem: 'why-we-ask missing a language' });
        if (['radio', 'select', 'multi'].includes(q.type) && !(q.opts && q.opts.length >= 2 || (q.type === 'multi' && q.opts && q.opts.length >= 1))) bad.push({ where: w, problem: 'choice question without options' });
        if (q.type === 'yn' && q.opts) bad.push({ where: w, problem: 'yes/no/unsure question must not define options' });
        if (q.type === 'rows' && !(q.cols && q.cols.length)) bad.push({ where: w, problem: 'table question without columns' });
        if (q.opts) for (const o of q.opts) { if (!o.en || !o.fr) bad.push({ where: w, problem: `option ${o.v} missing a language` }); }
        if (q.opts && new Set(q.opts.map((o) => o.v)).size !== q.opts.length) bad.push({ where: w, problem: 'duplicate option values' });
        if (q.type === 'sin' && q.sens !== 'restricted') bad.push({ where: w, problem: 'SIN field must be restricted' });
        if (q.type === 'file' && !q.docs && !q.text[0]) bad.push({ where: w, problem: 'file question without a label' });
        for (const s2 of q.src ?? []) if (!SOURCE_BY_ID.has(s2)) bad.push({ where: w, problem: `unknown source ${s2}` });
        condRefs(q.show, refs); if (typeof q.req === 'object') condRefs(q.req, refs);
        q.docs?.forEach((d) => condRefs(d.when, refs)); q.review?.forEach((r) => condRefs(r.when, refs));
        q.rules?.forEach((r) => { if ('q' in r) refs.q.push(r.q); });
        if (q.map && !q.map.form) bad.push({ where: w, problem: 'form mapping without a form' });
        if (q.prov && q.prov.length === 0) bad.push({ where: w, problem: 'empty province list' });
      }
    }
    for (const qid of refs.q) if (!cat.q.has(qid)) bad.push({ where: m.code, problem: `condition refers to unknown question ${qid}` });
    for (const g of refs.group) if (!cat.sec.has(g)) bad.push({ where: m.code, problem: `condition refers to unknown section ${g}` });
    for (const row of m.cover) {
      for (const pat of row.qs ?? []) {
        const re = new RegExp('^' + pat.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*') + '$');
        if (!Array.from(cat.q.keys()).some((id) => re.test(id))) bad.push({ where: `${m.code} coverage`, problem: `"${row.item.slice(0, 50)}" points at ${pat} which matches no question` });
      }
      if (row.kind === 'na' && !row.reason) bad.push({ where: `${m.code} coverage`, problem: `"${row.item.slice(0, 50)}" is marked not applicable without a reason` });
      if (!row.item) bad.push({ where: `${m.code} coverage`, problem: 'empty coverage item' });
    }
  }
  return bad;
}

export function stats(cat: Catalogue) {
  let questions = 0, repeating = 0, conditional = 0, docs = 0, withWhy = 0, withMap = 0, sections = 0;
  for (const m of cat.modules) for (const s of m.sections) {
    sections++; if (s.repeat) repeating++;
    for (const q of s.qs) {
      if (q.type === 'info') continue;
      questions++; if (q.show || s.show || m.show) conditional++; if (q.docs?.length || q.type === 'file') docs++; if (q.why) withWhy++; if (q.map) withMap++;
    }
  }
  return { modules: cat.modules.length, sections, questions, repeatingSections: repeating, conditional, documentRequests: docs, withWhy, withFormMapping: withMap };
}
export type { Question };
