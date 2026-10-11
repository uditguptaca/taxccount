// Versioned, year-specific rules. A rule is only used as tax logic when its status is "verified" for
// EXACTLY that tax year. Anything else produces a preparer review item (see validate.ts).
// Nothing here carries from one year into the next automatically.
import type { L } from '../types.ts';

export type RuleStatus = 'verified' | 'needs_review';
export type RuleKind = 'enacted' | 'proposed' | 'announced';
export interface YearRule {
  id: string; year: number; value: number | string | boolean; unit?: 'cad' | 'percent' | 'date' | 'text' | 'bool';
  label: L; source: string; checked: string; status: RuleStatus; kind: RuleKind; note?: string;
}
const C = '2026-10-11';
const v = (id: string, year: number, value: YearRule['value'], unit: YearRule['unit'], label: L, source: string, extra: Partial<YearRule> = {}): YearRule =>
  ({ id, year, value, unit, label, source, checked: C, status: 'verified', kind: 'enacted', ...extra });

export const SUPPORTED_YEARS = [2025, 2024, 2023, 2022, 2021, 2020] as const;
/** The year whose rules have been checked against official pages in this build. */
export const VERIFIED_YEARS = [2025];

export const RULES: YearRule[] = [
  // ── 2025 (verified against official pages on the date checked) ──
  v('filing.deadline', 2025, '2026-04-30', 'date', ['Filing and payment deadline', 'Date limite de production et de paiement'], 'cra.dates'),
  v('filing.deadlineSelfEmployed', 2025, '2026-06-15', 'date', ['Filing deadline if you or your spouse carried on a business', 'Date limite de production si vous ou votre conjoint exploitiez une entreprise'], 'cra.dates', { note: 'Payment is still due 30 April 2026.' }),
  v('rrsp.dollarLimit', 2025, 32490, 'cad', ['RRSP dollar limit', 'Plafond des cotisations à un REER'], 'cra.rrsp'),
  v('rrsp.deadline', 2025, '2026-03-02', 'date', ['Last day to contribute for 2025', 'Dernier jour pour cotiser pour 2025'], 'cra.rrsp'),
  v('fhsa.annualLimit', 2025, 8000, 'cad', ['FHSA annual participation room', 'Droit de participation annuel au CELIAPP'], 'cra.fhsa'),
  v('fhsa.lifetimeLimit', 2025, 40000, 'cad', ['FHSA lifetime limit', 'Plafond à vie du CELIAPP'], 'cra.fhsa'),
  v('fhsa.carryforwardMax', 2025, 8000, 'cad', ['Most participation room that can be carried forward', 'Droit de participation maximal reportable'], 'cra.fhsa'),
  v('capgains.inclusionRate', 2025, 0.5, 'percent', ['Capital gains inclusion rate (gains realized before 1 January 2026)', 'Taux d\'inclusion des gains en capital (gains réalisés avant le 1er janvier 2026)'], 'cra.capgainsUpdate', { note: 'The proposed increase was cancelled.' }),
  v('lcge.limit', 2025, 1250000, 'cad', ['Lifetime capital gains exemption (qualifying small business shares, farm and fishing property)', 'Exonération cumulative des gains en capital'], 'cra.capgainsUpdate', { status: 'needs_review', note: 'Reported by secondary sources; confirm on the CRA page.' }),
  v('medical.threshold', 2025, 2834, 'cad', ['Medical expense dollar threshold', 'Seuil en dollars des frais médicaux'], 'cra.medical'),
  v('medical.percent', 2025, 0.03, 'percent', ['Medical expense percentage of net income', 'Pourcentage du revenu net pour les frais médicaux'], 'cra.medical'),
  v('t1135.cost', 2025, 100000, 'cad', ['T1135 reporting threshold (cost amount at any time in the year)', 'Seuil de déclaration du formulaire T1135 (coût)'], 'cra.t1135'),
  v('t1135.detailedCost', 2025, 250000, 'cad', ['T1135 detailed method from this total cost', 'Méthode détaillée du formulaire T1135 à partir de ce coût total'], 'cra.t1135'),
  v('qc.foreignProperty', 2025, 100000, 'cad', ['Québec foreign property return threshold (total cost at any time in the year)', 'Seuil de la déclaration des biens étrangers au Québec'], 'rq.foreign'),
  v('homeOffice.flatRate', 2025, false, 'bool', ['Temporary flat-rate home office method available', 'Méthode à taux fixe pour le travail à domicile disponible'], 'cra.homeOffice'),
  v('carbon.rebate', 2025, false, 'bool', ['Federal fuel charge and carbon rebate questions apply', 'Questions sur la redevance sur les combustibles et le remboursement'], 'cra.season2026', { note: 'The federal fuel charge ended 1 April 2025. The last farmers credit is for 2024 and 2025.' }),
  // ── provincial and Québec figures read from official pages (2025) ──
  v('bc.renter.max', 2025, 400, 'cad', ['BC renter\'s tax credit maximum', 'Crédit d\'impôt pour locataires de la C.-B., maximum'], 'prov.bc.renter'),
  v('bc.renter.months', 2025, 6, 'text', ['Months of rented occupancy needed', 'Mois d\'occupation requis'], 'prov.bc.renter'),
  v('mb.hatc.max', 2025, 1500, 'cad', ['Manitoba Homeowners Affordability Tax Credit (lesser of this and school taxes)', 'Crédit d\'impôt pour l\'abordabilité des propriétaires du Manitoba'], 'prov.mb.hatc'),
  v('sk.fertility.base', 2025, 20000, 'cad', ['Saskatchewan fertility treatment: eligible expenses up to (50% credit, once in a lifetime)', 'Traitements de fertilité en Saskatchewan : dépenses admissibles jusqu\'à (crédit de 50 %, une seule fois)'], 'prov.sk.fertility'),
  v('sk.homebuyer.base', 2025, 15000, 'cad', ['Saskatchewan first-time home buyers\' amount (base, split between spouses)', 'Montant des premiers acheteurs de la Saskatchewan (base, partagé entre conjoints)'], 'prov.sk.homebuyer'),
  v('pe.wellness.max', 2025, 1000, 'cad', ['PEI children\'s wellness credit per child', 'Crédit pour le mieux-être des enfants de l\'Î.-P.-É., par enfant'], 'cra.prov.pe'),
  v('pe.firefighter', 2025, 1000, 'cad', ['PEI volunteer firefighter and search and rescue credit', 'Crédit des pompiers volontaires et bénévoles en recherche et sauvetage de l\'Î.-P.-É.'], 'cra.prov.pe'),
  v('yt.fitness.cap', 2025, 1000, 'cad', ['Yukon children\'s fitness credit: eligible fees cap per child', 'Crédit pour la condition physique des enfants du Yukon : plafond par enfant'], 'cra.prov.yt'),
  v('nu.youngChild', 2025, 1200, 'cad', ['Nunavut young children amount per child under 6', 'Montant pour jeunes enfants du Nunavut, par enfant de moins de 6 ans'], 'cra.prov.nu'),
  v('qc.solidarity.alone', 2025, 64545, 'cad', ['Québec solidarity credit: maximum family income, no spouse', 'Crédit de solidarité : revenu familial maximal, sans conjoint'], 'rq.solidarity'),
  v('qc.solidarity.couple', 2025, 70395, 'cad', ['Québec solidarity credit: maximum family income, with a spouse', 'Crédit de solidarité : revenu familial maximal, avec conjoint'], 'rq.solidarity'),
  v('qc.drug.max', 2025, 755, 'cad', ['Québec prescription drug insurance premium maximum (per person)', 'Prime maximale du régime d\'assurance médicaments du Québec (par personne)'], 'rq.drug'),
  v('qc.career.minAge', 2025, 65, 'text', ['Québec career extension credit: minimum age (was 60 before 2025)', 'Crédit pour prolongation de carrière : âge minimal (60 ans avant 2025)'], 'rq.career'),
  v('qc.career.max', 2025, 1750, 'cad', ['Québec career extension credit maximum', 'Crédit pour prolongation de carrière, maximum'], 'rq.career'),
  v('qc.work.alone', 2025, 1185.52, 'cad', ['Québec work premium maximum, person living alone', 'Prime au travail maximale, personne seule'], 'rq.work'),
  // ── earlier years: dates and limits listed here have NOT been re-verified in this build ──
  v('filing.deadline', 2024, '2025-04-30', 'date', ['Filing and payment deadline', 'Date limite de production et de paiement'], 'cra.dates', { status: 'needs_review' }),
  v('rrsp.dollarLimit', 2024, 31560, 'cad', ['RRSP dollar limit', 'Plafond des cotisations à un REER'], 'cra.rrsp', { status: 'needs_review' }),
  v('rrsp.dollarLimit', 2023, 30780, 'cad', ['RRSP dollar limit', 'Plafond des cotisations à un REER'], 'cra.rrsp', { status: 'needs_review' }),
  v('homeOffice.flatRate', 2022, true, 'bool', ['Temporary flat-rate home office method available', 'Méthode à taux fixe pour le travail à domicile disponible'], 'cra.homeOffice', { status: 'needs_review', note: 'Available 2020 to 2022 only; $2 per day to a maximum of $500 for 2022.' }),
  v('homeOffice.flatRate', 2021, true, 'bool', ['Temporary flat-rate home office method available', 'Méthode à taux fixe pour le travail à domicile disponible'], 'cra.homeOffice', { status: 'needs_review' }),
  v('homeOffice.flatRate', 2020, true, 'bool', ['Temporary flat-rate home office method available', 'Méthode à taux fixe pour le travail à domicile disponible'], 'cra.homeOffice', { status: 'needs_review' }),
  v('homeOffice.flatRate', 2024, false, 'bool', ['Temporary flat-rate home office method available', 'Méthode à taux fixe pour le travail à domicile disponible'], 'cra.homeOffice'),
  v('homeOffice.flatRate', 2023, false, 'bool', ['Temporary flat-rate home office method available', 'Méthode à taux fixe pour le travail à domicile disponible'], 'cra.homeOffice'),
];

export const ruleFor = (id: string, year: number): YearRule | undefined => RULES.find((r) => r.id === id && r.year === year);
/** The rule's value, but ONLY when it has been verified for exactly this year. */
export function verifiedValue(id: string, year: number): YearRule['value'] | null {
  const r = ruleFor(id, year);
  return r && r.status === 'verified' ? r.value : null;
}
export const isVerifiedYear = (year: number) => VERIFIED_YEARS.includes(year);

export function formatRule(r: YearRule, lang: 'en' | 'fr' = 'en'): string {
  if (r.unit === 'cad') return new Intl.NumberFormat(lang === 'fr' ? 'fr-CA' : 'en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }).format(Number(r.value));
  if (r.unit === 'percent') return `${Math.round(Number(r.value) * 1000) / 10} %`;
  if (r.unit === 'date') return new Date(String(r.value) + 'T12:00:00').toLocaleDateString(lang === 'fr' ? 'fr-CA' : 'en-CA', { year: 'numeric', month: 'long', day: 'numeric' });
  return String(r.value);
}

/** Token lookup for help text: {{rrsp.dollarLimit|your CRA notice}} */
export function tokenLookup(year: number, lang: 'en' | 'fr' = 'en') {
  return (token: string): string | null => {
    const r = ruleFor(token, year);
    return r && r.status === 'verified' ? formatRule(r, lang) : null;
  };
}

/** The rules a preparer must still confirm for this tax year. */
export function unverifiedRules(year: number): { id: string; label: L; reason: L }[] {
  if (!isVerifiedYear(year)) {
    return [{ id: 'year', label: [`Tax year ${year}`, `Année d'imposition ${year}`], reason: [`The ${year} thresholds, dates and credits have not been checked against official sources in this system. Your preparer will confirm them.`, `Les seuils, dates et crédits de ${year} n'ont pas été vérifiés auprès des sources officielles dans ce système. Votre préparateur les confirmera.`] }];
  }
  return RULES.filter((r) => r.year === year && r.status !== 'verified').map((r) => ({ id: r.id, label: r.label, reason: ['Reported by secondary sources only; the preparer must confirm it on the official page.', 'Rapporté par des sources secondaires seulement; le préparateur doit le confirmer sur la page officielle.'] as const }));
}
