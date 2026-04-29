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

    // // seedDatabase(); // Removed: seed only runs during auth // Removed: seed only runs during auth
    const db = getDb();

    const items = await db.prepare(`
      SELECT ii.*, c.display_name as client_name
      FROM inbox_items ii
      LEFT JOIN clients c ON ii.client_id = c.id
      WHERE ii.org_id = ?
      ORDER BY ii.created_at DESC
    `).all(orgId);

    const unreadCount = await db.prepare(`
      SELECT COUNT(*) as count FROM inbox_items WHERE is_read = 0 AND is_archived = 0 AND org_id = ?
    `).get(orgId) as any;

    return NextResponse.json({ items, unreadCount: unreadCount.count });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
