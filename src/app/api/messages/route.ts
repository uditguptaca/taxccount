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

    const threads = await db.prepare(`
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
      WHERE ct.org_id = ?
      ORDER BY ct.last_message_at DESC
    `).all(orgId);

    return NextResponse.json({ threads });
  } catch (error: any) {
    console.error('[Messages GET Error]:', error);
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
    const { client_id, subject, thread_type, message, sender_id, thread_id } = body;
    
    const actualSenderId = sender_id || userId;
    const actualSubject = subject || 'New Message';

    if (!client_id || !message) {
       return NextResponse.json({ error: 'Missing required fields: client_id and message' }, { status: 400 });
    }

    const { v4: uuidv4 } = require('uuid');
    let actualThreadId = thread_id;

    if (!actualThreadId) {
      actualThreadId = uuidv4();
      console.log('[Messages POST] Creating thread:', actualThreadId, 'for Org:', orgId);

      await db.prepare(`
        INSERT INTO chat_threads (id, org_id, client_id, subject, thread_type, is_active, last_message_at, created_by, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, 1, NOW(), ?, NOW(), NOW())
      `).run(actualThreadId, orgId, client_id, actualSubject, thread_type === 'internal' ? 'internal' : 'client_facing', userId);
    } else {
      await db.prepare(`UPDATE chat_threads SET last_message_at = NOW(), updated_at = NOW() WHERE id = ? AND org_id = ?`).run(actualThreadId, orgId);
    }

    const messageId = uuidv4();

    await db.prepare(`
      INSERT INTO chat_messages (id, org_id, thread_id, sender_id, content, is_read, created_at)
      VALUES (?, ?, ?, ?, ?, 1, NOW())
    `).run(messageId, orgId, actualThreadId, actualSenderId, message);

    return NextResponse.json({ success: true, thread_id: actualThreadId });
  } catch (error: any) {
    console.error('[Messages POST Error]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
