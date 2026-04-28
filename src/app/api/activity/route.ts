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

    const activities = await db.prepare(`
      SELECT af.*, u.first_name || ' ' || u.last_name as actor_name,
        u.first_name as actor_first,
        c.display_name as client_name
      FROM activity_feed af
      JOIN users u ON af.actor_id = u.id
      LEFT JOIN clients c ON af.client_id = c.id
      ORDER BY af.created_at DESC
    `).all();

    return NextResponse.json({ activities });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
