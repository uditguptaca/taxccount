'use client';
// Service Master: where the compliance checker's rules are kept, shown and changed. One component,
// one screen per menu item. Everything on the homepage checker (the four pick-lists, the questions,
// the compliances, their dates and penalties) is read from what is shown here.
import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, ArrowRight, CheckCircle2, History, Pencil, Plus, Undo2 } from 'lucide-react';
import Scope from '@/components/t1/Scope';
import type { CatalogItem, Kind as ItemKind } from '@/lib/compliance/catalog';
import type { CountryPack } from '@/lib/compliance/types';
import { adviceOf } from '@/lib/compliance/health';
import { condRefs, KIND_LABEL } from '@/lib/compliance/describe';
import { entityTypesFor, evalCond, makeCtx, visibleQuestions } from '@/lib/compliance/engine';
import ItemEditor, { KIND_NAME } from './Editors';
import { Badge, Field, Modal, btn, btnPrimary, btnSm, inp, td, th } from './ui';
import { useCatalog, type Catalog } from './useCatalog';
import { AddBtn, Card, EditBtn, Status, type ViewProps } from './parts';
import { HeadsView, InfoView, PenaltiesView, QuestionsView, RulesView, SourcesView, SubCompliancesView, WizardView } from './Views';

export type View = 'overview' | 'wizard' | 'countries' | 'entity-types' | 'departments' | 'compliance-heads' | 'sub-compliances' | 'rules' | 'questions' | 'info-forms' | 'penalties' | 'sources';
const BASE = '/platform/service-master';
const TODAY = () => new Date().toISOString().slice(0, 10);

const META: Record<View, { title: string; what: string }> = {
  overview: { title: 'Service Master', what: 'Everything the free compliance checker on the homepage asks and answers is kept here. Change it here and the homepage, and every person tracking their compliances, follows.' },
  wizard: { title: 'Wizard Builder', what: 'Guided steps for the things you will do most: add a compliance, add a question, record a deadline the government moved.' },
  countries: { title: 'Countries & States', what: 'The first two pick-lists on the homepage. A state can carry tags (for example "hst") so one rule can cover a group of states.' },
  'entity-types': { title: 'Entity Types', what: 'The third pick-list on the homepage. The entity type decides which questions a person is asked and which compliances can apply.' },
  departments: { title: 'Departments', what: 'The fourth pick-list on the homepage. A person only gets the compliances of the departments they tick.' },
  'compliance-heads': { title: 'Compliance Heads', what: 'The headings compliances are grouped under, inside each department.' },
  'sub-compliances': { title: 'Sub-Compliances', what: 'Each filing or payment a person may have to make: who it applies to, when it is due, what happens if it is missed, and the official page it comes from.' },
  rules: { title: 'Service Rules', what: 'How answers lead to compliances. Try any combination below and see exactly what a visitor would get, and why.' },
  questions: { title: 'Questions', what: 'The questions asked on the homepage, in the order they are asked. Each one shows what it is linked to.' },
  'info-forms': { title: 'Info Forms', what: 'The dates a person is asked for, and the compliances whose due dates are counted from each.' },
  penalties: { title: 'Penalties', what: 'What happens if a compliance is missed. Shown to the person with each compliance so they take the date seriously.' },
  sources: { title: 'Official Sources', what: 'The government pages each rule was read from, with the date it was last read.' },
};

export default function ServiceMaster({ view }: { view: View }) {
  const cat = useCatalog();
  const [edit, setEdit] = useState<{ kind: ItemKind; item: CatalogItem | null; preset?: any; presetId?: string } | null>(null);
  const [adding, setAdding] = useState(false);
  const open: ViewProps['open'] = (kind, item = null, preset, presetId) => setEdit({ kind, item, preset, presetId });
  const m = META[view];
  const pack = cat.pack;
  return (
    <Scope>
      <div className="mx-auto max-w-[1400px] text-slate-900">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div className="max-w-3xl"><h1 className="text-2xl font-extrabold tracking-tight">{m.title}</h1><p className="mt-1 text-sm text-slate-600">{m.what}</p></div>
          <a href="/" target="_blank" rel="noreferrer" className={btn}>See the checker on the homepage<ArrowRight className="h-4 w-4" /></a>
        </div>
        {cat.error && <p role="alert" className="mb-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">{cat.error}</p>}
        {view !== 'overview' && (
          <div className="mb-4 flex flex-wrap items-center gap-2" role="tablist" aria-label="Country">
            {cat.countries.map((c) => (
              <button key={c.code} type="button" role="tab" aria-selected={c.code === cat.country} onClick={() => cat.setCountry(c.code)}
                className={`rounded-xl border px-3.5 py-2 text-left text-sm font-bold ${c.code === cat.country ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300 bg-white text-slate-800 hover:border-indigo-400'}`}>
                {c.name}<span className={`ml-2 text-xs font-semibold ${c.code === cat.country ? 'text-indigo-100' : 'text-slate-500'}`}>{c.active ? `${c.compliances} compliances` : 'switched off'}</span>
              </button>))}
            <button type="button" className={btn} onClick={() => setAdding(true)}><Plus className="h-4 w-4" />Add a country</button>
          </div>)}
        {view !== 'overview' && cat.problems.length > 0 && (
          <div role="alert" className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-900">
            <p className="flex items-center gap-2 font-bold"><AlertTriangle className="h-4 w-4" />{cat.figures?.active ? 'This country has problems to fix' : 'This country is switched off. Before it can go on the homepage:'}</p>
            <ul className="mt-1 list-disc pl-6 text-xs">{cat.problems.slice(0, 8).map((p, i) => <li key={i}>{p}</li>)}{cat.problems.length > 8 && <li>and {cat.problems.length - 8} more</li>}</ul>
          </div>)}
        {cat.loading && !pack ? <p className="py-16 text-center text-sm text-slate-500">Loading…</p>
          : view === 'overview' ? <Overview cat={cat} onAdd={() => setAdding(true)} open={open} />
          : !pack ? <p className="py-16 text-center text-sm text-slate-500">No country yet. Add one to start.</p>
          : view === 'wizard' ? <WizardView cat={cat} pack={pack} open={open} />
          : view === 'countries' ? <CountriesView cat={cat} pack={pack} open={open} />
          : view === 'entity-types' ? <EntityView cat={cat} pack={pack} open={open} />
          : view === 'departments' ? <DepartmentsView cat={cat} pack={pack} open={open} />
          : view === 'compliance-heads' ? <HeadsView cat={cat} pack={pack} open={open} />
          : view === 'sub-compliances' ? <SubCompliancesView cat={cat} pack={pack} open={open} />
          : view === 'rules' ? <RulesView cat={cat} pack={pack} open={open} />
          : view === 'questions' ? <QuestionsView cat={cat} pack={pack} open={open} />
          : view === 'info-forms' ? <InfoView cat={cat} pack={pack} open={open} />
          : view === 'penalties' ? <PenaltiesView cat={cat} pack={pack} open={open} />
          : <SourcesView cat={cat} pack={pack} open={open} />}
      </div>
      {edit && <ItemEditor key={`${edit.kind}-${edit.item?.id ?? 'new'}`} cat={cat} kind={edit.kind} item={edit.item} preset={edit.preset} presetId={edit.presetId} onClose={() => setEdit(null)} />}
      {adding && <AddCountry cat={cat} onClose={() => setAdding(false)} />}
    </Scope>
  );
}

function AddCountry({ cat, onClose }: { cat: Catalog; onClose: () => void }) {
  const [f, setF] = useState({ code: '', name: '', currency: '', stateLabel: 'State' });
  const [err, setErr] = useState(''); const [busy, setBusy] = useState(false);
  const go = async () => { setBusy(true); const out = await cat.addCountry(f.code, f.name, f.currency, f.stateLabel); setBusy(false); if (out.ok) { await cat.setCountry(f.code.toUpperCase()); onClose(); } else setErr(out.error); };
  return (
    <Modal title="Add a country" sub="It starts switched off. Add its states, entity types, departments, questions and compliances, then switch it on." onClose={onClose}
      footer={<><span className="text-xs font-semibold text-rose-700">{err}</span><span className="flex gap-2"><button type="button" className={btn} onClick={onClose}>Cancel</button><button type="button" className={btnPrimary} disabled={busy || !/^[A-Za-z]{2}$/.test(f.code) || !f.name.trim()} onClick={go}>Add country</button></span></>}>
      <div className="grid gap-3 md:grid-cols-2">
        <Field label="Two-letter code" hint="for example GB, AU, SG"><input className={inp} maxLength={2} value={f.code} onChange={(e) => setF({ ...f, code: e.target.value.toUpperCase() })} /></Field>
        <Field label="Name"><input className={inp} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></Field>
        <Field label="Currency" hint="three letters"><input className={inp} maxLength={3} value={f.currency} onChange={(e) => setF({ ...f, currency: e.target.value.toUpperCase() })} /></Field>
        <Field label="What are its regions called?"><input className={inp} value={f.stateLabel} onChange={(e) => setF({ ...f, stateLabel: e.target.value })} /></Field>
      </div>
    </Modal>
  );
}

// ── Overview ──
const nameOf = (json: string | null) => { try { const d = JSON.parse(json || 'null'); const v = d?.data ?? d; return v?.name ?? v?.title ?? v?.text ?? ''; } catch { return ''; } };
function Overview({ cat, onAdd, open }: { cat: Catalog; onAdd: () => void; open: ViewProps['open'] }) {
  const live = cat.countries.filter((c) => c.active);
  const sum = (k: keyof (typeof live)[number]) => live.reduce((a, c) => a + (Number(c[k]) || 0), 0);
  const [busy, setBusy] = useState(''); const [msg, setMsg] = useState('');
  const advice = useMemo(() => (cat.pack ? adviceOf(cat.pack, TODAY()) : []), [cat.pack]);
  const look = advice.filter((a) => a.level === 'look');
  const chain: { n: number; label: string; sub: string; href: string }[] = [
    { n: sum('states'), label: 'States and provinces', sub: `in ${live.length} countries`, href: 'countries' },
    { n: sum('entityTypes'), label: 'Entity types', sub: 'who the person is', href: 'entity-types' },
    { n: sum('departments'), label: 'Departments', sub: 'what they want checked', href: 'departments' },
    { n: sum('questions'), label: 'Questions', sub: `${sum('infoQuestions')} ask for a date`, href: 'questions' },
    { n: sum('compliances'), label: 'Sub-compliances', sub: `under ${sum('heads')} heads`, href: 'sub-compliances' },
    { n: sum('penalties'), label: 'Penalties', sub: 'shown with the compliance', href: 'penalties' },
  ];
  const undo = async (id: string) => { setBusy(id); setMsg(''); const out = await cat.undo(id); setBusy(''); setMsg(out.ok ? 'Undone.' : `${out.error}${out.problems.length ? ': ' + out.problems[0] : ''}`); };
  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-4">
        <h2 className="text-sm font-bold text-slate-900">How it is linked</h2>
        <p className="text-xs text-slate-500">A visitor goes left to right. Each box is a screen in the menu; the number is how many are live right now.</p>
        <div className="mt-3 flex flex-wrap items-stretch gap-2">
          {chain.map((c, i) => (
            <React.Fragment key={c.label}>
              <Link href={`${BASE}/${c.href}`} className="min-w-[150px] flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 hover:border-indigo-400 hover:bg-indigo-50">
                <span className="block text-2xl font-extrabold text-indigo-700" data-figure={c.href}>{c.n.toLocaleString()}</span>
                <span className="block text-sm font-bold text-slate-900">{c.label}</span><span className="block text-[11px] text-slate-500">{c.sub}</span>
              </Link>
              {i < chain.length - 1 && <span className="hidden items-center text-slate-300 lg:flex"><ArrowRight className="h-5 w-5" /></span>}
            </React.Fragment>))}
        </div>
        <p className="mt-3 rounded-lg bg-indigo-50 px-3 py-2 text-xs text-indigo-900"><b>In use:</b> {cat.use.profiles.toLocaleString()} saved {cat.use.profiles === 1 ? 'check' : 'checks'} with {cat.use.items.toLocaleString()} compliances being tracked in people&apos;s accounts. When you change a rule here their list is brought up to date by itself. A date a person set by hand, and anything they already marked as filed, is never touched.</p>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3"><h2 className="text-sm font-bold">By country</h2><button type="button" className={btnSm} onClick={onAdd}><Plus className="h-3 w-3" />Add a country</button></div>
        <div className="overflow-x-auto"><table className="w-full min-w-[980px] border-t border-slate-200">
          <thead className="bg-slate-50"><tr>{['Country', 'States', 'Entity types', 'Departments', 'Heads', 'Sub-compliances', 'Checked on the official page', 'Questions', 'Date questions', 'Penalties', 'Sources', 'Changed by you', ''].map((h) => <th key={h} className={th}>{h}</th>)}</tr></thead>
          <tbody>{cat.countries.map((c) => (
            <tr key={c.code} className={`border-t border-slate-100 ${c.code === cat.country ? 'bg-indigo-50/50' : ''}`} data-country={c.code}>
              <td className={td}><b>{c.name}</b> {c.active ? <Badge tone="green">live</Badge> : <Badge tone="amber">switched off</Badge>}{c.problems > 0 && <Badge tone="rose">{c.problems} to fix</Badge>}</td>
              <td className={td}>{c.states}</td><td className={td}>{c.entityTypes}</td><td className={td}>{c.departments}</td><td className={td}>{c.heads}</td>
              <td className={td}><b>{c.compliances}</b></td><td className={td}>{c.verified} <span className="text-xs text-slate-500">of {c.compliances}</span></td>
              <td className={td}>{c.questions}</td><td className={td}>{c.infoQuestions}</td><td className={td}>{c.penalties}</td><td className={td}>{c.sources}</td>
              <td className={td}>{c.edited || '–'}{c.off > 0 && <span className="ml-1 text-xs text-slate-500">({c.off} off)</span>}</td>
              <td className={td}><span className="flex gap-1"><button type="button" className={btnSm} onClick={() => cat.setCountry(c.code)}>{c.code === cat.country ? 'Selected' : 'Select'}</button></span></td>
            </tr>))}</tbody>
        </table></div>
        <p className="border-t border-slate-100 px-4 py-2 text-[11px] text-slate-500">&quot;Checked on the official page&quot; means the due date and who it applies to were read on the government&apos;s own page. The others are shown to the person with a note to confirm them.</p>
      </section>

      {cat.pack && (
        <section className="rounded-2xl border border-slate-200 bg-white p-4">
          <h2 className="flex items-center gap-2 text-sm font-bold">{look.length === 0 ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <AlertTriangle className="h-4 w-4 text-amber-600" />}Worth a look in {cat.pack.name}</h2>
          <p className="text-xs text-slate-500">Nothing here is broken. These are the things that go stale: sources not re-read for a year, one-off dates that have passed, questions that lead nowhere.</p>
          {look.length === 0 ? <p className="mt-2 text-sm text-emerald-800">Nothing needs attention.</p> : (
            <ul className="mt-2 divide-y divide-slate-100">{look.slice(0, 12).map((a, i) => { const it = cat.items.find((x) => x.kind === a.kind && x.id === a.id); return (
              <li key={i} className="flex flex-wrap items-center justify-between gap-2 py-1.5 text-sm"><span><Badge>{KIND_NAME[a.kind as ItemKind]}</Badge> <b>{a.name.slice(0, 90)}</b> <span className="text-slate-600">{a.text}</span></span>{it && <button type="button" className={btnSm} onClick={() => open(a.kind as ItemKind, it)}><Pencil className="h-3 w-3" />Open</button>}</li>); })}
              {look.length > 12 && <li className="py-1.5 text-xs text-slate-500">and {look.length - 12} more</li>}</ul>)}
          <p className="mt-2 text-xs text-slate-500">{advice.length - look.length} small tidy-ups (for example a compliance with no penalty recorded) are listed on their own screens.</p>
        </section>)}

      <section className="rounded-2xl border border-slate-200 bg-white p-4">
        <h2 className="flex items-center gap-2 text-sm font-bold"><History className="h-4 w-4" />Latest changes</h2>
        <p className="text-xs text-slate-500">Every change is kept with who made it. Undo puts the item back exactly as it was before that change.</p>
        {msg && <p className="mt-2 text-xs font-semibold text-indigo-800" role="status">{msg}</p>}
        {cat.changes.length === 0 ? <p className="mt-2 text-sm text-slate-600">No changes yet. The rules are as they were built in.</p> : (
          <ul className="mt-2 divide-y divide-slate-100">{cat.changes.map((h) => (
            <li key={h.id} className="flex flex-wrap items-center justify-between gap-2 py-1.5 text-sm">
              <span><Badge tone="indigo">{h.country}</Badge> <b>{h.action}</b> {KIND_NAME[h.kind as ItemKind] ?? h.kind}: {(nameOf(h.after_json) || nameOf(h.before_json) || h.item_id).slice(0, 80)} <span className="text-xs text-slate-500">· {h.user_name} · {String(h.created_at).slice(0, 16).replace('T', ' ')}</span></span>
              <button type="button" className={btnSm} disabled={busy === h.id} onClick={() => undo(h.id)}><Undo2 className="h-3 w-3" />Undo</button>
            </li>))}</ul>)}
      </section>
    </div>
  );
}

// ── Countries & States ──
function CountriesView({ cat, pack, open }: ViewProps) {
  const country = cat.of('country')[0];
  const states = cat.of('state');
  const refs = useMemo(() => pack.compliances.map((c) => condRefs(c.applies)), [pack]);
  const own = (code: string, tags: string[] = []) => refs.filter((r) => r.states.has(code) || tags.some((t) => r.stags.has(t))).length;
  const national = refs.filter((r) => r.states.size === 0 && r.stags.size === 0).length;
  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return (
    <div className="space-y-5">
      <Card title={`${pack.name}: settings`} right={country && <EditBtn onClick={() => open('country', country)} label="Change settings" />}>
        <dl className="grid gap-x-6 gap-y-2 border-t border-slate-100 px-4 py-3 text-sm md:grid-cols-2">
          <div><dt className="text-xs font-semibold text-slate-500">On the homepage</dt><dd>{cat.figures?.active ? 'Yes, visitors can choose it' : 'No, it is switched off'}</dd></div>
          <div><dt className="text-xs font-semibold text-slate-500">Currency</dt><dd>{pack.currency || '–'}</dd></div>
          <div><dt className="text-xs font-semibold text-slate-500">Financial year</dt><dd>{pack.fixedYearEnd ? `The same for everyone: ends ${pack.fixedYearEnd[1]} ${MONTHS[pack.fixedYearEnd[0] - 1]}` : `Each business gives its own year end. Always the calendar year for: ${pack.calendarYearKinds.map((k) => KIND_LABEL[k].toLowerCase()).join(', ') || 'nobody'}`}</dd></div>
          <div><dt className="text-xs font-semibold text-slate-500">Weekends</dt><dd>{pack.rollWeekend ? 'A due date on a Saturday or Sunday moves to Monday' : 'Dates are shown exactly as the rule gives them'}</dd></div>
          {pack.weekendNote && <div className="md:col-span-2"><dt className="text-xs font-semibold text-slate-500">Note shown under the results</dt><dd className="text-slate-700">{pack.weekendNote}</dd></div>}
        </dl>
      </Card>
      <Card title={`${pack.stateLabel} list (${states.filter((s) => s.active).length})`} sub={`${national} compliances apply across the whole country; the number beside each ${pack.stateLabel.toLowerCase()} is what it has on top of those.`} right={<AddBtn onClick={() => open('state')}>Add</AddBtn>}>
        <div className="overflow-x-auto"><table className="w-full border-t border-slate-200"><thead className="bg-slate-50"><tr>{['Code', 'Name', 'Tags', 'Entity types offered', 'Its own compliances', '', ''].map((h, i) => <th key={i} className={th}>{h}</th>)}</tr></thead>
          <tbody>{states.map((s) => (
            <tr key={s.id} className="border-t border-slate-100" data-item={s.id}><td className={`${td} font-mono text-xs`}>{s.id}</td><td className={td}><b>{s.data.name}</b></td>
              <td className={td}><span className="flex flex-wrap gap-1">{(s.data.tags ?? []).map((t: string) => <Badge key={t}>{t}</Badge>)}</span></td>
              <td className={td}>{entityTypesFor(pack, s.id).length}</td><td className={td}>{own(s.id, s.data.tags)}</td><td className={td}><Status it={s} /></td><td className={td}><EditBtn onClick={() => open('state', s)} /></td></tr>))}</tbody></table></div>
      </Card>
    </div>
  );
}

// ── Entity types ──
function EntityView({ cat, pack, open }: ViewProps) {
  const rows = cat.of('entity');
  const figures = useMemo(() => new Map(pack.entityTypes.map((e) => {
    const st = entityTypesFor(pack, pack.states[0]?.code ?? '').some((x) => x.id === e.id) ? pack.states[0] : pack.states.find((s) => entityTypesFor(pack, s.code).some((x) => x.id === e.id));
    const sel = { country: pack.code, state: st?.code ?? '', entity: e.id, depts: pack.departments.map((d) => d.id) };
    const x = makeCtx(pack, sel, {}, true);
    return [e.id, { questions: visibleQuestions(pack, sel, {}).length, can: x ? pack.compliances.filter((c) => evalCond(c.applies, x)).length : 0, state: st?.name ?? '' }];
  })), [pack]);
  return (
    <Card title={`Entity types (${rows.filter((r) => r.active).length})`} sub="The two figures are the most a person of this type can be asked, and the most that can apply to them." right={<AddBtn onClick={() => open('entity')}>Add an entity type</AddBtn>}>
      <div className="overflow-x-auto"><table className="w-full border-t border-slate-200"><thead className="bg-slate-50"><tr>{['Name', 'Kind of taxpayer', 'Offered in', 'Questions asked (up to)', 'Compliances that can apply', '', ''].map((h, i) => <th key={i} className={th}>{h}</th>)}</tr></thead>
        <tbody>{rows.map((e) => { const f = figures.get(e.id); return (
          <tr key={e.id} className="border-t border-slate-100" data-item={e.id}><td className={td}><b>{e.data.name}</b><span className="block text-xs text-slate-500">{e.data.desc}</span></td><td className={td}>{KIND_LABEL[e.data.kind as keyof typeof KIND_LABEL] ?? e.data.kind}</td>
            <td className={td}>{e.data.onlyStates?.length ? `Only ${e.data.onlyStates.join(', ')}` : e.data.notStates?.length ? `Everywhere except ${e.data.notStates.join(', ')}` : 'Everywhere'}</td>
            <td className={td}>{f?.questions ?? '–'}</td><td className={td}>{f?.can ?? '–'}{f?.state && pack.states.length > 1 ? <span className="text-xs text-slate-500"> in {f.state}</span> : null}</td><td className={td}><Status it={e} /></td><td className={td}><EditBtn onClick={() => open('entity', e)} /></td></tr>); })}</tbody></table></div>
    </Card>
  );
}

// ── Departments ──
function DepartmentsView({ cat, pack, open }: ViewProps) {
  const rows = cat.of('department');
  return (
    <Card title={`Departments (${rows.filter((r) => r.active).length})`} right={<AddBtn onClick={() => open('department')}>Add a department</AddBtn>}>
      <div className="overflow-x-auto"><table className="w-full border-t border-slate-200"><thead className="bg-slate-50"><tr>{['Name', 'Shown to the visitor as', 'Compliance heads', 'Sub-compliances', '', ''].map((h, i) => <th key={i} className={th}>{h}</th>)}</tr></thead>
        <tbody>{rows.map((d) => { const mine = pack.compliances.filter((c) => c.dept === d.id); const heads = Array.from(new Set(mine.map((c) => c.head))); return (
          <tr key={d.id} className="border-t border-slate-100" data-item={d.id}><td className={td}><b>{d.data.name}</b></td><td className={`${td} max-w-md text-slate-600`}>{d.data.desc}</td>
            <td className={td}><span className="flex max-w-md flex-wrap gap-1">{heads.map((h) => <Badge key={h}>{h}</Badge>)}</span></td><td className={td}><Link className="font-bold text-indigo-700 underline" href={`${BASE}/sub-compliances?dept=${d.id}`}>{mine.length}</Link></td>
            <td className={td}><Status it={d} /></td><td className={td}><EditBtn onClick={() => open('department', d)} /></td></tr>); })}</tbody></table></div>
    </Card>
  );
}
