import { NextResponse } from 'next/server';
import { lightPack } from '@/lib/compliance/index';
import { getPack, getPacks } from '@/lib/compliance-catalog';
import { askableQuestions, evalCond, evaluate, makeCtx, relevantKey, relevantQuestions, unanswered } from '@/lib/compliance/engine';
import { allow, ipOf, readInput, signTicket, today } from '@/lib/compliance-server';

export const dynamic = 'force-dynamic';

// The free compliance checker on the homepage. This is the one API that works without signing in.
// It reads only the published rules (Service Master's catalogue) and writes nothing: it runs those rules on
// the answers it is sent. See AGENTS.md before adding anything else under /api/public.

const SHOWN = 3;

/** GET: the countries with their states, entity types and departments; with ?country=XX also that country's questions. */
export async function GET(req: Request) {
  if (!allow(ipOf(req), 120)) return NextResponse.json({ error: 'Too many requests. Please wait a minute.' }, { status: 429 });
  const code = new URL(req.url).searchParams.get('country');
  if (code) {
    const pack = await getPack(code);
    if (!pack) return NextResponse.json({ error: 'Unknown country' }, { status: 404 });
    // ?country=XX&state=..&entity=.. : what the page needs to ask only the questions that matter. For every compliance
    // that could apply to that entity type in that place it gets the type, the condition and the date question, and
    // nothing else: no name, no form, no date, so the list itself still cannot be read off the page.
    // With &depts=a,b as well, the answer is the list of question ids for exactly those ticks.
    const q = new URL(req.url).searchParams;
    if (q.get('entity')) {
      const all = pack.departments.map((d) => d.id);
      const depts = (q.get('depts') ?? '').split(',').filter(Boolean);
      const sel = { country: pack.code, state: q.get('state') ?? '', entity: q.get('entity') ?? '', depts: depts.length ? depts : all };
      if (!pack.states.some((s) => s.code === sel.state) || !pack.entityTypes.some((e) => e.id === sel.entity) || sel.depts.some((d) => !all.includes(d))) return NextResponse.json({ error: 'Unknown selection' }, { status: 400 });
      if (depts.length) return NextResponse.json({ key: relevantKey(sel), relevant: Array.from(relevantQuestions(pack, sel)) }, { headers: { 'Cache-Control': 'public, max-age=30' } });
      const x = makeCtx(pack, sel, {}, true)!;
      const can = { ...x, asked: askableQuestions(pack, x) };
      const needs = pack.compliances.filter((c) => evalCond(c.applies, can)).map((c) => {
        const d: any = c.due;
        return { dept: c.dept, applies: c.applies, due: { t: d.t, ...(d.of ? { of: d.of } : {}), ...(d.from ? { from: d.from, text: '' } : {}), ...(d.ask ? { ask: d.ask } : {}), ...(d.basis ? { basis: d.basis } : {}) } };
      });
      return NextResponse.json({ key: `${pack.code}|${sel.state}|${sel.entity}`, needs }, { headers: { 'Cache-Control': 'public, max-age=30' } });
    }
    return NextResponse.json({ pack: lightPack(pack) }, { headers: { 'Cache-Control': 'public, max-age=30' } });
  }
  return NextResponse.json({
    countries: (await getPacks()).map((p) => ({ code: p.code, name: p.name, stateLabel: p.stateLabel, states: p.states.map((s) => ({ code: s.code, name: s.name })), entityTypes: p.entityTypes.map(({ id, name, desc, onlyStates, notStates }) => ({ id, name, desc, onlyStates, notStates })), departments: p.departments })),
  }, { headers: { 'Cache-Control': 'public, max-age=30' } });
}

/**
 * POST { sel, answers }: works out which filings apply. A visitor sees the first three in full and how many
 * more there are; the rest are shown in their account after they register (the "ticket" carries their answers there).
 */
export async function POST(req: Request) {
  try {
    if (!allow(ipOf(req), 40)) return NextResponse.json({ error: 'Too many requests. Please wait a minute.' }, { status: 429 });
    const body = await req.json().catch(() => null);
    const input = await readInput(body);
    if ('error' in input) return NextResponse.json({ error: input.error }, { status: 400 });
    const { pack, sel, answers } = input;
    const missing = unanswered(pack, sel, answers);
    if (missing.length) return NextResponse.json({ error: 'Some questions are not answered yet', missing: missing.map((q) => q.id) }, { status: 422 });
    const results = evaluate(pack, sel, answers, today());
    const shown = results.slice(0, SHOWN);
    const rest = results.slice(SHOWN);
    const byHead: Record<string, number> = {};
    for (const r of results) byHead[r.head] = (byHead[r.head] ?? 0) + 1;
    return NextResponse.json({
      total: results.length, shown,
      locked: rest.map((r) => ({ head: r.head, frequency: r.frequency, certainty: r.certainty, due: r.next[0]?.date ? r.next[0].date.slice(0, 7) : null })),
      byHead, asOf: today(), country: pack.name, disclaimer: pack.disclaimer ?? null, weekendNote: pack.weekendNote,
      ticket: signTicket(sel, answers, pack.version),
    });
  } catch (e: any) {
    console.error('Public compliance check error:', e);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
