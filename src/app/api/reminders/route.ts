import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { seedDatabase } from '@/lib/seed';

export async function GET() {
  try {
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
