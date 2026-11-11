'use client';
// The add / change window for every kind of Service Master item.
import React, { useMemo, useState } from 'react';
import { Plus, Trash2, RotateCcw, Power, Copy } from 'lucide-react';
import type { CatalogItem, Kind as ItemKind } from '@/lib/compliance/catalog';
import type { Compliance, Cond, CountryPack, DueRule, Kind, Option } from '@/lib/compliance/types';
import { FREQ_LABEL, KIND_LABEL, QTYPE_LABEL, questionLinks } from '@/lib/compliance/describe';
import CondBuilder, { condProblems } from './CondBuilder';
import DueBuilder from './DueBuilder';
import { Badge, Chips, Field, Modal, btn, btnPrimary, btnSm, inp, inpW, slug } from './ui';
import type { Catalog } from './useCatalog';

export const KIND_NAME: Record<ItemKind, string> = { country: 'country', state: 'state', entity: 'entity type', department: 'department', step: 'question group', question: 'question', compliance: 'sub-compliance', source: 'official source' };
const TODAY = () => new Date().toISOString().slice(0, 10);
const area = `${inp} min-h-[64px]`;
const H = ({ n, children, sub }: { n: number; children: React.ReactNode; sub?: string }) => (
  <div className="mb-2 mt-5 flex items-baseline gap-2 border-b border-slate-200 pb-1 first:mt-0"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-[11px] font-bold text-white">{n}</span><h3 className="text-sm font-bold text-slate-900">{children}</h3>{sub ? <span className="text-xs text-slate-500">{sub}</span> : null}</div>);

export function blankOf(kind: ItemKind, pack: CountryPack | null): any {
  switch (kind) {
    case 'compliance': return { name: '', form: '', dept: pack?.departments[0]?.id ?? '', head: '', authority: '', brief: '', why: '', applies: { all: [] }, frequency: 'annual', due: { t: 'afterYearEnd', basis: 'fy', months: 6 }, dueText: '', penalty: '', weight: 50, source: pack?.sources[0]?.id ?? '', verified: false };
    case 'question': return { step: pack?.steps[0]?.id ?? '', text: '', help: '', type: 'yn' };
    case 'entity': return { name: '', desc: '', kind: 'corporation' };
    case 'state': return { name: '', tags: [] };
    case 'department': return { name: '', desc: '' };
    case 'step': return { title: '', desc: '' };
    case 'source': return { publisher: '', title: '', url: 'https://', checked: TODAY() };
    default: return { name: '', currency: '', stateLabel: 'State', calendarYearKinds: ['individual', 'sole_prop'], rollWeekend: false, weekendNote: '' };
  }
}

export default function ItemEditor({ cat, kind, item, onClose, preset, presetId }: { cat: Catalog; kind: ItemKind; item: CatalogItem | null; onClose: () => void; preset?: any; presetId?: string }) {
  const pack = cat.pack;
  const isNew = !item;
  const [data, setData] = useState<any>(() => (item ? JSON.parse(JSON.stringify(item.data)) : { ...blankOf(kind, pack), ...(preset ?? {}) }));
  const [id, setId] = useState(item?.id ?? presetId ?? '');
  const [idTouched, setIdTouched] = useState(!!item || !!presetId);
  const [active, setActive] = useState(item ? item.active : true);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<{ error: string; problems: string[] } | null>(null);
  const set = (patch: object) => setData((d: any) => ({ ...d, ...patch }));
  const title = data.name ?? data.title ?? data.text ?? '';
  const autoId = kind === 'state' ? '' : slug(String(title), kind === 'compliance' || kind === 'question' ? `${cat.country.toLowerCase()}_` : '');
  const theId = (idTouched ? id : autoId).trim();

  const local: string[] = [];
  if (!String(title).trim()) local.push(kind === 'question' ? 'Write the question' : 'Give it a name');
  if (!theId) local.push('Give it a short code');
  if (isNew && cat.items.some((i) => i.kind === kind && i.id === theId)) local.push('That short code is already used');
  if (kind === 'compliance') { if (!data.head?.trim()) local.push('Choose a compliance head'); if (!data.brief?.trim()) local.push('Say what it is'); if (!data.dueText?.trim()) local.push('Write the due date in words'); local.push(...condProblems(data.applies)); if (data.due?.t === 'event' && !data.due.text?.trim()) local.push('Describe what triggers it'); if (data.due?.t === 'anniversary' && !data.due.of) local.push('Choose the date question the due date is counted from'); if (!data.why?.trim()) local.push('Say why it applies'); if (!data.authority?.trim()) local.push('Say which authority it is filed with'); if (!data.source) local.push('Choose the official source'); if (data.due?.t === 'on' && !(data.due.dates?.length && data.due.dates.every(Boolean))) local.push('Give the one-off date'); if ((data.moved ?? []).some((m: any) => !m.from || !m.to)) local.push('A moved deadline needs both dates'); }
  if (kind === 'question') { if ((data.type === 'choice' || data.type === 'multi') && !(data.options?.length >= 2)) local.push('Add at least two answers to choose from'); local.push(...condProblems(data.show)); }
  if (kind === 'source' && !/^https:\/\/.+\..+/.test(data.url || '')) local.push('The link must start with https://');

  const clean = (d: any) => { const c: any = {}; for (const [k, v] of Object.entries(d)) if (!(v === '' || v === undefined || v === null || (Array.isArray(v) && v.length === 0 && k !== 'calendarYearKinds'))) c[k] = v; return c; };
  const doSave = async (act = active) => {
    setBusy(true); setErr(null);
    const out = await cat.save(kind, theId, clean(data), { active: act });
    setBusy(false);
    if (out.ok) onClose(); else setErr(out);
  };
  const doRemove = async () => { if (!item || !confirm(`Delete this ${KIND_NAME[kind]}? The homepage stops using it straight away. You can bring it back with Undo in "Latest changes" on the Overview.`)) return; setBusy(true); const out = await cat.remove(kind, item.id); setBusy(false); if (out.ok) onClose(); else setErr(out); };
  const doRestore = async () => { if (!item || !confirm('Put this back to the built-in version? Your changes to it are replaced.')) return; setBusy(true); const out = await cat.restore(kind, item.id); setBusy(false); if (out.ok) onClose(); else setErr(out); };

  if (!pack && kind !== 'country') return null;
  return (
    <Modal wide={kind === 'compliance' || kind === 'question'} onClose={onClose}
      title={`${isNew ? 'Add' : 'Change'} ${/^[aeiou]/.test(KIND_NAME[kind]) ? 'an' : 'a'} ${KIND_NAME[kind]}`}
      sub={`${pack?.name ?? cat.country}${item ? ` · code ${item.id} · ${item.origin === 'builtin' ? (item.edited ? 'built-in, changed by you' : 'built-in') : 'added by you'}` : ''}`}
      footer={<>
        <span className="flex flex-wrap items-center gap-2">
          {item && kind !== 'country' && <button type="button" className={btn} disabled={busy} onClick={() => { setActive(!active); void doSave(!active); }}><Power className="h-4 w-4" />{active ? 'Switch off' : 'Switch on'}</button>}
          {item && !(kind === 'country' && item.origin === 'builtin') && <button type="button" className={`${btn} text-rose-700`} disabled={busy} onClick={doRemove}><Trash2 className="h-4 w-4" />Delete</button>}
          {item && item.origin === 'builtin' && item.edited && <button type="button" className={btn} disabled={busy} onClick={doRestore}><RotateCcw className="h-4 w-4" />Restore built-in</button>}
        </span>
        <span className="flex items-center gap-2">
          {local.length > 0 && <span className="max-w-md text-right text-xs font-semibold text-rose-700">{Array.from(new Set(local)).slice(0, 3).join('. ')}.</span>}
          <button type="button" className={btn} onClick={onClose}>Cancel</button>
          <button type="button" className={btnPrimary} disabled={busy || local.length > 0} onClick={() => doSave()}>{busy ? 'Saving…' : 'Save'}</button>
        </span>
      </>}>
      {err && <div role="alert" className="mb-3 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800"><b>{err.error}.</b>{err.problems.length > 0 && <ul className="mt-1 list-disc pl-5 text-xs">{err.problems.map((p, i) => <li key={i}>{p}</li>)}</ul>}</div>}
      {!active && item && <p className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">This {KIND_NAME[kind]} is switched off: the checker does not use it.</p>}

      {kind === 'compliance' && pack && <ComplianceForm data={data} set={set} pack={pack} cat={cat} />}
      {kind === 'question' && pack && <QuestionForm data={data} set={set} pack={pack} selfId={theId} />}
      {kind === 'entity' && pack && <div className="grid gap-3 md:grid-cols-2">
        <Field label="Name"><input className={inp} value={data.name ?? ''} onChange={(e) => set({ name: e.target.value })} /></Field>
        <Field label="What kind of taxpayer is it?" hint="decides which questions it is asked"><select className={inp} value={data.kind} onChange={(e) => set({ kind: e.target.value })}>{(Object.keys(KIND_LABEL) as Kind[]).map((k) => <option key={k} value={k}>{KIND_LABEL[k]}</option>)}</select></Field>
        <Field label="Description" hint="shown under the name on the homepage" wide><textarea className={area} value={data.desc ?? ''} onChange={(e) => set({ desc: e.target.value })} /></Field>
        <Field label={`Offered in which ${pack.stateLabel.toLowerCase()}?`} wide>
          <select className={`${inpW} mb-2 w-64`} value={data.onlyStates?.length ? 'only' : data.notStates?.length ? 'not' : 'all'} onChange={(e) => set({ onlyStates: e.target.value === 'only' ? [pack.states[0]?.code].filter(Boolean) : undefined, notStates: e.target.value === 'not' ? [pack.states[0]?.code].filter(Boolean) : undefined })}><option value="all">Everywhere</option><option value="only">Only in these</option><option value="not">Everywhere except these</option></select>
          {(data.onlyStates?.length || data.notStates?.length) ? <Chips options={pack.states.map((s) => ({ v: s.code, label: s.name }))} value={data.onlyStates ?? data.notStates ?? []} onChange={(v) => set(data.onlyStates ? { onlyStates: v } : { notStates: v })} /> : null}
        </Field>
        <Field label="Tags" hint="optional labels that rules can refer to, separated by commas" wide><input className={inp} value={(data.tags ?? []).join(', ')} onChange={(e) => set({ tags: e.target.value.split(',').map((x) => x.trim()).filter(Boolean) })} /></Field>
      </div>}
      {kind === 'state' && <div className="grid gap-3 md:grid-cols-2">
        <Field label="Short code" hint="for example ON or CA"><input className={inp} disabled={!isNew} value={id} onChange={(e) => { setId(e.target.value.toUpperCase()); setIdTouched(true); }} /></Field>
        <Field label="Name"><input className={inp} value={data.name ?? ''} onChange={(e) => set({ name: e.target.value })} /></Field>
        <Field label="Tags" hint="labels that group states for rules, separated by commas (for example hst, pst)" wide><input className={inp} value={(data.tags ?? []).join(', ')} onChange={(e) => set({ tags: e.target.value.split(',').map((x) => x.trim()).filter(Boolean) })} /></Field>
      </div>}
      {(kind === 'department') && <div className="grid gap-3">
        <Field label="Name"><input className={inp} value={data.name ?? ''} onChange={(e) => set({ name: e.target.value })} /></Field>
        <Field label="Description" hint="shown on the homepage under the department"><textarea className={area} value={data.desc ?? ''} onChange={(e) => set({ desc: e.target.value })} /></Field>
      </div>}
      {kind === 'step' && <div className="grid gap-3">
        <Field label="Title of the group" hint="questions are asked one group at a time"><input className={inp} value={data.title ?? ''} onChange={(e) => set({ title: e.target.value })} /></Field>
        <Field label="Explanation" hint="shown behind the ? next to the title"><textarea className={area} value={data.desc ?? ''} onChange={(e) => set({ desc: e.target.value })} /></Field>
      </div>}
      {kind === 'source' && <div className="grid gap-3 md:grid-cols-2">
        <p className="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs text-indigo-900 md:col-span-2">Only the government&apos;s or the regulator&apos;s own page: the tax authority, the registry, the ministry, the official gazette. Never a blog, a firm&apos;s website or a news article. The person sees this link and the date you last read it beside the compliance.</p>
        <Field label="Title of the page or document" wide><input className={inp} value={data.title ?? ''} onChange={(e) => set({ title: e.target.value })} /></Field>
        <Field label="Who publishes it" hint="for example Canada Revenue Agency"><input className={inp} value={data.publisher ?? ''} onChange={(e) => set({ publisher: e.target.value })} /></Field>
        <Field label="Date you last read it"><input type="date" className={inp} value={data.checked ?? ''} onChange={(e) => set({ checked: e.target.value })} /></Field>
        <Field label="Link" wide><input className={inp} value={data.url ?? ''} onChange={(e) => set({ url: e.target.value })} /></Field>
      </div>}
      {kind === 'country' && <CountryForm data={data} set={set} active={active} setActive={setActive} isNew={isNew} />}

      {kind !== 'state' && kind !== 'country' && isNew && (
        <details className="mt-4 text-xs text-slate-600"><summary className="cursor-pointer font-semibold">Short code: {theId || '(from the name)'}</summary>
          <p className="mt-1">A short code identifies this item inside the system. It is made from the name; change it only if you need to.</p>
          <input aria-label="Short code" className={`${inp} mt-1 max-w-xs`} value={idTouched ? id : autoId} onChange={(e) => { setId(e.target.value.replace(/[^A-Za-z0-9_-]/g, '')); setIdTouched(true); }} />
        </details>)}
    </Modal>
  );
}

function CountryForm({ data, set, active, setActive, isNew }: { data: any; set: (p: object) => void; active: boolean; setActive: (b: boolean) => void; isNew: boolean }) {
  const fixed = !!data.fixedYearEnd;
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <Field label="Name"><input className={inp} value={data.name ?? ''} onChange={(e) => set({ name: e.target.value })} /></Field>
      <Field label="Currency" hint="three letters, for example CAD"><input className={inp} maxLength={3} value={data.currency ?? ''} onChange={(e) => set({ currency: e.target.value.toUpperCase() })} /></Field>
      <Field label="What are its regions called?" hint="for example Province or territory, State, Emirate"><input className={inp} value={data.stateLabel ?? ''} onChange={(e) => set({ stateLabel: e.target.value })} /></Field>
      <Field label="Financial year">
        <select className={inp} value={fixed ? 'fixed' : 'own'} onChange={(e) => set({ fixedYearEnd: e.target.value === 'fixed' ? [3, 31] : undefined })}><option value="own">Each business chooses its own year end (we ask for it)</option><option value="fixed">The same for everyone</option></select>
        {fixed && <span className="mt-1 flex items-center gap-1 text-xs">ends on month <input aria-label="Year-end month" type="number" min={1} max={12} className={`${inpW} w-16`} value={data.fixedYearEnd[0]} onChange={(e) => set({ fixedYearEnd: [Number(e.target.value) || 1, data.fixedYearEnd[1]] })} /> day <input aria-label="Year-end day" type="number" min={1} max={31} className={`${inpW} w-16`} value={data.fixedYearEnd[1]} onChange={(e) => set({ fixedYearEnd: [data.fixedYearEnd[0], Number(e.target.value) || 1] })} /></span>}
      </Field>
      {!fixed && <Field label="Who always uses the calendar year?" hint="they are not asked for a year end" wide><Chips options={(Object.keys(KIND_LABEL) as Kind[]).map((k) => ({ v: k, label: KIND_LABEL[k] }))} value={data.calendarYearKinds ?? []} onChange={(v) => set({ calendarYearKinds: v })} /></Field>}
      <Field label="Weekends" wide><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!data.rollWeekend} onChange={(e) => set({ rollWeekend: e.target.checked })} />A due date on a Saturday or Sunday moves to the next Monday</label></Field>
      <Field label="Note about weekends and holidays" hint="shown under the results" wide><textarea className={area} value={data.weekendNote ?? ''} onChange={(e) => set({ weekendNote: e.target.value })} /></Field>
      <Field label="Disclaimer" hint="shown under the results" wide><textarea className={area} value={data.disclaimer ?? ''} onChange={(e) => set({ disclaimer: e.target.value })} /></Field>
      {!isNew && <Field label="Offered on the homepage" wide><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />Visitors can choose this country</label></Field>}
    </div>
  );
}

function QuestionForm({ data, set, pack, selfId }: { data: any; set: (p: object) => void; pack: CountryPack; selfId: string }) {
  const links = useMemo(() => questionLinks(pack).get(selfId), [pack, selfId]);
  const opts: Option[] = data.options ?? [];
  const others = useMemo(() => ({ ...pack, questions: pack.questions.filter((q) => q.id !== selfId) }), [pack, selfId]);
  return (
    <div>
      <H n={1}>The question</H>
      <div className="grid gap-3 md:grid-cols-2">
        <Field label="Question, as the person reads it" wide><input className={inp} value={data.text ?? ''} onChange={(e) => set({ text: e.target.value })} /></Field>
        <Field label="Explanation" hint="shown behind the ? next to the question" wide><textarea className={area} value={data.help ?? ''} onChange={(e) => set({ help: e.target.value })} /></Field>
        <Field label="Which group is it asked in?"><select className={inp} value={data.step} onChange={(e) => set({ step: e.target.value })}>{pack.steps.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}</select></Field>
        <Field label="Kind of answer"><select className={inp} value={data.type} onChange={(e) => set({ type: e.target.value, options: e.target.value === 'choice' || e.target.value === 'multi' ? (opts.length ? opts : [{ v: 'a', label: '' }, { v: 'b', label: '' }]) : undefined })}>{Object.entries(QTYPE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></Field>
      </div>
      {(data.type === 'choice' || data.type === 'multi') && (
        <div className="mt-3"><p className="text-xs font-semibold text-slate-700">Answers to choose from</p>
          <div className="mt-1 space-y-1.5">{opts.map((o, i) => (
            <span key={i} className="flex items-center gap-2"><span className="w-5 text-right text-xs text-slate-400">{i + 1}</span>
              <input aria-label={`Answer ${i + 1}`} className={inp} value={o.label} onChange={(e) => { const label = e.target.value; const none = data.type === 'multi' && /^none( of (these|the above))?$/i.test(label.trim()) && /^(o\d+|a|b)$/.test(o.v) && !opts.some((x) => x.v === 'none'); set({ options: opts.map((x, j) => (j === i ? { ...x, label, v: none ? 'none' : x.v } : x)) }); }} />
              <button type="button" aria-label="Remove answer" className={`${btnSm} text-rose-700`} onClick={() => set({ options: opts.filter((_, j) => j !== i) })}><Trash2 className="h-3 w-3" /></button></span>))}</div>
          <button type="button" className={`${btnSm} mt-1.5`} onClick={() => { let n = opts.length + 1; while (opts.some((o) => o.v === `o${n}`)) n++; set({ options: [...opts, { v: `o${n}`, label: '' }] }); }}><Plus className="h-3 w-3" />Add an answer</button>
          {data.type === 'multi' && <p className="mt-1 text-[11px] text-slate-500">An answer worded exactly &quot;None of these&quot; clears the other ticks when a person chooses it.</p>}
        </div>)}
      <H n={2} sub="leave empty to ask everyone in this country">When is it asked?</H>
      <CondBuilder value={data.show as Cond | undefined} onChange={(c) => set({ show: c })} pack={others} emptyText="Asked of everyone" />
      <label className="mt-3 flex items-center gap-2 text-sm"><input type="checkbox" checked={!!data.optional} onChange={(e) => set({ optional: e.target.checked || undefined })} />The person may skip it</label>
      {links && (links.compliances.length + links.questions.length + links.dates.length > 0) && (
        <div className="mt-4 rounded-lg border border-indigo-200 bg-indigo-50 p-3 text-xs text-indigo-900"><b>What this question is linked to</b>
          {links.compliances.length > 0 && <p className="mt-1">Decides whether these apply: {links.compliances.map((c) => c.name).join(' · ')}</p>}
          {links.dates.length > 0 && <p className="mt-1">Sets the due date of: {links.dates.map((c) => c.name).join(' · ')}</p>}
          {links.questions.length > 0 && <p className="mt-1">Opens these follow-up questions: {links.questions.map((q) => q.text).join(' · ')}</p>}
        </div>)}
    </div>
  );
}

function ComplianceForm({ data, set, pack, cat }: { data: any; set: (p: object) => void; pack: CountryPack; cat: Catalog }) {
  const heads = useMemo(() => Array.from(new Set(pack.compliances.map((c) => c.head))).sort(), [pack]);
  const authorities = useMemo(() => Array.from(new Set(pack.compliances.map((c) => c.authority))).sort(), [pack]);
  const [newSrc, setNewSrc] = useState<{ title: string; publisher: string; url: string } | null>(null);
  const [srcErr, setSrcErr] = useState('');
  const moved: NonNullable<Compliance['moved']> = data.moved ?? [];
  const addSource = async () => {
    if (!newSrc) return; setSrcErr('');
    const sid = slug(newSrc.title, 's_');
    const out = await cat.save('source', sid, { title: newSrc.title, publisher: newSrc.publisher, url: newSrc.url, checked: TODAY() });
    if (out.ok) { set({ source: sid }); setNewSrc(null); } else setSrcErr(out.error);
  };
  const src = pack.sources.find((s) => s.id === data.source);
  return (
    <div>
      <H n={1}>What it is</H>
      <div className="grid gap-3 md:grid-cols-2">
        <Field label="Name"><input className={inp} value={data.name ?? ''} onChange={(e) => set({ name: e.target.value })} /></Field>
        <Field label="Form or short name" hint="for example T2, Form 1040, GSTR-3B"><input className={inp} value={data.form ?? ''} onChange={(e) => set({ form: e.target.value })} /></Field>
        <Field label="Department"><select className={inp} value={data.dept} onChange={(e) => set({ dept: e.target.value })}>{pack.departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</select></Field>
        <Field label="Compliance head" hint="pick one or type a new one"><input className={inp} list="sm-heads" value={data.head ?? ''} onChange={(e) => set({ head: e.target.value })} /><datalist id="sm-heads">{heads.map((h) => <option key={h} value={h} />)}</datalist></Field>
        <Field label="Authority it is filed with" wide><input className={inp} list="sm-auth" value={data.authority ?? ''} onChange={(e) => set({ authority: e.target.value })} /><datalist id="sm-auth">{authorities.map((h) => <option key={h} value={h} />)}</datalist></Field>
        <Field label="What it is, in plain words" wide><textarea className={area} value={data.brief ?? ''} onChange={(e) => set({ brief: e.target.value })} /></Field>
        <Field label="Why it applies" hint="one sentence shown to the person" wide><input className={inp} value={data.why ?? ''} onChange={(e) => set({ why: e.target.value })} /></Field>
      </div>
      <H n={2} sub="built from the entity type, the state and the answers to questions">Who it applies to</H>
      <CondBuilder value={data.applies as Cond | undefined} onChange={(c) => set({ applies: c ?? { all: [] } })} pack={pack} emptyText="Everyone who chooses this country and department" />
      <H n={3}>When it is due</H>
      <div className="mb-3 grid gap-3 md:grid-cols-2">
        <Field label="How often"><select className={inp} value={data.frequency} onChange={(e) => set({ frequency: e.target.value })}>{Object.entries(FREQ_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></Field>
        <Field label="Weekends"><select className={inp} value={data.roll === false ? 'no' : 'yes'} onChange={(e) => set({ roll: e.target.value === 'no' ? false : undefined })}><option value="yes">Follow the country&apos;s weekend rule</option><option value="no">Always show the date exactly as the rule gives it</option></select></Field>
      </div>
      <DueBuilder value={data.due as DueRule} onChange={(r) => set({ due: r })} pack={pack} extra={{ roll: data.roll, moved }} />
      <div className="mt-3"><Field label="The due date in the official words" hint="shown to the person under the date"><textarea className={area} value={data.dueText ?? ''} onChange={(e) => set({ dueText: e.target.value })} /></Field></div>
      <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3">
        <p className="text-xs font-bold text-amber-900">Has the government moved a deadline?</p>
        <p className="text-[11px] text-amber-900">Record the usual date and the new date. Only that one period changes; the rule stays as it is for later years. Everyone tracking this compliance gets the new date.</p>
        <div className="mt-2 space-y-1.5">{moved.map((m, i) => (
          <span key={i} className="flex flex-wrap items-center gap-2 text-xs">usual date <input aria-label="Usual date" type="date" className={`${inpW} w-40`} value={m.from} onChange={(e) => set({ moved: moved.map((x, j) => (j === i ? { ...x, from: e.target.value } : x)) })} /> moved to <input aria-label="New date" type="date" className={`${inpW} w-40`} value={m.to} onChange={(e) => set({ moved: moved.map((x, j) => (j === i ? { ...x, to: e.target.value } : x)) })} />
            <input aria-label="Note" placeholder="Why, for example Circular 7/2026" className={`${inpW} w-64`} value={m.note ?? ''} onChange={(e) => set({ moved: moved.map((x, j) => (j === i ? { ...x, note: e.target.value || undefined } : x)) })} />
            <button type="button" aria-label="Remove moved deadline" className={`${btnSm} text-rose-700`} onClick={() => set({ moved: moved.filter((_, j) => j !== i) })}><Trash2 className="h-3 w-3" /></button></span>))}</div>
        <button type="button" className={`${btnSm} mt-1.5`} onClick={() => set({ moved: [...moved, { from: '', to: '' }] })}><Plus className="h-3 w-3" />Record a moved deadline</button>
      </div>
      <H n={4} sub="shown with the compliance so the person takes it seriously">If it is missed</H>
      <div className="grid gap-3">
        <Field label="Penalty" hint="amount, percentage or consequence, in the authority's words"><textarea className={area} value={data.penalty ?? ''} onChange={(e) => set({ penalty: e.target.value })} /></Field>
        <Field label="Note for the person" hint="optional: exceptions, things to confirm"><textarea className={area} value={data.note ?? ''} onChange={(e) => set({ note: e.target.value })} /></Field>
      </div>
      <H n={5}>Where it comes from</H>
      <div className="grid gap-3 md:grid-cols-2">
        <Field label="Official source" wide>
          <span className="flex flex-wrap items-center gap-2"><select className={`${inp} max-w-xl flex-1`} value={data.source ?? ''} onChange={(e) => set({ source: e.target.value })}>{!src && <option value="">Choose a source…</option>}{pack.sources.map((s) => <option key={s.id} value={s.id}>{s.publisher}: {s.title.slice(0, 80)}</option>)}</select>
            <button type="button" className={btnSm} onClick={() => setNewSrc({ title: '', publisher: data.authority ?? '', url: 'https://' })}><Plus className="h-3 w-3" />New source</button>
            {src && <a className="text-xs text-indigo-700 underline" href={src.url} target="_blank" rel="noreferrer">open</a>}</span>
          {newSrc && <span className="mt-2 grid gap-2 rounded-lg border border-slate-200 bg-slate-50 p-2 md:grid-cols-3">
            <input aria-label="Source title" placeholder="Title of the page" className={inp} value={newSrc.title} onChange={(e) => setNewSrc({ ...newSrc, title: e.target.value })} />
            <input aria-label="Source publisher" placeholder="Who publishes it" className={inp} value={newSrc.publisher} onChange={(e) => setNewSrc({ ...newSrc, publisher: e.target.value })} />
            <input aria-label="Source link" placeholder="https://…" className={inp} value={newSrc.url} onChange={(e) => setNewSrc({ ...newSrc, url: e.target.value })} />
            <span className="flex items-center gap-2 md:col-span-3"><button type="button" className={btnSm} disabled={!newSrc.title.trim() || !/^https:\/\/.+\..+/.test(newSrc.url)} onClick={addSource}>Add this source</button><button type="button" className={btnSm} onClick={() => setNewSrc(null)}>Cancel</button>{srcErr && <span className="text-xs text-rose-700">{srcErr}</span>}</span></span>}
        </Field>
        <Field label="Checked on the official page?"><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!data.verified} onChange={(e) => set({ verified: e.target.checked })} />I read the due date and who it applies to on that page</label><span className="mt-1 block text-[11px] text-slate-500">Unticked, the person is told to confirm it on the official source.</span></Field>
        <Field label={`Importance: ${data.weight ?? 50}`} hint="the three most important are shown before sign-up"><input type="range" min={1} max={100} className="w-full" value={data.weight ?? 50} onChange={(e) => set({ weight: Number(e.target.value) })} /></Field>
      </div>
    </div>
  );
}

export { Badge, Copy };
