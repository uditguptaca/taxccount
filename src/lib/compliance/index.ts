// The countries the checker knows. To add a country: write src/lib/compliance/countries/<code>.ts
// (a CountryPack) and add it to this list. Nothing else in the app needs to change.
import type { CountryPack } from './types.ts';
import { canada } from './countries/ca.ts';
import { usa } from './countries/us.ts';
import { india } from './countries/in.ts';
import { uae } from './countries/ae.ts';

export const PACKS: CountryPack[] = [canada, usa, india, uae];
export const packOf = (code: string): CountryPack | undefined => PACKS.find((p) => p.code === code);
export const CHECKER_VERSION = PACKS.map((p) => `${p.code}:${p.version}`).join(' ');

/** What the homepage needs to draw the four selectors and the questions: no filings, no sources. */
export function lightPack(p: CountryPack): CountryPack { return { ...p, compliances: [], sources: [] }; }
