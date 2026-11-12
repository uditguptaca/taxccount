import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSessionContext } from '@/lib/auth-context';
import { readInput, readTicket, tooBig } from '@/lib/compliance-server';
import { isRealDate, unanswered } from '@/lib/compliance/engine';
import { addFromList, addOwn, addable, answersOf, completeItem, countFrom, createProfile, editItem, loadProfile, resync, tableFor, urgency, refreshIfRulesChanged } from '@/lib/compliance-tracker';
import type { ProfileRow } from '@/lib/compliance-tracker';

export const dynamic = 'force-dynamic';

// A signed-in person's saved compliance checks. Every query is limited to their own user id.
const me = () => { const s = getSessionContext(); return s && s.userId ? s : null; };
const own = async (db: any, userId: string, id: string): Promise<ProfileRow | undefined> => db.prepare('SELECT * FROM compliance_tracker_profiles WHERE id = ? AND user_id = ?').get(id, userId);

export async function GET(req: Request) {
  try {
    const s = me(); if (!s) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const db = getDb();
    // ?options=<profileId>: the compliances of that country the person could add to their list by hand
    const options = new URL(req.url).searchParams.get('options');
    if (options) { const p = await own(db, s.userId, options); if (!p) return NextResponse.json({ error: 'Not found' }, { status: 404 }); return NextResponse.json({ options: await addable(db, p) }); }
    const rows: ProfileRow[] = await db.prepare("SELECT * FROM compliance_tracker_profiles WHERE user_id = ? AND status = 'active' ORDER BY created_at").all(s.userId);
    const profiles = [];
    for (const p of rows) {
      // rules changed in Service Master since this check was saved: bring its dates and filings up to date first
      const changed = await refreshIfRulesChanged(db, p).catch(() => false);
      profiles.push(await loadProfile(db, changed ? ((await own(db, s.userId, p.id)) ?? p) : p));
    }
    return NextResponse.json({ profiles });
  } catch (e: any) { console.error('compliance-tracker GET', e); return NextResponse.json({ error: e.message }, { status: 500 }); }
}

/** Save a check to the account: { ticket } from the homepage, or { sel, answers } from inside the account; optional label. */
export async function POST(req: Request) {
  try {
    const s = me(); if (!s) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json().catch(() => ({}));
    const fromTicket = body.ticket ? readTicket(body.ticket) : null;
    if (body.ticket && !fromTicket) return NextResponse.json({ error: 'This result has expired. Please run the check again.' }, { status: 400 });
    if (tooBig(req)) return NextResponse.json({ error: 'Request too large' }, { status: 413 });
    const input = await readInput(fromTicket ?? body);
    if ('error' in input) return NextResponse.json({ error: input.error }, { status: 400 });
    // a check saved from inside the account must be as complete as one run on the homepage (independent audit, I1);
    // a ticket was complete when the homepage issued it, and stays valid if a question was added since
    const missing = fromTicket ? [] : unanswered(input.pack, input.sel, input.answers).map((q) => q.id);
    if (missing.length) return NextResponse.json({ error: 'Some questions are not answered yet', missing }, { status: 422 });
    const db = getDb();
    // Saving the same check twice returns the first one, and saving it with more types ticked adds those types:
    // both are decided inside createProfile, under the per-person lock.
    const same = await db.prepare("SELECT id FROM compliance_tracker_profiles WHERE user_id = ? AND country = ? AND state = ? AND entity_type = ? AND answers = ? AND status = 'active'").get(s.userId, input.sel.country, input.sel.state, input.sel.entity, JSON.stringify(input.answers));
    const count = await db.prepare("SELECT COUNT(*) AS n FROM compliance_tracker_profiles WHERE user_id = ? AND status = 'active'").get(s.userId);
    if (!same && Number(count.n) >= 25) return NextResponse.json({ error: 'You can keep up to 25 saved checks' }, { status: 400 });
    const out = await createProfile(db, { userId: s.userId, orgId: s.orgId }, input.sel, input.answers, String(body.label || ''));
    if ('error' in out) return NextResponse.json({ error: out.error }, { status: 400 });
    return NextResponse.json(out);
  } catch (e: any) { console.error('compliance-tracker POST', e); return NextResponse.json({ error: e.message }, { status: 500 }); }
}

/** Change a saved check ({ profileId, answers?, label? }) or one of its filings ({ profileId, itemId, action, date? }). */
export async function PATCH(req: Request) {
  try {
    const s = me(); if (!s) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const b = await req.json().catch(() => ({}));
    const db = getDb();
    const p = await own(db, s.userId, String(b.profileId || ''));
    if (!p) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (b.action === 'add') { const out = await addFromList(db, p, String(b.complianceId || '')); return 'error' in out ? NextResponse.json(out, { status: 400 }) : NextResponse.json({ success: true, id: out.id }); }
    if (b.action === 'add_own') { const out = await addOwn(db, p, b); return 'error' in out ? NextResponse.json(out, { status: 400 }) : NextResponse.json({ success: true, id: out.id }); }
    if (b.action === 'edit') { const out = await editItem(db, p, String(b.itemId || ''), { title: b.title, note: b.note, repeat: b.repeat }); return 'error' in out ? NextResponse.json(out, { status: out.error === 'Not found' ? 404 : 400 }) : NextResponse.json({ success: true }); }
    if (!b.itemId) {
      // answers that are not a set of answers are refused, never read as "no answers": that used to wipe a saved
      // check's answers and rebuild its list from nothing (independent audit, B2)
      if (b.answers !== undefined && (b.answers === null || typeof b.answers !== 'object' || Array.isArray(b.answers))) return NextResponse.json({ error: 'The answers could not be read' }, { status: 400 });
      if (b.label !== undefined && typeof b.label !== 'string') return NextResponse.json({ error: 'The name could not be read' }, { status: 400 });
      const input = await readInput({ sel: { country: p.country, state: p.state, entity: p.entity_type, depts: JSON.parse(p.depts) }, answers: b.answers ?? answersOf(p) });
      if ('error' in input) return NextResponse.json({ error: input.error }, { status: 400 });
      const missing = b.answers === undefined ? [] : unanswered(input.pack, input.sel, input.answers).map((q) => q.id);
      if (missing.length) return NextResponse.json({ error: 'Some questions are not answered yet', missing }, { status: 422 });
      await resync(db, p, input.answers, typeof b.label === 'string' ? b.label : undefined);
      return NextResponse.json({ success: true });
    }
    const table = tableFor(p.kind), now = new Date().toISOString();
    const row = await db.prepare(`SELECT id, status, due_date, tracker_meta, tracker_compliance_id FROM ${table} WHERE id = ? AND tracker_profile_id = ? AND user_id = ?`).get(String(b.itemId), p.id, s.userId);
    if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (b.action === 'done') { const out = await completeItem(db, p, row.id); return 'error' in out ? NextResponse.json(out, { status: out.error === 'Not found' ? 404 : 409 }) : NextResponse.json({ success: true, next: out.next, ...(out.open ? { open: true } : {}) }); }
    if (b.action === 'reopen') { await db.prepare(`UPDATE ${table} SET status = 'pending', completed_at = NULL, urgency = ?, updated_at = ? WHERE id = ? AND user_id = ?`).run(urgency(row.due_date, 'pending'), now, row.id, s.userId); return NextResponse.json({ success: true }); }
    if (b.action === 'count_from') { const out = await countFrom(db, p, row.id, b.date); return 'error' in out ? NextResponse.json(out, { status: 400 }) : NextResponse.json({ success: true, due: out.due }); }
    if (b.action === 'set_date') {
      if (!isRealDate(b.date)) return NextResponse.json({ error: 'Enter a date' }, { status: 400 });
      let m: any = {}; try { m = JSON.parse(row.tracker_meta || '{}'); } catch { /* keep empty */ }
      await db.prepare(`UPDATE ${table} SET due_date = ?, urgency = ?, tracker_meta = ?, updated_at = ? WHERE id = ? AND user_id = ?`).run(b.date, urgency(b.date, row.status), JSON.stringify({ ...m, custom: true, countedFrom: undefined, ...(m.ruleDate || !row.due_date || m.custom ? {} : { ruleDate: String(row.due_date).slice(0, 10) }) }), now, row.id, s.userId);
      return NextResponse.json({ success: true });
    }
    if (b.action === 'remove') {
      await db.prepare(`DELETE FROM ${table} WHERE id = ? AND user_id = ?`).run(row.id, s.userId);
      await db.prepare('DELETE FROM compliance_tracker_documents WHERE profile_id = ? AND user_id = ? AND compliance_id = ?').run(p.id, s.userId, row.tracker_compliance_id);   // its papers go with it
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (e: any) { console.error('compliance-tracker PATCH', e); return NextResponse.json({ error: e.message }, { status: 500 }); }
}

/** Remove a saved check and its filings (?profileId=). Filings already marked done stay in the history of the vault. */
export async function DELETE(req: Request) {
  try {
    const s = me(); if (!s) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const db = getDb();
    const p = await own(db, s.userId, new URL(req.url).searchParams.get('profileId') || '');
    if (!p) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    await db.transaction(async (tx: any) => {
      await tx.prepare(`DELETE FROM ${tableFor(p.kind)} WHERE tracker_profile_id = ? AND user_id = ?`).run(p.id, s.userId);
      if (p.vault_entity_id) {
        const left = await tx.prepare('SELECT COUNT(*) AS n FROM personal_entity_compliance WHERE entity_id = ? AND user_id = ?').get(p.vault_entity_id, s.userId);
        if (Number(left.n) === 0) await tx.prepare('DELETE FROM personal_entities WHERE id = ? AND user_id = ?').run(p.vault_entity_id, s.userId);
      }
      await tx.prepare('DELETE FROM compliance_tracker_profiles WHERE id = ? AND user_id = ?').run(p.id, s.userId);
    })();
    return NextResponse.json({ success: true });
  } catch (e: any) { console.error('compliance-tracker DELETE', e); return NextResponse.json({ error: e.message }, { status: 500 }); }
}
