import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { seedDatabase } from '@/lib/seed';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    const session = getSessionContext();
    if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { orgId } = session;

    const db = getDb();
    const tasks = await db.prepare(`
      SELECT lt.*, u.first_name || ' ' || u.last_name as assigned_name
      FROM lead_tasks lt
      LEFT JOIN users u ON lt.assigned_to = u.id
      WHERE lt.lead_id = ? AND lt.org_id = ?
      ORDER BY lt.due_date ASC
    `).all(params.id, orgId);
    return NextResponse.json({ tasks });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = getSessionContext();
    if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { orgId, userId } = session;

    const db = getDb();
    const body = await request.json();
    const id = uuidv4();

    await db.prepare(`
      INSERT INTO lead_tasks (id, org_id, lead_id, title, description, assigned_to, due_date, priority, status, created_by, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, NOW(), NOW())
    `).run(id, orgId, params.id, body.title, body.description || null, body.assigned_to || null, body.due_date || null, body.priority || 'medium', userId);

    return NextResponse.json({ id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = getSessionContext();
    if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { orgId } = session;

    const db = getDb();
    const body = await request.json();

    if (body.status === 'completed') {
      await db.prepare(`UPDATE lead_tasks SET status = 'completed', completed_at = NOW(), updated_at = NOW() WHERE id = ? AND org_id = ?`).run(body.id, orgId);
    } else {
      const setClauses: string[] = ['updated_at = NOW()'];
      const vals: any[] = [];
      for (const key of ['title','description','assigned_to','due_date','priority','status']) {
        if (key in body) { setClauses.push(`${key} = ?`); vals.push(body[key]); }
      }
      vals.push(body.id, orgId);
      await db.prepare(`UPDATE lead_tasks SET ${setClauses.join(', ')} WHERE id = ? AND org_id = ?`).run(...vals);
    }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
