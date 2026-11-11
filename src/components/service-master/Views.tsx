'use client';
// The Service Master screens about compliances and questions.
import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowDown, ArrowUp, CalendarClock, Copy, FilePlus2, Globe2, HelpCircle, ListPlus, Search, ShieldAlert } from 'lucide-react';
import type { CatalogItem } from '@/lib/compliance/catalog';
import type { Answers, Compliance, CountryPack, Question, Selection } from '@/lib/compliance/types';
import { adviceOf } from '@/lib/compliance/health';
import { FREQ_LABEL, QTYPE_LABEL, condRefs, describeCond, describeDue, dueDependsOn, questionLinks } from '@/lib/compliance/describe';
import { entityTypesFor, evaluate, fmt, needsYearEnd, visibleQuestions } from '@/lib/compliance/engine';
import { previewDates } from './DueBuilder';
import { AddBtn, BASE, Card, EditBtn, Status, TODAY, type ViewProps } from './parts';
import { Badge, Chips, btn, btnSm, inp, inpW, td, th } from './ui';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const clamp = 'line-clamp-3';
const deptName = (pack: CountryPack, id: string) => pack.departments.find((d) => d.id === id)?.name ?? id;

// ── Compliance heads ──
export function HeadsView({ cat, pack, open }: ViewProps) {
  const comps = cat.of('compliance');
  const [busy, setBusy] = useState(''); const [msg, setMsg] = useState('');
  const groups = useMemo(() => pack.departments.map((d) => {
    const mine = comps.filter((c) => c.data.dept === d.id);
    const heads = Array.from(new Set(mine.map((c) => c.data.head as string))).sort();
    return { dept: d, heads: heads.map((h) => ({ head: h, items: mine.filter((c) => c.data.head === h) })) };
  }), [pack, comps]);
  const rename = async (dept: string, head: string, items: CatalogItem[]) => {
    const to = prompt(`New name for the head "${head}"`, head)?.trim();
    if (!to || to === head) return;
    setBusy(`${dept}|${head}`); setMsg('');
    for (const it of items) { const out = await cat.save('compliance', it.id, { ...it.data, head: to }, { active: it.active }); if (!out.ok) { setMsg(out.error); break; } }
    setBusy('');
  };
  return (
    <div className="space-y-5">
      {msg && <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">{msg}</p>}
      {groups.map(({ dept, heads }) => (
        <Card key={dept.id} title={dept.name} sub={`${heads.length} heads · ${heads.reduce((a, h) => a + h.items.length, 0)} sub-compliances`}>
          <div className="divide-y divide-slate-100 border-t border-slate-200">
            {heads.length === 0 && <p className="px-4 py-3 text-sm text-slate-500">No compliance in this department yet.</p>}
            {heads.map(({ head, items }) => (
              <div key={head} className="px-4 py-3" data-head={head}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-bold">{head} <span className="ml-1 text-xs font-semibold text-slate-500">{items.length} · {items.filter((i) => i.data.verified).length} checked on the official page</span></p>
                  <span className="flex gap-1.5"><button type="button" className={btnSm} disabled={busy === `${dept.id}|${head}`} onClick={() => rename(dept.id, head, items)}>{busy === `${dept.id}|${head}` ? 'Renaming…' : 'Rename'}</button>
                    <button type="button" className={btnSm} onClick={() => open('compliance', null, { dept: dept.id, head })}>Add a sub-compliance here</button></span>
                </div>
                <div className="mt-1.5 flex flex-wrap gap-1.5">{items.map((i) => <button key={i.id} type="button" onClick={() => open('compliance', i)} className={`rounded-full border px-2.5 py-1 text-xs font-semibold hover:border-indigo-500 hover:text-indigo-700 ${i.active ? 'border-slate-300 bg-white text-slate-700' : 'border-amber-200 bg-amber-50 text-amber-800 line-through'}`}>{i.data.form ? `${i.data.form}: ` : ''}{String(i.data.name).slice(0, 60)}</button>)}</div>
              </div>))}
          </div>
        </Card>))}
    </div>
  );
}

// ── Sub-compliances ──
export function SubCompliancesView({ cat, pack, open }: ViewProps) {
  const all = cat.of('compliance');
  const [q, setQ] = useState(''); const [dept, setDept] = useState(''); const [head, setHead] = useState(''); const [state, setState] = useState(''); const [show, setShow] = useState('all');
  const [openId, setOpenId] = useState('');
  useEffect(() => { const d = new URLSearchParams(window.location.search).get('dept'); if (d) setDept(d); }, []);
  const heads = useMemo(() => Array.from(new Set(all.filter((c) => !dept || c.data.dept === dept).map((c) => c.data.head as string))).sort(), [all, dept]);
  const stTags = pack.states.find((s) => s.code === state)?.tags ?? [];
  const rows = all.filter((c) => {
    const d = c.data as Compliance;
    if (dept && d.dept !== dept) return false;
    if (head && d.head !== head) return false;
    if (show === 'checked' && !d.verified) return false;
    if (show === 'confirm' && d.verified) return false;
    if (show === 'off' && c.active) return false;
    if (show === 'mine' && !(c.edited || c.origin !== 'builtin')) return false;
    if (show === 'nopenalty' && d.penalty) return false;
    if (show === 'moved' && !(d.moved?.length)) return false;
    if (state) { const r = condRefs(d.applies); if (!(r.states.has(state) || stTags.some((t) => r.stags.has(t)))) return false; }
    if (q) { const hay = `${d.name} ${d.form ?? ''} ${d.head} ${d.authority} ${c.id}`.toLowerCase(); if (!q.toLowerCase().split(/\s+/).every((w) => hay.includes(w))) return false; }
    return true;
  });
  return (
    <Card title={`Sub-compliances (${rows.length} of ${all.length})`} right={<AddBtn onClick={() => open('compliance', null, dept ? { dept, head: head || '' } : undefined)}>Add a sub-compliance</AddBtn>}>
      <div className="flex flex-wrap items-center gap-2 border-t border-slate-200 bg-slate-50 px-4 py-2.5">
        <span className="relative"><Search className="pointer-events-none absolute left-2 top-2 h-4 w-4 text-slate-400" /><input aria-label="Search" placeholder="Search name, form, authority" className={`${inpW} w-64 pl-8`} value={q} onChange={(e) => setQ(e.target.value)} /></span>
        <select aria-label="Department" className={`${inpW} w-52`} value={dept} onChange={(e) => { setDept(e.target.value); setHead(''); }}><option value="">All departments</option>{pack.departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</select>
        <select aria-label="Head" className={`${inpW} w-52`} value={head} onChange={(e) => setHead(e.target.value)}><option value="">All heads</option>{heads.map((h) => <option key={h} value={h}>{h}</option>)}</select>
        {pack.states.length > 1 && <select aria-label={pack.stateLabel} className={`${inpW} w-52`} value={state} onChange={(e) => setState(e.target.value)}><option value="">Any {pack.stateLabel.toLowerCase()}</option>{pack.states.map((s) => <option key={s.code} value={s.code}>Only for {s.name}</option>)}</select>}
        <select aria-label="Show" className={`${inpW} w-56`} value={show} onChange={(e) => setShow(e.target.value)}><option value="all">Show all</option><option value="checked">Checked on the official page</option><option value="confirm">Still to confirm</option><option value="nopenalty">No penalty recorded</option><option value="moved">With a moved deadline</option><option value="mine">Added or changed by you</option><option value="off">Switched off</option></select>
      </div>
      <div className="overflow-x-auto"><table className="w-full min-w-[1100px] border-t border-slate-200">
        <thead className="bg-slate-50"><tr>{['Sub-compliance', 'Head', 'Applies when', 'Due', 'If missed', 'Source', ''].map((h, i) => <th key={i} className={th}>{h}</th>)}</tr></thead>
        <tbody>{rows.map((c) => { const d = c.data as Compliance; const src = pack.sources.find((s) => s.id === d.source); const isOpen = openId === c.id; return (
          <React.Fragment key={c.id}>
            <tr className={`border-t border-slate-100 ${c.active ? '' : 'bg-amber-50/40'}`} data-item={c.id}>
              <td className={`${td} max-w-[260px]`}><button type="button" className="text-left font-bold text-slate-900 hover:text-indigo-700" onClick={() => setOpenId(isOpen ? '' : c.id)}>{d.name}</button>
                <span className="mt-1 flex flex-wrap gap-1">{d.form && <Badge tone="indigo">{d.form}</Badge>}<Badge>{FREQ_LABEL[d.frequency] ?? d.frequency}</Badge><Status it={c} />{d.moved?.length ? <Badge tone="amber">deadline moved</Badge> : null}</span></td>
              <td className={`${td} max-w-[150px]`}>{d.head}<span className="block text-xs text-slate-500">{deptName(pack, d.dept)}</span></td>
              <td className={`${td} max-w-[300px] text-xs text-slate-700`}><span className={isOpen ? '' : clamp}>{describeCond(d.applies, pack)}</span></td>
              <td className={`${td} max-w-[230px] text-xs text-slate-700`}><span className={isOpen ? '' : clamp}>{describeDue(d.due, pack)}</span></td>
              <td className={`${td} max-w-[220px] text-xs text-slate-700`}>{d.penalty ? <span className={isOpen ? '' : clamp}>{d.penalty}</span> : <span className="text-slate-400">not recorded</span>}</td>
              <td className={`${td} text-xs`}>{d.verified ? <Badge tone="green">checked</Badge> : <Badge tone="amber">to confirm</Badge>}{src && <a className="mt-1 block max-w-[140px] truncate text-indigo-700 underline" href={src.url} target="_blank" rel="noreferrer">{src.publisher}</a>}</td>
              <td className={td}><span className="flex flex-col gap-1"><EditBtn onClick={() => open('compliance', c)} /><button type="button" className={btnSm} onClick={() => open('compliance', null, { ...JSON.parse(JSON.stringify(d)), name: `${d.name} (copy)`, verified: false, moved: undefined })}><Copy className="h-3 w-3" />Copy</button></span></td>
            </tr>
            {isOpen && <tr className="border-t border-slate-100 bg-slate-50"><td colSpan={7} className="px-4 py-3 text-xs text-slate-700"><Detail d={d} pack={pack} id={c.id} /></td></tr>}
          </React.Fragment>); })}
          {rows.length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-sm text-slate-500">Nothing matches.</td></tr>}</tbody>
      </table></div>
    </Card>
  );
}
function Detail({ d, pack, id }: { d: Compliance; pack: CountryPack; id: string }) {
  const fye = pack.fixedYearEnd ? `${String(pack.fixedYearEnd[0]).padStart(2, '0')}-${String(pack.fixedYearEnd[1]).padStart(2, '0')}` : '12-31';
  const pv = useMemo(() => previewDates(d.due, pack, fye, '2020-03-15', d, 3), [d, pack, fye]);
  const qs = Array.from(condRefs(d.applies).questions).map((q) => pack.questions.find((x) => x.id === q)?.text ?? q);
  const dep = dueDependsOn(d.due, pack);
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <div><p><b>What it is:</b> {d.brief}</p><p className="mt-1"><b>Why it applies:</b> {d.why}</p><p className="mt-1"><b>Filed with:</b> {d.authority}</p><p className="mt-1 text-slate-500">Code {id} · importance {d.weight}</p></div>
      <div><p><b>Due date in the official words:</b> {d.dueText}</p>
        {d.due.t !== 'event' && <p className="mt-1"><b>Next dates</b> (sample: year end {fye}{d.due.t === 'anniversary' ? ', start date 15 March 2020' : ''}): {pv.dates.length ? pv.dates.map((x) => `${fmt(x.date)}${x.was ? ` (moved from ${fmt(x.was)})` : ''}`).join(' · ') : 'none'}</p>}
        {dep && <p className="mt-1"><b>Counted from:</b> {dep === 'fye' ? 'the financial year end the person gives' : `the answer to “${pack.questions.find((q) => q.id === dep)?.text ?? dep}”`}</p>}
        {qs.length > 0 && <p className="mt-1"><b>Questions that decide it:</b> {qs.join(' · ')}</p>}
        {d.note && <p className="mt-1"><b>Note:</b> {d.note}</p>}</div>
    </div>
  );
}

// ── Service rules: try it, and the links ──
function Ask({ q, value, onChange }: { q: Question; value: string | string[] | undefined; onChange: (v: string | string[] | undefined) => void }) {
  if (q.type === 'yn') return <Chips single options={[{ v: 'yes', label: 'Yes' }, { v: 'no', label: 'No' }, { v: 'unsure', label: 'Not sure' }]} value={typeof value === 'string' ? [value] : []} onChange={(v) => onChange(v[0])} />;
  if (q.type === 'choice') return <select aria-label={q.text} className={`${inp} max-w-xs`} value={typeof value === 'string' ? value : ''} onChange={(e) => onChange(e.target.value || undefined)}><option value="">Choose…</option>{(q.options ?? []).map((o) => <option key={o.v} value={o.v}>{o.label}</option>)}<option value="unsure">Not sure</option></select>;
  if (q.type === 'multi') { const cur = Array.isArray(value) ? value : []; return <Chips options={q.options ?? []} value={cur} onChange={(v) => { const added = v.find((x) => !cur.includes(x)); onChange(added === 'none' ? ['none'] : v.filter((x) => x !== 'none')); }} />; }
  if (q.type === 'date') return <input aria-label={q.text} type="date" className={`${inpW} w-44`} value={typeof value === 'string' ? value : ''} onChange={(e) => onChange(e.target.value || undefined)} />;
  return <MonthDayAsk label={q.text} value={typeof value === 'string' ? value : ''} onChange={onChange} />;
}
function MonthDayAsk({ label, value, onChange }: { label: string; value: string; onChange: (v: string | undefined) => void }) {
  const [m, d] = value.includes('-') ? value.split('-') : ['', ''];
  const days = m ? new Date(2025, Number(m), 0).getDate() : 31;
  return (<span className="flex gap-1.5" role="group" aria-label={label}>
    <select aria-label="Month" className={`${inpW} w-36`} value={m} onChange={(e) => { const mm = e.target.value; if (!mm) return onChange(undefined); const last = new Date(2025, Number(mm), 0).getDate(); onChange(`${mm}-${String(Math.min(Number(d) || last, last)).padStart(2, '0')}`); }}><option value="">Month…</option>{MONTHS.map((n, i) => <option key={n} value={String(i + 1).padStart(2, '0')}>{n}</option>)}</select>
    <select aria-label="Day" className={`${inpW} w-20`} value={d} disabled={!m} onChange={(e) => onChange(`${m}-${e.target.value}`)}>{Array.from({ length: days }, (_, i) => String(i + 1).padStart(2, '0')).map((x) => <option key={x} value={x}>{Number(x)}</option>)}</select></span>);
}

export function RulesView({ cat, pack, open }: ViewProps) {
  const [state, setState] = useState(pack.states[0]?.code ?? '');
  const ents = entityTypesFor(pack, state);
  const [entity, setEntity] = useState(ents[0]?.id ?? '');
  const [depts, setDepts] = useState<string[]>(pack.departments.map((d) => d.id));
  const [answers, setAnswers] = useState<Answers>({});
  useEffect(() => { setState(pack.states[0]?.code ?? ''); setDepts(pack.departments.map((d) => d.id)); setAnswers({}); }, [pack.code]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (!ents.some((e) => e.id === entity)) setEntity(ents[0]?.id ?? ''); }, [ents, entity]);
  const sel: Selection = { country: pack.code, state, entity, depts };
  const ent = pack.entityTypes.find((e) => e.id === entity);
  const qs = useMemo(() => (ent ? visibleQuestions(pack, sel, answers) : []), [pack, state, entity, depts, answers]); // eslint-disable-line react-hooks/exhaustive-deps
  const results = useMemo(() => (ent ? evaluate(pack, sel, answers, TODAY()) : []), [pack, state, entity, depts, answers]); // eslint-disable-line react-hooks/exhaustive-deps
  const comps = cat.of('compliance');
  const links = useMemo(() => questionLinks(pack), [pack]);
  const set = (id: string, v: string | string[] | undefined) => setAnswers((a) => ({ ...a, [id]: v }));
  const answered = qs.filter((q) => { const v = answers[q.id]; return v !== undefined && v !== '' && !(Array.isArray(v) && v.length === 0); }).length;
  return (
    <div className="space-y-5">
      <Card title="Try it" sub="Pick what a visitor would pick and answer as they would. The right-hand side is exactly what the checker gives them, worked out by the same rules.">
        <div className="grid gap-0 border-t border-slate-200 lg:grid-cols-2">
          <div className="border-b border-slate-200 p-4 lg:border-b-0 lg:border-r">
            <div className="grid gap-2 md:grid-cols-2">
              <label className="text-xs font-semibold text-slate-700">{pack.stateLabel}<select aria-label="Try: state" className={`${inp} mt-1`} value={state} onChange={(e) => setState(e.target.value)}>{pack.states.map((s) => <option key={s.code} value={s.code}>{s.name}</option>)}</select></label>
              <label className="text-xs font-semibold text-slate-700">Entity type<select aria-label="Try: entity type" className={`${inp} mt-1`} value={entity} onChange={(e) => { setEntity(e.target.value); setAnswers({}); }}>{ents.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}</select></label>
            </div>
            <p className="mt-3 text-xs font-semibold text-slate-700">Departments</p>
            <div className="mt-1"><Chips options={pack.departments.map((d) => ({ v: d.id, label: d.name }))} value={depts} onChange={setDepts} /></div>
            <div className="mt-3 flex items-center justify-between"><p className="text-xs font-semibold text-slate-700">Questions this person is asked: {qs.length} <span className="font-normal text-slate-500">({answered} answered)</span></p><button type="button" className={btnSm} onClick={() => setAnswers({})}>Clear answers</button></div>
            <div className="mt-1 max-h-[520px] divide-y divide-slate-100 overflow-y-auto rounded-lg border border-slate-200">
              {ent && needsYearEnd(pack, ent) && !pack.questions.some((q) => q.id === 'fye') && <div className="flex flex-wrap items-center justify-between gap-2 bg-indigo-50/50 px-3 py-2"><span className="text-sm">Financial year end</span><MonthDayAsk label="Financial year end" value={typeof answers.fye === 'string' ? answers.fye : ''} onChange={(v) => set('fye', v)} /></div>}
              {qs.map((q) => (<div key={q.id} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2" data-try={q.id}><span className="min-w-0 flex-1 basis-56 text-sm">{q.text}</span><Ask q={q} value={answers[q.id]} onChange={(v) => set(q.id, v)} /></div>))}
              {qs.length === 0 && <p className="px-3 py-4 text-sm text-slate-500">No questions for this combination.</p>}
            </div>
          </div>
          <div className="p-4">
            <p className="text-sm font-bold" data-try-total={results.length}>{results.length} {results.length === 1 ? 'compliance' : 'compliances'} for this person <span className="font-normal text-slate-500">({results.filter((r) => r.certainty === 'check').length} only &quot;may apply&quot; because of a question not answered or &quot;not sure&quot;)</span></p>
            <p className="text-xs text-slate-500">The first three are what a visitor sees before signing up.</p>
            <ol className="mt-2 max-h-[600px] space-y-1.5 overflow-y-auto">
              {results.map((r, i) => { const it = comps.find((c) => c.id === r.id); return (
                <li key={r.id} className={`rounded-lg border px-3 py-2 text-sm ${i < 3 ? 'border-indigo-300 bg-indigo-50/60' : 'border-slate-200 bg-white'}`} data-try-result={r.id}>
                  <span className="flex flex-wrap items-center justify-between gap-2"><b>{i + 1}. {r.name}</b><span className="flex items-center gap-1.5">{r.certainty === 'check' && <Badge tone="amber">may apply</Badge>}<Badge tone={r.next[0] ? 'green' : 'slate'}>{r.next[0] ? fmt(r.next[0].date) : r.needs ? 'needs a date' : 'no fixed date'}</Badge>{it && <EditBtn onClick={() => open('compliance', it)} />}</span></span>
                  {it && <span className="mt-0.5 block text-xs text-slate-600 line-clamp-2" title={describeCond((it.data as Compliance).applies, pack)}>Because {describeCond((it.data as Compliance).applies, pack)}</span>}
                </li>); })}
            </ol>
          </div>
        </div>
      </Card>
      <Card title="What each question leads to" sub="Every question on the homepage and the compliances it switches on, the dates it sets and the follow-up questions it opens.">
        <div className="overflow-x-auto"><table className="w-full min-w-[900px] border-t border-slate-200"><thead className="bg-slate-50"><tr>{['Question', 'Decides whether these apply', 'Sets the date of', 'Opens these questions'].map((h) => <th key={h} className={th}>{h}</th>)}</tr></thead>
          <tbody>{pack.questions.map((q) => { const l = links.get(q.id); const names = (list: { name?: string; text?: string }[]) => list.length ? <span className="flex flex-wrap gap-1">{list.slice(0, 8).map((c, i) => <Badge key={i}>{String(c.name ?? c.text).slice(0, 42)}</Badge>)}{list.length > 8 && <Badge tone="indigo">+{list.length - 8}</Badge>}</span> : <span className="text-slate-400">–</span>; return (
            <tr key={q.id} className="border-t border-slate-100"><td className={`${td} max-w-[320px]`}>{q.text}</td><td className={td}>{names(l?.compliances ?? [])}</td><td className={td}>{names(l?.dates ?? [])}</td><td className={td}>{names(l?.questions ?? [])}</td></tr>); })}</tbody></table></div>
      </Card>
    </div>
  );
}

// ── Questions ──
export function QuestionsView({ cat, pack, open }: ViewProps) {
  const steps = cat.of('step'); const qs = cat.of('question');
  const links = useMemo(() => questionLinks(pack), [pack]);
  const [busy, setBusy] = useState(''); const [msg, setMsg] = useState('');
  const move = async (list: CatalogItem[], i: number, dir: -1 | 1) => {
    const a = list[i], b = list[i + dir]; if (!a || !b) return;
    setBusy(a.id); setMsg('');
    const sa = a.sortOrder, sb = b.sortOrder === a.sortOrder ? a.sortOrder + dir : b.sortOrder;
    const o1 = await cat.save('question', a.id, a.data, { active: a.active, sortOrder: sb });
    const o2 = o1.ok ? await cat.save('question', b.id, b.data, { active: b.active, sortOrder: sa }) : o1;
    if (!o2.ok) setMsg(o2.error); setBusy('');
  };
  const orphan = qs.filter((q) => !steps.some((s) => s.id === q.data.step));
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2"><p className="text-sm text-slate-600">{qs.filter((q) => q.active).length} questions in {steps.filter((s) => s.active).length} groups. A person is only asked the ones whose &quot;asked when&quot; fits them.</p>
        <span className="flex gap-2"><button type="button" className={btn} onClick={() => open('step')}><ListPlus className="h-4 w-4" />Add a group</button><AddBtn onClick={() => open('question')}>Add a question</AddBtn></span></div>
      {msg && <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">{msg}</p>}
      {[...steps, ...(orphan.length ? [{ id: '', data: { title: 'In a group that no longer exists' }, active: true } as any as CatalogItem] : [])].map((s, si) => { const mine = s.id ? qs.filter((q) => q.data.step === s.id) : orphan; return (
        <Card key={s.id || 'orphan'} title={`${si + 1}. ${s.data.title}`} sub={s.data.desc} right={s.id ? <span className="flex items-center gap-1.5"><Status it={s} /><EditBtn onClick={() => open('step', s)} label="Edit group" /><button type="button" className={btnSm} onClick={() => open('question', null, { step: s.id })}>Add a question here</button></span> : undefined}>
          <ol className="divide-y divide-slate-100 border-t border-slate-200">
            {mine.length === 0 && <li className="px-4 py-3 text-sm text-slate-500">No questions in this group.</li>}
            {mine.map((q, i) => { const d = q.data as Question; const l = links.get(q.id); const n = (l?.compliances.length ?? 0) + (l?.dates.length ?? 0) + (l?.questions.length ?? 0); return (
              <li key={q.id} className={`flex flex-wrap items-start gap-3 px-4 py-2.5 ${q.active ? '' : 'bg-amber-50/40'}`} data-item={q.id}>
                <span className="mt-0.5 flex flex-col"><button type="button" aria-label="Move up" disabled={i === 0 || !!busy} className="text-slate-400 hover:text-indigo-700 disabled:opacity-30" onClick={() => move(mine, i, -1)}><ArrowUp className="h-3.5 w-3.5" /></button><button type="button" aria-label="Move down" disabled={i === mine.length - 1 || !!busy} className="text-slate-400 hover:text-indigo-700 disabled:opacity-30" onClick={() => move(mine, i, 1)}><ArrowDown className="h-3.5 w-3.5" /></button></span>
                <span className="min-w-0 flex-1 basis-80">
                  <span className="text-sm font-semibold text-slate-900">{d.text}</span>
                  <span className="mt-1 flex flex-wrap gap-1"><Badge tone="indigo">{QTYPE_LABEL[d.type] ?? d.type}</Badge>{d.optional && <Badge>may be skipped</Badge>}<Status it={q} />{(d.options ?? []).slice(0, 6).map((o) => <Badge key={o.v}>{o.label.slice(0, 30)}</Badge>)}{(d.options?.length ?? 0) > 6 && <Badge>+{d.options!.length - 6}</Badge>}</span>
                  <span className="mt-1 block text-xs text-slate-600"><b>Asked when:</b> {d.show ? describeCond(d.show, pack) : 'always'}</span>
                  {q.active && (n === 0 ? <span className="mt-1 block text-xs font-semibold text-amber-700">Linked to nothing: the answer changes no compliance.</span> : (
                    <span className="mt-1 block text-xs text-slate-600"><b>Linked to:</b> {[l!.compliances.length && `decides ${l!.compliances.length} ${l!.compliances.length === 1 ? 'compliance' : 'compliances'} (${Array.from(new Set(l!.compliances.map((c) => c.name.length > 34 ? c.name.slice(0, 33) + '…' : c.name))).slice(0, 3).join(', ')}${l!.compliances.length > 3 ? '…' : ''})`, l!.dates.length && `sets the date of ${l!.dates.length}`, l!.questions.length && `opens ${l!.questions.length} follow-up ${l!.questions.length === 1 ? 'question' : 'questions'}`].filter(Boolean).join(' · ')}</span>))}
                </span>
                <EditBtn onClick={() => open('question', q)} />
              </li>); })}
          </ol>
        </Card>); })}
    </div>
  );
}

// ── Info forms: the dates we ask for ──
export function InfoView({ cat, pack, open }: ViewProps) {
  const links = useMemo(() => questionLinks(pack), [pack]);
  const dateQs = cat.of('question').filter((q) => q.data.type === 'date' || q.data.type === 'monthday');
  const hasFye = pack.questions.some((q) => q.id === 'fye');
  const fye = pack.compliances.filter((c) => 'basis' in c.due && c.due.basis === 'fy');
  const fixed = pack.compliances.filter((c) => !dueDependsOn(c.due, pack) && c.due.t !== 'event' && !(c.due.t === 'afterPeriodEnd' && c.due.ask));
  const events = pack.compliances.filter((c) => c.due.t === 'event');
  const List = ({ list }: { list: Compliance[] }) => (
    <ul className="divide-y divide-slate-100 border-t border-slate-200">{list.length === 0 && <li className="px-4 py-3 text-sm text-slate-500">No due date is counted from this.</li>}
      {list.map((c) => { const it = cat.of('compliance').find((x) => x.id === c.id); return (<li key={c.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 text-sm"><span><b>{c.form ? `${c.form}: ` : ''}{c.name}</b><span className="block text-xs text-slate-600">{describeDue(c.due, pack)}</span></span>{it && <EditBtn onClick={() => open('compliance', it)} />}</li>); })}</ul>);
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2"><p className="max-w-3xl text-sm text-slate-600">A due date is worked out in one of three ways: from a date the person gives, from the calendar, or it has no fixed date. {fixed.length} compliances need no date from the person, {events.length} have no fixed date.</p><AddBtn onClick={() => open('question', null, { type: 'date', optional: true })}>Add a date question</AddBtn></div>
      {pack.fixedYearEnd ? <Card title="Financial year end" sub={`Not asked in ${pack.name}: the financial year ends ${pack.fixedYearEnd[1]} ${MONTHS[pack.fixedYearEnd[0] - 1]} for everyone (set on Countries & States).`} right={<Badge tone="indigo">{fye.length} due dates counted from it</Badge>}><List list={fye} /></Card>
        : !hasFye ? <Card title="Financial year end" sub="There is no question asking for the year end yet. Due dates counted from the financial year need it." right={<AddBtn onClick={() => open('question', null, { type: 'monthday', text: 'When does its financial year end?', step: pack.steps[pack.steps.length - 1]?.id }, 'fye')}>Add the year-end question</AddBtn>}><List list={fye} /></Card> : null}
      {dateQs.map((q) => { const l = links.get(q.id); return (
        <Card key={q.id} title={q.data.text} sub={`${q.id === 'fye' ? 'The year-end question (its short code, fye, is fixed) · ' : ''}${QTYPE_LABEL[q.data.type]} · asked when: ${q.data.show ? describeCond(q.data.show, pack) : 'always'}`} right={<span className="flex items-center gap-1.5"><Status it={q} /><Badge tone="indigo">{l?.dates.length ?? 0} due dates counted from it</Badge><EditBtn onClick={() => open('question', q)} /></span>}><List list={l?.dates ?? []} /></Card>); })}
    </div>
  );
}

// ── Penalties ──
export function PenaltiesView({ cat, pack, open }: ViewProps) {
  const all = cat.of('compliance').filter((c) => c.active);
  const [only, setOnly] = useState('with'); const [q, setQ] = useState('');
  const withP = all.filter((c) => c.data.penalty);
  const rows = (only === 'with' ? withP : only === 'without' ? all.filter((c) => !c.data.penalty) : all).filter((c) => !q || `${c.data.name} ${c.data.form ?? ''} ${c.data.penalty ?? ''}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <Card title={`Penalties: recorded for ${withP.length} of ${all.length} compliances`} sub="To add or change one, open the compliance: the penalty is step 4 of its form. Write it in the authority's own words and tick nothing you have not read.">
      <div className="flex flex-wrap items-center gap-2 border-t border-slate-200 bg-slate-50 px-4 py-2.5">
        <input aria-label="Search" placeholder="Search" className={`${inpW} w-64`} value={q} onChange={(e) => setQ(e.target.value)} />
        <select aria-label="Show" className={`${inpW} w-64`} value={only} onChange={(e) => setOnly(e.target.value)}><option value="with">With a penalty recorded</option><option value="without">No penalty recorded yet</option><option value="all">All</option></select>
      </div>
      <div className="overflow-x-auto"><table className="w-full min-w-[900px] border-t border-slate-200"><thead className="bg-slate-50"><tr>{['Sub-compliance', 'Authority', 'If it is missed', 'Source', ''].map((h, i) => <th key={i} className={th}>{h}</th>)}</tr></thead>
        <tbody>{rows.map((c) => { const d = c.data as Compliance; const src = pack.sources.find((s) => s.id === d.source); return (
          <tr key={c.id} className="border-t border-slate-100" data-item={c.id}><td className={`${td} max-w-[280px]`}><b>{d.name}</b>{d.form && <span className="ml-1"><Badge tone="indigo">{d.form}</Badge></span>}</td><td className={`${td} max-w-[180px] text-xs`}>{d.authority}</td>
            <td className={`${td} max-w-[420px] text-xs`}>{d.penalty || <span className="text-slate-400">not recorded</span>}</td><td className={`${td} text-xs`}>{src && <a className="block max-w-[160px] truncate text-indigo-700 underline" href={src.url} target="_blank" rel="noreferrer">{src.publisher}</a>}</td>
            <td className={td}><EditBtn onClick={() => open('compliance', c)} label={d.penalty ? 'Edit' : 'Add penalty'} /></td></tr>); })}
          {rows.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-500">Nothing here.</td></tr>}</tbody></table></div>
    </Card>
  );
}

// ── Official sources ──
export function SourcesView({ cat, pack, open }: ViewProps) {
  const rows = cat.of('source');
  const yearAgo = `${Number(TODAY().slice(0, 4)) - 1}${TODAY().slice(4)}`;
  const used = (id: string) => pack.compliances.filter((c) => c.source === id).length;
  return (
    <Card title={`Official sources (${rows.length})`} sub="When you re-read a page, open it here and set the date. A page not read for a year is flagged." right={<AddBtn onClick={() => open('source')}>Add a source</AddBtn>}>
      <div className="overflow-x-auto"><table className="w-full min-w-[900px] border-t border-slate-200"><thead className="bg-slate-50"><tr>{['Published by', 'Page', 'Last read', 'Used by', '', ''].map((h, i) => <th key={i} className={th}>{h}</th>)}</tr></thead>
        <tbody>{rows.map((s) => (
          <tr key={s.id} className="border-t border-slate-100" data-item={s.id}><td className={`${td} max-w-[200px]`}>{s.data.publisher}</td><td className={`${td} max-w-[460px]`}><a className="text-indigo-700 underline" href={s.data.url} target="_blank" rel="noreferrer">{s.data.title}</a></td>
            <td className={td}>{s.data.checked}{s.data.checked < yearAgo && <span className="ml-1"><Badge tone="amber">read again</Badge></span>}</td><td className={td}>{used(s.id) || <span className="text-slate-400">nothing</span>}</td><td className={td}><Status it={s} /></td><td className={td}><EditBtn onClick={() => open('source', s)} /></td></tr>))}</tbody></table></div>
    </Card>
  );
}

// ── Wizard builder: the jobs done most ──
export function WizardView({ cat, pack, open }: ViewProps) {
  const [pick, setPick] = useState('');
  const comps = cat.of('compliance');
  const tidy = useMemo(() => adviceOf(pack, TODAY()), [pack]);
  const jobs: { icon: React.ReactNode; title: string; text: string; go: () => void; action: string }[] = [
    { icon: <FilePlus2 className="h-5 w-5" />, title: 'Add a compliance', text: 'Five steps in one form: what it is, who it applies to, when it is due, what happens if it is missed, and the official page it comes from. You see the real dates before you save.', go: () => open('compliance'), action: 'Start' },
    { icon: <HelpCircle className="h-5 w-5" />, title: 'Add a question', text: 'Write the question, choose the kind of answer and say who is asked. Then use it in the "who it applies to" step of any compliance.', go: () => open('question'), action: 'Start' },
    { icon: <CalendarClock className="h-5 w-5" />, title: 'A date question', text: 'Ask for a date (incorporation, registration, licence issue) so that due dates can be counted from it.', go: () => open('question', null, { type: 'date', optional: true }), action: 'Start' },
    { icon: <Globe2 className="h-5 w-5" />, title: `Add a ${pack.stateLabel.toLowerCase()} or an entity type`, text: 'New pick-list entries for the homepage. Rules written for "everywhere" cover a new one straight away.', go: () => open('state'), action: `Add a ${pack.stateLabel.toLowerCase().split(' ')[0]}` },
  ];
  return (
    <div className="space-y-5">
      <div className="grid gap-3 md:grid-cols-2">
        {jobs.map((j) => (<div key={j.title} className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-4"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">{j.icon}</span><div className="min-w-0 flex-1"><h2 className="text-sm font-bold">{j.title}</h2><p className="mt-0.5 text-xs text-slate-600">{j.text}</p><span className="mt-2 flex gap-2"><button type="button" className={btn} onClick={j.go}>{j.action}</button>{j.title.startsWith('Add a ' + pack.stateLabel.toLowerCase()) && <button type="button" className={btn} onClick={() => open('entity')}>Add an entity type</button>}</span></div></div>))}
      </div>
      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
        <h2 className="flex items-center gap-2 text-sm font-bold text-amber-900"><ShieldAlert className="h-4 w-4" />The government moved a deadline</h2>
        <p className="mt-0.5 text-xs text-amber-900">Choose the compliance, then in step 3 press &quot;Record a moved deadline&quot;: the usual date and the new one. Only that period changes, and everyone tracking it gets the new date. If the rule itself changed for good (for example from 6 months to 5), change the rule in step 3 instead.</p>
        <span className="mt-2 flex flex-wrap items-center gap-2"><select aria-label="Compliance whose deadline moved" className={`${inp} max-w-xl flex-1`} value={pick} onChange={(e) => setPick(e.target.value)}><option value="">Choose the compliance…</option>{comps.filter((c) => c.active).map((c) => <option key={c.id} value={c.id}>{c.data.form ? `${c.data.form}: ` : ''}{c.data.name}</option>)}</select>
          <button type="button" className={btn} disabled={!pick} onClick={() => { const it = comps.find((c) => c.id === pick); if (it) open('compliance', it); }}>Open it</button></span>
      </section>
      <section className="rounded-2xl border border-slate-200 bg-white p-4">
        <h2 className="text-sm font-bold">How a compliance reaches a visitor</h2>
        <ol className="mt-2 grid gap-2 text-xs text-slate-700 md:grid-cols-5">{[
          ['1', 'Pick-lists', `The visitor picks ${pack.name}, a ${pack.stateLabel.toLowerCase()}, an entity type and departments.`],
          ['2', 'Questions', 'They are asked only the questions whose "asked when" fits those picks and their earlier answers.'],
          ['3', 'Who it applies to', 'Each compliance is tested against the picks and the answers. "Not sure" keeps it, marked "may apply".'],
          ['4', 'Due date', 'The date is worked out from the rule, the year end or a date they gave, the weekend rule and any moved deadline.'],
          ['5', 'Their account', 'Three are shown free; after sign-up all are saved in "My compliances" and kept up to date when you change a rule here.'],
        ].map(([n, t, x]) => <li key={n} className="rounded-xl border border-slate-200 bg-slate-50 p-3"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-[11px] font-bold text-white">{n}</span><b className="mt-1 block text-slate-900">{t}</b>{x}</li>)}</ol>
        <p className="mt-3 text-xs text-slate-600">Check your work on <Link className="font-semibold text-indigo-700 underline" href={`${BASE}/rules`}>Service Rules</Link>: it runs the same rules on any combination you choose. {tidy.length > 0 && <>There are {tidy.length} tidy-ups waiting in {pack.name} (see the Overview and the Penalties screen).</>}</p>
      </section>
    </div>
  );
}
