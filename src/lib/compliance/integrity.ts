// Structural checks on a country file. Run by the verification suite: a pack that fails must not ship.
import { windowOf } from './window.ts';
import type { Cond, CountryPack } from './types.ts';

export interface Problem { where: string; problem: string }

export function checkPack(p: CountryPack): Problem[] {
  const bad: Problem[] = [];
  const add = (where: string, problem: string) => bad.push({ where, problem });
  const sn = (t: string) => (t.length > 60 ? t.slice(0, 59) + '…' : t);
  const qs = new Map(p.questions.map((q) => [q.id, q]));
  const states = new Set(p.states.map((s) => s.code)), stags = new Set(p.states.flatMap((s) => s.tags ?? []));
  const ents = new Set(p.entityTypes.map((e) => e.id)), etags = new Set(p.entityTypes.flatMap((e) => e.tags ?? []));
  const depts = new Set(p.departments.map((d) => d.id)), steps = new Set(p.steps.map((s) => s.id)), sources = new Set(p.sources.map((s) => s.id));

  const dup = (list: string[], what: string) => { const seen = new Set<string>(); for (const x of list) { if (seen.has(x)) add(`The ${what}`, `two of them have the same short code “${x}”`); seen.add(x); } };
  dup(p.questions.map((q) => q.id), 'questions'); dup(p.compliances.map((c) => c.id), 'compliances'); dup(p.states.map((s) => s.code), 'states');
  dup(p.entityTypes.map((e) => e.id), 'entity types'); dup(p.sources.map((s) => s.id), 'sources'); dup(p.departments.map((d) => d.id), 'departments');

  const cond = (c: Cond | undefined, where: string) => {
    if (!c) return;
    if ('all' in c) return c.all.forEach((k) => cond(k, where));
    if ('any' in c) return c.any.forEach((k) => cond(k, where));
    if ('not' in c) return cond(c.not, where);
    if ('kind' in c) return;
    if ('entity' in c) return c.entity.forEach((e) => { if (!ents.has(e)) add(where, `uses the entity type “${e}”, which does not exist or is switched off`); });
    if ('etag' in c) { if (!etags.has(c.etag)) add(where, `uses the entity-type tag “${c.etag}”, which no entity type carries`); return; }
    if ('state' in c) return c.state.forEach((s) => { if (!states.has(s)) add(where, `uses “${s}” (${p.stateLabel.toLowerCase() || 'state'}), which does not exist or is switched off`); });
    if ('stag' in c) { if (!stags.has(c.stag)) add(where, `uses the tag “${c.stag}”, which no ${p.stateLabel.toLowerCase() || 'state'} carries`); return; }
    if ('dept' in c) return c.dept.forEach((d) => { if (!depts.has(d)) add(where, `uses the department “${d}”, which does not exist or is switched off`); });
    const q = qs.get(c.q);
    if (!q) return add(where, `depends on the question “${c.q}”, which does not exist or is switched off`);
    const vals = 'is' in c ? (Array.isArray(c.is) ? c.is : [c.is]) : 'has' in c ? (Array.isArray(c.has) ? c.has : [c.has]) : [];
    if (('yes' in c || 'no' in c) && q.type !== 'yn') add(where, `tests “${sn(q.text)}” for Yes or No, but that is not a Yes / No question`);
    // a year end (month and day) can be tested for one date: "is the year end 30 June?" decides which of two deadlines applies
    if ('is' in c && q.type !== 'choice' && q.type !== 'monthday') add(where, `tests “${sn(q.text)}” for one chosen answer, but that is not a choose-one question`);
    if ('has' in c && q.type !== 'multi') add(where, `tests “${sn(q.text)}” for a ticked answer, but that is not a choose-several question`);
    for (const v of vals) if (q.type === 'monthday' ? !/^(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(v) : !q.options?.some((o) => o.v === v)) add(where, `needs the answer “${v}” to “${sn(q.text)}”, but that answer does not exist`);
  };

  for (const q of p.questions) {
    if (!steps.has(q.step)) add(`Question “${sn(q.text)}”`, 'is in a group that does not exist or is switched off');
    if (!q.text.trim()) add(`Question ${q.id}`, 'has no wording');
    if ((q.type === 'choice' || q.type === 'multi') && !(q.options && q.options.length >= 2)) add(`Question “${sn(q.text)}”`, 'needs at least two answers to choose from');
    cond(q.show, `Question “${sn(q.text)}”`);
  }
  for (const c of p.compliances) {
    const w = `Compliance “${sn(c.name || c.id)}”`;
    if (!depts.has(c.dept)) add(w, `is in the department “${c.dept}”, which does not exist or is switched off`);
    if (!sources.has(c.source)) add(w, `points at the official source “${c.source}”, which does not exist or is switched off`);
    if (c.penaltySource && !sources.has(c.penaltySource)) add(w, `says its penalty was read on the source “${c.penaltySource}”, which does not exist or is switched off`);
    for (const f of ['name', 'head', 'authority', 'brief', 'why', 'dueText'] as const) if (!String(c[f] ?? '').trim()) add(w, `has nothing in “${f}”`);
    cond(c.applies, w);
    // a date counted from an answer needs that answer to BE a date (a Yes / No question left the row on "Add your dates" for ever)
    const dateQ = (id: string, what: string) => { const q = qs.get(id); if (!q) add(w, `${what} the question “${id}”, which does not exist or is switched off`); else if (q.type !== 'date' && !(q.type === 'choice' && (q.options ?? []).length > 0 && (q.options ?? []).every((o) => /^\d{4}-\d{2}-\d{2}$/.test(o.v)))) add(w, `${what} “${sn(q.text)}”, which is not a date question (or a choice whose answers are dates)`); };
    if (c.due.t === 'anniversary') dateQ(c.due.of, 'counts its due date from');
    if (c.due.t === 'event' && c.due.from) {
      const fq = qs.get(c.due.from);
      if (!fq || (fq.type !== 'date' && fq.type !== 'choice')) dateQ(c.due.from, 'counts its deadline from');
      else if (fq.type === 'choice') dateQ(c.due.from, 'counts its deadline from');
      else if (!windowOf(c.due)) add(w, 'is counted from a date, but its rule does not open with a period such as “Within 60 days”: say the period, or take the date question off');
    }
    if (c.due.t === 'afterPeriodEnd' && c.due.ask) { const q = qs.get(c.due.ask); if (!q) add(w, `counts its due date from the question “${c.due.ask}”, which does not exist or is switched off`); else if (q.type !== 'choice' || !(q.options ?? []).every((o) => /^\d+$/.test(o.v))) add(w, `takes its period set from “${sn(q.text)}”, which must be a choice whose answers are 0, 1, 2 …`); }
    if (c.due.t === 'fixed') for (const [m, d] of c.due.dates) if (m < 1 || m > 12 || d < 1 || d > new Date(Date.UTC(2024, m, 0)).getUTCDate()) add(w, `has an impossible date (month ${m}, day ${d})`);
    if (c.due.t === 'on') for (const d of c.due.dates) { const t = new Date(d + 'T00:00:00Z'); if (Number.isNaN(t.getTime()) || t.toISOString().slice(0, 10) !== d) add(w, `has a date that does not exist (${d})`); }
  }
  // the year-end question has a fixed short code: the date rules read its answer
  const fye = qs.get('fye');
  if (fye && fye.type !== 'monthday') add('The year-end question (short code fye)', 'must ask for a day of the year (month and day)');
  if (!p.fixedYearEnd && !fye) {
    const n = p.compliances.filter((c) => 'basis' in c.due && c.due.basis === 'fy').length;
    if (n) add(`${n} ${n === 1 ? 'compliance counts its' : 'compliances count their'} due date from the financial year end,`, 'but the question that asks for it (short code fye) does not exist or is switched off');
  }
  for (const e of p.entityTypes) for (const s of [...(e.onlyStates ?? []), ...(e.notStates ?? [])]) if (!states.has(s)) add(`Entity type “${e.name}”`, `is limited to “${s}”, which does not exist or is switched off`);
  for (const s of p.sources) if (!/^https:\/\//.test(s.url)) add(`Source “${sn(s.title)}”`, 'needs a link that starts with https://');
  return bad;
}
