import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { seedDatabase } from '@/lib/seed';

export const dynamic = 'force-dynamic';

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    seedDatabase();
    const db = getDb();
    const { id } = params;

    const lead = db.prepare(`
      SELECT l.*,
        u.first_name || ' ' || u.last_name as assigned_name,
        u.email as assigned_email,
        c.display_name as converted_client_name,
        c.client_code as converted_client_code
      FROM leads l
      LEFT JOIN users u ON l.assigned_to = u.id
      LEFT JOIN clients c ON l.converted_client_id = c.id
      WHERE l.id = ?
    `).get(id);

    if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 });

    const activities = db.prepare(`
      SELECT la.*, u.first_name || ' ' || u.last_name as created_by_name
      FROM lead_activities la
      JOIN users u ON la.created_by = u.id
      WHERE la.lead_id = ?
      ORDER BY la.contact_date DESC
    `).all(id);

    const tasks = db.prepare(`
      SELECT lt.*, 
        u1.first_name || ' ' || u1.last_name as assigned_name,
        u2.first_name || ' ' || u2.last_name as created_by_name
      FROM lead_tasks lt
      LEFT JOIN users u1 ON lt.assigned_to = u1.id
      LEFT JOIN users u2 ON lt.created_by = u2.id
      WHERE lt.lead_id = ?
      ORDER BY lt.due_date ASC
    `).all(id);

    const documents = db.prepare(`
      SELECT ld.*, u.first_name || ' ' || u.last_name as uploaded_by_name
      FROM lead_documents ld
      JOIN users u ON ld.uploaded_by = u.id
      WHERE ld.lead_id = ?
      ORDER BY ld.created_at DESC
    `).all(id);

    const proposals = db.prepare(`
      SELECT lp.*, u.first_name || ' ' || u.last_name as created_by_name
      FROM lead_proposals lp
      JOIN users u ON lp.created_by = u.id
      WHERE lp.lead_id = ?
      ORDER BY lp.created_at DESC
    `).all(id);

    const teamMembers = db.prepare(`
      SELECT id, first_name || ' ' || last_name as name
      FROM users WHERE role IN ('team_member','team_manager','admin','super_admin') AND is_active = 1
      ORDER BY first_name
    `).all();

    // Build timeline from all sources
    const timeline = [
      ...activities.map((a: any) => ({
        type: a.activity_type,
        title: a.summary,
        date: a.contact_date,
        user: a.created_by_name,
        details: a.outcome,
      })),
      ...tasks.filter((t: any) => t.status === 'completed').map((t: any) => ({
        type: 'task_completed',
        title: `Task completed: ${t.title}`,
        date: t.completed_at || t.updated_at,
        user: t.assigned_name,
        details: null,
      })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json({ lead, activities, tasks, documents, proposals, timeline, teamMembers });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    seedDatabase();
    const db = getDb();
    const { id } = params;
    const body = await request.json();

    const setClauses: string[] = ['updated_at = datetime(\'now\')'];
    const vals: any[] = [];
    const allowed = ['first_name','last_name','company_name','email','phone','lead_type','source','pipeline_stage','lead_score','expected_value','status','assigned_to','tags','notes','city','province','postal_code','next_followup_date','last_contact_date','lost_reason','referral_source'];

    for (const key of allowed) {
      if (key in body) { setClauses.push(`${key} = ?`); vals.push(body[key]); }
    }
    vals.push(id);
    db.prepare(`UPDATE leads SET ${setClauses.join(', ')} WHERE id = ?`).run(...vals);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
