// Review 26 (independent audit of 2026-11-13), the Canadian findings: questions (C1, C4-C9, M3, M4) and coverage
// (C1-C8). Each FIXED finding in docs/compliance-research/REVIEW26-CA.md is held here by its own reproduction.
// Run: node --experimental-strip-types tests/verify/review26_ca.ts
import assert from 'node:assert/strict';
import { packOf } from '../../src/lib/compliance/index.ts';
import { checkPack } from '../../src/lib/compliance/integrity.ts';
import { evaluate, unanswered, visibleQuestions } from '../../src/lib/compliance/engine.ts';
import type { Answers, Compliance, Result } from '../../src/lib/compliance/types.ts';

const T = '2026-11-13';
const p = packOf('CA')!;
let pass = 0, fail = 0;
const t = (name: string, fn: () => void) => { try { fn(); pass++; } catch (e) { fail++; console.log(`  FAIL  ${name}\n        ${(e as Error).message.split('\n').slice(0, 6).join('\n        ')}`); } };
const C = (id: string): Compliance => { const c = p.compliances.find((x) => x.id === id); assert.ok(c, `no compliance ${id}`); return c!; };
const Q = (id: string) => { const q = p.questions.find((x) => x.id === id); assert.ok(q, `no question ${id}`); return q!; };
const noQ = (id: string) => assert.ok(!p.questions.some((x) => x.id === id), `question ${id} should be gone`);
/** Answers given, every other question answered No (dates 2019-08-15, year end 31 December, choices their last option). */
function run(state: string, entity: string, want: Answers = {}, depts?: string[]) {
  const sel = { country: 'CA', state, entity, depts: depts ?? p.departments.map((d) => d.id) };
  const a: Answers = { ...want };
  for (let i = 0; i < 14; i++) for (const q of visibleQuestions(p, sel, a)) if (a[q.id] === undefined) a[q.id] = q.type === 'yn' ? 'no' : q.type === 'multi' ? ['none'] : q.type === 'date' ? '2019-08-15' : q.type === 'monthday' ? '12-31' : q.options?.[q.options.length - 1]?.v ?? '';
  const res = evaluate(p, sel, a, T);
  const get = (id: string): Result | undefined => res.find((r) => r.id === id);
  return { res, a, sel, get, dates: (id: string) => (get(id)?.next ?? []).map((n) => n.date), ids: res.map((r) => r.id), asked: visibleQuestions(p, sel, a).map((q) => q.id) };
}
const has = (r: { ids: string[] }, ...ids: string[]) => { for (const id of ids) assert.ok(r.ids.includes(id), `expected ${id}; got ${r.ids.join(' ')}`); };
const lacks = (r: { ids: string[] }, ...ids: string[]) => { for (const id of ids) assert.ok(!r.ids.includes(id), `did not expect ${id}`); };
const asks = (r: { asked: string[] }, ...ids: string[]) => { for (const id of ids) assert.ok(r.asked.includes(id), `expected question ${id} to be asked`); };
const skips = (r: { asked: string[] }, ...ids: string[]) => { for (const id of ids) assert.ok(!r.asked.includes(id), `question ${id} should not be asked`); };

console.log('review26_ca: the pack is sound');
t('the country passes the structure check', () => assert.deepEqual(checkPack(p), []));

console.log('Q-C1 the year end and the incorporation date may be left blank');
t('both are optional, and a blank one leaves its dates "still needed" instead of blocking the form', () => {
  assert.equal(Q('fye').optional, true); assert.equal(Q('ca_inc_date').optional, true);
  const r = run('ON', 'corporation', { fye: '', ca_inc_date: '', ca_federal: 'yes' }, ['income', 'registry']);
  assert.deepEqual(unanswered(p, r.sel, r.a).map((q) => q.id), []);
  assert.equal(r.get('ca_t2')!.needs, 'fye'); assert.equal(r.get('ca_corpcan')!.needs, 'ca_inc_date');
});

console.log('Q-C4 a spouse\'s business no longer makes the person a seller');
t('the old combined question is gone (a saved answer to it is not read with the new meaning)', () => noQ('ca_selfemp'));
t('the spouse runs the business: the June 15 return, and no sales-tax questions or items', () => {
  const r = run('ON', 'individual', { ca_resident: 'yes', ca_biz_own: 'no', ca_biz_spouse: 'yes' }, ['income', 'sales']);
  has(r, 'ca_t1_se', 'ca_t1_pay'); lacks(r, 'ca_t1', 'ca_gst_register');
  skips(r, 'ca_gst_reg', 'ca_over30k', 'ca_taxi', 'ca_sell_prov');
  assert.equal(r.dates('ca_t1_se')[0], '2027-06-15');
});
t('the person runs the business: asked about GST/HST; the spouse question is then not needed', () => {
  const r = run('ON', 'individual', { ca_resident: 'yes', ca_biz_own: 'yes' }, ['income', 'sales']);
  asks(r, 'ca_gst_reg', 'ca_over30k', 'ca_sell_prov'); skips(r, 'ca_biz_spouse'); has(r, 'ca_t1_se');
});
t('neither: the April 30 return', () => {
  const r = run('ON', 'individual', { ca_resident: 'yes', ca_employment: 'yes' }, ['income']);
  has(r, 'ca_t1'); lacks(r, 'ca_t1_se'); asks(r, 'ca_biz_own', 'ca_biz_spouse');
});

console.log('Q-C5 a non-profit is asked whether it is incorporated before whether it is federal');
t('ca_npo_corp comes first; a non-profit that is not incorporated is never asked ca_federal', () => {
  const yes = run('ON', 'nonprofit', { ca_npo_corp: 'yes' }, ['income', 'registry']).asked;
  assert.ok(yes.indexOf('ca_npo_corp') >= 0 && yes.indexOf('ca_npo_corp') < yes.indexOf('ca_federal'), yes.join(' '));
  skips(run('ON', 'nonprofit', { ca_npo_corp: 'no' }, ['income', 'registry']), 'ca_federal');
  const ids = p.questions.map((q) => q.id); assert.ok(ids.indexOf('ca_npo_corp') < ids.indexOf('ca_federal'));
});

console.log('Q-C6 legal conclusions now say what the term means and how to tell');
t('private company, listed trust and money services business', () => {
  assert.match(Q('ca_x_private').help ?? '', /reporting issuer under provincial securities law/);
  assert.match(Q('ca_x_private').help ?? '', /wholly-owned subsidiary/);
  assert.match(Q('ca_trust_listed').help ?? '', /less than three months/); assert.match(Q('ca_trust_listed').help ?? '', /\$50,000 or less throughout the year/);
  assert.match(Q('ca_trust_listed').help ?? '', /2\.3\.C/); assert.match(Q('ca_trust_listed').help ?? '', /graduated rate estates/);
  for (const w of [/foreign exchange dealing/, /remitting or transmitting funds/, /money orders, traveller's cheques/, /virtual currencies/]) assert.match(Q('ca_x_msb').help ?? '', w);
});

console.log('Q-C7 double-barrelled questions');
t('Investment Canada: two questions, the notice only when both are Yes', () => {
  noQ('ca_x_noncdn');
  has(run('ON', 'corporation', { ca_x_noncdn_owned: 'yes', ca_x_noncdn_new: 'yes' }, ['trade']), 'ca_x_ica_notice');
  lacks(run('ON', 'corporation', { ca_x_noncdn_owned: 'yes', ca_x_noncdn_new: 'no' }, ['trade']), 'ca_x_ica_notice');
  const no = run('ON', 'corporation', { ca_x_noncdn_owned: 'no' }, ['trade']); skips(no, 'ca_x_noncdn_new'); lacks(no, 'ca_x_ica_notice');
});
t('Federal Contractors Program: 100 permanent employees, then the $1 million bids', () => {
  noQ('ca_x_g_fcp');
  const both = run('ON', 'corporation', { ca_employees: 'yes', ca_x_emp_band: 'e100', ca_x_g_fcp_100: 'yes', ca_x_g_fcp_bid: 'yes' }, ['labour']);
  has(both, 'ca_x_g_fcp_aiee');
  lacks(run('ON', 'corporation', { ca_employees: 'yes', ca_x_emp_band: 'e100', ca_x_g_fcp_100: 'yes', ca_x_g_fcp_bid: 'no' }, ['labour']), 'ca_x_g_fcp_aiee');
  skips(run('ON', 'corporation', { ca_employees: 'yes', ca_x_emp_band: 'e100', ca_x_g_fcp_100: 'no' }, ['labour']), 'ca_x_g_fcp_bid');
});
t('the conjunctions that must stay one question say: Yes only if both parts are true', () => {
  for (const id of ['ca_sbd', 'ca_corp_instal', 'ca_gst_instal', 'ca_owing', 'ca_construction']) assert.match(Q(id).help ?? '', /Answer Yes only if/, id);
});

console.log('Q-C8 an earlier answer that decides a later question hides it');
t('1 to 5 employees: never asked about 100 permanent employees, and no Federal Contractors Program item', () => {
  const r = run('ON', 'corporation', { ca_employees: 'yes', ca_x_emp_band: 'e1' }, ['labour']);
  skips(r, 'ca_x_g_fcp_100', 'ca_x_g_fcp_bid'); lacks(r, 'ca_x_g_fcp_aiee', 'ca_x_on_jhsc');
});
t('a CCPC is private: not asked ca_x_private, and keeps the register items', () => {
  const fed = run('ON', 'corporation', { ca_ccpc: 'yes', ca_federal: 'yes' }, ['income', 'registry']);
  skips(fed, 'ca_x_private'); has(fed, 'ca_x_isc_change');
  const on = run('ON', 'corporation', { ca_ccpc: 'yes', ca_federal: 'no' }, ['income', 'registry']); skips(on, 'ca_x_private'); has(on, 'ca_x_on_isc');
  const bc = run('BC', 'corporation', { ca_ccpc: 'yes', ca_federal: 'no' }, ['income', 'registry']); has(bc, 'ca_x_bc_transparency');
  const pub = run('ON', 'corporation', { ca_ccpc: 'no', ca_x_private: 'no', ca_federal: 'no' }, ['income', 'registry']); asks(pub, 'ca_x_private'); lacks(pub, 'ca_x_on_isc');
});
t('a money services business is not asked the sector question, and keeps every FINTRAC report', () => {
  const ids = p.questions.map((q) => q.id); assert.ok(ids.indexOf('ca_x_msb') < ids.indexOf('ca_x_fintrac'));
  const r = run('ON', 'corporation', { ca_x_msb: 'yes' }, ['aml']);
  skips(r, 'ca_x_fintrac'); has(r, 'ca_x_fintrac_lctr', 'ca_x_fintrac_str', 'ca_x_fintrac_review', 'ca_x_fintrac_msb', 'ca_x_fintrac_eft');
  const other = run('ON', 'corporation', { ca_x_msb: 'no', ca_x_fintrac: 'yes' }, ['aml']); asks(other, 'ca_x_fintrac'); has(other, 'ca_x_fintrac_lctr'); lacks(other, 'ca_x_fintrac_msb');
  asks(run('ON', 'nonprofit', {}, ['aml']), 'ca_x_fintrac');
});

console.log('Q-C9 the FINTRAC reason agrees with the answers');
t('the reason names a money services business as well as the other sectors', () => {
  for (const id of ['ca_x_fintrac_lctr', 'ca_x_fintrac_str', 'ca_x_fintrac_review']) assert.match(C(id).why, /money services business, or the business is in another sector/, id);
  assert.match(run('ON', 'corporation', { ca_x_msb: 'yes' }, ['aml']).get('ca_x_fintrac_lctr')!.why, /money services business/);
});

console.log('Q-M3 the province question says the corporation\'s own province is already counted');
t('wording and help', () => { assert.match(Q('ca_pe').text, /apart from the province you chose above/); assert.match(Q('ca_pe').help ?? '', /already counted/); });

console.log('Q-M4 questions that had no help now have it');
t('the ten Canadian questions', () => {
  for (const id of ['ca_npo_income', 'ca_employment', 'ca_rental', 'ca_invest', 'ca_request', 'ca_nrtrust_d', 'ca_contractors', 'ca_grants', 'ca_construction', 'ca_dividends']) assert.ok((Q(id).help ?? '').length > 20, id);
});

console.log('Cov-C1 the CRA payroll program account');
t('every employer is shown it, with the rule in words', () => {
  for (const [st, ent] of [['ON', 'corporation'], ['QC', 'sole_prop'], ['BC', 'individual']]) has(run(st, ent, { ca_employees: 'yes' }, ['payroll']), 'ca_x_payroll_account');
  lacks(run('ON', 'corporation', { ca_employees: 'no' }, ['payroll']), 'ca_x_payroll_account');
  const c = C('ca_x_payroll_account'); assert.equal(c.verified, true); assert.match(c.dueText, /before the first remittance due date/);
  assert.deepEqual(run('ON', 'corporation', { ca_employees: 'yes' }, ['payroll']).dates('ca_x_payroll_account'), []);
});

console.log('Cov-C2 the Manitoba and New Brunswick yearly payroll reports');
t('Manitoba: before the last day of February (shown the day before it)', () => {
  assert.deepEqual(run('MB', 'corporation', { ca_employees: 'yes' }, ['payroll']).dates('ca_x_mb_wcb_payroll'), ['2027-02-27', '2028-02-28']);
  lacks(run('ON', 'corporation', { ca_employees: 'yes' }, ['payroll']), 'ca_x_mb_wcb_payroll');
});
t('New Brunswick: Form 100 by February 28', () => {
  assert.deepEqual(run('NB', 'corporation', { ca_employees: 'yes' }, ['payroll']).dates('ca_x_nb_wsnb_payroll'), ['2027-02-28', '2028-02-28']);
  assert.equal(C('ca_x_nb_wsnb_payroll').verified, true);
});

console.log('Cov-C3 Nova Scotia: a registered business name or partnership renews every year');
t('in its anniversary month, counted from the registration date', () => {
  const r = run('NS', 'sole_prop', { ca_bizname: 'yes', ca_x_ns_reg_date: '2019-08-15' }, ['registry']);
  assert.deepEqual(r.dates('ca_x_ns_bizname_renew'), ['2027-08-31', '2028-08-31']);
  assert.equal(run('NS', 'partnership', { ca_bizname: 'yes', ca_x_ns_reg_date: '' }, ['registry']).get('ca_x_ns_bizname_renew')!.needs, 'ca_x_ns_reg_date');
  lacks(run('NS', 'sole_prop', { ca_bizname: 'no' }, ['registry']), 'ca_x_ns_bizname_renew');
});

console.log('Cov-C4 and C8 telling the CRA about a change');
t('a change of marital status: by the end of the following month', () => {
  const r = run('ON', 'individual', { ca_x_g_marital: 'yes' }, ['personal']); has(r, 'ca_x_g_marital_tell');
  assert.match(r.get('ca_x_g_marital_tell')!.rule ?? C('ca_x_g_marital_tell').due.t, /end of the month after/);
  lacks(run('ON', 'corporation', {}, ['personal']), 'ca_x_g_marital_tell');
});
t('a Canada child benefit recipient: as soon as possible', () => {
  has(run('QC', 'individual', { ca_x_g_ccb: 'yes' }, ['personal']), 'ca_x_g_ccb_changes');
  lacks(run('QC', 'individual', { ca_x_g_ccb: 'no' }, ['personal']), 'ca_x_g_ccb_changes');
  assert.match(C('ca_x_g_ccb_changes').dueText, /as soon as possible/);
});

console.log('Cov-C5 Newfoundland and Labrador payroll tax');
t('over $2 million: monthly returns 20 days after each month, marked to confirm', () => {
  const r = run('NL', 'corporation', { ca_employees: 'yes', ca_x_nl_payroll2m: 'yes' }, ['payroll']);
  assert.deepEqual(r.dates('ca_x_nl_hapset'), ['2026-11-20', '2026-12-20']); assert.equal(r.get('ca_x_nl_hapset')!.verified, false);
  lacks(run('NL', 'corporation', { ca_employees: 'yes', ca_x_nl_payroll2m: 'no' }, ['payroll']), 'ca_x_nl_hapset');
  skips(run('ON', 'corporation', { ca_employees: 'yes' }, ['payroll']), 'ca_x_nl_payroll2m');
});

console.log('Cov-C6 payments to non-residents for services in Canada');
t('the 15% remittance by the 15th and the T4A-NR by the last day of February', () => {
  const r = run('ON', 'corporation', { ca_x_nr_services: 'yes' }, ['payroll']);
  assert.equal(r.dates('ca_x_nr_services_remit')[0], '2026-11-15'); assert.equal(r.dates('ca_x_t4a_nr')[0], '2027-02-28');
  lacks(run('ON', 'corporation', { ca_x_nr_services: 'no' }, ['payroll']), 'ca_x_t4a_nr', 'ca_x_nr_services_remit');
});

console.log('Cov-C7 more than 5 slips are filed electronically');
t('asked only of someone who files slips; shown with the penalty for paper', () => {
  has(run('ON', 'corporation', { ca_employees: 'yes', ca_x_slips5: 'yes' }, ['payroll']), 'ca_x_slips_efile');
  skips(run('ON', 'corporation', { ca_employees: 'no' }, ['payroll']), 'ca_x_slips5');
  assert.match(C('ca_x_slips_efile').penalty ?? '', /\$125 for 6 to 50 slips/);
});

console.log('every new item cites an official page and keeps its stated date');
t('ten new compliances, each with its source', () => {
  const ids = ['ca_x_payroll_account', 'ca_x_mb_wcb_payroll', 'ca_x_nb_wsnb_payroll', 'ca_x_ns_bizname_renew', 'ca_x_nl_hapset', 'ca_x_nr_services_remit', 'ca_x_t4a_nr', 'ca_x_slips_efile', 'ca_x_g_marital_tell', 'ca_x_g_ccb_changes'];
  for (const id of ids) { const c = C(id); const s = p.sources.find((x) => x.id === c.source); assert.ok(s && /^https:\/\/(www\.)?(canada\.ca|wcb\.mb\.ca|worksafenb\.ca|novascotia\.ca|gov\.nl\.ca)\//.test(s.url), id); assert.equal(c.roll, false, id); }
});

console.log(`\nreview26_ca: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
