'use client';
// Small shared pieces for the Service Master screens.
import React from 'react';
import { X } from 'lucide-react';

export const inpW = 'rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:bg-slate-100';
export const inp = `w-full ${inpW}`;
export const btn = 'inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 hover:border-indigo-500 hover:text-indigo-700 disabled:opacity-50';
export const btnPrimary = 'inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-500 disabled:opacity-50';
export const btnSm = 'inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-slate-700 hover:border-indigo-500 hover:text-indigo-700 disabled:opacity-50';
export const th = 'px-3 py-2 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500';
export const td = 'px-3 py-2 align-top text-sm text-slate-800';

export function Field({ label, hint, children, wide }: { label: string; hint?: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <label className={`block ${wide ? 'md:col-span-2' : ''}`}>
      <span className="text-xs font-semibold text-slate-700">{label}</span>
      {hint ? <span className="ml-1.5 text-[11px] font-normal text-slate-500">{hint}</span> : null}
      <span className="mt-1 block">{children}</span>
    </label>
  );
}
export function Badge({ tone = 'slate', children, title }: { tone?: 'slate' | 'green' | 'amber' | 'rose' | 'indigo'; children: React.ReactNode; title?: string }) {
  const c = { slate: 'border-slate-200 bg-slate-50 text-slate-700', green: 'border-emerald-200 bg-emerald-50 text-emerald-800', amber: 'border-amber-200 bg-amber-50 text-amber-800', rose: 'border-rose-200 bg-rose-50 text-rose-800', indigo: 'border-indigo-200 bg-indigo-50 text-indigo-800' }[tone];
  return <span title={title} className={`inline-flex items-center whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-semibold ${c}`}>{children}</span>;
}
/** Tick boxes drawn as chips: pick several from a short list. */
export function Chips({ options, value, onChange, single }: { options: { v: string; label: string }[]; value: string[]; onChange: (v: string[]) => void; single?: boolean }) {
  return (
    <span className="flex flex-wrap gap-1.5">
      {options.map((o) => { const on = value.includes(o.v); return (
        <button key={o.v} type="button" role="checkbox" aria-checked={on} onClick={() => onChange(single ? [o.v] : on ? value.filter((x) => x !== o.v) : [...value, o.v])}
          className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${on ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300 bg-white text-slate-700 hover:border-indigo-400'}`}>{o.label}</button>); })}
    </span>
  );
}
export function Modal({ title, sub, onClose, children, footer, wide }: { title: string; sub?: string; onClose: () => void; children: React.ReactNode; footer?: React.ReactNode; wide?: boolean }) {
  return (
    <div className="fixed inset-0 z-[1500] flex items-start justify-center overflow-y-auto bg-slate-900/50 p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className={`my-4 w-full ${wide ? 'max-w-5xl' : 'max-w-2xl'} rounded-2xl bg-white shadow-2xl`}>
        <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-3">
          <div><h2 className="text-lg font-bold text-slate-900">{title}</h2>{sub ? <p className="text-xs text-slate-500">{sub}</p> : null}</div>
          <button type="button" aria-label="Close" onClick={onClose} className="rounded-lg p-1 text-slate-500 hover:bg-slate-100"><X className="h-5 w-5" /></button>
        </div>
        <div className="max-h-[72vh] overflow-y-auto px-5 py-4">{children}</div>
        {footer ? <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 bg-slate-50 px-5 py-3 rounded-b-2xl">{footer}</div> : null}
      </div>
    </div>
  );
}
export const slug = (s: string, prefix = '') => (prefix + s.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '')).slice(0, 48) || prefix + 'item';
