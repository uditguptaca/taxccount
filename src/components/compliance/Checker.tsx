'use client';
// The free compliance checker: four selectors, the questions that apply, then the filings with their dates.
// On the homepage a visitor sees the first three filings and registers for the rest; inside an account the
// same screen saves straight to the person's compliances. Which questions show is decided by the shared
// engine (src/lib/compliance); which filings apply is decided on the server.
import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, CalendarClock, Check, ChevronLeft, ChevronRight, ExternalLink, Loader2, Lock, RotateCcw, ShieldCheck } from 'lucide-react';
import Scope from '@/components/t1/Scope';
import InfoTip from '@/components/t1/InfoTip';
import { entityTypesFor, fmt, needsYearEnd, visibleQuestions } from '@/lib/compliance/engine';
import type { Answers, CountryPack, Question, Result, Selection } from '@/lib/compliance/types';

export const STORE_KEY = 'abl_compliance_check';
type CountryLite = { code: string; name: string; stateLabel: string; states: { code: string; name: string }[]; entityTypes: { id: string; name: string; desc: string; onlyStates?: string[]; notStates?: string[] }[]; departments: { id: string; name: string; desc: string }[] };
interface Outcome { total: number; shown: Result[]; locked: { head: string; frequency: string; certainty: string; due: string | null }[]; byHead: Record<string, number>; asOf: string; country: string; disclaimer: string | null; weekendNote: string; ticket: string }

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const FREQ: Record<string, string> = { annual: 'Every year', semiannual: 'Twice a year', quarterly: 'Every quarter', monthly: 'Every month', event: 'When it happens', once: 'One time' };
const sel = 'w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100 disabled:text-slate-400';
const pill = (on: boolean, warn = false) => `px-3 py-1 rounded-lg text-[13px] font-semibold border transition ${on ? (warn ? 'bg-amber-100 text-amber-900 border-amber-400' : 'bg-indigo-600 text-white border-indigo-600') : 'bg-white text-slate-700 border-slate-300 hover:border-slate-500'}`;

function QuestionRow({ q, value, onChange }: { q: Question; value: string | string[] | undefined; onChange: (v: string | string[] | undefined) => void }) {
  const label = (
    <div className="flex items-start gap-1.5 min-w-0">
      <span className="text-sm font-medium text-slate-900 leading-snug" id={`cq-${q.id}`}>{q.text}{q.optional ? <span className="ml-1 text-xs font-normal text-slate-500">(optional)</span> : null}</span>
      {q.help ? <InfoTip label="What this means">{q.help}</InfoTip> : null}
    </div>
  );
  let control: React.ReactNode = null;
  if (q.type === 'yn') {
    control = <div role="radiogroup" aria-labelledby={`cq-${q.id}`} className="flex gap-1.5">{(['yes', 'no', 'unsure'] as const).map((o) => <button key={o} type="button" role="radio" aria-checked={value === o} className={pill(value === o, o === 'unsure')} onClick={() => onChange(o)}>{o === 'yes' ? 'Yes' : o === 'no' ? 'No' : 'Not sure'}</button>)}</div>;
  } else if (q.type === 'choice') {
    const short = (q.options ?? []).length <= 4 && (q.options ?? []).every((o) => o.label.length <= 26);
    control = short
      ? <div role="radiogroup" aria-labelledby={`cq-${q.id}`} className="flex flex-wrap justify-end gap-1.5">{q.options!.map((o) => <button key={o.v} type="button" role="radio" aria-checked={value === o.v} className={pill(value === o.v)} onClick={() => onChange(o.v)}>{o.label}</button>)}</div>
      : <select aria-labelledby={`cq-${q.id}`} className={`${sel} max-w-xs py-1.5`} value={typeof value === 'string' ? value : ''} onChange={(e) => onChange(e.target.value || undefined)}><option value="">Choose…</option>{q.options!.map((o) => <option key={o.v} value={o.v}>{o.label}</option>)}<option value="unsure">Not sure</option></select>;
  } else if (q.type === 'multi') {
    const cur = Array.isArray(value) ? value : [];
    control = <div role="group" aria-labelledby={`cq-${q.id}`} className="flex flex-wrap justify-end gap-1.5 max-w-xl">{q.options!.map((o) => { const on = cur.includes(o.v); return <button key={o.v} type="button" role="checkbox" aria-checked={on} className={`${pill(on)} inline-flex items-center gap-1`} onClick={() => { const next = on ? cur.filter((x) => x !== o.v) : [...cur.filter((x) => x !== 'none'), o.v]; onChange(o.v === 'none' && !on ? ['none'] : next); }}>{on && <Check className="w-3.5 h-3.5" />}{o.label}</button>; })}</div>;
  } else if (q.type === 'date') {
    control = <input type="date" aria-labelledby={`cq-${q.id}`} className={`${sel} w-44 py-1.5`} value={typeof value === 'string' ? value : ''} onChange={(e) => onChange(e.target.value || undefined)} />;
  } else if (q.type === 'monthday') {
    const [m, d] = typeof value === 'string' && value.includes('-') ? value.split('-') : ['', ''];
    const days = m ? new Date(2025, Number(m), 0).getDate() : 31;
    control = (
      <div className="flex gap-1.5" role="group" aria-labelledby={`cq-${q.id}`}>
        <select aria-label="Month" className={`${sel} w-36 py-1.5`} value={m} onChange={(e) => { const mm = e.target.value; if (!mm) return onChange(undefined); const last = new Date(2025, Number(mm), 0).getDate(); onChange(`${mm}-${String(Math.min(Number(d) || last, last)).padStart(2, '0')}`); }}><option value="">Month…</option>{MONTHS.map((n, i) => <option key={n} value={String(i + 1).padStart(2, '0')}>{n}</option>)}</select>
        <select aria-label="Day" className={`${sel} w-20 py-1.5`} value={d} disabled={!m} onChange={(e) => onChange(`${m}-${e.target.value}`)}>{Array.from({ length: days }, (_, i) => String(i + 1).padStart(2, '0')).map((x) => <option key={x} value={x}>{Number(x)}</option>)}</select>
      </div>
    );
  }
  return (
    <div className="px-3 py-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-2" data-cq={q.id}>
      <div className="min-w-0 flex-1 basis-[240px]">{label}</div>
      <div className="shrink-0">{control}</div>
    </div>
  );
}

export function ResultCard({ r, index }: { r: Result; index?: number }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 text-left" data-result={r.id}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-indigo-700">{r.head} · {r.authority}</p>
          <h4 className="text-base font-bold text-slate-900">{index !== undefined ? `${index + 1}. ` : ''}{r.name}{r.form ? <span className="ml-2 text-sm font-semibold text-slate-500">{r.form}</span> : null}</h4>
        </div>
        <div className="text-right shrink-0">
          {r.next[0] ? <><p className="text-[11px] text-slate-500">Next due</p><p className="text-base font-bold text-slate-900">{fmt(r.next[0].date)}</p>{r.next[0].period ? <p className="text-[11px] text-slate-500">for {r.next[0].period}</p> : null}</>
            : <p className="text-xs font-semibold text-slate-600 max-w-[180px]">{r.needs ? 'Add your dates to see the due date' : FREQ[r.frequency]}</p>}
        </div>
      </div>
      <p className="mt-2 text-sm text-slate-700 leading-snug">{r.brief}</p>
      <div className="mt-2 grid gap-x-6 gap-y-1 text-xs text-slate-600 md:grid-cols-2">
        <p><b className="text-slate-800">Why it applies:</b> {r.why}{r.certainty === 'check' ? ' (you were not sure, so please confirm)' : ''}</p>
        <p><b className="text-slate-800">When:</b> {r.dueText}</p>
        {r.penalty ? <p><b className="text-slate-800">If missed:</b> {r.penalty}</p> : null}
        {r.next[1] ? <p><b className="text-slate-800">After that:</b> {fmt(r.next[1].date)}</p> : null}
        {r.note ? <p className="md:col-span-2">{r.note}</p> : null}
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px]">
        <span className={`inline-flex items-center gap-1 font-semibold ${r.verified ? 'text-emerald-700' : 'text-amber-700'}`}><ShieldCheck className="w-3.5 h-3.5" />{r.verified ? 'Checked against the official source' : 'Confirm on the official source'}</span>
        {r.sourceUrl ? <a className="inline-flex items-center gap-1 text-indigo-700 hover:underline" href={r.sourceUrl} target="_blank" rel="noreferrer">{r.sourceTitle || 'Official source'}<ExternalLink className="w-3 h-3" /></a> : null}
      </div>
    </div>
  );
}

export default function Checker({ mode = 'public', signedIn = false, onSaved }: { mode?: 'public' | 'account'; signedIn?: boolean; onSaved?: (profileId: string) => void }) {
  const [countries, setCountries] = useState<CountryLite[]>([]);
  const [pack, setPack] = useState<CountryPack | null>(null);
  const [s, setS] = useState<Selection>({ country: '', state: '', entity: '', depts: [] });
  const [answers, setAnswers] = useState<Answers>({});
  const [stage, setStage] = useState<'pick' | 'ask' | 'result'>('pick');
  const [stepIdx, setStepIdx] = useState(0);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [label, setLabel] = useState('');
  const top = useRef<HTMLDivElement>(null);

  useEffect(() => { fetch('/api/public/compliance').then((r) => r.json()).then((d) => setCountries(d.countries || [])).catch(() => setError('Could not load the list of countries. Please refresh.')); }, []);
  useEffect(() => {
    if (!s.country) { setPack(null); return; }
    let live = true;
    fetch(`/api/public/compliance?country=${s.country}`).then((r) => r.json()).then((d) => { if (live) setPack(d.pack || null); }).catch(() => {});
    return () => { live = false; };
  }, [s.country]);

  const country = countries.find((c) => c.code === s.country);
  const entities = useMemo(() => (pack && s.state ? entityTypesFor(pack, s.state) : country && s.state ? country.entityTypes.filter((e) => (!e.onlyStates || e.onlyStates.includes(s.state)) && (!e.notStates || !e.notStates.includes(s.state))) : []), [pack, country, s.state]);
  const entity = pack?.entityTypes.find((e) => e.id === s.entity);
  const questions = useMemo(() => (pack && entity ? visibleQuestions(pack, s, answers) : []), [pack, entity, s, answers]);
  const steps = useMemo(() => (pack ? pack.steps.filter((st) => questions.some((q) => q.step === st.id)) : []), [pack, questions]);
  const step = steps[Math.min(stepIdx, Math.max(0, steps.length - 1))];
  const inStep = step ? questions.filter((q) => q.step === step.id) : [];
  const isBlank = (q: Question) => { const v = answers[q.id]; return v === undefined || v === '' || (Array.isArray(v) && v.length === 0); };
  const missingHere = inStep.filter((q) => !q.optional && isBlank(q));
  const answeredCount = questions.filter((q) => !isBlank(q)).length;
  const ready = !!(s.country && s.state && s.entity && s.depts.length && pack);

  const scrollTop = () => setTimeout(() => top.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  const start = () => { setError(''); setStage('ask'); setStepIdx(0); scrollTop(); };
  const set = (id: string, v: string | string[] | undefined) => setAnswers((a) => ({ ...a, [id]: v }));

  const run = async () => {
    setBusy(true); setError('');
    try {
      const res = await fetch('/api/public/compliance', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sel: s, answers }) });
      const d = await res.json();
      if (!res.ok) { setError(d.error || 'Something went wrong'); return; }
      setOutcome(d); setStage('result'); scrollTop();
      try { localStorage.setItem(STORE_KEY, JSON.stringify({ ticket: d.ticket, total: d.total, kind: entity?.kind, entityName: entity?.name, country: d.country, at: Date.now() })); } catch { /* private window */ }
    } catch { setError('Could not reach the server. Please try again.'); } finally { setBusy(false); }
  };
  const next = () => { if (missingHere.length) { setError(`Please answer the ${missingHere.length} highlighted question${missingHere.length > 1 ? 's' : ''}. "Not sure" is fine.`); return; } setError(''); if (stepIdx >= steps.length - 1) run(); else { setStepIdx(stepIdx + 1); scrollTop(); } };
  const save = async () => {
    setBusy(true); setError('');
    try {
      const res = await fetch('/api/compliance-tracker', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sel: s, answers, label }) });
      const d = await res.json();
      if (!res.ok) { setError(d.error || 'Could not save'); return; }
      try { localStorage.removeItem(STORE_KEY); } catch { /* ignore */ }
      if (onSaved) onSaved(d.id); else window.location.href = '/portal/compliance-check';
    } catch { setError('Could not reach the server. Please try again.'); } finally { setBusy(false); }
  };
  const reset = () => { setStage('pick'); setOutcome(null); setAnswers({}); setStepIdx(0); setError(''); };

  const selectors = (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-left">
      <label className="text-xs font-semibold text-slate-600">Country
        <select aria-label="Country" className={`${sel} mt-1`} value={s.country} disabled={stage !== 'pick'} onChange={(e) => { setS({ country: e.target.value, state: '', entity: '', depts: [] }); setAnswers({}); }}>
          <option value="">Select a country</option>{countries.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
        </select></label>
      <label className="text-xs font-semibold text-slate-600">{country?.stateLabel ?? 'State'}
        <select aria-label="State" className={`${sel} mt-1`} value={s.state} disabled={!country || stage !== 'pick'} onChange={(e) => { setS({ ...s, state: e.target.value, entity: '' }); setAnswers({}); }}>
          <option value="">{country ? `Select a ${country.stateLabel.toLowerCase()}` : 'Select a state'}</option>{country?.states.map((x) => <option key={x.code} value={x.code}>{x.name}</option>)}
        </select></label>
      <label className="text-xs font-semibold text-slate-600">Entity type
        <select aria-label="Entity type" className={`${sel} mt-1`} value={s.entity} disabled={!s.state || stage !== 'pick'} onChange={(e) => { setS({ ...s, entity: e.target.value }); setAnswers({}); }}>
          <option value="">Select an entity</option>{entities.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
        </select></label>
      <label className="text-xs font-semibold text-slate-600">Department
        <select aria-label="Department" className={`${sel} mt-1`} value={s.depts.length === 0 ? '' : s.depts.length === (country?.departments.length ?? 0) ? 'all' : s.depts[0]} disabled={!s.entity || stage !== 'pick'} onChange={(e) => setS({ ...s, depts: e.target.value === 'all' ? (country?.departments.map((d) => d.id) ?? []) : e.target.value ? [e.target.value] : [] })}>
          <option value="">Select a department</option>{(country?.departments.length ?? 0) > 1 && <option value="all">All tax departments</option>}{country?.departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select></label>
    </div>
  );

  return (
    <Scope>
      <div ref={top} className="mx-auto max-w-5xl scroll-mt-24" id="compliance-checker">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 md:p-6 shadow-sm">
          {selectors}
          {stage === 'pick' && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-slate-500 text-left">{entity ? entity.desc : 'Free. No sign-up needed to check. Your answers are not stored unless you choose to save them.'}</p>
              <button type="button" disabled={!ready} onClick={start} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-indigo-500 disabled:bg-slate-300">Check my compliances<ArrowRight className="w-4 h-4" /></button>
            </div>
          )}

          {stage === 'ask' && step && (
            <div className="mt-5 text-left">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-indigo-700">Step {stepIdx + 1} of {steps.length} · {answeredCount} of {questions.length} answered</p>
                  <h3 className="flex items-center gap-1.5 text-lg font-bold text-slate-900">{step.title}{step.desc ? <InfoTip strong label="About this step">{step.desc}</InfoTip> : null}</h3>
                </div>
                <button type="button" className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800" onClick={reset}><RotateCcw className="w-3.5 h-3.5" />Start over</button>
              </div>
              <div className="mt-1 h-1.5 rounded-full bg-slate-200 overflow-hidden"><div className="h-full bg-indigo-500 transition-all" style={{ width: `${questions.length ? Math.round((answeredCount / questions.length) * 100) : 0}%` }} /></div>
              <div className="mt-3 rounded-xl border border-slate-200 divide-y divide-slate-100">
                {inStep.map((q) => <div key={q.id} className={error && !q.optional && isBlank(q) ? 'bg-amber-50' : ''}><QuestionRow q={q} value={answers[q.id]} onChange={(v) => set(q.id, v)} /></div>)}
              </div>
              {error && <p role="alert" className="mt-2 text-sm text-rose-700">{error}</p>}
              <div className="mt-3 flex items-center justify-between">
                <button type="button" className="inline-flex items-center gap-1 text-sm text-slate-700 hover:text-slate-900" onClick={() => { setError(''); if (stepIdx === 0) setStage('pick'); else setStepIdx(stepIdx - 1); }}><ChevronLeft className="w-4 h-4" />Back</button>
                <button type="button" disabled={busy} onClick={next} className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2 text-sm font-bold text-white hover:bg-indigo-500 disabled:opacity-60">{busy ? <Loader2 className="w-4 h-4 animate-spin" /> : null}{stepIdx >= steps.length - 1 ? 'Show my compliances' : 'Next'}<ChevronRight className="w-4 h-4" /></button>
              </div>
            </div>
          )}

          {stage === 'result' && outcome && (
            <div className="mt-5 text-left" data-outcome>
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{outcome.total} {outcome.total === 1 ? 'compliance applies' : 'compliances apply'} to you</h3>
                  <p className="text-xs text-slate-500">{outcome.country} · worked out on {fmt(outcome.asOf)} from your answers</p>
                </div>
                <div className="flex flex-wrap gap-1.5">{Object.entries(outcome.byHead).map(([h, n]) => <span key={h} className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[11px] font-semibold text-slate-700">{h} · {n}</span>)}</div>
              </div>
              <div className="mt-3 space-y-2">{outcome.shown.map((r, i) => <ResultCard key={r.id} r={r} index={i} />)}</div>

              {outcome.locked.length > 0 && (
                <div className="mt-3 rounded-xl border border-indigo-200 bg-indigo-50 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h4 className="flex items-center gap-1.5 text-base font-bold text-slate-900"><Lock className="w-4 h-4 text-indigo-700" />{outcome.locked.length} more {outcome.locked.length === 1 ? 'compliance applies' : 'compliances apply'} to you</h4>
                      <p className="text-xs text-slate-600">{mode === 'public' && !signedIn ? 'Create a free account to see all of them with their due dates, and track each one.' : 'Save this check to see all of them with their due dates and track each one.'}</p>
                    </div>
                    {mode === 'public' && !signedIn
                      ? <Link href="/signup?from=check" className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-indigo-500">Create my free account<ArrowRight className="w-4 h-4" /></Link>
                      : null}
                  </div>
                  <ul className="mt-3 grid gap-1.5 md:grid-cols-2" aria-label="Locked compliances">
                    {outcome.locked.slice(0, 12).map((l, i) => (
                      <li key={i} className="flex items-center justify-between gap-2 rounded-lg border border-indigo-100 bg-white px-3 py-1.5 text-xs">
                        <span className="flex items-center gap-2 min-w-0"><Lock className="w-3 h-3 text-slate-400 shrink-0" /><span className="font-semibold text-slate-700">{l.head}</span><span aria-hidden className="select-none text-slate-300 blur-[3px]">Compliance name hidden</span></span>
                        <span className="shrink-0 text-slate-500 inline-flex items-center gap-1"><CalendarClock className="w-3 h-3" />{l.due ? `${MONTHS[Number(l.due.slice(5, 7)) - 1]} ${l.due.slice(0, 4)}` : FREQ[l.frequency]}</span>
                      </li>))}
                  </ul>
                  {outcome.locked.length > 12 && <p className="mt-1 text-[11px] text-slate-500">and {outcome.locked.length - 12} more</p>}
                </div>
              )}

              {(mode === 'account' || signedIn) && (
                <div className="mt-3 flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <label className="text-xs font-semibold text-slate-600 flex-1 min-w-[220px]">{entity?.kind === 'individual' ? 'Name for this check (for example your name)' : 'Name of the business'}
                    <input className={`${sel} mt-1 py-2`} value={label} onChange={(e) => setLabel(e.target.value)} placeholder={entity?.kind === 'individual' ? 'Me' : 'My company'} /></label>
                  <button type="button" disabled={busy} onClick={save} className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-500 disabled:opacity-60">{busy ? <Loader2 className="w-4 h-4 animate-spin" /> : null}Save all {outcome.total} to my account</button>
                </div>
              )}
              {error && <p role="alert" className="mt-2 text-sm text-rose-700">{error}</p>}
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
                <p className="max-w-3xl">{outcome.disclaimer ?? 'This is general information to help you find what applies. It is not tax or legal advice. Confirm each deadline with the authority or your advisor.'} {outcome.weekendNote}</p>
                <div className="flex gap-3"><button type="button" className="hover:text-slate-800 underline" onClick={() => { setStage('ask'); setStepIdx(0); }}>Change my answers</button><button type="button" className="hover:text-slate-800 underline" onClick={reset}>Start over</button></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Scope>
  );
}
