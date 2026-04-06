import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { getSessionContext } from "@/lib/auth-context";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = getSessionContext();
    if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { orgId, userId, role } = session;

    const db = getDb();
    const client = db.prepare('SELECT * FROM clients WHERE portal_user_id = ?').get(userId) as any;
    if (!client) return NextResponse.json({ error: 'Client not found' }, { status: 404 });

    const reminders = db.prepare(`
      SELECT * FROM reminders 
      WHERE client_id = ? AND reminder_type = 'client_private'
      ORDER BY trigger_date ASC
    `).all(client.id) as any[];

    return NextResponse.json({ reminders });
  } catch (error) {
    console.error('Portal reminders error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = getSessionContext();
    if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { orgId, userId, role } = session;

    const { title, message, trigger_date, channel = 'in_app' } = await request.json();

    const db = getDb();
    const client = db.prepare('SELECT * FROM clients WHERE portal_user_id = ?').get(userId) as any;
    if (!client) return NextResponse.json({ error: 'Client not found' }, { status: 404 });

    const id = uuidv4();
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO reminders (id, reminder_type, client_id, user_id, title, message, trigger_date, trigger_time, is_recurring, channel, status, created_by, created_at)
      VALUES (?, 'client_private', ?, ?, ?, ?, ?, NULL, 0, ?, 'pending', ?, ?)
    `).run(id, client.id, userId, title, message || null, trigger_date, channel, userId, now);

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Portal reminders error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
