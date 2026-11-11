// Everything the public website says in numbers or by example is read here, from the rules as they stand in
// Service Master at the moment the page is drawn. Nothing on the public pages is typed in as a figure: when a
// compliance is added or a date changes, the website follows by itself.
import { getPacks } from '@/lib/compliance-catalog';
import { evaluate, fmt, visibleQuestions } from '@/lib/compliance/engine';
import { slugOf } from '@/lib/compliance/guide';
import { timeLeft } from '@/lib/compliance/timeleft';
import type { Answers, CountryPack, Result } from '@/lib/compliance/types';

export interface SiteCountry { code: string; name: string; slug: string; total: number; places: number; placeLabel: string; departments: { name: string; count: number }[]; checkedOn: string | null }
export interface SiteRow { id: string; name: string; form: string | null; authority: string; when: string; left: string | null; tone: 'red' | 'yellow' | 'green' | 'gray'; penalty: string | null; penaltyUrl: string | null; sourceTitle: string; sourceUrl: string; sourcePublisher: string; checked: string | null; verified: boolean }
export interface SiteExample { id: string; who: string; detail: string; country: string; place: string; total: number; rows: SiteRow[] }
export interface SitePenalty { country: string; name: string; penalty: string; url: string; publisher: string }
export interface SiteData {
  today: string; total: number; countries: SiteCountry[]; places: number; sources: number; confirmed: number; withPenalty: number;
  examples: SiteExample[]; penalties: SitePenalty[];
}

// Each example is a set of answers a real visitor could give. The wording of `detail` follows the questions those
// answers belong to, so the description and the result cannot drift apart.
const EXAMPLES: { id: string; who: string; detail: string; cc: string; state: string; entity: string; seed: Answers }[] = [
  { id: 'on-person', who: 'A person living in Ontario', detail: 'Has a job, earns rent, owns property abroad that cost over $100,000, and pays into an RRSP.', cc: 'CA', state: 'ON', entity: 'individual',
    seed: { ca_resident: 'yes', ca_employment: 'yes', ca_rental: 'yes', ca_foreign_prop: 'yes', ca_owing: 'yes', ca_rrsp: 'yes' } },
  { id: 'ca-freelancer', who: 'A freelancer in California', detail: 'A US resident who freelances, expects to owe tax at filing, and keeps over $10,000 in accounts outside the US.', cc: 'US', state: 'CA', entity: 'individual',
    seed: { us_status: 'yes', us_selfemp: 'yes', us_foreign_acct: 'yes', us_est: 'yes' } },
  { id: 'mh-person', who: 'A salaried person in Maharashtra', detail: 'Resident in India, sold shares this year, pays rent above Rs 50,000 a month, and owes tax after TDS.', cc: 'IN', state: 'MH', entity: 'individual',
    seed: { in_resident: 'yes', in_income: 'yes', in_capgain: 'yes', in_rent: 'yes', in_advance: 'yes' } },
  { id: 'du-employee', who: 'An employee in Dubai', detail: 'Works in the private sector, lives in the UAE on a residence visa and holds an Emirates ID.', cc: 'AE', state: 'DU', entity: 'individual',
    seed: { ae_employed: 'yes', ae_x_eid: 'yes', ae_x_res_visa: 'yes' } },
  { id: 'on-company', who: 'A small company in Ontario', detail: 'A private corporation formed in September 2023, registered for GST/HST, with employees on payroll.', cc: 'CA', state: 'ON', entity: 'corporation',
    seed: { ca_ccpc: 'yes', ca_employees: 'yes', ca_gst_reg: 'yes', ca_inc_date: '2023-09-12', fye: '12-31', ca_federal: 'no' } },
];

const short = (s: string, n: number) => (s.length <= n ? s : s.slice(0, s.lastIndexOf(' ', n - 1)).replace(/[,;:.]$/, '') + '…');

function rowOf(r: Result, today: string): SiteRow {
  const d = r.next[0]?.date ?? null;
  const left = d ? timeLeft(d, today) : null;
  return {
    id: r.id, name: r.name, form: r.form ?? null, authority: r.authority,
    when: d ? fmt(d) : r.passed ? `Was due ${fmt(r.passed)}` : r.rule ?? r.dueText,
    left: left?.text ?? null, tone: left?.tone ?? 'gray',
    penalty: r.penalty ? short(r.penalty, 230) : null, penaltyUrl: r.penaltySourceUrl ?? null,
    sourceTitle: r.sourceTitle, sourceUrl: r.sourceUrl, sourcePublisher: r.sourcePublisher ?? r.authority, checked: r.sourceChecked ?? null, verified: !!r.verified,
  };
}

function runExample(pack: CountryPack, ex: (typeof EXAMPLES)[number], today: string): SiteExample | null {
  if (!pack.entityTypes.some((e) => e.id === ex.entity) || !pack.states.some((s) => s.code === ex.state)) return null;
  const sel = { country: pack.code, state: ex.state, entity: ex.entity, depts: pack.departments.map((d) => d.id) };
  const a: Answers = { ...ex.seed };
  // every other question is answered "No" (or its first choice), following the questions that open up
  for (let i = 0; i < 12; i++) for (const q of visibleQuestions(pack, sel, a)) if (a[q.id] === undefined) a[q.id] = q.type === 'yn' ? 'no' : q.type === 'multi' ? ['none'] : q.type === 'date' ? '2021-06-01' : q.type === 'monthday' ? '12-31' : q.options?.[0]?.v ?? '';
  const all = evaluate(pack, sel, a, today).filter((r) => r.certainty === 'applies');
  if (all.length < 3) return null;
  // the ones with a date first, soonest first; then the ones that show their rule
  const dated = all.filter((r) => r.next[0]).sort((x, y) => x.next[0].date.localeCompare(y.next[0].date));
  const rows = [...dated, ...all.filter((r) => !r.next[0])].slice(0, 5).map((r) => rowOf(r, today));
  return { id: ex.id, who: ex.who, detail: ex.detail, country: pack.name, place: pack.states.find((s) => s.code === ex.state)?.name ?? ex.state, total: all.length, rows };
}

export async function siteData(): Promise<SiteData> {
  const packs = await getPacks();
  const today = new Date().toISOString().slice(0, 10);
  const countries: SiteCountry[] = packs.map((p) => ({
    code: p.code, name: p.name, slug: slugOf(p.name), total: p.compliances.length, places: p.states.length, placeLabel: p.stateLabel.toLowerCase().split(' or ').map((w) => (w.endsWith('y') ? w.slice(0, -1) + 'ies' : w + 's')).join(' and '),
    departments: p.departments.map((d) => ({ name: d.name, count: p.compliances.filter((c) => c.dept === d.id).length })).filter((d) => d.count > 0).sort((a, b) => b.count - a.count),
    checkedOn: p.sources.map((s) => s.checked).filter(Boolean).sort().pop() ?? null,
  }));
  const all = packs.flatMap((p) => p.compliances);
  const examples = EXAMPLES.map((ex) => { const p = packs.find((k) => k.code === ex.cc); return p ? runExample(p, ex, today) : null; }).filter((e): e is SiteExample => !!e);
  // real penalties, each with the page it was read on: two per country, the most central filings first
  const penalties: SitePenalty[] = packs.flatMap((p) => p.compliances
    .filter((c) => c.penalty && c.penaltySource && c.verified && c.penalty.length <= 260)
    .sort((a, b) => (b.weight ?? 0) - (a.weight ?? 0)).slice(0, 2)
    .map((c) => { const s = p.sources.find((k) => k.id === c.penaltySource); return s ? { country: p.name, name: c.name, penalty: c.penalty!, url: s.url, publisher: s.publisher } : null; })
    .filter((x): x is SitePenalty => !!x));
  return {
    today, total: all.length, countries, places: packs.reduce((n, p) => n + p.states.length, 0), sources: packs.reduce((n, p) => n + p.sources.length, 0),
    confirmed: all.filter((c) => c.verified).length, withPenalty: all.filter((c) => c.penalty).length, examples, penalties,
  };
}

export const fmtDate = fmt;
