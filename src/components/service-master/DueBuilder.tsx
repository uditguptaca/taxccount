'use client';
// "When is it due" builder: pick the kind of rule, fill in the numbers, and see the next real dates it gives.
import React, { useMemo, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { Compliance, CountryPack, DueRule } from '@/lib/compliance/types';
import { describeDue } from '@/lib/compliance/describe';
import { dueDates, fmt, makeCtx } from '@/lib/compliance/engine';
import { Field, btnSm, inp, inpW } from './ui';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const TYPES: { t: DueRule['t']; label: string; hint: string }[] = [
  { t: 'afterYearEnd', label: 'So long after the year ends', hint: 'for example 6 months after the financial year ends' },
  { t: 'afterPeriodEnd', label: 'After each month, quarter or half-year', hint: 'for example the 20th of the month after each month' },
  { t: 'fixed', label: 'The same date(s) every year', hint: 'for example 30 April, or 15 March, June, September and December' },
  { t: 'inYear', label: 'Certain months during the year', hint: 'instalments: the 15th day of the 4th, 6th, 9th and 12th months' },
  { t: 'anniversary', label: 'Counted from a date the person gives', hint: 'for example 60 days after the anniversary of incorporation' },
  { t: 'on', label: 'One-off date(s)', hint: 'a single deadline that does not repeat' },
  { t: 'event', label: 'No fixed date', hint: 'due when something happens, described in words' },
];
const blank = (t: DueRule['t'], p: CountryPack): DueRule => {
  const dateQ = p.questions.find((q) => q.type === 'date')?.id ?? '';
  switch (t) {
    case 'afterYearEnd': return { t, basis: 'fy', months: 6 };
    case 'afterPeriodEnd': return { t, freq: 'monthly', basis: 'cal', months: 1, day: 15 };
    case 'fixed': return { t, dates: [[4, 30]] };
    case 'inYear': return { t, basis: 'fy', months: [3, 6, 9, 12], day: 15 };
    case 'anniversary': return { t, of: dateQ };
    case 'on': return { t, dates: [] };
    default: return { t: 'event', text: '' };
  }
};
const num = (v: string): number | undefined => (v === '' ? undefined : Number(v));
const clean = <T extends object>(o: T): T => { const c: any = { ...o }; for (const k of Object.keys(c)) if (c[k] === undefined || c[k] === '' || c[k] === false || (typeof c[k] === 'number' && Number.isNaN(c[k]))) delete c[k]; return c; };

function N({ label, value, onChange, min = 0, max = 400, hint }: { label: string; value: number | undefined; onChange: (v: number | undefined) => void; min?: number; max?: number; hint?: string }) {
  return <Field label={label} hint={hint}><input type="number" min={min} max={max} className={`${inpW} w-28`} value={value ?? ''} onChange={(e) => onChange(num(e.target.value))} /></Field>;
}
function MonthDay({ value, onChange, onRemove }: { value: [number, number]; onChange: (v: [number, number]) => void; onRemove?: () => void }) {
  return (
    <span className="inline-flex items-center gap-1">
      <select aria-label="Month" className={`${inpW} w-32`} value={value[0]} onChange={(e) => onChange([Number(e.target.value), value[1]])}>{MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}</select>
      <input aria-label="Day" type="number" min={1} max={31} className={`${inpW} w-16`} value={value[1]} onChange={(e) => onChange([value[0], Number(e.target.value) || 1])} />
      {onRemove && <button type="button" aria-label="Remove date" className={`${btnSm} text-rose-700`} onClick={onRemove}><Trash2 className="h-3 w-3" /></button>}
    </span>
  );
}

/** The next dates a rule gives, for a sample year end and a sample start date. */
export function previewDates(rule: DueRule, pack: CountryPack, sampleFye: string, sampleDate: string, extra?: Pick<Compliance, 'roll' | 'moved'>, count = 3) {
  const ent = pack.entityTypes.find((e) => !pack.calendarYearKinds.includes(e.kind)) ?? pack.entityTypes[0];
  const st = pack.states.find((s) => !ent?.onlyStates || ent.onlyStates.includes(s.code)) ?? pack.states[0];
  if (!ent || !st) return { dates: [], needs: undefined as string | undefined };
  const answers: Record<string, string> = { fye: sampleFye };
  for (const q of pack.questions) { if (q.type === 'date') answers[q.id] = sampleDate; if (q.type === 'monthday') answers[q.id] = sampleFye; }
  const x = makeCtx(pack, { country: pack.code, state: st.code, entity: ent.id, depts: pack.departments.map((d) => d.id) }, answers);
  if (!x) return { dates: [], needs: undefined };
  try { return dueDates(rule, x, new Date().toISOString().slice(0, 10), count, extra?.roll === false ? false : undefined, extra?.moved); } catch { return { dates: [], needs: undefined }; }
}

export default function DueBuilder({ value, onChange, pack, extra }: { value: DueRule; onChange: (r: DueRule) => void; pack: CountryPack; extra?: Pick<Compliance, 'roll' | 'moved'> }) {
  const [fye, setFye] = useState(pack.fixedYearEnd ? `${String(pack.fixedYearEnd[0]).padStart(2, '0')}-${String(pack.fixedYearEnd[1]).padStart(2, '0')}` : '12-31');
  const [start, setStart] = useState('2020-03-15');
  const r = value;
  const set = (patch: object) => onChange(clean({ ...r, ...patch }) as DueRule);
  const dateQs = pack.questions.filter((q) => q.type === 'date');
  const preview = useMemo(() => previewDates(r, pack, fye, start, extra), [r, pack, fye, start, extra]);
  const basis = 'basis' in r ? (
    <Field label="Counted on"><select className={`${inpW} w-56`} value={r.basis} onChange={(e) => set({ basis: e.target.value })}><option value="fy">the person&apos;s own financial year</option><option value="cal">the calendar year</option></select></Field>) : null;

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <Field label="How is the due date worked out?" hint={TYPES.find((x) => x.t === r.t)?.hint}>
        <select aria-label="Kind of due date" className={`${inp} max-w-md`} value={r.t} onChange={(e) => onChange(blank(e.target.value as DueRule['t'], pack))}>{TYPES.map((x) => <option key={x.t} value={x.t}>{x.label}</option>)}</select>
      </Field>
      <div className="mt-3 flex flex-wrap items-end gap-3">
        {r.t === 'afterYearEnd' && <>
          {basis}
          <N label="Months after" value={r.months} onChange={(v) => set({ months: v })} max={60} />
          <N label="On day of that month" hint="optional" value={r.day} onChange={(v) => set({ day: v })} min={1} max={31} />
          <N label="Plus days" hint="optional" value={r.days} onChange={(v) => set({ days: v })} min={-31} />
          <Field label="But never later than" hint="optional, in the next calendar year">
            {r.capNextCal ? <MonthDay value={r.capNextCal} onChange={(v) => set({ capNextCal: v })} onRemove={() => set({ capNextCal: undefined })} /> : <button type="button" className={btnSm} onClick={() => set({ capNextCal: [3, 31] })}><Plus className="h-3 w-3" />Add a latest date</button>}
          </Field>
        </>}
        {r.t === 'afterPeriodEnd' && <>
          <Field label="After each"><select className={`${inpW} w-36`} value={r.freq} onChange={(e) => set({ freq: e.target.value })}><option value="monthly">month</option><option value="quarterly">quarter</option><option value="semiannual">half-year</option></select></Field>
          {r.freq !== 'monthly' && basis}
          <N label="Months after" value={r.months} onChange={(v) => set({ months: v })} max={12} />
          <N label="On day of that month" hint="optional" value={r.day} onChange={(v) => set({ day: v })} min={1} max={31} />
          <N label="Plus days" hint="optional" value={r.days} onChange={(v) => set({ days: v })} min={-31} />
          {r.freq === 'monthly' && <label className="flex items-center gap-1.5 pb-2 text-xs font-semibold text-slate-700"><input type="checkbox" checked={!!r.skipQuarterEnd} onChange={(e) => set({ skipQuarterEnd: e.target.checked })} />Skip the last month of each quarter</label>}
        </>}
        {r.t === 'fixed' && <>
          <Field label="Date(s)"><span className="flex flex-wrap gap-2">{r.dates.map((d, i) => <MonthDay key={i} value={d} onChange={(v) => set({ dates: r.dates.map((x, j) => (j === i ? v : x)) })} onRemove={r.dates.length > 1 ? () => set({ dates: r.dates.filter((_, j) => j !== i) }) : undefined} />)}<button type="button" className={btnSm} onClick={() => set({ dates: [...r.dates, [1, 31]] })}><Plus className="h-3 w-3" />Add a date</button></span></Field>
          <Field label="Every"><select className={`${inpW} w-40`} value={r.years ?? ''} onChange={(e) => set({ years: e.target.value || undefined })}><option value="">year</option><option value="even">even-numbered year</option><option value="odd">odd-numbered year</option></select></Field>
          <label className="flex items-center gap-1.5 pb-2 text-xs font-semibold text-slate-700"><input type="checkbox" checked={r.forYear === -1} onChange={(e) => set({ forYear: e.target.checked ? -1 : undefined })} />It reports the year before</label>
        </>}
        {r.t === 'inYear' && <>
          {basis}
          <Field label="In these months of the year" hint="1 = first month of the year"><input className={`${inpW} w-48`} value={r.months.join(', ')} onChange={(e) => set({ months: e.target.value.split(/[^0-9]+/).filter(Boolean).map(Number).filter((n) => n >= 1 && n <= 24) })} /></Field>
          <N label="On day" value={r.day} onChange={(v) => set({ day: v ?? 15 })} min={1} max={31} />
        </>}
        {r.t === 'anniversary' && <>
          <Field label="The date comes from this question">{dateQs.length ? <select className={`${inpW} w-80`} value={r.of} onChange={(e) => set({ of: e.target.value })}>{dateQs.map((q) => <option key={q.id} value={q.id}>{q.text.slice(0, 70)}</option>)}</select> : <span className="text-xs text-rose-700">Add a question of type "A date" first (Info Forms).</span>}</Field>
          <Field label="Due on"><select className={`${inpW} w-64`} value={r.monthStart ? 'ms' : r.monthEnd ? 'me' : r.quarterEnd ? 'qe' : r.at ? 'at' : 'day'} onChange={(e) => { const v = e.target.value; set({ monthStart: v === 'ms', monthEnd: v === 'me', quarterEnd: v === 'qe', at: v === 'at' ? [4, 1] : undefined }); }}>
            <option value="day">the anniversary day itself</option><option value="ms">the first day of the anniversary month</option><option value="me">the last day of the anniversary month</option><option value="qe">the end of that calendar quarter</option><option value="at">a fixed day of the year</option></select></Field>
          {r.at && <Field label="Fixed day"><MonthDay value={r.at} onChange={(v) => set({ at: v })} /></Field>}
          <N label="Plus months" hint="optional" value={r.months} onChange={(v) => set({ months: v })} max={24} />
          <N label="Plus days" hint="optional" value={r.days} onChange={(v) => set({ days: v })} min={-60} />
          <N label="Every N years" hint="1 = yearly" value={r.every} onChange={(v) => set({ every: v && v > 1 ? v : undefined })} min={1} max={10} />
          {(r.every ?? 1) > 1 && <N label="First one after N years" hint="optional" value={r.offset} onChange={(v) => set({ offset: v })} max={9} />}
        </>}
        {r.t === 'on' && <Field label="Date(s)"><span className="flex flex-wrap gap-2">{r.dates.map((d, i) => <span key={i} className="inline-flex items-center gap-1"><input type="date" className={`${inpW} w-44`} value={d} onChange={(e) => set({ dates: r.dates.map((x, j) => (j === i ? e.target.value : x)) })} /><button type="button" aria-label="Remove date" className={`${btnSm} text-rose-700`} onClick={() => set({ dates: r.dates.filter((_, j) => j !== i) })}><Trash2 className="h-3 w-3" /></button></span>)}<button type="button" className={btnSm} onClick={() => set({ dates: [...r.dates, ''] })}><Plus className="h-3 w-3" />Add a date</button></span></Field>}
        {r.t === 'event' && <Field label="What triggers it, in a few words" wide><input className={`${inpW} w-[32rem] max-w-full`} value={r.text} placeholder="Within 30 days of becoming liable" onChange={(e) => onChange({ t: 'event', text: e.target.value })} /></Field>}
      </div>
      <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-900">
        <p><b>In words:</b> {describeDue(r, pack)}</p>
        {r.t !== 'event' && (
          <p className="mt-1 flex flex-wrap items-center gap-2"><b>Next dates it gives:</b> {preview.dates.length ? preview.dates.map((d) => <span key={d.date} className="rounded bg-white px-1.5 py-0.5 font-semibold">{fmt(d.date)}{d.was ? ` (moved from ${fmt(d.was)})` : ''}</span>) : <span>none{preview.needs ? ' (needs a date from the person)' : ''}</span>}
            <span className="text-emerald-800">for a sample</span>
            {!pack.fixedYearEnd && <label className="inline-flex items-center gap-1">year end <input aria-label="Sample year end" className="w-16 rounded border border-emerald-300 px-1 py-0.5" value={fye} onChange={(e) => setFye(e.target.value)} placeholder="MM-DD" /></label>}
            {r.t === 'anniversary' && <label className="inline-flex items-center gap-1">start date <input aria-label="Sample start date" type="date" className="rounded border border-emerald-300 px-1 py-0.5" value={start} onChange={(e) => setStart(e.target.value)} /></label>}
          </p>)}
      </div>
    </div>
  );
}
