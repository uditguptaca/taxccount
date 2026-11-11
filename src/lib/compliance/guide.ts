// The public guide pages (/compliance/...): what a country asks of each kind of person or business, in general.
// They show the headings, how many filings sit under each, and a few filings in full with their official source.
// Which filings apply to ONE person, with that person's dates, is what the checker works out. Pure.
import type { Compliance, CountryPack, EntityType } from './types.ts';
import { condRefs, describeCond, describeDue } from './describe.ts';
import { evalCond, entityTypesFor, makeCtx } from './engine.ts';

export const slugOf = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
export const countryBySlug = (packs: CountryPack[], slug: string) => packs.find((p) => slugOf(p.name) === slug);
export const entityBySlug = (pack: CountryPack, slug: string) => pack.entityTypes.find((e) => slugOf(e.id) === slug);

export interface GuideItem { id: string; name: string; form?: string; head: string; authority: string; brief: string; dueText: string; dueRule: string; penalty?: string; penaltySourceUrl?: string; appliesWhen: string; verified: boolean; sourceUrl: string; sourceTitle: string; sourcePublisher: string; sourceChecked: string }
const item = (p: CountryPack, c: Compliance): GuideItem => {
  const s = p.sources.find((x) => x.id === c.source);
  const ps = c.penaltySource ? p.sources.find((x) => x.id === c.penaltySource) : undefined;
  return { penaltySourceUrl: ps?.url, id: c.id, name: c.name, form: c.form, head: c.head, authority: c.authority, brief: c.brief, dueText: c.dueText, dueRule: describeDue(c.due, p), penalty: c.penalty, appliesWhen: describeCond(c.applies, p).replace(/ AND /g, ' and ').replace(/ OR /g, ' or ').replace(/NOT \(/g, 'not ('),
    verified: c.verified, sourceUrl: s?.url ?? '', sourceTitle: s?.title ?? '', sourcePublisher: s?.publisher ?? '', sourceChecked: s?.checked ?? '' };
};

/** What can apply to one entity type anywhere in the country: every filing that is not ruled out by the entity type itself. */
export function canApply(pack: CountryPack, e: EntityType): Compliance[] {
  const state = pack.states.find((s) => entityTypesFor(pack, s.code).some((x) => x.id === e.id)) ?? pack.states[0];
  const x = makeCtx(pack, { country: pack.code, state: state?.code ?? '', entity: e.id, depts: pack.departments.map((d) => d.id) }, {}, true);
  if (!x) return [];
  // a rule about one state is tested without the state, so that the page speaks for the whole country
  const anyState = (c: Compliance) => { const r = condRefs(c.applies); return r.states.size > 0 || r.stags.size > 0; };
  return pack.compliances.filter((c) => anyState(c) ? pack.states.some((s) => evalCond(c.applies, { ...x, sel: { ...x.sel, state: s.code }, state: s })) : evalCond(c.applies, x));
}

export interface EntityGuide { total: number; shown: GuideItem[]; rest: number; byDept: { name: string; count: number; heads: { head: string; count: number }[] }[]; verified: number; latestCheck: string }
/** The page for one entity type: the most central filings in full, the rest by heading and count. */
export function entityGuide(pack: CountryPack, e: EntityType, show = 6): EntityGuide {
  const all = canApply(pack, e);
  // country-wide filings first, the most central first; a filing that needs no answer at all leads
  const needs = (c: Compliance) => condRefs(c.applies).questions.size;
  const local = (c: Compliance) => { const r = condRefs(c.applies); return r.states.size + r.stags.size > 0 ? 1 : 0; };
  const top = [...all].sort((a, b) => local(a) - local(b) || b.weight - a.weight || needs(a) - needs(b) || a.name.localeCompare(b.name)).slice(0, show);
  const byDept = pack.departments.map((d) => {
    const mine = all.filter((c) => c.dept === d.id);
    const heads = Array.from(new Set(mine.map((c) => c.head))).map((h) => ({ head: h, count: mine.filter((c) => c.head === h).length })).sort((a, b) => b.count - a.count);
    return { name: d.name, count: mine.length, heads };
  }).filter((d) => d.count > 0);
  const checks = all.map((c) => pack.sources.find((s) => s.id === c.source)?.checked ?? '').filter(Boolean).sort();
  return { total: all.length, shown: top.map((c) => item(pack, c)), rest: all.length - top.length, byDept, verified: all.filter((c) => c.verified).length, latestCheck: checks[checks.length - 1] ?? '' };
}

export interface CountryGuide { total: number; verified: number; sources: number; entities: { slug: string; name: string; desc: string; count: number }[]; departments: { name: string; desc: string; count: number; heads: string[] }[]; states: string[]; latestCheck: string }
export function countryGuide(pack: CountryPack): CountryGuide {
  const checks = pack.sources.map((s) => s.checked).filter(Boolean).sort();
  return {
    total: pack.compliances.length, verified: pack.compliances.filter((c) => c.verified).length, sources: pack.sources.length,
    entities: pack.entityTypes.map((e) => ({ slug: slugOf(e.id), name: e.name, desc: e.desc, count: canApply(pack, e).length })),
    departments: pack.departments.map((d) => { const mine = pack.compliances.filter((c) => c.dept === d.id); return { name: d.name, desc: d.desc, count: mine.length, heads: Array.from(new Set(mine.map((c) => c.head))) }; }).filter((d) => d.count > 0),
    states: pack.states.map((s) => s.name), latestCheck: checks[checks.length - 1] ?? '',
  };
}
