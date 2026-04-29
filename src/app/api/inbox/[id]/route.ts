import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSessionContext } from "@/lib/auth-context";

export const dynamic = 'force-dynamic';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = getSessionContext();
    if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { orgId } = session;

    const db = getDb();
    const { id } = await params;
    const body = await request.json();
    const { action } = body; // 'read', 'unread', 'archive'

    if (!action) return NextResponse.json({ error: 'Action is required' }, { status: 400 });

    if (action === 'read') {
      await db.prepare(`UPDATE inbox_items SET is_read = 1, updated_at = NOW() WHERE id = ? AND org_id = ?`).run(id, orgId);
    } else if (action === 'unread') {
      await db.prepare(`UPDATE inbox_items SET is_read = 0, updated_at = NOW() WHERE id = ? AND org_id = ?`).run(id, orgId);
    } else if (action === 'archive') {
      await db.prepare(`UPDATE inbox_items SET is_archived = 1, updated_at = NOW() WHERE id = ? AND org_id = ?`).run(id, orgId);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Inbox update error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
