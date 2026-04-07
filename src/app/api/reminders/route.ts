import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { seedDatabase } from '@/lib/seed';
import { getSessionContext } from "@/lib/auth-context";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = getSessionContext();
    if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { orgId, userId, role } = session;

seedDatabase();
    const db = getDb();

    const reminders = db.prepare(`
      SELECT r.*, c.display_name as client_name, c.client_code,
        u.first_name || ' ' || u.last_name as assigned_to,
        cc.engagement_code
      FROM reminders r
      LEFT JOIN clients c ON r.client_id = c.id
      LEFT JOIN users u ON r.user_id = u.id
      LEFT JOIN client_compliances cc ON r.engagement_id = cc.id
      ORDER BY r.trigger_date ASC
    `).all();

    const clients = db.prepare(`SELECT id, display_name, client_code FROM clients WHERE status = 'active'`).all();

    return NextResponse.json({ reminders, clients });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = getSessionContext();
    if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { orgId, userId, role } = session;

const db = getDb();
    const body = await request.json();
    const { client_id, title, trigger_date, reminder_type, channel, user_id } = body;

    if (!title || !trigger_date) {
      return NextResponse.json({ error: 'Title and Date are required' }, { status: 400 });
    }

    const { v4: uuidv4 } = require('uuid');
    const reminderId = uuidv4();

    db.prepare(`
      INSERT INTO reminders (
        id, client_id, user_id, title, message_template, reminder_type, channel, 
        trigger_date, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', datetime('now'), datetime('now'))
    `).run(
      reminderId, client_id || null, user_id || null, title, body.message_template || '', 
      reminder_type || 'custom', channel || 'in_app', trigger_date
    );

    return NextResponse.json({ success: true, reminder_id: reminderId });
  } catch (error: any) {
    console.error('Create reminder error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = getSessionContext();
    if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { orgId, userId, role } = session;

    const db = getDb();
    const body = await request.json();
    const { id, title, trigger_date, reminder_type, channel, client_id, status } = body;
    if (!id) return NextResponse.json({ error: 'Reminder ID required' }, { status: 400 });

    const updates: string[] = [];
    const values: any[] = [];
    if (title !== undefined) { updates.push('title = ?'); values.push(title); }
    if (trigger_date !== undefined) { updates.push('trigger_date = ?'); values.push(trigger_date); }
    if (reminder_type !== undefined) { updates.push('reminder_type = ?'); values.push(reminder_type); }
    if (channel !== undefined) { updates.push('channel = ?'); values.push(channel); }
    if (client_id !== undefined) { updates.push('client_id = ?'); values.push(client_id || null); }
    if (status !== undefined) { updates.push('status = ?'); values.push(status); }
    if (updates.length > 0) {
      updates.push("updated_at = datetime('now')");
      values.push(id);
      db.prepare(`UPDATE reminders SET ${updates.join(', ')} WHERE id = ?`).run(...values);
    }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = getSessionContext();
    if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { orgId, userId, role } = session;

const db = getDb();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Reminder ID required' }, { status: 400 });
    db.prepare(`DELETE FROM reminders WHERE id = ?`).run(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
