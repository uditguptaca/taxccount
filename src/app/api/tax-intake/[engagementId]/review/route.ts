import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { randomUUID } from 'crypto';
import { authenticateIntake as authenticate } from '@/lib/tax-intake-access';

export const dynamic = 'force-dynamic';

// Review items are the firm's working list. A client never reads it: they see their own open questions on the form itself.
const STATUSES = ['open', 'in_progress', 'resolved', 'deferred'];

export async function GET(req: Request, { params }: { params: { engagementId: string } }) {
  try {
    const db = getDb();
    const auth = await authenticate(req, db, params.engagementId);
    if (!auth || auth.isClient) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const sp = new URL(req.url).searchParams;
    let sql = 'SELECT * FROM tax_intake_review_items WHERE engagement_id = ?';
    const args: any[] = [params.engagementId];
    if (sp.get('status')) { sql += ' AND status = ?'; args.push(sp.get('status')); }
    if (sp.get('type')) { sql += ' AND type = ?'; args.push(sp.get('type')); }
    sql += " ORDER BY CASE severity WHEN 'blocking' THEN 0 WHEN 'specialist' THEN 1 WHEN 'warning' THEN 2 ELSE 3 END, created_at";
    return NextResponse.json({ reviewItems: await db.prepare(sql).all(...args) });
  } catch (err: any) {
    console.error('GET Review Items Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: { engagementId: string } }) {
  try {
    const db = getDb();
    const auth = await authenticate(req, db, params.engagementId);
    if (!auth || auth.isClient) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const b = await req.json().catch(() => ({}));
    if (!b.type || !b.title) return NextResponse.json({ error: 'Missing required fields: type, title' }, { status: 400 });
    const id = randomUUID(), now = new Date().toISOString();
    await db.prepare(`INSERT INTO tax_intake_review_items (id, engagement_id, question_id, record_index, type, title, description, status, assigned_to, client_note, preparer_note, created_at, updated_at, source, severity)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'open', ?, ?, ?, ?, ?, 'preparer', ?)`).run(id, params.engagementId, b.questionId || null, b.recordIndex || 0, String(b.type).slice(0, 40), String(b.title).slice(0, 400), b.description || null, b.assignedTo || null, b.clientNote || null, b.preparerNote || null, now, now, ['info', 'warning', 'blocking', 'specialist'].includes(b.severity) ? b.severity : 'warning');
    return NextResponse.json({ success: true, id });
  } catch (err: any) {
    console.error('POST Review Items Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { engagementId: string } }) {
  try {
    const db = getDb();
    const auth = await authenticate(req, db, params.engagementId);
    if (!auth || auth.isClient) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const b = await req.json().catch(() => ({}));
    if (!b.id) return NextResponse.json({ error: 'Missing review item id' }, { status: 400 });
    const now = new Date().toISOString();
    const sets: string[] = ['updated_at = ?'], args: any[] = [now];
    if (b.status !== undefined) {
      if (!STATUSES.includes(b.status)) return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
      sets.push('status = ?'); args.push(b.status);
      if (b.status === 'resolved') { sets.push('resolved_at = ?', 'resolved_by = ?'); args.push(now, auth.userId); }
      else { sets.push('resolved_at = NULL', 'resolved_by = NULL'); }
    }
    const pn = b.preparerNote ?? b.preparer_note, cn = b.clientNote ?? b.client_note, as = b.assignedTo ?? b.assigned_to;
    if (pn !== undefined) { sets.push('preparer_note = ?'); args.push(pn); }
    if (cn !== undefined) { sets.push('client_note = ?'); args.push(cn); }
    if (as !== undefined) { sets.push('assigned_to = ?'); args.push(as); }
    await db.prepare(`UPDATE tax_intake_review_items SET ${sets.join(', ')} WHERE id = ? AND engagement_id = ?`).run(...args, b.id, params.engagementId);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('PUT Review Items Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
