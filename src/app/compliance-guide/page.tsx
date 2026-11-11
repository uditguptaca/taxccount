// "What missing one costs": real penalties from the rules, each with the government page it was read on.
// (This address used to hold a page of promises the product could not keep. It now holds only what was read.)
import type { Metadata } from 'next';
import Link from 'next/link';
import { Arrow, SiteFooter, SiteHeader } from '@/components/site/Chrome';
import { getPacks } from '@/lib/compliance-catalog';
import { siteData } from '@/lib/site-data';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'What missing a filing costs',
  description: 'Penalties for late or missed filings in Canada, the United States, India and the UAE, in each authority’s own terms, with the official page each was read on.',
};

export default async function CostsPage() {
  const [d, packs] = await Promise.all([siteData(), getPacks()]);
  const groups = packs.map((p) => ({
    name: p.name,
    rows: p.compliances.filter((c) => c.penalty && c.penaltySource && c.verified).sort((a, b) => (b.weight ?? 0) - (a.weight ?? 0)).slice(0, 8)
      .map((c) => ({ id: c.id, name: c.name, form: c.form, penalty: c.penalty!, src: p.sources.find((s) => s.id === c.penaltySource) })).filter((r) => r.src),
  })).filter((g) => g.rows.length > 0);
  return (
    <div className="ab">
      <SiteHeader light />
      <main>
        <div className="ab-wrap ab-page-top">
          <h1>What missing one costs.</h1>
          <p className="ab-lede">Late-filing penalties are set by each authority and they differ a great deal. These are the central filings in each country, in the authority’s own terms, each with the page it was read on. Of the {d.total} compliances in the check, {d.withPenalty} carry a penalty like these.</p>
        </div>
        <div className="ab-wrap" style={{ paddingBottom: 'clamp(3rem, 6vw, 5rem)' }}>
          {groups.map((g) => (
            <section key={g.name} className="ab-does" data-costs={g.name}>
              <h2>{g.name}</h2>
              <ul>
                {g.rows.map((r) => (
                  <li key={r.id}><b>{r.name}{r.form ? ` (${r.form})` : ''}</b><span>{r.penalty} <a className="ab-link" href={r.src!.url} target="_blank" rel="noopener noreferrer nofollow">Read on {r.src!.publisher}</a>.</span></li>
                ))}
              </ul>
            </section>
          ))}
          <section className="ab-does">
            <h2>Which ones apply to you</h2>
            <div>
              <p className="ab-not">A penalty only matters if the filing is yours. The free check asks a few questions and lists the ones that apply to you, with their dates. <b>This is general information, not legal or tax advice</b>: amounts and rules change, so confirm on the official page before you act.</p>
              <p style={{ marginTop: '1.6rem' }}><Link href="/#compliance-checker" className="ab-btn ab-btn-brand">Run the free check<Arrow /></Link></p>
            </div>
          </section>
        </div>
      </main>
      <SiteFooter countries={d.countries} />
    </div>
  );
}
