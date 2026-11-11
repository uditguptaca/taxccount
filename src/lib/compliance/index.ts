// The countries the checker knows. To add a country: write src/lib/compliance/countries/<code>.ts
// (a CountryPack) and add it to this list. Nothing else in the app needs to change.
import type { CountryPack } from './types.ts';
import { questionLinks } from './describe.ts';
import { canada } from './countries/ca.ts';
import { usa } from './countries/us.ts';
import { india } from './countries/in.ts';
import { uae } from './countries/ae.ts';

export const PACKS: CountryPack[] = [canada, usa, india, uae];
export const packOf = (code: string): CountryPack | undefined => PACKS.find((p) => p.code === code);
export const CHECKER_VERSION = PACKS.map((p) => `${p.code}:${p.version}`).join(' ');
/** What the homepage needs to draw the four selectors and the questions: no filings, no sources. */
export function lightPack(p: CountryPack): CountryPack {
  // each question also says what its answer is used for, by heading only: the filings themselves stay on the server
  const links = questionLinks(p);
  const questions = p.questions.map((q) => {
    const l = links.get(q.id);
    if (!l) return q;
    const all = [...l.compliances, ...l.dates];
    return { ...q, about: { heads: Array.from(new Set(all.map((c) => c.head))).slice(0, 4), count: new Set(l.compliances.map((c) => c.id)).size, dates: new Set(l.dates.map((c) => c.id)).size, opens: l.questions.length } };
  });
  return { ...p, questions, compliances: [], sources: [] };
}
