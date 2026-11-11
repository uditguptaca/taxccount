// Pieces shared by the public guide pages. Server components: no browser code.
import Link from 'next/link';
import { fmt } from '@/lib/compliance/engine';
import type { GuideItem } from '@/lib/compliance/guide';

const day = (iso: string) => (/^\d{4}-\d{2}-\d{2}$/.test(iso) ? fmt(iso) : '');

export function Crumbs({ trail }: { trail: { name: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4 text-xs text-slate-500">
      {trail.map((t, i) => <span key={i}>{i > 0 && <span className="mx-1.5">›</span>}{t.href ? <Link className="hover:text-indigo-700 hover:underline" href={t.href}>{t.name}</Link> : <span className="text-slate-700">{t.name}</span>}</span>)}
    </nav>
  );
}

export function CheckCta({ text = 'Find out which of these apply to you', sub = 'Free, about three minutes, no sign-up to see your first results.' }: { text?: string; sub?: string }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-indigo-200 bg-indigo-50 p-5">
      <div><p className="text-base font-bold text-slate-900">{text}</p><p className="text-sm text-slate-600">{sub}</p></div>
      <Link href="/#compliance-checker" className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-indigo-500">Check my compliances</Link>
    </div>
  );
}

/** One filing in full: what it is, who, when, what it costs to miss, and the government page it was read on. */
export function GuideCard({ i }: { i: GuideItem }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4" data-guide-item={i.id}>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-indigo-700">{i.head} · {i.authority}</p>
      <h3 className="text-base font-bold text-slate-900">{i.name}{i.form ? <span className="ml-2 text-sm font-semibold text-slate-500">{i.form}</span> : null}</h3>
      <p className="mt-1 text-sm text-slate-700">{i.brief}</p>
      <dl className="mt-2 grid gap-x-6 gap-y-1 text-xs text-slate-600 md:grid-cols-2">
        <div><dt className="inline font-semibold text-slate-800">When it is due: </dt><dd className="inline">{i.dueText}</dd></div>
        <div><dt className="inline font-semibold text-slate-800">Who it applies to: </dt><dd className="inline">{i.appliesWhen}</dd></div>
        {i.penalty ? <div className="md:col-span-2"><dt className="inline font-semibold text-slate-800">If it is missed: </dt><dd className="inline">{i.penalty}</dd></div> : null}
      </dl>
      <p className="mt-2 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[11px] text-slate-600">
        <span className={`font-semibold ${i.verified ? 'text-emerald-700' : 'text-amber-700'}`}>{i.verified ? 'Checked against the official source' : 'Confirm on the official source'}</span>
        {i.sourceUrl ? <> · <b className="text-slate-800">Official government source:</b> {i.sourcePublisher ? `${i.sourcePublisher}, ` : ''}<a className="text-indigo-700 underline" href={i.sourceUrl} target="_blank" rel="noopener noreferrer nofollow">{i.sourceTitle || 'official page'}</a></> : null}
        {day(i.sourceChecked) ? <> · <b className="text-slate-800">{i.verified ? 'Last checked:' : 'Page last opened:'}</b> {day(i.sourceChecked)}</> : null}
      </p>
    </article>
  );
}

export const jsonLd = (data: object) => <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }} />;
export const SITE = 'https://www.abidebylaw.com';
