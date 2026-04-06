import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSessionContext } from "@/lib/auth-context";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {

        const session = getSessionContext();
    if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { orgId, userId, role } = session;

    const db = getDb();
    const client = db.prepare('SELECT * FROM clients WHERE portal_user_id = ?').get(userId) as any;
    if (!client) return NextResponse.json({ error: 'Client not found' }, { status: 404 });

    const { searchParams } = new URL(request.url);
    const threadId = searchParams.get('threadId');
    if (!threadId) return NextResponse.json({ error: 'threadId required' }, { status: 400 });

    // Verify thread belongs to this client
    const thread = db.prepare('SELECT * FROM chat_threads WHERE id = ? AND client_id = ? AND thread_type = ?').get(threadId, client.id, 'client_facing') as any;
    if (!thread) return NextResponse.json({ error: 'Thread not found' }, { status: 404 });

    const messages = db.prepare(`
      SELECT cm.*, u.first_name || ' ' || u.last_name as sender_name, u.role as sender_role
      FROM chat_messages cm
      JOIN users u ON cm.sender_id = u.id
      WHERE cm.thread_id = ? AND cm.is_internal = 0
      ORDER BY cm.created_at ASC
    `).all(threadId) as any[];

    // Mark as read
    db.prepare('UPDATE chat_messages SET is_read = 1 WHERE thread_id = ? AND sender_id != ?').run(threadId, userId);

    // Get tasks for this thread
    const tasks = db.prepare(`
      SELECT * FROM client_tasks WHERE thread_id = ? AND client_id = ?
      ORDER BY is_completed ASC, created_at ASC
    `).all(threadId, client.id) as any[];

    return NextResponse.json({ thread, messages, tasks });
  } catch (error) {
    console.error('Portal chat messages error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
