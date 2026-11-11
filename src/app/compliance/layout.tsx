// The public guide: what each country asks of each kind of person or business, from the same rules the checker
// runs on. Open to everyone and to search engines. The frame (header, footer) is the public website's.
import Scope from '@/components/t1/Scope';
import { SiteFooter, SiteHeader } from '@/components/site/Chrome';
import { getPacks } from '@/lib/compliance-catalog';
import { slugOf } from '@/lib/compliance/guide';

export const dynamic = 'force-dynamic';       // read from the rules as they stand in Service Master, never at build time

export default async function GuideLayout({ children }: { children: React.ReactNode }) {
  const packs = await getPacks();
  return (
    <div className="ab">
      <SiteHeader light />
      <div className="ab-guide-main">
        <Scope><main className="mx-auto max-w-6xl px-4 text-slate-900">{children}</main></Scope>
      </div>
      <SiteFooter countries={packs.map((p) => ({ name: p.name, slug: slugOf(p.name) }))} />
    </div>
  );
}
