import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { seedDatabase } from '@/lib/seed';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    seedDatabase();
    const db = getDb();
    const tasks = db.prepare(`
      SELECT lt.*, u.first_name || ' ' || u.last_name as assigned_name
      FROM lead_tasks lt
      LEFT JOIN users u ON lt.assigned_to = u.id
      WHERE lt.lead_id = ?
      ORDER BY lt.due_date ASC
    `).all(params.id);
    return NextResponse.json({ tasks });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    seedDatabase();
    const db = getDb();
    const body = await request.json();
    const id = uuidv4();

    db.prepare(`
      INSERT INTO lead_tasks (id, lead_id, title, description, assigned_to, due_date, priority, status, created_by, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?, datetime('now'), datetime('now'))
    `).run(id, params.id, body.title, body.description || null, body.assigned_to || null, body.due_date || null, body.priority || 'medium', body.created_by);

    return NextResponse.json({ id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    seedDatabase();
    const db = getDb();
    const body = await request.json();

    if (body.status === 'completed') {
      db.prepare(`UPDATE lead_tasks SET status = 'completed', completed_at = datetime('now'), updated_at = datetime('now') WHERE id = ?`).run(body.id);
    } else {
      const setClauses: string[] = ['updated_at = datetime(\'now\')'];
      const vals: any[] = [];
      for (const key of ['title','description','assigned_to','due_date','priority','status']) {
        if (key in body) { setClauses.push(`${key} = ?`); vals.push(body[key]); }
      }
      vals.push(body.id);
      db.prepare(`UPDATE lead_tasks SET ${setClauses.join(', ')} WHERE id = ?`).run(...vals);
    }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
