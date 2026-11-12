// The Canadian findings of the independent review (C1 to C17), each held by the reviewer's own reproduction.
// What was read on which official page is in docs/compliance-research/REVIEW-CA.md.
// Run: node --experimental-strip-types tests/verify/review_ca.ts
import assert from 'node:assert/strict';
import { packOf } from '../../src/lib/compliance/index.ts';
import { checkPack } from '../../src/lib/compliance/integrity.ts';
import { evaluate, visibleQuestions } from '../../src/lib/compliance/engine.ts';
import { windowOf } from '../../src/lib/compliance/window.ts';
import type { Answers, Compliance, Result } from '../../src/lib/compliance/types.ts';

const T = '2026-11-11';
const p = packOf('CA')!;
let pass = 0, fail = 0;
const t = (name: string, fn: () => void) => { try { fn(); pass++; } catch (e) { fail++; console.log(`  FAIL  ${name}\n        ${(e as Error).message.split('\n').slice(0, 6).join('\n        ')}`); } };
const C = (id: string): Compliance => { const c = p.compliances.find((x) => x.id === id); assert.ok(c, `no compliance ${id}`); return c!; };
const Q = (id: string) => { const q = p.questions.find((x) => x.id === id); assert.ok(q, `no question ${id}`); return q!; };
/** Answers given, every other question answered `mode` (dates 2019-08-15, year end 31 December unless given). */
function run(state: string, entity: string, want: Answers = {}, depts?: string[], mode: 'no' | 'yes' = 'no', today = T) {
  const sel = { country: 'CA', state, entity, depts: depts ?? p.departments.map((d) => d.id) };
  const a: Answers = { ...want };
  for (let i = 0; i < 14; i++) for (const q of visibleQuestions(p, sel, a)) if (a[q.id] === undefined) a[q.id] = q.type === 'yn' ? mode : q.type === 'multi' ? ['none'] : q.type === 'date' ? '2019-08-15' : q.type === 'monthday' ? '12-31' : q.options?.[q.options.length - 1]?.v ?? '';
  const res = evaluate(p, sel, a, today);
  const get = (id: string): Result | undefined => res.find((r) => r.id === id);
  const dates = (id: string) => (get(id)?.next ?? []).map((n) => n.date);
  return { res, a, get, dates, ids: res.map((r) => r.id), asked: visibleQuestions(p, sel, a).map((q) => q.id) };   // asked = what is on the form once everything is answered
}
const has = (r: { ids: string[] }, ...ids: string[]) => { for (const id of ids) assert.ok(r.ids.includes(id), `expected ${id}; got ${r.ids.join(' ')}`); };
const lacks = (r: { ids: string[] }, ...ids: string[]) => { for (const id of ids) assert.ok(!r.ids.includes(id), `did not expect ${id}`); };

console.log('review_ca: the pack is sound');
t('the country passes the structure check', () => assert.deepEqual(checkPack(p), []));

console.log('C12 a date is moved off a weekend only for an authority whose own rule was read');
t('only the CRA and British Columbia\'s Ministry of Finance move a date', () => {
  const moving = Array.from(new Set(p.compliances.filter((c) => c.roll !== false).map((c) => c.authority))).sort();
  assert.deepEqual(moving, ['British Columbia Ministry of Finance', 'Canada Revenue Agency']);
});
t('Alberta WCB: the last day of February, not 1 March 2027', () => assert.deepEqual(run('AB', 'corporation', { ca_employees: 'yes' }, ['payroll']).dates('ca_wcb_ab'), ['2027-02-28', '2028-02-29']));
t('Ontario employer health tax instalment: Sunday 15 November 2026 as stated, while the CRA\'s T4 still moves to 1 March 2027', () => {
  const r = run('ON', 'corporation', { ca_employees: 'yes', ca_payroll_size: 'p3' }, ['payroll']);
  assert.equal(r.dates('ca_on_eht_inst')[0], '2026-11-15'); assert.equal(r.dates('ca_t4')[0], '2027-03-01');
});
t('Corporations Canada: 60 days after the anniversary, also when that is a Saturday', () => {
  assert.deepEqual(run('ON', 'corporation', { ca_federal: 'yes', ca_inc_date: '2019-08-15' }, ['registry']).dates('ca_corpcan'), ['2027-10-14', '2028-10-14']);   // 14 October 2028 is a Saturday: it used to show 16 October
});
t('none of the items the review listed is shown later than its own sentence', () => {
  for (const id of ['ca_wcb_ab', 'ca_corpcan', 'ca_corpcan_nfp', 'ca_on_eht', 'ca_on_eht_inst', 'ca_mb_he', 'ca_mb_he_a', 'ca_qc_remit', 'ca_sk_pst_m', 'ca_sk_pst_q', 'ca_qst_a', 'ca_qst_q', 'ca_qst_m', 'ca_mb_rst_m', 'ca_mb_rst_q', 'ca_mb_rst_a', 'ca_rl1', 'ca_at1', 'ca_co17', 'ca_tp1', 'ca_tp1_se', 'ca_instal_qc', 'ca_worksafebc', 'ca_cnesst', 'ca_qc_update_sp'])
    assert.equal(C(id).roll, false, id);
});
t('British Columbia\'s PST and employer health tax keep the next business day, which their pages state', () => {
  for (const id of ['ca_bc_pst_m', 'ca_bc_pst_q', 'ca_bc_pst_s', 'ca_bc_eht', 'ca_bc_eht_inst']) assert.notEqual(C(id).roll, false, id);
});
t('the farmer\'s instalment is shown as 31 December, never as New Year\'s Day', () => {
  const d = run('ON', 'individual', { ca_resident: 'yes', ca_owing: 'yes', ca_farm: 'yes' }, ['income'], 'no', '2028-06-01').dates('ca_instal_farm');
  assert.equal(d[0], '2028-12-31');
});

console.log('C5 Ontario written policies: before March 1');
t('the last day of February is shown, not 1 March', () => {
  const r = run('ON', 'corporation', { ca_employees: 'yes', ca_x_emp_band: 'e25', ca_x_fedreg: 'no' }, ['labour']);
  for (const id of ['ca_x_on_disconnect', 'ca_x_on_emon']) assert.deepEqual(r.dates(id), ['2027-02-28', '2028-02-28'], id);
});

console.log('C2 and C3 incorporated non-profits');
t('a British Columbia society files within 30 days after its annual general meeting, not on the company rule', () => {
  const r = run('BC', 'nonprofit', { ca_npo_corp: 'yes', ca_agm_date: '2026-10-25' }, ['registry']);
  lacks(r, 'ca_ar_bc'); assert.deepEqual(r.dates('ca_ar_bc_society'), ['2026-11-24']);
});
t('with no meeting date the society\'s date is still needed; a meeting long past is shown as was due', () => {
  assert.equal(run('BC', 'nonprofit', { ca_npo_corp: 'yes', ca_agm_date: '' }, ['registry']).get('ca_ar_bc_society')!.needs, 'ca_agm_date');
  const old = run('BC', 'nonprofit', { ca_npo_corp: 'yes', ca_agm_date: '2026-06-01' }, ['registry']).get('ca_ar_bc_society')!;
  assert.deepEqual(old.next, []); assert.equal(old.passed, '2026-07-01');
});
t('a British Columbia company keeps two months after its anniversary', () => assert.equal(run('BC', 'corporation', { ca_federal: 'no', ca_inc_date: '2021-08-20' }, ['registry']).dates('ca_ar_bc')[0], '2027-10-20'));
t('a Saskatchewan non-profit corporation is no longer shown nothing', () => {
  const r = run('SK', 'nonprofit', { ca_npo_corp: 'yes', ca_agm_date: '2026-10-25' }, ['registry']);
  assert.deepEqual(r.dates('ca_ar_sk_npo'), ['2026-11-24']); lacks(r, 'ca_ar_sk');
  assert.match(C('ca_ar_sk_npo').dueText, /does not state the due date of the annual return/);
});

console.log('C4 an estate with a tax year that does not end on December 31');
t('every trust is asked, and "no" leaves the December 31 dates', () => {
  const r = run('ON', 'trust', { ca_trust_express: 'yes' }, ['income']);
  assert.ok(r.asked.includes('ca_gre_fy')); assert.ok(!r.asked.includes('ca_gre_year_end'));
  assert.deepEqual(r.dates('ca_t3'), ['2027-03-31', '2028-03-30']); lacks(r, 'ca_t3_gre');
});
t('"yes" counts 90 days from the year end given, for the return and what is filed with it', () => {
  const r = run('ON', 'trust', { ca_trust_express: 'yes', ca_gre_fy: 'yes', ca_gre_year_end: '2026-09-30', ca_trust_benef: 'yes', ca_foreign_prop: 'yes', ca_pay_nr: 'yes' });
  for (const id of ['ca_t3_gre', 'ca_sched15_gre', 'ca_t3_slips_gre', 'ca_t1135_trust_gre', 'ca_nr4_trust_gre']) assert.deepEqual(r.dates(id), ['2026-12-29'], id);
  lacks(r, 'ca_t3', 'ca_sched15', 'ca_t3_slips', 'ca_t1135_trust', 'ca_nr4_trust', 'ca_nr4');
});
t('"yes" with no year end says the date is still needed, never 31 March', () => {
  const r = run('ON', 'trust', { ca_trust_express: 'yes', ca_gre_fy: 'yes', ca_gre_year_end: '' }, ['income']).get('ca_t3_gre')!;
  assert.deepEqual(r.next, []); assert.equal(r.needs, 'ca_gre_year_end');
});
t('a trust\'s NR4 is 90 days after its year end (30 March in a leap year), a company\'s the last day of March', () => {
  assert.deepEqual(run('ON', 'trust', { ca_pay_nr: 'yes' }, ['payroll']).dates('ca_nr4_trust'), ['2027-03-31', '2028-03-30']);
  const c = run('ON', 'corporation', { ca_pay_nr: 'yes' }, ['payroll']); assert.deepEqual(c.dates('ca_nr4'), ['2027-03-31', '2028-03-31']); lacks(c, 'ca_nr4_trust');
});

console.log('C6 federally regulated employers');
const ON_PROV = ['ca_x_on_poster', 'ca_x_on_disconnect', 'ca_x_on_emon', 'ca_x_on_critical', 'ca_x_on_jhsc', 'ca_x_on_supervisor', 'ca_x_on_policy_review'];
t('are not shown Ontario\'s employment standards and health and safety items', () => {
  const fed = run('ON', 'corporation', { ca_employees: 'yes', ca_x_fedreg: 'yes', ca_x_emp_band: 'e100' }, ['labour', 'reporting']);
  lacks(fed, ...ON_PROV); has(fed, 'ca_x_on_form7');
  has(run('ON', 'corporation', { ca_employees: 'yes', ca_x_fedreg: 'no', ca_x_emp_band: 'e100' }, ['labour', 'reporting']), ...ON_PROV);
});
t('"Not sure" keeps them as "may apply"', () => {
  const r = run('ON', 'corporation', { ca_employees: 'yes', ca_x_fedreg: 'unsure', ca_x_emp_band: 'e100' }, ['labour', 'reporting']);
  for (const id of ON_PROV) assert.equal(r.get(id)?.certainty, 'check', id);
});
t('are not shown British Columbia\'s pay transparency report, which is for provincially regulated employers', () => {
  lacks(run('BC', 'corporation', { ca_employees: 'yes', ca_x_fedreg: 'yes', ca_x_emp_band: 'e100' }, ['labour', 'reporting']), 'ca_x_bc_paytransparency');
  has(run('BC', 'corporation', { ca_employees: 'yes', ca_x_fedreg: 'no', ca_x_emp_band: 'e100' }, ['labour', 'reporting']), 'ca_x_bc_paytransparency');
});

console.log('C7 an individual with a business on the side');
t('is asked about GST/HST and gets the registration and the return', () => {
  const r = run('ON', 'individual', { ca_resident: 'yes', ca_selfemp: 'yes', ca_over30k: 'yes', ca_gst_freq: 'a' }, ['income', 'sales']);
  has(r, 'ca_gst_register', 'ca_gst_a_sp', 'ca_t1_se'); assert.equal(r.dates('ca_gst_a_sp')[0], '2027-04-30');
  assert.equal(run('ON', 'individual', { ca_selfemp: 'yes', ca_gst_reg: 'yes', ca_gst_freq: 'q' }, ['sales']).dates('ca_gst_q')[0], '2027-02-01');
});
t('with no business is asked nothing about sales tax', () => {
  const r = run('ON', 'individual', { ca_selfemp: 'no' }, ['sales']);
  assert.deepEqual(r.asked, ['ca_selfemp']); assert.deepEqual(r.ids, []);
});
t('a taxi or ride-sharing driver registers whatever the sales', () => {
  for (const ent of ['individual', 'sole_prop']) has(run('ON', ent, { ca_selfemp: 'yes', ca_over30k: 'no', ca_taxi: 'yes', ca_gst_freq: 'a' }, ['sales']), 'ca_gst_register');
  lacks(run('ON', 'sole_prop', { ca_over30k: 'no', ca_taxi: 'no' }, ['sales']), 'ca_gst_register');
  assert.ok(!run('ON', 'corporation', {}, ['sales']).asked.includes('ca_taxi'));
});

console.log('C8 the small-supplier limit of a charity or non-profit organization is $50,000');
t('a non-profit is asked about $50,000, a business about $30,000', () => {
  const n = run('ON', 'nonprofit', {}, ['sales']).asked, c = run('ON', 'corporation', {}, ['sales']).asked;
  assert.ok(n.includes('ca_over50k') && !n.includes('ca_over30k')); assert.ok(c.includes('ca_over30k') && !c.includes('ca_over50k'));
  assert.match(Q('ca_over50k').text, /\$50,000/); assert.doesNotMatch(Q('ca_over30k').help ?? '', /50,000/);
});
t('a charity that does not have to register is shown no GST/HST return', () => {
  const r = run('ON', 'nonprofit', { ca_np_type: 'charity', ca_over50k: 'yes', ca_charity_rev: 'no' }, ['sales']);
  assert.deepEqual(r.ids, []); assert.ok(!r.asked.includes('ca_gst_freq'));
});
t('a charity over both limits, and a non-profit over $50,000, register and file', () => {
  has(run('ON', 'nonprofit', { ca_np_type: 'charity', ca_over50k: 'yes', ca_charity_rev: 'yes', ca_gst_freq: 'a' }, ['sales']), 'ca_gst_register', 'ca_gst_a');
  has(run('ON', 'nonprofit', { ca_np_type: 'npo', ca_over50k: 'yes', ca_gst_freq: 'a' }, ['sales']), 'ca_gst_register', 'ca_gst_a');
});

console.log('C9 provincial sales tax: each province has its own question and its own periods');
t('British Columbia offers six-monthly filing; Saskatchewan and Manitoba do not', () => {
  assert.deepEqual(Q('ca_pst_freq_bc').options!.map((o) => o.v), ['m', 'q', 's', 'a']);
  for (const id of ['ca_pst_freq_sk', 'ca_pst_freq_mb']) assert.deepEqual(Q(id).options!.map((o) => o.v), ['m', 'q', 'a']);
  assert.deepEqual(run('BC', 'corporation', { ca_sell_prov: ['BC'], ca_pst_freq_bc: 's' }, ['sales']).dates('ca_bc_pst_s'), ['2027-02-01', '2027-08-02']);
});
t('a seller in two provinces can file quarterly in one and monthly in the other', () => {
  const r = run('SK', 'corporation', { ca_sell_prov: ['SK', 'MB'], ca_pst_freq_sk: 'q', ca_pst_freq_mb: 'm' }, ['sales']);
  has(r, 'ca_sk_pst_q', 'ca_mb_rst_m'); lacks(r, 'ca_sk_pst_m', 'ca_mb_rst_q');
  assert.equal(r.dates('ca_sk_pst_q')[0], '2027-01-31');        // a Sunday, shown as stated: Saskatchewan's page gives no weekend rule
});

console.log('C10 and C11 the partnership return');
t('a trust counts as an individual for the date, but a partnership with a trust files whatever its size', () => {
  const of = (v: string, more: Answers = {}) => run('ON', 'partnership', { ca_partners: v, ca_foreign_prop: 'yes', fye: '06-30', ...more }, ['income']);
  assert.equal(of('trusts').dates('ca_t5013_i')[0], '2027-03-31'); assert.ok(!of('trusts').asked.includes('ca_pship_big'));
  lacks(of('individuals'), 'ca_t5013_i'); assert.equal(of('individuals', { ca_pship_big: 'yes' }).dates('ca_t5013_i')[0], '2027-03-31');
  assert.equal(of('mixed').dates('ca_t5013_m')[0], '2026-11-30'); assert.equal(of('corps').dates('ca_t5013_c')[0], '2026-11-30');
});
t('the forms due with the partnership return follow the same three dates', () => {
  const of = (v: string) => run('ON', 'partnership', { ca_partners: v, ca_foreign_prop: 'yes', fye: '06-30' }, ['income']);
  assert.equal(of('individuals').dates('ca_t1135_pship_i')[0], '2027-03-31'); lacks(of('individuals'), 'ca_t1135_pship', 'ca_t1135_pship_c');
  assert.equal(of('trusts').dates('ca_t1135_pship_i')[0], '2027-03-31');
  assert.equal(of('mixed').dates('ca_t1135_pship')[0], '2026-11-30'); lacks(of('mixed'), 'ca_t1135_pship_i');
  assert.equal(of('corps').dates('ca_t1135_pship_c')[0], '2026-11-30');
});
t('each rule cites a page that carries it', () => {
  for (const id of ['ca_t5013_c', 'ca_t5013_m', 'ca_t5013_i']) assert.equal(C(id).source, 't4068', id);
  assert.equal(C('ca_ar_ab').source, 'ab_bcr'); assert.equal(C('ca_gst_instal').source, 'gst_instal_when');
  for (const id of ['ca_gst_a', 'ca_gst_a_sp', 'ca_gst_q', 'ca_gst_m']) assert.equal(C(id).penaltySource, 'gst_pen', id);
  for (const s of ['t4068', 'ab_bcr', 'gst_instal_when', 'gst_pen']) assert.match(p.sources.find((x) => x.id === s)?.url ?? '', /^https:\/\//, s);
});

console.log('C13 (Canadian items) a renewal fixed by an expiry date or birthday is not counted from the day it was last done');
t('renewals tied to a date on a document are "until"', () => {
  for (const id of ['ca_x_g_qc_dl_fees', 'ca_x_g_patent_maint', 'ca_x_g_on_plate_renew', 'ca_x_g_qc_reg_renew', 'ca_x_g_on_dl_renew', 'ca_x_g_bc_dl_renew', 'ca_x_g_on_health_renew', 'ca_x_g_prcard_renew', 'ca_x_g_pal_renew', 'ca_x_g_nexus_renew'])
    assert.equal(windowOf(C(id).due)?.kind, 'until', id);
  assert.equal(windowOf(C('ca_x_g_qc_unclaimed_remit').due), null);
});

console.log('C15 and C16 Québec');
t('the Québec return is shown on the same answers as the federal one', () => {
  lacks(run('QC', 'individual', { ca_resident: 'yes' }, ['income']), 'ca_tp1', 'ca_t1');
  has(run('QC', 'individual', { ca_resident: 'yes', ca_employment: 'yes' }, ['income']), 'ca_tp1', 'ca_t1');
});
t('the unconfirmed pay equity declaration shows its rule in words, no worked-out date', () => {
  const r = run('QC', 'corporation', { ca_employees: 'yes', ca_x_emp_band: 'e25' }, ['labour', 'reporting']).get('ca_x_qc_demes')!;
  assert.deepEqual(r.next, []); assert.equal(r.verified, false); assert.equal(r.window, undefined); assert.match(r.rule ?? '', /could not be confirmed/);
});

console.log('C1 a federal corporation and its province');
t('Québec: the annual updating declaration', () => assert.equal(run('QC', 'corporation', { ca_federal: 'yes' }, ['registry']).dates('ca_ar_qc')[0], '2026-11-15'));
t('Alberta: the last day of the month after the anniversary month of its Alberta registration', () => {
  const r = run('AB', 'corporation', { ca_federal: 'yes', ca_xp_reg_date: '2021-05-07' }, ['registry']);
  assert.deepEqual(r.dates('ca_ar_ab_xp'), ['2027-06-30', '2028-06-30']); lacks(r, 'ca_ar_ab'); has(r, 'ca_corpcan');
  assert.equal(run('AB', 'corporation', { ca_federal: 'yes', ca_xp_reg_date: '' }, ['registry']).get('ca_ar_ab_xp')!.needs, 'ca_xp_reg_date');
});
t('Newfoundland and Labrador: the end of the anniversary month of its registration, marked to confirm', () => {
  const r = run('NL', 'corporation', { ca_federal: 'yes', ca_xp_reg_date: '2021-05-07' }, ['registry']);
  assert.deepEqual(r.dates('ca_ar_nl_xp'), ['2027-05-31', '2028-05-31']); assert.equal(r.get('ca_ar_nl_xp')!.verified, false);
});
t('Ontario: the initial return and the notice of change, and still no Ontario annual return', () => {
  const r = run('ON', 'corporation', { ca_federal: 'yes' }, ['registry']);
  has(r, 'ca_x_on_ep_initial', 'ca_x_on_change', 'ca_corpcan'); lacks(r, 'ca_x_on_initial', 'ca_ar_on');
  assert.deepEqual(windowOf(C('ca_x_on_ep_initial').due), { n: 60, unit: 'days', kind: 'after' });
  const own = run('ON', 'corporation', { ca_federal: 'no' }, ['registry']); has(own, 'ca_x_on_initial', 'ca_x_on_change', 'ca_ar_on'); lacks(own, 'ca_x_on_ep_initial');
});
t('the registration date is asked only where it is used', () => {
  assert.ok(run('AB', 'corporation', { ca_federal: 'yes' }, ['registry']).asked.includes('ca_xp_reg_date'));
  assert.ok(!run('AB', 'corporation', { ca_federal: 'no' }, ['registry']).asked.includes('ca_xp_reg_date'));
  assert.ok(!run('ON', 'corporation', { ca_federal: 'yes' }, ['registry']).asked.includes('ca_xp_reg_date'));
});

console.log('C17 small points');
t('a money services business that answers No to the sector question keeps the FINTRAC reports', () => has(run('ON', 'corporation', { ca_x_fintrac: 'no', ca_x_msb: 'yes' }, ['aml']), 'ca_x_fintrac_lctr', 'ca_x_fintrac_str', 'ca_x_fintrac_review', 'ca_x_fintrac_msb'));
t('an individual who owns a trademark is shown its renewal', () => has(run('ON', 'individual', { ca_x_trademark: 'yes' }, ['ip']), 'ca_x_tm_renew'));
t('WorkSafeBC says the dates shown are the quarterly ones', () => assert.match(C('ca_worksafebc').note ?? '', /quarterly ones/));

console.log(`\nreview_ca: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
