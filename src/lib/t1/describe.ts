// Plain-language descriptions of the rules, for the admin's explorer ("this question appears when...").
import type { Cond, Lang } from './types.ts';
import type { Catalogue } from './evaluate.ts';

const short = (s: string, n = 70) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);

export function describeCond(c: Cond | boolean | undefined, cat: Catalogue, lang: Lang = 'en', depth = 0): string {
  if (c === undefined) return '';
  if (c === true) return lang === 'fr' ? 'toujours' : 'always';
  if (c === false) return lang === 'fr' ? 'jamais' : 'never';
  const i = lang === 'fr' ? 1 : 0;
  const name = (id: string) => { const q = cat.q.get(id.startsWith('.') ? id : id); return q ? `“${short(q.text[i])}”` : id; };
  const valueLabel = (id: string, v: unknown) => { const o = cat.q.get(id)?.opts?.find((x) => x.v === String(v)); return o ? o[lang] : String(v); };
  const join = (xs: string[], word: string) => xs.join(` ${word} `);
  const paren = (s: string) => (depth > 0 ? `(${s})` : s);
  if ('all' in c) return paren(join(c.all.map((x) => describeCond(x, cat, lang, depth + 1)), lang === 'fr' ? 'et' : 'and'));
  if ('any' in c) return paren(join(c.any.map((x) => describeCond(x, cat, lang, depth + 1)), lang === 'fr' ? 'ou' : 'or'));
  if ('not' in c) return `${lang === 'fr' ? 'pas' : 'not'} ${describeCond(c.not, cat, lang, depth + 1)}`;
  if ('prov' in c) return `${lang === 'fr' ? 'province ou territoire' : 'province or territory'} ${c.prov.join(', ')}`;
  if ('years' in c) return `${lang === 'fr' ? 'année' : 'tax year'} ${c.years[0] ?? '…'}–${c.years[1] ?? '…'}`;
  if ('span' in c) return `${lang === 'fr' ? 'écart de dates' : 'gap between dates'} ${c.span.op === 'lt' || c.span.op === 'lte' ? '<' : '>'} ${c.span.days} ${lang === 'fr' ? 'jours' : 'days'}`;
  if ('age' in c) return `${lang === 'fr' ? 'âge' : 'age'} ${c.age.op === 'gt' ? '>' : c.age.op === 'gte' ? '≥' : c.age.op === 'lt' ? '<' : '≤'} ${c.age.v}`;
  if ('count' in c) return `${lang === 'fr' ? 'nombre de fiches' : 'number of records'} ${c.count.op === 'gt' ? '>' : c.count.op === 'gte' ? '≥' : c.count.op === 'lt' ? '<' : '='} ${c.count.v}`;
  if ('rec' in c) return `${lang === 'fr' ? 'au moins une fiche où' : 'at least one record where'} ${describeCond(c.rec.where, cat, lang, depth + 1)}`;
  const q = name(c.q);
  switch (c.op) {
    case 'yes': return `${q} = ${lang === 'fr' ? 'Oui' : 'Yes'}`;
    case 'no': return `${q} = ${lang === 'fr' ? 'Non' : 'No'}`;
    case 'maybe': return `${q} = ${lang === 'fr' ? 'Oui ou pas certain' : 'Yes or not sure'}`;
    case 'unsure': return `${q} ${lang === 'fr' ? 'est marqué « pas certain »' : 'is marked “not sure”'}`;
    case 'later': return `${q} ${lang === 'fr' ? 'est à fournir plus tard' : 'is marked “provide later”'}`;
    case 'ask': return `${q} ${lang === 'fr' ? 'est une question pour le préparateur' : 'is marked “ask my preparer”'}`;
    case 'answered': return `${q} ${lang === 'fr' ? 'est répondu' : 'is answered'}`;
    case 'blank': return `${q} ${lang === 'fr' ? 'est vide' : 'is blank'}`;
    case 'eq': return `${q} = ${valueLabel(c.q, c.v)}`;
    case 'ne': return `${q} ≠ ${valueLabel(c.q, c.v)}`;
    case 'in': return `${q} ${lang === 'fr' ? 'est' : 'is'} ${(Array.isArray(c.v) ? c.v : []).map((v) => valueLabel(c.q, v)).join(' / ')}`;
    case 'nin': return `${q} ${lang === 'fr' ? 'n’est pas' : 'is not'} ${(Array.isArray(c.v) ? c.v : []).map((v) => valueLabel(c.q, v)).join(' / ')}`;
    case 'has': return `${q} ${lang === 'fr' ? 'comprend' : 'includes'} ${valueLabel(c.q, c.v)}`;
    case 'gt': return `${q} > ${c.v}`; case 'gte': return `${q} ≥ ${c.v}`; case 'lt': return `${q} < ${c.v}`; case 'lte': return `${q} ≤ ${c.v}`;
  }
  return '';
}
