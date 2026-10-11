'use client';
// What an administrator sees when previewing the "T1 Personal Income Tax Return" template: the REAL form,
// with every rule, branch and language, in a sandbox where nothing is saved, plus a readable map of what the
// form contains and where every item of the official forms is covered.
import React, { useMemo, useState } from 'react';
import { X, Search } from 'lucide-react';
import { CATALOGUE as cat } from '@/lib/t1/catalogue/index';
import { describeCond } from '@/lib/t1/describe';
import { RULES, SUPPORTED_YEARS, VERIFIED_YEARS, formatRule, unverifiedRules } from '@/lib/t1/config/years';
import { SOURCES } from '@/lib/t1/sources';
import { PROVINCES, ak } from '@/lib/t1/types';
import type { AnswerMap, Lang, Province } from '@/lib/t1/types';
import { RunnerView } from './Runner';
import { useSandboxIntake } from './useSandbox';
import Scope from './Scope';

const NAMES: Record<string, string> = { AB: 'Alberta', BC: 'British Columbia', MB: 'Manitoba', NB: 'New Brunswick', NL: 'Newfoundland and Labrador', NT: 'Northwest Territories', NS: 'Nova Scotia', NU: 'Nunavut', ON: 'Ontario', PE: 'Prince Edward Island', QC: 'Québec', SK: 'Saskatchewan', YT: 'Yukon' };
const a = (q: string, v: any, rec = 0): [string, { v: any }] => [ak(q, rec), { v }];
const yesAll = (): AnswerMap => { const m: AnswerMap = {}; for (const mod of cat.modules) if (mod.code === 'F') for (const s of mod.sections) for (const q of s.qs) if (q.type === 'yn') m[ak(q.id)] = { v: 'yes' }; return m; };
const SCENARIOS: { id: string; label: string; answers: () => AnswerMap; province?: Province }[] = [
  { id: 'empty', label: 'A blank start (what a new client sees)', answers: () => ({}) },
  { id: 'employee', label: 'Employee with one T4', answers: () => Object.fromEntries([a('F.inc.employment', 'yes'), a('G.t4.issuer', 'Acme Ltd'), a('G.t4.year', '2025')]) },
  { id: 'landlord', label: 'Landlord with a short-term rental', answers: () => Object.fromEntries([a('F.inc.rental', 'yes'), a('F.inc.shortTerm', 'yes'), a('M.prop.address', '12 Elm St')]) },
  { id: 'newcomer', label: 'Newcomer who arrived this year', answers: () => Object.fromEntries([a('C.life.arrived', 'yes'), a('C.newcomer.arrival', '2025-08-15')]) },
  { id: 'qc', label: 'Québec resident with foreign property', province: 'QC', answers: () => Object.fromEntries([a('F.inc.foreign', 'yes'), a('R.prop.cat', 'real'), a('R.prop.maxCost', '150000')]) },
  { id: 'family', label: 'Separated parent with childcare and support', answers: () => Object.fromEntries([a('D.status.marital', 'separated'), a('E.any.has', 'yes'), a('F.ded.childcare', 'yes'), a('F.ded.supportPaid', 'yes')]) },
  { id: 'all', label: 'Every screening question answered “Yes” (largest form)', answers: yesAll },
];

function Try() {
  const [year, setYear] = useState(2025);
  const [province, setProvince] = useState<Province | ''>('ON');
  const [scenario, setScenario] = useState('empty');
  const sc = SCENARIOS.find((s) => s.id === scenario)!;
  const prov = (sc.province ?? province) as Province | '';
  const seed = useMemo(() => sc.answers(), [scenario]); // eslint-disable-line react-hooks/exhaustive-deps
  const it = useSandboxIntake(year, prov, seed, `${scenario}|${year}|${prov}`);
  const sel = 'bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-xs text-slate-900';
  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-wrap items-end gap-3 px-4 py-3 border-b border-slate-200 bg-white">
        <label className="text-[11px] text-slate-600 flex flex-col gap-1">Tax year<select aria-label="Tax year" className={sel} value={year} onChange={(e) => setYear(Number(e.target.value))}>{SUPPORTED_YEARS.map((y) => <option key={y} value={y}>{y}{VERIFIED_YEARS.includes(y) ? '' : ' (rules to confirm)'}</option>)}</select></label>
        <label className="text-[11px] text-slate-600 flex flex-col gap-1">Province or territory<select aria-label="Province" className={sel} value={prov} onChange={(e) => setProvince(e.target.value as Province)}><option value="">Not chosen</option>{PROVINCES.map((p) => <option key={p} value={p}>{p} · {NAMES[p]}</option>)}</select></label>
        <label className="text-[11px] text-slate-600 flex flex-col gap-1">Start from<select aria-label="Scenario" className={sel} value={scenario} onChange={(e) => setScenario(e.target.value)}>{SCENARIOS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}</select></label>
        <p className="text-[11px] text-slate-600 max-w-md">This is the real form, running the real rules. Answer anything to see sections appear and disappear. Nothing is saved.</p>
      </div>
      <div className="flex-1 overflow-y-auto"><RunnerView it={it} sandbox /></div>
    </div>
  );
}

function Contents() {
  const [lang, setLang] = useState<Lang>('en');
  const [q, setQ] = useState('');
  const [open, setOpen] = useState<string>('A');
  const all = Array.from(cat.q.values()).filter((x) => x.type !== 'info');
  const stats = { modules: cat.modules.length, sections: cat.sec.size, questions: all.length, conditional: all.filter((x) => x.show || cat.sec.get(x.sec)!.show || cat.mod.get(x.mod)!.show).length, repeating: Array.from(cat.sec.values()).filter((s) => s.repeat).length, docs: all.reduce((n, x) => n + (x.docs?.length ?? 0) + (x.type === 'file' && !x.docs ? 1 : 0), 0), mapped: all.filter((x) => x.map).length, why: all.filter((x) => x.why).length };
  const i = lang === 'fr' ? 1 : 0;
  const hits = q.trim() ? all.filter((x) => `${x.id} ${x.text[0]} ${x.text[1]}`.toLowerCase().includes(q.toLowerCase())).slice(0, 60) : [];
  return (
    <div className="p-4 md:p-6 space-y-5 overflow-y-auto h-full">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {([['Parts of the form', stats.modules], ['Sections', stats.sections], ['Questions', stats.questions], ['Appear only when they apply', stats.conditional], ['Repeating sections (several T4s, properties…)', stats.repeating], ['Documents it asks for', stats.docs], ['Tied to a form box or line', stats.mapped], ['With a “why we ask”', stats.why]] as [string, number][]).map(([l, n]) => <div key={l} className="rounded-xl border border-slate-200 bg-white p-3"><p className="text-xl font-bold text-slate-900">{n.toLocaleString()}</p><p className="text-[11px] text-slate-600">{l}</p></div>)}
      </div>
      <p className="text-xs text-slate-600">Form version <b className="text-slate-800">{cat.version}</b>. English and French text for every question. Every answer can be “I’m not sure”, “I’ll provide this later” or “Ask my preparer”. A blank answer is never treated as “No” or as zero.</p>
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative"><Search className="w-4 h-4 absolute left-2.5 top-2 text-slate-500" /><input aria-label="Search the questions" placeholder="Search questions…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-8 pr-3 py-1.5 rounded-lg bg-white border border-slate-300 text-sm w-72" /></div>
        <button className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold" onClick={() => setLang(lang === 'en' ? 'fr' : 'en')}>{lang === 'en' ? 'Show French' : 'Show English'}</button>
      </div>
      {q.trim() && <ul className="rounded-xl border border-slate-200 divide-y divide-slate-200 bg-white">{hits.map((x) => <li key={x.id} className="p-3 text-sm"><span className="text-slate-900">{x.text[i]}</span><span className="block text-[11px] text-slate-500">{x.id}{x.show ? ` · shown when ${describeCond(x.show, cat, lang)}` : ''}</span></li>)}{hits.length === 0 && <li className="p-3 text-sm text-slate-600">No match.</li>}</ul>}
      <div className="space-y-2">
        {cat.modules.map((m) => (
          <div key={m.code} className="rounded-xl border border-slate-200 bg-white">
            <button className="w-full text-left px-4 py-3 flex items-center justify-between gap-3" aria-expanded={open === m.code} onClick={() => setOpen(open === m.code ? '' : m.code)}>
              <span><b className="text-indigo-700">{m.code}</b> <span className="text-slate-900 font-semibold">{m.title[i]}</span><span className="block text-[11px] text-slate-500">{m.always ? 'always shown' : `shown when ${describeCond(m.show, cat, lang)}`} · {m.sections.length} sections · {m.sections.reduce((n, s) => n + s.qs.filter((x) => x.type !== 'info').length, 0)} questions</span></span>
              <span className="text-slate-500 text-xs">{open === m.code ? '−' : '+'}</span>
            </button>
            {open === m.code && (
              <div className="px-4 pb-4 space-y-4">
                <p className="text-xs text-slate-600">{m.desc[i]}</p>
                {m.sections.map((s) => (
                  <div key={s.id}>
                    <h4 className="text-sm font-semibold text-slate-900">{s.title[i]}{s.repeat ? <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-300">repeats: {s.repeat.label[0]}</span> : null}</h4>
                    {s.show && <p className="text-[11px] text-slate-500">section shown when {describeCond(s.show, cat, lang)}</p>}
                    <ul className="mt-1 divide-y divide-slate-200">
                      {s.qs.filter((x) => x.type !== 'info').map((x) => (
                        <li key={x.id} className="py-1.5 text-xs">
                          <span className="text-slate-800">{x.text[i]}</span>
                          <span className="ml-2 text-slate-500">{x.type}{x.req ? ' · required' : ''}{x.map ? ` · ${x.map.form}${x.map.box ? ` box ${x.map.box}` : ''}${x.map.verified ? '' : ' (unverified)'}` : ''}{x.docs?.length || x.type === 'file' ? ' · document' : ''}</span>
                          {x.show && <span className="block text-[11px] text-slate-500">when {describeCond(x.show, cat, lang)}</span>}
                          {x.review?.length ? <span className="block text-[11px] text-amber-700">review rule: {x.review.map((r) => r.title[i]).join(' · ')}</span> : null}
                        </li>))}
                    </ul>
                  </div>))}
              </div>)}
          </div>))}
      </div>
    </div>
  );
}

function Coverage() {
  const kinds: Record<string, string> = { client: 'Asked of the client', derived: 'Worked out from answers', documents: 'Taken from documents', preparer: 'Done by the preparer', specialist: 'Referred to a specialist', na: 'Not applicable' };
  return (
    <div className="p-4 md:p-6 space-y-5 overflow-y-auto h-full">
      <p className="text-sm text-slate-700 max-w-3xl">For every part of the official forms this questionnaire says how it is covered, so nothing is left to chance. “Not applicable” always carries the reason.</p>
      {cat.modules.map((m) => (
        <section key={m.code} className="rounded-xl border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-bold text-slate-900 mb-2">{m.code}. {m.title[0]}</h3>
          <table className="w-full text-xs"><tbody className="divide-y divide-slate-200">
            {m.cover.map((r, k) => <tr key={k} className="align-top"><td className="py-1.5 pr-3 text-slate-800">{r.item}</td><td className="pr-3 text-slate-500 whitespace-nowrap">{r.ref}</td><td className="text-slate-700 whitespace-nowrap pr-3">{kinds[r.kind]}</td><td className="text-slate-500">{r.reason || r.note || ''}</td></tr>)}
          </tbody></table>
        </section>))}
    </div>
  );
}

function Rules() {
  const [year, setYear] = useState(2025);
  const list = RULES.filter((r) => r.year === year);
  const un = unverifiedRules(year);
  return (
    <div className="p-4 md:p-6 space-y-5 overflow-y-auto h-full max-w-5xl">
      <label className="text-xs text-slate-600">Tax year <select aria-label="Rules for year" value={year} onChange={(e) => setYear(Number(e.target.value))} className="ml-2 bg-white border border-slate-300 rounded-lg px-2 py-1 text-slate-900">{SUPPORTED_YEARS.map((y) => <option key={y} value={y}>{y}</option>)}</select></label>
      <p className="text-sm text-slate-700">A figure is only used when it has been checked against the official page for <b>exactly that tax year</b>. Anything else creates a review item for the preparer instead of a guess. Nothing carries over from one year to the next on its own.</p>
      {un.length > 0 && <div className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs text-amber-800 space-y-1">{un.map((u, k) => <p key={k}><b>{u.label[0]}.</b> {u.reason[0]}</p>)}</div>}
      <table className="w-full text-xs rounded-xl border border-slate-200 bg-white"><thead><tr className="text-left text-slate-600"><th className="p-2">Rule</th><th>Value</th><th>Status</th><th>Source</th></tr></thead><tbody className="divide-y divide-slate-200">
        {list.length === 0 && <tr><td colSpan={4} className="p-3 text-slate-600">No figures are held for this year. The preparer confirms every limit.</td></tr>}
        {list.map((r, k) => <tr key={k}><td className="p-2 text-slate-800">{r.label[0]}</td><td className="text-slate-900">{formatRule(r)}</td><td><span className={r.status === 'verified' ? 'text-emerald-700' : 'text-amber-700'}>{r.status === 'verified' ? 'verified' : 'to confirm'}</span></td><td className="text-slate-500">{r.source}{r.note ? ` · ${r.note}` : ''}</td></tr>)}
      </tbody></table>
      <h3 className="text-sm font-bold text-slate-900">Source register</h3>
      <ul className="text-xs space-y-1">{SOURCES.map((s) => <li key={s.id}><a className="text-indigo-700 hover:text-indigo-800" href={s.url} target="_blank" rel="noreferrer">{s.title}</a> <span className="text-slate-500">· {s.publisher} · checked {s.checked}</span></li>)}</ul>
    </div>
  );
}

export default function T1TemplatePreview({ onClose, title = 'T1 Personal Income Tax Return' }: { onClose: () => void; title?: string }) {
  const [tab, setTab] = useState<'try' | 'contents' | 'coverage' | 'rules'>('try');
  const tabs = [['try', 'Try the form'], ['contents', 'What is in it'], ['coverage', 'Coverage of the official forms'], ['rules', 'Year rules and sources']] as const;
  return (
    <Scope><div role="dialog" aria-label={`Preview: ${title}`} className="fixed inset-0 z-[1000] bg-slate-50 text-slate-900 flex flex-col">
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-slate-200 bg-white">
        <div><h2 className="text-base font-bold">{title}</h2><p className="text-[11px] text-slate-600">Detailed T1 intake · form version {cat.version} · managed by the T1 engine, so questions are not edited one by one</p></div>
        <button onClick={onClose} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 text-sm hover:border-slate-400"><X className="w-4 h-4" />Close Preview</button>
      </div>
      <div role="tablist" className="flex gap-1 px-4 border-b border-slate-200 bg-white">{tabs.map(([id, l]) => <button key={id} role="tab" aria-selected={tab === id} onClick={() => setTab(id)} className={`px-4 py-2 text-sm font-semibold border-b-2 -mb-px ${tab === id ? 'border-indigo-500 text-slate-900' : 'border-transparent text-slate-600 hover:text-slate-800'}`}>{l}</button>)}</div>
      <div className="flex-1 min-h-0">{tab === 'try' ? <Try /> : tab === 'contents' ? <Contents /> : tab === 'coverage' ? <Coverage /> : <Rules />}</div>
    </div></Scope>
  );
}
