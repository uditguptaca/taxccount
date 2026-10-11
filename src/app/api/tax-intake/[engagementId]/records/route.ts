import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { randomUUID } from 'crypto';
import { authenticateIntake as authenticate, clientMayEdit } from '@/lib/tax-intake-access';
import { CATALOGUE } from '@/lib/t1/catalogue/index';
import { refresh } from '@/lib/t1-server';

export const dynamic = 'force-dynamic';

/** Add a record (another T4, dependant, property...): { sectionId }. Returns its number. */
export async function POST(req: Request, { params }: { params: { engagementId: string } }) {
  try {
    const db = getDb();
    const auth = await authenticate(req, db, params.engagementId);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (auth.isClient && !clientMayEdit(auth.engagement.status)) return NextResponse.json({ error: 'This form was submitted.', locked: true }, { status: 423 });
    const { sectionId } = await req.json().catch(() => ({}));
    const sec = CATALOGUE.sec.get(sectionId);
    if (!sec || !sec.repeat) return NextResponse.json({ error: 'That part of the form does not take several records' }, { status: 400 });
    const row = await db.prepare('SELECT COALESCE(MAX(record_index), -1) AS m FROM tax_intake_repeat_records WHERE engagement_id = ? AND section_id = ?').get(params.engagementId, sectionId);
    const max = sec.repeat.max ?? 200;
    const live = await db.prepare('SELECT COUNT(*) AS n FROM tax_intake_repeat_records WHERE engagement_id = ? AND section_id = ? AND removed_at IS NULL').get(params.engagementId, sectionId);
    if (Number(live.n) >= max) return NextResponse.json({ error: `At most ${max} can be added here` }, { status: 400 });
    const recordIndex = Number(row.m) + 1;
    await db.prepare('INSERT INTO tax_intake_repeat_records (id, engagement_id, section_id, record_index, created_at) VALUES (?, ?, ?, ?, ?)').run(randomUUID(), params.engagementId, sectionId, recordIndex, new Date().toISOString());
    await db.prepare("UPDATE tax_intake_engagements SET updated_at = ?, status = CASE WHEN status = 'not_started' THEN 'in_progress' ELSE status END WHERE id = ?").run(new Date().toISOString(), params.engagementId);
    await refresh(db, params.engagementId);
    return NextResponse.json({ success: true, sectionId, recordIndex });
  } catch (err: any) {
    console.error('POST Records Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/**
 * Remove a record: ?sectionId=...&recordIndex=N. Its answers move to the history (action "removed") and the
 * record is marked removed; a preparer can still read what was entered.
 */
export async function DELETE(req: Request, { params }: { params: { engagementId: string } }) {
  try {
    const db = getDb();
    const auth = await authenticate(req, db, params.engagementId);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (auth.isClient && !clientMayEdit(auth.engagement.status)) return NextResponse.json({ error: 'This form was submitted.', locked: true }, { status: 423 });
    const sp = new URL(req.url).searchParams;
    const sectionId = sp.get('sectionId') || '', recordIndex = Number(sp.get('recordIndex'));
    const sec = CATALOGUE.sec.get(sectionId);
    if (!sec || !sec.repeat || !Number.isInteger(recordIndex) || recordIndex < 0) return NextResponse.json({ error: 'Invalid record' }, { status: 400 });
    const ids = sec.qs.map((q) => q.id);
    const now = new Date().toISOString();
    await db.transaction(async (tx: any) => {
      const rows = await tx.prepare(`SELECT question_id, value, flag, flag_note FROM tax_intake_responses WHERE engagement_id = ? AND record_index = ? AND question_id IN (${ids.map(() => '?').join(',')})`).all(params.engagementId, recordIndex, ...ids);
      for (const r of rows) await tx.prepare("INSERT INTO tax_intake_response_history (id, engagement_id, question_id, record_index, value, flag, flag_note, action, changed_by, changed_by_role, catalogue_version, changed_at) VALUES (?, ?, ?, ?, ?, ?, ?, 'removed', ?, ?, ?, ?)").run(randomUUID(), params.engagementId, r.question_id, recordIndex, r.value, r.flag, r.flag_note, auth.userId, auth.role, CATALOGUE.version, now);
      await tx.prepare(`DELETE FROM tax_intake_responses WHERE engagement_id = ? AND record_index = ? AND question_id IN (${ids.map(() => '?').join(',')})`).run(params.engagementId, recordIndex, ...ids);
      await tx.prepare('UPDATE tax_intake_repeat_records SET removed_at = ?, removed_by = ? WHERE engagement_id = ? AND section_id = ? AND record_index = ?').run(now, auth.userId, params.engagementId, sectionId, recordIndex);
      await tx.prepare('UPDATE tax_intake_engagements SET updated_at = ? WHERE id = ?').run(now, params.engagementId);
    })();
    await refresh(db, params.engagementId);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('DELETE Records Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
