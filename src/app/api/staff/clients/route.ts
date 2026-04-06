import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { seedDatabase } from '@/lib/seed';
import { getSessionContext } from "@/lib/auth-context";

// GET: Staff-scoped clients — only clients where staff has compliance stage assignments
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

    // Get clients where this staff has assigned stages
    const clients = db.prepare(`
      SELECT DISTINCT c.*,
        (SELECT COUNT(DISTINCT e.id) FROM client_compliances e
          JOIN client_compliance_stages cs ON cs.engagement_id = e.id
          WHERE e.client_id = c.id AND cs.assigned_user_id = ?) AS my_projects,
        (SELECT COUNT(*) FROM client_compliance_stages cs2
          JOIN client_compliances e2 ON cs2.engagement_id = e2.id
          WHERE e2.client_id = c.id AND cs2.assigned_user_id = ? AND cs2.status != 'completed') AS pending_tasks,
        (SELECT COALESCE(SUM(e3.price), 0) FROM client_compliances e3
          JOIN client_compliance_stages cs3 ON cs3.engagement_id = e3.id
          WHERE e3.client_id = c.id AND cs3.assigned_user_id = ?) AS total_billed
      FROM clients c
      JOIN client_compliances ce ON ce.client_id = c.id
      JOIN client_compliance_stages cs ON cs.engagement_id = ce.id
      WHERE cs.assigned_user_id = ?
      ORDER BY c.display_name ASC
    `).all(userId, userId, userId, userId);

    return NextResponse.json({ clients });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
