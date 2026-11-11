// Joins a country's tax rules with its researched non-tax rules (countries/<cc>-more.ts, written by
// scripts/compliance-import.ts). The new questions go in their own group, asked just before the dates.
import type { Compliance, CountryPack, Department, Question, Source, Step } from './types.ts';

export interface More { /** the day the research was read on the official pages; part of the country's version */ version: string; step: Step | null; departments: Department[]; questions: Question[]; compliances: Compliance[]; sources: Source[];
  /** Corrections read on official pages and laid over existing compliances by id: a penalty, a confirmation, a corrected deadline. null removes a field. */
  patches?: Record<string, { [K in keyof Compliance]?: Compliance[K] | null }> }

export function withMore(base: CountryPack, more: More): CountryPack {
  const dateStep = base.steps.find((s) => s.id === 'dates')?.id;
  const steps = more.step ? [...base.steps.filter((s) => s.id !== dateStep), more.step, ...base.steps.filter((s) => s.id === dateStep)] : base.steps;
  const newDates = more.questions.filter((q) => q.step === dateStep), rest = more.questions.filter((q) => q.step !== dateStep);
  return {
    ...base,
    version: `${base.version}.${more.version.replace(/-/g, '')}`,
    departments: [...base.departments, ...more.departments],
    steps,
    questions: [...base.questions.filter((q) => q.step !== dateStep), ...rest, ...base.questions.filter((q) => q.step === dateStep), ...newDates],
    compliances: [...base.compliances, ...more.compliances].map((c) => {
      const p = more.patches?.[c.id];
      if (!p) return c;
      const out: any = { ...c };
      for (const [k, v] of Object.entries(p)) { if (v === null) delete out[k]; else out[k] = v; }
      return out as Compliance;
    }),
    sources: [...base.sources, ...more.sources],
  };
}
