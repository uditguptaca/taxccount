// Review 26, United States QUESTIONS: each finding of the independent question audit that was fixed, held by the
// auditor's own reproduction (questions/repro.ts: every unasked question answered "no", or the first option).
// What changed, and what was read on which official page, is in docs/compliance-research/REVIEW26-US-Q.md.
// Run: node --experimental-strip-types tests/verify/review26_us_q.ts
import assert from 'node:assert/strict';
import { packOf } from '../../src/lib/compliance/index.ts';
import { checkPack } from '../../src/lib/compliance/integrity.ts';
import { evaluate, entityTypesFor, unanswered, visibleQuestions } from '../../src/lib/compliance/engine.ts';
import { usa } from '../../src/lib/compliance/countries/us.ts';
import { LLC_ASK_CORP, LLC_SKIP_PSHIP } from '../../src/lib/compliance/countries/us-states.ts';
import type { Answers, Result } from '../../src/lib/compliance/types.ts';

const T = '2026-11-13';
const p = packOf('US')!;
let pass = 0, fail = 0;
const t = (name: string, fn: () => void) => { try { fn(); pass++; } catch (e) { fail++; console.log(`  FAIL  ${name}\n        ${(e as Error).message.split('\n').slice(0, 6).join('\n        ')}`); } };
const Q = (id: string) => p.questions.find((x) => x.id === id);
/** The auditor's completion: every question still unanswered gets "no", the first option, 2020-03-15 or 31 December. */
function run(state: string, entity: string, want: Answers = {}, depts?: string[], mode: 'no' | 'yes' | 'unsure' = 'no') {
  const sel = { country: 'US', state, entity, depts: depts ?? p.departments.map((d) => d.id) };
  const a: Answers = { ...want };
  for (let i = 0; i < 14; i++) for (const q of visibleQuestions(p, sel, a)) if (a[q.id] === undefined)
    a[q.id] = q.type === 'yn' ? mode : q.type === 'multi' ? [q.options!.some((o) => o.v === 'none') ? 'none' : q.options![0].v] : q.type === 'date' ? '2020-03-15' : q.type === 'monthday' ? '12-31' : q.options![0].v;
  const res = evaluate(p, sel, a, T);
  const get = (id: string): Result | undefined => res.find((r) => r.id === id);
  const asked = visibleQuestions(p, sel, a).map((q) => q.id);
  return { res, a, get, asked, ids: res.map((r) => r.id), first: (id: string) => get(id)?.next[0]?.date, sel };
}
const has = (ids: string[], id: string) => assert.ok(ids.includes(id), `${id} is missing`);
const hasNot = (ids: string[], id: string) => assert.ok(!ids.includes(id), `${id} should not be there`);

console.log('review26_us_q: the pack is sound');
t('the country passes the structure check', () => assert.deepEqual(checkPack(p), []));
t('the version was raised', () => assert.equal(usa.version, '2026.11.3'));

console.log('B1 head counts asked positively: an empty tick list no longer means "10 or more"');
t('the negative questions are gone and the new ones read positively', () => {
  for (const id of ['us_x_de_under10', 'us_x_nj_under10', 'us_x_va_under5']) assert.equal(Q(id), undefined, id);
  assert.match(Q('us_x_de_10plus')!.text, /10 or more/); assert.match(Q('us_x_va_5plus')!.text, /five or more/);
  assert.deepEqual(Q('us_x_nj_size')!.options!.map((o) => o.v), ['u10', '10to19', '20to24', '25to39', '40plus']);
  // the facts already quoted in the help are kept
  assert.match(Q('us_x_de_10plus')!.help!, /10 or more eligible employees/);
  assert.match(Q('us_x_va_5plus')!.help!, /five or more eligible employees.*December 31/);
  assert.match(Q('us_x_nj_size')!.help!, /ten or more employees/);
});
t('repro 2, 2b, 2c: an employer that ticked nothing is not given Delaware paid leave or the NJ / VA retirement programmes', () => {
  hasNot(run('DE', 'sole_prop', { us_employees: 'yes' }).ids, 'us_x_de_pfml');
  const nj = run('NJ', 'sole_prop', { us_employees: 'yes' }); for (const id of ['us_x_nj_retire', 'us_x_nj_retire_20', 'us_x_nj_retire_25', 'us_x_nj_retire_40']) hasNot(nj.ids, id);
  hasNot(run('VA', 'sole_prop', { us_employees: 'yes' }).ids, 'us_x_va_retire');
});
t('a tick (Yes) still gives them', () => {
  assert.equal(run('DE', 'sole_prop', { us_employees: 'yes', us_x_de_10plus: 'yes' }).get('us_x_de_pfml')?.certainty, 'applies');
  assert.equal(run('VA', 'ccorp', { us_employees: 'yes', us_x_va_5plus: 'yes' }).get('us_x_va_retire')?.certainty, 'applies');
  assert.equal(run('VA', 'ccorp', { us_employees: 'yes', us_x_va_5plus: 'unsure' }).get('us_x_va_retire')?.certainty, 'check');
});
t('M9 New Jersey: each size band gets the registration deadline the Treasury page gives it', () => {
  const b = (size: string) => run('NJ', 'ccorp', { us_employees: 'yes', us_x_retirement_plan: 'no', us_x_nj_size: size }, ['labour']);
  const r10 = b('10to19'); assert.equal(r10.first('us_x_nj_retire'), '2027-02-17'); hasNot(r10.ids, 'us_x_nj_retire_20');
  const r20 = b('20to24'); assert.equal(r20.first('us_x_nj_retire_20'), '2026-12-01'); hasNot(r20.ids, 'us_x_nj_retire');
  assert.equal(b('25to39').get('us_x_nj_retire_25')?.passed, '2024-11-15');
  assert.equal(b('40plus').get('us_x_nj_retire_40')?.passed, '2024-09-15');
  const u = b('u10'); for (const id of ['us_x_nj_retire', 'us_x_nj_retire_20', 'us_x_nj_retire_25', 'us_x_nj_retire_40']) hasNot(u.ids, id);
  const ns = run('NJ', 'ccorp', { us_employees: 'yes', us_x_retirement_plan: 'no', us_x_nj_size: 'unsure' }, ['labour']);
  for (const id of ['us_x_nj_retire', 'us_x_nj_retire_20', 'us_x_nj_retire_25', 'us_x_nj_retire_40']) assert.equal(ns.get(id)?.certainty, 'check', id);
});

console.log('C1 the date questions may be left blank');
t('fye and us_st_date are optional, and a blank one only leaves the date to be worked out', () => {
  assert.equal(Q('fye')!.optional, true); assert.equal(Q('us_st_date')!.optional, true); assert.equal(Q('us_st_date')!.step, 'dates');
  const sel = { country: 'US', state: 'AK', entity: 'ccorp', depts: ['state'] };
  const r = run('AK', 'ccorp', {}, ['state']);
  delete (r.a as any).us_st_date; delete (r.a as any).fye;
  assert.ok(!unanswered(p, sel, r.a).some((q) => q.id === 'us_st_date' || q.id === 'fye'));
  const x = evaluate(p, sel, r.a, T).find((k) => k.id === 'us_ar_ak_both')!;
  assert.ok(x && x.needs && !x.next.length, 'the annual report is still listed, waiting for the date');
});

console.log('C3 the trademark date says what it is used for');
t('only the 10-year renewal is counted from it, and the help says so', () => {
  assert.ok(!/Maintenance deadlines are counted from it/.test(Q('us_x_tm_date')!.help!));
  assert.match(Q('us_x_tm_date')!.help!, /renewal every 10 years is worked out from it/);
  const r = run('CA', 'ccorp', { us_x_trademark: 'yes', us_x_tm_date: '2021-06-01' }, ['ip']);
  assert.equal(r.first('us_x_tm_renew'), '2031-06-01');
});

console.log('C6 legal terms explained');
t('foreign trust, money services business, HIPAA covered entity, large quantity generator', () => {
  assert.match(Q('us_trust_foreign')!.help!, /primary supervision.*grantor trust rules/);
  assert.match(Q('us_x_msb')!.help!, /money transmitter.*\$1,000 per person per day|\$1,000 per person per day.*money transmitter/);
  assert.match(Q('us_x_hipaa')!.help!, /health plan, a health care clearinghouse, or a health care provider/);
  assert.ok(!/refused automated access/.test(Q('us_x_hipaa')!.help!));
  assert.match(Q('us_x_lqg')!.help!, /1,000 kilograms or more of hazardous waste in a month/);
});

console.log('C7 turning 65 and not yet on Medicare: two questions');
t('the double question is split, and the sign-up period follows both answers', () => {
  assert.equal(Q('us_x_g_turn65'), undefined);
  assert.equal(Q('us_x_g_65soon')!.text, 'Will you turn 65 within the next 12 months?');
  const y = run('CA', 'individual', { us_x_g_65soon: 'yes' }, ['personal']); assert.equal(y.get('us_x_g_medicare_iep')?.certainty, 'applies');
  hasNot(run('CA', 'individual', { us_x_g_65soon: 'yes', us_x_g_medicare_on: 'yes' }, ['personal']).ids, 'us_x_g_medicare_iep');
  const n = run('CA', 'individual', { us_x_g_65soon: 'no' }, ['personal']); hasNot(n.ids, 'us_x_g_medicare_iep'); assert.ok(!n.asked.includes('us_x_g_medicare_on'));
});

console.log('C8 a later question an earlier answer already decides is not asked');
t('repro 1: never more than 10 employees last year: not asked about 20 employees or the largest workplace', () => {
  const r = run('DE', 'sole_prop', { us_employees: 'yes', us_x_emp11: 'no', us_x_emp20: 'yes', us_x_emp50: 'yes', us_x_emp100: 'yes', us_x_health_plan: 'yes' });
  for (const id of ['us_x_emp20', 'us_x_est_size', 'us_x_osha_appa']) assert.ok(!r.asked.includes(id), id);
  hasNot(r.ids, 'us_x_osha_log'); hasNot(r.ids, 'us_x_cobra'); hasNot(r.ids, 'us_x_osha_ita');
  const big = run('DE', 'sole_prop', { us_employees: 'yes', us_x_emp11: 'yes', us_x_emp20: 'yes', us_x_health_plan: 'yes', us_x_est_size: '250plus' });
  for (const id of ['us_x_emp20', 'us_x_est_size']) assert.ok(big.asked.includes(id), id);
  has(big.ids, 'us_x_cobra'); has(big.ids, 'us_x_osha_ita'); has(big.ids, 'us_x_osha_log');
  assert.ok(run('DE', 'sole_prop', { us_employees: 'yes', us_x_emp11: 'unsure' }).asked.includes('us_x_emp20'));
});
t('repro 8: a semiweekly depositor is not asked about Form 944 and files Form 941', () => {
  const r = run('TX', 'ccorp', { us_employees: 'yes', us_944: 'yes', us_deposit: 'semi' });
  assert.ok(!r.asked.includes('us_944')); hasNot(r.ids, 'us_944'); has(r.ids, 'us_941'); has(r.ids, 'us_deposit_s');
  const m = run('TX', 'ccorp', { us_employees: 'yes', us_944: 'yes', us_deposit: 'monthly' }); assert.ok(m.asked.includes('us_944')); has(m.ids, 'us_944');
});
t('repro 4: a 10-year green card holder is not asked about a conditional card', () => {
  const r = run('CA', 'individual', { us_status: 'yes', us_x_g_green_card: 'yes', us_x_g_conditional: 'yes' });
  assert.ok(!r.asked.includes('us_x_g_conditional')); has(r.ids, 'us_x_g_i90'); hasNot(r.ids, 'us_x_g_i751');
  has(run('CA', 'individual', { us_x_g_green_card: 'no', us_x_g_conditional: 'yes' }).ids, 'us_x_g_i751');
});
t('repro 5: a man of 18 to 25 is not asked whether he turns 65', () => {
  const r = run('CA', 'individual', { us_x_g_sss: 'yes', us_x_g_65soon: 'yes' });
  assert.ok(!r.asked.includes('us_x_g_65soon')); has(r.ids, 'us_x_g_sss'); hasNot(r.ids, 'us_x_g_medicare_iep');
});
t('repro 6: a C corporation already 25% foreign-owned is not asked again whether it is foreign-owned', () => {
  const r = run('DE', 'ccorp', { us_foreign_owner: 'yes', us_related_tx: 'yes', us_x_fdi10: 'no', us_x_bea_contact: 'yes' });
  assert.ok(!r.asked.includes('us_x_fdi10')); assert.ok(r.asked.includes('us_x_bea_contact'));
  has(r.ids, 'us_5472'); has(r.ids, 'us_x_be15');
  const n = run('DE', 'ccorp', { us_foreign_owner: 'no', us_x_fdi10: 'no' }); assert.ok(n.asked.includes('us_x_fdi10')); hasNot(n.ids, 'us_x_be15'); assert.ok(!n.asked.includes('us_x_bea_contact'));
});
t('repro 7, M2: an LLC owned by one non-US person is not asked whether it is foreign-owned or formed abroad', () => {
  const r = run('DE', 'foreign_llc', { us_x_fdi10: 'no', us_formed_abroad: 'yes', us_fdre_tx: 'yes' });
  assert.ok(!r.asked.includes('us_x_fdi10')); assert.ok(!r.asked.includes('us_formed_abroad'));
  hasNot(r.ids, 'us_boi'); hasNot(r.ids, 'us_x_be15'); has(r.ids, 'us_5472_dre');
  has(run('DE', 'foreign_llc', { us_x_bea_contact: 'yes' }).ids, 'us_x_be15');
  assert.ok(run('DE', 'ccorp', {}).asked.includes('us_formed_abroad'));
});

console.log('C9 the reason matches the answers');
t('repro 20: a New York trust with no income but a nonresident beneficiary is told why Form 1041 is due', () => {
  const r = run('NY', 'trust', { us_trust_income: 'no', us_trust_nra: 'yes' });
  assert.equal(r.get('us_1041')?.certainty, 'applies'); assert.match(r.get('us_1041')!.why, /nonresident alien/);
});

console.log('C11 a person who employs a nanny or housekeeper');
t('the W-2 for a household employee, from Publication 926 (2026)', () => {
  const r = run('CA', 'individual', { us_household: 'yes' }, ['federal']);
  const w = r.get('us_x_hh_w2')!; assert.equal(w.certainty, 'applies'); assert.equal(w.next[0].date, '2027-01-31');
  assert.match(w.dueText, /February 1, 2027/); assert.equal(w.sourceUrl, 'https://www.irs.gov/publications/p926'); assert.ok(w.verified);
  has(r.ids, 'us_sched_h');
  hasNot(run('CA', 'individual', { us_household: 'no' }, ['federal']).ids, 'us_x_hh_w2');
});
t('Form I-9 when hiring one: asked of a person, counted 3 business days from the first day of work', () => {
  const r = run('CA', 'individual', { us_x_hh_hire: 'yes' }, ['labour']);
  assert.ok(r.asked.includes('us_x_hh_hire'));
  const i = r.get('us_x_hh_i9')!; assert.equal(i.certainty, 'applies'); assert.ok(i.window && /^3 (working|business) days$/.test(i.window.text) && i.window.kind === 'after', JSON.stringify(i.window));
  assert.match(i.sourceUrl, /uscis\.gov/);
  hasNot(run('CA', 'individual', { us_x_hh_hire: 'no' }, ['labour']).ids, 'us_x_hh_i9');
  assert.ok(!run('CA', 'ccorp', {}, ['labour']).asked.includes('us_x_hh_hire'));
});

console.log('M1 "Is it legally an LLC?" only where the answer changes something');
t('asked of a corporation or partnership exactly where Yes and No give different results', () => {
  const sig = (r: Result[]) => r.map((x) => `${x.id}:${x.certainty}:${x.next.map((d) => d.date).join('/')}:${x.needs ?? ''}`).sort().join('|');
  const wrong: string[] = [];
  for (const s of p.states) for (const e of entityTypesFor(p, s.code)) {
    if (!['partnership', 'ccorp', 'scorp'].includes(e.id)) continue;
    const sel = { country: 'US', state: s.code, entity: e.id, depts: p.departments.map((d) => d.id) };
    let asked = false;
    for (const mode of ['no', 'yes'] as const) asked ||= run(s.code, e.id, { us_is_llc: 'yes' }, undefined, mode).asked.includes('us_is_llc');
    // whether it would matter: the rules evaluated with the question forced into the asked set
    // a partnership is asked wherever a rule it can meet reads the answer (the engine decides that), except in DE and TX
    if (e.id === 'partnership' ? asked && LLC_SKIP_PSHIP.includes(s.code) : asked !== LLC_ASK_CORP.includes(s.code)) wrong.push(`${s.code}/${e.id} asked=${asked}`);
    if (!asked) continue;
    let matters = false;
    for (const mode of ['no', 'yes'] as const) { const y = run(s.code, e.id, { us_is_llc: 'yes' }, undefined, mode), n = run(s.code, e.id, { us_is_llc: 'no' }, undefined, mode); if (sig(evaluate(p, sel, y.a, T)) !== sig(evaluate(p, sel, n.a, T))) matters = true; }
    if (!matters) wrong.push(`${s.code}/${e.id} asked but changes nothing`);
  }
  assert.deepEqual(wrong, []);
});

console.log('M8, M10 wording');
t('the DMCA question says it is about an agent already designated', () => assert.match(Q('us_x_dmca')!.help!, /Answer yes only if a designation is already registered/));
t('the gift question names the year of the $19,000 limit', () => {
  assert.match(Q('us_gift')!.text, /single calendar year/); assert.match(Q('us_gift')!.help!, /2025.*2026/);
});

console.log(`review26_us_q: ${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
