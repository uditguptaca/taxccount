import type { Metadata } from 'next';
import Link from 'next/link';
import { getPacks } from '@/lib/compliance-catalog';
import { countryGuide, slugOf } from '@/lib/compliance/guide';
import { CheckCta, Crumbs, SITE, jsonLd } from '@/components/compliance/GuideParts';

export const metadata: Metadata = {
  title: 'Compliance guides by country: filings, due dates and official sources',
  description: 'What a person or a business has to file in Canada, the United States, India and the UAE: tax and non-tax duties, their due dates, the penalty for missing them and the government page each one comes from.',
  alternates: { canonical: `${SITE}/compliance` },
};

export default async function GuideIndex() {
  const packs = await getPacks();
  const rows = packs.map((p) => ({ p, g: countryGuide(p) }));
  const total = rows.reduce((n, r) => n + r.g.total, 0);
  return (
    <>
      {jsonLd({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: SITE }, { '@type': 'ListItem', position: 2, name: 'Compliance guides', item: `${SITE}/compliance` }] })}
      <Crumbs trail={[{ name: 'Home', href: '/' }, { name: 'Compliance guides' }]} />
      <h1 className="text-3xl font-extrabold tracking-tight">Compliance guides by country</h1>
      <p className="mt-2 max-w-3xl text-slate-700">Every filing, renewal and report we track for a person or a business: {total.toLocaleString()} in {rows.length} countries, tax and non-tax. Each one names the government page it was read on and the date that page was last checked.</p>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {rows.map(({ p, g }) => (
          <Link key={p.code} href={`/compliance/${slugOf(p.name)}`} className="rounded-2xl border border-slate-200 bg-white p-5 hover:border-indigo-400" data-country={p.code}>
            <h2 className="text-xl font-bold">{p.name}</h2>
            <p className="mt-1 text-sm text-slate-600">{g.total} compliances across {g.departments.length} areas, for {g.entities.length} kinds of person and business. {g.verified} checked against the official source.</p>
            <p className="mt-2 text-xs text-slate-500">{g.departments.slice(0, 6).map((d) => d.name).join(' · ')}</p>
          </Link>))}
      </div>
      <div className="mt-8"><CheckCta /></div>
    </>
  );
}
