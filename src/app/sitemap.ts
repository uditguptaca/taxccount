// The pages search engines should know about: the homepage and the public compliance guides.
import type { MetadataRoute } from 'next';
import { PACKS } from '@/lib/compliance/index';
import { slugOf } from '@/lib/compliance/guide';

const SITE = 'https://www.abidebylaw.com';
export default function sitemap(): MetadataRoute.Sitemap {
  const out: MetadataRoute.Sitemap = [
    { url: `${SITE}/`, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE}/compliance`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE}/features`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE}/compliance-guide`, changeFrequency: 'monthly', priority: 0.5 },
  ];
  for (const p of PACKS) {
    const latest = p.sources.map((s) => s.checked).filter(Boolean).sort().pop();
    const lastModified = latest ? new Date(latest + 'T00:00:00Z') : undefined;      // the day its sources were last read
    out.push({ url: `${SITE}/compliance/${slugOf(p.name)}`, changeFrequency: 'weekly', priority: 0.8, lastModified });
    for (const e of p.entityTypes) out.push({ url: `${SITE}/compliance/${slugOf(p.name)}/${slugOf(e.id)}`, changeFrequency: 'weekly', priority: 0.7, lastModified });
  }
  return out;
}
