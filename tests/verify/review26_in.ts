// Phase 26, India: the findings of the second independent audit (questions B2, B3, C6, C7, C8, M6, M7, M10 and the
// India coverage gaps), each held by its reproduction. What was read on which official page is in
// docs/compliance-research/REVIEW26-IN.md.
// Run: node --experimental-strip-types tests/verify/review26_in.ts
import assert from 'node:assert/strict';
import { packOf } from '../../src/lib/compliance/index.ts';
import { checkPack } from '../../src/lib/compliance/integrity.ts';
import { evaluate, visibleQuestions } from '../../src/lib/compliance/engine.ts';
import { windowOf } from '../../src/lib/compliance/window.ts';
import type { Answers, Compliance, Result } from '../../src/lib/compliance/types.ts';

const T = '2026-11-13';
const p = packOf('IN')!;
let pass = 0, fail = 0;
const t = (name: string, fn: () => void) => { try { fn(); pass++; } catch (e) { fail++; console.log(`  FAIL  ${name}\n        ${(e as Error).message.split('\n').slice(0, 6).join('\n        ')}`); } };
const C = (id: string): Compliance => { const c = p.compliances.find((x) => x.id === id); assert.ok(c, `no compliance ${id}`); return c!; };
const Q = (id: string) => { const q = p.questions.find((x) => x.id === id); assert.ok(q, `no question ${id}`); return q!; };
const srcUrl = (id: string) => p.sources.find((s) => s.id === id)?.url ?? '';
/** Answers given; every other question that is asked is answered `mode` (a choice: its last option; a date: left blank). */
function run(state: string, entity: string, want: Answers = {}, depts?: string[], mode: 'no' | 'yes' = 'no', today = T) {
  const sel = { country: 'IN', state, entity, depts: depts ?? p.departments.map((d) => d.id) };
  const a: Answers = { ...want };
  for (let i = 0; i < 14; i++) for (const q of visibleQuestions(p, sel, a)) if (a[q.id] === undefined && q.type !== 'date') a[q.id] = q.type === 'yn' ? mode : q.type === 'multi' ? ['none'] : q.options?.[q.options.length - 1]?.v ?? '';
  const asked = visibleQuestions(p, sel, a).map((q) => q.id);
  const res = evaluate(p, sel, a, today);
  const get = (id: string): Result | undefined => res.find((r) => r.id === id);
  const dates = (id: string) => (get(id)?.next ?? []).map((n) => n.date);
  const ids = res.map((r) => r.id);
  return { res, a, get, dates, ids, asked };
}
const has = (ids: string[], ...want: string[]) => { for (const w of want) assert.ok(ids.includes(w), `${w} is missing from: ${ids.join(' ')}`); };
const lacks = (ids: string[], ...not: string[]) => { for (const w of not) assert.ok(!ids.includes(w), `${w} should not be shown`); };
const INC = ['income'], TDS = ['tds'], GSTD = ['gst'], FEMA = ['fema'];

console.log('review26_in: the pack is sound');
t('the country passes the structure check', () => assert.deepEqual(checkPack(p), []));

console.log('B2 the senior-citizen exemption from advance tax is for residents only');
t('the auditor\'s case: non-resident, no business, tax over Rs 10,000, 60 or older: advance tax is shown and the age is not asked', () => {
  const r = run('MH', 'individual', { in_resident: 'no', in_income: 'yes', in_business: 'no', in_advance: 'yes', in_senior60: 'yes' }, INC);
  assert.ok(!r.asked.includes('in_senior60')); has(r.ids, 'in_advance'); assert.equal(r.get('in_advance')?.certainty, 'applies');
});
t('a resident of 60 or more with no business income is not shown advance tax; one under 60 is', () => {
  const old = run('MH', 'individual', { in_resident: 'yes', in_income: 'yes', in_business: 'no', in_advance: 'yes', in_senior60: 'yes' }, INC);
  assert.ok(old.asked.includes('in_senior60')); lacks(old.ids, 'in_advance');
  has(run('MH', 'individual', { in_resident: 'yes', in_income: 'yes', in_business: 'no', in_advance: 'yes', in_senior60: 'no' }, INC).ids, 'in_advance');
});
t('the old question, which mixed residence-blind age with business income, is gone', () => assert.ok(!p.questions.some((q) => q.id === 'in_senior')));

console.log('B3 a person with a business AND a profession is asked both limits');
t('"both": turnover and professional receipts are both asked', () => {
  const r = run('KA', 'sole_prop', { in_resident: 'yes', in_biz_kind: 'both' }, INC);
  assert.ok(r.asked.includes('in_turnover') && r.asked.includes('in_prof_50'));
});
t('"both", business turnover over Rs 10 crore, receipts under Rs 50 lakh: tax audit and the audit-case return', () => {
  const r = run('KA', 'sole_prop', { in_resident: 'yes', in_biz_kind: 'both', in_turnover: 't3', in_prof_50: 'no', in_presumptive: 'no' }, INC);
  has(r.ids, 'in_tax_audit', 'in_itr_biz_audit'); lacks(r.ids, 'in_itr_biz');
});
t('"both", business under Rs 1 crore, professional receipts over Rs 50 lakh: tax audit', () => {
  const r = run('KA', 'individual', { in_resident: 'yes', in_income: 'yes', in_business: 'yes', in_biz_kind: 'both', in_turnover: 't1', in_prof_50: 'yes', in_presumptive: 'no' }, INC);
  has(r.ids, 'in_tax_audit', 'in_itr_biz_audit');
});
t('profession only: turnover not asked; business only: professional receipts not asked', () => {
  const prof = run('KA', 'sole_prop', { in_resident: 'yes', in_biz_kind: 'prof' }, INC);
  assert.ok(!prof.asked.includes('in_turnover') && prof.asked.includes('in_prof_50'));
  const biz = run('KA', 'sole_prop', { in_resident: 'yes', in_biz_kind: 'biz' }, INC);
  assert.ok(biz.asked.includes('in_turnover') && !biz.asked.includes('in_prof_50'));
});
t('the yes/no question is replaced by a three-way one with a new id; a company is never asked it', () => {
  assert.ok(!p.questions.some((q) => q.id === 'in_profession'));
  assert.deepEqual(Q('in_biz_kind').options?.map((o) => o.v), ['biz', 'prof', 'both']);
  assert.ok(!run('MH', 'pvt', {}, INC).asked.includes('in_biz_kind'));
});

console.log('C6 questions that ask for a legal conclusion explain the term');
t('each has help text that says what the term means or how to tell', () => {
  for (const id of ['in_x_g_re', 'in_small_co', 'in_np_income', 'in_sft', 'in_tp', 'in_tds_other', 'in_tds_nr', 'in_np_short', 'in_export']) assert.ok((Q(id).help ?? '').length > 60, `${id} has no help`);
  assert.match(Q('in_x_g_re').help ?? '', /How to tell/); assert.match(Q('in_small_co').help ?? '', /How to tell/); assert.match(Q('in_sft').help ?? '', /How to tell/);
  assert.match(Q('in_tp').help ?? '', /Related parties/); assert.match(Q('in_np_income').help ?? '', /before exemption means/); assert.match(Q('in_np_short').help ?? '', /85%/);
});

console.log('C7 double-barrelled questions are split');
t('downstream investment: "has foreign investment" and "invested in another Indian entity" are separate questions', () => {
  assert.ok(!p.questions.some((q) => q.id === 'in_x_downstream'));
  Q('in_x_fi_indirect'); assert.doesNotMatch(Q('in_x_ds_invest').text, / and /);
});
t('senior: the question asks only the age', () => assert.equal(Q('in_senior60').text, 'Are you 60 or older?'));

console.log('C8 an earlier answer that decides a later question hides it');
t('paid nothing to a non-resident: not asked about taxable payments to non-residents, no Form 27Q', () => {
  const r = run('MH', 'pvt', { in_remit: 'no', in_tds_nr: 'yes' }, TDS);
  assert.ok(!r.asked.includes('in_tds_nr')); lacks(r.ids, 'in_27q', 'in_15ca');
  const y = run('MH', 'pvt', { in_remit: 'yes', in_tds_nr: 'yes' }, TDS);
  assert.ok(y.asked.includes('in_tds_nr')); has(y.ids, 'in_27q', 'in_15ca');
});
t('no foreign investment, direct or indirect: not asked about downstream investment, no Form DI', () => {
  const r = run('MH', 'pvt', { in_x_fdi: 'no', in_x_fi_indirect: 'no', in_x_ds_invest: 'yes' }, FEMA);
  assert.ok(!r.asked.includes('in_x_ds_invest')); lacks(r.ids, 'in_x_form_di');
});
t('direct foreign investment: asked; a downstream investment brings Form DI. Indirect only: the same', () => {
  const d = run('MH', 'pvt', { in_x_fdi: 'yes', in_x_ds_invest: 'yes' }, FEMA);
  assert.ok(!d.asked.includes('in_x_fi_indirect')); has(d.ids, 'in_x_form_di', 'in_x_fla');
  const i = run('MH', 'llp', { in_x_fdi: 'no', in_x_fi_indirect: 'yes', in_x_ds_invest: 'yes' }, FEMA);
  assert.ok(i.asked.includes('in_x_ds_invest')); has(i.ids, 'in_x_form_di'); lacks(i.ids, 'in_x_fla');
});

console.log('M6 business questions are not put to an individual with no business income; wording');
t('individual without business income: no food, packaged goods, IEC or export questions', () => {
  const r = run('DL', 'individual', { in_business: 'no' }, ['licences', 'fema']);
  for (const q of ['in_x_food', 'in_x_prepack', 'in_x_iec', 'in_x_exporter']) assert.ok(!r.asked.includes(q), q);
  const b = run('DL', 'individual', { in_business: 'yes' }, ['licences', 'fema']);
  for (const q of ['in_x_food', 'in_x_prepack', 'in_x_iec', 'in_x_exporter']) assert.ok(b.asked.includes(q), q);
  assert.ok(run('DL', 'pvt', {}, ['licences']).asked.includes('in_x_food'));
});
t('foreign investment wording fits a firm; the Rs 5 crore question says what it is about', () => {
  assert.match(Q('in_x_fdi').text, /LLP or firm/); assert.match(Q('in_gst_5cr').text, /turnover/);
});

console.log('M7 the passport question covers a child');
t('wording', () => assert.match(Q('in_x_g_passport').text, /child/));

console.log('M10 the property question has a period');
t('"this financial year", new id, and Form 26QB follows it', () => {
  assert.match(Q('in_property_buy').text, /this financial year/); assert.ok(!p.questions.some((q) => q.id === 'in_property'));
  has(run('MH', 'individual', { in_property_buy: 'yes' }, TDS).ids, 'in_26qb');
});

console.log('I1 GST final return (GSTR-10) after cancellation');
const REG = { in_gst_reg: 'yes', in_gst_scheme: 'regular_m' };
t('a regular taxpayer whose registration was cancelled: within 3 months, counted from the date given', () => {
  const r = run('MH', 'pvt', { ...REG, in_x_gst_cancel: 'yes' }, GSTD);
  has(r.ids, 'in_x_gstr10'); assert.deepEqual(windowOf(C('in_x_gstr10').due), { n: 3, unit: 'months', kind: 'after' });
  assert.equal(C('in_x_gstr10').verified, false); assert.match(C('in_x_gstr10').note ?? '', /as enacted/);
  lacks(run('MH', 'pvt', { ...REG, in_x_gst_cancel: 'no' }, GSTD).ids, 'in_x_gstr10');
});
t('a composition taxpayer is not covered by section 45', () => lacks(run('MH', 'pvt', { in_gst_reg: 'yes', in_gst_scheme: 'comp', in_x_gst_cancel: 'yes' }, GSTD).ids, 'in_x_gstr10'));

console.log('GSTR-7, GSTR-6, GSTR-5, GSTR-8 and GSTR-9B');
t('each shows its date from the Act, from 13 November 2026', () => {
  const r = run('MH', 'pvt', { ...REG, in_x_gst_tds: 'yes', in_x_isd: 'yes', in_x_nrtp: 'yes', in_x_eco_tcs: 'yes' }, GSTD);
  assert.equal(r.dates('in_x_gstr7')[0], '2026-12-10');
  assert.equal(r.dates('in_x_gstr6')[0], '2026-11-13');
  assert.equal(r.dates('in_x_gstr5')[0], '2026-11-20');
  assert.equal(r.dates('in_x_gstr8')[0], '2026-12-10');
  assert.equal(r.dates('in_x_gstr9b')[0], '2026-12-30');
  for (const id of ['in_x_gstr7', 'in_x_gstr6', 'in_x_gstr5', 'in_x_gstr8', 'in_x_gstr9b']) assert.equal(srcUrl(C(id).source), 'https://gstcouncil.gov.in/sites/default/files/2024-04/annexure-3_cgst-act_2017.pdf', id);
  lacks(run('MH', 'pvt', REG, GSTD).ids, 'in_x_gstr7', 'in_x_gstr6', 'in_x_gstr5', 'in_x_gstr8', 'in_x_gstr9b');
  for (const id of ['in_x_gstr10', 'in_x_gstr7', 'in_x_gstr6', 'in_x_gstr5']) assert.match(C(id).penalty ?? '', /section 47\(1\)/, id);
  for (const id of ['in_x_gstr8', 'in_x_gstr9b', 'in_x_itc04_half', 'in_x_itc04_annual']) assert.match(C(id).penalty ?? '', /section 125/, id);
});

console.log('ITC-04 job work');
t('turnover over Rs 5 crore last year: 25 October and 25 April; otherwise 25 April', () => {
  const big = run('MH', 'pvt', { ...REG, in_x_jobwork: 'yes', in_x_itc04_5cr: 'yes' }, GSTD);
  assert.deepEqual(big.dates('in_x_itc04_half'), ['2027-04-25', '2027-10-25']); lacks(big.ids, 'in_x_itc04_annual');
  const small = run('MH', 'pvt', { ...REG, in_x_jobwork: 'yes', in_x_itc04_5cr: 'no' }, GSTD);
  assert.equal(small.dates('in_x_itc04_annual')[0], '2027-04-25'); lacks(small.ids, 'in_x_itc04_half');
  assert.ok(!run('MH', 'pvt', { ...REG, in_x_jobwork: 'no' }, GSTD).asked.includes('in_x_itc04_5cr'));
});

console.log('SEBI results of a listed company');
t('a listed public company: quarterly results 14 November and 14 February, annual 30 May', () => {
  const r = run('MH', 'public', { in_x_listed: 'yes' }, ['sebi']);
  assert.deepEqual(r.dates('in_x_sebi_quarterly'), ['2026-11-14', '2027-02-14']); assert.equal(r.dates('in_x_sebi_annual')[0], '2027-05-30');
  lacks(run('MH', 'public', { in_x_listed: 'no' }, ['sebi']).ids, 'in_x_sebi_quarterly', 'in_x_sebi_annual');
  assert.ok(!run('MH', 'pvt', {}).asked.includes('in_x_listed'));
  assert.match(srcUrl(C('in_x_sebi_annual').source), /^https:\/\/www\.sebi\.gov\.in\//);
});

console.log(`\nreview26_in: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
