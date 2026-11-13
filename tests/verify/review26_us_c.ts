// Round 26, United States COVERAGE: the gaps and source mismatches the independent coverage audit found (U1-U15, S1-S4),
// each held by a reproduction. What was read on which official page is in docs/compliance-research/REVIEW26-US-C.md.
// Run: node --experimental-strip-types tests/verify/review26_us_c.ts
import assert from 'node:assert/strict';
import { packOf } from '../../src/lib/compliance/index.ts';
import { checkPack } from '../../src/lib/compliance/integrity.ts';
import { evaluate, visibleQuestions } from '../../src/lib/compliance/engine.ts';
import type { Answers, Compliance, Result } from '../../src/lib/compliance/types.ts';

const T = '2026-11-13';
const p = packOf('US')!;
let pass = 0, fail = 0;
const t = (name: string, fn: () => void) => { try { fn(); pass++; } catch (e) { fail++; console.log(`  FAIL  ${name}\n        ${(e as Error).message.split('\n').slice(0, 6).join('\n        ')}`); } };
const C = (id: string): Compliance => { const c = p.compliances.find((x) => x.id === id); assert.ok(c, `no compliance ${id}`); return c!; };
const srcUrl = (id: string) => p.sources.find((s) => s.id === C(id).source)!.url;
/** Answers given, every other question answered `mode` (dates 2019-08-15, year end 31 December, last option of a choice). */
function run(state: string, entity: string, want: Answers = {}, mode: 'no' | 'yes' = 'no') {
  const sel = { country: 'US', state, entity, depts: p.departments.map((d) => d.id) };
  const a: Answers = { ...want };
  for (let i = 0; i < 14; i++) for (const q of visibleQuestions(p, sel, a)) if (a[q.id] === undefined) a[q.id] = q.type === 'yn' ? mode : q.type === 'multi' ? ['none'] : q.type === 'date' ? '2019-08-15' : q.type === 'monthday' ? '12-31' : q.options?.[q.options.length - 1]?.v ?? '';
  const res = evaluate(p, sel, a, T);
  const get = (id: string): Result | undefined => res.find((r) => r.id === id);
  const dates = (id: string) => get(id)?.next.map((d) => d.date) ?? [];
  const asked = visibleQuestions(p, sel, a).map((q) => q.id);
  return { res, a, get, first: (id: string) => dates(id)[0], dates, asked, ids: res.map((r) => r.id) };
}
const has = (ids: string[], id: string) => assert.ok(ids.includes(id), `${id} is missing`);
const hasNot = (ids: string[], id: string) => assert.ok(!ids.includes(id), `${id} should not be there`);
const EMP = { us_employees: 'yes', us_deposit: 'monthly' };
const R = (id: string) => `us_x_r26_${id}`;

console.log('review26_us_c: the pack is sound and every new item rests on an official page');
t('the country passes the structure check', () => assert.deepEqual(checkPack(p), []));
t('28 new items, each verified with a quotation on a .gov page (or the state\'s own designated site)', () => {
  const mine = p.compliances.filter((c) => c.id.startsWith('us_x_r26_'));
  assert.equal(mine.length, 28);
  for (const c of mine) {
    assert.equal(c.verified, true, c.id);
    assert.match(new URL(srcUrl(c.id)).hostname, /(\.gov|floridarevenue\.com|myfloridacfo\.com)$/, c.id);
  }
});

console.log('U1 state workers\' compensation coverage');
t('California, New York and New Jersey employers are told to carry it; a business with no employees is not', () => {
  for (const [st, id] of [['CA', 'ca_wc'], ['NY', 'ny_wc'], ['NJ', 'nj_wc']]) {
    const r = run(st, 'ccorp', EMP); has(r.ids, R(id));
    assert.equal(r.get(R(id))!.verified, true);
    hasNot(run(st, 'ccorp').ids, R(id));
  }
  assert.ok(run('NJ', 'ccorp', EMP).get(R('nj_wc'))!.penalty!.includes('$5,000'));
});
t('Florida: required at four employees outside construction, at one in construction, not below', () => {
  has(run('FL', 'scorp', { ...EMP, [R('fl_wc')]: 'four' }).ids, R('fl_wc'));
  has(run('FL', 'scorp', { ...EMP, [R('fl_wc')]: 'construction' }).ids, R('fl_wc'));
  hasNot(run('FL', 'scorp', { ...EMP, [R('fl_wc')]: 'none' }).ids, R('fl_wc'));
  assert.ok(run('FL', 'scorp', EMP).asked.includes(R('fl_wc')));
  assert.ok(!run('TX', 'scorp', EMP).asked.includes(R('fl_wc')));
});

console.log('U2 Illinois IL-941 and W-2s to Illinois');
t('an Illinois employer: IL-941 every quarter (next: 31 January 2027) and W-2s by 31 January', () => {
  const r = run('IL', 'ccorp', EMP);
  assert.deepEqual(r.dates(R('il_941')), ['2027-01-31', '2027-04-30']);
  assert.equal(r.first(R('il_w2')), '2027-01-31');
  hasNot(run('IL', 'ccorp').ids, R('il_941'));
});

console.log('U3 Form 8822-B');
t('a business is told to report a new responsible party within 60 days', () => {
  const g = run('TX', 'ccorp').get(R('8822b'))!;
  assert.ok(g); assert.equal(g.form, 'Form 8822-B'); assert.equal(g.window?.kind, 'after'); assert.match(g.window!.text, /60 days/);
});

console.log('U4 Washington business licence renewal');
t('a license with an endorsement: renewal on the expiry date given; without one: nothing', () => {
  assert.equal(run('WA', 'partnership', { [R('wa_endorse')]: 'yes', [R('wa_exp')]: '2027-03-01' }).first(R('wa_bl')), '2027-03-01');
  hasNot(run('WA', 'partnership', { [R('wa_endorse')]: 'no' }).ids, R('wa_bl'));
  assert.ok(!run('OR', 'partnership').asked.includes(R('wa_endorse')));
});

console.log('U5 Florida DR-405 and U6 Texas rendition');
t('Florida: April 1, with the 25% / 5% penalties; Texas: April 15, with the 10% penalty', () => {
  const fl = run('FL', 'ccorp', { [R('tpp')]: 'yes' });
  assert.equal(fl.first(R('fl_tpp')), '2027-04-01'); assert.match(fl.get(R('fl_tpp'))!.penalty!, /25%/);
  const tx = run('TX', 'ccorp', { [R('tpp')]: 'yes' });
  assert.equal(tx.first(R('tx_bpp')), '2027-04-15'); assert.match(tx.get(R('tx_bpp'))!.penalty!, /10%/);
  hasNot(run('FL', 'ccorp', { [R('tpp')]: 'no' }).ids, R('fl_tpp'));
  hasNot(tx.ids, R('fl_tpp')); hasNot(fl.ids, R('tx_bpp'));
});

console.log('U7 New York disability and Paid Family Leave');
t('a New York employer is told to carry DB and PFL coverage', () => {
  const g = run('NY', 'partnership', EMP).get(R('ny_db'))!;
  assert.ok(g); assert.match(g.dueText, /30 days/); assert.ok(g.penalty);
  hasNot(run('NJ', 'partnership', EMP).ids, R('ny_db'));
});

console.log('U8 Form 943, U9 Form 945, U10 Form 8027');
t('farmworkers bring Form 943 (31 January), nonpayroll withholding Form 945 (31 January), a large restaurant Form 8027 (28 February)', () => {
  const r = run('TX', 'ccorp', { ...EMP, [R('farm')]: 'yes', [R('nonpayroll')]: 'yes', [R('tips')]: 'yes' });
  assert.equal(r.first(R('943')), '2027-01-31'); assert.equal(r.first(R('945')), '2027-01-31'); assert.equal(r.first(R('8027')), '2027-02-28');
  const n = run('TX', 'ccorp', EMP);
  for (const id of ['943', '945', '8027']) hasNot(n.ids, R(id));
});

console.log('U11 information returns');
t('each form appears only after its own question, with the date read in the IRS guide', () => {
  const yes = { [R('intdiv')]: 'yes', [R('mortgage')]: 'yes', [R('realestate')]: 'yes', [R('debt')]: 'yes', [R('broker')]: 'yes', [R('pse')]: 'yes', [R('retpay')]: 'yes', [R('ira')]: 'yes', [R('iso')]: 'yes' };
  const r = run('TX', 'ccorp', yes);
  for (const id of ['intdiv', '1098', '1099c', '1099k', '1099r', '3921']) assert.equal(r.first(R(id)), '2027-01-31', id);
  for (const id of ['1099s', '1099b']) assert.equal(r.first(R(id)), '2027-02-15', id);
  assert.deepEqual(r.dates(R('5498')), ['2027-01-31', '2027-05-31']);
  const n = run('TX', 'ccorp');
  for (const id of ['intdiv', '1098', '1099c', '1099k', '1099r', '3921', '1099s', '1099b', '5498']) hasNot(n.ids, R(id));
});
t('Forms 1094-B/1095-B: a small employer with a self-insured plan, not a large one', () => {
  const small = run('TX', 'ccorp', { ...EMP, us_x_health_plan: 'yes', [R('selfins')]: 'yes', us_ale: 'no' });
  assert.equal(small.first(R('1095b')), '2027-02-28');
  hasNot(run('TX', 'ccorp', { ...EMP, us_x_health_plan: 'yes', [R('selfins')]: 'yes', us_ale: 'yes' }).ids, R('1095b'));
  hasNot(run('TX', 'ccorp', { ...EMP, us_x_health_plan: 'yes', [R('selfins')]: 'no', us_ale: 'no' }).ids, R('1095b'));
});

console.log('U12 Texas non-subscriber notice');
t('a Texas employer without workers\' compensation insurance: notice by 30 April; with insurance: nothing', () => {
  assert.equal(run('TX', 'ccorp', { ...EMP, [R('tx_wc')]: 'no' }).first(R('tx_nonsub')), '2027-04-30');
  hasNot(run('TX', 'ccorp', { ...EMP, [R('tx_wc')]: 'yes' }).ids, R('tx_nonsub'));
});

console.log('U13 California RRF-1');
t('4 months and 15 days after the fiscal year end: 15 May for 31 December, 15 November for 30 June', () => {
  assert.equal(run('CA', 'nonprofit', { fye: '12-31' }).first(R('ca_rrf1')), '2027-05-15');
  assert.equal(run('CA', 'nonprofit', { fye: '06-30' }).first(R('ca_rrf1')), '2026-11-15');
  hasNot(run('NV', 'nonprofit').ids, R('ca_rrf1'));
});

console.log('U15 Pennsylvania W-3 and annual reconciliation');
t('a Pennsylvania employer: W-3 after each quarter, REV-1667 with W-2s by 31 January', () => {
  const r = run('PA', 'scorp', EMP);
  assert.deepEqual(r.dates(R('pa_w3')), ['2027-01-31', '2027-04-30']);
  assert.equal(r.first(R('pa_rev1667')), '2027-01-31');
});

console.log('S1/S2 the generic state rules cite no page that states their duty, so they stay "to confirm"');
t('every rule that cites the IRS list of state websites is marked to confirm, and none cites the census data file', () => {
  const irs = p.compliances.filter((c) => c.source === 'irs_states');
  assert.ok(irs.length >= 14);
  for (const c of irs) assert.equal(c.verified, false, c.id);
  for (const id of ['us_st_cit', 'us_st_sales']) { assert.equal(C(id).source, 'irs_states'); assert.equal(C(id).verified, false); }
  assert.deepEqual(p.compliances.filter((c) => c.source === 'census').map((c) => c.id), []);
});
console.log('S3 Mississippi data breach');
t('read only in a bill that died, so it stays "to confirm"', () => assert.equal(C('us_x_ms_breach').verified, false));
console.log('S4 Medicare Part B');
t('described as an enrolment window with a late penalty, not as a duty', () => {
  const c = C('us_x_g_medicare_iep');
  assert.doesNotMatch(c.name, /^Sign up/); assert.match(c.brief, /not a filing/); assert.match(c.brief, /late enrollment penalty/);
});

console.log(`review26_us_c: ${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
