'use client';
// The preparer's workspace for one client's T1: what the client answered (organized by form part, with their
// documents beside the answers), what still needs attention, the documents, internal notes, and the frozen
// copies of every submission. Reads the same shared engine as the client's form.
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AlertCircle, CheckCircle2, Clock, Download, FileText, History, Lock, MessageSquare, Pencil, ShieldAlert, Undo2 } from 'lucide-react';
import { CATALOGUE as cat } from '@/lib/t1/catalogue/index';
import { applicable, checklist, progress } from '@/lib/t1/evaluate';
import { validate, countFindings } from '@/lib/t1/validate';
import { buildPackage } from '@/lib/t1/package';
import type { Package, PackageRow } from '@/lib/t1/package';
import { unverifiedRules } from '@/lib/t1/config/years';
import { SOURCE_BY_ID } from '@/lib/t1/sources';
import type { Ctx, Finding, UploadedDoc } from '@/lib/t1/types';
import Scope from './Scope';

type Tab = 'summary' | 'answers' | 'attention' | 'documents' | 'notes' | 'versions';
const STATUS_LABEL: Record<string, string> = { not_started: 'Not started', in_progress: 'In progress', awaiting_documents: 'Waiting for documents', needs_clarification: 'Needs clarification', submitted: 'Submitted', under_review: 'Under review', reviewed: 'Reviewed', returned_to_client: 'Returned to client', complete: 'Complete' };
const SEV_TONE: Record<string, string> = { blocking: 'text-rose-700 border-rose-300 bg-rose-50', specialist: 'text-fuchsia-700 border-fuchsia-300 bg-fuchsia-50', warning: 'text-amber-700 border-amber-300 bg-amber-50', info: 'text-sky-700 border-sky-300 bg-sky-50' };
const btn = 'px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-800 hover:border-indigo-500 hover:text-slate-900';

export default function Workspace(p: { engagementId: string }) { return <Scope><WorkspaceInner {...p} /></Scope>; }

function WorkspaceInner({ engagementId }: { engagementId: string }) {
  const [tab, setTab] = useState<Tab>('summary');
  const [state, setState] = useState<any>(null);
  const [error, setError] = useState('');
  const [items, setItems] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [subs, setSubs] = useState<any[]>([]);
  const [noteText, setNoteText] = useState('');
  const [modCode, setModCode] = useState('');
  const [showResolved, setShowResolved] = useState(false);
  const [history, setHistory] = useState<{ q: string; rec: number; rows: any[] } | null>(null);
  const [mask, setMask] = useState(true);
  const [busy, setBusy] = useState('');

  const load = useCallback(async () => {
    const [s, r, n, v] = await Promise.all([
      fetch(`/api/tax-intake/${engagementId}/state`, { cache: 'no-store' }),
      fetch(`/api/tax-intake/${engagementId}/review`, { cache: 'no-store' }),
      fetch(`/api/tax-intake/${engagementId}/preparer-notes`, { cache: 'no-store' }),
      fetch(`/api/tax-intake/${engagementId}/submit`, { cache: 'no-store' }),
    ]);
    if (!s.ok) { setError(s.status === 401 ? 'You do not have access to this form.' : 'Could not load this form.'); return; }
    setState(await s.json());
    if (r.ok) setItems((await r.json()).reviewItems || []);
    if (n.ok) setNotes((await n.json()).notes || []);
    if (v.ok) setSubs(await v.json());
  }, [engagementId]);
  useEffect(() => { load().catch(() => setError('Could not load this form.')); }, [load]);

  const ctx: Ctx | null = useMemo(() => state && ({ year: Number(state.engagement.taxYear) || 2025, answers: state.answers, records: state.records, province: state.engagement.province, filingType: state.engagement.filingType }), [state]);
  const uploads: UploadedDoc[] = useMemo(() => (state?.documents ?? []).map((d: any) => ({ id: d.id, docKey: d.doc_key, questionId: d.question_id, recordIndex: d.record_index ?? 0, fileName: d.file_name, taxYear: d.tax_year, slipStatus: d.slip_status, issuer: d.issuer, hash: d.content_hash })), [state]);
  const findings: Finding[] = useMemo(() => (ctx ? validate(cat, ctx, { uploads }) : []), [ctx, uploads]);
  const pkg: Package | null = useMemo(() => (ctx ? buildPackage(cat, ctx, { lang: 'en', uploads, findings, taxpayer: state?.engagement?.taxpayerName }) : null), [ctx, uploads, findings, state]);
  const slots = useMemo(() => (ctx ? applicable(cat, ctx) : []), [ctx]);
  const prog = useMemo(() => (ctx ? progress(cat, ctx, slots) : null), [ctx, slots]);
  const docs = useMemo(() => (ctx ? checklist(cat, ctx, uploads, slots) : []), [ctx, uploads, slots]);
  useEffect(() => { if (pkg && !modCode && pkg.modules[0]) setModCode(pkg.modules[0].code); }, [pkg, modCode]);

  const setStatus = async (status: string) => { setBusy(status); await fetch(`/api/tax-intake/${engagementId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) }); await load(); setBusy(''); };
  const itemFor = (key: string) => items.find((i) => i.dedupe_key === key);
  const setItem = async (id: string, status: string, preparerNote?: string) => { await fetch(`/api/tax-intake/${engagementId}/review`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status, preparerNote }) }); await load(); };
  const addNote = async () => { if (!noteText.trim()) return; await fetch(`/api/tax-intake/${engagementId}/preparer-notes`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ note: noteText }) }); setNoteText(''); await load(); };
  const verify = async (docId: string, uploadStatus: string, preparerNote?: string) => { await fetch(`/api/tax-intake/${engagementId}/documents`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ docId, uploadStatus, preparerNote }) }); await load(); };
  const showHistory = async (q: string, rec: number) => { const r = await fetch(`/api/tax-intake/${engagementId}/history?questionId=${encodeURIComponent(q)}&recordIndex=${rec}`); setHistory({ q, rec, rows: r.ok ? (await r.json()).history : [] }); };

  if (error) return <div className="min-h-[70vh] bg-slate-50 text-slate-800 p-8">{error} <Link className="underline text-indigo-700" href="/dashboard/tax-intake">Back to the list</Link></div>;
  if (!state || !pkg || !prog || !ctx) return <div className="min-h-[70vh] bg-slate-50 text-slate-700 p-8">Loading…</div>;
  const e = state.engagement;
  const counts = countFindings(findings);
  const tabs: { id: Tab; label: string; badge?: number }[] = [
    { id: 'summary', label: 'Summary' }, { id: 'answers', label: 'Answers' }, { id: 'attention', label: 'Needs attention', badge: counts.blocking + counts.specialist + counts.warning },
    { id: 'documents', label: 'Documents', badge: docs.filter((d) => d.status !== 'received' && !d.optional).length }, { id: 'notes', label: 'Notes' }, { id: 'versions', label: 'Versions and export', badge: subs.length },
  ];
  const mod = pkg.modules.find((m) => m.code === modCode) ?? pkg.modules[0];
  const docsFor = (q: string, rec: number) => state.documents.filter((d: any) => d.question_id === q && (d.record_index ?? 0) === rec);
  const rowsDisplay = (r: PackageRow) => (mask && r.sens === 'restricted' && r.value ? `*** *** ${r.value.replace(/\D/g, '').slice(-3)}` : r.value);

  return (
    <div className="min-h-[70vh] bg-slate-50 text-slate-900">
      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <Link href="/dashboard/tax-intake" className="text-xs text-slate-600 hover:text-slate-900">← All T1 returns</Link>
            <h1 className="text-2xl font-bold">{e.taxpayerName || e.clientName} <span className="text-slate-600 font-normal">· T1 {e.taxYear}</span></h1>
            <p className="text-xs text-slate-600">{e.province || 'Province not chosen yet'} · form version {e.catalogueVersion || '—'} · {STATUS_LABEL[e.status] || e.status} · language {e.language?.toUpperCase()}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href={`/dashboard/tax-intake/${engagementId}/fill`} className={`${btn} inline-flex items-center gap-1`}><Pencil className="w-3 h-3" />Edit answers for the client</Link>
            {['submitted', 'under_review', 'reviewed'].includes(e.status) && <button className={`${btn} inline-flex items-center gap-1`} disabled={!!busy} onClick={() => setStatus('returned_to_client')}><Undo2 className="w-3 h-3" />Reopen for the client</button>}
            {e.status === 'submitted' && <button className={btn} onClick={() => setStatus('under_review')}>Start review</button>}
            {e.status === 'under_review' && <button className={btn} onClick={() => setStatus('reviewed')}>Mark reviewed</button>}
          </div>
        </div>

        <div role="tablist" className="flex flex-wrap gap-1 border-b border-slate-200">
          {tabs.map((t) => <button key={t.id} role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)} className={`px-4 py-2 text-sm font-semibold border-b-2 -mb-px ${tab === t.id ? 'border-indigo-500 text-slate-900' : 'border-transparent text-slate-600 hover:text-slate-800'}`}>{t.label}{t.badge ? <span className="ml-2 text-[10px] bg-slate-200 text-slate-800 rounded-full px-1.5 py-0.5">{t.badge}</span> : null}</button>)}
        </div>

        {tab === 'summary' && (
          <div className="grid md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
                <div className="flex justify-between text-sm"><span className="font-semibold">Progress on required answers</span><span>{prog.overall.requiredAnswered} / {prog.overall.required} ({prog.overall.percent}%)</span></div>
                <div className="h-2 rounded-full bg-slate-200 overflow-hidden"><div className="h-full bg-indigo-500" style={{ width: `${prog.overall.percent}%` }} /></div>
                {pkg.summary.map((s, i) => <p key={i} className="text-sm text-slate-700">{s}</p>)}
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <h2 className="text-sm font-bold mb-3">Parts of the form that apply</h2>
                <table className="w-full text-sm"><thead><tr className="text-left text-xs text-slate-600"><th className="pb-2">Part</th><th className="px-3">Status</th><th className="px-3 text-right">Answered</th><th className="px-3 text-right">Missing</th><th className="px-3 text-right">Flagged</th></tr></thead>
                  <tbody className="divide-y divide-slate-200">
                    {pkg.modules.map((m) => <tr key={m.code} className="cursor-pointer hover:bg-slate-50" onClick={() => { setModCode(m.code); setTab('answers'); }}><td className="py-2">{m.code}. {m.title}</td><td className="px-3">{STATUS_LABEL[m.status] || m.status}</td><td className="px-3 text-right">{m.counts.answered}/{m.counts.applicable}</td><td className="px-3 text-right">{m.counts.missing || ''}</td><td className="px-3 text-right">{m.counts.unsure + m.counts.ask + m.counts.later || ''}</td></tr>)}
                  </tbody></table>
              </div>
            </div>
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-2 text-sm">
                <h2 className="text-sm font-bold">Open items</h2>
                {(['blocking', 'specialist', 'warning', 'info'] as const).map((k) => <div key={k} className="flex justify-between"><span>{k === 'blocking' ? 'Missing / must fix' : k === 'specialist' ? 'For a specialist' : k === 'warning' ? 'To check' : 'For information'}</span><span className={`px-2 rounded-full border text-xs ${SEV_TONE[k]}`}>{counts[k]}</span></div>)}
                <button className={`${btn} mt-2`} onClick={() => setTab('attention')}>Open the list</button>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-2 text-xs text-slate-700">
                <h2 className="text-sm font-bold text-slate-900">Rules for {e.taxYear}</h2>
                {unverifiedRules(Number(e.taxYear)).length === 0 ? <p className="text-emerald-700">Every limit and date used is verified for this year.</p> : unverifiedRules(Number(e.taxYear)).map((u, i) => <p key={i} className="text-amber-700">{u.label[0]}: {u.reason[0]}</p>)}
              </div>
              {state.legacy.length > 0 && <div className="rounded-2xl border border-slate-200 bg-white p-5 text-xs text-slate-700"><h2 className="text-sm font-bold text-slate-900 mb-1">From an earlier version of the form</h2><p>{state.legacy.length} answers were saved before this detailed form and are kept. They are listed under Versions and export.</p></div>}
            </div>
          </div>
        )}

        {tab === 'answers' && (
          <div className="grid md:grid-cols-[240px_1fr] gap-5">
            <nav aria-label="Parts of the form" className="space-y-1">
              {pkg.modules.map((m) => <button key={m.code} onClick={() => setModCode(m.code)} className={`w-full text-left text-sm rounded-lg px-3 py-1.5 ${modCode === m.code ? 'bg-indigo-100 text-slate-900' : 'text-slate-700 hover:bg-slate-200'}`}>{m.code}. {m.title}{(m.counts.missing + m.counts.unsure + m.counts.ask) > 0 && <span className="ml-1 text-amber-700">●</span>}</button>)}
              <label className="flex items-center gap-2 text-xs text-slate-600 pt-3 px-3"><input type="checkbox" checked={mask} onChange={(ev) => setMask(ev.target.checked)} />Hide social insurance numbers</label>
            </nav>
            <div className="space-y-4">
              {mod && mod.sections.map((s) => (
                <section key={s.id} className="rounded-2xl border border-slate-200 bg-white p-5">
                  <h3 className="text-sm font-bold text-slate-900 mb-3">{s.title}</h3>
                  {s.records.map((r) => (
                    <div key={r.rec} className="mb-4 last:mb-0">
                      {r.title && <p className="text-sm font-semibold text-indigo-800 mb-1">{r.title}</p>}
                      <table className="w-full text-sm"><tbody className="divide-y divide-slate-200">
                        {r.rows.map((x) => (
                          <tr key={x.qid} className="align-top">
                            <td className="py-1.5 pr-4 w-1/2 text-slate-700">{x.label}{x.required && !x.value && !x.flag && <span className="ml-1 text-rose-700">(missing)</span>}{x.form && <span className="ml-2 text-[10px] text-slate-500">{x.form}{x.mapVerified === false ? ' · box unverified' : ''}</span>}</td>
                            <td className="py-1.5 text-slate-900 break-words">
                              {rowsDisplay(x) || <span className="text-slate-400">—</span>}
                              {x.flag && <span className={`ml-2 text-[10px] px-1.5 py-0.5 rounded-full border ${x.flag === 'ask' ? 'text-sky-700 border-sky-300' : x.flag === 'later' ? 'text-violet-700 border-violet-300' : 'text-amber-700 border-amber-300'}`}>{x.flag === 'ask' ? 'client question' : x.flag === 'later' ? 'to provide later' : 'not sure'}</span>}
                              {x.note && <p className="text-xs text-sky-800 mt-0.5">“{x.note}”</p>}
                              {docsFor(x.qid, x.rec).map((d: any) => <a key={d.id} className="block text-xs text-indigo-700 hover:text-indigo-800 mt-0.5" target="_blank" rel="noreferrer" href={`/api/documents/${d.document_file_id}/download`}><FileText className="inline w-3 h-3 mr-1" />{d.file_name}{d.upload_status === 'verified' ? ' ✓' : d.upload_status === 'rejected' ? ' ✗' : ''}</a>)}
                            </td>
                            <td className="py-1.5 w-8 text-right"><button title="Change history" aria-label="Change history" className="text-slate-500 hover:text-slate-800" onClick={() => showHistory(x.qid, x.rec)}><History className="w-3.5 h-3.5" /></button></td>
                          </tr>))}
                      </tbody></table>
                    </div>))}
                </section>))}
              {history && (
                <div role="dialog" aria-label="Change history" className="fixed inset-0 bg-black/60 z-30 flex items-center justify-center p-4" onClick={() => setHistory(null)}>
                  <div className="bg-white border border-slate-300 rounded-2xl p-5 max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={(ev) => ev.stopPropagation()}>
                    <h3 className="font-bold mb-1">Change history</h3><p className="text-xs text-slate-600 mb-3">{history.q} · record {history.rec + 1}</p>
                    {history.rows.length === 0 && <p className="text-sm text-slate-600">No changes recorded.</p>}
                    <ul className="space-y-2 text-sm">{history.rows.map((h, i) => <li key={i} className="border-b border-slate-200 pb-2"><span className="text-slate-600 text-xs">{new Date(h.changed_at).toLocaleString()} · {h.changed_by_name || h.changed_by_role} ({h.changed_by_role}){h.action === 'removed' ? ' · removed' : ''}</span><br />{h.value ?? <span className="text-slate-400">(empty)</span>}{h.flag ? <span className="text-amber-700"> · {h.flag}</span> : null}</li>)}</ul>
                    <button className={`${btn} mt-4`} onClick={() => setHistory(null)}>Close</button>
                  </div>
                </div>)}
            </div>
          </div>
        )}

        {tab === 'attention' && (
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-xs text-slate-600"><input type="checkbox" checked={showResolved} onChange={(ev) => setShowResolved(ev.target.checked)} />Show items already resolved or deferred</label>
            {findings.length === 0 && <p className="text-sm text-emerald-700 flex items-center gap-2"><CheckCircle2 className="w-4 h-4" />Nothing needs attention.</p>}
            {(['blocking', 'specialist', 'warning', 'info'] as const).map((sev) => {
              const list = findings.filter((f) => f.sev === sev).filter((f) => showResolved || !['resolved', 'deferred'].includes(itemFor(f.key)?.status));
              if (!list.length) return null;
              return (
                <section key={sev} className="rounded-2xl border border-slate-200 bg-white p-5">
                  <h3 className={`inline-block text-xs font-bold px-2 py-0.5 rounded-full border ${SEV_TONE[sev]} mb-3`}>{sev === 'blocking' ? 'Missing or must fix' : sev === 'specialist' ? 'For a specialist' : sev === 'warning' ? 'To check' : 'For information'} · {list.length}</h3>
                  <ul className="space-y-3">
                    {list.map((f) => { const it = itemFor(f.key); return (
                      <li key={f.key} className="text-sm border-b border-slate-200 pb-3 last:border-0">
                        <p className="text-slate-900">{f.title[0]}</p>
                        {f.specialist && <p className="text-xs text-fuchsia-700 mt-0.5"><ShieldAlert className="inline w-3 h-3 mr-1" />{f.specialist}</p>}
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          {f.mod && <button className={btn} onClick={() => { setModCode(f.mod!); setTab('answers'); }}>Go to answers</button>}
                          {it ? (
                            <>
                              <span className="text-xs text-slate-600">{it.status}</span>
                              {it.status !== 'resolved' && <button className={btn} onClick={() => setItem(it.id, 'resolved')}>Resolve</button>}
                              {it.status !== 'deferred' && it.status !== 'resolved' && <button className={btn} onClick={() => setItem(it.id, 'deferred')}>Defer</button>}
                              {(it.status === 'resolved' || it.status === 'deferred') && <button className={btn} onClick={() => setItem(it.id, 'open')}>Reopen</button>}
                              <input className="flex-1 min-w-[200px] rounded-lg bg-slate-50 border border-slate-300 px-2 py-1 text-xs" placeholder="Note for the file" defaultValue={it.preparer_note ?? ''} onBlur={(ev) => ev.target.value !== (it.preparer_note ?? '') && setItem(it.id, it.status, ev.target.value)} />
                            </>) : <span className="text-xs text-slate-500">saving…</span>}
                        </div>
                      </li>); })}
                  </ul>
                </section>);
            })}
          </div>
        )}

        {tab === 'documents' && (
          <div className="grid md:grid-cols-2 gap-4">
            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="text-sm font-bold mb-3">Expected documents</h3>
              {docs.length === 0 && <p className="text-sm text-slate-600">None expected yet.</p>}
              <ul className="divide-y divide-slate-200 text-sm">{docs.map((d, i) => <li key={i} className="py-2 flex justify-between gap-3"><span>{d.label[0]}{d.recLabel ? <span className="text-slate-500"> · {d.recLabel}</span> : null}{d.optional ? <span className="text-slate-500"> (optional)</span> : null}</span><span className={`text-xs px-2 py-0.5 rounded-full border ${d.status === 'received' ? 'text-emerald-700 border-emerald-300' : d.status === 'later' ? 'text-violet-700 border-violet-300' : 'text-slate-700 border-slate-300'}`}>{d.status}</span></li>)}</ul>
            </section>
            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="text-sm font-bold mb-3">Uploaded files</h3>
              {state.documents.length === 0 && <p className="text-sm text-slate-600">No files uploaded.</p>}
              <ul className="space-y-3 text-sm">{state.documents.map((d: any) => (
                <li key={d.id} className="border-b border-slate-200 pb-3 last:border-0">
                  <a className="text-indigo-700 hover:text-indigo-800" target="_blank" rel="noreferrer" href={`/api/documents/${d.document_file_id}/download`}>{d.file_name}</a>
                  <p className="text-xs text-slate-600">{d.doc_key || d.question_id}{d.issuer ? ` · ${d.issuer}` : ''}{d.tax_year ? ` · ${d.tax_year}` : ''}{d.slip_status ? ` · ${d.slip_status}` : ''} · {(d.file_size_bytes / 1024).toFixed(0)} KB · {d.upload_status}</p>
                  <div className="flex gap-2 mt-1"><button className={btn} onClick={() => verify(d.id, 'verified')}>Verified</button><button className={btn} onClick={() => verify(d.id, 'rejected')}>Reject</button>{d.upload_status !== 'uploaded' && <button className={btn} onClick={() => verify(d.id, 'uploaded')}>Reset</button>}</div>
                </li>))}</ul>
            </section>
          </div>
        )}

        {tab === 'notes' && (
          <div className="max-w-3xl space-y-3">
            <p className="text-xs text-slate-600 flex items-center gap-1"><Lock className="w-3 h-3" />Internal. The client never sees these notes.</p>
            <textarea className="w-full rounded-lg bg-slate-50 border border-slate-300 p-3 text-sm" rows={3} placeholder="Add internal preparer note…" value={noteText} onChange={(ev) => setNoteText(ev.target.value)} />
            <button className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-sm font-semibold" onClick={addNote}>Add Note</button>
            <ul className="space-y-2">{notes.map((n) => <li key={n.id} className="rounded-xl border border-slate-200 bg-white p-3 text-sm"><p>{n.note}</p><p className="text-[11px] text-slate-500 mt-1">{new Date(n.created_at).toLocaleString()}</p></li>)}</ul>
          </div>
        )}

        {tab === 'versions' && (
          <div className="grid md:grid-cols-2 gap-4">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
              <h3 className="text-sm font-bold">Export the current answers</h3>
              <label className="flex items-center gap-2 text-xs text-slate-700"><input type="checkbox" checked={mask} onChange={(ev) => setMask(ev.target.checked)} />Hide social insurance numbers in the file</label>
              <div className="flex flex-wrap gap-2">
                {[['csv', 'Spreadsheet (CSV)'], ['text', 'Printable text'], ['json', 'Full data (JSON)']].map(([f, l]) => <a key={f} className={`${btn} inline-flex items-center gap-1`} href={`/api/tax-intake/${engagementId}/package?format=${f}${mask ? '' : '&mask=0'}`}><Download className="w-3 h-3" />{l}</a>)}
                <a className={`${btn} inline-flex items-center gap-1`} href={`/api/tax-intake/${engagementId}/package?format=text&lang=fr${mask ? '' : '&mask=0'}`}><Download className="w-3 h-3" />Texte (français)</a>
              </div>
            </section>
            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="text-sm font-bold mb-3">Frozen submissions</h3>
              {subs.length === 0 && <p className="text-sm text-slate-600">Not submitted yet.</p>}
              <ul className="space-y-2 text-sm">{subs.map((s: any) => <li key={s.id} className="flex justify-between gap-2 border-b border-slate-200 pb-2"><span>Version {s.version_number} · {new Date(s.submitted_at).toLocaleString()}<span className="block text-xs text-slate-600">by {s.submitted_by} · form {s.catalogue_version || 'earlier'} · {s.language || 'en'}</span></span><a className={btn} href={`/api/tax-intake/${engagementId}/submit?id=${s.id}`} target="_blank" rel="noreferrer">Open</a></li>)}</ul>
            </section>
            {state.legacy.length > 0 && (
              <section className="md:col-span-2 rounded-2xl border border-slate-200 bg-white p-5">
                <h3 className="text-sm font-bold mb-2">Answers from an earlier version of the form (kept, not shown on the new form)</h3>
                <ul className="text-xs text-slate-700 space-y-1">{state.legacy.map((l: any, i: number) => <li key={i}>{l.questionId}{l.recordIndex ? ` #${l.recordIndex + 1}` : ''}: {typeof l.value === 'object' ? JSON.stringify(l.value) : String(l.value ?? '')}{l.flag ? ` [${l.flag}]` : ''}</li>)}</ul>
              </section>)}
          </div>
        )}
      </div>
    </div>
  );
}
