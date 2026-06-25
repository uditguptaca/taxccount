import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSessionContext } from '@/lib/auth-context';

export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = getSessionContext();
    if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { orgId } = session;
    const db = getDb();
    const { id } = await params;

    const assignment = await db.prepare(`
      SELECT a.*, f.name as form_name, c.display_name as client_name
      FROM smart_form_assignments a
      JOIN smart_forms f ON a.form_id = f.id
      JOIN clients c ON a.client_id = c.id
      WHERE a.id = ? AND a.org_id = ?
    `).get(id, orgId);

    if (!assignment) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const questions = await db.prepare('SELECT * FROM smart_form_questions WHERE version_id = ? ORDER BY sort_order ASC').all(assignment.version_id);
    const responses = await db.prepare('SELECT * FROM smart_form_responses WHERE assignment_id = ?').all(id);

    return NextResponse.json({
      assignment,
      questions,
      responses
    });
  } catch (err: any) {
    console.error('GET Staff Responses Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = getSessionContext();
    if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { orgId } = session;
    const db = getDb();
    const { id } = await params;
    
    const body = await req.json();
    const { action, status, response_id, is_approved, staff_notes } = body;

    const assignment = await db.prepare(`SELECT * FROM smart_form_assignments WHERE id = ? AND org_id = ?`).get(id, orgId);
    if (!assignment) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    if (action === 'update_status') {
      await db.prepare('UPDATE smart_form_assignments SET status = ? WHERE id = ?').run(status, id);
      return NextResponse.json({ success: true });
    }

    if (action === 'review_response') {
      await db.prepare(`
        UPDATE smart_form_responses 
        SET is_approved = ?, staff_notes = ?, reviewed_by = ?, updated_at = ?
        WHERE id = ? AND assignment_id = ?
      `).run(is_approved ? 1 : 0, staff_notes || null, session.userId, new Date().toISOString(), response_id, id);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    console.error('PUT Staff Responses Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
