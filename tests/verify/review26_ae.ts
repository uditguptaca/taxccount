// The United Arab Emirates findings of the independent audit of round 26 (questions C1, C2, C7, C8, C9, C10, M11 and the
// coverage gaps), each held by a reproduction of the auditor's case. What was read on which official page is in
// docs/compliance-research/REVIEW26-AE.md.
// Run: node --experimental-strip-types tests/verify/review26_ae.ts
import assert from 'node:assert/strict';
import { packOf } from '../../src/lib/compliance/index.ts';
import { checkPack } from '../../src/lib/compliance/integrity.ts';
import { evaluate, visibleQuestions, unanswered } from '../../src/lib/compliance/engine.ts';
import { windowOf } from '../../src/lib/compliance/window.ts';
import type { Answers, Compliance, Result } from '../../src/lib/compliance/types.ts';

const T = '2026-11-13';
const p = packOf('AE')!;
let pass = 0, fail = 0;
const t = (name: string, fn: () => void) => { try { fn(); pass++; } catch (e) { fail++; console.log(`  FAIL  ${name}\n        ${(e as Error).message.split('\n').slice(0, 6).join('\n        ')}`); } };
const C = (id: string): Compliance => { const c = p.compliances.find((x) => x.id === id); assert.ok(c, `no compliance ${id}`); return c!; };
const Q = (id: string) => { const q = p.questions.find((x) => x.id === id); assert.ok(q, `no question ${id}`); return q!; };
const src = (id: string) => p.sources.find((s) => s.id === C(id).source)!;
/** Answers given; every other visible question answered `mode` (dates and year end only when `dates` is set). */
function run(state: string, entity: string, want: Answers = {}, depts?: string[], mode: 'no' | 'yes' = 'no', dates = false) {
  const sel = { country: 'AE', state, entity, depts: depts ?? p.departments.map((d) => d.id) };
  const a: Answers = { ...want };
  for (let i = 0; i < 14; i++) for (const q of visibleQuestions(p, sel, a)) {
    if (q.id in a) continue;
    if (q.type === 'yn') a[q.id] = mode;
    else if (q.type === 'choice') a[q.id] = q.options?.[q.options.length - 1]?.v ?? '';
    else if (q.type === 'multi') a[q.id] = ['none'];
    else if (dates) a[q.id] = q.type === 'date' ? '2019-08-15' : '12-31';
  }
  const res = evaluate(p, sel, a, T);
  const vis = new Set(visibleQuestions(p, sel, a).map((q) => q.id));
  const get = (id: string): Result | undefined => res.find((r) => r.id === id);
  return { res, a, vis, get, sel, dates: (id: string) => (get(id)?.next ?? []).map((n) => n.date), ids: res.map((r) => r.id) };
}

console.log('review26_ae: the pack is sound');
t('the country passes the structure check', () => assert.deepEqual(checkPack(p), []));

console.log('C1 the date questions may be left blank');
t('fye, the licence date and the expiry date are optional', () => { for (const id of ['fye', 'ae_lic_date', 'ae_lic_expiry']) assert.equal(Q(id).optional, true, id); });
t('a company that leaves every date blank has no missing answer, and its dated rows say what they still need', () => {
  const r = run('DU', 'llc', { ae_ct_reg: 'yes' });
  assert.ok(r.vis.has('fye') && r.vis.has('ae_lic_date') && r.vis.has('ae_lic_expiry'));
  assert.deepEqual(unanswered(p, r.sel, r.a).map((q) => q.id), []);
  assert.equal(r.get('ae_ct_return')?.needs, 'fye'); assert.equal(r.get('ae_licence')?.needs, 'ae_lic_expiry'); assert.equal(r.get('ae_ubo')?.needs, 'ae_lic_date');
});

console.log('C2 the issue date and the expiry date are two questions');
t('the issue-date question no longer speaks of the expiry date', () => {
  assert.doesNotMatch(Q('ae_lic_date').help ?? '', /expir/i); assert.match(Q('ae_lic_date').text, /first licensed, registered or incorporated/);
  assert.match(Q('ae_lic_expiry').text, /expire/); assert.match(Q('ae_lic_expiry').help ?? '', /expiry date printed/);
});
t('every renewal counts from the expiry date, which is itself the deadline', () => {
  for (const id of ['ae_licence', 'ae_licence_fz', 'ae_difc_renew', 'ae_offshore_renew', 'ae_offshore_renew_rak', 'ae_branch_renew']) assert.deepEqual(C(id).due, { t: 'anniversary', of: 'ae_lic_expiry', first: true }, id);
});
t('a mainland licence expiring 1 March 2027 is due 1 March 2027, whatever the issue date', () => {
  assert.equal(run('DU', 'llc', { ae_lic_date: '2019-08-15', ae_lic_expiry: '2027-03-01' }, ['corporate']).dates('ae_licence')[0], '2027-03-01');
  assert.equal(run('SH', 'sole_est', { ae_lic_expiry: '2026-12-20' }, ['corporate']).dates('ae_licence')[0], '2026-12-20');
});
t('a licence whose expiry has gone by is shown as already due, not as next year', () => {
  const r = run('DU', 'llc', { ae_lic_expiry: '2026-10-01' }, ['corporate']).get('ae_licence')!;
  assert.deepEqual(r.next, []); assert.equal(r.passed, '2026-10-01');
});
t('the DIFC renewal follows the expiry date; the DIFC owner register still counts 30 days from incorporation', () => {
  const r = run('DU', 'difc', { ae_lic_date: '2026-11-01', ae_lic_expiry: '2027-10-31' }, ['corporate']);
  assert.equal(r.dates('ae_difc_renew')[0], '2027-10-31');
  assert.equal(r.dates('ae_x_difc_ubo')[0], '2026-12-01');
  assert.equal(C('ae_x_difc_ubo').due.t === 'event' && (C('ae_x_difc_ubo').due as any).from, 'ae_lic_date');
});
t('the ADGM confirmation statement and the owner register still count from the issue date', () => {
  assert.equal(run('AZ', 'adgm', { ae_lic_date: '2020-10-15' }, ['corporate']).dates('ae_adgm_conf')[0], '2026-11-15');
  assert.equal(run('DU', 'llc', { ae_lic_date: '2026-10-20' }, ['corporate']).dates('ae_ubo')[0], '2026-12-19');
});

console.log('C7 one thing per question');
t('the revenue question asks one test: every period so far, this one included', () => assert.match(Q('ae_rev_3m').text, /in every tax period so far, including this one/));
t('ultimate parent and UAE residence are two questions, and the country-by-country items need both', () => {
  assert.ok(!p.questions.some((q) => q.id === 'ae_upe'));
  const base = { ae_rev_50m: 'yes', ae_mne: 'yes', fye: '12-31' };
  assert.ok(run('DU', 'llc', { ...base, ae_upe_top: 'yes', ae_upe_uae: 'yes' }, ['ct']).ids.includes('ae_cbcr_report'));
  assert.ok(!run('DU', 'llc', { ...base, ae_upe_top: 'yes', ae_upe_uae: 'no' }, ['ct']).ids.includes('ae_cbcr_report'));
  const notTop = run('DU', 'llc', { ...base, ae_upe_top: 'no' }, ['ct']);
  assert.ok(!notTop.vis.has('ae_upe_uae'), 'residence asked of a company that is not the parent'); assert.ok(!notTop.ids.includes('ae_cbcr_notify'));
});
t('20 to 49 employees and the 14 sectors are two questions, and the target needs both', () => {
  assert.ok(!p.questions.some((q) => q.id === 'ae_x_emp20_49'));
  const base = { ae_employees: 'yes', ae_mohre: 'yes', ae_x_emp50: 'no' };
  assert.ok(run('DU', 'llc', { ...base, ae_x_emp20: 'yes', ae_x_emir_sector: 'yes' }, ['labour']).ids.includes('ae_x_emiratisation_20_49'));
  assert.ok(!run('DU', 'llc', { ...base, ae_x_emp20: 'yes', ae_x_emir_sector: 'no' }, ['labour']).ids.includes('ae_x_emiratisation_20_49'));
  assert.ok(!run('DU', 'llc', { ...base, ae_x_emp20: 'no' }, ['labour']).vis.has('ae_x_emir_sector'));
});

console.log('C8 an earlier answer that decides a later question hides it');
t('revenue always AED 3,000,000 or less: the AED 50,000,000 question is not asked, and nothing above 50 million applies', () => {
  const r = run('DU', 'llc', { ae_ct_reg: 'yes', ae_rev_3m: 'yes', ae_rev_50m: 'yes', ae_b2b: 'yes' });
  assert.ok(!r.vis.has('ae_rev_50m')); assert.ok(r.ids.includes('ae_sbr'));
  assert.ok(!r.ids.includes('ae_audit_fs') && !r.ids.includes('ae_einvoice_1')); assert.ok(r.ids.includes('ae_einvoice_2'));
});
t('revenue "Not sure" still asks the AED 50,000,000 question', () => assert.ok(run('DU', 'llc', { ae_ct_reg: 'yes', ae_rev_3m: 'unsure' }, ['ct']).vis.has('ae_rev_50m')));
t('not a UAE citizen: national service is not asked and not shown; a citizen is asked', () => {
  const r = run('DU', 'individual', { ae_x_g_citizen: 'no', ae_x_g_ns: 'yes' }, ['residency']);
  assert.ok(!r.vis.has('ae_x_g_ns')); assert.ok(!r.ids.includes('ae_x_g_national_service'));
  const c = run('DU', 'individual', { ae_x_g_citizen: 'yes', ae_x_g_ns: 'yes' }, ['residency']);
  assert.ok(c.vis.has('ae_x_g_ns')); assert.ok(c.ids.includes('ae_x_g_national_service'));
});

console.log('C9 the Small Business Relief reason agrees with the answers');
t('the reason repeats the question and no longer says "never"', () => {
  const why = run('DU', 'llc', { ae_ct_reg: 'yes', ae_rev_3m: 'yes' }, ['ct']).get('ae_sbr')!.why;
  assert.match(why, /AED 3,000,000 or less in every tax period so far/); assert.doesNotMatch(why, /never/);
});

console.log('C10 a person in business is asked about "the business", not "it"');
t('no question put to an individual with a business opens with "Is it", "Does it", "Was its" and the like', () => {
  for (const st of ['DU', 'AZ', 'SH']) {
    const r = run(st, 'individual', { ae_business: 'yes', ae_turnover_1m: 'yes' }, undefined, 'yes', true);
    const bad = visibleQuestions(p, r.sel, r.a).filter((q) => /^(Is|Does|Did|Has|Was|Were) (it|its)\b|\b(Is|Does|Did|Has|Was|Were) its\b/.test(q.text)).map((q) => `${q.id}: ${q.text}`);
    assert.deepEqual(bad, [], st);
  }
});

console.log('M11 overlapping questions');
t('Dubai: tenant and landlord are separate questions, and the 90-day notice reaches both', () => {
  assert.ok(!p.questions.some((q) => q.id === 'ae_x_g_lease_dubai'));
  assert.match(Q('ae_x_g_tenant_dubai').text, /as the tenant/);
  assert.ok(run('DU', 'individual', { ae_x_g_tenant_dubai: 'yes' }, ['property']).ids.includes('ae_x_g_lease_notice_dubai'));
  assert.ok(run('DU', 'llc', { ae_x_g_landlord: 'yes' }, ['property']).ids.includes('ae_x_g_lease_notice_dubai'));
  assert.ok(!run('AZ', 'individual', {}, ['property']).vis.has('ae_x_g_tenant_dubai'), 'the Dubai tenant question is asked in Abu Dhabi');
});
t('the precious-metals and real-estate follow-ups say they narrow down the earlier answer', () => {
  assert.match(Q('ae_x_dpms').text, /^Of those/); assert.match(Q('ae_x_realestate').text, /^Of those/);
});
t('the customs question says it is about goods only, and the VAT import question names services', () => {
  assert.match(Q('ae_customs').help ?? '', /Goods only/); assert.match(Q('ae_imports').text, /services/);
});

console.log('A1 VAT deregistration (missing, common)');
t('a VAT registrant that stopped making taxable supplies applies within 20 business days', () => {
  const r = run('DU', 'llc', { ae_vat_reg: 'yes', ae_x_vat_stop: 'yes' }, ['vat']);
  assert.ok(r.ids.includes('ae_x_vat_dereg'));
  assert.deepEqual(windowOf(C('ae_x_vat_dereg').due as any), { n: 20, unit: 'businessDays', kind: 'after' });
  assert.equal(C('ae_x_vat_dereg').verified, true); assert.match(C('ae_x_vat_dereg').dueText, /within 20 \(twenty\) Business Days/);
});
t('a business that stopped altogether is not asked again and is still shown the deregistration', () => {
  const r = run('DU', 'llc', { ae_vat_reg: 'yes', ae_ceasing: 'yes' }, ['vat']);
  assert.ok(!r.vis.has('ae_x_vat_stop')); assert.ok(r.ids.includes('ae_x_vat_dereg'));
});
t('not registered for VAT, or still trading: no deregistration', () => {
  assert.ok(!run('DU', 'llc', { ae_vat_reg: 'no', ae_vat_375: 'no', ae_ceasing: 'yes' }, ['vat']).ids.includes('ae_x_vat_dereg'));
  assert.ok(!run('DU', 'llc', { ae_vat_reg: 'yes', ae_x_vat_stop: 'no' }, ['vat']).ids.includes('ae_x_vat_dereg'));
});
t('its penalty is read on the penalties decision and the note says the English text is unofficial', () => {
  const r = run('DU', 'llc', { ae_vat_reg: 'yes', ae_x_vat_stop: 'yes' }, ['vat']).get('ae_x_vat_dereg')!;
  assert.match(r.penalty ?? '', /AED 1,000 .* up to AED 10,000/); assert.match(r.penaltySourceUrl ?? '', /Cabinet%20Decision%20No.%2040/);
  assert.match(C('ae_x_vat_dereg').note ?? '', /unofficial translations/); assert.match(src('ae_x_vat_dereg').url, /^https:\/\/tax\.gov\.ae\//);
});

console.log('A2 sponsor duties on residence visas (missing, common)');
t('an employer that sponsors visas renews its employees\' visas and cancels a leaver\'s permit and visa', () => {
  const r = run('DU', 'llc', { ae_employees: 'yes', ae_x_estcard: 'yes' }, ['residency']);
  assert.ok(r.ids.includes('ae_x_visa_renew_staff') && r.ids.includes('ae_x_visa_cancel_staff'));
  assert.equal(C('ae_x_visa_renew_staff').verified, true);
  assert.equal(C('ae_x_visa_cancel_staff').verified, false); assert.equal((C('ae_x_visa_cancel_staff').due as any).within, null);
  assert.ok(!run('DU', 'llc', { ae_employees: 'yes', ae_x_estcard: 'no' }, ['residency']).ids.includes('ae_x_visa_renew_staff'));
});
t('a person who sponsors family renews their visas and cancels them before their own', () => {
  const r = run('SH', 'individual', { ae_x_g_sponsor_family: 'yes' }, ['residency']);
  assert.ok(r.ids.includes('ae_x_g_dependants_renew') && r.ids.includes('ae_x_g_dependants_cancel'));
  assert.match(C('ae_x_g_dependants_cancel').dueText, /must cancel the dependents' visas before he cancels his\/her own/);
});

console.log('Excise deregistration, RAKEZ accounts, visa grace period (missing, specific)');
t('excise: 30 days from no longer being responsible, with the six-month rule in the words', () => {
  const r = run('DU', 'llc', { ae_excise: 'yes', ae_x_excise_stop: 'yes' }, ['vat']);
  assert.ok(r.ids.includes('ae_x_excise_dereg'));
  assert.deepEqual(windowOf(C('ae_x_excise_dereg').due as any), { n: 30, unit: 'days', kind: 'after' });
  assert.match(C('ae_x_excise_dereg').dueText, /\(6\) six months/); assert.match(C('ae_x_excise_dereg').note ?? '', /unofficial translations/);
});
t('a RAKEZ company files audited statements six months after its year end; the zone question is asked in Ras Al Khaimah', () => {
  const r = run('RK', 'fz', { ae_x_fz_zone: 'rakez', fye: '12-31' }, ['corporate']);
  assert.ok(r.vis.has('ae_x_fz_zone')); assert.equal(r.dates('ae_x_rakez_afs')[0], '2027-06-30');
  assert.match(C('ae_x_rakez_afs').penalty ?? '', /AED 2,500/);
  assert.ok(!run('RK', 'fz', { ae_x_fz_zone: 'other', fye: '12-31' }, ['corporate']).ids.includes('ae_x_rakez_afs'));
  assert.equal(run('DU', 'fz', { ae_x_fz_zone: 'dmcc', fye: '12-31' }, ['corporate']).dates('ae_x_dmcc_afs')[0], '2027-06-30');
});
t('the visa grace period shows the shorter of the two official figures, 60 days, and is "to confirm"', () => {
  const c = C('ae_x_g_visa_grace');
  assert.deepEqual(windowOf(c.due as any), { n: 60, unit: 'days', kind: 'after' }); assert.equal(c.verified, false);
  assert.match(c.note ?? '', /shorter, 60 days, is shown/);
  assert.ok(run('DU', 'individual', { ae_x_res_visa: 'yes' }, ['residency']).ids.includes('ae_x_g_visa_grace'));
});
t('no health-insurance item was added for the five northern emirates', () => {
  assert.ok(!p.compliances.some((c) => /north/i.test(c.id)));
});

console.log('SOURCE-MISMATCH ae_licence');
t('the licence renewal cites a page that states the yearly renewal and stays "to confirm"', () => {
  assert.equal(src('ae_licence').url, 'https://sedd.ae/en/faq'); assert.equal(C('ae_licence').verified, false);
  assert.match(C('ae_licence').dueText, /Sharjah/); assert.match(C('ae_licence').note ?? '', /Annual license renewal/);
});

console.log(`review26_ae: ${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
