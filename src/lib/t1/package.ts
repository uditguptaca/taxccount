// The preparer's package: the client's answers laid out as a readable organizer, with the open items,
// documents and findings beside them. Plain data in, plain data out, so the screen, the CSV and the
// printable copy all come from the same place.
import type { AnswerValue, Ctx, Finding, L, Lang, Module, Question, RowValue, UploadedDoc } from './types.ts';
import type { Catalogue, ChecklistItem, ModuleProgress, Slot } from './evaluate.ts';
import { answerOf, applicable, checklist, fillTokens, inactiveAnswers, progress, provinceOf, recordLabel, recordsOf, valueOf } from './evaluate.ts';
import { isBlank } from './dsl.ts';
import { tokenLookup, unverifiedRules, isVerifiedYear } from './config/years.ts';

const i = (lang: Lang) => (lang === 'fr' ? 1 : 0);
export const text = (l: L, lang: Lang, year: number) => fillTokens(l[i(lang)], tokenLookup(year, lang));

const money = (x: unknown, lang: Lang) => {
  const v = typeof x === 'number' ? x : Number(String(x).replace(/[$,\s]/g, ''));
  return isFinite(v) ? new Intl.NumberFormat(lang === 'fr' ? 'fr-CA' : 'en-CA', { style: 'currency', currency: 'CAD' }).format(v) : String(x);
};

/** An answer as a person would read it. */
export function display(q: Question, v: AnswerValue | undefined, lang: Lang): string {
  if (isBlank(v)) return '';
  const opt = (x: unknown) => { const o = q.opts?.find((o) => o.v === String(x)); return o ? o[lang] : String(x); };
  switch (q.type) {
    case 'yn': return v === 'yes' ? (lang === 'fr' ? 'Oui' : 'Yes') : v === 'no' ? (lang === 'fr' ? 'Non' : 'No') : v === 'unsure' ? (lang === 'fr' ? 'Je ne suis pas certain' : "I'm not sure") : String(v);
    case 'radio': case 'select': return opt(v);
    case 'multi': return Array.isArray(v) ? (v as unknown[]).map(opt).join(', ') : opt(v);
    case 'currency': return money(v, lang);
    case 'percentage': return `${v} %`;
    case 'rows': {
      const rows = (Array.isArray(v) ? v : []) as RowValue[];
      return rows.map((r) => (q.cols ?? []).map((c) => {
        const x = r[c.id]; if (x === null || x === undefined || x === '') return '';
        const shown = c.type === 'currency' ? money(x, lang) : c.type === 'select' ? (c.opts?.find((o) => o.v === String(x))?.[lang] ?? String(x)) : String(x);
        return `${c.t[i(lang)]}: ${shown}`;
      }).filter(Boolean).join(', ')).filter(Boolean).join(' | ');
    }
    case 'sin': return String(v);
    default: return String(v);
  }
}

export interface PackageRow {
  qid: string; rec: number; label: string; value: string; flag?: 'unsure' | 'later' | 'ask'; note?: string;
  form?: string; mapVerified?: boolean; sens?: string; required: boolean; missing: boolean;
}
export interface PackageRecord { rec: number; title: string; rows: PackageRow[] }
export interface PackageSection { id: string; title: string; repeat: boolean; records: PackageRecord[] }
export interface PackageModule { code: string; title: string; status: ModuleProgress['status']; counts: { applicable: number; answered: number; missing: number; unsure: number; ask: number; later: number }; sections: PackageSection[] }

export interface Package {
  meta: { year: number; lang: Lang; province: string | null; catalogueVersion: string; generatedAt: string; filingType?: string; taxpayer: string };
  overall: { percent: number; required: number; requiredAnswered: number };
  modules: PackageModule[];
  missing: PackageRow[];
  flagged: PackageRow[];
  documents: ChecklistItem[];
  findings: Finding[];
  noLongerInForm: { qid: string; label: string; rec: number; value: string }[];
  unverified: string[];
  summary: string[];
}

export function buildPackage(cat: Catalogue, ctx: Ctx, o: { lang?: Lang; uploads?: UploadedDoc[]; findings?: Finding[]; generatedAt?: string; taxpayer?: string } = {}): Package {
  const lang = o.lang ?? 'en', year = ctx.year;
  const slots = applicable(cat, ctx);
  const prog = progress(cat, ctx, slots);
  const byMod = new Map(prog.modules.map((m) => [m.code, m]));
  const slotKey = (s: Slot) => `${s.q.id}|${s.rec}`;
  const missing: PackageRow[] = [], flagged: PackageRow[] = [];
  const modules: PackageModule[] = [];
  const row = (s: Slot): PackageRow => {
    const a = answerOf(ctx, s.q.id, s.rec);
    return {
      qid: s.q.id, rec: s.rec, label: text(s.q.text, lang, year), value: display(s.q, a?.v, lang), flag: a?.flag, note: a?.note,
      form: s.q.map ? `${s.q.map.form}${s.q.map.box ? ` box ${s.q.map.box}` : ''}${s.q.map.line ? ` line ${s.q.map.line}` : ''}` : undefined, mapVerified: s.q.map?.verified,
      sens: s.q.sens, required: s.required, missing: s.required && isBlank(a?.v) && !a?.flag,
    };
  };
  const bySlot = new Map<string, PackageRow>();
  for (const s of slots) { const r = row(s); bySlot.set(slotKey(s), r); if (r.missing) missing.push(r); if (r.flag || r.value === (lang === 'fr' ? 'Je ne suis pas certain' : "I'm not sure")) flagged.push(r); }
  for (const m of cat.modules) {
    const p = byMod.get(m.code); if (!p) continue;
    const sections: PackageSection[] = [];
    for (const sec of m.sections) {
      const mine = slots.filter((s) => s.sec.id === sec.id);
      if (!mine.length) continue;
      const recs = new Map<number, PackageRow[]>();
      for (const s of mine) { const l = recs.get(s.rec) ?? []; l.push(bySlot.get(slotKey(s))!); recs.set(s.rec, l); }
      sections.push({
        id: sec.id, title: text(sec.title, lang, year), repeat: !!sec.repeat,
        records: Array.from(recs.entries()).sort((a, b) => a[0] - b[0]).map(([rec, rows]) => ({ rec, title: sec.repeat ? recordLabel(cat, ctx, sec.id, rec, lang) : '', rows })),
      });
    }
    modules.push({ code: m.code, title: text(m.title, lang, year), status: p.status, counts: { applicable: p.applicable, answered: p.answered, missing: p.missingRequired.length, unsure: p.unsure, ask: p.ask, later: p.later }, sections });
  }
  const docs = checklist(cat, ctx, o.uploads ?? [], slots);
  const unv = unverifiedRules(year).map((u) => u.label[i(lang)]);
  const findings = o.findings ?? [];
  const noLonger = inactiveAnswers(cat, ctx).map((x) => ({ qid: x.q.id, label: text(x.q.text, lang, year), rec: x.rec, value: display(x.q, x.answer.v, lang) }));
  const summary: string[] = [];
  const act = modules.map((m) => m.title);
  summary.push(lang === 'fr' ? `Modules applicables : ${act.join(', ')}.` : `Applicable modules: ${act.join(', ')}.`);
  const emp = recordsOf(cat, ctx, 'G.t4').length, jobs = recordsOf(cat, ctx, 'H.job').length;
  const counts: { n: number; one: [string, string]; many: [string, string] }[] = [
    { n: emp, one: ['T4', 'T4'], many: ['T4s', 'T4'] }, { n: jobs, one: ['job', 'emploi'], many: ['jobs', 'emplois'] },
    { n: recordsOf(cat, ctx, 'M.prop').length, one: ['rental property', 'immeuble locatif'], many: ['rental properties', 'immeubles locatifs'] },
    { n: recordsOf(cat, ctx, 'E.dep').length, one: ['dependant', 'personne à charge'], many: ['dependants', 'personnes à charge'] },
    { n: recordsOf(cat, ctx, 'O.sale').length, one: ['sale of property', 'vente de biens'], many: ['sales of property', 'ventes de biens'] },
    { n: recordsOf(cat, ctx, 'J.biz').length, one: ['business', 'entreprise'], many: ['businesses', 'entreprises'] },
  ];
  const parts = counts.filter((c) => c.n > 0).map((c) => `${c.n} ${(c.n === 1 ? c.one : c.many)[lang === 'fr' ? 1 : 0]}`);
  if (parts.length) summary.push(parts.join(', ') + '.');
  if (!isVerifiedYear(year)) summary.push(lang === 'fr' ? `Les règles de ${year} n'ont pas été vérifiées : tout chiffre doit être confirmé.` : `The ${year} rules are not verified: confirm every figure.`);
  return {
    meta: { year, lang, province: provinceOf(ctx), catalogueVersion: cat.version, generatedAt: o.generatedAt ?? new Date().toISOString(), filingType: ctx.filingType, taxpayer: o.taxpayer ?? [valueOf(ctx, 'B.name.first'), valueOf(ctx, 'B.name.last')].filter(Boolean).join(' ') },
    overall: { percent: prog.overall.percent, required: prog.overall.required, requiredAnswered: prog.overall.requiredAnswered },
    modules, missing, flagged, documents: docs, findings, noLongerInForm: noLonger, unverified: unv, summary,
  };
}

// ── exports ──
const csvCell = (x: unknown) => { const s = String(x ?? ''); return /[",\n\r]/.test(s) || /^[=+\-@]/.test(s) ? `"${(/^[=+\-@]/.test(s) ? "'" + s : s).replace(/"/g, '""')}"` : s; };

/** One row per answer, ready for a spreadsheet. Cells that start with = + - @ are neutralised so a client's text can never run as a formula. */
export function toCsv(p: Package, o: { maskSin?: boolean } = {}): string {
  const head = ['module', 'section', 'record', 'question_id', 'question', 'answer', 'flag', 'client_note', 'form_reference', 'required', 'missing'];
  const lines = [head.join(',')];
  for (const m of p.modules) for (const s of m.sections) for (const r of s.records) for (const x of r.rows) {
    const hide = o.maskSin && x.sens === 'restricted';
    lines.push([m.code, s.title, r.title || (s.repeat ? r.rec + 1 : ''), x.qid, x.label, hide ? maskValue(x.value) : x.value, x.flag ?? '', x.note ?? '', x.form ?? '', x.required ? 'yes' : '', x.missing ? 'yes' : ''].map(csvCell).join(','));
  }
  return lines.join('\r\n') + '\r\n';
}
export const maskValue = (v: string) => (v.replace(/\D/g, '').length >= 9 ? `*** *** ${v.replace(/\D/g, '').slice(-3)}` : v ? '••••' : '');

/** A plain-text printable copy for the file. */
export function toText(p: Package, o: { maskSin?: boolean } = {}): string {
  const fr = p.meta.lang === 'fr';
  const out: string[] = [];
  out.push(`${fr ? 'Organisateur T1' : 'T1 organizer'} ${p.meta.year}: ${p.meta.taxpayer}`);
  out.push(`${fr ? 'Province' : 'Province'}: ${p.meta.province ?? '—'}   ${fr ? 'Version du formulaire' : 'Form version'}: ${p.meta.catalogueVersion}`);
  out.push(...p.summary, '');
  if (p.missing.length) { out.push(fr ? 'À COMPLÉTER' : 'STILL MISSING'); for (const m of p.missing) out.push(`  - ${m.label}`); out.push(''); }
  if (p.flagged.length) { out.push(fr ? 'MARQUÉ PAR LE CLIENT' : 'FLAGGED BY THE CLIENT'); for (const f of p.flagged) out.push(`  - [${f.flag ?? 'unsure'}] ${f.label}${f.note ? ` — ${f.note}` : ''}`); out.push(''); }
  for (const m of p.modules) {
    out.push(`== ${m.code}. ${m.title} (${m.status}) ==`);
    for (const s of m.sections) {
      out.push(`  ${s.title}`);
      for (const r of s.records) {
        if (r.title) out.push(`    ${r.title}`);
        for (const x of r.rows) if (x.value || x.flag) out.push(`      ${x.label}: ${o.maskSin && x.sens === 'restricted' ? maskValue(x.value) : x.value}${x.flag ? ` [${x.flag}]` : ''}`);
      }
    }
    out.push('');
  }
  if (p.documents.length) { out.push(fr ? 'DOCUMENTS' : 'DOCUMENTS'); for (const d of p.documents) out.push(`  [${d.status}] ${d.label[fr ? 1 : 0]}${d.recLabel ? ` (${d.recLabel})` : ''}`); out.push(''); }
  if (p.findings.length) { out.push(fr ? 'POINTS À VÉRIFIER' : 'POINTS TO CHECK'); for (const f of p.findings) out.push(`  [${f.sev}] ${f.title[fr ? 1 : 0]}`); }
  return out.join('\n');
}
