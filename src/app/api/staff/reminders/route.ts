import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

// GET: Fetch personal staff reminders
export async function GET(req: Request) {
  try {
    const db = getDb();
    const url = new URL(req.url);
    const userId = url.searchParams.get('user_id');

    if (!userId) {
      return NextResponse.json({ error: 'user_id is required' }, { status: 400 });
    }

    const reminders = db.prepare(`
      SELECT * FROM staff_reminders 
      WHERE user_id = ? AND status = 'pending'
      ORDER BY trigger_date ASC
    `).all(userId);

    return NextResponse.json({ reminders });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Create a new personal reminder
export async function POST(req: Request) {
  try {
    const db = getDb();
    const body = await req.json();
    const { user_id, title, message, trigger_date, days_before_due, related_task_type, related_task_id } = body;

    if (!user_id || !title || !trigger_date) {
      return NextResponse.json({ error: 'user_id, title, and trigger_date are required' }, { status: 400 });
    }

    const id = uuidv4();
    db.prepare(`
      INSERT INTO staff_reminders (id, user_id, title, message, related_task_type, related_task_id, trigger_date, days_before_due, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', datetime('now'))
    `).run(id, user_id, title, message || null, related_task_type || null, related_task_id || null, trigger_date, days_before_due || 3);

    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH: Dismiss or snooze a reminder
export async function PATCH(req: Request) {
  try {
    const db = getDb();
    const body = await req.json();
    const { reminder_id, action, snooze_days } = body;

    if (!reminder_id) {
      return NextResponse.json({ error: 'reminder_id is required' }, { status: 400 });
    }

    if (action === 'dismiss') {
      db.prepare(`UPDATE staff_reminders SET status = 'dismissed' WHERE id = ?`).run(reminder_id);
    } else if (action === 'snooze' && snooze_days) {
      const newDate = new Date(Date.now() + snooze_days * 86400000).toISOString().split('T')[0];
      db.prepare(`UPDATE staff_reminders SET trigger_date = ?, status = 'pending' WHERE id = ?`).run(newDate, reminder_id);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
