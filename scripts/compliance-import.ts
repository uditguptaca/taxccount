// Turns a research file (see docs in AGENTS.md, "Adding researched compliances") into the extra rules of one country.
//
//   node --experimental-strip-types scripts/compliance-import.ts <file.json> [more files...]            report only
//   node --experimental-strip-types scripts/compliance-import.ts <file.json> [more files...] --write    also write countries/<cc>-more.ts
//
// Give it EVERY research file of one country at once: files of new compliances ("compliances") and files of
// corrections to existing ones ("fixes": a penalty, a confirmation, a corrected deadline, each with the quotation
// and the official page it was read on). The output replaces the country's -more.ts as a whole.
//
// Every item is checked the way Service Master checks a save (its own fields, then the whole country with it in
// place). An item that fails is left out and listed with the reason; nothing is repaired by guessing.
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { canada } from '../src/lib/compliance/countries/ca.ts';
import { usa } from '../src/lib/compliance/countries/us.ts';
import { india } from '../src/lib/compliance/countries/in.ts';
import { uae } from '../src/lib/compliance/countries/ae.ts';
import { shapeProblems } from '../src/lib/compliance/shape.ts';
import { checkPack } from '../src/lib/compliance/integrity.ts';
import { condRefs } from '../src/lib/compliance/describe.ts';
import { withMore } from '../src/lib/compliance/more.ts';
import type { Compliance, CountryPack, Department, Question, Source, Step } from '../src/lib/compliance/types.ts';

const files = process.argv.slice(2).filter((a) => !a.startsWith('--'));
if (!files.length) { console.error('usage: compliance-import.ts <file.json> [more files...] [--write]'); process.exit(2); }
const write = process.argv.includes('--write');
const parts = files.map((f) => ({ file: path.basename(f), data: JSON.parse(fs.readFileSync(f, 'utf8')) }));
const codes = Array.from(new Set(parts.map((x) => String(x.data.country || '').toUpperCase())));
if (codes.length !== 1) { console.error(`the files are for different countries: ${codes.join(', ')}`); process.exit(2); }
// one research record for the country: lists joined, the first definition of an id wins
const firstById = (list: any[]) => { const seen = new Set<string>(); return list.filter((x) => x && !seen.has(x.id) && seen.add(x.id)); };
const R: any = {
  country: codes[0], checkedOn: parts.map((x) => String(x.data.checkedOn || '')).sort().pop(),
  departments: firstById(parts.flatMap((x) => x.data.departments ?? [])), questions: firstById(parts.flatMap((x) => x.data.questions ?? [])),
  sources: firstById(parts.flatMap((x) => x.data.sources ?? [])), compliances: firstById(parts.flatMap((x) => x.data.compliances ?? [])),
  fixes: parts.flatMap((x) => (x.data.fixes ?? []).map((f: any) => ({ ...f, _file: x.file }))),
};
const cc = String(R.country || '').toUpperCase();
// the country's own tax rules, as written in its file: nothing imported earlier, no earlier corrections
const BASE: Record<string, CountryPack> = { CA: canada, US: usa, IN: india, AE: uae };
if (!BASE[cc]) { console.error(`unknown country ${cc}`); process.exit(2); }
const base: CountryPack = BASE[cc];
const full = base;
const isNew = (id: string) => id.startsWith(`${cc.toLowerCase()}_x_`);
const isFixSource = (id: string) => id.startsWith(`${cc.toLowerCase()}_y_`);

const rejected: string[] = [], notes: string[] = [];
const str = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : undefined);
// One group for everything outside tax, for a person as much as for a business (a passport, a driving licence, staff, registers).
const OPS: Step = { id: 'ops', title: 'What else applies to you', desc: 'Tick what is true. Each tick can add a duty outside tax: documents to renew, staff, records, licences, registers.', checklist: true };
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
  const bad = !isNew(src.id) && !isFixSource(src.id) ? ['its id must start with ' + cc.toLowerCase() + '_x_ or ' + cc.toLowerCase() + '_y_'] : shapeProblems('source', { ...src, id: undefined });
  if (bad.length) rejected.push(`source ${src.id}: ${bad.join('; ')}`); else if (!sources.some((x) => x.id === src.id)) sources.push(src);
}
// ── questions ──
const questions: Question[] = [];
for (const q of R.questions ?? []) {
  if (base.questions.some((x) => x.id === q.id)) continue;
  const kinds = Array.isArray(q.askKinds) && q.askKinds.length ? q.askKinds : undefined;
  const step = q.type === 'date' && dateStep ? dateStep : 'ops';                 // the new questions sit together, as a tick list, just before the dates
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

// ── corrections to existing compliances: a penalty, a confirmation, a corrected deadline ──
// Each needs the quotation it rests on and an official page among the sources; without both it is left out.
const patches: Record<string, any> = {};
const fixStats = { penalties: 0, confirmed: 0, corrected: 0, noPenalty: 0, unconfirmed: 0 };
const known = new Map<string, Compliance>([...base.compliances, ...compliances].map((c) => [c.id, c]));
const srcOk = (id: unknown) => typeof id === 'string' && (sources.some((x) => x.id === id) || base.sources.some((x) => x.id === id));
for (const f of R.fixes ?? []) {
  const c = known.get(f.id);
  if (!c) { rejected.push(`correction for ${f.id} (${f._file}): no such compliance`); continue; }
  const p: any = patches[c.id] ?? {};
  if (str(f.penalty) && !c.penalty) {
    if (!str(f.penaltyEvidence) || !srcOk(f.penaltySource)) rejected.push(`penalty for ${f.id}: no quotation or no official page given`);
    else {
      p.penalty = str(f.penalty); if (f.penaltySource !== c.source) p.penaltySource = f.penaltySource; fixStats.penalties++;
      // a note that said the penalty was not stated is out of date now
      if (c.note && /penalt|fine|sanction/i.test(c.note)) p.note = str(f.note) ?? null;
    }
  } else if (!c.penalty && !p.penalty) fixStats.noPenalty++;
  const proven = !!str(f.confirmEvidence) && srcOk(f.confirmSource);
  // a corrected deadline (wording or rule) is taken whenever it comes with its quotation and official page, also for an item already confirmed
  if (proven && (str(f.dueText) || f.due)) {
    if (str(f.dueText)) p.dueText = str(f.dueText);
    if (f.due) { p.due = f.due; notes.push(`${f.id}: the due-date RULE was changed by a correction: ${JSON.stringify(c.due)} -> ${JSON.stringify(f.due)}`); }
    p.source = f.confirmSource; fixStats.corrected++;
  }
  if (!c.verified) {
    if (f.confirmed === true && proven) { p.verified = true; p.source = f.confirmSource; p.note = str(f.note) ?? null; fixStats.confirmed++; }
    else { fixStats.unconfirmed++; if (f.confirmed === true) rejected.push(`confirmation for ${f.id}: no quotation or no official page given`); if (str(f.note)) p.note = str(f.note); }
  } else if (f.unverify === true) { p.verified = false; if (str(f.note)) p.note = str(f.note); notes.push(`${f.id}: marked "to confirm" again: ${str(f.note) ?? 'official sources disagree'}`); }
  else if (f.replaceNote === true) p.note = str(f.note) ?? null;
  else if (str(f.note) && (!c.note || p.dueText || p.due)) p.note = str(f.note);
  if (Object.keys(p).length) {
    const after: any = { ...c }; for (const [k, v] of Object.entries(p)) { if (v === null) delete after[k]; else after[k] = v; }
    const bad = shapeProblems('compliance', { ...after, id: undefined });
    if (bad.length) rejected.push(`correction for ${f.id}: ${bad.join('; ')}`); else patches[c.id] = p;
  }
}

// ── the whole country with the new items in place: drop what does not fit, and say why ──
const build = (): CountryPack => withMore(base, { version: String(R.checkedOn), step: questions.some((q) => q.step === 'ops') ? OPS : null, departments, questions, compliances, sources, patches });
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
// ── ask no more than needed ──
// 1. A new question is asked only when a department that uses it was chosen.
// 2. A question that only matters after a Yes to an earlier question is asked only after that Yes
//    (worked out from the rules: every compliance that uses it also requires that earlier Yes).
{
  const flat = (c: any): any[] => (c && 'all' in c ? c.all.flatMap(flat) : [c]);
  const order = new Map<string, number>(); [...base.questions, ...questions].forEach((q, i) => order.set(q.id, i));
  const usersOf = (qid: string) => compliances.filter((c) => condRefs(c.applies).questions.has(qid) || (c.due.t === 'anniversary' && c.due.of === qid) || (c.due.t === 'event' && c.due.from === qid));
  for (const q of questions) {
    const users = usersOf(q.id);
    if (!users.length) continue;
    const depts = Array.from(new Set(users.map((c) => c.dept)));
    let gates: string[] | null = null;
    for (const c of users) {
      const yes = flat(c.applies).filter((k) => k && 'q' in k && k.yes === true && k.q !== q.id && (order.get(k.q) ?? 1e9) < order.get(q.id)!).map((k) => k.q as string);
      gates = gates === null ? yes : gates.filter((g) => yes.includes(g));
    }
    const conds: any[] = [];
    if (q.show) conds.push(q.show);
    conds.push({ dept: depts });
    for (const g of gates ?? []) conds.push({ q: g, yes: true });
    q.show = conds.length === 1 ? conds[0] : { all: conds };
  }
}

// leave out what nothing uses
const usedQ = new Set<string>(); for (const c of compliances) { condRefs(c.applies).questions.forEach((q) => usedQ.add(q)); if (c.due.t === 'anniversary') usedQ.add(c.due.of); if (c.due.t === 'event' && c.due.from) usedQ.add(c.due.from); }
for (let i = 0; i < 4; i++) for (const q of questions) if (usedQ.has(q.id)) condRefs(q.show).questions.forEach((x) => usedQ.add(x));
const keptQ = questions.filter((q) => usedQ.has(q.id)); for (const q of questions) if (!usedQ.has(q.id)) notes.push(`question ${q.id} left out: no compliance depends on it`);
questions.length = 0; questions.push(...keptQ);
const usedSrc = new Set<string>([...compliances.map((c) => c.source), ...Object.values(patches).flatMap((p: any) => [p.source, p.penaltySource].filter(Boolean))]);
const keptS = sources.filter((s) => usedSrc.has(s.id)); sources.length = 0; sources.push(...keptS);
const keptD = departments.filter((d) => compliances.some((c) => c.dept === d.id)); departments.length = 0; departments.push(...keptD);
const final = checkPack(build());

const hosts = new Map<string, number>(); for (const s of sources) { const h = new URL(s.url).hostname.replace(/^www\./, ''); hosts.set(h, (hosts.get(h) ?? 0) + 1); }
console.log(`${full.name}: ${compliances.length} compliances (${compliances.filter((c) => c.verified).length} checked on the official page), ${questions.length} questions, ${sources.length} sources, ${departments.length} new departments`);
if ((R.fixes ?? []).length) console.log(`corrections: ${fixStats.penalties} penalties added, ${fixStats.confirmed} confirmed on an official page (${fixStats.corrected} with a corrected wording), ${fixStats.noPenalty} still without a penalty, ${fixStats.unconfirmed} still to confirm`);
console.log('departments:', departments.map((d) => d.name).join(' | ') || 'none new');
console.log('source sites:', Array.from(hosts).sort((a, b) => b[1] - a[1]).map(([h, n]) => `${h}:${n}`).join(' '));
if (notes.length) console.log('\nnotes:\n  ' + notes.join('\n  '));
if (rejected.length) console.log(`\nleft out (${rejected.length}):\n  ` + rejected.join('\n  '));
if (final.length) { console.error('\nthe country is not sound with these items:', final.slice(0, 5)); process.exit(1); }

if (write) {
  const out = path.join(import.meta.dirname, '..', 'src', 'lib', 'compliance', 'countries', `${cc.toLowerCase()}-more.ts`);
  const usesOps = questions.some((q) => q.step === 'ops');
  // The version carries a fingerprint of the content. The site reloads its rule database only when a country's
  // version changes, and the date alone did not change when a second round of research was read on the same
  // day as the first (2026-11-11): the new rules shipped in the code and the live database kept the old ones.
  const content = JSON.parse(JSON.stringify({ step: usesOps ? OPS : null, departments, questions, compliances, sources, patches }));
  const print = createHash('sha256').update(JSON.stringify(content)).digest('hex').slice(0, 8);
  const body = `// The non-tax duties of ${full.name}: company registry, employment, workplace safety, privacy and so on.\n// WRITTEN BY scripts/compliance-import.ts from research read on the official pages on ${R.checkedOn}. Do not edit by hand:\n// change it in Service Master (which then owns the row), or re-run the importer with a corrected research file.\nimport type { More } from '../more.ts';\n\nexport const more: More = ${JSON.stringify({ version: `${R.checkedOn}.${print}`, ...content }, null, 1)};\n`;
  fs.writeFileSync(out, body);
  console.log(`\nwrote ${path.relative(process.cwd(), out)}`);
}
