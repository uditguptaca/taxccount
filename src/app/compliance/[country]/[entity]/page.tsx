import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPacks } from '@/lib/compliance-catalog';
import { fmt } from '@/lib/compliance/engine';
import { countryBySlug, entityBySlug, entityGuide, slugOf } from '@/lib/compliance/guide';
import { CheckCta, Crumbs, GuideCard, SITE, jsonLd } from '@/components/compliance/GuideParts';

type P = { params: { country: string; entity: string } };
const an = (s: string) => (/^[aeiou]/i.test(s) ? 'an' : 'a');

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const pack = countryBySlug(await getPacks(), params.country);
  const e = pack && entityBySlug(pack, params.entity);
  if (!pack || !e) return { title: 'Not found' };
  const g = entityGuide(pack, e);
  return {
    title: `Compliance checklist for ${an(e.name)} ${e.name.toLowerCase()} in ${pack.name}: filings and due dates`,
    description: `Up to ${g.total} filings can apply to ${an(e.name)} ${e.name.toLowerCase()} in ${pack.name}: ${g.byDept.slice(0, 4).map((d) => d.name.toLowerCase()).join(', ')}. See the main ones with their due dates, penalties and official sources.`,
    alternates: { canonical: `${SITE}/compliance/${params.country}/${params.entity}` },
  };
}

export default async function EntityGuidePage({ params }: P) {
  const pack = countryBySlug(await getPacks(), params.country);
  const e = pack && entityBySlug(pack, params.entity);
  if (!pack || !e) notFound();
  const g = entityGuide(pack, e);
  const url = `${SITE}/compliance/${params.country}/${params.entity}`;
  const who = `${an(e.name)} ${e.name.toLowerCase()}`;
  return (
    <>
      {jsonLd({ '@context': 'https://schema.org', '@graph': [
        { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: SITE }, { '@type': 'ListItem', position: 2, name: 'Compliance guides', item: `${SITE}/compliance` }, { '@type': 'ListItem', position: 3, name: pack.name, item: `${SITE}/compliance/${params.country}` }, { '@type': 'ListItem', position: 4, name: e.name, item: url }] },
        { '@type': 'ItemList', name: `Main filings for ${who} in ${pack.name}`, numberOfItems: g.shown.length, itemListElement: g.shown.map((i, n) => ({ '@type': 'ListItem', position: n + 1, name: i.name })) },
      ] })}
      <Crumbs trail={[{ name: 'Home', href: '/' }, { name: 'Compliance guides', href: '/compliance' }, { name: pack.name, href: `/compliance/${params.country}` }, { name: e.name }]} />
      <h1 className="text-3xl font-extrabold tracking-tight">Compliance checklist for {who} in {pack.name}</h1>
      <p className="mt-2 max-w-3xl text-slate-700">{e.desc} Up to <b>{g.total}</b> filings, renewals and reports can apply, depending on the {pack.stateLabel.toLowerCase()}, what the business does and who it pays. {g.verified} of them were checked against the government&apos;s own page{g.latestCheck ? `, most recently on ${fmt(g.latestCheck)}` : ''}.</p>

      <div className="mt-6"><CheckCta text={`Which of the ${g.total} apply to you, and when is each due?`} sub="Answer a few questions and get your own list with dates worked out from your year end. Free." /></div>

      <h2 className="mt-8 text-xl font-bold">The main ones</h2>
      <p className="mt-1 text-sm text-slate-600">The most central filings for {who}, with the rule as the authority states it.</p>
      <div className="mt-3 space-y-3">{g.shown.map((i) => <GuideCard key={i.id} i={i} />)}</div>

      {g.rest > 0 && <>
        <h2 className="mt-8 text-xl font-bold">And up to {g.rest} more, by area</h2>
        <p className="mt-1 text-sm text-slate-600">Whether each applies depends on your answers. The free check works that out and gives you the dates.</p>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {g.byDept.map((d) => (
            <div key={d.name} className="rounded-xl border border-slate-200 bg-white p-4" data-area={d.name}>
              <h3 className="text-sm font-bold">{d.name} <span className="font-semibold text-slate-500">· {d.count}</span></h3>
              <ul className="mt-1 text-xs text-slate-600">{d.heads.map((h) => <li key={h.head} className="flex justify-between border-t border-slate-100 py-1 first:border-0"><span>{h.head}</span><span className="font-semibold">{h.count}</span></li>)}</ul>
            </div>))}
        </div>
      </>}

      <h2 className="mt-8 text-xl font-bold">Other kinds of person and business in {pack.name}</h2>
      <p className="mt-2 flex flex-wrap gap-2 text-sm">{pack.entityTypes.filter((x) => x.id !== e.id).map((x) => <Link key={x.id} className="rounded-full border border-slate-300 bg-white px-3 py-1 font-semibold text-slate-700 hover:border-indigo-500 hover:text-indigo-700" href={`/compliance/${params.country}/${slugOf(x.id)}`}>{x.name}</Link>)}</p>
      <div className="mt-8"><CheckCta /></div>
    </>
  );
}
