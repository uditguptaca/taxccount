// Structural checks on a country file. Run by the verification suite: a pack that fails must not ship.
import type { Cond, CountryPack } from './types.ts';

export interface Problem { where: string; problem: string }

export function checkPack(p: CountryPack): Problem[] {
  const bad: Problem[] = [];
  const add = (where: string, problem: string) => bad.push({ where: `${p.code} ${where}`, problem });
  const qs = new Map(p.questions.map((q) => [q.id, q]));
  const states = new Set(p.states.map((s) => s.code)), stags = new Set(p.states.flatMap((s) => s.tags ?? []));
  const ents = new Set(p.entityTypes.map((e) => e.id)), etags = new Set(p.entityTypes.flatMap((e) => e.tags ?? []));
  const depts = new Set(p.departments.map((d) => d.id)), steps = new Set(p.steps.map((s) => s.id)), sources = new Set(p.sources.map((s) => s.id));

  const dup = (list: string[], what: string) => { const seen = new Set<string>(); for (const x of list) { if (seen.has(x)) add(what, `duplicate id ${x}`); seen.add(x); } };
  dup(p.questions.map((q) => q.id), 'questions'); dup(p.compliances.map((c) => c.id), 'compliances'); dup(p.states.map((s) => s.code), 'states');
  dup(p.entityTypes.map((e) => e.id), 'entity types'); dup(p.sources.map((s) => s.id), 'sources'); dup(p.departments.map((d) => d.id), 'departments');

  const cond = (c: Cond | undefined, where: string) => {
    if (!c) return;
    if ('all' in c) return c.all.forEach((k) => cond(k, where));
    if ('any' in c) return c.any.forEach((k) => cond(k, where));
    if ('not' in c) return cond(c.not, where);
    if ('kind' in c) return;
    if ('entity' in c) return c.entity.forEach((e) => { if (!ents.has(e)) add(where, `unknown entity type ${e}`); });
    if ('etag' in c) { if (!etags.has(c.etag)) add(where, `no entity type carries the tag ${c.etag}`); return; }
    if ('state' in c) return c.state.forEach((s) => { if (!states.has(s)) add(where, `unknown state ${s}`); });
    if ('stag' in c) { if (!stags.has(c.stag)) add(where, `no state carries the tag ${c.stag}`); return; }
    if ('dept' in c) return c.dept.forEach((d) => { if (!depts.has(d)) add(where, `unknown department ${d}`); });
    const q = qs.get(c.q);
    if (!q) return add(where, `condition on unknown question ${c.q}`);
    const vals = 'is' in c ? (Array.isArray(c.is) ? c.is : [c.is]) : 'has' in c ? (Array.isArray(c.has) ? c.has : [c.has]) : [];
    if (('yes' in c || 'no' in c) && q.type !== 'yn') add(where, `yes/no test on ${c.q}, which is a ${q.type} question`);
    if ('is' in c && q.type !== 'choice') add(where, `"is" test on ${c.q}, which is a ${q.type} question`);
    if ('has' in c && q.type !== 'multi') add(where, `"has" test on ${c.q}, which is a ${q.type} question`);
    for (const v of vals) if (!q.options?.some((o) => o.v === v)) add(where, `${c.q} has no option ${v}`);
  };

  for (const q of p.questions) {
    if (!steps.has(q.step)) add(`question ${q.id}`, `unknown step ${q.step}`);
    if (!q.text.trim()) add(`question ${q.id}`, 'no text');
    if ((q.type === 'choice' || q.type === 'multi') && !(q.options && q.options.length >= 2)) add(`question ${q.id}`, 'needs at least two options');
    cond(q.show, `question ${q.id}`);
  }
  for (const c of p.compliances) {
    const w = `compliance ${c.id}`;
    if (!depts.has(c.dept)) add(w, `unknown department ${c.dept}`);
    if (!sources.has(c.source)) add(w, `unknown source ${c.source}`);
    for (const f of ['name', 'head', 'authority', 'brief', 'why', 'dueText'] as const) if (!String(c[f] ?? '').trim()) add(w, `missing ${f}`);
    cond(c.applies, w);
    if (c.due.t === 'anniversary' && !qs.has(c.due.of)) add(w, `due date hangs on unknown question ${c.due.of}`);
    if (c.due.t === 'afterPeriodEnd' && c.due.ask && !qs.has(c.due.ask)) add(w, `due date hangs on unknown question ${c.due.ask}`);
    if (c.due.t === 'fixed') for (const [m, d] of c.due.dates) if (m < 1 || m > 12 || d < 1 || d > 31) add(w, `impossible date ${m}-${d}`);
  }
  for (const e of p.entityTypes) for (const s of [...(e.onlyStates ?? []), ...(e.notStates ?? [])]) if (!states.has(s)) add(`entity type ${e.id}`, `unknown state ${s}`);
  for (const s of p.sources) if (!/^https:\/\//.test(s.url)) add(`source ${s.id}`, 'the address must start with https://');
  return bad;
}
