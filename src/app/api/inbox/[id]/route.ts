import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSessionContext } from "@/lib/auth-context";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const db = getDb();
    const { id } = await params;
    const body = await request.json();
    const { action } = body; // 'read', 'unread', 'archive'

    if (!action) return NextResponse.json({ error: 'Action is required' }, { status: 400 });

    if (action === 'read') {
      db.prepare(`UPDATE inbox_items SET is_read = 1, updated_at = datetime('now') WHERE id = ?`).run(id);
    } else if (action === 'unread') {
      db.prepare(`UPDATE inbox_items SET is_read = 0, updated_at = datetime('now') WHERE id = ?`).run(id);
    } else if (action === 'archive') {
      db.prepare(`UPDATE inbox_items SET is_archived = 1, updated_at = datetime('now') WHERE id = ?`).run(id);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Inbox update error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
