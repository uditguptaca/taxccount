import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { seedDatabase } from '@/lib/seed';
import { getSessionContext } from "@/lib/auth-context";

export const dynamic = 'force-dynamic';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {

        const session = getSessionContext();
    if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { orgId, userId, role } = session;

    seedDatabase();
    const db = getDb();
    const { id: targetUserId } = await params;

    const stages = db.prepare(`
      SELECT 
        ccs.id as stage_id, ccs.stage_name, ccs.status, ccs.sequence_order,
        cc.id as engagement_id, cc.engagement_code, cc.due_date,
        c.display_name as client_name,
        ct.name as template_name
      FROM client_compliance_stages ccs
      JOIN client_compliances cc ON cc.id = ccs.engagement_id
      JOIN clients c ON c.id = cc.client_id
      JOIN compliance_templates ct ON ct.id = cc.template_id
      WHERE ccs.assigned_user_id = ? AND ccs.status IN ('pending', 'in_progress')
      ORDER BY cc.due_date ASC, ccs.sequence_order ASC
    `).all(targetUserId);

    return NextResponse.json({ stages });
  } catch (error) {
    console.error('Fetch user stages error:', error);
    return NextResponse.json({ error: 'Failed to load user stages' }, { status: 500 });
  }
}
