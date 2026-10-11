'use client';
// The client's T1 questionnaire: a welcome page, one page per module that applies to them, a documents
// checklist and a review page. Every rule (what to ask, what is required, what is inconsistent) comes from the
// shared engine in src/lib/t1, so this screen only draws what the engine decides.
import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, AlertCircle, Circle, Clock, Languages, Lock, ChevronLeft, ChevronRight, Plus, Trash2, Menu, FileText, MessageSquare, HelpCircle, Loader2 } from 'lucide-react';
import { CATALOGUE as cat } from '@/lib/t1/catalogue/index';
import { isRequired, moduleActive, questionVisible, recordLabel, recordsOf, sectionVisible } from '@/lib/t1/evaluate';
import { ak } from '@/lib/t1/types';
import type { Finding, Lang, Module, Section } from '@/lib/t1/types';
import { text } from '@/lib/t1/package';
import { isVerifiedYear } from '@/lib/t1/config/years';
import { Field } from './Field';
import { tt } from './ui-text';
import { useIntake } from './useIntake';
import type { Intake } from './useIntake';

const PHASES: { id: string; en: string; fr: string }[] = [
  { id: 'start', en: 'Getting started', fr: 'Pour commencer' }, { id: 'about', en: 'About you', fr: 'À propos de vous' }, { id: 'income', en: 'Income', fr: 'Revenus' },
  { id: 'deductions', en: 'Deductions and credits', fr: 'Déductions et crédits' }, { id: 'province', en: 'Province or territory', fr: 'Province ou territoire' }, { id: 'finish', en: 'Finish', fr: 'Terminer' },
];
const dot = (status: string) => status === 'complete' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : status === 'needs_clarification' ? <AlertCircle className="w-4 h-4 text-amber-400" /> : status === 'awaiting_documents' ? <Clock className="w-4 h-4 text-violet-400" /> : status === 'in_progress' ? <Circle className="w-4 h-4 text-indigo-400 fill-indigo-400/30" /> : <Circle className="w-4 h-4 text-slate-600" />;

function SaveBadge({ it }: { it: Intake }) {
  const { saveState: s, lang } = it;
  const map: Record<string, [string, string]> = { saved: ['text-emerald-300', tt(lang, 'saved')], saving: ['text-slate-300', tt(lang, 'saving')], pending: ['text-slate-300', tt(lang, 'pending')], error: ['text-rose-300', tt(lang, 'saveError')], locked: ['text-slate-300', tt(lang, 'locked')] };
  return (
    <div role="status" aria-live="polite" className={`text-xs flex items-center gap-2 ${map[s][0]}`}>
      {s === 'saving' && <Loader2 className="w-3 h-3 animate-spin" />}
      {s === 'saved' && <CheckCircle2 className="w-3 h-3" />}
      {s === 'locked' && <Lock className="w-3 h-3" />}
      <span>{map[s][1]}</span>
      {s === 'error' && <button className="underline" onClick={() => it.retry()}>{tt(lang, 'retry')}</button>}
    </div>
  );
}

function SectionBlock({ it, sec, mod, scrollTo }: { it: Intake; sec: Section; mod: Module; scrollTo: { qid: string; rec: number } | null }) {
  const { ctx, lang } = it;
  const recs = sec.repeat ? recordsOf(cat, ctx, sec.id) : [0];
  const bad = useMemo(() => {
    const m = new Map<string, Finding[]>();
    for (const f of it.findings) if (f.questionId && (f.kind === 'mismatch' || f.kind === 'duplicate')) { const k = ak(f.questionId, f.rec ?? 0); m.set(k, [...(m.get(k) ?? []), f]); }
    return m;
  }, [it.findings]);
  const [open, setOpen] = useState<Record<number, boolean>>({});

  const questionsFor = (rec: number) => sec.qs.filter((q) => questionVisible(cat, ctx, q, rec));
  const fields = (rec: number) => questionsFor(rec).map((q) => (
    <Field key={`${q.id}|${rec}`} q={q} rec={rec} lang={lang} ctx={ctx} answer={it.answers[ak(q.id, rec)]} required={isRequired(cat, ctx, q, rec)} editable={it.editable}
      docs={it.documents} findingsHere={(bad.get(ak(q.id, rec)) ?? []).map((f) => ({ sev: f.sev, title: f.title as [string, string] }))}
      onValue={(v) => it.setValue(q.id, rec, v)} onFlag={(f, n) => it.setFlag(q.id, rec, f, n)}
      onUpload={(file, meta) => it.upload(file, { questionId: q.id, recordIndex: rec, ...meta })} onRemoveDoc={it.removeDoc}
      siblingValue={(local) => it.answers[ak(`${sec.id}.${local}`, rec)]?.v} />
  ));

  const addLabel = sec.repeat ? text(sec.repeat.label, lang, ctx.year) : '';
  const add = async () => { const r = await it.addRecord(sec.id); if (r !== null) setOpen((o) => ({ ...o, [r]: true })); };

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 space-y-4" id={`sec-${sec.id}`} aria-labelledby={`h-${sec.id}`}>
      <div>
        <h3 id={`h-${sec.id}`} className="text-base font-bold text-white">{text(sec.title, lang, ctx.year)}</h3>
        {sec.desc && <p className="text-xs text-slate-400 mt-1 leading-relaxed">{text(sec.desc, lang, ctx.year)}</p>}
      </div>
      {!sec.repeat && <div className="space-y-3">{fields(0)}</div>}
      {sec.repeat && (
        <div className="space-y-3">
          {recs.length === 0 && <p className="text-xs text-slate-400">{lang === 'fr' ? 'Aucun pour le moment.' : 'None added yet.'}</p>}
          {recs.map((r, i) => {
            const isOpen = open[r] ?? (recs.length === 1 || (scrollTo?.rec === r && scrollTo.qid.startsWith(sec.id)));
            return (
              <div key={r} className="rounded-xl border border-slate-700 bg-slate-950/40">
                <div className="flex items-center justify-between gap-2 px-4 py-3">
                  <button type="button" className="text-left text-sm font-semibold text-slate-100 flex-1" aria-expanded={isOpen} onClick={() => setOpen((o) => ({ ...o, [r]: !isOpen }))}>
                    {recordLabel(cat, ctx, sec.id, r, lang) || `${addLabel} ${i + 1}`}
                  </button>
                  {it.editable && <button type="button" className="text-xs text-rose-400 hover:text-rose-300 inline-flex items-center gap-1" onClick={() => { if (confirm(tt(lang, 'removeConfirm'))) it.removeRecord(sec.id, r); }}><Trash2 className="w-3 h-3" />{tt(lang, 'removeRecord')}</button>}
                </div>
                {isOpen && <div className="px-4 pb-4 space-y-3">{fields(r)}</div>}
              </div>
            );
          })}
          {it.editable && (sec.repeat.max === undefined || recs.length < sec.repeat.max) && (
            <button type="button" className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-sm font-semibold text-white" onClick={add}>
              <Plus className="w-4 h-4" />{recs.length === 0 ? `${tt(lang, 'addFirst')} ${addLabel}` : (sec.repeat.add ? text(sec.repeat.add, lang, ctx.year) : `${tt(lang, 'addAnother')} ${addLabel}`)}
            </button>
          )}
        </div>
      )}
    </section>
  );
}

function ModulePage({ it, mod, scrollTo }: { it: Intake; mod: Module; scrollTo: { qid: string; rec: number } | null }) {
  const secs = mod.sections.filter((s) => sectionVisible(cat, it.ctx, s));
  const p = it.prog.modules.find((m) => m.code === mod.code);
  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <p className="text-xs font-bold tracking-wider uppercase text-indigo-300">{mod.code}</p>
        <h2 className="text-xl font-bold text-white mt-1">{text(mod.title, it.lang, it.year)}</h2>
        <p className="text-sm text-slate-400 mt-1 max-w-3xl">{text(mod.desc, it.lang, it.year)}</p>
        {p && <p className="text-xs text-slate-500 mt-3">{p.requiredAnswered} / {p.required} {it.lang === 'fr' ? 'réponses obligatoires' : 'required answers'} · {tt(it.lang, `status_${p.status}` as any)}</p>}
      </div>
      {secs.length === 0 && <p className="text-sm text-slate-400">{tt(it.lang, 'notApplicable')}</p>}
      {secs.map((s) => <SectionBlock key={s.id} it={it} sec={s} mod={mod} scrollTo={scrollTo} />)}
    </div>
  );
}

function Welcome({ it, start }: { it: Intake; start: () => void }) {
  const { lang, engagement: e } = it;
  const fr = lang === 'fr';
  const items = it.docs.slice(0, 8);
  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-3">
        <p className="text-xs font-bold tracking-wider uppercase text-indigo-300">{tt(lang, 'year')} {e.taxYear}</p>
        <h2 className="text-2xl font-bold text-white">{fr ? 'Votre déclaration de revenus des particuliers (T1)' : 'Your personal income tax return (T1)'}</h2>
        <p className="text-sm text-slate-300 leading-relaxed max-w-3xl">{fr
          ? "Ce formulaire recueille ce dont votre préparateur a besoin. Il s'adapte à vous : vous ne verrez que les parties qui vous concernent. Vous pouvez arrêter à tout moment; tout est enregistré, et vous reprendrez là où vous étiez."
          : 'This form collects what your preparer needs. It adapts to you: you only see the parts that apply. You can stop at any time; everything is saved, and you will pick up where you left off.'}</p>
        <ul className="text-sm text-slate-300 space-y-1.5 list-disc pl-5">
          <li>{fr ? "« Je ne suis pas certain » est une réponse acceptable : votre préparateur vous aidera." : '"I\'m not sure" is a fine answer: your preparer will help.'}</li>
          <li>{fr ? "« Je le fournirai plus tard » vous permet d'avancer sans le document." : '"I\'ll provide this later" lets you keep going without the document.'}</li>
          <li>{fr ? "« Demander à mon préparateur » lui envoie votre question." : '"Ask my preparer" sends your question to them.'}</li>
          <li>{fr ? "Rien n'est transmis à l'ARC ni à Revenu Québec par ce formulaire." : 'Nothing is sent to the CRA or Revenu Québec by this form.'}</li>
        </ul>
        {!isVerifiedYear(it.year) && <p className="text-xs text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">{fr ? `Les règles de ${it.year} seront confirmées par votre préparateur.` : `Your preparer will confirm the ${it.year} rules and limits.`}</p>}
        {fr && <p className="text-[11px] text-slate-500">{tt(lang, 'frNote')}</p>}
        <button type="button" className="mt-2 inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-5 py-3 text-sm font-bold text-white" onClick={start}>{e.status === 'not_started' ? (fr ? 'Commencer' : 'Start') : tt(lang, 'continue')}<ChevronRight className="w-4 h-4" /></button>
      </div>
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <h3 className="text-sm font-bold text-white mb-2">{fr ? "Gardez ces documents à portée de main" : 'Have these ready if you can'}</h3>
        <p className="text-xs text-slate-400">{fr ? "Votre liste se complète selon vos réponses. Voici le début :" : 'Your list grows as you answer. Here is the start:'}</p>
        <ul className="mt-2 text-sm text-slate-300 list-disc pl-5 space-y-1">
          {(items.length ? items : []).map((d, i) => <li key={i}>{d.label[fr ? 1 : 0]}</li>)}
          {items.length === 0 && <li>{fr ? 'Feuillets T4, T5, relevés, reçus (selon votre situation)' : 'Slips (T4, T5…), statements and receipts, depending on your situation'}</li>}
        </ul>
      </div>
    </div>
  );
}

function DocumentsPage({ it, go }: { it: Intake; go: (m: string, q: string, r: number) => void }) {
  const fr = it.lang === 'fr';
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-3">
      <h2 className="text-xl font-bold text-white">{tt(it.lang, 'documents')}</h2>
      <p className="text-sm text-slate-400">{fr ? "La liste s'adapte à vos réponses. Cliquez sur un élément pour aller à sa question." : 'This list follows your answers. Click an item to go to its question.'}</p>
      {it.docs.length === 0 && <p className="text-sm text-slate-400">{fr ? 'Aucun document pour le moment.' : 'No documents needed yet.'}</p>}
      <ul className="divide-y divide-slate-800">
        {it.docs.map((d, i) => (
          <li key={i} className="py-2.5 flex items-center justify-between gap-3">
            <button type="button" className="text-left text-sm text-slate-200 hover:text-white" onClick={() => go(d.mod, d.questionId, d.rec)}>{d.label[fr ? 1 : 0]}{d.recLabel ? <span className="text-slate-500"> · {d.recLabel}</span> : null}{d.optional ? <span className="text-slate-500"> ({tt(it.lang, 'optional').toLowerCase()})</span> : null}</button>
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${d.status === 'received' ? 'text-emerald-300 border-emerald-500/40 bg-emerald-500/10' : d.status === 'later' ? 'text-violet-300 border-violet-500/40 bg-violet-500/10' : 'text-slate-300 border-slate-600'}`}>{d.status === 'received' ? (fr ? 'Reçu' : 'Received') : d.status === 'later' ? tt(it.lang, 'laterShort') : (fr ? 'Attendu' : 'Expected')}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ReviewPage({ it, go }: { it: Intake; go: (m: string, q: string, r: number) => void }) {
  const fr = it.lang === 'fr', L = fr ? 1 : 0;
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const blocking = it.findings.filter((f) => f.sev === 'blocking');
  const flagged = it.findings.filter((f) => f.kind === 'unsure' || f.kind === 'ask' || f.kind === 'later');
  const checks = it.findings.filter((f) => f.sev !== 'blocking' && (f.kind === 'mismatch' || f.kind === 'duplicate' || f.kind === 'invalid'));
  const submit = async () => {
    setBusy(true); setMsg('');
    const r = await it.submit({ at: new Date().toISOString(), language: it.lang });
    setBusy(false);
    if (!r.ok) setMsg(r.error || (fr ? 'La soumission a échoué.' : 'Submission failed.'));
  };
  const jump = (f: Finding) => f.questionId && go(f.mod ?? f.questionId.split('.')[0], f.questionId, f.rec ?? 0);
  if (it.engagement.status === 'submitted' || it.engagement.status === 'under_review' || it.engagement.status === 'reviewed') {
    return <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 space-y-2"><h2 className="text-xl font-bold text-white flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-emerald-300" />{fr ? 'Envoyé à votre préparateur' : 'Sent to your preparer'}</h2><p className="text-sm text-slate-200">{fr ? "Votre préparateur examine vos renseignements. S'il a besoin de plus, il rouvrira le formulaire et vous le dira." : 'Your preparer is reviewing your information. If they need more, they will reopen the form and let you know.'}</p><p className="text-xs text-slate-400">{tt(it.lang, 'notFiling')}</p></div>;
  }
  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-2">
        <h2 className="text-xl font-bold text-white">{tt(it.lang, 'review')}</h2>
        <p className="text-sm text-slate-400">{fr ? "Voyez ce qui manque encore, ce que vous avez signalé et vos documents. Vous pouvez soumettre même avec des éléments signalés « plus tard » ou « pas certain »." : 'See what is still missing, what you flagged, and your documents. You can submit even with items marked "later" or "not sure".'}</p>
        <div className="h-2 rounded-full bg-slate-800 overflow-hidden"><div className="h-full bg-indigo-500" style={{ width: `${it.prog.overall.percent}%` }} /></div>
        <p className="text-xs text-slate-400">{it.prog.overall.percent}% · {it.prog.overall.requiredAnswered}/{it.prog.overall.required} {fr ? 'réponses obligatoires' : 'required answers'}</p>
      </div>
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-2">
        <h3 className="text-sm font-bold text-white">{fr ? `À compléter (${blocking.length})` : `Still needed (${blocking.length})`}</h3>
        {blocking.length === 0 && <p className="text-sm text-emerald-300">{fr ? 'Rien ne manque.' : 'Nothing is missing.'}</p>}
        <ul className="space-y-1">{blocking.slice(0, 80).map((f) => <li key={f.key}><button className="text-left text-sm text-amber-200 hover:text-white underline-offset-2 hover:underline" onClick={() => jump(f)}>{f.title[L]}</button></li>)}</ul>
        {blocking.length > 80 && <p className="text-xs text-slate-500">+ {blocking.length - 80}</p>}
      </div>
      {flagged.length > 0 && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-2">
          <h3 className="text-sm font-bold text-white">{fr ? `Signalé pour votre préparateur (${flagged.length})` : `Flagged for your preparer (${flagged.length})`}</h3>
          <ul className="space-y-1">{flagged.slice(0, 80).map((f) => <li key={f.key}><button className="text-left text-sm text-slate-300 hover:text-white" onClick={() => jump(f)}>{f.title[L]}</button></li>)}</ul>
        </div>
      )}
      {checks.length > 0 && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-2">
          <h3 className="text-sm font-bold text-white">{fr ? 'À vérifier' : 'Please double-check'}</h3>
          <ul className="space-y-1">{checks.slice(0, 40).map((f) => <li key={f.key}><button className="text-left text-sm text-slate-300 hover:text-white" onClick={() => jump(f)}>{f.title[L]}</button></li>)}</ul>
        </div>
      )}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-3">
        <p className="text-xs text-slate-400">{tt(it.lang, 'notFiling')}</p>
        {msg && <p role="alert" className="text-sm text-rose-300">{msg}</p>}
        <button type="button" disabled={busy || blocking.length > 0 || !it.editable || it.saveState === 'error'} className="rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:text-slate-400 px-6 py-3 text-sm font-bold text-white" onClick={submit}>
          {busy ? tt(it.lang, 'submitting') : tt(it.lang, 'submit')}
        </button>
        {blocking.length > 0 && <p className="text-xs text-slate-400">{fr ? "Complétez d'abord les éléments ci-dessus." : 'Finish the items above first.'}</p>}
      </div>
    </div>
  );
}

export default function Runner({ engagementId, backHref = '/portal/tax-intake' }: { engagementId: string; backHref?: string }) {
  const it = useIntake(engagementId);
  const [page, setPage] = useState<string>('welcome');
  const [scrollTo, setScrollTo] = useState<{ qid: string; rec: number } | null>(null);
  const [menu, setMenu] = useState(false);
  const started = useRef(false);
  const top = useRef<HTMLDivElement>(null);

  const active = useMemo(() => cat.modules.filter((m) => it.engagement && moduleActive(cat, it.ctx, m)), [it.ctx, it.engagement]);
  useEffect(() => {
    if (it.engagement && !started.current) { started.current = true; const s = it.engagement.currentStep; setPage(s && s !== 'welcome' ? s : 'welcome'); }
  }, [it.engagement]);

  const go = (p: string, qid?: string, rec = 0) => {
    setPage(p); setMenu(false); setScrollTo(qid ? { qid, rec } : null); it.setStep(p);
    setTimeout(() => {
      const el = qid ? document.querySelector(`[data-q="${qid}"][data-rec="${rec}"]`) : top.current;
      (el as HTMLElement | null)?.scrollIntoView({ behavior: 'smooth', block: qid ? 'center' : 'start' });
    }, 80);
  };

  if (it.loading) return <div className="min-h-screen bg-slate-950 text-slate-300 flex items-center justify-center">Loading…</div>;
  if (it.loadError) return <div className="min-h-screen bg-slate-950 text-slate-200 flex items-center justify-center p-6"><div className="text-center space-y-3"><p>{it.loadError}</p><Link className="text-indigo-300 underline" href={backHref}>Back</Link></div></div>;
  const lang: Lang = it.lang, fr = lang === 'fr';
  const order = ['welcome', ...PHASES.flatMap((ph) => active.filter((m) => m.phase === ph.id).map((m) => m.code)), 'documents', 'review'];
  const idx = Math.max(0, order.indexOf(page));
  const mod = cat.mod.get(page);
  const flaggedCount = it.findings.filter((f) => f.kind === 'ask' || f.kind === 'unsure').length;

  const nav = (
    <nav aria-label={tt(lang, 'sections')} className="space-y-4">
      <button className={`w-full text-left text-sm rounded-lg px-3 py-2 ${page === 'welcome' ? 'bg-indigo-600/20 text-white' : 'text-slate-300 hover:bg-slate-800'}`} onClick={() => go('welcome')}>{tt(lang, 'welcome')}</button>
      {PHASES.map((ph) => {
        const mods = active.filter((m) => m.phase === ph.id);
        if (!mods.length) return null;
        return (
          <div key={ph.id}>
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">{fr ? ph.fr : ph.en}</p>
            {mods.map((m) => { const st = it.prog.modules.find((x) => x.code === m.code)?.status ?? 'not_started'; return (
              <button key={m.code} className={`w-full flex items-center gap-2 text-left text-sm rounded-lg px-3 py-1.5 ${page === m.code ? 'bg-indigo-600/20 text-white' : 'text-slate-300 hover:bg-slate-800'}`} onClick={() => go(m.code)} aria-current={page === m.code ? 'page' : undefined}>
                {dot(st)}<span className="truncate">{text(m.title, lang, it.year)}</span>
              </button>); })}
          </div>
        );
      })}
      <div>
        <button className={`w-full flex items-center gap-2 text-left text-sm rounded-lg px-3 py-1.5 ${page === 'documents' ? 'bg-indigo-600/20 text-white' : 'text-slate-300 hover:bg-slate-800'}`} onClick={() => go('documents')}><FileText className="w-4 h-4" />{tt(lang, 'documents')}</button>
        <button className={`w-full flex items-center gap-2 text-left text-sm rounded-lg px-3 py-1.5 ${page === 'review' ? 'bg-indigo-600/20 text-white' : 'text-slate-300 hover:bg-slate-800'}`} onClick={() => go('review')}><MessageSquare className="w-4 h-4" />{tt(lang, 'review')}{flaggedCount > 0 && <span className="ml-auto text-[10px] bg-amber-500/20 text-amber-200 rounded-full px-1.5">{flaggedCount}</span>}</button>
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100" ref={top}>
      <header className="sticky top-0 z-20 border-b border-slate-800 bg-slate-950/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
          <button className="md:hidden p-2 rounded-lg border border-slate-700" aria-label={tt(lang, 'sections')} onClick={() => setMenu(!menu)}><Menu className="w-4 h-4" /></button>
          <Link href={backHref} className="text-sm text-slate-400 hover:text-white hidden sm:block">←</Link>
          <div className="min-w-0">
            <h1 className="text-sm font-bold truncate">T1 · {it.engagement.taxYear}{it.engagement.taxpayerName ? ` · ${it.engagement.taxpayerName}` : ''}</h1>
            <SaveBadge it={it} />
          </div>
          <div className="ml-auto flex items-center gap-3">
            <div className="hidden sm:block w-40" aria-label={tt(lang, 'progress')}><div className="h-1.5 rounded-full bg-slate-800 overflow-hidden"><div className="h-full bg-indigo-500 transition-all" style={{ width: `${it.prog.overall.percent}%` }} /></div><p className="text-[10px] text-slate-500 mt-0.5 text-right">{it.prog.overall.percent}%</p></div>
            <button className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-semibold hover:border-indigo-400" onClick={() => it.setLang(fr ? 'en' : 'fr')} aria-label="Language"><Languages className="w-3.5 h-3.5" />{tt(lang, 'language')}</button>
          </div>
        </div>
      </header>
      {it.conflictCount > 0 && <div role="alert" className="bg-amber-500/10 border-b border-amber-500/30 text-amber-200 text-xs px-4 py-2 text-center">{tt(lang, 'conflict')}</div>}
      {it.formVersionChanged && <div className="bg-sky-500/10 border-b border-sky-500/30 text-sky-200 text-xs px-4 py-2 text-center">{fr ? "Le formulaire a été amélioré depuis votre dernière visite. Vos réponses sont conservées." : 'The form was improved since your last visit. Your answers are kept.'}</div>}
      {!it.editable && it.engagement.status !== 'submitted' && <div className="bg-slate-800 text-slate-200 text-xs px-4 py-2 text-center">{tt(lang, 'locked')}</div>}
      <div className="max-w-7xl mx-auto px-4 py-6 grid md:grid-cols-[260px_1fr] gap-6">
        <aside className={`${menu ? 'block' : 'hidden'} md:block md:sticky md:top-20 md:self-start md:max-h-[calc(100vh-6rem)] md:overflow-y-auto`}>{nav}</aside>
        <main className="min-w-0 space-y-6">
          {page === 'welcome' && <Welcome it={it} start={() => go(order[1] ?? 'review')} />}
          {mod && <ModulePage it={it} mod={mod} scrollTo={scrollTo} />}
          {page === 'documents' && <DocumentsPage it={it} go={go} />}
          {page === 'review' && <ReviewPage it={it} go={go} />}
          {page !== 'welcome' && page !== 'review' && (
            <div className="flex items-center justify-between pt-2">
              <button className="inline-flex items-center gap-1 text-sm text-slate-300 hover:text-white" onClick={() => go(order[Math.max(0, idx - 1)])}><ChevronLeft className="w-4 h-4" />{tt(lang, 'back')}</button>
              <button className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-sm font-semibold text-white" onClick={() => go(order[Math.min(order.length - 1, idx + 1)])}>{tt(lang, 'next')}<ChevronRight className="w-4 h-4" /></button>
            </div>
          )}
          {it.legacy.length > 0 && !it.isClient && <p className="text-xs text-slate-500"><HelpCircle className="inline w-3 h-3" /> {tt(lang, 'removedNote')}: {it.legacy.length}</p>}
        </main>
      </div>
    </div>
  );
}
