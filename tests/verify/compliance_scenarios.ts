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
