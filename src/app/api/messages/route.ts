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

    const threads = db.prepare(`
      SELECT ct.*,
        c.display_name as client_name, c.client_code,
        (SELECT content FROM chat_messages WHERE thread_id = ct.id ORDER BY created_at DESC LIMIT 1) as last_message,
        (SELECT u2.first_name || ' ' || u2.last_name FROM chat_messages cm2 JOIN users u2 ON cm2.sender_id = u2.id WHERE cm2.thread_id = ct.id ORDER BY cm2.created_at DESC LIMIT 1) as last_sender,
        (SELECT COUNT(*) FROM chat_messages WHERE thread_id = ct.id AND is_read = 0) as unread_count,
        (SELECT COUNT(*) FROM chat_messages WHERE thread_id = ct.id) as message_count,
        (SELECT COUNT(*) FROM client_tasks WHERE thread_id = ct.id) as task_count,
        (SELECT COUNT(*) FROM client_tasks WHERE thread_id = ct.id AND is_completed = 0) as pending_tasks
      FROM chat_threads ct
      JOIN clients c ON ct.client_id = c.id
      ORDER BY ct.last_message_at DESC
    `).all();

    return NextResponse.json({ threads });
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
    const { client_id, subject, thread_type, message, sender_id } = body;
    
    if (!client_id || !subject || !message || !sender_id) {
       return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { v4: uuidv4 } = require('uuid');
    const threadId = uuidv4();
    const messageId = uuidv4();

    db.prepare(`
      INSERT INTO chat_threads (id, client_id, subject, thread_type, status, last_message_at, created_at, updated_at)
      VALUES (?, ?, ?, ?, 'open', datetime('now'), datetime('now'), datetime('now'))
    `).run(threadId, client_id, subject, thread_type || 'client_communication');

    db.prepare(`
      INSERT INTO chat_messages (id, thread_id, sender_id, content, is_read, created_at, updated_at)
      VALUES (?, ?, ?, ?, 1, datetime('now'), datetime('now'))
    `).run(messageId, threadId, sender_id, message);

    return NextResponse.json({ success: true, thread_id: threadId });
  } catch (error: any) {
    console.error('Create thread error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
