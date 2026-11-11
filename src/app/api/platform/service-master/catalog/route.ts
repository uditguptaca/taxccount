// Service Master: the one API behind every Service Master screen. Platform admin only.
//   GET                      the countries with their figures, the checker's use, and the latest changes
//   GET ?country=CA          every item of that country (also the ones switched off) and anything wrong with it
//   POST { country, kind, id, data, active?, sortOrder? }      add or change an item
//   POST { action: 'undo', historyId } | { action: 'restore', country, kind, id } | { action: 'add-country', code, name, copyFrom? }
//   DELETE ?country=&kind=&id=                                 remove an item the admin added
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSessionContext } from '@/lib/auth-context';
import { readRow, rowsToPack } from '@/lib/compliance/catalog';
import { builtinPack, deleteItem, getPacks, getRows, problemsOf, recentChanges, restoreBuiltin, saveItem, undoChange, type Actor } from '@/lib/compliance-catalog';
import { refreshCountry } from '@/lib/compliance-tracker';

export const dynamic = 'force-dynamic';

async function admin(): Promise<Actor | null> {
  const s = getSessionContext();
  if (!s || s.role !== 'platform_admin') return null;
  const u: any = await getDb().prepare('SELECT first_name, last_name, email FROM users WHERE id = ?').get(s.userId);
  return { userId: s.userId, name: [u?.first_name, u?.last_name].filter(Boolean).join(' ') || u?.email || 'Platform admin' };
}
const denied = () => NextResponse.json({ error: 'Platform admin only' }, { status: 403 });

export async function GET(req: Request) {
  try {
    if (!(await admin())) return denied();
    const db = getDb();
    const code = new URL(req.url).searchParams.get('country');
    const rows = (await getRows()).filter((r) => Number(r.is_active) !== -1);      // deleted built-in items are only in the history
    if (code) {
      const items = rows.filter((r) => r.country === code).map(readRow).sort((a, b) => a.sortOrder - b.sortOrder || a.id.localeCompare(b.id));
      if (!items.some((i) => i.kind === 'country')) return NextResponse.json({ error: 'Unknown country' }, { status: 404 });
      const pack = rowsToPack(code, rows, { evenIfOff: true });
      const b = builtinPack(code);
      return NextResponse.json({ country: code, items, pack, problems: problemsOf(rows, code), builtinVersion: b?.version ?? null });
    }
    const packs = await getPacks();
    const countries = Array.from(new Set(rows.filter((r) => r.kind === 'country').map((r) => r.country))).map((c) => {
      const mine = rows.filter((r) => r.country === c), on = mine.filter((r) => Number(r.is_active) === 1);
      const pack = packs.find((p) => p.code === c);
      const n = (kind: string) => on.filter((r) => r.kind === kind).length;
      const comps = pack?.compliances ?? [];
      return {
        code: c, name: pack?.name ?? readRow(mine.find((r) => r.kind === 'country')!).data.name ?? c, active: !!pack, version: pack?.version ?? null,
        states: n('state'), entityTypes: n('entity'), departments: n('department'), heads: new Set(comps.map((x) => `${x.dept}|${x.head}`)).size,
        compliances: comps.length, verified: comps.filter((x) => x.verified).length, questions: n('question'),
        infoQuestions: (pack?.questions ?? []).filter((q) => q.type === 'date' || q.type === 'monthday').length,
        penalties: comps.filter((x) => x.penalty).length, sources: n('source'),
        edited: mine.filter((r) => Number(r.edited) === 1).length, off: mine.length - on.length,
        problems: problemsOf(rows, c).length,
      };
    });
    const use: any = await db.prepare("SELECT (SELECT COUNT(*) FROM compliance_tracker_profiles WHERE status = 'active') AS profiles, (SELECT COUNT(*) FROM personal_compliance_items WHERE tracker_profile_id IS NOT NULL) + (SELECT COUNT(*) FROM personal_entity_compliance WHERE tracker_profile_id IS NOT NULL) AS items").get();
    return NextResponse.json({ countries, use: { profiles: Number(use?.profiles ?? 0), items: Number(use?.items ?? 0) }, changes: await recentChanges(40) });
  } catch (e: any) { console.error('service-master catalog GET', e); return NextResponse.json({ error: e.message }, { status: 500 }); }
}

export async function POST(req: Request) {
  try {
    const actor = await admin(); if (!actor) return denied();
    const b = await req.json().catch(() => ({}));
    let res;
    let country = String(b.country || '');
    if (b.action === 'undo') { res = await undoChange(actor, String(b.historyId || '')); const h: any = await getDb().prepare('SELECT country FROM compliance_catalog_history WHERE id = ?').get(String(b.historyId || '')); country = h?.country ?? ''; }
    else if (b.action === 'restore') res = await restoreBuiltin(actor, country, String(b.kind || ''), String(b.id || ''));
    else if (b.action === 'add-country') {
      const code = String(b.code || '').toUpperCase().trim(), name = String(b.name || '').trim();
      if (!/^[A-Z]{2}$/.test(code)) return NextResponse.json({ error: 'The country code is two letters, for example GB' }, { status: 400 });
      if (!name) return NextResponse.json({ error: 'Give the country a name' }, { status: 400 });
      if ((await getRows()).some((r) => r.country === code && r.kind === 'country')) return NextResponse.json({ error: 'That country already exists' }, { status: 409 });
      country = code;
      res = await saveItem(actor, { country: code, kind: 'country', id: code, data: { name, currency: String(b.currency || '').toUpperCase().slice(0, 3), stateLabel: String(b.stateLabel || 'State'), calendarYearKinds: ['individual', 'sole_prop'], rollWeekend: false, weekendNote: '' }, active: false });
    } else res = await saveItem(actor, { country, kind: String(b.kind || ''), id: String(b.id || ''), data: b.data, active: typeof b.active === 'boolean' ? b.active : undefined, sortOrder: Number.isFinite(b.sortOrder) ? Number(b.sortOrder) : undefined });
    if (!res.ok) return NextResponse.json({ error: res.error, problems: res.problems ?? [] }, { status: 400 });
    // people who saved a check under the old rules get the new dates and filings
    const refreshed = country ? await refreshCountry(getDb(), country).catch(() => 0) : 0;
    return NextResponse.json({ success: true, id: res.id, refreshed });
  } catch (e: any) { console.error('service-master catalog POST', e); return NextResponse.json({ error: e.message }, { status: 500 }); }
}

export async function DELETE(req: Request) {
  try {
    const actor = await admin(); if (!actor) return denied();
    const u = new URL(req.url).searchParams;
    const country = u.get('country') || '';
    const res = await deleteItem(actor, country, u.get('kind') || '', u.get('id') || '');
    if (!res.ok) return NextResponse.json({ error: res.error, problems: res.problems ?? [] }, { status: 400 });
    if (u.get('kind') !== 'country') await refreshCountry(getDb(), country).catch(() => 0);
    return NextResponse.json({ success: true });
  } catch (e: any) { console.error('service-master catalog DELETE', e); return NextResponse.json({ error: e.message }, { status: 500 }); }
}
