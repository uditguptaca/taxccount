// Writes docs/t1/*.md from the questionnaire itself, so the documents cannot drift from the form.
// Run: node --experimental-strip-types scripts/t1-docs.ts
import { writeFileSync } from 'node:fs';
import { CATALOGUE as cat } from '../src/lib/t1/catalogue/index.ts';
import { SOURCES } from '../src/lib/t1/sources.ts';
import { RULES, VERIFIED_YEARS } from '../src/lib/t1/config/years.ts';

const esc = (s: string) => s.replace(/\|/g, '\\|').replace(/\n/g, ' ');
const out = (f: string, lines: string[]) => writeFileSync(new URL(`../docs/t1/${f}`, import.meta.url), lines.join('\n') + '\n');

// ── coverage matrix ──
const kinds: Record<string, string> = { client: 'Asked of the client', derived: 'Worked out from other answers', documents: 'Handled through documents', preparer: 'Done by the preparer', specialist: 'Referred to a specialist', na: 'Not applicable' };
const cm = [`# T1 coverage matrix (form version ${cat.version})`, '', 'Generated from the questionnaire. Every row says how an item of the official forms is covered: asked of the client, worked out, taken from documents, done by the preparer, referred to a specialist, or not applicable (with the reason).', ''];
const counts: Record<string, number> = {};
for (const m of cat.modules) {
  cm.push(`## ${m.code}. ${m.title[0]}`, '', '| Item | Reference | How it is covered | Questions / note |', '|---|---|---|---|');
  for (const r of m.cover) {
    counts[r.kind] = (counts[r.kind] ?? 0) + 1;
    cm.push(`| ${esc(r.item)} | ${esc(r.ref ?? '')} | ${kinds[r.kind]} | ${esc((r.qs ?? []).join(', ') + (r.note ? ` ${r.note}` : '') + (r.reason ? ` ${r.reason}` : ''))} |`);
  }
  cm.push('');
}
cm.splice(3, 0, `Totals: ${Object.entries(counts).map(([k, v]) => `${v} ${kinds[k].toLowerCase()}`).join('; ')}.`, '');
out('COVERAGE.md', cm);

// ── source register ──
out('SOURCES.md', [`# Source register (checked 2026-10-11)`, '', 'Every official page a question or rule relies on. A rule is only used as tax logic when it is **verified for exactly that tax year**; anything else becomes a preparer review item.', '', '| Id | Publisher | Title | Checked | Note |', '|---|---|---|---|---|', ...SOURCES.map((s) => `| ${s.id} | ${s.publisher} | [${esc(s.title)}](${s.url}) | ${s.checked} | ${esc(s.note ?? '')} |`)]);

// ── unresolved ──
const unv: string[] = [], unmapped: string[] = [];
for (const q of Array.from(cat.q.values())) if (q.map && !q.map.verified) unv.push(`${q.id} (${q.map.form}${q.map.box ? ` box ${q.map.box}` : ''})`);
const review = RULES.filter((r) => r.status !== 'verified');
const unres = [
  `# Unresolved items (form version ${cat.version})`, '',
  'What is deliberately NOT claimed as verified. Nothing here is hidden from the preparer: each becomes a review item.', '',
  '## Tax years', '', `Verified year(s): ${VERIFIED_YEARS.join(', ')}. Every other year (2020 to 2024) is offered, but its limits, dates and credits are NOT verified, and any answer that depends on them creates a preparer review item.`, '',
  '## Rules read from secondary sources or not yet re-checked', '', ...review.map((r) => `- ${r.id} (${r.year}): ${r.label[0]}${r.note ? `. ${r.note}` : ''}`), '',
  '## Slip boxes captured "as printed" rather than from the official page', '', unv.length ? unv.map((x) => `- ${x}`).join('\n') : 'None.', '',
  '## Still open for the owner', '',
  '- French text was written for this form and has not been reviewed by a professional translator or a Québec tax specialist.',
  '- Provincial credit amounts not listed as verified in config/years.ts must be confirmed on each province or territory\'s page before being quoted to a client.',
  '- There is no automatic reading of uploaded slips (no OCR): the client types the figures and the preparer compares them with the file.',
  '- There is no connection to the CRA. The form collects information for the preparer; it never files a return.',
  '- Form T183 (authorization to file electronically) is not generated here; the form only records that the client will be asked to sign it.',
];
out('UNRESOLVED.md', unres);

const nq = Array.from(cat.q.values()).filter((q) => q.type !== 'info').length;
console.log(`wrote docs/t1: ${cat.modules.length} modules, ${nq} questions, ${Object.values(counts).reduce((a, b) => a + b, 0)} coverage rows, ${unv.length} unverified boxes, ${review.length} unverified rules`);
