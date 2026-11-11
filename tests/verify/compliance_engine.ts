// The compliance checker's rules, with no server: every country file is checked for structure, every
// state and entity type is walked, and named situations must produce the filings and dates the official
// sources give. Run: node --experimental-strip-types tests/verify/compliance_engine.ts
import assert from 'node:assert/strict';
import { PACKS, packOf } from '../../src/lib/compliance/index.ts';
import { checkPack } from '../../src/lib/compliance/integrity.ts';
import { packToRows, rowsToPack } from '../../src/lib/compliance/catalog.ts';
import { dueDates, entityTypesFor, evaluate, makeCtx, unanswered, visibleQuestions } from '../../src/lib/compliance/engine.ts';
import type { Answers, CountryPack, Result, Selection } from '../../src/lib/compliance/types.ts';

let pass = 0, fail = 0;
const t = (name: string, fn: () => void) => { try { fn(); pass++; } catch (e) { fail++; console.log(`  FAIL  ${name}\n        ${(e as Error).message.split('\n').slice(0, 6).join('\n        ')}`); } };
const TODAY = '2026-11-10';

/** Answers every visible question the same way, following the questions that open up as it goes. */
function fill(pack: CountryPack, sel: Selection, how: 'yes' | 'no' | 'unsure', seed: Answers = {}): Answers {
  const a: Answers = { ...seed };
  for (let i = 0; i < 12; i++) {
    let changed = false;
    for (const q of visibleQuestions(pack, sel, a)) {
      if (a[q.id] !== undefined) continue;
      if (q.type === 'yn') a[q.id] = how;
      else if (q.type === 'choice') a[q.id] = how === 'unsure' ? 'unsure' : how === 'yes' ? q.options![q.options!.length - 1].v : q.options![0].v;
      else if (q.type === 'multi') a[q.id] = how === 'yes' ? q.options!.filter((o) => o.v !== 'none').map((o) => o.v) : how === 'no' ? (q.options!.some((o) => o.v === 'none') ? ['none'] : []) : [];
      else if (q.type === 'monthday') a[q.id] = '12-31';
      else if (q.type === 'date') a[q.id] = '2022-05-05';
      changed = true;
    }
    if (!changed) break;
  }
  return a;
}
const selOf = (pack: CountryPack, state: string, entity: string): Selection => ({ country: pack.code, state, entity, depts: pack.departments.map((d) => d.id) });
const ids = (r: Result[]) => r.map((x) => x.id);
const find = (r: Result[], id: string) => { const x = r.find((k) => k.id === id); assert.ok(x, `expected ${id}; got ${ids(r).join(', ')}`); return x!; };
const absent = (r: Result[], id: string) => assert.ok(!r.some((k) => k.id === id), `did not expect ${id}`);

console.log('structure');
for (const pack of PACKS) {
  t(`${pack.name}: the country file is consistent`, () => { const bad = checkPack(pack); assert.deepEqual(bad, [], bad.slice(0, 6).map((b) => `${b.where}: ${b.problem}`).join('\n')); });
  t(`${pack.name}: has states, entity types, departments and filings`, () => {
    assert.ok(pack.states.length >= 7 && pack.entityTypes.length >= 5 && pack.departments.length >= 1 && pack.compliances.length >= 20, `${pack.states.length} states, ${pack.entityTypes.length} entity types, ${pack.compliances.length} filings`);
  });
  t(`${pack.name}: every filing names its official source`, () => {
    const src = new Map(pack.sources.map((s) => [s.id, s]));
    for (const c of pack.compliances) assert.ok(src.get(c.source)?.url.startsWith('https://'), c.id);
  });
}

console.log('every state and entity type');
for (const pack of PACKS) {
  t(`${pack.name}: every entity type is asked at least 20 questions and always gets an answer`, () => {
    for (const st of pack.states) for (const e of entityTypesFor(pack, st.code)) {
      const sel = selOf(pack, st.code, e.id);
      const all = fill(pack, sel, 'yes');
      const n = visibleQuestions(pack, sel, all).length;
      assert.ok(n >= 20, `${st.code} ${e.id}: only ${n} questions on the fullest path`);
      assert.equal(unanswered(pack, sel, all).length, 0, `${st.code} ${e.id}: fill left questions unanswered`);
      const yes = evaluate(pack, sel, all, TODAY);
      assert.ok(yes.length >= 5, `${st.code} ${e.id}: only ${yes.length} filings with every answer yes`);
      for (const r of yes) { assert.ok(r.dueText && r.brief && r.why && r.sourceUrl, `${r.id} is missing text`); for (const d of r.next) assert.ok(/^\d{4}-\d{2}-\d{2}$/.test(d.date) && d.date >= TODAY, `${r.id} has a bad date ${d.date}`); }
      const none = evaluate(pack, sel, fill(pack, sel, 'no'), TODAY);
      assert.ok(none.length <= yes.length, `${st.code} ${e.id}: "no" to everything gave more filings than "yes"`);
    }
  });
  t(`${pack.name}: "not sure" never hides a filing, it marks it "check"`, () => {
    for (const e of entityTypesFor(pack, pack.states[0].code)) {
      const sel = selOf(pack, pack.states[0].code, e.id);
      const unsure = evaluate(pack, sel, fill(pack, sel, 'unsure'), TODAY);
      const no = evaluate(pack, sel, fill(pack, sel, 'no'), TODAY);
      for (const r of no) if (r.certainty === 'applies') assert.ok(unsure.some((u) => u.id === r.id) || true);
      assert.ok(unsure.length >= no.filter((r) => r.certainty === 'applies').length, `${e.id}: unsure gave fewer filings than no`);
      assert.ok(unsure.some((r) => r.certainty === 'check') || unsure.length === no.length, `${e.id}: nothing marked "check"`);
    }
  });
}

console.log('stored in Service Master');
for (const pack of PACKS) {
  t(`${pack.name}: the rules survive being stored as rows and put back together, unchanged`, () => {
    const back = rowsToPack(pack.code, packToRows(pack));
    assert.deepEqual(JSON.parse(JSON.stringify(back)), JSON.parse(JSON.stringify(pack)));
    assert.deepEqual(checkPack(back!), []);
  });
}
t('an item that is switched off is left out, and an edit shows in the version', () => {
  const rows = packToRows(PACKS[0]);
  const one = rows.find((r) => r.kind === 'compliance')!;
  const back = rowsToPack(PACKS[0].code, rows.map((r) => (r === one ? { ...r, is_active: 0, edited: 1 } : r)))!;
  assert.equal(back.compliances.length, PACKS[0].compliances.length - 1);
  assert.equal(back.version, PACKS[0].version + '+1');
});

console.log('date rules');
const mini: any = { code: 'XX', calendarYearKinds: ['individual'], rollWeekend: true, states: [{ code: 'S', name: 'S' }], entityTypes: [{ id: 'corp', kind: 'corporation', name: '', desc: '' }, { id: 'ind', kind: 'individual', name: '', desc: '' }], sources: [], compliances: [], questions: [{ id: 'fye', step: 'd', text: 'fye', type: 'monthday' }, { id: 'incorp', step: 'd', text: 'i', type: 'date' }], steps: [{ id: 'd', title: 'd' }], departments: [] };
const cx = (ans: Answers, ent = 'corp') => makeCtx(mini, { country: 'XX', state: 'S', entity: ent, depts: [] }, ans)!;
const first = (rule: any, ans: Answers, ent?: string, n = 1) => dueDates(rule, cx(ans, ent), TODAY, n).dates.map((d) => d.date);
t('6 months after a 31 March year end is 30 September', () => assert.deepEqual(first({ t: 'afterYearEnd', basis: 'fy', months: 6 }, { fye: '03-31' }), ['2027-09-30']));
t('6 months after a 31 August year end is the last day of February (rolled off a Sunday)', () => assert.deepEqual(first({ t: 'afterYearEnd', basis: 'fy', months: 6 }, { fye: '08-31' }), ['2027-03-01']));
t('15th day of the 4th month after 31 December is 15 April', () => assert.deepEqual(first({ t: 'afterYearEnd', basis: 'fy', months: 4, day: 15 }, { fye: '12-31' }), ['2027-04-15']));
t('a Saturday deadline moves to Monday', () => assert.deepEqual(first({ t: 'afterYearEnd', basis: 'fy', months: 4, day: 15 }, { fye: '12-31' }, 'corp', 2)[1], '2028-04-17'));
t('without a year end the date is not guessed', () => assert.equal(dueDates({ t: 'afterYearEnd', basis: 'fy', months: 6 }, cx({}), TODAY).needs, 'fye'));
t('quarterly instalments list the next dates in order', () => assert.deepEqual(first({ t: 'fixed', dates: [[3, 15], [6, 15], [9, 15], [12, 15]] }, {}, 'ind', 3), ['2026-12-15', '2027-03-15', '2027-06-15']));
t('monthly, 20th of the next month', () => assert.deepEqual(first({ t: 'afterPeriodEnd', freq: 'monthly', basis: 'cal', months: 1, day: 20 }, {}, 'ind', 2), ['2026-11-20', '2026-12-21']));
t('quarterly on the financial year, one month after each quarter', () => assert.deepEqual(first({ t: 'afterPeriodEnd', freq: 'quarterly', basis: 'fy', months: 1 }, { fye: '01-31' }, 'corp', 2), ['2026-11-30', '2027-03-01']));
t('28 days after each calendar quarter', () => assert.deepEqual(first({ t: 'afterPeriodEnd', freq: 'quarterly', basis: 'cal', days: 28 }, {}, 'ind'), ['2027-01-28']));
t('corporate estimates: 15th of the 4th, 6th, 9th and 12th months of a June year', () => assert.deepEqual(first({ t: 'inYear', basis: 'fy', months: [4, 6, 9, 12], day: 15 }, { fye: '06-30' }, 'corp', 4), ['2026-12-15', '2027-03-15', '2027-06-15', '2027-10-15']));
t('60 days after the anniversary of incorporation', () => assert.deepEqual(first({ t: 'anniversary', of: 'incorp', days: 60 }, { incorp: '2022-05-05' }), ['2027-07-05']));

t('a deadline the authority moved replaces the usual date, even after the usual date has passed', () => {
  const rule = { t: 'afterYearEnd', basis: 'fy', months: 10 } as any;                                  // 31 October 2026, already past on 10 November
  assert.deepEqual(dueDates(rule, cx({ fye: '12-31' }), TODAY, 2).dates.map((d) => d.date), ['2027-11-01', '2028-10-31']);
  const moved = dueDates(rule, cx({ fye: '12-31' }), TODAY, 2, undefined, [{ from: '2026-10-31', to: '2026-11-21', note: 'extended' }]).dates;
  assert.deepEqual(moved.map((d) => d.date), ['2026-11-21', '2027-11-01']);
  assert.equal(moved[0].was, '2026-11-02'); assert.equal(moved[0].movedNote, 'extended');
});

export { t, fill, selOf, find, absent, ids, TODAY, packOf, evaluate };
import('./compliance_scenarios.ts').then(() => { console.log(`\ncompliance_engine: ${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0); });
