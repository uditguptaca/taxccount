import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSessionContext } from '@/lib/auth-context';

export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = getSessionContext();
    if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { orgId: clientId } = session;
    const db = getDb();
    const { id } = await params;

    const assignment = await db.prepare(`
      SELECT a.*, f.name as form_name, f.description as form_description
      FROM smart_form_assignments a
      JOIN smart_forms f ON a.form_id = f.id
      WHERE a.id = ? AND a.client_id = ?
    `).get(id, clientId);

    if (!assignment) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const questions = await db.prepare('SELECT * FROM smart_form_questions WHERE version_id = ? ORDER BY sort_order ASC').all(assignment.version_id);
    const sections = await db.prepare('SELECT * FROM smart_form_sections WHERE version_id = ? ORDER BY sort_order ASC').all(assignment.version_id);
    const responses = await db.prepare('SELECT * FROM smart_form_responses WHERE assignment_id = ?').all(id);

    return NextResponse.json({
      assignment,
      sections,
      questions,
      responses
    });
  } catch (err: any) {
    console.error('GET Portal Smart Form Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = getSessionContext();
    if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { orgId: clientId } = session;
    const db = getDb();
    const { id } = await params;
    
    const body = await req.json();
    const { action, responses, is_final_submit } = body;

    const assignment = await db.prepare(`SELECT * FROM smart_form_assignments WHERE id = ? AND client_id = ?`).get(id, clientId);
    if (!assignment) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (assignment.status === 'Completed') return NextResponse.json({ error: 'Form is already completed' }, { status: 400 });

    if (action === 'save_responses') {
      await (db.transaction(async (txDb: any) => {
        // Simple wipe and insert for draft saves
        await txDb.prepare('DELETE FROM smart_form_responses WHERE assignment_id = ?').run(id);

        for (const [qId, val] of Object.entries(responses || {})) {
          // If value is array (for multi-select or files), JSON.stringify it.
          const valueText = typeof val === 'object' ? JSON.stringify(val) : String(val);
          await txDb.prepare(`
            INSERT INTO smart_form_responses (id, org_id, assignment_id, question_id, response_value, responded_by, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `).run(
            crypto.randomUUID(), assignment.org_id, id, qId, valueText, clientId, new Date().toISOString(), new Date().toISOString()
          );
        }

        const newStatus = is_final_submit ? 'Under review' : 'In progress';
        const completedAt = is_final_submit ? new Date().toISOString() : null;

        await txDb.prepare(`UPDATE smart_form_assignments SET status = ?, completed_at = ? WHERE id = ?`).run(newStatus, completedAt, id);
      }))();

      return NextResponse.json({ success: true, status: is_final_submit ? 'Under review' : 'In progress' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    console.error('PUT Portal Smart Form Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
