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

    const threads = db.prepare(`
      SELECT cht.*,
        (SELECT COUNT(*) FROM chat_messages cm WHERE cm.thread_id = cht.id AND cm.is_read = 0 AND cm.sender_id != ?) as unread_count,
        (SELECT content FROM chat_messages cm2 WHERE cm2.thread_id = cht.id AND cm2.is_internal = 0 ORDER BY cm2.created_at DESC LIMIT 1) as last_message,
        (SELECT u.first_name || ' ' || u.last_name FROM chat_messages cm3 JOIN users u ON cm3.sender_id = u.id WHERE cm3.thread_id = cht.id AND cm3.is_internal = 0 ORDER BY cm3.created_at DESC LIMIT 1) as last_sender
      FROM chat_threads cht
      WHERE cht.client_id = ? AND cht.thread_type = 'client_facing' AND cht.is_active = 1
      ORDER BY cht.last_message_at DESC
    `).all(userId, client.id) as any[];

    return NextResponse.json({ threads });
  } catch (error) {
    console.error('Portal chats error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Send a new message
export async function POST(request: Request) {
  try {
    const session = getSessionContext();
    if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { orgId, userId, role } = session;

    const { threadId, content } = await request.json();
    if (!threadId || !content) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

    const db = getDb();
    const msgId = uuidv4();
    db.prepare(`INSERT INTO chat_messages (id, thread_id, sender_id, content, is_internal, is_read, created_at) VALUES (?, ?, ?, ?, 0, 0, datetime('now'))`).run(msgId, threadId, userId, content);
    db.prepare(`UPDATE chat_threads SET last_message_at = datetime('now'), updated_at = datetime('now') WHERE id = ?`).run(threadId);

    return NextResponse.json({ id: msgId, success: true });
  } catch (error) {
    console.error('Portal chat send error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
