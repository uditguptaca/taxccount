import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

// GET: Staff-scoped inbox/notifications
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('user_id');
  if (!userId) return NextResponse.json({ error: 'user_id required' }, { status: 400 });

  const db = getDb();

  // Get notifications for this user
  const items = db.prepare(`
    SELECT n.* FROM notifications n
    WHERE n.user_id = ? OR n.user_id IS NULL
    ORDER BY n.created_at DESC
    LIMIT 100
  `).all(userId);

  const unreadCount = db.prepare(`
    SELECT COUNT(*) as count FROM notifications
    WHERE (user_id = ? OR user_id IS NULL) AND is_read = 0
  `).get(userId) as any;

  return NextResponse.json({ items, unreadCount: unreadCount?.count || 0 });
}

// PATCH: Mark notification read/archive
export async function PATCH(req: Request) {
  const body = await req.json();
  const { notification_id, action } = body;
  if (!notification_id) return NextResponse.json({ error: 'notification_id required' }, { status: 400 });

  const db = getDb();

  if (action === 'read') {
    db.prepare('UPDATE notifications SET is_read = 1 WHERE id = ?').run(notification_id);
  } else if (action === 'unread') {
    db.prepare('UPDATE notifications SET is_read = 0 WHERE id = ?').run(notification_id);
  } else if (action === 'archive') {
    db.prepare('UPDATE notifications SET is_archived = 1 WHERE id = ?').run(notification_id);
  }

  return NextResponse.json({ success: true });
}
