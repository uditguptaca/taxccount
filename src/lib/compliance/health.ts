// Things in a country's rules that are not wrong enough to refuse, but that a person should look at:
// a question nothing depends on, a filing with no penalty recorded, a source not re-read for a year,
// a one-off deadline that has passed. Pure: Service Master shows them, the tests run them.
import type { CountryPack } from './types.ts';
import { questionLinks } from './describe.ts';

export interface Advice { level: 'look' | 'tidy'; kind: 'question' | 'compliance' | 'source' | 'entity' | 'department'; id: string; name: string; text: string }

export function adviceOf(p: CountryPack, today: string): Advice[] {
  const out: Advice[] = [];
  const links = questionLinks(p);
  for (const q of p.questions) {
    const l = links.get(q.id);
    if (l && l.compliances.length + l.questions.length + l.dates.length === 0)
      out.push({ level: 'look', kind: 'question', id: q.id, name: q.text, text: 'Nothing depends on this question: the answer changes no compliance, date or follow-up question.' });
  }
  const yearAgo = `${Number(today.slice(0, 4)) - 1}${today.slice(4)}`;
  const used = new Set(p.compliances.map((c) => c.source));
  for (const s of p.sources) {
    if (!used.has(s.id)) out.push({ level: 'tidy', kind: 'source', id: s.id, name: s.title, text: 'No compliance uses this source.' });
    else if (s.checked && s.checked < yearAgo) out.push({ level: 'look', kind: 'source', id: s.id, name: s.title, text: `Last read on ${s.checked}, more than a year ago. Read it again: rules and dates change.` });
  }
  const deptUsed = new Set(p.compliances.map((c) => c.dept));
  for (const d of p.departments) if (!deptUsed.has(d.id)) out.push({ level: 'look', kind: 'department', id: d.id, name: d.name, text: 'This department has no compliance, so choosing it gives the person nothing.' });
  for (const c of p.compliances) {
    if (!c.penalty) out.push({ level: 'tidy', kind: 'compliance', id: c.id, name: c.name, text: 'No penalty recorded.' });
    if (c.due.t === 'on' && c.due.dates.length > 0 && c.due.dates.every((d) => d < today)) out.push({ level: 'look', kind: 'compliance', id: c.id, name: c.name, text: 'Every one-off date has passed. Switch it off, or give it its next date.' });
    for (const m of c.moved ?? []) if (m.to < today && m.from < today) out.push({ level: 'tidy', kind: 'compliance', id: c.id, name: c.name, text: `The moved deadline ${m.from} → ${m.to} has passed and can be removed.` });
    if (c.due.t === 'afterYearEnd') for (const [y, d] of Object.entries(c.due.except ?? {})) if (d < today) out.push({ level: 'tidy', kind: 'compliance', id: c.id, name: c.name, text: `The exception for the year ended in ${y} (${d}) has passed and can be removed.` });
  }
  return out;
}
