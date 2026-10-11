'use client';
import React, { useRef, useState } from 'react';
import { HelpCircle, Upload, Trash2, Plus, Clock, MessageSquare, Eye, EyeOff, FileText, Info } from 'lucide-react';
import type { Answer, AnswerValue, Ctx, Lang, Question, RowValue, UploadedDoc } from '@/lib/t1/types';
import { questionProblems } from '@/lib/t1/validate';
import { text } from '@/lib/t1/package';
import { tt } from './ui-text';

export interface FieldProps {
  q: Question; rec: number; lang: Lang; ctx: Ctx; answer?: Answer; required: boolean; editable: boolean;
  docs: any[]; findingsHere: { sev: string; title: [string, string] }[];
  onValue: (v: AnswerValue | null) => void; onFlag: (f: 'unsure' | 'later' | 'ask' | null, note?: string) => void;
  onUpload: (file: File, meta: { docKey?: string; issuer?: string; taxYear?: string; slipStatus?: string }) => Promise<string | null>;
  onRemoveDoc: (id: string) => Promise<boolean>;
  siblingValue: (local: string) => AnswerValue | undefined;
}

const input = 'w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60';
const chip = (on: boolean, tone: string) => `px-2.5 py-1 rounded-md text-xs font-semibold border transition ${on ? tone : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-slate-100 hover:border-slate-500'}`;
export const fmtSin = (v: string) => { const d = v.replace(/\D/g, '').slice(0, 9); return [d.slice(0, 3), d.slice(3, 6), d.slice(6, 9)].filter(Boolean).join(' '); };

function Rows({ q, lang, value, onChange, editable }: { q: Question; lang: Lang; value: AnswerValue | undefined; onChange: (v: AnswerValue | null) => void; editable: boolean }) {
  const rows = (Array.isArray(value) ? (value as RowValue[]) : []) as RowValue[];
  const cols = q.cols ?? [];
  const set = (i: number, id: string, v: string) => { const next = rows.map((r, k) => (k === i ? { ...r, [id]: v } : r)); onChange(next); };
  return (
    <div className="space-y-2">
      {rows.map((r, i) => (
        <div key={i} className="grid gap-2 rounded-lg border border-slate-800 bg-slate-950/50 p-2" style={{ gridTemplateColumns: `repeat(${Math.min(cols.length, 3)}, minmax(0, 1fr))` }}>
          {cols.map((c) => (
            <label key={c.id} className="text-[11px] text-slate-400 space-y-1">
              <span>{c.t[lang === 'fr' ? 1 : 0]}</span>
              {c.type === 'select' ? (
                <select className={input} disabled={!editable} value={String(r[c.id] ?? '')} onChange={(e) => set(i, c.id, e.target.value)}>
                  <option value="">{tt(lang, 'select')}</option>
                  {c.opts?.map((o) => <option key={o.v} value={o.v}>{o[lang]}</option>)}
                </select>
              ) : (
                <input className={input} disabled={!editable} type={c.type === 'date' ? 'date' : 'text'} inputMode={c.type === 'currency' || c.type === 'number' ? 'decimal' : undefined} value={String(r[c.id] ?? '')} onChange={(e) => set(i, c.id, e.target.value)} />
              )}
            </label>
          ))}
          {editable && <button type="button" className="text-xs text-rose-400 hover:text-rose-300 text-left self-end pb-2" onClick={() => onChange(rows.filter((_, k) => k !== i))}>{tt(lang, 'removeRow')}</button>}
        </div>
      ))}
      {editable && <button type="button" className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-300 hover:text-indigo-200" onClick={() => onChange([...rows, {}])}><Plus className="w-3 h-3" />{tt(lang, 'addRow')}</button>}
    </div>
  );
}

function FileField({ q, rec, lang, ctx, docs, editable, onUpload, onRemoveDoc, siblingValue }: Pick<FieldProps, 'q' | 'rec' | 'lang' | 'ctx' | 'docs' | 'editable' | 'onUpload' | 'onRemoveDoc' | 'siblingValue'>) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const mine = docs.filter((d) => d.question_id === q.id && (d.record_index ?? 0) === rec);
  const pick = async (f: File | undefined) => {
    if (!f) return;
    setBusy(true); setErr('');
    const issuer = siblingValue('issuer'), year = siblingValue('year'), status = siblingValue('status');
    const e = await onUpload(f, { docKey: q.docs?.[0]?.key, issuer: typeof issuer === 'string' ? issuer : undefined, taxYear: typeof year === 'string' ? year : String(ctx.year), slipStatus: typeof status === 'string' ? status : undefined });
    setBusy(false); if (e) setErr(e); if (ref.current) ref.current.value = '';
  };
  return (
    <div className="space-y-2">
      {mine.map((d) => (
        <div key={d.id} className="flex items-center justify-between gap-2 rounded-lg border border-slate-800 bg-slate-950/50 px-3 py-2 text-xs">
          <span className="flex items-center gap-2 text-slate-200 min-w-0"><FileText className="w-4 h-4 text-indigo-300 shrink-0" /><span className="truncate">{d.file_name}</span><span className="text-slate-500 shrink-0">{(d.file_size_bytes / 1024).toFixed(0)} KB</span></span>
          <span className="flex items-center gap-3 shrink-0">
            {d.document_file_id && <a className="text-indigo-300 hover:text-indigo-200" href={`/api/documents/${d.document_file_id}/download`} target="_blank" rel="noreferrer">{tt(lang, 'view')}</a>}
            {editable && <button type="button" className="text-rose-400 hover:text-rose-300" onClick={() => onRemoveDoc(d.id)}>{tt(lang, 'remove')}</button>}
          </span>
        </div>
      ))}
      {editable && (
        <>
          <input ref={ref} type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png,.csv,.txt,.docx,.xlsx" onChange={(e) => pick(e.target.files?.[0])} />
          <button type="button" disabled={busy} className="inline-flex items-center gap-2 rounded-lg border border-dashed border-slate-600 px-3 py-2 text-xs font-semibold text-slate-200 hover:border-indigo-400 hover:text-white disabled:opacity-60" onClick={() => ref.current?.click()}>
            <Upload className="w-4 h-4" />{busy ? tt(lang, 'uploading') : tt(lang, 'upload')}
          </button>
          <p className="text-[11px] text-slate-500">PDF, JPEG, PNG · 4 MB</p>
        </>
      )}
      {err && <p role="alert" className="text-xs text-rose-300">{err}</p>}
    </div>
  );
}

export function Field(p: FieldProps) {
  const { q, lang, answer, editable } = p;
  const [showSin, setShowSin] = useState(false);
  const [showWhy, setShowWhy] = useState(false);
  const [asking, setAsking] = useState(false);
  const v = answer?.v;
  const id = `f-${q.id}-${p.rec}`;
  const label = text(q.text, lang, p.ctx.year);
  const problems = questionProblems(q, v, p.ctx, p.rec);
  const flag = answer?.flag;
  const str = typeof v === 'string' || typeof v === 'number' ? String(v) : '';

  if (q.type === 'info') {
    return <div className="flex gap-2 rounded-lg border border-slate-800 bg-slate-950/40 p-3 text-xs text-slate-300 leading-relaxed"><Info className="w-4 h-4 text-indigo-300 shrink-0 mt-0.5" /><span>{label}{q.help ? <><br /><span className="text-slate-400">{text(q.help, lang, p.ctx.year)}</span></> : null}</span></div>;
  }

  const canUnsure = !q.noUnsure && q.type !== 'yn' && q.type !== 'file' && q.type !== 'rows';
  const canLater = !q.noLater;
  const canAsk = !q.noAsk;
  const tone = flag === 'ask' ? 'border-sky-500/50' : flag === 'unsure' ? 'border-amber-500/50' : flag === 'later' ? 'border-violet-500/50' : problems.length ? 'border-rose-500/50' : 'border-slate-800';

  const control = (() => {
    switch (q.type) {
      case 'yn':
        return (
          <div role="radiogroup" aria-labelledby={`${id}-l`} className="flex flex-wrap gap-2">
            {(['yes', 'no', 'unsure'] as const).map((o) => (
              <button key={o} type="button" role="radio" aria-checked={v === o} disabled={!editable} onClick={() => p.onValue(v === o ? null : o)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold border transition disabled:opacity-60 ${v === o ? (o === 'unsure' ? 'bg-amber-500/20 text-amber-200 border-amber-500/50' : 'bg-indigo-600 text-white border-indigo-400') : 'bg-slate-950 text-slate-300 border-slate-700 hover:border-slate-500'}`}>
                {tt(lang, o)}
              </button>
            ))}
          </div>
        );
      case 'radio':
        return (
          <div role="radiogroup" aria-labelledby={`${id}-l`} className="space-y-1.5">
            {q.opts?.map((o) => (
              <label key={o.v} className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-sm cursor-pointer ${v === o.v ? 'border-indigo-400 bg-indigo-500/10 text-white' : 'border-slate-700 text-slate-300 hover:border-slate-500'}`}>
                <input type="radio" name={id} className="mt-1" disabled={!editable} checked={v === o.v} onChange={() => p.onValue(o.v)} />
                <span>{o[lang]}</span>
              </label>
            ))}
          </div>
        );
      case 'select':
        return (
          <select id={id} className={input} disabled={!editable} value={str} onChange={(e) => p.onValue(e.target.value || null)}>
            <option value="">{tt(lang, 'select')}</option>
            {q.opts?.map((o) => <option key={o.v} value={o.v}>{o[lang]}</option>)}
          </select>
        );
      case 'multi': {
        const sel = Array.isArray(v) ? (v as string[]).map(String) : [];
        return (
          <div className="space-y-1.5" role="group" aria-labelledby={`${id}-l`}>
            {q.opts?.map((o) => (
              <label key={o.v} className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-sm cursor-pointer ${sel.includes(o.v) ? 'border-indigo-400 bg-indigo-500/10 text-white' : 'border-slate-700 text-slate-300 hover:border-slate-500'}`}>
                <input type="checkbox" className="mt-1" disabled={!editable} checked={sel.includes(o.v)} onChange={(e) => { const next = e.target.checked ? [...sel, o.v] : sel.filter((x) => x !== o.v); p.onValue(next.length ? next : null); }} />
                <span>{o[lang]}</span>
              </label>
            ))}
          </div>
        );
      }
      case 'long_text':
        return <textarea id={id} rows={3} className={input} disabled={!editable} value={str} placeholder={q.ph} onChange={(e) => p.onValue(e.target.value)} />;
      case 'currency':
        return (
          <div className="relative">
            <span className="absolute left-3 top-2 text-sm text-slate-500">$</span>
            <input id={id} className={`${input} pl-7`} inputMode="decimal" disabled={!editable} value={str} placeholder={q.ph ?? '0.00'} onChange={(e) => p.onValue(e.target.value.replace(/[^\d.,\-]/g, ''))} />
          </div>
        );
      case 'percentage':
        return <div className="relative"><input id={id} className={`${input} pr-8`} inputMode="decimal" disabled={!editable} value={str} onChange={(e) => p.onValue(e.target.value.replace(/[^\d.,]/g, ''))} /><span className="absolute right-3 top-2 text-sm text-slate-500">%</span></div>;
      case 'number':
        return <input id={id} className={input} inputMode="decimal" disabled={!editable} value={str} placeholder={q.ph} onChange={(e) => p.onValue(e.target.value.replace(/[^\d.,\-]/g, ''))} />;
      case 'date':
        return <input id={id} type="date" className={input} disabled={!editable} value={str} onChange={(e) => p.onValue(e.target.value || null)} />;
      case 'sin':
        return (
          <div className="flex gap-2">
            <input id={id} className={`${input} tracking-widest`} type={showSin ? 'text' : 'password'} autoComplete="off" inputMode="numeric" disabled={!editable} value={showSin ? fmtSin(str) : str} placeholder="000 000 000" onChange={(e) => p.onValue(fmtSin(e.target.value))} />
            <button type="button" className="px-3 rounded-lg border border-slate-700 text-slate-300 hover:text-white" aria-label={showSin ? tt(lang, 'hideSin') : tt(lang, 'showSin')} onClick={() => setShowSin(!showSin)}>{showSin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
          </div>
        );
      case 'phone':
        return <input id={id} type="tel" className={input} disabled={!editable} value={str} placeholder="(416) 555-0123" onChange={(e) => p.onValue(e.target.value)} />;
      case 'email':
        return <input id={id} type="email" className={input} disabled={!editable} value={str} placeholder="name@example.com" onChange={(e) => p.onValue(e.target.value)} />;
      case 'postal':
        return <input id={id} className={`${input} uppercase`} autoComplete="postal-code" disabled={!editable} value={str} placeholder="M5V 2T6" onChange={(e) => p.onValue(e.target.value.toUpperCase())} />;
      case 'file':
        return <FileField q={q} rec={p.rec} lang={lang} ctx={p.ctx} docs={p.docs} editable={editable} onUpload={p.onUpload} onRemoveDoc={p.onRemoveDoc} siblingValue={p.siblingValue} />;
      case 'rows':
        return <Rows q={q} lang={lang} value={v} onChange={p.onValue} editable={editable} />;
      default:
        return <input id={id} className={input} disabled={!editable} value={str} placeholder={q.ph} onChange={(e) => p.onValue(e.target.value)} />;
    }
  })();

  return (
    <div className={`rounded-xl border ${tone} bg-slate-950/40 p-4 space-y-3`} data-q={q.id} data-rec={p.rec}>
      <div className="space-y-1">
        <label id={`${id}-l`} htmlFor={id} className="block text-sm font-semibold text-slate-100">
          {label}
          {p.required ? <span className="ml-1 text-rose-400" aria-label={tt(lang, 'required')}>*</span> : null}
          {q.sens === 'restricted' ? <span className="ml-2 px-1.5 py-0.5 text-[10px] rounded bg-rose-500/15 text-rose-300 border border-rose-500/30 font-bold align-middle">{lang === 'fr' ? 'Protégé' : 'Protected'}</span> : null}
        </label>
        {q.help ? <p className="text-xs text-slate-400 leading-relaxed">{text(q.help, lang, p.ctx.year)}</p> : null}
        {q.why ? (
          <div>
            <button type="button" className="inline-flex items-center gap-1 text-[11px] text-indigo-300 hover:text-indigo-200" aria-expanded={showWhy} onClick={() => setShowWhy(!showWhy)}><HelpCircle className="w-3 h-3" />{tt(lang, 'why')}</button>
            {showWhy ? <p className="mt-1 text-xs text-slate-300 bg-slate-900 rounded-lg p-2 leading-relaxed">{text(q.why, lang, p.ctx.year)}</p> : null}
          </div>
        ) : null}
      </div>

      {flag === 'later' && q.type !== 'file' ? <p className="text-xs text-violet-300">{tt(lang, 'laterShort')}</p> : control}
      {flag === 'later' && q.type === 'file' ? <><p className="text-xs text-violet-300">{tt(lang, 'laterShort')}</p>{control}</> : null}

      {problems.map((m, i) => <p key={i} role="alert" className="text-xs text-rose-300">{m[lang === 'fr' ? 1 : 0]}</p>)}
      {p.findingsHere.filter((f) => f.sev === 'blocking').slice(0, 2).map((f, i) => <p key={`f${i}`} className="text-xs text-amber-300">{f.title[lang === 'fr' ? 1 : 0]}</p>)}

      {editable && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {canUnsure && <button type="button" aria-pressed={flag === 'unsure'} className={chip(flag === 'unsure', 'bg-amber-500/20 text-amber-200 border-amber-500/50')} onClick={() => p.onFlag(flag === 'unsure' ? null : 'unsure')}>{tt(lang, 'unsure')}</button>}
          {canLater && <button type="button" aria-pressed={flag === 'later'} className={`${chip(flag === 'later', 'bg-violet-500/20 text-violet-200 border-violet-500/50')} inline-flex items-center gap-1`} onClick={() => p.onFlag(flag === 'later' ? null : 'later')}><Clock className="w-3 h-3" />{tt(lang, 'later')}</button>}
          {canAsk && <button type="button" aria-pressed={flag === 'ask'} className={`${chip(flag === 'ask', 'bg-sky-500/20 text-sky-200 border-sky-500/50')} inline-flex items-center gap-1`} onClick={() => { if (flag === 'ask') { p.onFlag(null); setAsking(false); } else { setAsking(true); p.onFlag('ask', answer?.note ?? ''); } }}><MessageSquare className="w-3 h-3" />{tt(lang, 'ask')}</button>}
        </div>
      )}
      {(flag === 'ask' || asking) && (
        <textarea rows={2} className={input} disabled={!editable} aria-label={tt(lang, 'askNote')} placeholder={tt(lang, 'askNote')} value={answer?.note ?? ''} onChange={(e) => p.onFlag('ask', e.target.value)} />
      )}
    </div>
  );
}
