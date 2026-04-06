import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { seedDatabase } from '@/lib/seed';
import { getSessionContext } from "@/lib/auth-context";

export async function GET(request: Request, { params }: { params: { threadId: string } }) {
  try {
    const session = getSessionContext();
    if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { orgId, userId, role } = session;

seedDatabase();
    const db = getDb();

    const thread = db.prepare(`
      SELECT ct.*, c.display_name as client_name
      FROM chat_threads ct JOIN clients c ON ct.client_id = c.id
      WHERE ct.id = ?
    `).get(params.threadId);

    const messages = db.prepare(`
      SELECT cm.*, u.first_name || ' ' || u.last_name as sender_name,
        u.first_name as sender_first, u.role as sender_role
      FROM chat_messages cm
      JOIN users u ON cm.sender_id = u.id
      WHERE cm.thread_id = ?
      ORDER BY cm.created_at ASC
    `).all(params.threadId);

    const tasks = db.prepare(`
      SELECT * FROM client_tasks WHERE thread_id = ? ORDER BY created_at ASC
    `).all(params.threadId);

    return NextResponse.json({ thread, messages, tasks });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ threadId: string }> }) {
  try {
    const session = getSessionContext();
    if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { orgId, userId, role } = session;

const db = getDb();
    const { threadId } = await params;
    const body = await request.json();
    const { sender_id, content, is_internal } = body;
    
    if (!sender_id || !content) {
       return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { v4: uuidv4 } = require('uuid');
    const messageId = uuidv4();

    db.prepare(`
      INSERT INTO chat_messages (id, thread_id, sender_id, content, is_internal, is_read, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, 1, datetime('now'), datetime('now'))
    `).run(messageId, threadId, sender_id, content, is_internal || 0);

    // Update thread last_message_at
    db.prepare(`
      UPDATE chat_threads SET last_message_at = datetime('now') WHERE id = ?
    `).run(threadId);

    return NextResponse.json({ success: true, message_id: messageId });
  } catch (error: any) {
    console.error('Send message error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
