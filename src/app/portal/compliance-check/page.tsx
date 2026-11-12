'use client';
// "My compliances": every person or business the user has checked, with each filing, its next due date and
// what to do about it. Marking a filing as filed records it and moves the item to its next due date.
import React, { useCallback, useEffect, useState } from 'react';
import SourceLine from '@/components/compliance/SourceLine';
import { AlarmClock, CalendarClock, CheckCircle2, ChevronDown, Download, FileText, Loader2, Paperclip, Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import Scope from '@/components/t1/Scope';
import Checker, { STORE_KEY } from '@/components/compliance/Checker';
import { fmt } from '@/lib/compliance/engine';
import { daysTo, timeLeft } from '@/lib/compliance/timeleft';

// what the person is asked for when a row has a rule and no date: the day it happened, the day it was last done, or the
// date printed on the document (an expiry or due date, which is then the deadline itself)
const COUNT_LABEL = { after: 'It happened on', every: 'Last done on', until: 'Expires or is due on' } as const;
const FREQ: Record<string, string> = { annual: 'Yearly', semiannual: 'Twice a year', quarterly: 'Quarterly', monthly: 'Monthly', event: 'When it happens', once: 'One time' };
const tone = (u: string) => (u === 'red' ? 'text-rose-700 bg-rose-50 border-rose-200' : u === 'yellow' ? 'text-amber-800 bg-amber-50 border-amber-200' : u === 'gray' ? 'text-slate-600 bg-slate-50 border-slate-200' : 'text-emerald-700 bg-emerald-50 border-emerald-200');
const btn = 'inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:border-indigo-500 hover:text-indigo-700';

const todayLocal = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
const kb = (n: number) => (n >= 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);
const REPEATS: [string, string][] = [['none', 'Does not repeat'], ['monthly', 'Every month'], ['quarterly', 'Every 3 months'], ['semiannual', 'Every 6 months'], ['annual', 'Every year']];
const field = 'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500';

export default function ComplianceCheckPage() { return <Scope><Inner /></Scope>; }

/** Add to a list by hand: a compliance from the country's list, or something of the person's own. */
function AddItem({ profile, onClose, onDone }: { profile: any; onClose: () => void; onDone: (msg: string) => void }) {
  const [tab, setTab] = useState<'list' | 'own'>('list');
  const [options, setOptions] = useState<any[] | null>(null);
  const [q, setQ] = useState(''); const [err, setErr] = useState(''); const [busy, setBusy] = useState('');
  const [own, setOwn] = useState({ title: '', date: '', repeat: 'none', note: '' });
  useEffect(() => { fetch(`/api/compliance-tracker?options=${profile.id}`, { cache: 'no-store' }).then((r) => r.json()).then((d) => setOptions(d.options || [])).catch(() => setOptions([])); }, [profile.id]);
  const send = async (body: object, key: string, msg: string) => {
    setBusy(key); setErr('');
    const r = await fetch('/api/compliance-tracker', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ profileId: profile.id, ...body }) });
    const d = await r.json().catch(() => ({})); setBusy('');
    if (!r.ok) { setErr(d.error || 'That did not work.'); return; }
    onDone(msg);
  };
  const words = q.toLowerCase().split(/\s+/).filter(Boolean);
  const shown = (options ?? []).filter((o) => { const hay = `${o.name} ${o.form ?? ''} ${o.head} ${o.dept} ${o.authority}`.toLowerCase(); return words.every((w) => hay.includes(w)); });
  return (
    <div className="fixed inset-0 z-[1500] flex items-start justify-center overflow-y-auto bg-slate-900/50 p-3" role="dialog" aria-modal="true" aria-label="Add a compliance">
      <div className="my-6 w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-3">
          <div><h2 className="text-lg font-bold text-slate-900">Add a compliance</h2><p className="text-xs text-slate-500">to {profile.label}</p></div>
          <button aria-label="Close" className="rounded-lg p-1 text-slate-500 hover:bg-slate-100" onClick={onClose}><X className="h-5 w-5" /></button>
        </div>
        <div className="px-5 pt-3" role="tablist">
          <button role="tab" aria-selected={tab === 'list'} className={`mr-2 rounded-full px-3 py-1.5 text-sm font-semibold ${tab === 'list' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'}`} onClick={() => setTab('list')}>From the {profile.countryName} list</button>
          <button role="tab" aria-selected={tab === 'own'} className={`rounded-full px-3 py-1.5 text-sm font-semibold ${tab === 'own' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'}`} onClick={() => setTab('own')}>Something of my own</button>
        </div>
        <div className="px-5 py-4">
          {err && <p role="alert" className="mb-2 text-sm text-rose-700">{err}</p>}
          {tab === 'list' ? (
            <>
              <p className="text-xs text-slate-600">These did not follow from your answers. Add one if you know it applies to you: it is then tracked with its own due dates.</p>
              <span className="relative mt-2 block"><Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" /><input aria-label="Search the list" placeholder="Search by name, form or authority" className={`${field} pl-8`} value={q} onChange={(e) => setQ(e.target.value)} /></span>
              <ul className="mt-2 max-h-[46vh] divide-y divide-slate-100 overflow-y-auto rounded-lg border border-slate-200">
                {options === null && <li className="px-3 py-4 text-sm text-slate-500">Loading…</li>}
                {options !== null && shown.length === 0 && <li className="px-3 py-4 text-sm text-slate-500">Nothing matches. You can add it as something of your own.</li>}
                {shown.slice(0, 60).map((o) => (
                  <li key={o.id} className="flex items-start justify-between gap-3 px-3 py-2" data-option={o.id}>
                    <span className="min-w-0"><span className="block text-sm font-semibold text-slate-900">{o.name}{o.form ? <span className="ml-1 text-xs font-normal text-slate-500">({o.form})</span> : null}</span><span className="block text-[11px] text-slate-500">{o.dept} · {o.head} · {o.authority}</span><span className="block text-[11px] text-slate-600">{o.dueText}</span></span>
                    <button className={btn} disabled={busy === o.id} onClick={() => send({ action: 'add', complianceId: o.id }, o.id, `Added: ${o.name}.`)}><Plus className="h-3 w-3" />Add</button>
                  </li>))}
                {shown.length > 60 && <li className="px-3 py-2 text-[11px] text-slate-500">{shown.length - 60} more: type a few letters to narrow the list.</li>}
              </ul>
            </>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              <p className="text-xs text-slate-600 md:col-span-2">Anything with a date you must not miss: a licence or permit to renew, an insurance renewal, a filing this list does not cover.</p>
              <label className="text-xs font-semibold text-slate-700 md:col-span-2">What is it?<input aria-label="What is it?" className={`${field} mt-1`} placeholder="For example: Business licence renewal" value={own.title} onChange={(e) => setOwn({ ...own, title: e.target.value })} /></label>
              <label className="text-xs font-semibold text-slate-700">Due on<input aria-label="Due on" type="date" className={`${field} mt-1`} value={own.date} onChange={(e) => setOwn({ ...own, date: e.target.value })} /></label>
              <label className="text-xs font-semibold text-slate-700">Does it repeat?<select aria-label="Does it repeat?" className={`${field} mt-1`} value={own.repeat} onChange={(e) => setOwn({ ...own, repeat: e.target.value })}>{REPEATS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label>
              <label className="text-xs font-semibold text-slate-700 md:col-span-2">Note (optional)<textarea aria-label="Note" className={`${field} mt-1 min-h-[60px]`} value={own.note} onChange={(e) => setOwn({ ...own, note: e.target.value })} /></label>
              <div className="md:col-span-2 flex justify-end"><button className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-500 disabled:opacity-50" disabled={!own.title.trim() || busy === 'own'} onClick={() => send({ action: 'add_own', ...own }, 'own', `Added: ${own.title.trim()}.`)}><Plus className="h-4 w-4" />Add to my list</button></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Inner() {
  const [profiles, setProfiles] = useState<any[] | null>(null);
  const [active, setActive] = useState('');
  const [adding, setAdding] = useState(false);
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [busy, setBusy] = useState('');
  const [msg, setMsg] = useState('');
  const [editDate, setEditDate] = useState<{ id: string; date: string; count?: 'after' | 'every' | 'until' } | null>(null);
  const [addTo, setAddTo] = useState(false);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [today, setToday] = useState(todayLocal());
  useEffect(() => { const t = setInterval(() => setToday(todayLocal()), 60000); return () => clearInterval(t); }, []);   // the countdown follows the clock

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
    if (action === 'done') setMsg(d.next ? `Marked as filed. The next one is due ${fmt(d.next)}.` : d.open ? 'Marked as filed and kept in your list, because it comes round again. Enter its next date when you know it.' : 'Marked as filed.');
    if (action === 'count_from' && d.due) setMsg(`Worked out: due ${fmt(d.due)}.`);
    setEditDate(null);
    await load();
  };
  const edit = async (profileId: string, itemId: string, body: object, done: string) => {
    setBusy(itemId + 'edit'); setMsg('');
    const r = await fetch('/api/compliance-tracker', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ profileId, itemId, action: 'edit', ...body }) });
    const d = await r.json().catch(() => ({})); setBusy('');
    if (!r.ok) { setMsg(d.error || 'That did not work.'); return; }
    setMsg(done); await load();
  };
  const upload = async (profileId: string, complianceId: string, file: File | undefined) => {
    if (!file) return;
    setBusy(complianceId + 'up'); setMsg('');
    const fd = new FormData(); fd.append('profileId', profileId); fd.append('complianceId', complianceId); fd.append('file', file);
    const r = await fetch('/api/compliance-tracker/documents', { method: 'POST', body: fd });
    const d = await r.json().catch(() => ({})); setBusy('');
    setMsg(r.ok ? `Saved ${d.name} with this compliance.` : d.error || 'The file could not be saved.');
    if (r.ok) await load();
  };
  const dropDoc = async (id: string) => { if (!confirm('Delete this file?')) return; await fetch(`/api/compliance-tracker/documents?id=${id}`, { method: 'DELETE' }); await load(); };
  const remove = async (id: string) => { if (!confirm('Remove this check and its compliances from your account?')) return; await fetch(`/api/compliance-tracker?profileId=${id}`, { method: 'DELETE' }); await load(); };

  if (profiles === null) return <div className="p-8 text-sm text-slate-600"><Loader2 className="inline w-4 h-4 animate-spin mr-2" />Loading your compliances…</div>;
  const p = profiles.find((x) => x.id === active);
  const openItems = p ? p.items.filter((i: any) => i.status !== 'completed') : [];
  const soon = openItems.filter((i: any) => i.urgency === 'red' || i.urgency === 'yellow').length;
  const heads: string[] = p ? Array.from(new Set(p.items.map((i: any) => i.head))) : [];
  // everything still to do, across every person and business, soonest first
  const all = profiles.flatMap((x) => x.items.filter((i: any) => i.status !== 'completed').map((i: any) => ({ ...i, profileId: x.id, profileLabel: x.label })));
  const dated = all.filter((i: any) => i.dueDate).sort((a: any, b: any) => String(a.dueDate).localeCompare(String(b.dueDate)));
  const count = (f: (n: number) => boolean) => dated.filter((i: any) => f(daysTo(i.dueDate, today))).length;
  const filedCount = profiles.reduce((n, x) => n + x.history.length, 0);
  const goTo = (i: any) => { setActive(i.profileId); setOpen((o) => ({ ...o, [i.id]: true })); setTimeout(() => document.querySelector(`[data-row="${i.id}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 80); };

  return (
    <div className="space-y-4 pb-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My compliances</h1>
          <p className="text-sm text-slate-600">Everything you have to file or renew, in one place: what is due next, how long is left, and the papers that go with it.</p>
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
        <section className="space-y-3" data-overview>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[['Overdue', count((n) => n < 0), 'text-rose-700 bg-rose-50 border-rose-200'], ['Due in 7 days', count((n) => n >= 0 && n <= 7), 'text-rose-700 bg-rose-50 border-rose-200'], ['Due in 30 days', count((n) => n >= 0 && n <= 30), 'text-amber-800 bg-amber-50 border-amber-200'], ['Filed so far', filedCount, 'text-emerald-700 bg-emerald-50 border-emerald-200']].map(([label, n, cls]) => (
              <div key={String(label)} className={`rounded-xl border px-3 py-2.5 ${n ? cls : 'border-slate-200 bg-white text-slate-500'}`} data-tile={String(label)}><p className="text-2xl font-extrabold leading-none">{n as number}</p><p className="mt-1 text-xs font-semibold">{label}</p></div>))}
          </div>
          <div className="rounded-xl border border-slate-200 bg-white">
            <h2 className="flex items-center gap-1.5 border-b border-slate-100 px-4 py-2 text-xs font-bold uppercase tracking-wide text-slate-600"><AlarmClock className="h-4 w-4 text-indigo-600" />Next up{profiles.length > 1 ? ' across everything you track' : ''}
              {dated.length > 0 && <a href="/api/compliance-tracker/calendar" className="ml-auto inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-[11px] font-semibold normal-case tracking-normal text-slate-700 hover:border-indigo-500 hover:text-indigo-700" title="Downloads a calendar file. Open it to add every due date to the calendar on your phone or computer, with a reminder a week before and the day before."><CalendarClock className="h-3.5 w-3.5" />Add to my calendar</a>}</h2>
            {dated.length === 0 ? <p className="px-4 py-3 text-sm text-slate-500">Nothing with a date is waiting.</p> : (
              <ul className="divide-y divide-slate-100" aria-label="Next up">
                {dated.slice(0, 5).map((i: any) => { const t = timeLeft(i.dueDate, today); return (
                  <li key={i.id}><button className="flex w-full flex-wrap items-center justify-between gap-2 px-4 py-2 text-left hover:bg-slate-50" onClick={() => goTo(i)}>
                    <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold text-slate-900">{i.title}</span><span className="block text-[11px] text-slate-500">{profiles.length > 1 ? `${i.profileLabel} · ` : ''}{fmt(i.dueDate)}</span>
                      {i.penalty ? <span className="mt-0.5 block text-[11px] text-rose-700 line-clamp-2" data-cost><b>If missed:</b> {i.penalty}</span> : null}</span>
                    <span className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-bold ${tone(t.tone)}`}>{t.text}</span>
                  </button></li>); })}
              </ul>)}
          </div>
        </section>
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
              <button className={`${btn} border-indigo-300 text-indigo-700`} onClick={() => setAddTo(true)}><Plus className="w-3 h-3" />Add a compliance</button>
              <button className={`${btn} text-rose-700`} onClick={() => remove(p.id)}><Trash2 className="w-3 h-3" />Remove</button>
            </div>
          </div>

          {heads.map((h) => (
            <section key={h} className="rounded-xl border border-slate-200 bg-white">
              <h2 className="px-4 py-2 text-xs font-bold uppercase tracking-wide text-indigo-700 border-b border-slate-100">{h}</h2>
              <ul className="divide-y divide-slate-100">
                {p.items.filter((i: any) => i.head === h).map((i: any) => (
                  <li key={i.id} className="px-4 py-2.5" data-item={i.complianceId} data-row={i.id}>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <button className="flex items-center gap-2 text-left min-w-0 flex-1" aria-expanded={!!open[i.id]} onClick={() => setOpen((o) => ({ ...o, [i.id]: !o[i.id] }))}>
                        <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${open[i.id] ? '' : '-rotate-90'}`} />
                        <span className="min-w-0"><span className={`text-sm font-semibold ${i.status === 'completed' ? 'text-slate-400 line-through' : 'text-slate-900'}`}>{i.title}</span>
                          <span className="block text-[11px] text-slate-500">{i.authority ? `${i.authority} · ` : ''}{FREQ[i.frequency] ?? i.frequency}{i.period ? ` · for ${i.period}` : ''}{i.certainty === 'check' ? ' · may apply, please confirm' : ''}{i.manual ? ' · added by you' : ''}{i.countedFrom && i.dueDate ? ` · counted from ${fmt(i.countedFrom)}` : ''}{i.docs?.length ? ` · ${i.docs.length} ${i.docs.length === 1 ? 'file' : 'files'}` : ''}</span></span>
                      </button>
                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        {i.status === 'completed' ? <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700"><CheckCircle2 className="w-4 h-4" />Done</span>
                          : editDate?.id === i.id
                            ? <span className="flex flex-wrap items-center gap-1">{editDate!.count ? <span className="text-[11px] font-semibold text-slate-600">{COUNT_LABEL[editDate!.count]}</span> : null}<input type="date" aria-label={editDate!.count ? COUNT_LABEL[editDate!.count] : 'Due date'} className="rounded-lg border border-slate-300 px-2 py-1 text-xs" value={editDate!.date} onChange={(e) => setEditDate({ ...editDate!, date: e.target.value })} /><button className={btn} disabled={!editDate!.date} onClick={() => act(p.id, i.id, editDate!.count ? 'count_from' : 'set_date', editDate!.date)}>{editDate!.count ? 'Work out the date' : 'Save'}</button><button className={btn} onClick={() => setEditDate(null)}>Cancel</button></span>
                            : i.dueDate
                              ? <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${tone(i.urgency)}`}><CalendarClock className="w-3.5 h-3.5" />{fmt(i.dueDate)}<span className="ml-1 font-bold" data-left>· {timeLeft(i.dueDate, today).text}</span></span>
                              : i.needs
                                ? <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${tone(i.urgency)}`}><CalendarClock className="w-3.5 h-3.5" />Add your dates</span>
                                : i.passed
                                  // a one-time deadline counted from a date the person gave, already gone by: said plainly, with the way to close it beside it
                                  ? <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-800" data-passed title="Worked out from the date you gave. If it was done at the time, mark it as filed."><CalendarClock className="w-3.5 h-3.5" />Was due {fmt(i.passed)}</span>
                                  // no calendar date: the rule itself, never "no fixed date"
                                  : <span className="inline-flex max-w-[19rem] items-start gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-left text-xs font-semibold leading-snug text-slate-700" data-rule title={i.dueText || i.rule || ''}><CalendarClock className="mt-0.5 w-3.5 h-3.5 shrink-0" />{i.rule || (i.own ? 'No date set' : FREQ[i.frequency] ?? 'When it happens')}</span>}
                        {i.status !== 'completed' && editDate?.id !== i.id && !i.dueDate && !i.needs && !i.passed && i.window && <button className={`${btn} border-indigo-300 text-indigo-700`} data-count onClick={() => setEditDate({ id: i.id, date: '', count: i.window.kind })} title={i.window.kind === 'until' ? 'Enter the date printed on the document (its expiry or due date): that date is the deadline' : `Enter the day the ${i.window.text} are counted from and the deadline is worked out`}>{COUNT_LABEL[i.window.kind as 'after' | 'every' | 'until']}…</button>}
                        {i.status !== 'completed' && editDate?.id !== i.id && <button className={btn} title="Set or change the due date by hand" aria-label="Change the due date" onClick={() => setEditDate({ id: i.id, date: i.dueDate || '' })}><Pencil className="w-3 h-3" /></button>}
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
                        {i.penalty && <p><b className="text-slate-800">If missed:</b> {i.penalty}{i.penaltySourceUrl ? <> (<a className="text-indigo-700 underline" href={i.penaltySourceUrl} target="_blank" rel="noopener noreferrer nofollow">official page</a>)</> : null}</p>}
                        {(() => { const u = (i.upcoming ?? []).find((x: any) => x.was && x.date === String(i.dueDate || '').slice(0, 10)); return u ? <p><b className="text-slate-800">Deadline moved:</b> the usual date is {fmt(u.was)}{u.movedNote ? `. ${u.movedNote}` : ''}</p> : null; })()}
                        {i.upcoming?.length > 0 && <p><b className="text-slate-800">Coming up:</b> {i.upcoming.map((u: any) => fmt(u.date)).join(', ')}</p>}
                        {i.note && <p className="md:col-span-2">{i.note}</p>}
                        {!i.stillApplies && <p className="md:col-span-2 text-amber-700">This no longer applies under your answers or the current rules. Remove it if it does not apply to you.</p>}
                        <div className="md:col-span-2 mt-1 grid gap-3 rounded-lg border border-slate-200 bg-slate-50/60 p-3 md:grid-cols-2" data-mine>
                          <div>
                            <p className="font-semibold text-slate-800">My note</p>
                            <textarea aria-label="My note" className={`${field} mt-1 min-h-[54px] text-xs`} placeholder="For example: sent to the accountant on the 3rd" value={notes[i.id] ?? i.notes ?? ''} onChange={(e) => setNotes((n) => ({ ...n, [i.id]: e.target.value }))} />
                            {notes[i.id] !== undefined && notes[i.id] !== (i.notes ?? '') && <button className={`${btn} mt-1`} disabled={busy === i.id + 'edit'} onClick={() => edit(p.id, i.id, { note: notes[i.id] }, 'Note saved.')}>Save note</button>}
                          </div>
                          <div>
                            <p className="flex items-center gap-1 font-semibold text-slate-800"><Paperclip className="h-3.5 w-3.5" />Papers kept with it</p>
                            {i.docs.length === 0 ? <p className="mt-1 text-slate-500">Nothing yet. Keep the filed return, the receipt or the notice here so it is found in one place.</p> : (
                              <ul className="mt-1 space-y-1" aria-label="Papers">{i.docs.map((d: any) => (
                                <li key={d.id} className="flex items-center justify-between gap-2 rounded border border-slate-200 bg-white px-2 py-1">
                                  <a className="flex min-w-0 items-center gap-1.5 text-indigo-700 hover:underline" href={`/api/compliance-tracker/documents?id=${d.id}`}><FileText className="h-3.5 w-3.5 shrink-0" /><span className="truncate">{d.name}</span><Download className="h-3 w-3 shrink-0" /></a>
                                  <span className="flex shrink-0 items-center gap-2 text-slate-500">{kb(d.size)}<button aria-label={`Delete ${d.name}`} className="text-rose-700" onClick={() => dropDoc(d.id)}><Trash2 className="h-3 w-3" /></button></span>
                                </li>))}</ul>)}
                            <label className={`${btn} mt-1.5 cursor-pointer`}>{busy === i.complianceId + 'up' ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}Add a file<input type="file" aria-label="Add a file" className="hidden" accept=".pdf,.png,.jpg,.jpeg,.webp,.heic,.doc,.docx,.xls,.xlsx,.csv,.txt" onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ''; void upload(p.id, i.complianceId, f); }} /></label>
                          </div>
                        </div>
                        {i.own
                          ? <p className="md:col-span-2 flex flex-wrap items-center gap-3 pt-1"><span className="text-slate-500">You added this yourself{i.frequency !== 'once' ? `; it repeats (${FREQ[i.frequency] ?? i.frequency})` : ''}.</span><button className="text-indigo-700 hover:underline" onClick={() => { const t = prompt('Name', i.title)?.trim(); if (t && t !== i.title) void edit(p.id, i.id, { title: t }, 'Renamed.'); }}>Rename</button><button className="text-rose-700 hover:underline" onClick={() => act(p.id, i.id, 'remove')}>Remove this one</button></p>
                          : <div className="md:col-span-2"><SourceLine verified={i.verified} url={i.sourceUrl} title={i.sourceTitle} publisher={i.sourcePublisher} checked={i.sourceChecked}><button className="text-rose-700 hover:underline" onClick={() => act(p.id, i.id, 'remove')}>Remove this one</button></SourceLine></div>}
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
          {addTo && <AddItem profile={p} onClose={() => setAddTo(false)} onDone={async (m) => { setAddTo(false); setMsg(m); await load(); }} />}
          <p className="text-[11px] text-slate-500">{p.disclaimer ?? 'This is general information to help you keep track. It is not tax or legal advice. Confirm each deadline with the authority or your advisor.'} {p.weekendNote}</p>
        </>
      )}
    </div>
  );
}
