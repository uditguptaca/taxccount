// Turns a research file (see docs in AGENTS.md, "Adding researched compliances") into the extra rules of one country.
//
//   node --experimental-strip-types scripts/compliance-import.ts <research.json>            report only
//   node --experimental-strip-types scripts/compliance-import.ts <research.json> --write    also write countries/<cc>-more.ts
//
// Every item is checked the way Service Master checks a save (its own fields, then the whole country with it in
// place). An item that fails is left out and listed with the reason; nothing is repaired by guessing.
import fs from 'node:fs';
import path from 'node:path';
import { packOf } from '../src/lib/compliance/index.ts';
import { shapeProblems } from '../src/lib/compliance/shape.ts';
import { checkPack } from '../src/lib/compliance/integrity.ts';
import { condRefs } from '../src/lib/compliance/describe.ts';
import { withMore } from '../src/lib/compliance/more.ts';
import type { Compliance, CountryPack, Department, Question, Source, Step } from '../src/lib/compliance/types.ts';

const file = process.argv[2];
if (!file) { console.error('usage: compliance-import.ts <research.json> [--write]'); process.exit(2); }
const write = process.argv.includes('--write');
const R = JSON.parse(fs.readFileSync(file, 'utf8'));
const cc = String(R.country || '').toUpperCase();
const full = packOf(cc);
if (!full) { console.error(`unknown country ${cc}`); process.exit(2); }
const isNew = (id: string) => id.startsWith(`${cc.toLowerCase()}_x_`);
// the country as it is without anything imported earlier
const baseComps = full.compliances.filter((c) => !isNew(c.id));
const base: CountryPack = { ...full, compliances: baseComps, questions: full.questions.filter((q) => !isNew(q.id)), sources: full.sources.filter((s) => !isNew(s.id)),
  departments: full.departments.filter((d) => baseComps.some((c) => c.dept === d.id)), steps: full.steps.filter((s) => s.id !== 'ops') };

const rejected: string[] = [], notes: string[] = [];
const str = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : undefined);
const OPS: Step = { id: 'ops', title: 'Running the business', desc: 'Staff, records, licences and the registers a business must keep up to date.' };
const dateStep = base.steps.find((s) => s.id === 'dates')?.id;

// ── departments ──
const departments: Department[] = [];
for (const d of R.departments ?? []) {
  if (base.departments.some((x) => x.id === d.id)) continue;                       // an existing department is reused as it is
  const dep = { id: String(d.id), name: String(d.name || ''), desc: String(d.desc || '') };
  const bad = /^[a-z][a-z0-9_]*$/.test(dep.id) ? shapeProblems('department', dep) : ['bad id'];
  if (bad.length) rejected.push(`department ${dep.id}: ${bad.join('; ')}`); else departments.push(dep);
}
// ── sources ──
const sources: Source[] = [];
for (const s of R.sources ?? []) {
  const src = { id: String(s.id), title: String(s.title || ''), url: String(s.url || ''), publisher: String(s.publisher || ''), checked: String(s.checked || R.checkedOn || '') };
  const bad = !isNew(src.id) ? ['its id must start with ' + cc.toLowerCase() + '_x_'] : shapeProblems('source', { ...src, id: undefined });
  if (bad.length) rejected.push(`source ${src.id}: ${bad.join('; ')}`); else if (!sources.some((x) => x.id === src.id)) sources.push(src);
}
// ── questions ──
const questions: Question[] = [];
for (const q of R.questions ?? []) {
  if (base.questions.some((x) => x.id === q.id)) continue;
  const kinds = Array.isArray(q.askKinds) && q.askKinds.length ? q.askKinds : undefined;
  const step = q.type === 'date' && dateStep ? dateStep : base.steps.some((s) => s.id === q.step) && q.step !== 'dates' ? q.step : 'ops';
  const out: any = { id: String(q.id), step, text: String(q.text || ''), type: q.type };
  if (str(q.help)) out.help = str(q.help);
  if (Array.isArray(q.options) && q.options.length) out.options = q.options.map((o: any) => ({ v: String(o.v), label: String(o.label) }));
  if (q.show) out.show = q.show; else if (kinds) out.show = { kind: kinds };
  if (q.type === 'date') out.optional = true;
  const bad = !isNew(out.id) ? ['its id must start with ' + cc.toLowerCase() + '_x_'] : shapeProblems('question', { ...out, id: undefined });
  if (bad.length) rejected.push(`question ${out.id}: ${bad.join('; ')}`); else questions.push(out);
}
// ── compliances ──
const compliances: Compliance[] = [];
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
for (const c of R.compliances ?? []) {
  const id = String(c.id);
  let applies = c.applies;
  if (Array.isArray(c.states) && c.states.length && !condRefs(applies).states.size) applies = { all: [applies, { state: c.states }] };
  const out: any = { id, name: str(c.name), dept: c.dept, head: str(c.head), authority: str(c.authority), brief: str(c.brief), why: str(c.why), applies, frequency: c.frequency, due: c.due, dueText: str(c.dueText),
    weight: typeof c.weight === 'number' ? Math.max(1, Math.min(100, Math.round(c.weight))) : 50, source: c.source, verified: c.verified === true };
  if (str(c.form)) out.form = str(c.form);
  if (str(c.penalty)) out.penalty = str(c.penalty);
  if (str(c.note)) out.note = str(c.note);
  out.roll = false;                                   // the weekend rule of these authorities was not researched: show the date as stated
  const bad: string[] = [];
  if (!isNew(id)) bad.push('its id must start with ' + cc.toLowerCase() + '_x_');
  bad.push(...shapeProblems('compliance', { ...out, id: undefined }));
  if (out.verified && !str(c.evidence)) { out.verified = false; notes.push(`${id}: marked "to confirm" because no quotation from the official page was given`); }
  if (base.compliances.some((b) => norm(b.name) === norm(out.name ?? '') || (out.form && b.form && norm(b.form) === norm(out.form)))) bad.push('the country already has a compliance with this name or form');
  if (bad.length) rejected.push(`compliance ${id}: ${Array.from(new Set(bad)).join('; ')}`); else compliances.push(out);
}

// ── the whole country with the new items in place: drop what does not fit, and say why ──
const build = (): CountryPack => withMore(base, { version: String(R.checkedOn), step: questions.some((q) => q.step === 'ops') ? OPS : null, departments, questions, compliances, sources });
for (let round = 0; round < 50; round++) {
  const problems = checkPack(build());
  if (!problems.length) break;
  const p = problems[0];
  const comp = compliances.findIndex((c) => p.where.includes(`“${c.name.length > 60 ? c.name.slice(0, 59) + '…' : c.name}”`) && p.where.startsWith('Compliance'));
  const qi = questions.findIndex((q) => p.where.includes(`“${q.text.length > 60 ? q.text.slice(0, 59) + '…' : q.text}”`) && p.where.startsWith('Question'));
  if (comp >= 0) { rejected.push(`compliance ${compliances[comp].id}: ${p.where} ${p.problem}`); compliances.splice(comp, 1); }
  else if (qi >= 0) { rejected.push(`question ${questions[qi].id}: ${p.where} ${p.problem}`); questions.splice(qi, 1); }
  else { console.error('cannot place this problem:', p); process.exit(1); }
}
// leave out what nothing uses
const usedQ = new Set<string>(); for (const c of compliances) { condRefs(c.applies).questions.forEach((q) => usedQ.add(q)); if (c.due.t === 'anniversary') usedQ.add(c.due.of); }
for (let i = 0; i < 4; i++) for (const q of questions) if (usedQ.has(q.id)) condRefs(q.show).questions.forEach((x) => usedQ.add(x));
const keptQ = questions.filter((q) => usedQ.has(q.id)); for (const q of questions) if (!usedQ.has(q.id)) notes.push(`question ${q.id} left out: no compliance depends on it`);
questions.length = 0; questions.push(...keptQ);
const keptS = sources.filter((s) => compliances.some((c) => c.source === s.id)); sources.length = 0; sources.push(...keptS);
const keptD = departments.filter((d) => compliances.some((c) => c.dept === d.id)); departments.length = 0; departments.push(...keptD);
const final = checkPack(build());

const hosts = new Map<string, number>(); for (const s of sources) { const h = new URL(s.url).hostname.replace(/^www\./, ''); hosts.set(h, (hosts.get(h) ?? 0) + 1); }
console.log(`${full.name}: ${compliances.length} compliances (${compliances.filter((c) => c.verified).length} checked on the official page), ${questions.length} questions, ${sources.length} sources, ${departments.length} new departments`);
console.log('departments:', departments.map((d) => d.name).join(' | ') || 'none new');
console.log('source sites:', Array.from(hosts).sort((a, b) => b[1] - a[1]).map(([h, n]) => `${h}:${n}`).join(' '));
if (notes.length) console.log('\nnotes:\n  ' + notes.join('\n  '));
if (rejected.length) console.log(`\nleft out (${rejected.length}):\n  ` + rejected.join('\n  '));
if (final.length) { console.error('\nthe country is not sound with these items:', final.slice(0, 5)); process.exit(1); }

if (write) {
  const out = path.join(import.meta.dirname, '..', 'src', 'lib', 'compliance', 'countries', `${cc.toLowerCase()}-more.ts`);
  const usesOps = questions.some((q) => q.step === 'ops');
  const body = `// The non-tax duties of ${full.name}: company registry, employment, workplace safety, privacy and so on.\n// WRITTEN BY scripts/compliance-import.ts from research read on the official pages on ${R.checkedOn}. Do not edit by hand:\n// change it in Service Master (which then owns the row), or re-run the importer with a corrected research file.\nimport type { More } from '../more.ts';\n\nexport const more: More = ${JSON.stringify({ version: String(R.checkedOn), step: usesOps ? OPS : null, departments, questions, compliances, sources }, null, 1)};\n`;
  fs.writeFileSync(out, body);
  console.log(`\nwrote ${path.relative(process.cwd(), out)}`);
}
