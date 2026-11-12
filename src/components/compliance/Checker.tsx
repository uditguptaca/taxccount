'use client';
// The free compliance checker: four selectors, the questions that apply, then the filings with their dates.
// On the homepage a visitor sees the first three filings and registers for the rest; inside an account the
// same screen saves straight to the person's compliances. Which questions show is decided by the shared
// engine (src/lib/compliance); which filings apply is decided on the server.
import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, CalendarClock, Check, ChevronLeft, ChevronRight, ExternalLink, Loader2, Lock, RotateCcw, ShieldCheck } from 'lucide-react';
import SourceLine from './SourceLine';
import Scope from '@/components/t1/Scope';
import InfoTip from '@/components/t1/InfoTip';
import { entityTypesFor, fmt, needsYearEnd, visibleQuestions } from '@/lib/compliance/engine';
import { condRefs } from '@/lib/compliance/describe';
import type { Answers, CountryPack, Question, Result, Selection, Step } from '@/lib/compliance/types';

const PER_SCREEN = 5;
const PER_TICK_SCREEN = 8;        // a tick list is quicker to read, so a screen can hold more

export const STORE_KEY = 'abl_compliance_check';
type CountryLite = { code: string; name: string; stateLabel: string; states: { code: string; name: string }[]; entityTypes: { id: string; name: string; desc: string; onlyStates?: string[]; notStates?: string[] }[]; departments: { id: string; name: string; desc: string }[] };
interface Outcome { total: number; shown: Result[]; locked: { head: string; frequency: string; certainty: string; due: string | null }[]; byHead: Record<string, number>; asOf: string; country: string; disclaimer: string | null; weekendNote: string; ticket: string }

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const FREQ: Record<string, string> = { annual: 'Every year', semiannual: 'Twice a year', quarterly: 'Every quarter', monthly: 'Every month', event: 'When it happens', once: 'One time' };
const sel = 'w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100 disabled:text-slate-400';
const pill = (on: boolean, warn = false) => `px-3 py-1 rounded-lg text-[13px] font-semibold border transition ${on ? (warn ? 'bg-amber-100 text-amber-900 border-amber-400' : 'bg-indigo-600 text-white border-indigo-600') : 'bg-white text-slate-700 border-slate-300 hover:border-slate-500'}`;

const HOW: Record<string, string> = {
  yn: 'Choose Yes if this was true at any time in the period, No if it was not. If you do not know, choose Not sure: nothing is hidden, and what depends on it is kept on your list for you to confirm.',
  choice: 'Pick the one that fits best. If you do not know, choose Not sure.',
  multi: 'Tick every one that applies. If none do, tick the last choice.',
  date: 'Give the date shown on the official document (the certificate, the registration letter).',
  monthday: 'Give the last day of the financial year, for example 31 December.',
};
const listOf = (a: string[]) => (a.length <= 1 ? a.join('') : `${a.slice(0, -1).join(', ')} and ${a[a.length - 1]}`);
/** What the answer is used for, from the links kept in Service Master. Headings only: the filings themselves are in the result. */
function whyAsked(q: Question): string {
  const a = q.about; if (!a) return '';
  const parts: string[] = [];
  if (a.count) parts.push(`your answer decides whether ${a.count === 1 ? 'a filing' : `${a.count} filings`} under ${listOf(a.heads.map((h) => h.toLowerCase()))} ${a.count === 1 ? 'applies' : 'apply'} to you`);
  if (a.dates) parts.push(`${a.count ? 'and ' : ''}${a.dates === 1 ? 'a due date is' : `${a.dates} due dates are`} counted from it`);
  if (a.opens && !a.count && !a.dates) parts.push('it decides which of the next questions you are asked');
  const s = parts.join(', ');
  return s ? s[0].toUpperCase() + s.slice(1) + '.' : '';
}

function QuestionRow({ q, value, onChange, tick = false }: { q: Question; value: string | string[] | undefined; onChange: (v: string | string[] | undefined) => void; tick?: boolean }) {
  const label = (
    <div className="flex items-start gap-1.5 min-w-0">
      <span className="text-sm font-medium text-slate-900 leading-snug" id={`cq-${q.id}`}>{q.text}{q.optional ? <span className="ml-1 text-xs font-normal text-slate-500">(optional)</span> : null}</span>
      <InfoTip label="About this question">
        {q.help ? <span className="block">{q.help}</span> : null}
        <span className={`block ${q.help ? 'mt-1.5' : ''}`}><b>How to answer:</b> {HOW[q.type]}{q.optional ? ' You can leave it blank and add it later.' : ''}</span>
        {whyAsked(q) ? <span className="mt-1.5 block"><b>Why we ask:</b> {whyAsked(q)}</span> : null}
      </InfoTip>
    </div>
  );
  let control: React.ReactNode = null;
  // in a tick list a yes/no question is one line: tick it if it is true, leave it if it is not
  if (tick && q.type === 'yn') {
    const on = value === 'yes';
    return (
      <div className="flex items-start gap-3 px-3 py-2" data-cq={q.id}>
        <button type="button" role="checkbox" aria-checked={on} aria-labelledby={`cq-${q.id}`} onClick={() => onChange(on ? 'no' : 'yes')}
          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border ${on ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-400 bg-white hover:border-indigo-500'}`}>{on ? <Check className="h-3.5 w-3.5" /> : null}</button>
        <div className="min-w-0 flex-1">
          <div className="cursor-pointer" onClick={() => onChange(on ? 'no' : 'yes')}>{label}</div>
          <button type="button" aria-pressed={value === 'unsure'} className={`mt-1 text-[11px] font-semibold underline sm:hidden ${value === 'unsure' ? 'text-amber-800' : 'text-slate-500'}`} onClick={() => onChange(value === 'unsure' ? undefined : 'unsure')}>{value === 'unsure' ? 'Marked: not sure' : 'Not sure'}</button>
        </div>
        <button type="button" aria-pressed={value === 'unsure'} className={`hidden shrink-0 sm:inline-flex ${pill(value === 'unsure', true)} px-2 py-0.5 text-[11px]`} onClick={() => onChange(value === 'unsure' ? undefined : 'unsure')}>Not sure</button>
      </div>
    );
  }
  if (q.type === 'yn') {
    control = <div role="radiogroup" aria-labelledby={`cq-${q.id}`} className="flex flex-wrap gap-1.5">{(['yes', 'no', 'unsure'] as const).map((o) => <button key={o} type="button" role="radio" aria-checked={value === o} className={pill(value === o, o === 'unsure')} onClick={() => onChange(o)}>{o === 'yes' ? 'Yes' : o === 'no' ? 'No' : 'Not sure'}</button>)}</div>;
  } else if (q.type === 'choice') {
    const short = (q.options ?? []).length <= 4 && (q.options ?? []).every((o) => o.label.length <= 26);
    control = short
      ? <div role="radiogroup" aria-labelledby={`cq-${q.id}`} className="flex flex-wrap justify-end gap-1.5">{q.options!.map((o) => <button key={o.v} type="button" role="radio" aria-checked={value === o.v} className={pill(value === o.v)} onClick={() => onChange(o.v)}>{o.label}</button>)}</div>
      : <select aria-labelledby={`cq-${q.id}`} className={`${sel} max-w-xs py-1.5`} value={typeof value === 'string' ? value : ''} onChange={(e) => onChange(e.target.value || undefined)}><option value="">Choose…</option>{q.options!.map((o) => <option key={o.v} value={o.v}>{o.label}</option>)}<option value="unsure">Not sure</option></select>;
  } else if (q.type === 'multi') {
    const cur = Array.isArray(value) ? value : [];
    control = <div role="group" aria-labelledby={`cq-${q.id}`} className="flex flex-wrap justify-end gap-1.5 max-w-full sm:max-w-xl">{q.options!.map((o) => { const on = cur.includes(o.v); return <button key={o.v} type="button" role="checkbox" aria-checked={on} className={`${pill(on)} inline-flex items-center gap-1`} onClick={() => { const next = on ? cur.filter((x) => x !== o.v) : [...cur.filter((x) => x !== 'none'), o.v]; onChange(o.v === 'none' && !on ? ['none'] : next); }}>{on && <Check className="w-3.5 h-3.5" />}{o.label}</button>; })}</div>;
  } else if (q.type === 'date') {
    control = <input type="date" aria-labelledby={`cq-${q.id}`} className={`${sel} w-44 py-1.5`} value={typeof value === 'string' ? value : ''} onChange={(e) => onChange(e.target.value || undefined)} />;
  } else if (q.type === 'monthday') {
    const [m, d] = typeof value === 'string' && value.includes('-') ? value.split('-') : ['', ''];
    const days = m ? new Date(2024, Number(m), 0).getDate() : 31;                    // a leap year, so 29 February can be chosen
    control = (
      <div className="flex flex-wrap gap-1.5" role="group" aria-labelledby={`cq-${q.id}`}>
        <select aria-label="Month" className={`${sel} w-36 py-1.5`} value={m} onChange={(e) => { const mm = e.target.value; if (!mm) return onChange(undefined); const last = new Date(2024, Number(mm), 0).getDate(); onChange(`${mm}-${String(Math.min(Number(d) || last, last)).padStart(2, '0')}`); }}><option value="">Month…</option>{MONTHS.map((n, i) => <option key={n} value={String(i + 1).padStart(2, '0')}>{n}</option>)}</select>
        <select aria-label="Day" className={`${sel} w-20 py-1.5`} value={d} disabled={!m} onChange={(e) => onChange(`${m}-${e.target.value}`)}>{Array.from({ length: days }, (_, i) => String(i + 1).padStart(2, '0')).map((x) => <option key={x} value={x}>{Number(x)}</option>)}</select>
      </div>
    );
  }
  return (
    <div className="px-3 py-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-2" data-cq={q.id}>
      <div className="min-w-0 flex-1 basis-[240px]">{label}</div>
      <div className="min-w-0 max-w-full">{control}</div>
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
          {r.next[0] ? <><p className="text-[11px] text-slate-500">Next due</p><p className="text-base font-bold text-slate-900">{fmt(r.next[0].date)}</p>{r.next[0].period ? <p className="text-[11px] text-slate-500">for {r.next[0].period}</p> : null}{r.next[0].was ? <p className="text-[11px] font-semibold text-amber-700">moved from {fmt(r.next[0].was)}</p> : null}</>
            : <p className="text-xs font-semibold text-slate-600 max-w-[200px]" data-norule>{r.needs ? 'Add your dates to see the due date' : r.passed ? `Was due ${fmt(r.passed)}` : r.rule || FREQ[r.frequency]}</p>}
        </div>
      </div>
      <p className="mt-2 text-sm text-slate-700 leading-snug">{r.brief}</p>
      <div className="mt-2 grid gap-x-6 gap-y-1 text-xs text-slate-600 md:grid-cols-2">
        <p><b className="text-slate-800">Why it applies:</b> {r.why}{r.certainty === 'check' ? ' (you were not sure, so please confirm)' : ''}</p>
        <p><b className="text-slate-800">When:</b> {r.dueText}</p>
        {r.penalty ? <p><b className="text-slate-800">If missed:</b> {r.penalty}{r.penaltySourceUrl ? <> (<a className="text-indigo-700 underline" href={r.penaltySourceUrl} target="_blank" rel="noopener noreferrer nofollow">official page</a>)</> : null}</p> : null}
        {r.next[0]?.was ? <p><b className="text-slate-800">Deadline moved:</b> the usual date is {fmt(r.next[0].was)}{r.next[0].movedNote ? `. ${r.next[0].movedNote}` : ''}</p> : null}
        {r.next[1] ? <p><b className="text-slate-800">After that:</b> {fmt(r.next[1].date)}</p> : null}
        {r.note ? <p className="md:col-span-2">{r.note}</p> : null}
      </div>
      <SourceLine verified={r.verified} url={r.sourceUrl} title={r.sourceTitle} publisher={r.sourcePublisher} checked={r.sourceChecked} />
    </div>
  );
}

export default function Checker({ mode = 'public', signedIn = false, onSaved, wide = false }: { mode?: 'public' | 'account'; signedIn?: boolean; onSaved?: (profileId: string) => void; /** the public homepage: the filters run the full width of the page, the questions and the result stay a readable column */ wide?: boolean }) {
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
  // A refresh (or coming back to the page) keeps the choices and answers of this tab: losing up to 40 answers to one
  // reload was a dead end. Kept in this tab only (sessionStorage), never sent anywhere, gone when the tab closes.
  const DRAFT_KEY = `abl_check_draft_${mode}`;
  const firstSave = useRef(true);
  useEffect(() => {
    try {
      const d = JSON.parse(sessionStorage.getItem(DRAFT_KEY) || 'null');
      if (d && Date.now() - Number(d.at) < 6 * 3600 * 1000 && d.s?.country) { setS(d.s); setAnswers(d.answers || {}); if (d.stage === 'ask') { setStage('ask'); setStepIdx(Number(d.stepIdx) || 0); } }
    } catch { /* private window */ }
  }, []);   // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (firstSave.current) { firstSave.current = false; return; }      // the first run would write the empty start over what was kept
    try { sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ s, answers, stage: stage === 'pick' ? 'pick' : 'ask', stepIdx, at: Date.now() })); } catch { /* private window */ }
  }, [s, answers, stage, stepIdx]);   // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!s.country) { setPack(null); return; }
    let live = true;
    fetch(`/api/public/compliance?country=${s.country}`).then((r) => r.json()).then((d) => { if (live) setPack(d.pack || null); }).catch(() => {});
    return () => { live = false; };
  }, [s.country]);

  const country = countries.find((c) => c.code === s.country);
  const entities = useMemo(() => (pack && s.state ? entityTypesFor(pack, s.state) : country && s.state ? country.entityTypes.filter((e) => (!e.onlyStates || e.onlyStates.includes(s.state)) && (!e.notStates || !e.notStates.includes(s.state))) : []), [pack, country, s.state]);
  const entity = pack?.entityTypes.find((e) => e.id === s.entity);
  // Which questions matter depends on what is ticked. The page does not hold the compliances themselves, so once the
  // entity type is chosen it fetches, for that place and entity type, only what it needs to decide: each compliance's
  // type, condition and date question, without its name. Ticking a box then needs no further request.
  const [rel, setRel] = useState<{ key: string; needs: any[] } | null>(null);
  const selKey = s.country && s.state && s.entity ? `${s.country}|${s.state}|${s.entity}` : '';
  useEffect(() => {
    if (!selKey) { setRel(null); return; }
    let live = true;
    fetch(`/api/public/compliance?country=${s.country}&state=${encodeURIComponent(s.state)}&entity=${encodeURIComponent(s.entity)}`)
      .then((r) => (r.ok ? r.json() : null)).then((d) => { if (live && Array.isArray(d?.needs)) setRel({ key: selKey, needs: d.needs }); }).catch(() => {});
    return () => { live = false; };
  }, [selKey]); // eslint-disable-line react-hooks/exhaustive-deps
  const relReady = !!rel && rel.key === selKey;
  // the types offered: those that can return something for this entity type IN THIS PLACE (a type can hold items for
  // one emirate or province only, and ticking it elsewhere led to an empty panel)
  const here = useMemo(() => (relReady ? new Set<string>(rel!.needs.map((n: any) => n.dept)) : null), [relReady, rel]);
  // a type ticked before the place was known, that turns out to hold nothing here, is unticked
  useEffect(() => { if (here && s.depts.some((d) => !here.has(d))) setS((v) => ({ ...v, depts: v.depts.filter((d) => here.has(d)) })); }, [here]);   // eslint-disable-line react-hooks/exhaustive-deps
  const packR = useMemo(() => (pack && relReady ? { ...pack, compliances: rel!.needs } as CountryPack : null), [pack, relReady, rel]);
  const questions = useMemo(() => (packR && entity ? visibleQuestions(packR, s, answers) : []), [packR, entity, s, answers]);
  // The questions are shown a few at a time: each group of the country is cut into short screens of at most
  // PER_SCREEN questions. A follow-up question stays on the screen of the question that opened it.
  const screens = useMemo(() => {
    if (!pack) return [] as { step: Step; part: number; parts: number; qs: Question[]; followUp: Set<string> }[];
    const out: { step: Step; part: number; parts: number; qs: Question[]; followUp: Set<string> }[] = [];
    for (const st of pack.steps) {
      const mine = questions.filter((q) => q.step === st.id);
      if (!mine.length) continue;
      const ids = new Set(mine.map((q) => q.id));
      const parentOf = (q: Question) => Array.from(condRefs(q.show).questions).filter((id) => ids.has(id) && id !== q.id).pop();
      const groups: Question[][] = [];
      const followUp = new Set<string>();
      const home = new Map<string, number>();
      // even screens: six questions are shown three and three, never five and one
      const roots = mine.filter((q) => parentOf(q) === undefined).length || mine.length;
      const per = st.checklist ? PER_TICK_SCREEN : PER_SCREEN;
      const size = Math.ceil(roots / Math.ceil(roots / per));
      for (const q of mine) {
        const parent = parentOf(q);
        if (parent !== undefined && home.has(parent)) { const g = home.get(parent)!; groups[g].push(q); home.set(q.id, g); followUp.add(q.id); continue; }
        let g = groups.length - 1;
        if (g < 0 || groups[g].filter((x) => !followUp.has(x.id)).length >= size) { groups.push([]); g = groups.length - 1; }
        groups[g].push(q); home.set(q.id, g);
      }
      // a follow-up is not shown until the question that opens it has been answered: nobody reads a question that may not concern them
      const blank = (id: string) => { const v = answers[id]; return v === undefined || v === '' || (Array.isArray(v) && v.length === 0); };
      const waiting = (q: Question): boolean => { const par = parentOf(q); const pq = par === undefined ? undefined : mine.find((x) => x.id === par); return !!pq && !pq.optional && followUp.has(q.id) && (blank(pq.id) || waiting(pq)); };
      groups.forEach((qs, i) => out.push({ step: st, part: i + 1, parts: groups.length, qs: qs.filter((q) => !waiting(q)), followUp }));
    }
    return out;
  }, [pack, questions, answers]);
  const steps = screens;
  const screen = screens[Math.min(stepIdx, Math.max(0, screens.length - 1))];
  const step = screen?.step;
  const inStep = screen ? screen.qs : [];
  const isBlank = (q: Question) => { const v = answers[q.id]; return v === undefined || v === '' || (Array.isArray(v) && v.length === 0); };
  const tickList = !!step?.checklist;
  // on a tick list, a yes/no question left unticked is a No: it never blocks the way
  const missingHere = inStep.filter((q) => !q.optional && isBlank(q) && !(tickList && q.type === 'yn'));
  const restYn = tickList ? [] : inStep.filter((q) => q.type === 'yn' && isBlank(q));
  const shownQuestions = screens.flatMap((x) => x.qs);
  const answeredCount = shownQuestions.filter((q) => !isBlank(q)).length;
  const ready = !!(s.country && s.state && s.entity && s.depts.length && pack && relReady && s.depts.every((d) => here?.has(d)));

  const scrollTop = () => setTimeout(() => top.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  // a selection that needs no questions (an Indian LLP that ticks only its registry filings) goes straight to its result
  const start = () => { setError(''); if (!steps.length) { run(answers); return; } setStage('ask'); setStepIdx(0); scrollTop(); };
  const set = (id: string, v: string | string[] | undefined) => setAnswers((a) => ({ ...a, [id]: v }));

  const run = async (answers: Answers) => {
    setBusy(true); setError('');
    try {
      const res = await fetch('/api/public/compliance', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sel: s, answers }) });
      const d = await res.json();
      if (!res.ok) { setError(d.error || 'Something went wrong'); return; }
      setOutcome(d); setStage('result'); scrollTop();
      // kept so that it can be saved after sign-up: only for a visitor who is not signed in. A signed-in person saves
      // with the Save button; storing it here made a reload save the check without that button being pressed.
      if (mode === 'public' && !signedIn) { try { localStorage.setItem(STORE_KEY, JSON.stringify({ ticket: d.ticket, total: d.total, kind: entity?.kind, entityName: entity?.name, country: d.country, at: Date.now() })); } catch { /* private window */ } }
    } catch { setError('Could not reach the server. Please try again.'); } finally { setBusy(false); }
  };
  const next = () => { if (missingHere.length) { setError(`Please answer the ${missingHere.length} highlighted question${missingHere.length > 1 ? 's' : ''}.${missingHere.some((q) => q.type === 'yn' || q.type === 'choice') ? ' Where you do not know, "Not sure" is an answer.' : ''}`); return; } setError('');
    // leaving a tick list: what was not ticked is recorded as No
    const blankTicks = tickList ? inStep.filter((q) => q.type === 'yn' && isBlank(q)) : [];
    const filled = blankTicks.length ? { ...answers, ...Object.fromEntries(blankTicks.map((q) => [q.id, 'no'])) } : answers;
    if (blankTicks.length) setAnswers(filled);
    if (stepIdx >= steps.length - 1) run(filled); else { setStepIdx(stepIdx + 1); scrollTop(); } };
  const save = async () => {
    setBusy(true); setError('');
    try {
      const res = await fetch('/api/compliance-tracker', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sel: s, answers, label }) });
      const d = await res.json();
      if (!res.ok) { setError(d.error || 'Could not save'); return; }
      try { localStorage.removeItem(STORE_KEY); sessionStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ }
      if (onSaved) onSaved(d.id); else window.location.href = '/portal/compliance-check';
    } catch { setError('Could not reach the server. Please try again.'); } finally { setBusy(false); }
  };
  const reset = () => { setStage('pick'); setOutcome(null); setAnswers({}); setStepIdx(0); setError(''); };

  // only the departments that have something for the chosen entity type (an individual is never offered the corporate annual return)
  const deptList = (country?.departments ?? []).filter((d) => (!entity?.depts || entity.depts.includes(d.id)) && (!here || here.has(d.id)));
  const allDepts = deptList.length > 1 && s.depts.length === deptList.length;
  // kept in the order of the list, whatever order they were ticked in
  const setDepts = (ids: string[]) => setS({ ...s, depts: deptList.map((d) => d.id).filter((id) => ids.includes(id)) });
  const tick = 'inline-flex cursor-pointer select-none items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors';
  const tickOn = 'border-indigo-500 bg-indigo-50 font-semibold text-indigo-900', tickOff = 'border-slate-300 bg-white text-slate-800 hover:border-slate-400';
  const selectors = (
    <div className="text-left">
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="text-xs font-semibold text-slate-600">Country
          <select aria-label="Country" className={`${sel} mt-1`} value={s.country} disabled={stage !== 'pick'} onChange={(e) => { setS({ country: e.target.value, state: '', entity: '', depts: [] }); setAnswers({}); }}>
            <option value="">Select a country</option>{countries.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
          </select></label>
        <label className="text-xs font-semibold text-slate-600">{country?.stateLabel ?? 'State'}
          <select aria-label="State" className={`${sel} mt-1`} value={s.state} disabled={!country || stage !== 'pick'} onChange={(e) => { setS({ ...s, state: e.target.value, entity: '', depts: [] }); setAnswers({}); }}>
            <option value="">{country ? `Select ${/^[aeiou]/i.test(country.stateLabel) ? 'an' : 'a'} ${country.stateLabel.toLowerCase()}` : 'Select a state'}</option>{country?.states.map((x) => <option key={x.code} value={x.code}>{x.name}</option>)}
          </select></label>
        <label className="text-xs font-semibold text-slate-600">Entity type
          <select aria-label="Entity type" className={`${sel} mt-1`} value={s.entity} disabled={!s.state || stage !== 'pick'} onChange={(e) => { setS({ ...s, entity: e.target.value, depts: [] }); setAnswers({}); }}>
            <option value="">Select an entity</option>{entities.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
          </select></label>
      </div>
      {/* the types of compliance: tick one, several or all. Only the questions the ticked types depend on are asked. */}
      <fieldset className="mt-4" data-depts>
        <legend className="text-xs font-semibold text-slate-600">What do you want to check? <span className="font-normal text-slate-500">Tick one or more.{s.depts.length ? ` ${allDepts ? 'All' : s.depts.length} of ${deptList.length} ticked.` : ''}</span></legend>
        {!s.entity || !deptList.length
          ? <p className="mt-1.5 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-slate-400">{s.entity && pack ? 'Nothing to check for this entity type yet.' : 'Choose a country, a place and an entity type first.'}</p>
          : <div className="mt-1.5 flex flex-wrap gap-2">
              {deptList.length > 1 && (
                <label className={`${tick} ${allDepts ? tickOn : tickOff}`}>
                  <input type="checkbox" className="h-4 w-4 accent-indigo-600" checked={allDepts} onChange={(e) => setDepts(e.target.checked ? deptList.map((d) => d.id) : [])} />All departments
                </label>)}
              {deptList.map((d) => { const on = s.depts.includes(d.id); return (
                <label key={d.id} title={d.desc} className={`${tick} ${on ? tickOn : tickOff}`}>
                  <input type="checkbox" className="h-4 w-4 accent-indigo-600" checked={on} onChange={(e) => setDepts(e.target.checked ? [...s.depts, d.id] : s.depts.filter((x) => x !== d.id))} />{d.name}
                </label>); })}
            </div>}
      </fieldset>
    </div>
  );

  return (
    <Scope>
      <div ref={top} className={`mx-auto scroll-mt-24 ${wide ? 'max-w-none' : 'max-w-5xl'}`} id="compliance-checker">
        <div className={wide ? 'rounded-2xl bg-white p-4 md:p-6 lg:p-8' : 'rounded-2xl border border-slate-200 bg-white p-4 md:p-6 shadow-sm'}>
          {stage === 'pick' ? selectors : (
            <div className="flex flex-wrap items-center justify-between gap-2 text-left" data-picked>
              <p className="flex flex-wrap items-center gap-1.5 text-xs font-semibold text-slate-700">
                {[country?.name, country?.states.find((x) => x.code === s.state)?.name, entity?.name, ...(allDepts ? ['All departments'] : deptList.filter((d) => s.depts.includes(d.id)).map((d) => d.name))].filter(Boolean).map((t, i) => <span key={i} className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1">{t}</span>)}
              </p>
              <button type="button" className="text-xs font-semibold text-indigo-700 hover:underline" onClick={() => { setStage('pick'); setOutcome(null); setError(''); }}>Change</button>
            </div>)}
          {stage === 'pick' && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-slate-500 text-left">{entity && !s.depts.length ? <span className="font-semibold text-amber-700" data-need-dept>Tick at least one type of compliance above to continue.</span> : entity ? entity.desc : 'Free. No sign-up needed to check. Your answers are not stored unless you choose to save them.'}</p>
              <button type="button" disabled={!ready} onClick={start} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-indigo-500 disabled:bg-slate-300">Check my compliances<ArrowRight className="w-4 h-4" /></button>
            </div>
          )}

          {stage === 'ask' && step && (
            <div className={`mt-5 text-left ${wide ? 'mx-auto max-w-5xl' : ''}`}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-indigo-700">Step {Math.min(stepIdx, steps.length - 1) + 1} of {steps.length} · {answeredCount} of {shownQuestions.length} answered</p>
                  <h3 className="flex items-center gap-1.5 text-lg font-bold text-slate-900">{step.title}{screen.parts > 1 ? <span className="text-xs font-semibold text-slate-500">part {screen.part} of {screen.parts}</span> : null}{step.desc ? <InfoTip strong label="About this step">{step.desc}</InfoTip> : null}</h3>
                </div>
                <button type="button" className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800" onClick={reset}><RotateCcw className="w-3.5 h-3.5" />Start over</button>
              </div>
              <div className="mt-1 h-1.5 rounded-full bg-slate-200 overflow-hidden"><div className="h-full bg-indigo-500 transition-all" style={{ width: `${shownQuestions.length ? Math.round((answeredCount / shownQuestions.length) * 100) : 0}%` }} /></div>
              {tickList && <p className="mt-2 text-xs text-slate-600" data-ticklist>Tick what is true. Leave the rest: anything not ticked counts as No.</p>}
              <div className="mt-3 rounded-xl border border-slate-200 divide-y divide-slate-100">
                {inStep.map((q) => <div key={q.id} className={`${error && !q.optional && isBlank(q) ? 'bg-amber-50' : ''} ${screen.followUp.has(q.id) ? 'border-l-4 border-l-indigo-200 pl-3 bg-indigo-50/30' : ''}`} data-followup={screen.followUp.has(q.id) || undefined}><QuestionRow q={q} tick={tickList} value={answers[q.id]} onChange={(v) => set(q.id, v)} /></div>)}
              </div>
              {restYn.length >= 2 && (
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
                  <span>Answer only what applies to you. If none of the remaining {restYn.length} do:</span>
                  <button type="button" className="rounded-lg border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-700 hover:border-indigo-500 hover:text-indigo-700" onClick={() => { setError(''); setAnswers((a) => { const n = { ...a }; for (const q of restYn) n[q.id] = 'no'; return n; }); }}>No to the rest</button>
                </div>)}
              {error && <p role="alert" className="mt-2 text-sm text-rose-700">{error}</p>}
              <div className="mt-3 flex items-center justify-between">
                <button type="button" className="inline-flex items-center gap-1 text-sm text-slate-700 hover:text-slate-900" onClick={() => { setError(''); if (stepIdx === 0) setStage('pick'); else setStepIdx(stepIdx - 1); }}><ChevronLeft className="w-4 h-4" />Back</button>
                <button type="button" disabled={busy} onClick={next} className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2 text-sm font-bold text-white hover:bg-indigo-500 disabled:opacity-60">{busy ? <Loader2 className="w-4 h-4 animate-spin" /> : null}{stepIdx >= steps.length - 1 ? 'Show my compliances' : 'Next'}<ChevronRight className="w-4 h-4" /></button>
              </div>
            </div>
          )}

          {stage === 'result' && outcome && (
            <div className={`mt-5 text-left ${wide ? 'mx-auto max-w-5xl' : ''}`} data-outcome>
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{outcome.total} {outcome.total === 1 ? 'compliance applies' : 'compliances apply'} to you</h3>
                  {(() => { const maybe = [...outcome.shown, ...outcome.locked].filter((r: any) => r.certainty === 'check').length; return maybe ? <p className="text-sm font-semibold text-rose-700" data-maybe>{maybe === outcome.total ? 'All of them' : `${maybe} of them`} may apply, because you answered "Not sure": please confirm {maybe === 1 ? 'it' : 'them'}.</p> : null; })()}
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
