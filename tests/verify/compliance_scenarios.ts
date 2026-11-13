// Named situations: what a real person in this position must file, per the official sources.
import assert from 'node:assert/strict';
import { t, fill, selOf, find, absent, TODAY, packOf, evaluate } from './compliance_engine.ts';

console.log('situations');
const US = packOf('US')!;
t('US: an employee below nothing special files Form 1040 by April 15', () => {
  const sel = selOf(US, 'NY', 'individual');
  const r = evaluate(US, sel, fill(US, sel, 'no', { us_status: 'yes', us_income_over: 'yes' }), TODAY);
  assert.equal(find(r, 'us_1040').next[0].date, '2027-04-15');
  absent(r, 'us_fbar'); absent(r, 'us_1040es'); absent(r, 'us_941');
});
t('US: living abroad moves the return to June 15 and foreign accounts bring the FBAR', () => {
  const sel = selOf(US, 'NY', 'individual');
  const r = evaluate(US, sel, fill(US, sel, 'no', { us_status: 'yes', us_abroad: 'yes', us_foreign_acct: 'yes' }), TODAY);
  assert.equal(find(r, 'us_1040_abroad').next[0].date, '2027-06-15'); absent(r, 'us_1040');
  assert.equal(find(r, 'us_fbar').next[0].date, '2027-04-15');
});
t('US: a foreign-owned single-member LLC must file Form 5472 with a pro forma 1120', () => {
  const sel = selOf(US, 'WY', 'foreign_llc');
  const r = evaluate(US, sel, fill(US, sel, 'no', { us_fdre_tx: 'yes' }), TODAY);
  assert.equal(find(r, 'us_5472_dre').next[0].date, '2027-04-15'); absent(r, 'us_1120'); absent(r, 'us_1040');
});
t('US: a C corporation with a June year end and employees', () => {
  const sel = selOf(US, 'DE', 'ccorp');
  const r = evaluate(US, sel, fill(US, sel, 'no', { fye: '06-30', us_employees: 'yes', us_deposit: 'monthly', us_944: 'no', us_corp_est: 'yes' }), TODAY);
  assert.equal(find(r, 'us_1120').next[0].date, '2027-10-15');
  assert.equal(find(r, 'us_941').next[0].date, '2027-02-01');          // 31 January 2027 is a Sunday
  assert.equal(find(r, 'us_deposit_m').next[0].date, '2026-11-16');   // 15 November 2026 is a Sunday
  assert.equal(find(r, 'us_corp_est').next[0].date, '2026-12-15');
  find(r, 'us_940'); find(r, 'us_w2'); absent(r, 'us_944'); absent(r, 'us_1065');
});
t('US: a partnership files Form 1065 by March 15; an S corporation Form 1120-S', () => {
  const p = selOf(US, 'TX', 'partnership');
  assert.equal(find(evaluate(US, p, fill(US, p, 'no', { fye: '12-31' }), TODAY), 'us_1065').next[0].date, '2027-03-15');
  const s = selOf(US, 'TX', 'scorp');
  const r = evaluate(US, s, fill(US, s, 'no', { fye: '12-31' }), TODAY);
  assert.equal(find(r, 'us_1120s').next[0].date, '2027-03-15'); absent(r, 'us_1120');
});
t('US: a small charity files the e-Postcard, a large one Form 990', () => {
  const sel = selOf(US, 'CA', 'nonprofit');
  find(evaluate(US, sel, fill(US, sel, 'no', { fye: '12-31', us_np_size: 'small' }), TODAY), 'us_990n');
  const big = evaluate(US, sel, fill(US, sel, 'no', { fye: '06-30', us_np_size: 'large' }), TODAY);
  assert.equal(find(big, 'us_990').next[0].date, '2026-11-16'); absent(big, 'us_990n');   // 15th day of the 5th month after 30 June, a Sunday
});

// ── US states ──
t('US states: a Delaware corporation files its report and franchise tax by March 1; a Delaware LLC pays its tax by June 1', () => {
  let sel = selOf(US, 'DE', 'ccorp');
  let r = evaluate(US, sel, fill(US, sel, 'no', { fye: '12-31', us_st_formed: 'here' }), TODAY);
  assert.equal(find(r, 'us_ar_de_corp_here').next[0].date, '2027-03-01'); absent(r, 'us_ar_de_llc');
  sel = selOf(US, 'DE', 'foreign_llc');
  r = evaluate(US, sel, fill(US, sel, 'no'), TODAY);
  assert.equal(find(r, 'us_ar_de_llc').next[0].date, '2027-06-01'); absent(r, 'us_ar_de_corp_here');
});
t('US states: a Wyoming LLC reports on the first day of its anniversary month, shown as stated even on a Saturday', () => {
  const sel = selOf(US, 'WY', 'foreign_llc');
  const r = evaluate(US, sel, fill(US, sel, 'no', { us_st_date: '2022-05-05' }), TODAY);
  assert.equal(find(r, 'us_ar_wy_both').next[0].date, '2027-05-01');
});
t('US states: Texas has no personal return; a small Texas LLC still files the information report on May 15', () => {
  let sel = selOf(US, 'TX', 'individual');
  let r = evaluate(US, sel, fill(US, sel, 'no', { us_status: 'yes', us_income_over: 'yes' }), TODAY);
  absent(r, 'us_st_pit'); find(r, 'us_1040');
  sel = selOf(US, 'TX', 'partnership');
  r = evaluate(US, sel, fill(US, sel, 'no', { fye: '12-31', us_is_llc: 'yes' }), TODAY);
  assert.equal(find(r, 'us_tx_pir').next[0].date, '2027-05-17'); absent(r, 'us_tx_fr');           // 15 May 2027 is a Saturday
});
t('US states: a California LLC owes the $800 tax by the 15th day of the 4th month of its year; New York LLCs report every two years', () => {
  let sel = selOf(US, 'CA', 'partnership');
  let r = evaluate(US, sel, fill(US, sel, 'no', { fye: '12-31', us_is_llc: 'yes', us_st_date: '2021-09-10' }), TODAY);
  assert.equal(find(r, 'us_ca_llc_tax').next[0].date, '2027-04-15');
  assert.equal(find(r, 'us_ar_ca_llc').next[0].date, '2027-09-30');                               // 2021 + 6 years
  sel = selOf(US, 'NY', 'ccorp');
  r = evaluate(US, sel, fill(US, sel, 'no', { fye: '12-31', us_st_date: '2022-02-10' }), TODAY);
  assert.equal(find(r, 'us_ar_ny_both').next[0].date, '2028-02-29');                              // even years after 2022
});

// ── Canada ──
const CA = packOf('CA')!;
t('Canada: an employee files by April 30; nothing for the self-employed applies', () => {
  const sel = selOf(CA, 'ON', 'individual');
  const r = evaluate(CA, sel, fill(CA, sel, 'no', { ca_resident: 'yes', ca_employment: 'yes' }), TODAY);
  assert.equal(find(r, 'ca_t1').next[0].date, '2027-04-30'); absent(r, 'ca_t1_se'); absent(r, 'ca_instal'); absent(r, 'ca_tp1');
});
t('Canada: self-employed people file June 15 but pay April 30, and a yearly GST/HST filer pays April 30 too', () => {
  const sel = selOf(CA, 'ON', 'sole_prop');
  const r = evaluate(CA, sel, fill(CA, sel, 'no', { ca_resident: 'yes', ca_gst_reg: 'yes', ca_gst_freq: 'a' }), TODAY);
  assert.equal(find(r, 'ca_t1_se').next[0].date, '2027-06-15');
  assert.equal(find(r, 'ca_t1_pay').next[0].date, '2027-04-30');
  assert.equal(find(r, 'ca_gst_a_sp').next[0].date, '2027-04-30'); absent(r, 'ca_t1');
});
t('Canada: a small Ontario CCPC with staff (December year end)', () => {
  const sel = selOf(CA, 'ON', 'corporation');
  const r = evaluate(CA, sel, fill(CA, sel, 'no', { fye: '12-31', ca_ccpc: 'yes', ca_sbd: 'yes', ca_pe: ['none'], ca_sell_prov: ['none'], ca_gst_reg: 'yes', ca_gst_freq: 'q', ca_employees: 'yes', ca_remit: 'r', ca_payroll_size: 'p1', ca_inc_date: '2020-03-15' }), TODAY);
  assert.equal(find(r, 'ca_t2').next[0].date, '2027-06-30');
  assert.equal(find(r, 'ca_t2_balance3').next[0].date, '2027-03-31'); absent(r, 'ca_t2_balance');
  assert.equal(find(r, 'ca_ar_on').next[0].date, '2027-06-30');
  assert.equal(find(r, 'ca_remit_r').next[0].date, '2026-11-16');     // 15 November 2026 is a Sunday
  assert.equal(find(r, 'ca_t4').next[0].date, '2027-03-01');          // 28 February 2027 is a Sunday
  assert.equal(find(r, 'ca_gst_q').next[0].date, '2027-02-01');       // 31 January 2027 is a Sunday
  absent(r, 'ca_at1'); absent(r, 'ca_co17'); absent(r, 'ca_on_eht'); absent(r, 'ca_corpcan');
});
t('Canada: a federal corporation files with Corporations Canada 60 days after its anniversary, not with the province', () => {
  const sel = selOf(CA, 'ON', 'corporation');
  const r = evaluate(CA, sel, fill(CA, sel, 'no', { fye: '12-31', ca_federal: 'yes', ca_inc_date: '2020-03-15', ca_pe: ['none'], ca_sell_prov: ['none'] }), TODAY);
  assert.equal(find(r, 'ca_corpcan').next[0].date, '2027-05-14'); absent(r, 'ca_ar_on');
});
t('Canada: each province counts its annual return its own way', () => {
  const at = (st: string, inc: string, id: string) => { const sel = selOf(CA, st, 'corporation'); return find(evaluate(CA, sel, fill(CA, sel, 'no', { fye: '12-31', ca_inc_date: inc, ca_pe: ['none'], ca_sell_prov: ['none'] }), TODAY), id).next[0].date; };
  assert.equal(at('BC', '2021-08-20', 'ca_ar_bc'), '2027-10-20');     // two months after the anniversary
  assert.equal(at('AB', '2019-05-07', 'ca_ar_ab'), '2027-06-30');     // last day of the following month
  assert.equal(at('NL', '2019-05-07', 'ca_ar_nl'), '2027-05-31');     // end of the anniversary month itself
  assert.equal(at('PE', '2019-05-07', 'ca_ar_pe'), '2027-07-06');     // 60 days after the anniversary
  assert.equal(at('QC', '2019-05-07', 'ca_ar_qc'), '2026-11-15');     // 15 November
});
t('Canada: a mixed partnership files on the earlier of March 31 and five months after its year end; a trust within 90 days', () => {
  let sel = selOf(CA, 'ON', 'partnership');
  let r = evaluate(CA, sel, fill(CA, sel, 'no', { fye: '06-30', ca_partners: 'mixed', ca_sell_prov: ['none'] }), TODAY);
  assert.equal(find(r, 'ca_t5013_m').next[0].date, '2026-11-30');
  r = evaluate(CA, sel, fill(CA, sel, 'no', { fye: '12-31', ca_partners: 'mixed', ca_sell_prov: ['none'] }), TODAY);
  assert.equal(find(r, 'ca_t5013_m').next[0].date, '2027-03-31');
  sel = selOf(CA, 'ON', 'trust');
  r = evaluate(CA, sel, fill(CA, sel, 'no', { ca_trust_express: 'yes', ca_sell_prov: ['none'] }), TODAY);
  assert.equal(find(r, 'ca_t3').next[0].date, '2027-03-31'); find(r, 'ca_sched15');
});
t('Canada: foreign property over $100,000 brings the T1135 on the return date', () => {
  const sel = selOf(CA, 'BC', 'individual');
  const r = evaluate(CA, sel, fill(CA, sel, 'no', { ca_resident: 'yes', ca_employment: 'yes', ca_foreign_prop: 'yes' }), TODAY);
  assert.equal(find(r, 'ca_t1135').next[0].date, '2027-04-30'); absent(r, 'ca_t1135_se'); absent(r, 'ca_t1135_corp');
});

// ── India ──
const IN = packOf('IN')!;
t('India: a salaried person files by 31 July; dates are not moved off a Saturday', () => {
  const sel = selOf(IN, 'DL', 'individual');
  const r = evaluate(IN, sel, fill(IN, sel, 'no', { in_resident: 'yes', in_income: 'yes' }), TODAY);
  assert.equal(find(r, 'in_itr_ind').next[0].date, '2027-07-31'); absent(r, 'in_itr_biz'); absent(r, 'in_advance');
});
t('India: a private company gets the extended 21 November 2026 date, deposits TDS on the 7th and files GST monthly', () => {
  const sel = selOf(IN, 'MH', 'pvt');
  const r = evaluate(IN, sel, fill(IN, sel, 'no', { in_employees: 'yes', in_headcount: 'c', in_gst_reg: 'yes', in_gst_scheme: 'regular_m', in_advance: 'yes' }), TODAY);
  assert.equal(find(r, 'in_itr6_audit').next[0].date, '2026-11-21');
  assert.equal(find(r, 'in_itr6_audit').next[1].date, '2027-10-31');
  assert.equal(find(r, 'in_tds_deposit').next[0].date, '2026-12-07');
  assert.equal(find(r, 'in_24q').next[0].date, '2027-01-31');
  assert.equal(find(r, 'in_gstr3b').next[0].date, '2026-11-20');
  assert.equal(find(r, 'in_gstr1').next[0].date, '2026-11-11');
  assert.equal(find(r, 'in_advance').next[0].date, '2026-12-15');
  assert.equal(find(r, 'in_pf').next[0].date, '2026-11-15'); find(r, 'in_esi'); absent(r, 'in_itr6_tp');
});
t('India: TDS deducted in March is due 30 April, not the 7th', () => {
  const sel = selOf(IN, 'MH', 'pvt');
  const r = evaluate(IN, sel, fill(IN, sel, 'no', { in_employees: 'yes', in_headcount: 'a' }), '2027-04-08');
  assert.equal(find(r, 'in_tds_deposit').next[0].date, '2027-04-30');
});
t('India: quarterly GST filers are due the 22nd or 24th by State, and pay monthly only for the first two months', () => {
  const at = (st: string) => { const sel = selOf(IN, st, 'sole_prop'); return evaluate(IN, sel, fill(IN, sel, 'no', { in_resident: 'yes', in_gst_reg: 'yes', in_gst_scheme: 'regular_q' }), TODAY); };
  assert.equal(find(at('MH'), 'in_gstr3b_q22').next[0].date, '2027-01-22'); absent(at('MH'), 'in_gstr3b_q24');
  assert.equal(find(at('DL'), 'in_gstr3b_q24').next[0].date, '2027-01-24');
  assert.deepEqual(find(at('DL'), 'in_pmt06').next.map((d) => d.date), ['2026-11-25', '2026-12-25']);
});
t('India: a proprietor without audit files 31 August; with turnover over Rs 10 crore the audit dates apply', () => {
  const sel = selOf(IN, 'KA', 'sole_prop');
  let r = evaluate(IN, sel, fill(IN, sel, 'no', { in_resident: 'yes' }), TODAY);
  assert.equal(find(r, 'in_itr_biz').next[0].date, '2027-08-31'); absent(r, 'in_tax_audit');
  r = evaluate(IN, sel, fill(IN, sel, 'no', { in_resident: 'yes', in_turnover: 't3' }), TODAY);
  assert.equal(find(r, 'in_itr_biz_audit').next[0].date, '2026-11-21');
  assert.equal(find(r, 'in_tax_audit').next[0].date, '2027-09-30'); absent(r, 'in_itr_biz');
});

// ── UAE ──
const AE = packOf('AE')!;
t('UAE: an employee has no income tax, only the unemployment insurance', () => {
  const sel = selOf(AE, 'DU', 'individual');
  const r = evaluate(AE, sel, fill(AE, sel, 'no', { ae_employed: 'yes' }), TODAY);
  find(r, 'ae_iloe'); absent(r, 'ae_ct_return'); absent(r, 'ae_vat_q');
});
t('UAE: a mainland LLC files corporate tax nine months after its year end and VAT 28 days after its own quarter', () => {
  const sel = selOf(AE, 'DU', 'llc');
  const r = evaluate(AE, sel, fill(AE, sel, 'no', { fye: '12-31', ae_ct_reg: 'yes', ae_vat_reg: 'yes', ae_vat_period: 'q', ae_vat_stagger: '1', ae_lic_date: '2023-06-10', ae_lic_expiry: '2027-06-10' }), TODAY);
  assert.equal(find(r, 'ae_ct_return').next[0].date, '2027-09-30');
  assert.equal(find(r, 'ae_vat_q').next[0].date, '2026-11-30');        // 28 November 2026 is a Saturday
  assert.equal(find(r, 'ae_licence').next[0].date, '2027-06-10'); absent(r, 'ae_ct_register'); absent(r, 'ae_audit_fs');
});
t('UAE: a freelancer is outside corporate tax until turnover passes AED 1 million, then registers by 31 March', () => {
  const sel = selOf(AE, 'SH', 'sole_est');
  let r = evaluate(AE, sel, fill(AE, sel, 'no'), TODAY);
  absent(r, 'ae_ct_return'); absent(r, 'ae_ct_register_np');
  r = evaluate(AE, sel, fill(AE, sel, 'no', { ae_turnover_1m: 'yes' }), TODAY);
  assert.equal(find(r, 'ae_ct_register_np').next[0].date, '2027-03-31');
  assert.equal(find(r, 'ae_ct_return').next[0].date, '2027-09-30');
});
t('UAE: a free zone company on the 0% rate needs audited accounts; a large group registers for top-up tax by 30 November 2026', () => {
  const sel = selOf(AE, 'DU', 'fz');
  const r = evaluate(AE, sel, fill(AE, sel, 'no', { fye: '12-31', ae_ct_reg: 'yes', ae_qfzp: 'yes', ae_mne: 'yes' }), TODAY);
  find(r, 'ae_audit_fs'); absent(r, 'ae_sbr');
  assert.equal(find(r, 'ae_dmtt_register').next[0].date, '2026-11-30');
});
t('UAE: DIFC and ADGM companies exist only in their own emirate', () => {
  const idsOf = (s: string) => AE.entityTypes.filter((e) => !e.onlyStates || e.onlyStates.includes(s)).map((e) => e.id);
  assert.ok(idsOf('DU').includes('difc') && !idsOf('DU').includes('adgm'));
  assert.ok(idsOf('AZ').includes('adgm') && !idsOf('AZ').includes('difc'));
  assert.ok(!idsOf('SH').includes('offshore') && idsOf('RK').includes('offshore'));
});
