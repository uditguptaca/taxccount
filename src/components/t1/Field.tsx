'use client';
import React, { useRef, useState } from 'react';
import { HelpCircle, Upload, Plus, Clock, MessageSquare, Eye, EyeOff, FileText, Info, Check, ChevronDown } from 'lucide-react';
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

const input = 'w-full rounded-lg bg-slate-50 border border-slate-300 px-3 py-1.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60';
const chip = (on: boolean, tone: string) => `px-2.5 py-1 rounded-md text-xs font-semibold border transition ${on ? tone : 'bg-white text-slate-600 border-slate-300 hover:text-slate-900 hover:border-slate-400'}`;
export const fmtSin = (v: string) => { const d = v.replace(/\D/g, '').slice(0, 9); return [d.slice(0, 3), d.slice(3, 6), d.slice(6, 9)].filter(Boolean).join(' '); };

function Rows({ q, lang, value, onChange, editable }: { q: Question; lang: Lang; value: AnswerValue | undefined; onChange: (v: AnswerValue | null) => void; editable: boolean }) {
  const rows = (Array.isArray(value) ? (value as RowValue[]) : []) as RowValue[];
  const cols = q.cols ?? [];
  const set = (i: number, id: string, v: string) => { const next = rows.map((r, k) => (k === i ? { ...r, [id]: v } : r)); onChange(next); };
  return (
    <div className="space-y-2">
      {rows.map((r, i) => (
        <div key={i} className="grid gap-2 rounded-lg border border-slate-200 bg-slate-50 p-2" style={{ gridTemplateColumns: `repeat(${Math.min(cols.length, 3)}, minmax(0, 1fr))` }}>
          {cols.map((c) => (
            <label key={c.id} className="text-[11px] text-slate-600 space-y-1">
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
          {editable && <button type="button" className="text-xs text-rose-700 hover:text-rose-700 text-left self-end pb-2" onClick={() => onChange(rows.filter((_, k) => k !== i))}>{tt(lang, 'removeRow')}</button>}
        </div>
      ))}
      {editable && <button type="button" className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-700 hover:text-indigo-800" onClick={() => onChange([...rows, {}])}><Plus className="w-3 h-3" />{tt(lang, 'addRow')}</button>}
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
        <div key={d.id} className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs">
          <span className="flex items-center gap-2 text-slate-800 min-w-0"><FileText className="w-4 h-4 text-indigo-700 shrink-0" /><span className="truncate">{d.file_name}</span><span className="text-slate-500 shrink-0">{(d.file_size_bytes / 1024).toFixed(0)} KB</span></span>
          <span className="flex items-center gap-3 shrink-0">
            {d.document_file_id && <a className="text-indigo-700 hover:text-indigo-800" href={`/api/documents/${d.document_file_id}/download`} target="_blank" rel="noreferrer">{tt(lang, 'view')}</a>}
            {editable && <button type="button" className="text-rose-700 hover:text-rose-700" onClick={() => onRemoveDoc(d.id)}>{tt(lang, 'remove')}</button>}
          </span>
        </div>
      ))}
      {editable && (
        <>
          <input ref={ref} type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png,.csv,.txt,.docx,.xlsx" onChange={(e) => pick(e.target.files?.[0])} />
          <button type="button" disabled={busy} className="inline-flex items-center gap-2 rounded-lg border border-dashed border-slate-300 px-3 py-2 text-xs font-semibold text-slate-800 hover:border-indigo-500 hover:text-slate-900 disabled:opacity-60" onClick={() => ref.current?.click()}>
            <Upload className="w-4 h-4" />{busy ? tt(lang, 'uploading') : tt(lang, 'upload')}
          </button>
          <p className="text-[11px] text-slate-500">PDF, JPEG, PNG · 4 MB</p>
        </>
      )}
      {err && <p role="alert" className="text-xs text-rose-700">{err}</p>}
    </div>
  );
}


/** A yes/no question, or a choice of a few short options, sits on one row: the question left, the answer right. */
export const isRowType = (q: Question) => q.type === 'yn' || (q.type === 'radio' && !!q.opts && q.opts.length <= 4 && q.opts.every((o) => o.en.length <= 38 && o.fr.length <= 46));
/** Short fields share a line on a wide screen; everything else takes the full width. */
export const isWide = (q: Question) => ['long_text', 'multi', 'rows', 'file', 'info', 'radio'].includes(q.type) || q.type === 'yn';

const pill = (on: boolean, warn = false) => `px-3 py-1 rounded-lg text-[13px] font-semibold border transition disabled:opacity-60 ${on ? (warn ? 'bg-amber-100 text-amber-900 border-amber-400' : 'bg-indigo-600 text-white border-indigo-600') : 'bg-white text-slate-700 border-slate-300 hover:border-slate-500'}`;

export function Field(p: FieldProps) {
  const { q, lang, answer, editable } = p;
  const [showSin, setShowSin] = useState(false);
  const [open, setOpen] = useState(false);
  const v = answer?.v;
  const id = `f-${q.id}-${p.rec}`;
  const L = lang === 'fr' ? 1 : 0;
  const label = text(q.text, lang, p.ctx.year);
  const help = q.help ? text(q.help, lang, p.ctx.year) : '';
  const why = q.why ? text(q.why, lang, p.ctx.year) : '';
  const problems = questionProblems(q, v, p.ctx, p.rec);
  const flag = answer?.flag;
  const str = typeof v === 'string' || typeof v === 'number' ? String(v) : '';
  const row = isRowType(q);
  const inlineHelp = !row && !!help && help.length <= 120;

  if (q.type === 'info') {
    return <div className="flex gap-2 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-700 leading-snug"><Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" /><span>{label}{help ? <span className="text-slate-600"> {help}</span> : null}</span></div>;
  }

  const canUnsure = !q.noUnsure && q.type !== 'yn' && q.type !== 'file' && q.type !== 'rows';
  const canLater = !q.noLater, canAsk = !q.noAsk;
  const hasPanel = !!(why || (help && !inlineHelp) || canUnsure || canLater || canAsk);

  // the answer control
  const control = (() => {
    switch (q.type) {
      case 'yn':
        return (
          <div role="radiogroup" aria-labelledby={`${id}-l`} className="flex gap-1.5">
            {(['yes', 'no', 'unsure'] as const).map((o) => (
              <button key={o} type="button" role="radio" aria-checked={v === o} disabled={!editable} onClick={() => p.onValue(v === o ? null : o)} className={pill(v === o, o === 'unsure')}>{tt(lang, o)}</button>
            ))}
          </div>
        );
      case 'radio':
        if (row) return (
          <div role="radiogroup" aria-labelledby={`${id}-l`} className="flex flex-wrap gap-1.5">
            {q.opts?.map((o) => <button key={o.v} type="button" role="radio" aria-checked={v === o.v} disabled={!editable} onClick={() => p.onValue(v === o.v ? null : o.v)} className={pill(v === o.v)}>{o[lang]}</button>)}
          </div>
        );
        return (
          <div role="radiogroup" aria-labelledby={`${id}-l`} className="grid gap-1 md:grid-cols-2">
            {q.opts?.map((o) => (
              <label key={o.v} className={`flex items-start gap-2 rounded-lg border px-2.5 py-1.5 text-sm cursor-pointer leading-snug ${v === o.v ? 'border-indigo-500 bg-indigo-50 text-slate-900' : 'border-slate-300 text-slate-700 hover:border-slate-400'}`}>
                <input type="radio" name={id} className="mt-0.5" disabled={!editable} checked={v === o.v} onChange={() => p.onValue(o.v)} />
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
        const long = !!q.opts?.some((o) => o[lang].length > 46);
        const toggle = (o: string, on: boolean) => { const next = on ? [...sel, o] : sel.filter((x) => x !== o); p.onValue(next.length ? next : null); };
        return (
          <div role="group" aria-labelledby={`${id}-l`} className={long ? 'grid gap-1 md:grid-cols-2' : 'flex flex-wrap gap-1.5'}>
            {q.opts?.map((o) => long ? (
              <label key={o.v} className={`flex items-start gap-2 rounded-lg border px-2.5 py-1.5 text-sm cursor-pointer leading-snug ${sel.includes(o.v) ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300 text-slate-700 hover:border-slate-400'}`}>
                <input type="checkbox" className="mt-0.5" disabled={!editable} checked={sel.includes(o.v)} onChange={(e) => toggle(o.v, e.target.checked)} /><span>{o[lang]}</span>
              </label>
            ) : (
              <button key={o.v} type="button" role="checkbox" aria-checked={sel.includes(o.v)} disabled={!editable} onClick={() => toggle(o.v, !sel.includes(o.v))} className={`${pill(sel.includes(o.v))} inline-flex items-center gap-1`}>
                {sel.includes(o.v) && <Check className="w-3.5 h-3.5" />}{o[lang]}
              </button>
            ))}
          </div>
        );
      }
      case 'long_text':
        return <textarea id={id} rows={2} className={input} disabled={!editable} value={str} placeholder={q.ph} onChange={(e) => p.onValue(e.target.value)} />;
      case 'currency':
        return (
          <div className="relative">
            <span className="absolute left-3 top-1.5 text-sm text-slate-500">$</span>
            <input id={id} className={`${input} pl-7`} inputMode="decimal" disabled={!editable} value={str} placeholder={q.ph ?? '0.00'} onChange={(e) => p.onValue(e.target.value.replace(/[^\d.,\-]/g, ''))} />
          </div>
        );
      case 'percentage':
        return <div className="relative"><input id={id} className={`${input} pr-8`} inputMode="decimal" disabled={!editable} value={str} onChange={(e) => p.onValue(e.target.value.replace(/[^\d.,]/g, ''))} /><span className="absolute right-3 top-1.5 text-sm text-slate-500">%</span></div>;
      case 'number':
        return <input id={id} className={input} inputMode="decimal" disabled={!editable} value={str} placeholder={q.ph} onChange={(e) => p.onValue(e.target.value.replace(/[^\d.,\-]/g, ''))} />;
      case 'date':
        return <input id={id} type="date" className={input} disabled={!editable} value={str} onChange={(e) => p.onValue(e.target.value || null)} />;
      case 'sin':
        return (
          <div className="flex gap-2">
            <input id={id} className={`${input} tracking-widest`} type={showSin ? 'text' : 'password'} autoComplete="off" inputMode="numeric" disabled={!editable} value={showSin ? fmtSin(str) : str} placeholder="000 000 000" onChange={(e) => p.onValue(fmtSin(e.target.value))} />
            <button type="button" className="px-2.5 rounded-lg border border-slate-300 text-slate-600 hover:text-slate-900" aria-label={showSin ? tt(lang, 'hideSin') : tt(lang, 'showSin')} onClick={() => setShowSin(!showSin)}>{showSin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
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

  const flagBadge = flag === 'ask' ? ['bg-sky-100 text-sky-800', tt(lang, 'askShort')] : flag === 'later' ? ['bg-violet-100 text-violet-800', tt(lang, 'laterShort')] : flag === 'unsure' && q.type !== 'yn' ? ['bg-amber-100 text-amber-900', tt(lang, 'unsure')] : null;
  const labelEl = (
    <div className="flex items-start gap-1.5 min-w-0">
      <label id={`${id}-l`} htmlFor={id} className="text-sm font-medium text-slate-900 leading-snug">
        {label}
        {p.required ? <span className="ml-1 text-rose-600" aria-label={tt(lang, 'required')}>*</span> : null}
        {q.sens === 'restricted' ? <span className="ml-2 px-1.5 py-0.5 text-[10px] rounded bg-rose-100 text-rose-800 font-bold align-middle">{lang === 'fr' ? 'Protégé' : 'Protected'}</span> : null}
      </label>
      {flagBadge && <span className={`shrink-0 px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${flagBadge[0]}`}>{flagBadge[1]}</span>}
      {hasPanel && editable !== undefined && (
        <button type="button" aria-expanded={open} aria-label={tt(lang, 'moreOptions')} title={tt(lang, 'moreOptions')} onClick={() => setOpen(!open)} className={`shrink-0 -mt-0.5 inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[11px] font-medium ${open ? 'bg-indigo-100 text-indigo-800' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'}`}>
          <HelpCircle className="w-3.5 h-3.5" /><ChevronDown className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
      )}
    </div>
  );

  const panel = open && (
    <div className="mt-2 rounded-lg bg-slate-50 border border-slate-200 p-3 space-y-2 text-xs text-slate-700 leading-relaxed">
      {help && !inlineHelp ? <p>{help}</p> : null}
      {why ? <p><b className="text-slate-900">{tt(lang, 'why')}</b> {why}</p> : null}
      {editable && (canUnsure || canLater || canAsk) && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-slate-500">{tt(lang, 'cantAnswer')}</span>
          {canUnsure && <button type="button" aria-pressed={flag === 'unsure'} className={chip(flag === 'unsure', 'bg-amber-100 text-amber-900 border-amber-400')} onClick={() => p.onFlag(flag === 'unsure' ? null : 'unsure')}>{tt(lang, 'unsure')}</button>}
          {canLater && q.type !== 'file' && <button type="button" aria-pressed={flag === 'later'} className={`${chip(flag === 'later', 'bg-violet-100 text-violet-900 border-violet-400')} inline-flex items-center gap-1`} onClick={() => p.onFlag(flag === 'later' ? null : 'later')}><Clock className="w-3 h-3" />{tt(lang, 'later')}</button>}
          {canAsk && <button type="button" aria-pressed={flag === 'ask'} className={`${chip(flag === 'ask', 'bg-sky-100 text-sky-900 border-sky-400')} inline-flex items-center gap-1`} onClick={() => { if (flag === 'ask') p.onFlag(null); else p.onFlag('ask', answer?.note ?? ''); }}><MessageSquare className="w-3 h-3" />{tt(lang, 'ask')}</button>}
        </div>
      )}
    </div>
  );

  const askBox = flag === 'ask' ? <textarea rows={2} className={`${input} mt-2`} disabled={!editable} aria-label={tt(lang, 'askNote')} placeholder={tt(lang, 'askNote')} value={answer?.note ?? ''} onChange={(e) => p.onFlag('ask', e.target.value)} /> : null;
  const msgs = (
    <>
      {problems.map((m, i) => <p key={i} role="alert" className="mt-1 text-xs text-rose-700">{m[L]}</p>)}
      {p.findingsHere.filter((f) => f.sev === 'blocking').slice(0, 2).map((f, i) => <p key={`f${i}`} className="mt-1 text-xs text-amber-800">{f.title[L]}</p>)}
    </>
  );
  const fileFlags = q.type === 'file' && editable && (canLater || canAsk) ? (
    <div className="flex flex-wrap gap-3 text-xs pt-1">
      {canLater && <button type="button" aria-pressed={flag === 'later'} className={`inline-flex items-center gap-1 underline-offset-2 hover:underline ${flag === 'later' ? 'text-violet-800 font-semibold' : 'text-slate-600'}`} onClick={() => p.onFlag(flag === 'later' ? null : 'later')}><Clock className="w-3 h-3" />{tt(lang, 'later')}</button>}
      {canAsk && <button type="button" aria-pressed={flag === 'ask'} className={`inline-flex items-center gap-1 underline-offset-2 hover:underline ${flag === 'ask' ? 'text-sky-800 font-semibold' : 'text-slate-600'}`} onClick={() => { if (flag === 'ask') p.onFlag(null); else p.onFlag('ask', answer?.note ?? ''); }}><MessageSquare className="w-3 h-3" />{tt(lang, 'ask')}</button>}
    </div>
  ) : null;

  // one row: question on the left, answer on the right
  if (row) {
    return (
      <div className="px-3 py-1.5" data-q={q.id} data-rec={p.rec}>
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <div className="min-w-0 flex-1 basis-[240px]">{labelEl}</div>
          <div className="shrink-0">{control}</div>
        </div>
        {inlineHelp ? null : null}
        {panel}{askBox}{msgs}
      </div>
    );
  }

  const tone = flag === 'ask' ? 'border-sky-300' : flag === 'unsure' ? 'border-amber-300' : flag === 'later' ? 'border-violet-300' : problems.length ? 'border-rose-300' : 'border-slate-200';
  return (
    <div className={`rounded-lg border ${tone} bg-white px-3 py-2.5 space-y-1.5`} data-q={q.id} data-rec={p.rec}>
      {labelEl}
      {inlineHelp ? <p className="text-xs text-slate-600 leading-snug">{help}</p> : null}
      {control}
      {fileFlags}
      {msgs}{panel}{askBox}
    </div>
  );
}
