import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { seedDatabase } from '@/lib/seed';
import { getSessionContext } from "@/lib/auth-context";

export const dynamic = 'force-dynamic';

// GET: Staff-scoped leads
export async function GET(req: Request) {
  try {

        const session = getSessionContext();
    if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { orgId, userId, role } = session;

    seedDatabase();
    const { searchParams } = new URL(req.url);
    const staffUserId = searchParams.get('user_id');
    if (!staffUserId) return NextResponse.json({ error: 'user_id required' }, { status: 400 });

    const db = getDb();

    // Get leads assigned to this user
    const myLeads = db.prepare(`
      SELECT l.*,
        l.first_name || ' ' || COALESCE(l.last_name, '') AS name,
        u.first_name || ' ' || u.last_name AS assigned_name
      FROM leads l
      LEFT JOIN users u ON l.assigned_to = u.id
      WHERE l.assigned_to = ?
      ORDER BY l.created_at DESC
    `).all(staffUserId);

    // Also get leads assigned to user's team members (for visibility)
    const teamLeads = db.prepare(`
      SELECT l.*,
        l.first_name || ' ' || COALESCE(l.last_name, '') AS name,
        u.first_name || ' ' || u.last_name AS assigned_name
      FROM leads l
      LEFT JOIN users u ON l.assigned_to = u.id
      WHERE l.assigned_to IN (
        SELECT tm2.user_id FROM team_memberships tm1
        JOIN team_memberships tm2 ON tm1.team_id = tm2.team_id
        WHERE tm1.user_id = ? AND tm2.user_id != ?
      )
      ORDER BY l.created_at DESC
    `).all(staffUserId, staffUserId);

    return NextResponse.json({ myLeads, teamLeads });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
