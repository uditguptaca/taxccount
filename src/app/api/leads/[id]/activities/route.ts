import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { seedDatabase } from '@/lib/seed';
import { v4 as uuidv4 } from 'uuid';

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    seedDatabase();
    const db = getDb();
    const activities = db.prepare(`
      SELECT la.*, u.first_name || ' ' || u.last_name as created_by_name
      FROM lead_activities la
      JOIN users u ON la.created_by = u.id
      WHERE la.lead_id = ?
      ORDER BY la.contact_date DESC
    `).all(params.id);
    return NextResponse.json({ activities });
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
      INSERT INTO lead_activities (id, lead_id, activity_type, summary, outcome, next_action, contact_date, duration_minutes, created_by, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `).run(id, params.id, body.activity_type, body.summary, body.outcome || null, body.next_action || null, body.contact_date || new Date().toISOString(), body.duration_minutes || null, body.created_by);

    // Update last contact date on lead
    db.prepare(`UPDATE leads SET last_contact_date = datetime('now'), updated_at = datetime('now') WHERE id = ?`).run(params.id);

    return NextResponse.json({ id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
