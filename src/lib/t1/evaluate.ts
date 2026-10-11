// The rules engine: which modules, sections and questions apply to THIS taxpayer and tax year,
// what is answered, what is missing, and what honest status each part is in.
// A blank answer is never read as "No" or as zero: every comparison on a blank answer is false.
import type { AnswerValue, Answer, Cond, Ctx, Module, Province, Question, Section, UploadedDoc, DocRequest, L } from './types.ts';
import { ak, PROVINCES } from './types.ts';
import { isBlank } from './dsl.ts';

export const PROVINCE_Q = 'B.res.province';
export const SPOUSE_RETURN_Q = 'D.spouse.sameReturn';

export interface Catalogue {
  version: string;
  modules: Module[];
  q: Map<string, Question>;
  sec: Map<string, Section>;
  mod: Map<string, Module>;
}

export function indexCatalogue(version: string, modules: Module[]): Catalogue {
  const q = new Map<string, Question>(), sec = new Map<string, Section>(), mod = new Map<string, Module>();
  for (const m of modules) {
    mod.set(m.code, m);
    for (const s of m.sections) { sec.set(s.id, s); for (const x of s.qs) q.set(x.id, x); }
  }
  return { version, modules, q, sec, mod };
}

// ── answers ──
export const answerOf = (ctx: Ctx, q: string, rec = 0): Answer | undefined => ctx.answers[ak(q, rec)];
export const valueOf = (ctx: Ctx, q: string, rec = 0): AnswerValue | undefined => answerOf(ctx, q, rec)?.v;

export function provinceOf(ctx: Ctx): Province | null {
  const v = valueOf(ctx, PROVINCE_Q);
  if (typeof v === 'string' && (PROVINCES as string[]).includes(v)) return v as Province;
  return ctx.province ?? null;
}

/** Record numbers that exist for a repeating section: those stored for it plus any that have an answer. */
export function recordsOf(cat: Catalogue, ctx: Ctx, group: string): number[] {
  const set = new Set<number>(ctx.records?.[group] ?? []);
  const s = cat.sec.get(group);
  if (s) {
    const ids = new Set(s.qs.map((x) => x.id));
    for (const key of Object.keys(ctx.answers)) {
      const i = key.lastIndexOf('|');
      if (ids.has(key.slice(0, i)) && (!isBlank(ctx.answers[key].v) || ctx.answers[key].flag)) set.add(Number(key.slice(i + 1)));
    }
  }
  return Array.from(set).sort((a, b) => a - b);
}

// ── conditions ──
const num = (v: unknown): number | null => (typeof v === 'number' ? v : typeof v === 'string' && v.trim() !== '' && !isNaN(Number(v)) ? Number(v) : null);

export function evalCond(c: Cond | undefined, cat: Catalogue, ctx: Ctx, at: { group?: string; rec: number } = { rec: 0 }): boolean {
  if (!c) return true;
  if ('all' in c) return c.all.every((x) => evalCond(x, cat, ctx, at));
  if ('any' in c) return c.any.some((x) => evalCond(x, cat, ctx, at));
  if ('not' in c) return !evalCond(c.not, cat, ctx, at);
  if ('prov' in c) { const p = provinceOf(ctx); return !!p && c.prov.includes(p); }
  if ('years' in c) return (c.years[0] === null || ctx.year >= c.years[0]) && (c.years[1] === null || ctx.year <= c.years[1]);
  if ('span' in c) {
    const f = valueOf(ctx, c.span.from.startsWith('.') ? `${at.group ?? ''}${c.span.from}` : c.span.from, at.rec), t = valueOf(ctx, c.span.to.startsWith('.') ? `${at.group ?? ''}${c.span.to}` : c.span.to, at.rec);
    const iso = /^\d{4}-\d{2}-\d{2}$/;
    if (typeof f !== 'string' || typeof t !== 'string' || !iso.test(f) || !iso.test(t)) return false;
    const d = Math.round((Date.parse(t) - Date.parse(f)) / 86400000);
    return c.span.op === 'lt' ? d < c.span.days : c.span.op === 'lte' ? d <= c.span.days : c.span.op === 'gt' ? d > c.span.days : d >= c.span.days;
  }
  if ('age' in c) {
    const dob = valueOf(ctx, c.age.q, 0);
    if (typeof dob !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(dob)) return false;
    const age = ctx.year - Number(dob.slice(0, 4)); // everyone has had their birthday by 31 December
    return c.age.op === 'gt' ? age > c.age.v : c.age.op === 'gte' ? age >= c.age.v : c.age.op === 'lt' ? age < c.age.v : age <= c.age.v;
  }
  if ('count' in c) {
    const n = recordsOf(cat, ctx, c.count.group).length;
    return c.count.op === 'gt' ? n > c.count.v : c.count.op === 'gte' ? n >= c.count.v : c.count.op === 'lt' ? n < c.count.v : n === c.count.v;
  }
  if ('rec' in c) return recordsOf(cat, ctx, c.rec.group).some((r) => evalCond(c.rec.where, cat, ctx, { group: c.rec.group, rec: r }));
  // a single comparison on one answer
  const question = cat.q.get(c.q);
  const rec = question && question.sec === at.group ? at.rec : 0;
  const a = answerOf(ctx, c.q, rec);
  const v = a?.v;
  switch (c.op) {
    case 'unsure': return a?.flag === 'unsure' || v === 'unsure';
    case 'later': return a?.flag === 'later';
    case 'ask': return a?.flag === 'ask';
    case 'maybe': return v === 'yes' || v === 'unsure' || a?.flag === 'unsure';
    case 'blank': return isBlank(v);
    case 'answered': return !isBlank(v);
  }
  if (isBlank(v)) return false; // never guess from a blank
  const want = c.v;
  switch (c.op) {
    case 'yes': return v === 'yes';
    case 'no': return v === 'no';
    case 'eq': return String(v) === String(want);
    case 'ne': return String(v) !== String(want);
    case 'in': return Array.isArray(want) && want.map(String).includes(String(v));
    case 'nin': return Array.isArray(want) && !want.map(String).includes(String(v));
    case 'has': return Array.isArray(v) && (v as unknown[]).map(String).includes(String(want));
    case 'gt': case 'gte': case 'lt': case 'lte': {
      const a1 = num(v), b1 = num(want);
      if (a1 === null || b1 === null) return false;
      return c.op === 'gt' ? a1 > b1 : c.op === 'gte' ? a1 >= b1 : c.op === 'lt' ? a1 < b1 : a1 <= b1;
    }
  }
  return false;
}

// ── visibility ──
export const inYears = (y: [number | null, number | null] | undefined, year: number) => !y || ((y[0] === null || year >= y[0]) && (y[1] === null || year <= y[1]));

export function moduleActive(cat: Catalogue, ctx: Ctx, m: Module): boolean {
  if (m.always) return true;
  return evalCond(m.show, cat, ctx);
}
export function sectionVisible(cat: Catalogue, ctx: Ctx, s: Section): boolean {
  const m = cat.mod.get(s.mod)!;
  return moduleActive(cat, ctx, m) && evalCond(s.show, cat, ctx);
}
export function questionVisible(cat: Catalogue, ctx: Ctx, q: Question, rec = 0): boolean {
  const s = cat.sec.get(q.sec)!;
  if (!sectionVisible(cat, ctx, s)) return false;
  if (!inYears(q.years, ctx.year)) return false;
  if (q.prov) { const p = provinceOf(ctx); if (!p || !q.prov.includes(p)) return false; }
  return evalCond(q.show, cat, ctx, { group: q.sec, rec });
}
export function isRequired(cat: Catalogue, ctx: Ctx, q: Question, rec = 0): boolean {
  if (q.type === 'info' || q.readOnly) return false;
  if (q.req === undefined || q.req === false) return false;
  if (q.req === true) return true;
  return evalCond(q.req, cat, ctx, { group: q.sec, rec });
}

export interface Slot { q: Question; sec: Section; mod: Module; rec: number; required: boolean }

/** Every question the taxpayer actually has to deal with, expanded by record for repeating sections. */
export function applicable(cat: Catalogue, ctx: Ctx, onlyMod?: string): Slot[] {
  const out: Slot[] = [];
  for (const m of cat.modules) {
    if (onlyMod && m.code !== onlyMod) continue;
    if (!moduleActive(cat, ctx, m)) continue;
    for (const s of m.sections) {
      if (!evalCond(s.show, cat, ctx)) continue;
      const recs = s.repeat ? recordsOf(cat, ctx, s.id) : [0];
      for (const r of recs) {
        for (const q of s.qs) {
          if (q.type === 'info') continue;
          if (!questionVisible(cat, ctx, q, r)) continue;
          out.push({ q, sec: s, mod: m, rec: r, required: isRequired(cat, ctx, q, r) });
        }
      }
    }
  }
  return out;
}

/** Answers that exist but no longer apply (the client changed an earlier answer). They are kept, never deleted. */
export function inactiveAnswers(cat: Catalogue, ctx: Ctx): { q: Question; rec: number; answer: Answer }[] {
  const live = new Set(applicable(cat, ctx).map((s) => ak(s.q.id, s.rec)));
  const out: { q: Question; rec: number; answer: Answer }[] = [];
  for (const [key, a] of Object.entries(ctx.answers)) {
    if (isBlank(a.v) && !a.flag) continue;
    if (live.has(key)) continue;
    const i = key.lastIndexOf('|');
    const q = cat.q.get(key.slice(0, i));
    if (q && q.type !== 'info') out.push({ q, rec: Number(key.slice(i + 1)), answer: a });
  }
  return out;
}

export function recordLabel(cat: Catalogue, ctx: Ctx, secId: string, rec: number, lang: 'en' | 'fr' = 'en'): string {
  const s = cat.sec.get(secId);
  if (!s) return `#${rec + 1}`;
  const parts: string[] = [];
  for (const q of s.qs) if (q.label) { const v = valueOf(ctx, q.id, rec); if (!isBlank(v)) parts.push(String(v)); }
  const base = s.repeat?.label[lang === 'fr' ? 1 : 0] ?? '';
  return parts.length ? `${base}: ${parts.join(' · ')}` : `${base} ${rec + 1}`;
}

// ── progress and honest status ──
export type ModuleStatus = 'not_started' | 'in_progress' | 'awaiting_documents' | 'needs_clarification' | 'complete';
export interface ModuleProgress {
  code: string; applicable: number; answered: number; required: number; requiredAnswered: number;
  unsure: number; ask: number; later: number; missingRequired: Slot[]; status: ModuleStatus;
}

export function progress(cat: Catalogue, ctx: Ctx, slots: Slot[] = applicable(cat, ctx)): { modules: ModuleProgress[]; overall: { answered: number; applicable: number; requiredAnswered: number; required: number; percent: number } } {
  const mods: ModuleProgress[] = [];
  for (const m of cat.modules) {
    if (!moduleActive(cat, ctx, m)) continue;
    const mine = slots.filter((s) => s.mod.code === m.code);
    let answered = 0, required = 0, requiredAnswered = 0, unsure = 0, ask = 0, later = 0;
    const missing: Slot[] = []; let deferredFiles = 0;
    for (const s of mine) {
      const a = answerOf(ctx, s.q.id, s.rec);
      const has = !isBlank(a?.v);
      if (has) answered++;
      if (a?.flag === 'unsure' || a?.v === 'unsure') unsure++;
      if (a?.flag === 'ask') ask++;
      if (a?.flag === 'later') { later++; if (s.q.type === 'file') deferredFiles++; }
      if (s.required) { required++; if (has) requiredAnswered++; else missing.push(s); }
    }
    const started = answered > 0 || unsure + ask + later > 0;
    let status: ModuleStatus;
    if (!started) status = 'not_started';
    else if (unsure + ask > 0) status = 'needs_clarification';
    else if (missing.length > 0 && missing.every((s) => answerOf(ctx, s.q.id, s.rec)?.flag === 'later' && s.q.type === 'file')) status = 'awaiting_documents';
    else if (missing.length > 0 || later > 0) status = later > 0 && deferredFiles === later && missing.length === 0 ? 'awaiting_documents' : 'in_progress';
    else status = 'complete';
    mods.push({ code: m.code, applicable: mine.length, answered, required, requiredAnswered, unsure, ask, later, missingRequired: missing, status });
  }
  const t = mods.reduce((a, m) => ({ answered: a.answered + m.answered, applicable: a.applicable + m.applicable, requiredAnswered: a.requiredAnswered + m.requiredAnswered, required: a.required + m.required }), { answered: 0, applicable: 0, requiredAnswered: 0, required: 0 });
  // progress is measured on the questions that apply, counting required ones only when there are any
  const percent = t.required > 0 ? Math.round((t.requiredAnswered / t.required) * 100) : t.applicable > 0 ? Math.round((t.answered / t.applicable) * 100) : 0;
  return { modules: mods, overall: { ...t, percent } };
}

// ── document checklist ──
export interface ChecklistItem {
  key: string; label: L; who: 'taxpayer' | 'spouse' | 'dependant'; optional: boolean;
  questionId: string; mod: string; rec: number; recLabel?: string;
  status: 'received' | 'later' | 'expected'; uploads: number;
}

export function checklist(cat: Catalogue, ctx: Ctx, uploads: UploadedDoc[] = [], slots: Slot[] = applicable(cat, ctx)): ChecklistItem[] {
  const items: ChecklistItem[] = [];
  const seen = new Set<string>();
  for (const s of slots) {
    const reqs: DocRequest[] = s.q.docs ? [...s.q.docs] : [];
    if (s.q.type === 'file' && !s.q.docs) reqs.push({ key: s.q.id, label: s.q.text, optional: !s.required });
    for (const d of reqs) {
      if (!evalCond(d.when, cat, ctx, { group: s.sec.id, rec: s.rec })) continue;
      const per = d.perRecord ?? !!s.sec.repeat;
      const rec = per ? s.rec : 0;
      const id = `${d.key}|${s.q.id}|${rec}`;
      if (seen.has(id)) continue; seen.add(id);
      const a = answerOf(ctx, s.q.id, s.rec);
      const n = uploads.filter((u) => (u.docKey ? u.docKey === d.key : u.questionId === s.q.id) && (u.recordIndex ?? 0) === rec && u.slipStatus !== 'cancelled').length;
      items.push({
        key: d.key, label: d.label, who: d.who ?? 'taxpayer', optional: !!d.optional, questionId: s.q.id, mod: s.mod.code, rec,
        recLabel: s.sec.repeat ? recordLabel(cat, ctx, s.sec.id, rec) : undefined,
        status: n > 0 ? 'received' : a?.flag === 'later' ? 'later' : 'expected', uploads: n,
      });
    }
  }
  return items;
}

/** Fills {{token|fallback}} in help text from the year's verified rules (see config/years.ts). */
export function fillTokens(text: string, lookup: (token: string) => string | null): string {
  return text.replace(/\{\{([a-zA-Z0-9_.]+)(?:\|([^}]*))?\}\}/g, (_m, token: string, fallback?: string) => lookup(token) ?? fallback ?? '');
}
