'use client';
// "My compliances": every person or business the user has checked, with each filing, its next due date and
// what to do about it. Marking a filing as filed records it and moves the item to its next due date.
import React, { useCallback, useEffect, useState } from 'react';
import SourceLine from '@/components/compliance/SourceLine';
import { CalendarClock, CheckCircle2, ChevronDown, ExternalLink, Loader2, Pencil, Plus, ShieldCheck, Trash2 } from 'lucide-react';
import Scope from '@/components/t1/Scope';
import Checker, { STORE_KEY } from '@/components/compliance/Checker';
import { fmt } from '@/lib/compliance/engine';

const FREQ: Record<string, string> = { annual: 'Yearly', semiannual: 'Twice a year', quarterly: 'Quarterly', monthly: 'Monthly', event: 'When it happens', once: 'One time' };
const tone = (u: string) => (u === 'red' ? 'text-rose-700 bg-rose-50 border-rose-200' : u === 'yellow' ? 'text-amber-800 bg-amber-50 border-amber-200' : u === 'gray' ? 'text-slate-600 bg-slate-50 border-slate-200' : 'text-emerald-700 bg-emerald-50 border-emerald-200');
const btn = 'inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:border-indigo-500 hover:text-indigo-700';

export default function ComplianceCheckPage() { return <Scope><Inner /></Scope>; }

function Inner() {
  const [profiles, setProfiles] = useState<any[] | null>(null);
  const [active, setActive] = useState('');
  const [adding, setAdding] = useState(false);
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [busy, setBusy] = useState('');
  const [msg, setMsg] = useState('');
  const [editDate, setEditDate] = useState<{ id: string; date: string } | null>(null);

  const load = useCallback(async (pick?: string) => {
    const r = await fetch('/api/compliance-tracker', { cache: 'no-store' });
    if (!r.ok) { setMsg('Could not load your compliances.'); setProfiles([]); return; }
    const d = await r.json();
    setProfiles(d.profiles || []);
    setActive((a) => pick || (d.profiles?.some((p: any) => p.id === a) ? a : d.profiles?.[0]?.id || ''));
  }, []);

  // a check made on the homepage before signing in is saved on arrival
  useEffect(() => {
    (async () => {
      let pending: any = null, raw: string | null = null;
      // taken out of storage before the request goes, so a second run of this effect finds nothing to save twice
      try { raw = localStorage.getItem(STORE_KEY); pending = JSON.parse(raw || 'null'); localStorage.removeItem(STORE_KEY); } catch { /* ignore */ }
      if (pending?.ticket) {
        const r = await fetch('/api/compliance-tracker', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ticket: pending.ticket, label: pending.label || '' }) }).catch(() => null);
        if (!r || r.status >= 500) { try { if (raw) localStorage.setItem(STORE_KEY, raw); } catch { /* ignore */ } await load(); return; }   // keep it for the next visit
        if (r.ok) { const d = await r.json(); setMsg(d.existing ? '' : 'Your check from the homepage was saved to your account.'); await load(d.id); return; }
      }
      await load();
    })();
  }, [load]);

  const act = async (profileId: string, itemId: string, action: string, date?: string) => {
    setBusy(itemId + action); setMsg('');
    const r = await fetch('/api/compliance-tracker', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ profileId, itemId, action, date }) });
    const d = await r.json().catch(() => ({}));
    setBusy('');
    if (!r.ok) { setMsg(d.error || 'That did not work.'); return; }
    if (action === 'done') setMsg(d.next ? `Marked as filed. The next one is due ${fmt(d.next)}.` : 'Marked as filed.');
    setEditDate(null);
    await load();
  };
  const remove = async (id: string) => { if (!confirm('Remove this check and its compliances from your account?')) return; await fetch(`/api/compliance-tracker?profileId=${id}`, { method: 'DELETE' }); await load(); };

  if (profiles === null) return <div className="p-8 text-sm text-slate-600"><Loader2 className="inline w-4 h-4 animate-spin mr-2" />Loading your compliances…</div>;
  const p = profiles.find((x) => x.id === active);
  const openItems = p ? p.items.filter((i: any) => i.status !== 'completed') : [];
  const soon = openItems.filter((i: any) => i.urgency === 'red' || i.urgency === 'yellow').length;
  const heads: string[] = p ? Array.from(new Set(p.items.map((i: any) => i.head))) : [];

  return (
    <div className="space-y-4 pb-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My compliances</h1>
          <p className="text-sm text-slate-600">Every filing that applies to you or your businesses, with its next due date.</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-500" onClick={() => setAdding(!adding)}><Plus className="w-4 h-4" />{adding ? 'Close' : 'Check another person or business'}</button>
      </div>
      {msg && <p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{msg}</p>}

      {(adding || profiles.length === 0) && (
        <div className="rounded-2xl border border-indigo-200 bg-indigo-50/50 p-3">
          <p className="px-1 pb-2 text-sm font-semibold text-slate-800">{profiles.length === 0 ? 'Start by checking which compliances apply to you' : 'New check'}</p>
          <Checker mode="account" signedIn onSaved={async (id) => { setAdding(false); setMsg('Saved to your account.'); await load(id); }} />
        </div>
      )}

      {profiles.length > 0 && (
        <div role="tablist" className="flex flex-wrap gap-1 border-b border-slate-200">
          {profiles.map((x) => <button key={x.id} role="tab" aria-selected={x.id === active} onClick={() => setActive(x.id)} className={`px-3 py-2 text-sm font-semibold border-b-2 -mb-px ${x.id === active ? 'border-indigo-500 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>{x.label}<span className="ml-2 text-[11px] font-normal text-slate-500">{x.countryName}</span></button>)}
        </div>
      )}

      {p && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
            <div className="text-sm text-slate-700"><b className="text-slate-900">{p.label}</b> · {p.entityName} · {p.stateName}, {p.countryName}</div>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 font-semibold text-slate-700">{openItems.length} to do</span>
              {soon > 0 && <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 font-semibold text-amber-800">{soon} due within 30 days</span>}
              <button className={`${btn} text-rose-700`} onClick={() => remove(p.id)}><Trash2 className="w-3 h-3" />Remove</button>
            </div>
          </div>

          {heads.map((h) => (
            <section key={h} className="rounded-xl border border-slate-200 bg-white">
              <h2 className="px-4 py-2 text-xs font-bold uppercase tracking-wide text-indigo-700 border-b border-slate-100">{h}</h2>
              <ul className="divide-y divide-slate-100">
                {p.items.filter((i: any) => i.head === h).map((i: any) => (
                  <li key={i.id} className="px-4 py-2.5" data-item={i.complianceId}>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <button className="flex items-center gap-2 text-left min-w-0 flex-1" aria-expanded={!!open[i.id]} onClick={() => setOpen((o) => ({ ...o, [i.id]: !o[i.id] }))}>
                        <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${open[i.id] ? '' : '-rotate-90'}`} />
                        <span className="min-w-0"><span className={`text-sm font-semibold ${i.status === 'completed' ? 'text-slate-400 line-through' : 'text-slate-900'}`}>{i.title}</span>
                          <span className="block text-[11px] text-slate-500">{i.authority} · {FREQ[i.frequency] ?? i.frequency}{i.period ? ` · for ${i.period}` : ''}{i.certainty === 'check' ? ' · may apply, please confirm' : ''}</span></span>
                      </button>
                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        {i.status === 'completed' ? <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700"><CheckCircle2 className="w-4 h-4" />Done</span>
                          : editDate?.id === i.id
                            ? <span className="flex items-center gap-1"><input type="date" aria-label="Due date" className="rounded-lg border border-slate-300 px-2 py-1 text-xs" value={editDate!.date} onChange={(e) => setEditDate({ id: i.id, date: e.target.value })} /><button className={btn} onClick={() => act(p.id, i.id, 'set_date', editDate!.date)}>Save</button><button className={btn} onClick={() => setEditDate(null)}>Cancel</button></span>
                            : <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${tone(i.urgency)}`}><CalendarClock className="w-3.5 h-3.5" />{i.dueDate ? fmt(i.dueDate) : i.needs ? 'Add your dates' : 'No fixed date'}</span>}
                        {i.status !== 'completed' && editDate?.id !== i.id && <button className={btn} title="Change the due date" aria-label="Change the due date" onClick={() => setEditDate({ id: i.id, date: i.dueDate || '' })}><Pencil className="w-3 h-3" /></button>}
                        {i.status !== 'completed'
                          ? <button className={`${btn} border-emerald-300 text-emerald-700`} disabled={busy === i.id + 'done'} onClick={() => act(p.id, i.id, 'done')}><CheckCircle2 className="w-3.5 h-3.5" />Mark as filed</button>
                          : <button className={btn} onClick={() => act(p.id, i.id, 'reopen')}>Reopen</button>}
                      </div>
                    </div>
                    {open[i.id] && (
                      <div className="mt-2 ml-6 grid gap-x-6 gap-y-1 text-xs text-slate-600 md:grid-cols-2">
                        {i.brief && <p className="md:col-span-2 text-sm text-slate-700">{i.brief}</p>}
                        {i.why && <p><b className="text-slate-800">Why it applies:</b> {i.why}</p>}
                        {i.dueText && <p><b className="text-slate-800">When:</b> {i.dueText}</p>}
                        {i.penalty && <p><b className="text-slate-800">If missed:</b> {i.penalty}</p>}
                        {(() => { const u = (i.upcoming ?? []).find((x: any) => x.was && x.date === String(i.dueDate || '').slice(0, 10)); return u ? <p><b className="text-slate-800">Deadline moved:</b> the usual date is {fmt(u.was)}{u.movedNote ? `. ${u.movedNote}` : ''}</p> : null; })()}
                        {i.upcoming?.length > 0 && <p><b className="text-slate-800">Coming up:</b> {i.upcoming.map((u: any) => fmt(u.date)).join(', ')}</p>}
                        {i.note && <p className="md:col-span-2">{i.note}</p>}
                        {!i.stillApplies && <p className="md:col-span-2 text-amber-700">This no longer applies under your answers or the current rules. Remove it if it does not apply to you.</p>}
                        <div className="md:col-span-2"><SourceLine verified={i.verified} url={i.sourceUrl} title={i.sourceTitle} publisher={i.sourcePublisher} checked={i.sourceChecked}><button className="text-rose-700 hover:underline" onClick={() => act(p.id, i.id, 'remove')}>Remove this one</button></SourceLine></div>
                      </div>
                    )}
                  </li>))}
              </ul>
            </section>))}

          {p.history.length > 0 && (
            <section className="rounded-xl border border-slate-200 bg-white px-4 py-3">
              <h2 className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-1">Filed</h2>
              <ul className="text-xs text-slate-600 space-y-0.5">{p.history.slice(0, 12).map((h: any, k: number) => <li key={k}>{h.title}{h.period ? ` · ${h.period}` : ''} · marked filed {fmt(String(h.completed_at).slice(0, 10))}</li>)}</ul>
            </section>)}
          <p className="text-[11px] text-slate-500">{p.disclaimer ?? 'This is general information to help you keep track. It is not tax or legal advice. Confirm each deadline with the authority or your advisor.'} {p.weekendNote}</p>
        </>
      )}
    </div>
  );
}
