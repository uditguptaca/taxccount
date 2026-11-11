'use client';
// Under every compliance shown to a person: the government page it was read from, the date that page
// was last read, and a reminder that this is information, not advice.
import React from 'react';
import { ExternalLink, ShieldCheck } from 'lucide-react';
import { fmt } from '@/lib/compliance/engine';

export const ITEM_DISCLAIMER = 'General information, not legal or tax advice. Governments change rules and dates: confirm on the official source before you act.';

export default function SourceLine({ verified, url, title, publisher, checked, children }: { verified: boolean; url?: string; title?: string; publisher?: string; checked?: string | null; children?: React.ReactNode }) {
  const read = checked && /^\d{4}-\d{2}-\d{2}$/.test(checked) ? fmt(checked) : '';
  return (
    <div className="mt-2 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[11px] text-slate-600" data-source>
      <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className={`inline-flex items-center gap-1 font-semibold ${verified ? 'text-emerald-700' : 'text-amber-700'}`}><ShieldCheck className="h-3.5 w-3.5" />{verified ? 'Checked against the official source' : 'Confirm on the official source'}</span>
        {url ? <span><b className="text-slate-800">Official government source:</b> {publisher ? `${publisher}, ` : ''}<a className="inline-flex items-center gap-1 text-indigo-700 hover:underline" href={url} target="_blank" rel="noreferrer">{title || 'official page'}<ExternalLink className="h-3 w-3" /></a></span> : null}
        {read ? <span><b className="text-slate-800">{verified ? 'Last checked:' : 'Page last opened:'}</b> {read}</span> : null}
        {children}
      </p>
      <p className="mt-0.5 text-slate-500">{ITEM_DISCLAIMER}</p>
    </div>
  );
}
