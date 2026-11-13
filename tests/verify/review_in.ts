// The India findings of the independent review (I1 to I31), each held by the reviewer's own reproduction.
// What was read on which official page is in docs/compliance-research/REVIEW-IN.md.
// Run: node --experimental-strip-types tests/verify/review_in.ts
import assert from 'node:assert/strict';
import { packOf } from '../../src/lib/compliance/index.ts';
import { checkPack } from '../../src/lib/compliance/integrity.ts';
import { evaluate, visibleQuestions } from '../../src/lib/compliance/engine.ts';
import { windowOf } from '../../src/lib/compliance/window.ts';
import type { Answers, Compliance, Result } from '../../src/lib/compliance/types.ts';

const T = '2026-11-11';
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
  const sure = (re: RegExp) => res.filter((r) => re.test(r.id) && r.certainty === 'applies').map((r) => r.id);
  return { res, a, get, dates, ids, asked, sure };
}
const has = (ids: string[], ...want: string[]) => { for (const w of want) assert.ok(ids.includes(w), `${w} is missing from: ${ids.join(' ')}`); };
const lacks = (ids: string[], ...not: string[]) => { for (const w of not) assert.ok(!ids.includes(w), `${w} should not be shown`); };

console.log('review_in: the pack is sound');
t('the country passes the structure check', () => assert.deepEqual(checkPack(p), []));

console.log('I1 a trade mark is renewed on the expiry date the person gives, not ten years later');
t('expiry 1 May 2027 shows 1 May 2027, then 1 May 2037', () => {
  assert.deepEqual(run('MH', 'pvt', { in_x_trademark: 'yes', in_x_tm_expiry: '2027-05-01' }, ['licences']).dates('in_x_tm_renew'), ['2027-05-01', '2037-05-01']);
  assert.deepEqual(run('DL', 'sole_prop', { in_x_trademark: 'yes', in_x_tm_expiry: '2026-12-01' }, ['licences']).dates('in_x_tm_renew')[0], '2026-12-01');
});
t('with no expiry date the row asks for it', () => assert.equal(run('DL', 'sole_prop', { in_x_trademark: 'yes' }, ['licences']).get('in_x_tm_renew')?.needs, 'in_x_tm_expiry'));

console.log('I2 a person on the presumptive scheme is not an audit case');
const INC = ['income'];
t('professional, receipts over Rs 50 lakh, presumptive: 31 August, no tax audit', () => {
  const r = run('KA', 'sole_prop', { in_resident: 'yes', in_biz_kind: 'prof', in_prof_50: 'yes', in_presumptive: 'yes' }, INC);
  has(r.ids, 'in_itr_biz'); lacks(r.ids, 'in_itr_biz_audit', 'in_tax_audit', 'in_tax_audit_tp');
  assert.equal(r.dates('in_itr_biz')[0], '2027-08-31');
});
t('trader, Rs 1 to 10 crore, cash over 5%, presumptive: 31 August, no tax audit', () => {
  const r = run('KA', 'sole_prop', { in_resident: 'yes', in_biz_kind: 'biz', in_turnover: 't2', in_cash5: 'yes', in_presumptive: 'yes' }, INC);
  has(r.ids, 'in_itr_biz'); lacks(r.ids, 'in_itr_biz_audit', 'in_tax_audit');
});
t('the same people not on the scheme are still audit cases (31 October, audit report 30 September)', () => {
  const r = run('KA', 'sole_prop', { in_resident: 'yes', in_biz_kind: 'prof', in_prof_50: 'yes', in_presumptive: 'no' }, INC);
  has(r.ids, 'in_itr_biz_audit', 'in_tax_audit'); lacks(r.ids, 'in_itr_biz');
  assert.equal(r.dates('in_tax_audit')[0], '2027-09-30');
  const firm = run('KA', 'firm', { in_biz_kind: 'biz', in_turnover: 't2', in_cash5: 'yes', in_presumptive: 'yes' }, INC);
  has(firm.ids, 'in_itr5'); lacks(firm.ids, 'in_itr5_audit', 'in_tax_audit');
});
t('"not sure" about the scheme shows both returns as "check", never one as certain', () => {
  const r = run('KA', 'sole_prop', { in_resident: 'yes', in_biz_kind: 'prof', in_prof_50: 'yes', in_presumptive: 'unsure' }, INC);
  assert.equal(r.get('in_itr_biz')?.certainty, 'check'); assert.equal(r.get('in_itr_biz_audit')?.certainty, 'check');
});
t('exactly one return applies on every path (person in business, firm, LLP, AOP, company, individual, HUF, trust)', () => {
  const yn = ['yes', 'no'];
  for (const entity of ['sole_prop', 'firm', 'llp', 'aop', 'pvt', 'opc', 'public']) for (const prof of ['biz', 'prof', 'both']) for (const p50 of yn) for (const turn of ['t1', 't2', 't3']) for (const cash of yn) for (const pres of yn) for (const other of yn) for (const tp of yn) for (const partner of entity === 'sole_prop' ? ['no', 'plain', 'audit'] : ['no']) for (const aopBiz of entity === 'aop' ? yn : ['yes']) {
    const want: Answers = { in_resident: 'yes', in_biz_kind: prof, in_prof_50: p50, in_turnover: turn, in_cash5: cash, in_presumptive: pres, in_audit_other: other, in_tp: tp, in_partner: partner === 'no' ? 'no' : 'yes', in_partner_audit: partner === 'audit' ? 'yes' : 'no', in_aop_business: aopBiz };
    const r = run('MH', entity, want, INC);
    // answers to questions this person is never asked are ignored by the engine: drop them so the label below is true
    const got = r.sure(/^in_itr/);
    assert.equal(got.length, 1, `${entity} ${JSON.stringify(Object.fromEntries(Object.entries(want).filter(([k]) => r.asked.includes(k))))}: ${got.join(' ') || 'no return'}`);
  }
  for (const entity of ['individual', 'huf']) for (const biz of yn) for (const partner of ['no', 'plain', 'audit']) for (const cap of yn) for (const res of yn) {
    const r = run('MH', entity, { in_income: 'yes', in_resident: res, in_business: biz, in_capgain: cap, in_partner: partner === 'no' ? 'no' : 'yes', in_partner_audit: partner === 'audit' ? 'yes' : 'no', in_biz_kind: 'biz', in_turnover: 't1' }, INC);
    assert.equal(r.sure(/^in_itr/).length, 1, `${entity} business ${biz} partner ${partner} capgain ${cap}: ${r.sure(/^in_itr/).join(' ') || 'no return'}`);
  }
  for (const sec8 of yn) for (const inc of yn) {
    const got = run('MH', 'trust', { in_np_sec8: sec8, in_np_income: inc }, INC).sure(/^in_itr/);
    assert.equal(got.length, sec8 === 'no' && inc === 'no' ? 0 : 1, `trust sec8 ${sec8} income ${inc}: ${got.join(' ')}`);
  }
});

console.log('I3 AOC-4, MGT-7, MGT-7A and ADT-1 are counted from the annual general meeting actually held');
const MCA = ['mca'];
t('a company is asked the date of the meeting; a One Person Company is not', () => {
  assert.ok(run('MH', 'pvt', {}, MCA).asked.includes('in_agm_date'));
  assert.ok(run('MH', 'public', {}, MCA).asked.includes('in_agm_date'));
  assert.ok(!run('MH', 'opc', {}, MCA).asked.includes('in_agm_date'));
  assert.equal(Q('in_agm_date').optional, true);
});
t('meeting on 14 August 2026: AOC-4 was due 13 September and MGT-7 13 October 2026, not 30 October and 29 November', () => {
  const r = run('MH', 'pvt', { in_agm_date: '2026-08-14', in_auditor: 'yes' }, MCA);
  assert.equal(r.get('in_aoc4')?.passed, '2026-09-13'); assert.equal(r.get('in_mgt7')?.passed, '2026-10-13'); assert.equal(r.get('in_adt1')?.passed, '2026-08-29');
  assert.deepEqual(r.dates('in_aoc4'), []);
});
t('meeting on 28 October 2026: AOC-4 27 November, MGT-7 27 December, ADT-1 12 November 2026', () => {
  const r = run('MH', 'pvt', { in_agm_date: '2026-10-28', in_auditor: 'yes' }, MCA);
  assert.deepEqual([r.dates('in_aoc4'), r.dates('in_mgt7'), r.dates('in_adt1')], [['2026-11-27'], ['2026-12-27'], ['2026-11-12']]);
  const small = run('MH', 'pvt', { in_agm_date: '2026-10-28', in_small_co: 'yes' }, MCA);
  assert.deepEqual(small.dates('in_mgt7a'), ['2026-12-27']); lacks(small.ids, 'in_mgt7', 'in_mgt7a_opc');
});
t('with no meeting date the row gives the rule, asks for the date, and says which date is the latest possible', () => {
  const r = run('MH', 'pvt', { in_auditor: 'yes' }, MCA);
  for (const id of ['in_aoc4', 'in_mgt7', 'in_adt1']) { assert.deepEqual(r.dates(id), [], id); assert.equal(r.get(id)?.needs, 'in_agm_date', id); assert.ok(r.get(id)?.rule, id); }
  assert.match(C('in_aoc4').dueText, /latest possible date is 30 October/); assert.match(C('in_mgt7').dueText, /latest possible date is 29 November/); assert.match(C('in_adt1').dueText, /latest possible date is 15 October/);
});

console.log('I4, I5, I27 tax collected at source: the dates on the rule pages that could be read');
const TDS = ['tds'];
t('TCS collected in March is paid by 7 April; TDS deducted in March by 30 April', () => {
  const tcs = run('MH', 'pvt', { in_tcs: 'yes' }, TDS, 'no', '2027-04-01');
  assert.equal(tcs.dates('in_tcs_deposit')[0], '2027-04-07'); lacks(tcs.ids, 'in_tds_deposit');
  const tdsOnly = run('MH', 'pvt', { in_employees: 'yes' }, TDS, 'no', '2027-04-01');
  assert.equal(tdsOnly.dates('in_tds_deposit')[0], '2027-04-30'); lacks(tdsOnly.ids, 'in_tcs_deposit');
  assert.equal(C('in_tcs_deposit').verified, false); assert.match(C('in_tcs_deposit').note ?? '', /could not be opened/);
});
t('the quarterly TCS statement shows the 15th, the date on the rule page, marked "to confirm"', () => {
  const r = run('MH', 'pvt', { in_tcs: 'yes' }, TDS);
  assert.deepEqual(r.dates('in_27eq'), ['2027-01-15', '2027-05-15']);
  assert.equal(r.get('in_27eq')?.verified, false); assert.match(C('in_27eq').note ?? '', /could not be opened/);
});
t('a collector is told about the TCS certificate (Form 27D)', () => {
  const r = run('MH', 'pvt', { in_tcs: 'yes' }, TDS);
  assert.deepEqual(r.dates('in_form27d'), ['2027-01-30', '2027-05-30']); assert.equal(C('in_form27d').verified, false);
});

console.log('I6 an AOP or BOI with no business income files by 31 July');
t('no business income: 31 July, and it is not asked about turnover or profession', () => {
  const r = run('MH', 'aop', { in_aop_business: 'no' }, INC);
  assert.deepEqual(r.sure(/^in_itr/), ['in_itr5_nobiz']); assert.equal(r.dates('in_itr5_nobiz')[0], '2027-07-31');
  for (const q of ['in_turnover', 'in_biz_kind', 'in_cash5', 'in_prof_50']) assert.ok(!r.asked.includes(q), `${q} asked`);
  lacks(r.ids, 'in_tax_audit');
});
t('with business income and no audit: 31 August; audited under another law: 31 October', () => {
  assert.equal(run('MH', 'aop', { in_aop_business: 'yes', in_biz_kind: 'biz', in_turnover: 't1' }, INC).dates('in_itr5')[0], '2027-08-31');
  assert.deepEqual(run('MH', 'aop', { in_aop_business: 'no', in_audit_other: 'yes' }, INC).sure(/^in_itr/), ['in_itr5_audit']);
});

console.log('I7 a Section 8 company has the filings of a company');
t('a Section 8 company gets the annual general meeting, AOC-4, MGT-7 and DIR-3 KYC; a trust or society gets none', () => {
  const s8 = run('MH', 'trust', { in_np_sec8: 'yes' }, MCA);
  has(s8.ids, 'in_agm', 'in_aoc4', 'in_mgt7', 'in_dir3'); lacks(s8.ids, 'in_mgt7a', 'in_mgt7a_opc', 'in_aoc4_opc');
  assert.deepEqual(run('MH', 'trust', { in_np_sec8: 'no' }, MCA).ids, []);
});
t('a Section 8 company files a return even with income below the exemption limit', () => {
  const r = run('MH', 'trust', { in_np_sec8: 'yes', in_np_income: 'no' }, INC);
  assert.deepEqual(r.sure(/^in_itr/), ['in_itr7_sec8']); assert.equal(r.dates('in_itr7_sec8')[0], '2026-11-21');
  assert.equal(C('in_itr7_sec8').verified, false);
});

console.log('I8 the GST annual return is not hidden from a taxpayer under Rs 2 crore');
const GSTD = ['gst'];
t('turnover up to Rs 2 crore: shown as "may be exempt, please confirm"; over Rs 2 crore: the return itself', () => {
  const small = run('MH', 'pvt', { in_gst_reg: 'yes', in_gst_scheme: 'regular_m', in_gst_2cr: 'no' }, GSTD);
  has(small.ids, 'in_gstr9_small'); lacks(small.ids, 'in_gstr9');
  assert.equal(small.get('in_gstr9_small')?.verified, false); assert.match(small.get('in_gstr9_small')!.name, /please confirm/);
  const big = run('MH', 'pvt', { in_gst_reg: 'yes', in_gst_scheme: 'regular_m', in_gst_2cr: 'yes' }, GSTD);
  has(big.ids, 'in_gstr9'); lacks(big.ids, 'in_gstr9_small');
});

console.log('I11 a public company is never a small company');
t('a public company is not asked, and files MGT-7', () => {
  const r = run('KA', 'public', { in_small_co: 'yes' }, MCA);
  assert.ok(!r.asked.includes('in_small_co')); has(r.ids, 'in_mgt7'); lacks(r.ids, 'in_mgt7a');
  assert.ok(run('KA', 'pvt', {}, MCA).asked.includes('in_small_co'));
});

console.log('I12, I13, I29 penalties as the Acts read today');
t('MGT-14: Rs 10,000 plus Rs 100 a day, up to Rs 2,00,000 (section 117(2))', () => {
  const pen = C('in_x_mgt14').penalty ?? '';
  assert.match(pen, /Rs 10,000 on the company, plus Rs 100 for each day/); assert.doesNotMatch(pen, /1,00,000 on the company|Rs 500 a day|2019/);
});
t('unspent CSR: twice the amount or Rs 1 crore, whichever is less (section 135(7))', () => {
  const pen = C('in_x_csr_unspent').penalty ?? '';
  assert.match(pen, /twice the amount .* Rs 1 crore, whichever is less/); assert.doesNotMatch(pen, /imprisonment|25,00,000/);
});
t('AOC-4, MGT-7, MGT-7A and the LLP forms state the penalty, not only "an additional fee"', () => {
  for (const id of ['in_aoc4', 'in_aoc4_opc', 'in_mgt7', 'in_mgt7a', 'in_mgt7a_opc']) assert.match(C(id).penalty ?? '', /Rs 10,000 .*Rs 100 .*Rs 2,00,000/, id);
  for (const id of ['in_llp11', 'in_llp8']) assert.match(C(id).penalty ?? '', /Rs 100 for each day .* Rs 1,00,000 for the LLP and Rs 50,000/, id);
  assert.equal(srcUrl(C('in_llp8').penaltySource ?? ''), 'https://indiacode.gov.in/handle/123456789/537638');
});

console.log('I14, I15, I31 what is marked confirmed is on the page it cites');
t('GST dates cite the CGST Rules and Notification 12/2024, which carry them', () => {
  for (const id of ['in_gstr3b', 'in_gstr3b_q22', 'in_gstr3b_q24', 'in_pmt06', 'in_cmp08']) assert.match(srcUrl(C(id).source), /cgst-rules-2017/, id);
  assert.match(srcUrl(C('in_gstr4').source), /central-tax-12-2024/);
});
t('items whose cited page lacks the date are "to confirm"', () => { for (const id of ['in_27eq', 'in_np_audit', 'in_tcs_deposit']) assert.equal(C(id).verified, false, id); });
t('penalties with no page are gone; the others name the page they were read on', () => {
  for (const id of ['in_tax_audit', 'in_tax_audit_tp', 'in_3ceb', 'in_sft']) assert.equal(C(id).penalty, undefined, id);
  for (const id of ['in_24q', 'in_26q', 'in_27q', 'in_27eq']) assert.match(srcUrl(C(id).penaltySource ?? ''), /tdscpc\.gov\.in/, id);
  for (const id of ['in_tds_deposit', 'in_tcs_deposit', 'in_advance', 'in_advance_presumptive']) assert.match(srcUrl(C(id).penaltySource ?? ''), /tax-payments/, id);
  for (const id of ['in_x_fla', 'in_x_fcgpr', 'in_x_llp1', 'in_x_fctrs', 'in_x_llp2', 'in_x_form_di', 'in_x_form_esop', 'in_x_ecb_lrn', 'in_x_ecb2']) { assert.match(srcUrl(C(id).penaltySource ?? ''), /rbi\.org\.in.*Id=12393/, id); assert.ok(C(id).penalty, id); }
  assert.equal((C('in_x_fla').penalty ?? '').match(/violation of FEMA/g)?.length, 1);
});
t('the charge, the commencement declaration and the wage dates cite the section itself on India Code', () => {
  for (const id of ['in_x_chg1', 'in_x_inc20a', 'in_x_wages_time']) assert.match(srcUrl(C(id).source), /^https:\/\/indiacode\.gov\.in\/handle\//, id);
});

console.log('I16 the date agrees with the sentence beside it');
t('a tax audit with a transfer pricing report is due 31 October, without one 30 September', () => {
  const tp = run('KA', 'pvt', { in_turnover: 't3', in_tp: 'yes' }, INC);
  assert.equal(tp.dates('in_tax_audit_tp')[0], '2027-10-31'); lacks(tp.ids, 'in_tax_audit');
  const plain = run('KA', 'pvt', { in_turnover: 't3', in_tp: 'no' }, INC);
  assert.equal(plain.dates('in_tax_audit')[0], '2027-09-30'); lacks(plain.ids, 'in_tax_audit_tp');
});
t('Schedule FA follows the person\'s own return date', () => {
  const FA = /^in_sched_fa/;
  const ind = run('KA', 'individual', { in_resident: 'yes', in_income: 'yes', in_foreign_assets: 'yes' }, INC);
  assert.deepEqual(ind.sure(FA), ['in_sched_fa']); assert.equal(ind.dates('in_sched_fa')[0], '2027-07-31');
  const biz = run('KA', 'sole_prop', { in_resident: 'yes', in_foreign_assets: 'yes', in_biz_kind: 'biz', in_turnover: 't1' }, INC);
  assert.deepEqual(biz.sure(FA), ['in_sched_fa_aug']); assert.equal(biz.dates('in_sched_fa_aug')[0], '2027-08-31');
  const aud = run('KA', 'sole_prop', { in_resident: 'yes', in_foreign_assets: 'yes', in_biz_kind: 'biz', in_turnover: 't3' }, INC);
  assert.deepEqual(aud.sure(FA), ['in_sched_fa_oct']); assert.equal(aud.dates('in_sched_fa_oct')[0], '2026-11-21');
  const tp = run('KA', 'sole_prop', { in_resident: 'yes', in_foreign_assets: 'yes', in_biz_kind: 'biz', in_turnover: 't1', in_tp: 'yes' }, INC);
  assert.deepEqual(tp.sure(FA), ['in_sched_fa_nov']); assert.equal(tp.dates('in_sched_fa_nov')[0], '2026-11-30');
  for (const id of ['in_sched_fa', 'in_sched_fa_aug', 'in_sched_fa_oct', 'in_sched_fa_nov']) assert.match(C(id).penalty ?? '', /Black Money Act/, id);
});
t('a person in business who is a partner of an audited firm files by 31 October', () => {
  const r = run('KA', 'sole_prop', { in_resident: 'yes', in_biz_kind: 'biz', in_turnover: 't1', in_partner: 'yes', in_partner_audit: 'yes' }, INC);
  assert.deepEqual(r.sure(/^in_itr/), ['in_itr_biz_audit']); lacks(r.ids, 'in_tax_audit');
});
t('a partner with no business of their own who sold shares gets the partner\'s return only', () => {
  const r = run('KA', 'individual', { in_resident: 'yes', in_income: 'yes', in_business: 'no', in_partner: 'yes', in_partner_audit: 'no', in_capgain: 'yes' }, INC);
  assert.deepEqual(r.sure(/^in_itr/), ['in_itr_partner']); assert.equal(r.dates('in_itr_partner')[0], '2027-08-31');
});
t('the partner of an audited firm cites section 263, not the one-year circular', () => assert.equal(C('in_itr_partner_audit').source, 's263'));

console.log('I17 words that are not one period for one starting day are not counted');
t('two periods for two cases, a period from a month end, a named date: no window', () => {
  for (const id of ['in_26qb', 'in_26qc', 'in_26qd', 'in_x_g_unpaid_div', 'in_dir3', 'in_x_g_rc_sell', 'in_x_export_realise', 'in_x_g_rc_death']) assert.equal(windowOf(C(id).due), null, id);
});
t('a patent renewal is counted from the date the person gives, never from the day it was last paid', () => assert.equal(windowOf(C('in_x_g_patent_renew').due)?.kind, 'until'));
t('the Delhi period for a vehicle after the owner\'s death is shown in Delhi only', () => {
  const dl = run('DL', 'individual', { in_x_g_veh_inherited: 'yes' }, ['personal']), ka = run('KA', 'individual', { in_x_g_veh_inherited: 'yes' }, ['personal']);
  has(dl.ids, 'in_x_g_rc_death_dl'); lacks(dl.ids, 'in_x_g_rc_death'); assert.equal(dl.get('in_x_g_rc_death_dl')?.window?.text, '30 days');
  has(ka.ids, 'in_x_g_rc_death'); lacks(ka.ids, 'in_x_g_rc_death_dl'); assert.equal(ka.get('in_x_g_rc_death')?.window, undefined);
});

console.log('I18 the workplace-harassment report has no date in the Act, so none is shown');
t('no 31 January; the rule in words', () => {
  const r = run('KA', 'pvt', { in_employees: 'yes', in_headcount: 'c' }, ['labour']);
  assert.deepEqual(r.dates('in_x_posh_report'), []); assert.match(r.get('in_x_posh_report')?.rule ?? '', /District Officer/); assert.equal(r.get('in_x_posh_report')?.window, undefined);
});

console.log('I19, I23 an HUF files ITR-2 and is not asked personal questions; "Use ITR-2" is not a filing of its own');
t('HUF: one return, ITR-2; not asked whether it is 60 or a director', () => {
  const r = run('KA', 'huf', { in_income: 'yes', in_resident: 'yes', in_advance: 'yes' }, INC);
  assert.deepEqual(r.sure(/^in_itr/), ['in_itr2']); assert.equal(r.get('in_itr2')?.form, 'ITR-2');
  assert.ok(!r.asked.includes('in_senior60') && !r.asked.includes('in_director'));
});
t('an individual gets one return row, whichever form applies', () => {
  const r = run('KA', 'individual', { in_income: 'yes', in_resident: 'yes', in_capgain: 'yes', in_director: 'yes' }, INC);
  assert.deepEqual(r.sure(/^in_itr/), ['in_itr_ind']);
  assert.ok(!p.compliances.some((c) => /^Use ITR-2/.test(c.name)));
});

console.log('I20 the CSR transfer applies only when an amount is left unspent');
t('over the CSR limits and fully spent: nothing; with an unspent amount: the transfer', () => {
  lacks(run('MH', 'pvt', { in_x_csr: 'yes', in_x_csr_short: 'no' }, MCA).ids, 'in_x_csr_unspent');
  has(run('MH', 'pvt', { in_x_csr: 'yes', in_x_csr_short: 'yes' }, MCA).ids, 'in_x_csr_unspent');
});

console.log('I21 one question for each event');
t('moved house only: the address report and nothing else', () => {
  const r = run('KA', 'individual', { in_x_g_vehicle: 'yes', in_x_g_veh_moved: 'yes' }, ['personal']);
  assert.deepEqual(r.ids.filter((i) => /_rc_(address|sell|buy|death)/.test(i)), ['in_x_g_rc_address']);
});
t('establishment closed: the closing report only', () => {
  const r = run('KA', 'pvt', { in_x_g_osh10: 'yes', in_x_g_osh_closed: 'yes' }, ['safety']);
  assert.deepEqual(r.ids.filter((i) => /_osh_(register|change|close)/.test(i)), ['in_x_g_osh_close']);
});
t('unclaimed dividend not yet seven years old: no transfer to the IEPF', () => {
  const r = run('KA', 'pvt', { in_x_g_dividend: 'yes', in_x_g_div7: 'no' }, MCA);
  has(r.ids, 'in_x_g_unpaid_div', 'in_x_g_iepf2'); lacks(r.ids, 'in_x_g_iepf1', 'in_x_g_iepf4');
});
t('a missed return and a correction are separate questions', () => {
  const m = run('KA', 'individual', { in_income: 'yes', in_missed: 'yes', in_revise: 'no' }, INC), c = run('KA', 'individual', { in_income: 'yes', in_missed: 'no', in_revise: 'yes' }, INC);
  has(m.ids, 'in_belated'); lacks(m.ids, 'in_revised'); has(c.ids, 'in_revised'); lacks(c.ids, 'in_belated');
});
t('a maker of plastic raw material is not shown the seller\'s report', () => {
  const r = run('KA', 'pvt', { in_x_g_plastic_raw: 'yes', in_x_g_plastic_seller: 'no' }, ['environment']);
  has(r.ids, 'in_x_g_plastic_raw_q'); lacks(r.ids, 'in_x_g_plastic_raw_seller');
});

console.log('I22 the OCI duties follow age, and a spouse has one duty');
t('20 or younger: upload; first passport after 20: re-issue; spouse: the spouse upload only', () => {
  const OCI = /_oci_/, base = { in_x_g_oci: 'yes', in_x_g_oci_newpp: 'yes' };
  assert.deepEqual(run('KA', 'individual', { ...base, in_x_g_oci_spouse: 'no', in_x_g_oci_case: 'u20' }, ['personal']).ids.filter((i) => OCI.test(i)), ['in_x_g_oci_upload']);
  assert.deepEqual(run('KA', 'individual', { ...base, in_x_g_oci_spouse: 'no', in_x_g_oci_case: 'first20' }, ['personal']).ids.filter((i) => OCI.test(i)), ['in_x_g_oci_reissue']);
  assert.deepEqual(run('KA', 'individual', { ...base, in_x_g_oci_spouse: 'yes', in_x_g_oci_case: 'none' }, ['personal']).ids.filter((i) => OCI.test(i)), ['in_x_g_oci_spouse']);
});

console.log('I24 answers that contradict each other cannot be given');
t('turnover over Rs 10 crore is not asked about the presumptive scheme', () => assert.ok(!run('KA', 'sole_prop', { in_resident: 'yes', in_biz_kind: 'biz', in_turnover: 't3' }, INC).asked.includes('in_presumptive')));
t('the manufacturer question is asked only of a food business', () => {
  assert.ok(!run('KA', 'pvt', { in_x_food: 'no' }, ['licences']).asked.includes('in_x_food_mfr'));
  assert.ok(run('KA', 'pvt', { in_x_food: 'yes' }, ['licences']).asked.includes('in_x_food_mfr'));
  lacks(run('KA', 'pvt', { in_x_food: 'no', in_x_food_mfr: 'yes' }, ['licences']).ids, 'in_x_fssai_return');
});

console.log('I25 a One Person Company is not asked about an annual general meeting');
t('the auditor question does not speak of a meeting; ADT-1 for an OPC is counted from the appointment', () => {
  assert.doesNotMatch(Q('in_auditor').text, /annual general meeting/);
  const r = run('KA', 'opc', { in_auditor: 'yes' }, MCA);
  has(r.ids, 'in_adt1_opc', 'in_mgt7a_opc', 'in_aoc4_opc'); lacks(r.ids, 'in_adt1', 'in_agm', 'in_mgt7a', 'in_aoc4');
  assert.equal(r.get('in_adt1_opc')?.window?.text, '15 days'); assert.deepEqual(r.dates('in_adt1_opc'), []);
  assert.equal(r.dates('in_mgt7a_opc')[0], '2026-11-29');
  assert.match(C('in_x_board_meetings').brief, /only one director is not required/);
});

console.log('I26 Delhi and Maharashtra shop rules are put to the same people');
t('an individual with a business and staff gets the shop rules in both', () => {
  has(run('DL', 'individual', { in_business: 'yes', in_employees: 'yes' }, ['labour']).ids, 'in_x_dl_shops_reg', 'in_x_dl_shops_change');
  has(run('MH', 'individual', { in_business: 'yes', in_employees: 'yes' }, ['labour']).ids, 'in_x_mh_shops_return', 'in_x_mh_shops_change');
  lacks(run('DL', 'individual', { in_business: 'no' }, ['labour']).ids, 'in_x_dl_shops_reg');
});

console.log('I28, I30 labels and placement');
t('belated and revised returns, and ADT-1, are "when it happens"; the statement of financial transactions sits under income tax', () => {
  for (const id of ['in_belated', 'in_revised', 'in_adt1', 'in_adt1_opc']) assert.equal(C(id).frequency, 'event', id);
  assert.equal(C('in_sft').dept, 'income'); assert.equal(Q('in_sft').step, 'income');
  has(run('KA', 'pvt', { in_sft: 'yes' }, INC).ids, 'in_sft'); lacks(run('KA', 'pvt', { in_sft: 'yes' }, TDS).ids, 'in_sft');
});

console.log('I10 the type descriptions say what is covered');
t('labour names the two States; safety and environment promise only what is listed', () => {
  const d = (id: string) => p.departments.find((x) => x.id === id)!.desc;
  assert.match(d('labour'), /Maharashtra and Delhi only/); assert.doesNotMatch(d('safety'), /safety returns and accident/i); assert.match(d('environment'), /consents are not listed/);
});

console.log(`\nreview_in: ${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
