// The United States findings of the independent review (S1 to S19), each held by the reviewer's own reproduction.
// What was read on which official page is in docs/compliance-research/REVIEW-US.md.
// Run: node --experimental-strip-types tests/verify/review_us.ts
import assert from 'node:assert/strict';
import { packOf } from '../../src/lib/compliance/index.ts';
import { checkPack } from '../../src/lib/compliance/integrity.ts';
import { evaluate, visibleQuestions } from '../../src/lib/compliance/engine.ts';
import type { Answers, Compliance, Result } from '../../src/lib/compliance/types.ts';

const T = '2026-11-11';
const p = packOf('US')!;
let pass = 0, fail = 0;
const t = (name: string, fn: () => void) => { try { fn(); pass++; } catch (e) { fail++; console.log(`  FAIL  ${name}\n        ${(e as Error).message.split('\n').slice(0, 6).join('\n        ')}`); } };
const C = (id: string): Compliance => { const c = p.compliances.find((x) => x.id === id); assert.ok(c, `no compliance ${id}`); return c!; };
const Q = (id: string) => { const q = p.questions.find((x) => x.id === id); assert.ok(q, `no question ${id}`); return q!; };
/** Answers given, every other question answered `mode` (dates 2019-08-15, year end 31 December unless given). */
function run(state: string, entity: string, want: Answers = {}, depts?: string[], mode: 'no' | 'yes' = 'no', today = T) {
  const sel = { country: 'US', state, entity, depts: depts ?? p.departments.map((d) => d.id) };
  const a: Answers = { ...want };
  for (let i = 0; i < 14; i++) for (const q of visibleQuestions(p, sel, a)) if (a[q.id] === undefined) a[q.id] = q.type === 'yn' ? mode : q.type === 'multi' ? ['none'] : q.type === 'date' ? '2019-08-15' : q.type === 'monthday' ? '12-31' : q.options?.[q.options.length - 1]?.v ?? '';
  const res = evaluate(p, sel, a, today);
  const get = (id: string): Result | undefined => res.find((r) => r.id === id);
  const first = (id: string) => get(id)?.next[0]?.date;
  const asked = visibleQuestions(p, sel, a).map((q) => q.id);
  return { res, a, get, first, asked, ids: res.map((r) => r.id) };
}
const has = (ids: string[], id: string) => assert.ok(ids.includes(id), `${id} is missing`);
const hasNot = (ids: string[], id: string) => assert.ok(!ids.includes(id), `${id} should not be there`);

console.log('review_us: the pack is sound');
t('the country passes the structure check', () => assert.deepEqual(checkPack(p), []));

console.log('S1 Forms 5471 and 8865 are due with the filer\'s own return');
const FOREIGN = { us_foreign_corp: 'yes', us_foreign_pship: 'yes', fye: '12-31' };
t('an S corporation: both on 15 March, the date of Form 1120-S', () => {
  const r = run('TX', 'scorp', FOREIGN);
  assert.equal(r.first('us_1120s'), '2027-03-15');
  assert.equal(r.first('us_5471_pship'), '2027-03-15'); assert.equal(r.first('us_8865_pship'), '2027-03-15');
  for (const id of ['us_5471', 'us_5471_exempt', 'us_8865', 'us_8865_exempt']) hasNot(r.ids, id);
});
t('a partnership: both on 15 March, the date of Form 1065', () => {
  const r = run('TX', 'partnership', FOREIGN);
  assert.equal(r.first('us_1065'), '2027-03-15');
  assert.equal(r.first('us_5471_pship'), '2027-03-15'); assert.equal(r.first('us_8865_pship'), '2027-03-15');
  hasNot(r.ids, 'us_5471'); hasNot(r.ids, 'us_8865');
});
t('a tax-exempt organization: both on the date of its Form 990', () => {
  const r = run('TX', 'nonprofit', { ...FOREIGN, us_np_size: 'large' });
  assert.equal(r.first('us_990'), '2027-05-17');                       // 15 May 2027 is a Saturday
  assert.equal(r.first('us_5471_exempt'), r.first('us_990')); assert.equal(r.first('us_8865_exempt'), r.first('us_990'));
  hasNot(r.ids, 'us_5471'); hasNot(r.ids, 'us_5471_pship');
});
t('a C corporation, a trust and a US person: the 15th day of the 4th month, as before', () => {
  const c = run('TX', 'ccorp', FOREIGN); assert.equal(c.first('us_5471'), c.first('us_1120')); assert.equal(c.first('us_8865'), '2027-04-15');
  assert.equal(run('TX', 'trust', FOREIGN).first('us_5471'), '2027-04-15');
  const i = run('TX', 'individual', { ...FOREIGN, us_status: 'yes' }); assert.equal(i.first('us_5471'), '2027-04-15'); assert.equal(i.first('us_8865'), '2027-04-15');
});
t('exactly one of the three rows applies to every entity type that is asked', () => {
  for (const e of p.entityTypes) {
    const r = run('TX', e.id, { ...FOREIGN, us_status: 'yes' });
    if (!r.asked.includes('us_foreign_corp')) { assert.equal(r.ids.filter((i) => i.startsWith('us_5471')).length, 0, e.id); continue; }
    assert.equal(r.ids.filter((i) => /^us_5471(_|$)/.test(i)).length, 1, `${e.id}: ${r.ids.filter((i) => i.startsWith('us_5471'))}`);
    assert.equal(r.ids.filter((i) => /^us_8865(_|$)/.test(i)).length, 1, e.id);
  }
});

console.log('S2 one new-hire row per state, and it is the state\'s own');
t('the generic 20-day row is gone', () => assert.ok(!p.compliances.some((c) => c.id === 'us_x_newhire')));
t('every state and DC shows exactly one new-hire row to an employer, its own', () => {
  for (const s of p.states) {
    const r = run(s.code, 'ccorp', { us_employees: 'yes' }, ['labour']);
    assert.deepEqual(r.res.filter((x) => /newhire/.test(x.id)).map((x) => x.id), [`us_x_${s.code.toLowerCase()}_newhire`], s.code);
  }
  assert.match(run('AL', 'ccorp', { us_employees: 'yes' }, ['labour']).get('us_x_al_newhire')!.rule!, /7 days/);
});

console.log('S3 a 30 June year end');
t('Illinois: 15 September for a June year end, 15 April for a calendar year', () => {
  const j = run('IL', 'ccorp', { fye: '06-30' });
  assert.equal(j.first('us_il_1120_june'), '2027-09-15'); hasNot(j.ids, 'us_il_1120');
  assert.ok(j.get('us_il_1120_june')!.penalty, 'the June row lost the penalty');
  const d = run('IL', 'ccorp', { fye: '12-31' });
  assert.equal(d.first('us_il_1120'), '2027-04-15'); hasNot(d.ids, 'us_il_1120_june');
});
t('Florida: 1 October for a June year end (the earlier of the Department\'s two dates), 1 May otherwise', () => {
  const j = run('FL', 'ccorp', { fye: '06-30' });
  assert.equal(j.first('us_fl_1120_june'), '2027-10-01'); hasNot(j.ids, 'us_fl_1120');
  assert.equal(j.get('us_fl_1120_june')!.verified, false);
  const d = run('FL', 'ccorp', { fye: '12-31' });
  assert.equal(d.first('us_fl_1120'), '2027-05-03'); hasNot(d.ids, 'us_fl_1120_june');      // 1 May 2027 is a Saturday
});
t('the June rule reads the year end the corporation already gave: no extra question is asked', () => {
  assert.ok(!packOf('US')!.questions.some((q) => q.id === 'us_fye_june'));
  const other = run('IL', 'ccorp', { fye: '09-30' });
  hasNot(other.ids, 'us_il_1120_june'); assert.ok(other.ids.includes('us_il_1120'));
});
t('federal Form 1120, June year end: 15 October 2027 (the law for years beginning after 2025), and the note says why', () => {
  const r = run('TX', 'ccorp', { fye: '06-30' });
  assert.equal(r.first('us_1120'), '2027-10-15');
  assert.match(C('us_1120').note ?? '', /beginning after December 31, 2025/);
});

console.log('S4 Maryland paid leave starts with the payment of 30 April 2027');
t('no date before 30 April 2027', () => {
  const r = run('MD', 'ccorp', { us_employees: 'yes' }, ['labour']);
  assert.deepEqual(r.get('us_x_md_pfml')!.next.map((n) => n.date), ['2027-04-30', '2027-07-31']);
});

console.log('S5 Rhode Island: the last business day');
t('Friday 29 January 2027, not Sunday 31 January', () => {
  const r = run('RI', 'ccorp', { us_employees: 'yes' }, ['labour']);
  assert.deepEqual(r.get('us_x_ri_uiwage')!.next.map((n) => n.date), ['2027-01-29', '2027-04-30']);
});
t('every listed date is a weekday and the last one of its month', () => {
  const d = C('us_x_ri_uiwage').due; assert.equal(d.t, 'on');
  for (const s of (d as { dates: string[] }).dates) {
    const x = new Date(s + 'T00:00:00Z'); assert.ok(x.getUTCDay() >= 1 && x.getUTCDay() <= 5, s);
    for (let n = 1; n <= 3; n++) { const y = new Date(x.getTime() + n * 86400000); if (y.getUTCMonth() !== x.getUTCMonth()) break; assert.ok(y.getUTCDay() === 0 || y.getUTCDay() === 6, `${s}: a later weekday in the month`); }
  }
});

console.log('S6 "before 1 November" is 31 October');
t('the nine rows of the finding, and Missouri, North Carolina and Indiana', () => {
  for (const st of ['NE', 'NH', 'NV', 'SC', 'SD', 'UT', 'VA', 'WV', 'MO', 'NC', 'IN'])
    assert.equal(run(st, 'ccorp', { us_x_unclaimed: 'yes' }, ['state']).first(`us_x_${st.toLowerCase()}_unclaimed`), '2027-10-31', st);
  assert.equal(run('VT', 'ccorp', { us_x_unclaimed: 'yes' }, ['state']).first('us_x_vt_unclaimed'), '2027-04-30');
});
t('no unclaimed-property row lands on the day its own sentence says to file before', () => {
  const M = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
  const re = new RegExp(`(on or |later than )?\\b(?:before|prior to)\\s+(?:the\\s+)?(?:first day of\\s+)?(${M.join('|')})\\s+(\\d{1,2}|first)?`, 'gi');
  const late: string[] = [];
  for (const c of p.compliances) {
    if (!/_unclaimed$/.test(c.id) || c.due.t !== 'fixed') continue;
    for (const m of Array.from(c.dueText.split(/[.;(]/)[0].matchAll(re))) {
      if (m[1]) continue;
      const mo = M.indexOf(m[2].toLowerCase()) + 1, day = !m[3] || m[3] === 'first' ? 1 : Number(m[3]);
      if (c.due.dates.some(([a, b]) => a === mo && b === day)) late.push(c.id);
    }
  }
  assert.deepEqual(late, []);
});
t('Alaska: "before January 2" is 1 January', () => {
  assert.equal(run('AK', 'ccorp', { us_st_date: '2019-08-15' }, ['state']).first('us_ar_ak_both'), '2027-01-01');
});

console.log('S7 Connecticut paid leave is due on the last day of the quarter');
t('31 December 2026, not 31 January 2027', () => assert.equal(run('CT', 'ccorp', { us_employees: 'yes' }, ['labour']).first('us_x_ct_pfml'), '2026-12-31'));

console.log('S8 a 501(c)(3) organization is not told to file Form 940');
t('a 501(c)(3) with staff: no Form 940, no FUTA deposits, no FUTA question', () => {
  const r = run('TX', 'nonprofit', { us_employees: 'yes', us_np_c3: 'yes' }, ['payroll']);
  hasNot(r.ids, 'us_940'); hasNot(r.ids, 'us_futa_dep'); assert.ok(!r.asked.includes('us_futa500'));
  has(r.ids, 'us_941'); has(r.ids, 'us_w2');
});
t('another exempt organization, and every business, still gets it; "not sure" shows it as "check"', () => {
  const n = run('TX', 'nonprofit', { us_employees: 'yes', us_np_c3: 'no', us_futa500: 'yes' }, ['payroll']); has(n.ids, 'us_940'); has(n.ids, 'us_futa_dep');
  assert.equal(run('TX', 'nonprofit', { us_employees: 'yes', us_np_c3: 'unsure' }, ['payroll']).get('us_940')?.certainty, 'check');
  const c = run('TX', 'ccorp', { us_employees: 'yes' }, ['payroll']); assert.equal(c.get('us_940')?.certainty, 'applies'); assert.ok(!c.asked.includes('us_np_c3'));
});

console.log('S9 Ohio Commercial Activity Tax: only above $6 million, every quarter');
t('not shown to an Ohio business that answers no; shown with its quarterly date to one above $6 million', () => {
  hasNot(run('OH', 'sole_prop', { us_status: 'yes' }).ids, 'us_oh_cat');
  const r = run('OH', 'ccorp', { us_oh_rev: 'yes' }, ['state']);
  assert.equal(r.first('us_oh_cat'), '2027-02-10'); assert.equal(r.get('us_oh_cat')!.frequency, 'quarterly'); assert.equal(r.get('us_oh_cat')!.verified, true);
  assert.match(r.get('us_oh_cat')!.sourceUrl, /Small_Business_Tax_Guide_2026/);
  assert.ok(!run('TX', 'ccorp').asked.includes('us_oh_rev'));
});

console.log('S10 a nonresident alien is not told Forms 5471, 8865 and 3520');
const ABROAD = { us_foreign_corp: 'yes', us_foreign_pship: 'yes', us_foreign_gift: 'yes', us_foreign_trust: 'yes', us_foreign_acct: 'yes' };
t('none of the three, no FBAR, and none of the five questions', () => {
  for (const e of ['individual', 'sole_prop']) {
    const r = run('TX', e, { ...ABROAD, us_status: 'no' });
    for (const id of ['us_5471', 'us_8865', 'us_3520', 'us_fbar', 'us_8938']) hasNot(r.ids, id);
    for (const q of Object.keys(ABROAD)) assert.ok(!r.asked.includes(q), `${e} is asked ${q}`);
    has(r.ids, 'us_1040nr');
  }
});
t('a citizen or resident gets all of them; "not sure" about status shows them as "check"', () => {
  const r = run('TX', 'individual', { ...ABROAD, us_status: 'yes' });
  for (const id of ['us_5471', 'us_8865', 'us_3520', 'us_fbar']) assert.equal(r.get(id)?.certainty, 'applies', id);
  const u = run('TX', 'individual', { ...ABROAD, us_status: 'unsure' });
  for (const id of ['us_5471', 'us_8865', 'us_3520', 'us_fbar']) assert.equal(u.get(id)?.certainty, 'check', id);
  has(run('TX', 'ccorp', { us_foreign_acct: 'yes' }).ids, 'us_fbar');
});

console.log('S11 Delaware corporate income tax: only a corporation doing business there');
t('absent for a corporation that is only incorporated in Delaware, present for one doing business there', () => {
  const n = run('DE', 'ccorp', { us_de_biz: 'no' }); hasNot(n.ids, 'us_de_cit'); has(n.ids, 'us_1120');
  assert.equal(run('DE', 'ccorp', { us_de_biz: 'yes' }).first('us_de_cit'), '2027-04-15');
  assert.equal(run('DE', 'ccorp', { us_de_biz: 'unsure' }).get('us_de_cit')?.certainty, 'check');
});

console.log('S12 state retirement programmes and Delaware paid leave: only the employers the text describes');
t('New Jersey and Virginia: not for an employer with its own plan, nor for one below the head count', () => {
  // Since review 26 (B1) the head count is asked positively: New Jersey by size band, Virginia "five or more".
  for (const [st, id, big, small] of [['NJ', 'us_x_nj_retire', { us_x_nj_size: '10to19' }, { us_x_nj_size: 'u10' }], ['VA', 'us_x_va_retire', { us_x_va_5plus: 'yes' }, { us_x_va_5plus: 'no' }]] as const) {
    hasNot(run(st, 'ccorp', { us_employees: 'yes', us_x_retirement_plan: 'yes', ...big }, ['labour']).ids, id);
    hasNot(run(st, 'ccorp', { us_employees: 'yes', us_x_retirement_plan: 'no', ...small }, ['labour']).ids, id);
    assert.equal(run(st, 'ccorp', { us_employees: 'yes', us_x_retirement_plan: 'no', ...big }, ['labour']).get(id)?.certainty, 'applies', id);
    assert.ok(!run('TX', 'ccorp', { us_employees: 'yes' }, ['labour']).asked.includes(Object.keys(small)[0]));
  }
});
t('Delaware paid leave: not for fewer than 10 eligible employees', () => {
  hasNot(run('DE', 'ccorp', { us_employees: 'yes', us_x_de_10plus: 'no' }, ['labour']).ids, 'us_x_de_pfml');
  has(run('DE', 'ccorp', { us_employees: 'yes', us_x_de_10plus: 'yes' }, ['labour']).ids, 'us_x_de_pfml');
});

console.log('S13 a Madrid trademark files Section 71 only');
t('Madrid: Section 71, not Section 8 or the Section 8 and 9 renewal; otherwise the other way round', () => {
  const m = run('TX', 'ccorp', { us_x_trademark: 'yes', us_x_g_tm_madrid: 'yes' }, ['ip']);
  has(m.ids, 'us_x_g_tm_sec71'); hasNot(m.ids, 'us_x_tm_sec8'); hasNot(m.ids, 'us_x_tm_renew');
  const n = run('TX', 'ccorp', { us_x_trademark: 'yes', us_x_g_tm_madrid: 'no' }, ['ip']);
  hasNot(n.ids, 'us_x_g_tm_sec71'); has(n.ids, 'us_x_tm_sec8'); has(n.ids, 'us_x_tm_renew');
});

console.log('S14 Delaware gross receipts tax has no yearly filers');
t('a Delaware seller is asked Delaware\'s own question, with month and quarter only, and always gets a row', () => {
  const q = run('DE', 'ccorp', { us_sells: 'yes', us_de_grt_freq: 'q' }, ['sales']);
  assert.ok(q.asked.includes('us_de_grt_freq') && !q.asked.includes('us_sales_freq'));
  assert.deepEqual(Q('us_de_grt_freq').options!.map((o) => o.v), ['m', 'q']);
  has(q.ids, 'us_de_sales_q'); has(run('DE', 'ccorp', { us_sells: 'yes', us_de_grt_freq: 'm' }, ['sales']).ids, 'us_de_sales_m');
  const t2 = run('TX', 'ccorp', { us_sells: 'yes', us_sales_freq: 'a' }, ['sales']); assert.ok(t2.asked.includes('us_sales_freq') && !t2.asked.includes('us_de_grt_freq')); has(t2.ids, 'us_tx_sales_a');
});

console.log('S17 questions');
t('the size of a tax-exempt organization: a private foundation has one answer only', () => {
  const o = Q('us_np_size').options!;
  assert.equal(o[0].v, 'pf');
  for (const x of o.filter((k) => k.v !== 'pf')) assert.match(x.label, /^Not a private foundation/);
  assert.match(o.find((k) => k.v === 'mid')!.label, /above \$50,000/);
});
t('payroll deposits: the three answers do not overlap', () => {
  const o = Object.fromEntries(Q('us_deposit').options!.map((k) => [k.v, k.label]));
  assert.match(o.small, /Less than \$2,500/); assert.match(o.monthly, /\$2,500 or more.*\$50,000 or less/); assert.match(o.semi, /More than \$50,000/);
});
t('the OSHA industry question only for 20 to 249 employees; the PBGC question only with a retirement plan', () => {
  const base = { us_employees: 'yes', us_x_emp11: 'yes' };   // review 26 (C8): the workplace size is not asked of a business that never had more than 10
  assert.ok(run('TX', 'ccorp', { ...base, us_x_est_size: '20to249' }, ['labour']).asked.includes('us_x_osha_appa'));
  for (const v of ['u20', '250plus']) assert.ok(!run('TX', 'ccorp', { ...base, us_x_est_size: v }, ['labour']).asked.includes('us_x_osha_appa'), v);
  has(run('TX', 'ccorp', { ...base, us_x_est_size: '250plus' }, ['labour']).ids, 'us_x_osha_ita');
  assert.ok(run('TX', 'ccorp', { ...base, us_x_retirement_plan: 'yes' }, ['labour']).asked.includes('us_x_db_plan'));
  assert.ok(!run('TX', 'ccorp', { ...base, us_x_retirement_plan: 'no' }, ['labour']).asked.includes('us_x_db_plan'));
  has(run('TX', 'ccorp', { ...base, us_x_retirement_plan: 'yes', us_x_db_plan: 'yes' }, ['labour']).ids, 'us_x_pbgc');
});
t('one question at a time, and no threshold of the wrong year stated as this year\'s', () => {
  assert.ok(!/, and have you/.test(Q('us_x_dmca').text));
  assert.match(Q('us_income_over').help!, /2025 returns only/); assert.ok(!/17,750/.test(Q('us_income_over').help!));
});
t('a California nonprofit is not told it is an LLC', () => {
  assert.match(run('CA', 'nonprofit', { us_st_date: '2019-08-15' }, ['state']).get('us_ar_ca_llc')!.why, /nonprofit corporation/);
});

console.log('S18 labels and sources');
t('the ten-yearly trademark renewal is not labelled yearly', () => assert.equal(C('us_x_tm_renew').frequency, 'event'));
t('Form 990: the penalty links to the page that states it', () => {
  const r = run('TX', 'nonprofit', { us_np_size: 'large' }).get('us_990')!;
  assert.equal(r.penaltySourceUrl, 'https://www.irs.gov/instructions/i990'); assert.match(r.penalty!, /\$1,309,500/);
});
t('Texas information report: date and penalty from the pages that carry them', () => {
  const r = run('TX', 'ccorp', {}, ['state']).get('us_tx_pir')!;
  assert.match(r.sourceUrl, /pir-oir-filing-req/); assert.equal(r.penaltySourceUrl, 'https://comptroller.texas.gov/taxes/franchise/'); assert.equal(r.next[0].date, '2027-05-17');   // 15 May 2027 is a Saturday
});
t('new-hire rows of Indiana, Louisiana, New Jersey and Rhode Island cite the state\'s own page or statute', () => {
  for (const [st, host] of [['IN', 'www.in.gov'], ['LA', 'legis.la.gov'], ['NJ', 'lis.njleg.state.nj.us'], ['RI', 'webserver.rilegislature.gov']] as const)
    assert.equal(new URL(run(st, 'ccorp', { us_employees: 'yes' }, ['labour']).get(`us_x_${st.toLowerCase()}_newhire`)!.sourceUrl).hostname, host, st);
});
t('the generic state income tax row is "to confirm": no date was read on the page it cites', () => assert.equal(C('us_st_pit').verified, false));

console.log('S19 Illinois employer registration: before hiring');
t('the rule and its sentence say "before"', () => {
  const r = run('IL', 'ccorp', { us_employees: 'yes' }, ['state']).get('us_il_emp')!;
  assert.equal(r.rule, 'Before you hire an employee'); assert.match(r.dueText, /before you make any purchases or sales, or hire an employee/);
  assert.equal(r.window, undefined);
});

console.log(`\nreview_us: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
