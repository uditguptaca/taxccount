// How a country's rules are stored as rows (one row per item) and put back together. No database here:
// the server module src/lib/compliance-catalog.ts reads and writes the rows, and Service Master edits them.
import type { Compliance, CountryPack, Department, EntityType, Question, Source, State, Step } from './types.ts';

export const KINDS = ['country', 'state', 'entity', 'department', 'step', 'question', 'compliance', 'source'] as const;
export type Kind = (typeof KINDS)[number];

export interface CatalogRow {
  country: string; kind: Kind; id: string; data: string; sort_order: number;
  is_active: number; edited: number; origin: string; updated_at?: string; updated_by?: string | null;
}
/** A row with its data already read. */
export interface CatalogItem<T = any> { country: string; kind: Kind; id: string; data: T; sortOrder: number; active: boolean; edited: boolean; origin: string; updatedAt?: string }

const without = <T extends object>(o: T, key: keyof T) => { const c: any = { ...o }; delete c[key]; return c; };
const row = (country: string, kind: Kind, id: string, data: unknown, i: number): CatalogRow => ({ country, kind, id, data: JSON.stringify(data), sort_order: (i + 1) * 10, is_active: 1, edited: 0, origin: 'builtin' });

/** The settings of a country that are not lists. */
export interface CountrySettings {
  name: string; builtinVersion?: string; currency: string; stateLabel: string; fixedYearEnd?: [number, number];
  calendarYearKinds: CountryPack['calendarYearKinds']; rollWeekend: boolean; weekendNote: string; disclaimer?: string;
}

export function packToRows(p: CountryPack): CatalogRow[] {
  const settings: CountrySettings = { name: p.name, builtinVersion: p.version, currency: p.currency, stateLabel: p.stateLabel, fixedYearEnd: p.fixedYearEnd, calendarYearKinds: p.calendarYearKinds, rollWeekend: p.rollWeekend, weekendNote: p.weekendNote, disclaimer: p.disclaimer };
  return [
    row(p.code, 'country', p.code, settings, 0),
    ...p.states.map((s, i) => row(p.code, 'state', s.code, without(s, 'code'), i)),
    ...p.entityTypes.map((e, i) => row(p.code, 'entity', e.id, without(e, 'id'), i)),
    ...p.departments.map((d, i) => row(p.code, 'department', d.id, without(d, 'id'), i)),
    ...p.steps.map((s, i) => row(p.code, 'step', s.id, without(s, 'id'), i)),
    ...p.questions.map((q, i) => row(p.code, 'question', q.id, without(q, 'id'), i)),
    ...p.compliances.map((c, i) => row(p.code, 'compliance', c.id, without(c, 'id'), i)),
    ...p.sources.map((s, i) => row(p.code, 'source', s.id, without(s, 'id'), i)),
  ];
}

export function readRow(r: CatalogRow): CatalogItem {
  let data: any = {}; try { data = JSON.parse(r.data); } catch { /* an unreadable row is treated as empty */ }
  return { country: r.country, kind: r.kind, id: r.id, data, sortOrder: Number(r.sort_order) || 0, active: Number(r.is_active) === 1, edited: Number(r.edited) === 1, origin: r.origin, updatedAt: r.updated_at };
}

/** Puts one country back together from its rows. Rows that are switched off are left out (evenIfOff builds a country that is itself switched off, to check it while it is being set up). */
export function rowsToPack(code: string, rows: CatalogRow[], opts: { evenIfOff?: boolean } = {}): CountryPack | null {
  const items = rows.filter((r) => r.country === code).map(readRow).filter((i) => i.active || (opts.evenIfOff && i.kind === 'country')).sort((a, b) => a.sortOrder - b.sortOrder || a.id.localeCompare(b.id));
  const c = items.find((i) => i.kind === 'country');
  if (!c) return null;
  const s: CountrySettings = c.data;
  const of = <T>(kind: Kind, key: string) => items.filter((i) => i.kind === kind).map((i) => ({ [key]: i.id, ...i.data }) as T);
  const edits = rows.filter((r) => r.country === code && Number(r.edited) === 1).length;
  // the moment of the latest change is part of the version, so two changes to the same item still count as two versions
  const latest = rows.reduce((m, r) => (r.country === code && r.updated_at && String(r.updated_at) > m ? String(r.updated_at) : m), '');
  const pack: CountryPack = {
    code, name: s.name, version: `${s.builtinVersion ?? 'custom'}${edits ? `+${edits}` : ''}${latest ? `@${latest}` : ''}`, currency: s.currency, stateLabel: s.stateLabel,
    calendarYearKinds: s.calendarYearKinds ?? [], rollWeekend: !!s.rollWeekend, weekendNote: s.weekendNote ?? '',
    states: of<State>('state', 'code'), entityTypes: of<EntityType>('entity', 'id'), departments: of<Department>('department', 'id'),
    steps: of<Step>('step', 'id'), questions: of<Question>('question', 'id'), compliances: of<Compliance>('compliance', 'id'), sources: of<Source>('source', 'id'),
  };
  if (s.fixedYearEnd) pack.fixedYearEnd = s.fixedYearEnd;
  if (s.disclaimer) pack.disclaimer = s.disclaimer;
  return pack;
}
