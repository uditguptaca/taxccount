import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { seedDatabase } from '@/lib/seed';
import { getSessionContext } from "@/lib/auth-context";

export const dynamic = 'force-dynamic';

// GET: Staff-scoped client detail — full transparency read-only
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {

        const session = getSessionContext();
    if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { orgId, userId, role } = session;

    seedDatabase();
    const { searchParams } = new URL(req.url);
    const staffUserId = searchParams.get('user_id');
    if (!staffUserId) return NextResponse.json({ error: 'user_id required' }, { status: 400 });

    const db = getDb();

  const client = db.prepare('SELECT * FROM clients WHERE id = ?').get(params.id);
  if (!client) return NextResponse.json({ error: 'Client not found' }, { status: 404 });

  // Engagements where staff has assigned stages
  const engagements = db.prepare(`
    SELECT ce.*, ct.name AS template_name, ct.category AS compliance_type,
      (SELECT COUNT(*) FROM client_compliance_stages WHERE engagement_id = ce.id) AS total_stages,
      (SELECT COUNT(*) FROM client_compliance_stages WHERE engagement_id = ce.id AND status = 'completed') AS completed_stages,
      (SELECT GROUP_CONCAT(DISTINCT t.name) FROM teams t JOIN team_memberships tm ON tm.team_id = t.id
        JOIN client_compliance_stages cs ON cs.assigned_user_id = tm.user_id WHERE cs.engagement_id = ce.id) AS team_names
    FROM client_compliances ce
    LEFT JOIN compliance_templates ct ON ce.template_id = ct.id
    WHERE ce.client_id = ?
    AND EXISTS (SELECT 1 FROM client_compliance_stages cs WHERE cs.engagement_id = ce.id AND cs.assigned_user_id = ?)
    ORDER BY ce.due_date DESC
  `).all(params.id, userId);

  // All stages for those engagements (full transparency)
  const stages = db.prepare(`
    SELECT cs.*, u.first_name || ' ' || u.last_name AS assigned_name,
      ce.engagement_code
    FROM client_compliance_stages cs
    JOIN client_compliances ce ON cs.engagement_id = ce.id
    LEFT JOIN users u ON cs.assigned_user_id = u.id
    WHERE ce.client_id = ?
    AND EXISTS (SELECT 1 FROM client_compliance_stages cs2 WHERE cs2.engagement_id = ce.id AND cs2.assigned_user_id = ?)
    ORDER BY ce.id, cs.sequence_order ASC
  `).all(params.id, userId);

  // Time entries for this client by this staff (Not implemented yet - mocking empty array)
  const timeEntries: any[] = [];

  // Billing info
  const billing = db.prepare(`
    SELECT COALESCE(SUM(ce.price), 0) AS total_billed,
      COALESCE(SUM(CASE WHEN ce.status != 'completed' THEN ce.price ELSE 0 END), 0) AS pending_amount,
      COALESCE(SUM(CASE WHEN ce.status = 'completed' THEN ce.price ELSE 0 END), 0) AS completed_amount
    FROM client_compliances ce
    WHERE ce.client_id = ?
    AND EXISTS (SELECT 1 FROM client_compliance_stages cs WHERE cs.engagement_id = ce.id AND cs.assigned_user_id = ?)
  `).get(params.id, userId);

  return NextResponse.json({ client, engagements, stages, timeEntries, billing });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
