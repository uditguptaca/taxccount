import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPacks } from '@/lib/compliance-catalog';
import { fmt } from '@/lib/compliance/engine';
import { countryBySlug, countryGuide, slugOf } from '@/lib/compliance/guide';
import { CheckCta, Crumbs, SITE, jsonLd } from '@/components/compliance/GuideParts';

export async function generateMetadata({ params }: { params: { country: string } }): Promise<Metadata> {
  const pack = countryBySlug(await getPacks(), params.country);
  if (!pack) return { title: 'Not found' };
  const g = countryGuide(pack);
  return {
    title: `${pack.name} compliance guide: ${g.total} filings with due dates and official sources`,
    description: `What a person or a business has to file in ${pack.name}: ${g.departments.slice(0, 5).map((d) => d.name.toLowerCase()).join(', ')}. Due dates, penalties and the government page behind each one.`,
    alternates: { canonical: `${SITE}/compliance/${params.country}` },
  };
}

export default async function CountryGuidePage({ params }: { params: { country: string } }) {
  const pack = countryBySlug(await getPacks(), params.country);
  if (!pack) notFound();
  const g = countryGuide(pack);
  const url = `${SITE}/compliance/${params.country}`;
  return (
    <>
      {jsonLd({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: SITE }, { '@type': 'ListItem', position: 2, name: 'Compliance guides', item: `${SITE}/compliance` }, { '@type': 'ListItem', position: 3, name: pack.name, item: url }] })}
      <Crumbs trail={[{ name: 'Home', href: '/' }, { name: 'Compliance guides', href: '/compliance' }, { name: pack.name }]} />
      <h1 className="text-3xl font-extrabold tracking-tight">Compliance in {pack.name}: what you have to file, and when</h1>
      <p className="mt-2 max-w-3xl text-slate-700">We track {g.total} filings, renewals and reports in {pack.name}, tax and non-tax. {g.verified} of them were checked against the government&apos;s own page{g.latestCheck ? `, most recently on ${fmt(g.latestCheck)}` : ''}; the rest are marked for you to confirm. Pick who you are to see what can apply.</p>

      <h2 className="mt-8 text-xl font-bold">By kind of person or business</h2>
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        {g.entities.map((e) => (
          <Link key={e.slug} href={`/compliance/${params.country}/${e.slug}`} className="rounded-xl border border-slate-200 bg-white p-4 hover:border-indigo-400" data-entity={e.slug}>
            <h3 className="text-base font-bold">{e.name}</h3>
            <p className="text-sm text-slate-600">{e.desc}</p>
            <p className="mt-1 text-xs font-semibold text-indigo-700">Up to {e.count} can apply. See the list →</p>
          </Link>))}
      </div>

      <h2 className="mt-8 text-xl font-bold">By area</h2>
      <div className="mt-3 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm"><thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-4 py-2">Area</th><th className="px-4 py-2">What it covers</th><th className="px-4 py-2 text-right">Filings</th></tr></thead>
          <tbody>{g.departments.map((d) => (<tr key={d.name} className="border-t border-slate-100 align-top"><td className="px-4 py-2 font-semibold">{d.name}</td><td className="px-4 py-2 text-slate-600">{d.desc}<span className="mt-1 block text-xs text-slate-500">{d.heads.slice(0, 8).join(' · ')}</span></td><td className="px-4 py-2 text-right font-bold">{d.count}</td></tr>))}</tbody></table>
      </div>

      <h2 className="mt-8 text-xl font-bold">{pack.stateLabel} covered</h2>
      <p className="mt-1 text-sm text-slate-600">{g.states.join(', ')}.</p>

      <div className="mt-8"><CheckCta text={`Find out what applies to you in ${pack.name}`} /></div>
    </>
  );
}
