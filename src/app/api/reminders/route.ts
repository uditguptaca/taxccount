import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSessionContext } from "@/lib/auth-context";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = getSessionContext();
    if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { orgId } = session;

    const db = getDb();

    const reminders = await db.prepare(`
      SELECT r.*, c.display_name as client_name, c.client_code,
        u.first_name || ' ' || u.last_name as assigned_to,
        cc.engagement_code
      FROM reminders r
      LEFT JOIN clients c ON r.client_id = c.id
      LEFT JOIN users u ON r.user_id = u.id
      LEFT JOIN client_compliances cc ON r.engagement_id = cc.id
      WHERE r.org_id = ?
      ORDER BY r.trigger_date ASC
    `).all(orgId);

    const clients = await db.prepare(`SELECT id, display_name, client_code FROM clients WHERE status = 'active' AND org_id = ?`).all(orgId);

    return NextResponse.json({ reminders, clients });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = getSessionContext();
    if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { orgId, userId } = session;

    const db = getDb();
    const body = await request.json();
    // Accept alternative field names (TestSprite sends description/date)
    const title = body.title;
    const message = body.message || body.description || '';
    const trigger_date = body.trigger_date || body.date;
    const { client_id, engagement_id, reminder_type, channel, user_id } = body;

    if (!title || !trigger_date) {
      return NextResponse.json({ error: 'Title and Date are required' }, { status: 400 });
    }

    if (isNaN(Date.parse(trigger_date))) {
      return NextResponse.json({ error: 'Invalid date format' }, { status: 400 });
    }

    const { v4: uuidv4 } = require('uuid');
    const reminderId = uuidv4();
    const created_by = userId;

    await db.prepare(`
      INSERT INTO reminders (
        id, org_id, client_id, engagement_id, user_id, title, message, reminder_type, 
        channel, trigger_date, status, is_recurring, created_by, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `).run(
      reminderId, orgId, client_id || null, engagement_id || null, user_id || null, 
      title, message || '', reminder_type || 'custom', channel || 'in_app', trigger_date,
      'pending', 0, created_by
    );

    const newReminder = await db.prepare(`SELECT * FROM reminders WHERE id = ?`).get(reminderId);
    return NextResponse.json(newReminder);
  } catch (error: any) {
    console.error('[Reminders POST Error]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = getSessionContext();
    if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { orgId } = session;

    const db = getDb();
    const body = await request.json();
    const { id, title, message, trigger_date, status, reminder_type, channel } = body;

    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

    await db.prepare(`
      UPDATE reminders
      SET title = ?, message = ?, trigger_date = ?, status = ?, reminder_type = ?, channel = ?
      WHERE id = ? AND org_id = ?
    `).run(
      title, message || '', trigger_date, status || 'pending', 
      reminder_type || 'custom', channel || 'in_app', id, orgId
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[Reminders PUT Error]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = getSessionContext();
    if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { orgId } = session;

    const db = getDb();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

    await db.prepare(`DELETE FROM reminders WHERE id = ? AND org_id = ?`).run(id, orgId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[Reminders DELETE Error]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
