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

    // Calculate revenue attribution by user based on sequence_order = 1 (Primary Preparer)
    const attribution = await db.prepare(`
      SELECT 
        u.id, 
        u.first_name || ' ' || u.last_name as name, 
        u.role as role,
        t.name as team_name,
        COUNT(DISTINCT cc.id) as projects_prepped,
        COALESCE(SUM(i.total_amount), 0) as total_attributed_revenue
      FROM users u
      LEFT JOIN team_memberships tm ON tm.user_id = u.id AND tm.is_active = 1
      LEFT JOIN teams t ON t.id = tm.team_id
      JOIN client_compliance_stages ccs ON ccs.assigned_user_id = u.id AND ccs.sequence_order = 1
      JOIN client_compliances cc ON cc.id = ccs.engagement_id
      JOIN invoices i ON i.engagement_id = cc.id
      WHERE i.status IN ('paid', 'partially_paid', 'sent')
      GROUP BY u.id, u.first_name, u.last_name, u.role, t.name
      ORDER BY total_attributed_revenue DESC
    `).all();

    return NextResponse.json({ attribution });
  } catch (error) {
    console.error('Revenue attribution calculation error:', error);
    return NextResponse.json({ error: 'Failed to calculate revenue attribution' }, { status: 500 });
  }
}
