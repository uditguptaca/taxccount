'use client';
// "Applies when" builder: a rule made of conditions joined by ALL or ANY, without writing any code.
import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { Cond, CountryPack, Kind, Question } from '@/lib/compliance/types';
import { KIND_LABEL, describeCond } from '@/lib/compliance/describe';
import { Chips, btnSm, inp, inpW } from './ui';

type LeafType = 'q' | 'entity' | 'kind' | 'etag' | 'state' | 'stag' | 'dept';
const LEAF_LABEL: Record<LeafType, string> = { q: 'Answer to a question', entity: 'Entity type', kind: 'Kind of taxpayer', etag: 'Group of entity types (tag)', state: 'State / province', stag: 'Group of states (tag)', dept: 'Department chosen' };
const isGroup = (c: Cond): c is { all: Cond[] } | { any: Cond[] } => 'all' in c || 'any' in c;
const leafType = (c: Cond): LeafType => ('q' in c ? 'q' : 'entity' in c ? 'entity' : 'kind' in c ? 'kind' : 'etag' in c ? 'etag' : 'state' in c ? 'state' : 'stag' in c ? 'stag' : 'dept');
const arr = (v: string | string[] | undefined) => (v === undefined ? [] : Array.isArray(v) ? v : [v]);

export function leafForQuestion(q: Question | undefined): Cond {
  if (!q) return { entity: [] };
  if (q.type === 'yn') return { q: q.id, yes: true };
  if (q.type === 'choice') return { q: q.id, is: [] };
  if (q.type === 'multi') return { q: q.id, has: [] };
  return { q: q.id, answered: true };
}
function newLeaf(t: LeafType, p: CountryPack): Cond {
  if (t === 'q') return leafForQuestion(p.questions[0]);
  if (t === 'entity') return { entity: [] };
  if (t === 'kind') return { kind: [] };
  if (t === 'etag') return { etag: Array.from(new Set(p.entityTypes.flatMap((e) => e.tags ?? [])))[0] ?? '' };
  if (t === 'state') return { state: [] };
  if (t === 'stag') return { stag: Array.from(new Set(p.states.flatMap((s) => s.tags ?? [])))[0] ?? '' };
  return { dept: [] };
}

/** Problems a person should fix before saving: a condition with nothing chosen can never be true. */
export function condProblems(c: Cond | undefined): string[] {
  if (!c) return [];
  if ('all' in c) return c.all.flatMap(condProblems);
  if ('any' in c) return c.any.length === 0 ? ['An "any of" group is empty'] : c.any.flatMap(condProblems);
  if ('not' in c) return condProblems(c.not);
  if ('q' in c) { if ('is' in c && arr(c.is).length === 0) return ['Choose at least one answer']; if ('has' in c && arr(c.has).length === 0) return ['Choose at least one answer']; return []; }
  if ('entity' in c) return c.entity.length ? [] : ['Choose at least one entity type'];
  if ('kind' in c) return c.kind.length ? [] : ['Choose at least one kind of taxpayer'];
  if ('state' in c) return c.state.length ? [] : ['Choose at least one state'];
  if ('dept' in c) return c.dept.length ? [] : ['Choose at least one department'];
  if ('etag' in c) return c.etag ? [] : ['Choose a tag'];
  if ('stag' in c) return c.stag ? [] : ['Choose a tag'];
  return [];
}

function Leaf({ c, onChange, pack }: { c: Cond; onChange: (c: Cond) => void; pack: CountryPack }) {
  const t = leafType(c);
  const etags = Array.from(new Set(pack.entityTypes.flatMap((e) => e.tags ?? []))), stags = Array.from(new Set(pack.states.flatMap((s) => s.tags ?? [])));
  let control: React.ReactNode = null;
  if ('q' in c) {
    const q = pack.questions.find((x) => x.id === c.q);
    const steps = pack.steps.filter((s) => pack.questions.some((x) => x.step === s.id));
    control = (
      <span className="flex flex-1 flex-wrap items-center gap-2">
        <select aria-label="Question" className={`${inpW} w-80 max-w-full`} value={c.q} onChange={(e) => onChange(leafForQuestion(pack.questions.find((x) => x.id === e.target.value)))}>
          {!q && <option value={c.q}>{c.q} (missing)</option>}
          {steps.map((s) => <optgroup key={s.id} label={s.title}>{pack.questions.filter((x) => x.step === s.id).map((x) => <option key={x.id} value={x.id}>{x.text.slice(0, 90)}</option>)}</optgroup>)}
        </select>
        {q?.type === 'yn' && <select aria-label="Answer" className={`${inpW} w-28`} value={'no' in c ? 'no' : 'yes'} onChange={(e) => onChange(e.target.value === 'no' ? { q: c.q, no: true } : { q: c.q, yes: true })}><option value="yes">is Yes</option><option value="no">is No</option></select>}
        {q?.type === 'choice' && <Chips options={q.options ?? []} value={arr('is' in c ? c.is : undefined)} onChange={(v) => onChange({ q: c.q, is: v })} />}
        {q?.type === 'multi' && <Chips options={q.options ?? []} value={arr('has' in c ? c.has : undefined)} onChange={(v) => onChange({ q: c.q, has: v })} />}
        {(q?.type === 'date' || q?.type === 'monthday') && <span className="text-xs text-slate-600">has been answered</span>}
      </span>);
  } else if ('entity' in c) control = <Chips options={pack.entityTypes.map((e) => ({ v: e.id, label: e.name }))} value={c.entity} onChange={(v) => onChange({ entity: v })} />;
  else if ('kind' in c) control = <Chips options={(Object.keys(KIND_LABEL) as Kind[]).map((k) => ({ v: k, label: KIND_LABEL[k] }))} value={c.kind} onChange={(v) => onChange({ kind: v as Kind[] })} />;
  else if ('dept' in c) control = <Chips options={pack.departments.map((d) => ({ v: d.id, label: d.name }))} value={c.dept} onChange={(v) => onChange({ dept: v })} />;
  else if ('state' in c) control = pack.states.length <= 14
    ? <Chips options={pack.states.map((s) => ({ v: s.code, label: s.name }))} value={c.state} onChange={(v) => onChange({ state: v })} />
    : <select aria-label="States" multiple size={6} className={`${inp} max-w-xs`} value={c.state} onChange={(e) => onChange({ state: Array.from(e.target.selectedOptions).map((o) => o.value) })}>{pack.states.map((s) => <option key={s.code} value={s.code}>{s.name}</option>)}</select>;
  else if ('etag' in c) control = <select aria-label="Tag" className={`${inpW} w-64`} value={c.etag} onChange={(e) => onChange({ etag: e.target.value })}>{etags.map((x) => <option key={x} value={x}>{x}: {pack.entityTypes.filter((e) => e.tags?.includes(x)).map((e) => e.name).join(', ').slice(0, 60)}</option>)}</select>;
  else if ('stag' in c) control = <select aria-label="Tag" className={`${inpW} w-64`} value={c.stag} onChange={(e) => onChange({ stag: e.target.value })}>{stags.map((x) => <option key={x} value={x}>{x} ({pack.states.filter((s) => s.tags?.includes(x)).length} states)</option>)}</select>;
  return (
    <span className="flex flex-1 flex-wrap items-start gap-2">
      <select aria-label="Kind of condition" className={`${inpW} w-52`} value={t} onChange={(e) => onChange(newLeaf(e.target.value as LeafType, pack))}>
        {(Object.keys(LEAF_LABEL) as LeafType[]).filter((k) => (k !== 'etag' || etags.length) && (k !== 'stag' || stags.length)).map((k) => <option key={k} value={k}>{LEAF_LABEL[k]}</option>)}
      </select>
      {control}
    </span>
  );
}

function Node({ c, onChange, onRemove, pack, depth }: { c: Cond; onChange: (c: Cond) => void; onRemove?: () => void; pack: CountryPack; depth: number }) {
  const negated = 'not' in c;
  const inner = negated ? c.not : c;
  const set = (n: Cond) => onChange(negated ? { not: n } : n);
  const notBox = <label className="flex items-center gap-1 whitespace-nowrap text-xs font-semibold text-slate-600"><input type="checkbox" checked={negated} onChange={(e) => onChange(e.target.checked ? { not: inner } : inner)} />NOT</label>;
  if (isGroup(inner)) {
    const mode = 'all' in inner ? 'all' : 'any';
    const kids: Cond[] = 'all' in inner ? inner.all : inner.any;
    const put = (list: Cond[]) => set(mode === 'all' ? { all: list } : { any: list });
    return (
      <div className={`rounded-xl border ${depth % 2 ? 'border-indigo-200 bg-indigo-50/40' : 'border-slate-200 bg-slate-50'} p-2.5`}>
        <div className="flex flex-wrap items-center gap-2">
          {depth > 0 && notBox}
          <select aria-label="How the conditions combine" className={`${inpW} w-64`} value={mode} onChange={(e) => set(e.target.value === 'all' ? { all: kids } : { any: kids })}>
            <option value="all">ALL of these must be true</option><option value="any">ANY one of these is enough</option>
          </select>
          <span className="flex-1" />
          <button type="button" className={btnSm} onClick={() => put([...kids, leafForQuestion(pack.questions[0])])}><Plus className="h-3 w-3" />Condition</button>
          <button type="button" className={btnSm} onClick={() => put([...kids, mode === 'all' ? { any: [] } : { all: [] }])}><Plus className="h-3 w-3" />Group</button>
          {onRemove && <button type="button" aria-label="Remove group" className={`${btnSm} text-rose-700`} onClick={onRemove}><Trash2 className="h-3 w-3" /></button>}
        </div>
        <div className="mt-2 space-y-2">
          {kids.length === 0 && <p className="text-xs text-slate-500">{mode === 'all' && depth === 0 ? 'No conditions: it applies to everyone who chose this country.' : 'Empty. Add a condition.'}</p>}
          {kids.map((k, i) => <Node key={i} c={k} pack={pack} depth={depth + 1} onChange={(n) => put(kids.map((x, j) => (j === i ? n : x)))} onRemove={() => put(kids.filter((_, j) => j !== i))} />)}
        </div>
      </div>
    );
  }
  return (
    <div className="flex flex-wrap items-start gap-2 rounded-lg border border-slate-200 bg-white p-2">
      {notBox}
      <Leaf c={inner} onChange={set} pack={pack} />
      {onRemove && <button type="button" aria-label="Remove condition" className={`${btnSm} text-rose-700`} onClick={onRemove}><Trash2 className="h-3 w-3" /></button>}
    </div>
  );
}

export default function CondBuilder({ value, onChange, pack, emptyText }: { value: Cond | undefined; onChange: (c: Cond | undefined) => void; pack: CountryPack; emptyText?: string }) {
  const root: Cond = !value ? { all: [] } : isGroup(value) ? value : { all: [value] };
  const problems = condProblems(root);
  return (
    <div>
      <Node c={root} pack={pack} depth={0} onChange={(c) => onChange('all' in c && c.all.length === 0 ? undefined : c)} />
      <p className="mt-1.5 rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs text-slate-700"><b>In words:</b> {value ? describeCond(root, pack) : (emptyText ?? 'Always')}</p>
      {problems.length > 0 && <p className="mt-1 text-xs font-semibold text-rose-700">{Array.from(new Set(problems)).join('. ')}.</p>}
    </div>
  );
}
