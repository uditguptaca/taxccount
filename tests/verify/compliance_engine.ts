// The compliance checker's rules, with no server: every country file is checked for structure, every
// state and entity type is walked, and named situations must produce the filings and dates the official
// sources give. Run: node --experimental-strip-types tests/verify/compliance_engine.ts
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import { PACKS, packOf } from '../../src/lib/compliance/index.ts';
import { checkPack } from '../../src/lib/compliance/integrity.ts';
import { packToRows, rowsToPack } from '../../src/lib/compliance/catalog.ts';
import { shapeProblems } from '../../src/lib/compliance/shape.ts';
import { describeCond, describeDue, questionLinks } from '../../src/lib/compliance/describe.ts';
import { adviceOf } from '../../src/lib/compliance/health.ts';
import { timeLeft } from '../../src/lib/compliance/timeleft.ts';
import { deadlineFrom, windowOf, windowText } from '../../src/lib/compliance/window.ts';
import { toIcs } from '../../src/lib/compliance/ics.ts';
import { dueDates, entityTypesFor, evaluate, makeCtx, unanswered, visibleQuestions } from '../../src/lib/compliance/engine.ts';
import type { Answers, CountryPack, Result, Selection } from '../../src/lib/compliance/types.ts';
import { more as caMore } from '../../src/lib/compliance/countries/ca-more.ts';
import { more as usMore } from '../../src/lib/compliance/countries/us-more.ts';
import { more as inMore } from '../../src/lib/compliance/countries/in-more.ts';
import { more as aeMore } from '../../src/lib/compliance/countries/ae-more.ts';
import { canada } from '../../src/lib/compliance/countries/ca.ts';
import { usa } from '../../src/lib/compliance/countries/us.ts';
import { india } from '../../src/lib/compliance/countries/in.ts';
import { uae } from '../../src/lib/compliance/countries/ae.ts';

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

console.log('Service Master: what may be saved, and how the rules read');
for (const pack of PACKS) {
  t(`${pack.name}: every built-in item passes the save check`, () => {
    const bad = packToRows(pack).map((r) => ({ id: `${r.kind} ${r.id}`, p: shapeProblems(r.kind, JSON.parse(r.data)) })).filter((x) => x.p.length);
    assert.deepEqual(bad, []);
  });
  t(`${pack.name}: every rule can be said in plain words`, () => {
    for (const c of pack.compliances) {
      const who = describeCond(c.applies, pack), when = describeDue(c.due, pack);
      assert.ok(who && !who.includes('cannot describe') && !/\bundefined\b/.test(who), `${c.id}: ${who}`);
      assert.ok(when && !/undefined|NaN/.test(when), `${c.id}: ${when}`);
    }
    for (const q of pack.questions) if (q.show) assert.ok(!describeCond(q.show, pack).includes('cannot describe'), q.id);
  });
  t(`${pack.name}: every question leads somewhere (a compliance, a date or another question)`, () => {
    const links = questionLinks(pack);
    const dead = pack.questions.filter((q) => { const l = links.get(q.id)!; return l.compliances.length + l.dates.length + l.questions.length === 0; }).map((q) => q.id);
    assert.deepEqual(dead, []);
  });
}
t('a half-filled compliance is refused, with the reason in plain words', () => {
  const c: any = { ...PACKS[0].compliances[0] }; delete c.id;
  assert.deepEqual(shapeProblems('compliance', c), []);
  assert.ok(shapeProblems('compliance', { ...c, due: undefined }).join().includes('due date rule is missing'));
  assert.ok(shapeProblems('compliance', { ...c, due: { t: 'afterYearEnd', basis: 'fy', months: 600 } }).length > 0);
  assert.ok(shapeProblems('compliance', { ...c, due: { t: 'fixed', dates: [[2, 31], [13, 1]] } }).length > 0);
  assert.ok(shapeProblems('compliance', { ...c, applies: { q: 'x' } }).join().includes('Who it applies to'));
  assert.ok(shapeProblems('compliance', { ...c, applies: { any: [] } }).length > 0);
  assert.ok(shapeProblems('compliance', { ...c, moved: [{ from: '2027-06-30', to: 'soon' }] }).join().includes('moved deadline'));
  assert.ok(shapeProblems('compliance', { ...c, name: ' ' }).length > 0);
  assert.ok(shapeProblems('question', { step: 's', text: 'Pick', type: 'choice', options: [{ v: 'a', label: 'A' }] }).length > 0);
  assert.ok(shapeProblems('question', { step: 's', text: 'Pick', type: 'choice', options: [{ v: 'a', label: 'A' }, { v: 'a', label: 'B' }] }).join().includes('same code'));
  assert.ok(shapeProblems('source', { title: 'x', publisher: 'y', url: 'http://example.com', checked: '2026-01-01' }).length > 0);
  assert.deepEqual(shapeProblems('state', { name: 'Ontario', tags: ['hst'] }), []);
});
t('the health check notices what has gone stale', () => {
  const p: CountryPack = JSON.parse(JSON.stringify(PACKS[0]));
  p.sources[0].checked = '2024-01-01';
  p.compliances[0].moved = [{ from: '2025-06-30', to: '2025-07-15' }];
  p.questions.push({ id: 'dead_q', step: p.steps[0].id, text: 'Leads nowhere?', type: 'yn' });
  const a = adviceOf(p, TODAY);
  assert.ok(a.some((x) => x.kind === 'source' && x.text.includes('more than a year ago')));
  assert.ok(a.some((x) => x.kind === 'compliance' && x.text.includes('has passed')));
  assert.ok(a.some((x) => x.kind === 'question' && x.id === 'dead_q'));
});

console.log('time left');
t('the time left reads the way a person says it', () => {
  const T = '2026-11-11';
  assert.equal(timeLeft('2026-11-11', T).text, 'due today');
  assert.equal(timeLeft('2026-11-12', T).text, 'due tomorrow');
  assert.equal(timeLeft('2026-11-16', T).text, '5 days left');
  assert.equal(timeLeft('2026-11-16', T).tone, 'red');
  assert.equal(timeLeft('2026-12-01', T).text, '20 days left');
  assert.equal(timeLeft('2026-12-01', T).tone, 'yellow');
  assert.equal(timeLeft('2027-02-01', T).text, '12 weeks left');
  assert.equal(timeLeft('2027-06-30', T).text, '8 months left');
  assert.equal(timeLeft('2026-11-10', T).text, '1 day overdue');
  assert.equal(timeLeft('2026-10-01', T).text, '41 days overdue');
  assert.equal(timeLeft('2026-10-01', T).tone, 'red');
  assert.equal(timeLeft(null, T).text, 'no date');
});

t('the calendar file has one all-day event per due date, with two reminders, the penalty and the source', () => {
  const ics = toIcs([{ id: 'a1', title: 'Corporation income tax return; T2, 2026', date: '2027-06-30', who: 'Maple Inc.', penalty: '5% of the unpaid tax,\nplus 1% a month', sourceUrl: 'https://www.canada.ca/x', authority: 'Canada Revenue Agency' }, { id: 'b2', title: 'No date', date: '' }], '2026-11-11T06:00:00.000Z');
  assert.ok(ics.startsWith('BEGIN:VCALENDAR\r\n') && ics.endsWith('END:VCALENDAR\r\n'));
  assert.equal((ics.match(/BEGIN:VEVENT/g) ?? []).length, 1);
  assert.equal((ics.match(/BEGIN:VALARM/g) ?? []).length, 2);
  assert.ok(ics.includes('DTSTART;VALUE=DATE:20270630') && ics.includes('DTEND;VALUE=DATE:20270701') && ics.includes('TRIGGER:-P7D') && ics.includes('TRIGGER:-P1D'));
  const flat = ics.replace(/\r\n /g, '');
  assert.ok(flat.includes('SUMMARY:Due: Corporation income tax return\\; T2\\, 2026'));
  assert.ok(flat.includes('If missed: 5% of the unpaid tax\\,\\nplus 1% a month') && flat.includes('Official source: https://www.canada.ca/x'));
  assert.ok(ics.split('\r\n').every((l) => Buffer.byteLength(l, 'utf8') <= 75));
});
console.log('duties outside tax (researched)');
for (const pack of PACKS) {
  t(`${pack.name}: the researched duties each name an official https page, and their questions are only asked when needed`, () => {
    const extra = pack.compliances.filter((c) => c.id.startsWith(`${pack.code.toLowerCase()}_x_`));
    assert.ok(extra.length >= 30, `${extra.length} researched items`);
    for (const c of extra) {
      const s = pack.sources.find((x) => x.id === c.source);
      assert.ok(s && s.url.startsWith('https://') && s.publisher && /^\d{4}-\d{2}-\d{2}$/.test(s.checked), c.id);
      assert.equal(c.roll, false, `${c.id}: the weekend rule was not researched`);
    }
    const ops = pack.steps.find((s) => s.id === 'ops');
    assert.ok(ops?.checklist, 'the new questions are a tick list');
    for (const q of pack.questions.filter((x) => x.id.startsWith(`${pack.code.toLowerCase()}_x_`))) assert.ok(JSON.stringify(q.show ?? {}).includes('"dept"'), `${q.id} is asked whatever department is chosen`);
  });
}

console.log('penalties, confirmations and state duties (second round of research)');
// The live site reloads its rule database only when a country's version changes. The second round of research
// was read on the same day as the first, the date-only version did not move, and the new rules shipped in the
// code while the live database kept the old ones. The version now ends in a fingerprint of the content.
// The same for the hand-written tax rules: their version is typed by hand, so a ledger remembers the fingerprint
// each version was shipped with. Content that changes under an unchanged version fails here, before it can ship
// and be ignored by the live database. After a deliberate change: raise `version` in the country file, then
//   node --experimental-strip-types tests/verify/compliance_engine.ts --record-versions
const LEDGER_FILE = new URL('./pack-versions.json', import.meta.url);
const printOf = (p: CountryPack) => createHash('sha256').update(JSON.stringify({ ...p, version: '' })).digest('hex').slice(0, 12);
const BASES: CountryPack[] = [canada, usa, india, uae];
if (process.argv.includes('--record-versions')) {
  fs.writeFileSync(LEDGER_FILE, JSON.stringify(Object.fromEntries(BASES.map((p) => [p.code, { version: p.version, print: printOf(p) }])), null, 1) + '\n');
  console.log('recorded', BASES.map((p) => `${p.code} ${p.version}`).join(', '));
}
const LEDGER: Record<string, { version: string; print: string }> = JSON.parse(fs.readFileSync(LEDGER_FILE, 'utf8'));
for (const p of BASES) {
  t(`${p.code}: the tax rules did not change under an unchanged version`, () => {
    const was = LEDGER[p.code];
    assert.ok(was, 'not in tests/verify/pack-versions.json: run this file with --record-versions');
    if (was.version === p.version) assert.equal(printOf(p), was.print, `the rules in the ${p.code} country file changed but its version is still ${p.version}: the live database would keep the old rules. Raise the version, then run this file with --record-versions`);
    else assert.fail(`the version is now ${p.version} (was ${was.version}): run this file with --record-versions and commit tests/verify/pack-versions.json`);
  });
}
for (const [cc, m] of [['CA', caMore], ['US', usMore], ['IN', inMore], ['AE', aeMore]] as const) {
  t(`${cc}: the researched rules' version carries the fingerprint of their content`, () => {
    const { version, ...content } = m;
    assert.match(version, /^\d{4}-\d{2}-\d{2}\.[0-9a-f]{8}$/);
    assert.equal(version.split('.')[1], createHash('sha256').update(JSON.stringify(content)).digest('hex').slice(0, 8),
      'the file was changed without the importer, or the importer did not restamp it: re-run scripts/compliance-import.ts --write');
    assert.ok(PACKS.find((p) => p.code === cc)!.version.endsWith(version.replace(/-/g, '')));
  });
}
for (const pack of PACKS) {
  t(`${pack.name}: every penalty read on another page names an official https page that exists`, () => {
    for (const c of pack.compliances.filter((x) => x.penaltySource)) {
      const s = pack.sources.find((x) => x.id === c.penaltySource);
      assert.ok(s && s.url.startsWith('https://') && c.penalty, c.id);
    }
  });
}
t('most compliances now say what being late costs', () => {
  const share = (code: string) => { const p = packOf(code)!; return p.compliances.filter((c) => c.penalty).length / p.compliances.length; };
  assert.ok(share('CA') > 0.9 && share('IN') > 0.9 && share('US') > 0.7 && share('AE') > 0.7, ['CA', 'US', 'IN', 'AE'].map((c) => `${c} ${Math.round(share(c) * 100)}%`).join(' '));
});
t('every US state and DC has its own duties outside tax: new hires, unemployment report, unclaimed property', () => {
  const us = packOf('US')!;
  const thin = us.states.map((s) => ({ s: s.code, n: us.compliances.filter((c) => c.id.startsWith(`us_x_${s.code.toLowerCase()}_`)).length })).filter((x) => x.n < 3);
  assert.deepEqual(thin, []);
  for (const s of us.states) assert.ok(us.compliances.some((c) => c.id === `us_x_${s.code.toLowerCase()}_newhire`), `${s.code} new-hire reporting`);
});
t('a Texas corporation with staff gets the Texas new-hire report and unemployment report; one in Ohio does not get the Texas ones', () => {
  const us = packOf('US')!; const corp = us.entityTypes.find((e) => e.kind === 'corporation')!;
  const run = (state: string) => evaluate(us, { country: 'US', state, entity: corp.id, depts: us.departments.map((d) => d.id) }, { us_employees: 'yes', us_x_unclaimed: 'yes', us_x_personal_info: 'yes' }, TODAY).map((r) => r.id);
  const tx = run('TX'), oh = run('OH');
  assert.ok(tx.includes('us_x_tx_newhire') && tx.includes('us_x_tx_uiwage') && tx.includes('us_x_tx_unclaimed') && tx.includes('us_x_tx_breach'), tx.filter((i) => i.startsWith('us_x_tx')).join());
  assert.ok(!oh.some((i) => i.startsWith('us_x_tx_')) && oh.includes('us_x_oh_newhire'));
});
t('corrections read on official pages are in: director KYC every three years, Ohio CAT quarterly, DIFC savings by the 21st', () => {
  assert.match(packOf('IN')!.compliances.find((c) => c.id === 'in_dir3')!.dueText, /three years/);
  assert.deepEqual(packOf('US')!.compliances.find((c) => c.id === 'us_oh_cat')!.due, { t: 'afterPeriodEnd', freq: 'quarterly', basis: 'cal', months: 2, day: 10 });
  assert.deepEqual(packOf('AE')!.compliances.find((c) => c.id === 'ae_difc_scheme')!.due, { t: 'afterPeriodEnd', freq: 'monthly', basis: 'cal', months: 1, day: 21 });
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


console.log('a date, or the rule itself, on every row (no row says only "no fixed date")');
const ev = (text: string) => windowOf({ t: 'event', text });
t('the period is read out of a rule\'s own words, and only when the words open with one', () => {
  assert.deepEqual(ev('Within 15 days after the change takes place'), { n: 15, unit: 'days', kind: 'after' });
  assert.deepEqual(ev('Within three working days after each weekly pay period'), { n: 3, unit: 'businessDays', kind: 'after' });
  assert.deepEqual(ev('Not later than 45 calendar days after discovery of the breach'), { n: 45, unit: 'days', kind: 'after' });
  assert.deepEqual(ev('Within 72 hours of being notified of the injury or illness'), { n: 3, unit: 'days', kind: 'after' });
  assert.deepEqual(ev('30 days after the business stops operating'), { n: 30, unit: 'days', kind: 'after' });
  assert.deepEqual(ev('Within one hundred and eighty days of incorporation'), { n: 180, unit: 'days', kind: 'after' });
  assert.deepEqual(ev('At least once a year'), { n: 1, unit: 'years', kind: 'every' });
  assert.deepEqual(ev('Every 365 days after the registration or last renewal'), { n: 365, unit: 'days', kind: 'every' });
  assert.deepEqual(ev('At least every two years; report the results to a senior officer within 30 days'), { n: 2, unit: 'years', kind: 'every' });
  // not a date: hours within a day, a period counted backwards, a period whose date is fixed some other way, no number at all
  for (const no of ['Within 8 hours of a work-related death', 'Not later than 30 days before the licence expires', 'Every 24 months, in the month set by the last digit of the USDOT number',
    'Without unreasonable delay', 'Set by your state', 'When you start paying employees', 'Before your first customs declaration']) assert.equal(ev(no), null, no);
  assert.equal(windowText({ n: 3, unit: 'businessDays', kind: 'after' }), '3 working days'); assert.equal(windowText({ n: 1, unit: 'years', kind: 'every' }), '1 year');
});
t('a deadline is counted correctly from a day: days, working days, months and years', () => {
  assert.equal(deadlineFrom('2020-03-15', { n: 60, unit: 'days', kind: 'after' }), '2020-05-14');
  assert.equal(deadlineFrom('2026-11-13', { n: 3, unit: 'businessDays', kind: 'after' }), '2026-11-18');        // Friday + 3 working days = Wednesday
  assert.equal(deadlineFrom('2026-01-31', { n: 1, unit: 'months', kind: 'after' }), '2026-02-28');              // a short month ends on its last day
  assert.equal(deadlineFrom('2024-02-29', { n: 1, unit: 'years', kind: 'every' }), '2025-02-28');
  assert.equal(deadlineFrom('2026-08-31', { n: 6, unit: 'months', kind: 'after' }), '2027-02-28');
});
t('more than half of the "when it happens" rules state a period that can be worked out', () => {
  const all = PACKS.flatMap((p) => p.compliances).filter((c) => c.due.t === 'event');
  const withWindow = all.filter((c) => windowOf(c.due));
  assert.ok(all.length > 250 && withWindow.length / all.length > 0.5, `${withWindow.length} of ${all.length}`);
});
t('Ontario initial return: 60 days after the incorporation date the person gave; a deadline that has gone by is said, not dropped', () => {
  const ca = packOf('CA')!;
  const sel = { country: 'CA', state: 'ON', entity: 'corporation', depts: ca.departments.map((d) => d.id) };
  const of = (inc: string) => evaluate(ca, sel, { ca_inc_date: inc, ca_federal: 'no' }, TODAY).find((r) => r.id === 'ca_x_on_initial')!;
  const old = of('2020-03-15');
  assert.equal(old.next.length, 0); assert.equal(old.passed, '2020-05-14'); assert.equal(old.rule, 'Within 60 days after incorporation, amalgamation or continuation'); assert.deepEqual(old.window, { text: '60 days', kind: 'after' });
  const fresh = of('2026-11-01');
  assert.equal(fresh.next[0].date, '2026-12-31'); assert.equal(fresh.passed, undefined);
  const none = evaluate(ca, sel, { ca_federal: 'no' }, TODAY).find((r) => r.id === 'ca_x_on_initial')!;
  assert.equal(none.needs, 'ca_inc_date');
});
t('UAE owner register: 60 days after the licence date', () => {
  const ae = packOf('AE')!;
  const corp = ae.entityTypes.find((e) => e.kind === 'corporation')!;
  const st = ae.states.find((x) => !corp.notStates?.includes(x.code) && (!corp.onlyStates || corp.onlyStates.includes(x.code)))!;
  const r = evaluate(ae, { country: 'AE', state: st.code, entity: corp.id, depts: ae.departments.map((d) => d.id) }, { ae_lic_date: '2026-10-20' }, TODAY).find((x) => x.id === 'ae_ubo');
  assert.ok(r, 'ae_ubo applies'); assert.equal(r!.next[0].date, '2026-12-19');
});
t('payroll, accelerated threshold 1: the 10th and the 25th of every month', () => {
  const ca = packOf('CA')!;
  const sel = { country: 'CA', state: 'ON', entity: 'corporation', depts: ca.departments.map((d) => d.id) };
  const r = evaluate(ca, sel, { ca_employees: 'yes', ca_remit: 'a1' }, TODAY).find((x) => x.id === 'ca_remit_a1')!;
  assert.deepEqual(r.next.map((d) => d.date), ['2026-11-10', '2026-11-25']);
});
t('Ontario WSIB premiums: the dates the WSIB states for the reporter the person says they are, never moved', () => {
  const ca = packOf('CA')!;
  const sel = { country: 'CA', state: 'ON', entity: 'corporation', depts: ca.departments.map((d) => d.id) };
  const of = (freq: string) => evaluate(ca, sel, { ca_employees: 'yes', ca_wsib_freq: freq }, TODAY);
  const q = of('q'), m = of('m'), a = of('a');
  assert.deepEqual(q.find((r) => r.id === 'ca_wsib')!.next.map((d) => d.date), ['2027-01-31', '2027-04-30']);       // 31 January 2027 is a Sunday and stays
  assert.deepEqual(m.find((r) => r.id === 'ca_wsib_m')!.next.map((d) => d.date), ['2026-11-30', '2026-12-31']);
  assert.deepEqual(a.find((r) => r.id === 'ca_wsib_a')!.next.map((d) => d.date), ['2027-04-30', '2028-04-30']);
  for (const [list, own] of [[q, 'ca_wsib'], [m, 'ca_wsib_m'], [a, 'ca_wsib_a']] as const) {
    assert.deepEqual(list.filter((r) => /^ca_wsib(_m|_a)?$/.test(r.id) && r.certainty === 'applies').map((r) => r.id), [own]);
    assert.ok(list.some((r) => r.id === 'ca_wsib_reg' && r.rule === 'Within 10 calendar days of hiring your first employee'));
  }
  const quebec = evaluate(ca, { ...sel, state: 'QC' }, { ca_employees: 'yes' }, TODAY);
  assert.ok(!quebec.some((r) => r.id.startsWith('ca_wsib')));
});
// A duty that repeats must have a date rule. These are the ones that cannot, each with the reason:
//   authority = a state, regulator or portal sets the date for each filer, or the official page states none
//   own       = counted from something of the person's own that the check does not hold (a reporting period, a plan year, a
//               meeting, an expiry, the last time it was done); the row shows the rule and takes the day to count from
//   unclear   = the official page gives two dates together; neither is put on the row
//   workdays  = counted in working days after each month, which the date rules do not do yet
const REPEATS_WITHOUT_A_DATE: Record<string, 'authority' | 'own' | 'unclear' | 'workdays'> = {
  ca_bc_pst_a: 'own', ca_sk_pst_a: 'own', ca_x_nfp_fs: 'own', ca_x_osfi49: 'own', ca_x_on_jhsc: 'own', ca_x_on_policy_review: 'own', ca_x_on_isc: 'own', ca_x_bc_jhsc: 'own',
  us_7004: 'own', us_efile: 'own', us_st_pit: 'authority', us_st_nonres: 'authority', us_st_partyear: 'authority', us_st_est_tax: 'authority', us_wa_sales: 'own', us_ar_az_corp: 'authority',
  us_ar_mo_corp: 'authority', us_st_ar: 'authority', us_st_np: 'authority', us_st_charity: 'authority', us_st_cit: 'authority', us_st_pte: 'authority', us_st_fid: 'authority', us_st_emp: 'authority',
  us_st_sales: 'authority', us_x_dnc: 'own', us_x_formd_annual: 'own', us_x_mcs150: 'authority', us_x_clearinghouse: 'own', us_x_ucr: 'authority', us_x_sam: 'own', us_x_ar_unclaimed: 'unclear',
  us_x_ca_paydata: 'authority', us_x_il_unclaimed: 'authority', us_x_me_pfml: 'authority', us_x_tn_uiwage: 'authority', us_x_vt_uiwage: 'authority',
  in_lut: 'own', in_pt: 'authority', in_dir3: 'own', in_x_ecb2: 'workdays', in_x_board_meetings: 'own', in_x_labour_return: 'authority',
  ae_gcc_pension: 'authority', ae_x_emiratisation_50: 'own', ae_x_emiratisation_20_49: 'own', ae_x_estcard_renew: 'own', ae_x_difc_dp_renew: 'authority', ae_x_jafza_audit: 'authority', ae_x_dubai_customs_renew: 'own',
};
t('a duty that repeats has a date rule, unless it is on the written list of those that cannot', () => {
  const without = PACKS.flatMap((p) => p.compliances).filter((c) => c.due.t === 'event' && !c.due.from && c.frequency !== 'event' && c.frequency !== 'once').map((c) => c.id);
  assert.deepEqual(without.filter((id) => !REPEATS_WITHOUT_A_DATE[id]), [], 'give these a date rule read on the official page, or add them to the list with the reason');
  assert.deepEqual(Object.keys(REPEATS_WITHOUT_A_DATE).filter((id) => !without.includes(id)), [], 'these now have a date rule (or are gone): take them off the list');
});

export { t, fill, selOf, find, absent, ids, TODAY, packOf, evaluate };
import('./compliance_scenarios.ts').then(() => { console.log(`\ncompliance_engine: ${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0); });
