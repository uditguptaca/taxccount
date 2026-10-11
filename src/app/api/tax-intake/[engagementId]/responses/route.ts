import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { authenticateIntake as authenticate, clientMayEdit } from '@/lib/tax-intake-access';
import { saveAnswers, refresh, decodeValue } from '@/lib/t1-server';

export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: { engagementId: string } }) {
  try {
    const db = getDb();
    const auth = await authenticate(req, db, params.engagementId);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const rows = await db.prepare('SELECT question_id, record_index, value, flag, flag_note, row_version, updated_at FROM tax_intake_responses WHERE engagement_id = ?').all(params.engagementId);
    return NextResponse.json({ responses: rows.map((r: any) => ({ questionId: r.question_id, recordIndex: r.record_index, value: decodeValue(r.value) ?? null, flag: r.flag, flagNote: r.flag_note, rowVersion: r.row_version, updatedAt: r.updated_at })) });
  } catch (err: any) {
    console.error('GET Responses Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/**
 * Save a batch of answers: { responses: [{ questionId, recordIndex, value, flag, flagNote, rowVersion }] }.
 * Every change is kept in the answer history. A change that collides with someone else's newer save is
 * returned under "conflicts" and is not applied.
 */
export async function PUT(req: Request, { params }: { params: { engagementId: string } }) {
  try {
    const db = getDb();
    const auth = await authenticate(req, db, params.engagementId);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const eng = auth.engagement;
    if (auth.isClient && !clientMayEdit(eng.status)) return NextResponse.json({ error: 'This form was submitted. Your preparer can reopen it if something needs to change.', locked: true }, { status: 423 });

    const body = await req.json().catch(() => null);
    const responses = Array.isArray(body) ? body : body?.responses;
    if (!Array.isArray(responses)) return NextResponse.json({ error: 'Invalid body, expected { responses: [...] }' }, { status: 400 });
    if (responses.length > 500) return NextResponse.json({ error: 'Too many answers in one save (500 at most)' }, { status: 400 });

    const result = await saveAnswers(db, eng, responses, { userId: auth.userId, role: auth.role });
    if (body && !Array.isArray(body)) {
      const sets: string[] = [], args: any[] = [];
      if (body.language === 'fr' || body.language === 'en') { sets.push('language = ?'); args.push(body.language); }
      if (typeof body.currentStep === 'string') { sets.push('current_step = ?'); args.push(body.currentStep.slice(0, 120)); }
      if (sets.length) await db.prepare(`UPDATE tax_intake_engagements SET ${sets.join(', ')} WHERE id = ?`).run(...args, eng.id);
    }
    // keep one review item per finding (never one per save)
    await refresh(db, eng.id);
    const fresh = await db.prepare('SELECT row_version FROM tax_intake_engagements WHERE id = ?').get(eng.id);

    return NextResponse.json({ success: true, saved: result.saved, conflicts: result.conflicts, unknown: result.unknown, version: fresh.row_version });
  } catch (err: any) {
    console.error('PUT Responses Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
