// The United Arab Emirates findings of the independent review (A1 to A11), each held by the reviewer's own reproduction.
// What was read on which official page is in docs/compliance-research/REVIEW-AE.md.
// Run: node --experimental-strip-types tests/verify/review_ae.ts
import assert from 'node:assert/strict';
import { packOf } from '../../src/lib/compliance/index.ts';
import { checkPack } from '../../src/lib/compliance/integrity.ts';
import { evaluate, visibleQuestions } from '../../src/lib/compliance/engine.ts';
import { windowOf } from '../../src/lib/compliance/window.ts';
import type { Answers, Compliance, Result } from '../../src/lib/compliance/types.ts';

const T = '2026-11-11';
const p = packOf('AE')!;
let pass = 0, fail = 0;
const t = (name: string, fn: () => void) => { try { fn(); pass++; } catch (e) { fail++; console.log(`  FAIL  ${name}\n        ${(e as Error).message.split('\n').slice(0, 6).join('\n        ')}`); } };
const C = (id: string): Compliance => { const c = p.compliances.find((x) => x.id === id); assert.ok(c, `no compliance ${id}`); return c!; };
const Q = (id: string) => { const q = p.questions.find((x) => x.id === id); assert.ok(q, `no question ${id}`); return q!; };
/** Answers given, every other question answered `mode` (dates 2019-08-15, year end 31 December unless given). */
function run(state: string, entity: string, want: Answers = {}, depts?: string[], mode: 'no' | 'yes' = 'no', today = T) {
  const sel = { country: 'AE', state, entity, depts: depts ?? p.departments.map((d) => d.id) };
  const a: Answers = { ...want };
  for (let i = 0; i < 14; i++) for (const q of visibleQuestions(p, sel, a)) if (a[q.id] === undefined) a[q.id] = q.type === 'yn' ? mode : q.type === 'multi' ? ['none'] : q.type === 'date' ? '2019-08-15' : q.type === 'monthday' ? '12-31' : q.options?.[q.options.length - 1]?.v ?? '';
  const res = evaluate(p, sel, a, today);
  const get = (id: string): Result | undefined => res.find((r) => r.id === id);
  const dates = (id: string) => (get(id)?.next ?? []).map((n) => n.date);
  return { res, a, get, dates, ids: res.map((r) => r.id) };
}

console.log('review_ae: the pack is sound');
t('the country passes the structure check', () => assert.deepEqual(checkPack(p), []));

console.log('A1 registration of a natural person follows the year turnover passed AED 1,000,000');
t('the year is asked of a natural person above the limit who is not registered', () => {
  const r = run('DU', 'individual', { ae_business: 'yes', ae_turnover_1m: 'yes', ae_ct_reg: 'no' }, ['ct']);
  assert.ok('ae_ct_np_year' in r.a, 'the year question was not asked');
  assert.ok(!('ae_ct_np_year' in run('DU', 'individual', { ae_business: 'yes', ae_turnover_1m: 'yes', ae_ct_reg: 'yes' }, ['ct']).a), 'asked of a person already registered');
});
t('2026 gives 31 March 2027 and nothing after it', () => {
  for (const ent of ['individual', 'sole_est']) assert.deepEqual(run('DU', ent, { ae_business: 'yes', ae_turnover_1m: 'yes', ae_ct_reg: 'no', ae_ct_np_year: '2026-12-31' }, ['ct']).dates('ae_ct_register_np'), ['2027-03-31'], ent);
});
t('2025 and 2024 are shown as already due, never as next March', () => {
  for (const [v, was] of [['2025-12-31', '2026-03-31'], ['2024-12-31', '2025-03-31']]) {
    const r = run('DU', 'sole_est', { ae_turnover_1m: 'yes', ae_ct_reg: 'no', ae_ct_np_year: v }, ['ct']).get('ae_ct_register_np')!;
    assert.deepEqual(r.next, [], `${v} shows a future date`); assert.equal(r.passed, was);
  }
});
t('"Not sure" about the year leaves the date as still needed', () => {
  const r = run('DU', 'sole_est', { ae_turnover_1m: 'yes', ae_ct_reg: 'no', ae_ct_np_year: 'unsure' }, ['ct']).get('ae_ct_register_np')!;
  assert.deepEqual(r.next, []); assert.equal(r.needs, 'ae_ct_np_year'); assert.equal(r.passed, undefined);
});
t('the rule is not a yearly fixed date any more', () => assert.equal(C('ae_ct_register_np').due.t, 'event'));

console.log('A2 the VAT quarter set');
t('"Not sure" shows no date and says which answer is needed', () => {
  const r = run('DU', 'llc', { ae_vat_reg: 'yes', ae_vat_period: 'q', ae_vat_stagger: 'unsure' }, ['vat']).get('ae_vat_q')!;
  assert.deepEqual(r.next, []); assert.equal(r.needs, 'ae_vat_stagger');
  assert.match(r.note ?? '', /certificate/i); assert.match(Q('ae_vat_stagger').help ?? '', /no due date can be shown/i);
});
t('each of the three sets gives its own dates', () => {
  const d = (v: string) => run('DU', 'llc', { ae_vat_reg: 'yes', ae_vat_period: 'q', ae_vat_stagger: v }, ['vat']).dates('ae_vat_q')[0];
  assert.equal(d('0'), '2027-01-28'); assert.equal(d('1'), '2026-11-30'); assert.equal(d('2'), '2026-12-28');
});

console.log('A3 ADGM confirmation statement: one month, not 30 days');
t('an anniversary of 31 January gives the end of February, and 15 October gives 15 November', () => {
  assert.deepEqual(run('AZ', 'adgm', { ae_lic_date: '2020-01-31' }, ['corporate']).dates('ae_adgm_conf'), ['2027-02-28', '2028-02-29']);
  assert.equal(run('AZ', 'adgm', { ae_lic_date: '2020-10-15' }, ['corporate']).dates('ae_adgm_conf')[0], '2026-11-15');
});

console.log('A4 top-up tax registration counts from the first fiscal year in scope');
t('a first year that ended before 30 April 2026 gives 30 November 2026', () => {
  const r = run('DU', 'llc', { ae_rev_50m: 'yes', ae_mne: 'yes', ae_dmtt_first_late: 'no' }, ['ct']);
  assert.deepEqual(r.dates('ae_dmtt_register'), ['2026-11-30']); assert.ok(!r.ids.includes('ae_dmtt_register_later'));
});
t('a later first year gives seven months after its end', () => {
  const at = (fye: string) => { const r = run('DU', 'llc', { ae_rev_50m: 'yes', ae_mne: 'yes', ae_dmtt_first_late: 'yes', fye }, ['ct']); assert.ok(!r.ids.includes('ae_dmtt_register'), 'both variants shown'); return r.dates('ae_dmtt_register_later')[0]; };
  assert.equal(at('06-30'), '2027-02-01');      // 30 June 2026 + 7 months = 31 January 2027, a Sunday: the Federal Tax Authority's next working day
  assert.equal(at('05-31'), '2026-12-31');
  assert.equal(at('03-31'), '2027-11-01');      // a year that ended 31 March 2026 belongs to the other answer; this one's first is the year to 31 March 2027 (31 October 2027 is a Sunday)
});
t('the seven months are counted to the month end and a weekend moves to the next working day (Federal Tax Authority)', () => {
  const r = run('DU', 'llc', { ae_rev_50m: 'yes', ae_mne: 'yes', ae_dmtt_first_late: 'yes', fye: '12-31' }, ['ct']);
  assert.deepEqual(r.dates('ae_dmtt_register_later'), ['2027-08-02', '2028-07-31']);   // 31 July 2027 is a Saturday
});
t('"Not sure" shows both, each as "may apply"', () => {
  const r = run('DU', 'llc', { ae_rev_50m: 'yes', ae_mne: 'yes', ae_dmtt_first_late: 'unsure' }, ['ct']);
  assert.equal(r.get('ae_dmtt_register')?.certainty, 'check'); assert.equal(r.get('ae_dmtt_register_later')?.certainty, 'check');
});

console.log('A6 and A8 country-by-country reporting');
t('the report\'s penalty is the one for missing the deadline', () => assert.match(C('ae_cbcr_report').penalty ?? '', /Missing the deadline: AED 1,000,000, plus AED 10,000 for each day/));
t('the notification is never shown after the last day of the fiscal year', () => {
  const d = (fye: string, today = T) => run('DU', 'llc', { ae_rev_50m: 'yes', ae_mne: 'yes', ae_upe: 'yes', fye }, ['ct'], 'no', today).dates('ae_cbcr_notify');
  assert.equal(d('01-31')[0], '2027-01-31');      // a Sunday: it used to show 1 February 2027
  assert.ok(d('12-31', '2028-06-01').includes('2028-12-31'), d('12-31', '2028-06-01').join());   // a Sunday: it used to show 1 January 2029
});
t('Ministry of Finance items are shown as stated', () => { for (const id of ['ae_cbcr_notify', 'ae_cbcr_report', 'ae_einvoice_1', 'ae_einvoice_2']) assert.equal(C(id).roll, false, id); });
t('no UAE item of another authority than the Federal Tax Authority is moved off a weekend', () => {
  const moved = p.compliances.filter((c) => c.roll !== false && c.authority !== 'Federal Tax Authority').map((c) => c.id);
  assert.deepEqual(moved, []);
});

console.log('A7 the federal gratuity is not shown to DIFC and ADGM employers');
t('a DIFC employer gets the DIFC scheme and not the federal gratuity', () => {
  const r = run('DU', 'difc', { ae_employees: 'yes', ae_mohre: 'no' }, ['payroll']);
  assert.ok(!r.ids.includes('ae_gratuity')); assert.ok(r.ids.includes('ae_difc_scheme')); assert.ok(r.ids.includes('ae_x_difc_final_pay'));
});
t('an ADGM employer gets the ADGM gratuity and not the federal one', () => {
  const r = run('AZ', 'adgm', { ae_employees: 'yes', ae_mohre: 'no' }, ['payroll']);
  assert.ok(!r.ids.includes('ae_gratuity')); assert.ok(r.ids.includes('ae_x_adgm_gratuity'));
  assert.deepEqual(windowOf(C('ae_x_adgm_gratuity').due), { n: 21, unit: 'days', kind: 'after' });
});
t('a mainland employer still gets the federal gratuity, or the Savings Scheme when it chose that', () => {
  assert.ok(run('DU', 'llc', { ae_employees: 'yes' }, ['payroll']).ids.includes('ae_gratuity'));
  const s = run('DU', 'llc', { ae_employees: 'yes', ae_savings: 'yes' }, ['payroll']);
  assert.ok(s.ids.includes('ae_savings') && !s.ids.includes('ae_gratuity'));
});

console.log('A9 pensions for UAE nationals');
t('Abu Dhabi employers are sent to the Abu Dhabi fund, with no computed date', () => {
  const r = run('AZ', 'llc', { ae_employees: 'yes', ae_emirati: 'yes' }, ['payroll']);
  for (const id of ['ae_gpssa', 'ae_x_gpssa_register', 'ae_x_gpssa_leaver']) assert.ok(!r.ids.includes(id), id);
  const f = r.get('ae_x_adpf_pension')!; assert.ok(f); assert.deepEqual(f.next, []); assert.equal(f.verified, false); assert.equal(f.window, undefined);
});
t('every other emirate, Sharjah included, gets the federal authority', () => {
  for (const st of ['DU', 'SH', 'AJ', 'RK', 'FU', 'UQ'].filter((s) => p.states.some((x) => x.code === s))) {
    const r = run(st, 'llc', { ae_employees: 'yes', ae_emirati: 'yes' }, ['payroll']);
    for (const id of ['ae_gpssa', 'ae_x_gpssa_register', 'ae_x_gpssa_leaver']) assert.ok(r.ids.includes(id), `${st} ${id}`);
    assert.ok(!r.ids.includes('ae_x_adpf_pension'), st);
  }
});
t('a new Emirati employee is registered within 30 days (the shorter of the two periods the Authority states)', () => assert.deepEqual(windowOf(C('ae_x_gpssa_register').due), { n: 30, unit: 'days', kind: 'after' }));

console.log('A10 and A11');
t('VAT registration cites the page that states the 30 days, and the penalty its own page', () => {
  const c = C('ae_vat_register'); assert.equal(c.source, 'vat_reg_svc'); assert.equal(c.penaltySource, 'tax_penalties');
  for (const s of [c.source, c.penaltySource!]) assert.match(p.sources.find((x) => x.id === s)?.url ?? '', /^https:\/\/tax\.gov\.ae\//);
});
t('the AED 50 million question matches "AED 50,000,000 or more" of the e-invoicing item', () => { assert.match(Q('ae_rev_50m').text, /AED 50,000,000 or more/); assert.match(C('ae_einvoice_1').why, /AED 50,000,000 or more/); });
t('a change of beneficial owner is asked of the same partnerships that keep the register', () => {
  const none = run('DU', 'partnership', { ae_pship_legal: 'no' }, ['corporate'], 'yes');
  assert.ok(!('ae_ubo_change' in none.a) && !none.ids.includes('ae_ubo_change') && !none.ids.includes('ae_ubo'));
  const legal = run('DU', 'partnership', { ae_pship_legal: 'yes' }, ['corporate'], 'yes');
  assert.ok(legal.ids.includes('ae_ubo_change') && legal.ids.includes('ae_ubo'));
});
t('the DIFC data protection notification counts from incorporation in both its texts', () => { const c = C('ae_x_difc_dp_notify'); assert.match((c.due as any).text, /incorporation/); assert.match(c.dueText, /incorporation/i); });
t('no question is conditioned on a kind of entity the UAE does not have', () => {
  const kinds = new Set(p.entityTypes.map((e) => e.kind));
  const bad: string[] = [];
  const walk = (c: any, id: string) => { if (!c) return; if (c.all) c.all.forEach((k: any) => walk(k, id)); else if (c.any) c.any.forEach((k: any) => walk(k, id)); else if (c.not) walk(c.not, id); else if (c.kind) for (const k of c.kind) if (!kinds.has(k)) bad.push(`${id}:${k}`); };
  for (const q of p.questions) walk(q.show, q.id);
  for (const c of p.compliances) walk(c.applies, c.id);
  assert.deepEqual(bad, []);
});

console.log('C13 (UAE items) a renewal fixed by an expiry date is not counted from the day it was last done');
t('renewals tied to a date on a document are "until"; duties with no stated period have none', () => {
  for (const id of ['ae_x_g_patent_annuity', 'ae_x_g_vehicle_renew', 'ae_x_g_dm_ohs_pic']) assert.equal(windowOf(C(id).due)?.kind, 'until', id);
  for (const id of ['ae_x_emiratisation_50', 'ae_x_difc_dp_renew', 'ae_x_jafza_audit']) assert.equal(windowOf(C(id).due), null, id);
});

console.log(`\nreview_ae: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
