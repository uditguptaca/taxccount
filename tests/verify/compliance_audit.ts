// Tie-up audit of the rules, with no server: is everything connected to everything it should be?
//   - every question is put to somebody, and leads to at least one compliance or to another question
//   - every compliance can be reached by some set of answers (none is dead behind a question nobody is asked)
//   - every place and entity type gets questions and a result
//   - every type of compliance offered to an entity type in the tick list can return something for it
//   - nobody is offered a type, or asked an opening question, that is meant for somebody else: a person is not asked
//     about "the business", only a person is offered personal documents, a person is not offered the company registry
//   - every compliance sits in a type that exists, and every type holds something
// It walks every place and entity type of every country with "all yes", "all no" and many random sets of answers.
// A new country or compliance that is not tied up fails here before it ships.
// Run: node --experimental-strip-types tests/verify/compliance_audit.ts
import { PACKS } from '../../src/lib/compliance/index.ts';
import { evaluate, visibleQuestions, relevantQuestions, entityTypesFor } from '../../src/lib/compliance/engine.ts';
import { condRefs } from '../../src/lib/compliance/describe.ts';
import { canApply } from '../../src/lib/compliance/guide.ts';
const TODAY = new Date().toISOString().slice(0, 10);
let pass = 0, fail = 0;
const check = (name: string, ok: boolean, info = '') => { ok ? pass++ : fail++; console.log(`${ok ? '  PASS' : '  FAIL'} ${name}${ok ? '' : '  ' + info.slice(0, 400)}`); };
let seed = 12345; const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
const pick = <T,>(a: T[]) => a[Math.floor(rnd() * a.length)];
for (const p of PACKS) {
  const asked = new Set<string>(), reached = new Set<string>(), mayApply = new Set<string>();
  let combos = 0, runs = 0, empty: string[] = [], noQuestions: string[] = [];
  const deptHit = new Map<string, Set<string>>();
  for (const st of p.states) for (const e of entityTypesFor(p, st.code)) {
    combos++;
    const sel = { country: p.code, state: st.code, entity: e.id, depts: p.departments.map((d) => d.id) };
    let any = 0, qn = 0;
    for (let r = 0; r < 70; r++) {
      const a: Record<string, any> = {};
      const mode = r === 0 ? 'yes' : r === 1 ? 'no' : 'rand';
      for (let i = 0; i < 14; i++) for (const q of visibleQuestions(p, sel, a)) {
        asked.add(q.id);
        if (a[q.id] !== undefined) continue;
        if (q.type === 'yn') a[q.id] = mode === 'yes' ? 'yes' : mode === 'no' ? 'no' : pick(['yes', 'yes', 'no', 'unsure']);
        else if (q.type === 'multi') a[q.id] = mode === 'no' ? ['none'] : [pick((q.options ?? []).map((o) => o.v))];
        else if (q.type === 'date') a[q.id] = pick(['2021-06-01', '2026-10-20', '2015-02-28']);
        else if (q.type === 'monthday') a[q.id] = pick(['12-31', '03-31', '06-30']);
        else a[q.id] = mode === 'rand' ? pick((q.options ?? [{ v: '' }]).map((o) => o.v)) : (q.options ?? [{ v: '' }])[mode === 'yes' ? 0 : (q.options ?? [{ v: '' }]).length - 1].v;
      }
      qn = Math.max(qn, visibleQuestions(p, sel, a).length);
      const res = evaluate(p, sel, a, TODAY); runs++;
      any = Math.max(any, res.length);
      for (const x of res) { (x.certainty === 'applies' ? reached : mayApply).add(x.id); if (!deptHit.has(e.id)) deptHit.set(e.id, new Set()); deptHit.get(e.id)!.add(x.dept); }
    }
    if (any === 0) empty.push(`${st.code}/${e.id}`);
    if (qn === 0) noQuestions.push(`${st.code}/${e.id}`);
  }
  const never = p.compliances.filter((c) => !reached.has(c.id) && !mayApply.has(c.id));
  const onlyMaybe = p.compliances.filter((c) => !reached.has(c.id) && mayApply.has(c.id));
  const unasked = p.questions.filter((q) => !asked.has(q.id));
  const used = new Set<string>(); for (const c of p.compliances) { condRefs(c.applies).questions.forEach((q) => used.add(q)); const d: any = c.due; if (d.of) used.add(d.of); if (d.from) used.add(d.from); if (d.ask) used.add(d.ask); if (d.basis === 'fy') used.add('fye'); } for (const q of p.questions) condRefs(q.show).questions.forEach((x) => used.add(x));
  const idle = p.questions.filter((q) => !used.has(q.id));
  const deptGap: string[] = []; for (const e of p.entityTypes) { const offered = new Set(canApply(p, e).map((c) => c.dept)); for (const d of Array.from(offered)) if (!deptHit.get(e.id)?.has(d)) deptGap.push(`${e.id}:${d}`); }
  console.log(`${p.name}: ${combos} place and entity combinations, ${runs} sets of answers, ${p.questions.length} questions, ${p.compliances.length} compliances`);
  check(`${p.name}: every question is asked of somebody`, unasked.length === 0, unasked.map((q) => q.id).join(', '));
  check(`${p.name}: every question leads to a compliance or to another question`, idle.length === 0, idle.map((q) => q.id).join(', '));
  check(`${p.name}: every compliance can be reached by some set of answers`, never.length === 0 && onlyMaybe.length === 0, [...never, ...onlyMaybe].map((c) => c.id).join(', '));
  check(`${p.name}: every place and entity type gets questions and a result`, empty.length === 0 && noQuestions.length === 0, [...empty, ...noQuestions].join(', '));
  check(`${p.name}: every type offered in the tick list can return something for that entity type`, deptGap.length === 0, deptGap.join(', '));
  // an opening question (one that waits on no other answer) put to a person must not speak of "the business"
  const opening = p.questions.filter((q) => !q.show || condRefs(q.show).questions.size === 0);
  const person = p.entityTypes.find((e) => e.id === 'individual');
  const forBusiness = /(?<!you or )\b(the|your) (business|company|establishment|firm)\b/i;   // "you or your business" speaks to both
  const misworded = new Set<string>();
  if (person) for (const st of p.states) { const rel = relevantQuestions(p, { country: p.code, state: st.code, entity: person.id, depts: p.departments.map((d) => d.id) }); for (const q of opening) if (rel.has(q.id) && forBusiness.test(q.text)) misworded.add(`${q.id}: ${q.text}`); }
  check(`${p.name}: a person's opening questions are worded for a person, not for "the business"`, misworded.size === 0, Array.from(misworded).join(' | '));
  const personalElsewhere = p.entityTypes.filter((e) => e.id !== 'individual' && canApply(p, e).some((c) => c.dept === 'personal')).map((e) => e.id);
  check(`${p.name}: personal documents are offered to an individual only`, personalElsewhere.length === 0, personalElsewhere.join(', '));
  // the type that holds a company's own registry filings (not a tax a person in business can also owe, such as UAE corporate tax)
  const companyTypes = p.departments.filter((d) => /^(corporate annual return|company and llp filings|company law|companies)\b/i.test(d.name)).map((d) => d.id);
  const registryForPerson = person ? canApply(p, person).filter((c) => companyTypes.includes(c.dept)).map((c) => c.id) : [];
  check(`${p.name}: an individual is not offered the company registry type`, registryForPerson.length === 0, registryForPerson.join(', '));
  const deptIds = new Set(p.departments.map((d) => d.id));
  const homeless = p.compliances.filter((c) => !deptIds.has(c.dept)).map((c) => `${c.id}:${c.dept}`);
  const hollow = p.departments.filter((d) => !p.compliances.some((c) => c.dept === d.id)).map((d) => d.id);
  check(`${p.name}: every compliance sits in a type that exists, and every type holds something`, homeless.length === 0 && hollow.length === 0, [...homeless, ...hollow.map((d) => 'empty:' + d)].join(', '));
}
console.log(`\ncompliance_audit: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
