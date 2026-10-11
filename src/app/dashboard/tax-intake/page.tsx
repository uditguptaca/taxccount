'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Scope from '@/components/t1/Scope';
import { Plus, RefreshCw, Search, X, Clock, HelpCircle, Layers, MapPin, Eye, Edit3 } from 'lucide-react';
import { PROVINCE_NAMES } from '@/lib/tax-intake-types';
import { SUPPORTED_YEARS, isVerifiedYear } from '@/lib/t1/config/years';

const STATUS: Record<string, string> = { not_started: 'Not started', in_progress: 'In progress', awaiting_documents: 'Waiting for documents', needs_clarification: 'Needs clarification', submitted: 'Submitted', under_review: 'Under review', reviewed: 'Reviewed', returned_to_client: 'Returned to client' };

export default function TaxIntakePreparerDashboard() { return <Scope><TaxIntakePreparerDashboardInner /></Scope>; }

function TaxIntakePreparerDashboardInner() {
  const [engagements, setEngagements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState('all');
  const [status, setStatus] = useState('all');
  const [province, setProvince] = useState('all');
  const [search, setSearch] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [newYear, setNewYear] = useState('2025');
  const [newProvince, setNewProvince] = useState('');
  const [filing, setFiling] = useState('original');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    try { const r = await fetch('/api/tax-intake'); if (r.ok) setEngagements((await r.json()).engagements || []); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    setCreating(true); setError('');
    try {
      const r = await fetch('/api/tax-intake', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ client_name: name, client_email: email, tax_year: newYear, province: newProvince || undefined, filing_type: filing }) });
      if (r.ok) { setShowNew(false); setName(''); setEmail(''); await load(); }
      else setError((await r.json().catch(() => ({}))).error || 'Could not create it');
    } finally { setCreating(false); }
  };

  const shown = useMemo(() => engagements.filter((e) =>
    (year === 'all' || e.tax_year === year) && (status === 'all' || e.status === status) && (province === 'all' || e.province === province) &&
    (!search || `${e.client_name} ${e.taxpayer_name} ${e.id}`.toLowerCase().includes(search.toLowerCase()))), [engagements, year, status, province, search]);

  return (
    <div className="min-h-[70vh] bg-slate-50 text-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Canadian T1 Tax Intake</h1>
            <p className="text-sm text-slate-600">Detailed, adaptive questionnaires for individual income tax returns. Nothing here files a return.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={load} className="p-2.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-200 flex items-center gap-2 text-sm font-medium"><RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />Refresh</button>
            <button onClick={() => setShowNew(true)} className="px-4 py-2.5 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-semibold flex items-center gap-2"><Plus className="w-4 h-4" />New Client Tax Intake</button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            ['Total intakes', engagements.length, <Layers key="a" className="w-4 h-4 text-indigo-700" />, 'text-slate-900'],
            ['Submitted or in review', engagements.filter((e) => ['submitted', 'under_review'].includes(e.status)).length, <Clock key="b" className="w-4 h-4 text-amber-700" />, 'text-amber-700'],
            ['Open flags and specialist items', engagements.reduce((a, e) => a + (e.open_flags || 0), 0), <HelpCircle key="c" className="w-4 h-4 text-rose-700" />, 'text-rose-700'],
            ['Québec returns', engagements.filter((e) => e.province === 'QC').length, <MapPin key="d" className="w-4 h-4 text-blue-700" />, 'text-blue-700'],
          ].map(([label, n, icon, tone]: any) => (
            <div key={label} className="bg-white border border-slate-200 rounded-xl p-4"><div className="flex items-center justify-between"><span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">{label}</span>{icon}</div><div className={`text-2xl font-bold mt-2 ${tone}`}>{n}</div></div>
          ))}
        </div>

        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex flex-wrap items-center gap-3 bg-slate-50">
            <div className="relative flex-1 min-w-[240px]"><Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" /><input aria-label="Search" placeholder="Search by client name or intake ID..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm" /></div>
            <select aria-label="Tax year" value={year} onChange={(e) => setYear(e.target.value)} className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm"><option value="all">All tax years</option>{SUPPORTED_YEARS.map((y) => <option key={y} value={String(y)}>{y}</option>)}</select>
            <select aria-label="Province" value={province} onChange={(e) => setProvince(e.target.value)} className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm"><option value="all">All provinces</option>{Object.entries(PROVINCE_NAMES).map(([c, n]) => <option key={c} value={c}>{c} · {n}</option>)}</select>
            <select aria-label="Status" value={status} onChange={(e) => setStatus(e.target.value)} className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm"><option value="all">All statuses</option>{Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead><tr className="border-b border-slate-200 bg-slate-50 text-slate-600 text-xs font-semibold uppercase tracking-wider"><th className="py-3.5 px-4">Client</th><th className="px-4">Year</th><th className="px-4">Province</th><th className="px-4">Status</th><th className="px-4 text-center">Progress</th><th className="px-4 text-center">Open items</th><th className="px-4 text-right">Actions</th></tr></thead>
              <tbody className="divide-y divide-slate-200">
                {shown.length === 0 && <tr><td colSpan={7} className="py-12 text-center text-slate-500">{loading ? 'Loading…' : 'No tax intakes match.'}</td></tr>}
                {shown.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50">
                    <td className="py-4 px-4"><div className="font-semibold text-slate-900">{e.client_name || 'Client'}</div><div className="text-xs text-slate-500">{e.taxpayer_name !== e.client_name ? e.taxpayer_name : ''}</div></td>
                    <td className="px-4"><span className="whitespace-nowrap px-2.5 py-1 rounded-md text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-300">T1 {e.tax_year}</span>{!isVerifiedYear(Number(e.tax_year)) && <span className="ml-2 text-[10px] text-amber-700" title="Limits and dates for this year are not verified in the questionnaire">rules to confirm</span>}</td>
                    <td className="px-4 text-slate-700">{e.province ? `${e.province} (${PROVINCE_NAMES[e.province as keyof typeof PROVINCE_NAMES] || ''})` : <span className="text-slate-500">asked of the client</span>}</td>
                    <td className="px-4"><span className="whitespace-nowrap text-xs font-semibold px-2.5 py-1 rounded-full border border-slate-300 bg-slate-100 text-slate-800">{STATUS[e.status] || e.status}</span></td>
                    <td className="px-4"><div className="w-28 mx-auto"><div className="text-xs text-slate-600 mb-1">{e.progress_pct || 0}%</div><div className="h-2 rounded-full bg-slate-200 overflow-hidden"><div className="h-full bg-indigo-500" style={{ width: `${e.progress_pct || 0}%` }} /></div></div></td>
                    <td className="px-4 text-center">{e.open_blocking > 0 && <span className="text-xs font-bold text-rose-700 mr-2">{e.open_blocking} missing</span>}{e.open_flags > 0 ? <span className="text-xs font-bold text-amber-700">{e.open_flags} flagged</span> : e.open_blocking > 0 ? null : <span className="text-xs text-slate-500">Clear</span>}</td>
                    <td className="px-4 text-right"><div className="flex justify-end gap-2">
                      <Link href={`/dashboard/tax-intake/${e.id}/fill`} className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-slate-200 text-slate-700 hover:text-slate-900 text-xs font-medium flex items-center gap-1"><Eye className="w-3.5 h-3.5" />Open form</Link>
                      <Link href={`/dashboard/tax-intake/${e.id}`} className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1"><Edit3 className="w-3.5 h-3.5" />Preparer Audit</Link>
                    </div></td>
                  </tr>))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showNew && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50" role="dialog" aria-label="New Client Tax Intake">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-4"><h3 className="text-lg font-bold">New Client Tax Intake</h3><button onClick={() => setShowNew(false)} aria-label="Close" className="text-slate-600 hover:text-slate-900"><X className="w-5 h-5" /></button></div>
            <form onSubmit={create} className="space-y-4">
              <label className="block text-xs font-semibold text-slate-700">Client full legal name<input required placeholder="e.g. Jean-Luc Picard" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900" /></label>
              <label className="block text-xs font-semibold text-slate-700">Client email address<input type="email" placeholder="client@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900" /></label>
              <div className="grid grid-cols-2 gap-4">
                <label className="block text-xs font-semibold text-slate-700">Tax year<select value={newYear} onChange={(e) => setNewYear(e.target.value)} className="mt-1 w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900">{SUPPORTED_YEARS.map((y) => <option key={y} value={String(y)}>{y}{isVerifiedYear(y) ? '' : ' (rules to confirm)'}</option>)}</select></label>
                <label className="block text-xs font-semibold text-slate-700">Province on 31 December<select value={newProvince} onChange={(e) => setNewProvince(e.target.value)} className="mt-1 w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900"><option value="">Ask the client</option>{Object.entries(PROVINCE_NAMES).map(([c, n]) => <option key={c} value={c}>{c} · {n}</option>)}</select></label>
              </div>
              <label className="block text-xs font-semibold text-slate-700">Filing type<select value={filing} onChange={(e) => setFiling(e.target.value)} className="mt-1 w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900"><option value="original">Original return</option><option value="unfiled_prior_year">Unfiled earlier year</option><option value="adjustment">Adjustment to a filed return</option></select></label>
              {error && <p role="alert" className="text-sm text-rose-700">{error}</p>}
              <div className="flex justify-end gap-3 pt-2"><button type="button" onClick={() => setShowNew(false)} className="px-4 py-2 rounded-lg text-sm text-slate-700 hover:bg-slate-200">Cancel</button><button type="submit" disabled={creating} className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-sm font-semibold disabled:opacity-60">{creating ? 'Creating…' : 'Create intake'}</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
