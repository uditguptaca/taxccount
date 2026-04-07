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

    const items = db.prepare(`
      SELECT ii.*, c.display_name as client_name
      FROM inbox_items ii
      LEFT JOIN clients c ON ii.client_id = c.id
      ORDER BY ii.created_at DESC
    `).all();

    const unreadCount = db.prepare(`
      SELECT COUNT(*) as count FROM inbox_items WHERE is_read = 0 AND is_archived = 0
    `).get() as any;

    return NextResponse.json({ items, unreadCount: unreadCount.count });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
