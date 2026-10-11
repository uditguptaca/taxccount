// T1 questionnaire: structure checks and 20 synthetic taxpayers through the SAME engine the app uses.
// Run: node --experimental-strip-types tests/verify/t1_engine.ts
import assert from 'node:assert/strict';
import { CATALOGUE as cat } from '../../src/lib/t1/catalogue/index.ts';
import { checkCatalogue } from '../../src/lib/t1/integrity.ts';
import { applicable, checklist, evalCond, inactiveAnswers, moduleActive, progress, recordsOf } from '../../src/lib/t1/evaluate.ts';
import { validate, sinIsValid, canSubmit } from '../../src/lib/t1/validate.ts';
import { buildPackage, toCsv, toText } from '../../src/lib/t1/package.ts';
import { ak } from '../../src/lib/t1/types.ts';
import type { AnswerMap, AnswerValue, Ctx, Finding } from '../../src/lib/t1/types.ts';

let pass = 0, fail = 0;
const t = (name: string, fn: () => void) => { try { fn(); pass++; } catch (e) { fail++; console.log(`  FAIL  ${name}\n        ${(e as Error).message.split('\n').slice(0, 4).join('\n        ')}`); } };

// ── helpers to write a taxpayer ──
class P {
  answers: AnswerMap = {}; year = 2025;
  constructor(year = 2025) { this.year = year; }
  set(q: string, v: AnswerValue, rec = 0) { this.answers[ak(q, rec)] = { v }; return this; }
  flag(q: string, flag: 'unsure' | 'later' | 'ask', rec = 0, note?: string) { this.answers[ak(q, rec)] = { ...(this.answers[ak(q, rec)] ?? {}), flag, note }; return this; }
  prov(p: string) { return this.set('B.res.province', p); }
  ctx(): Ctx { return { year: this.year, answers: this.answers }; }
  active(code: string) { return moduleActive(cat, this.ctx(), cat.mod.get(code)!); }
  findings(): Finding[] { return validate(cat, this.ctx()); }
  has(sub: RegExp, sev?: string) { return this.findings().some((f) => sub.test(f.title[0]) && (!sev || f.sev === sev)); }
}
const mustHave = (p: P, sub: RegExp, sev?: string) => assert.ok(p.has(sub, sev), `expected a finding matching ${sub}${sev ? ` (${sev})` : ''}; got:\n${p.findings().map((f) => `   [${f.sev}] ${f.title[0]}`).slice(0, 12).join('\n')}`);
const mustNot = (p: P, sub: RegExp) => assert.ok(!p.has(sub), `did not expect a finding matching ${sub}`);

// ── 1. the catalogue itself ──
console.log('catalogue');
t('integrity: no structural problems', () => { const bad = checkCatalogue(cat); assert.deepEqual(bad, [], bad.slice(0, 5).map((b) => `${b.where}: ${b.problem}`).join('\n')); });
t('size: a real questionnaire, not filler', () => {
  assert.equal(cat.modules.length, 30);
  assert.ok(cat.q.size >= 1400, `${cat.q.size} questions`);
  const nonInfo = Array.from(cat.q.values()).filter((q) => q.type !== 'info');
  const cond = nonInfo.filter((q) => q.show || cat.sec.get(q.sec)!.show || cat.mod.get(q.mod)!.show);
  assert.ok(cond.length / nonInfo.length > 0.8, `only ${cond.length} of ${nonInfo.length} questions are conditional`);
});
t('every question has both languages', () => { for (const q of Array.from(cat.q.values())) { assert.ok(q.text[0] && q.text[1], q.id); } });
t('SIN checksum', () => { assert.ok(sinIsValid('046 454 286')); assert.ok(!sinIsValid('123 456 789')); assert.ok(!sinIsValid('000000000')); });

// ── 2. the rules of the engine ──
console.log('engine rules');
t('blank is never No or zero', () => {
  const p = new P();
  assert.ok(!evalCond({ q: 'F.inc.rental', op: 'no' }, cat, p.ctx()));
  assert.ok(!evalCond({ q: 'F.inc.rental', op: 'maybe' }, cat, p.ctx()));
  assert.ok(!evalCond({ q: 'F.inc.rental', op: 'ne', v: 'yes' }, cat, p.ctx()), 'ne on a blank must not be true');
  assert.ok(!p.active('M'), 'rental module stays off until the screening says so');
});
t('"I\'m not sure" opens the branch and is flagged', () => {
  const p = new P().set('F.inc.rental', 'unsure');
  assert.ok(p.active('M'));
  mustHave(p, /not sure/i);
});
t('"I will provide this later" is honest, not complete', () => {
  const p = new P().prov('ON').set('F.inc.employment', 'yes').flag('G.t4.file', 'later', 0);
  const prog = progress(cat, p.ctx());
  const g = prog.modules.find((m) => m.code === 'G')!;
  assert.notEqual(g.status, 'complete');
  const doc = checklist(cat, p.ctx()).find((d) => d.key === 'T4');
  assert.ok(doc && doc.status === 'later', 'the T4 appears on the checklist as "later"');
});
t('"Ask my preparer" becomes a client question for the preparer', () => {
  const p = new P().set('F.inc.rental', 'yes').flag('M.any.count', 'ask', 0, 'Is my basement suite a rental?');
  mustHave(p, /Client question/i);
});
t('changing an answer keeps the old one, shown as no longer in the form', () => {
  const p = new P().prov('ON').set('F.inc.rental', 'yes').set('M.prop.address', '1 Main St', 0);
  assert.equal(inactiveAnswers(cat, p.ctx()).length, 0);
  p.set('F.inc.rental', 'no');
  const gone = inactiveAnswers(cat, p.ctx());
  assert.ok(gone.some((g) => g.q.id === 'M.prop.address'), 'the address is kept, not deleted');
});
t('2024 and other unverified years produce review items instead of guesses', () => {
  const p = new P(2024).prov('ON');
  mustHave(p, /have not been verified/i);
  assert.ok(!new P(2025).prov('ON').has(/have not been verified/i));
});

// ── 3. twenty synthetic taxpayers ──
console.log('scenarios');
t('01 employee in Ontario with one T4', () => {
  const p = new P().prov('ON').set('F.inc.employment', 'yes').set('G.t4.issuer', 'Acme Ltd', 0).set('G.t4.year', '2025', 0).set('G.t4.b14', 52000, 0);
  assert.ok(p.active('G') && !p.active('M') && !p.active('J') && !p.active('AB'));
  assert.equal(recordsOf(cat, p.ctx(), 'G.t4').length, 1);
});
t('02 student with tuition slip', () => {
  const p = new P().prov('ON').set('F.ded.education', 'yes').set('G.t2202.issuer', 'University', 0);
  assert.ok(p.active('W') && p.active('G'));
});
t('03 newcomer who arrived this year', () => {
  const p = new P().prov('BC').set('C.life.arrived', 'yes').set('C.newcomer.arrival', '2025-08-15');
  assert.ok(p.active('C'));
  assert.ok(applicable(cat, p.ctx()).some((s) => s.q.id === 'C.newcomer.worldwide'));
});
t('04 person who left Canada', () => {
  const p = new P().prov('AB').set('C.life.left', 'yes');
  assert.ok(applicable(cat, p.ctx()).some((s) => s.q.id.startsWith('C.emigrant')));
});
t('05 gig worker with platform income', () => {
  const p = new P().prov('ON').set('F.inc.platform', 'yes');
  assert.ok(p.active('J'));
  mustHave(p, /Platform or gig income reported, but no business/i, 'blocking');
  p.set('J.biz.name', 'Rides', 0);
  mustNot(p, /Platform or gig income reported, but no business/i);
});
t('06 landlord with two properties and shares that do not add up', () => {
  const p = new P().prov('ON').set('F.inc.rental', 'yes').set('M.prop.address', '1 A St', 0).set('M.prop.share', 50, 0).set('M.prop.coOwners', [{ name: 'Sam', share: 30 }], 0).set('M.prop.address', '2 B St', 1);
  assert.equal(recordsOf(cat, p.ctx(), 'M.prop').length, 2);
  mustHave(p, /ownership shares add up to 80/i);
});
t('07 short-term rental without a licence goes to a specialist', () => {
  const p = new P().prov('ON').set('F.inc.rental', 'yes').set('F.inc.shortTerm', 'yes').set('M.prop.address', '1 A St', 0).set('M.short.licence', 'no', 0);
  mustHave(p, /without a confirmed licence/i, 'specialist');
});
t('08 sold a home in under a year, details missing', () => {
  const p = new P().prov('ON').set('F.inc.property', 'yes').set('P.any.sold', 'yes').set('P.home.what', 'sold', 0).set('P.home.address', '5 Elm', 0).set('P.home.soldDate', '2025-06-01', 0).set('P.home.acquired', '2025-01-10', 0);
  mustHave(p, /cannot be reported without/i, 'blocking');
  mustHave(p, /365 days/i, 'specialist');
});
t('09 crypto holder', () => {
  const p = new P().prov('ON').set('F.inc.crypto', 'yes');
  assert.ok(p.active('Q'));
  mustHave(p, /Crypto reported, but no exchange/i);
});
t('10 foreign property above the T1135 threshold', () => {
  const p = new P().prov('ON').set('F.inc.foreign', 'yes').set('R.prop.cat', 'real', 0).set('R.prop.maxCost', 180000, 0);
  mustHave(p, /Form T1135 is likely required/i, 'specialist');
  const q = new P(2024).prov('ON').set('F.inc.foreign', 'yes').set('R.prop.cat', 'real', 0).set('R.prop.maxCost', 180000, 0);
  mustHave(q, /threshold for that year has not been verified/i, 'specialist');
  mustNot(q, /Form T1135 is likely required/i);
});
t('11 RRSP and FHSA timing', () => {
  const p = new P().prov('ON').set('F.ded.rrsp', 'yes').set('S.any.contributed', 'yes').set('S.contrib.amount', 5000, 0).set('S.contrib.date', '2026-02-10', 0).set('S.contrib.when', 'during', 0);
  mustHave(p, /first 60 days of 2026/i);
  const q = new P().prov('ON').set('F.ded.fhsa', 'yes').set('T.acct.contrib', [{ date: '2026-01-15', amount: 4000, kind: 'cash' }], 0);
  mustHave(q, /FHSA contributions dated after 31 December/i);
});
t('12 separated parent paying support and childcare', () => {
  const p = new P().prov('ON').set('D.status.marital', 'separated').set('F.ded.supportPaid', 'yes').set('F.ded.childcare', 'yes').set('V.care.paid', 3000, 0).set('V.care.reimb', 4000, 0);
  assert.ok(p.active('V'));
  mustHave(p, /reimbursed is more than the amount paid/i);
});
t('13 single parent', () => {
  const p = new P().prov('SK').set('D.status.marital', 'single').set('E.any.has', 'yes').set('E.dep.name', 'Kid', 0).set('E.dep.relationship', 'child', 0).set('E.dep.dob', '2019-04-02', 0);
  assert.equal(recordsOf(cat, p.ctx(), 'E.dep').length, 1);
  assert.ok(applicable(cat, p.ctx()).some((s) => s.q.id === 'E.dep.custody'));
});
t('14 senior with OAS and a foreign pension', () => {
  const p = new P().prov('NS').set('B.id.dob', '1955-03-03').set('F.inc.pension', 'yes').set('I.oas.got', 'yes');
  assert.ok(p.active('I'));
});
t('15 person with a disability tax credit certificate', () => {
  const p = new P().prov('MB').set('F.ded.disability', 'yes');
  assert.ok(p.active('X'));
  p.set('X.any.any', 'yes').set('X.dtc.who', 'self', 0);
  assert.ok(applicable(cat, p.ctx()).some((s) => s.q.id.startsWith('X.dtc')));
});
t('16 return for a person who died', () => {
  const p = new P().prov('ON').set('B.status.died', 'yes').set('B.status.deathDate', '2025-07-01');
  assert.ok(p.active('AC'));
  assert.ok(applicable(cat, p.ctx()).some((s) => s.sec.id === 'AC.dead'));
});
t('17 Québec resident gets the Québec module and the foreign property return', () => {
  const p = new P().prov('QC').set('F.inc.foreign', 'yes').set('R.prop.cat', 'real', 0).set('R.prop.maxCost', 150000, 0);
  assert.ok(p.active('AB'));
  mustHave(p, /TP-1079\.8\.BE-V/i, 'specialist');
  const on = new P().prov('ON');
  assert.ok(!on.active('AB'));
});
t('18 the same slip twice, and an original beside a corrected one', () => {
  const p = new P().prov('ON').set('F.inc.employment', 'yes');
  for (const r of [0, 1]) { p.set('G.t4.issuer', 'Acme Ltd', r).set('G.t4.year', '2025', r).set('G.t4.b14', 52000, r).set('G.t4.status', 'original', r); }
  mustHave(p, /same slip appears 2 times/i);
  p.set('G.t4.b14', 51000, 1).set('G.t4.status', 'amended', 1);
  mustHave(p, /original and a corrected slip/i);
  p.set('G.t4.year', '2024', 1);
  mustHave(p, /slip is for 2024 but this return is for 2025/i, 'blocking');
});
t('19 nothing is assumed from silence', () => {
  const p = new P();
  const f = p.findings();
  assert.ok(f.some((x) => x.kind === 'required'), 'the required identity questions are reported missing');
  assert.ok(!canSubmit(f), 'an empty form cannot be submitted');
  assert.ok(!p.active('M') && !p.active('J') && !p.active('K'));
});
t('20 full journey: language, package and export', () => {
  const p = new P().prov('ON').set('B.name.first', 'Ana').set('B.name.last', 'Lopez').set('B.id.sin', '046 454 286').set('F.inc.employment', 'yes').set('G.t4.issuer', 'Acme, "Ltd"', 0).set('G.t4.b14', 52000, 0).set('G.t4.year', '2025', 0).set('G.t4.recipient', '=HYPERLINK("x")', 0);
  const pkg = buildPackage(cat, p.ctx(), { lang: 'fr', findings: p.findings() });
  assert.equal(pkg.meta.taxpayer, 'Ana Lopez');
  assert.ok(pkg.modules.length >= 3);
  const csv = toCsv(pkg, { maskSin: true });
  assert.ok(!csv.includes('046 454 286'), 'the SIN is masked in exports');
  assert.ok(!/,=HYPERLINK/.test(csv), 'a client cell can never start a spreadsheet formula');
  assert.ok(toText(pkg).includes('T1'));
  assert.ok(pkg.documents.some((d) => d.key === 'T4'));
});
t('21 recipient name that is not the taxpayer or the spouse', () => {
  const p = new P().prov('ON').set('B.name.first', 'Ana').set('B.name.last', 'Lopez').set('F.inc.employment', 'yes').set('G.t4.issuer', 'Acme', 0).set('G.t4.recipient', 'Bob Smith', 0);
  mustHave(p, /name on the slip does not match/i);
});

console.log(`\nt1_engine: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
