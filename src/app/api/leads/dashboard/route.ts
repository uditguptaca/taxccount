import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSessionContext } from '@/lib/auth-context';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = getSessionContext();
    if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { orgId } = session;

    const db = getDb();

    const stats = await db.prepare(`
      SELECT
        (SELECT COUNT(*) FROM leads WHERE org_id = ?) as total_leads,
        (SELECT COUNT(*) FROM leads WHERE org_id = ? AND created_at >= datetime('now', '-7 days')) as new_leads_7d,
        (SELECT COUNT(*) FROM leads WHERE org_id = ? AND pipeline_stage = 'qualified' AND status = 'active') as qualified_leads,
        (SELECT COUNT(*) FROM leads WHERE org_id = ? AND status = 'converted') as converted_leads,
        (SELECT COUNT(*) FROM leads WHERE org_id = ? AND status = 'lost') as lost_leads,
        (SELECT COUNT(*) FROM leads WHERE org_id = ? AND status = 'active') as active_leads,
        (SELECT COALESCE(SUM(expected_value), 0) FROM leads WHERE org_id = ? AND status = 'active') as pipeline_value,
        (SELECT COALESCE(SUM(expected_value), 0) FROM leads WHERE org_id = ? AND status = 'converted') as won_value
    `).get(orgId, orgId, orgId, orgId, orgId, orgId, orgId, orgId) as any;

    const totalDecided = stats.converted_leads + stats.lost_leads;
    stats.conversion_rate = totalDecided > 0 ? Math.round((stats.converted_leads / totalDecided) * 100) : 0;

    const bySource = await db.prepare(`
      SELECT source, COUNT(*) as count, SUM(expected_value) as total_value
      FROM leads WHERE org_id = ?
      GROUP BY source ORDER BY count DESC
    `).all(orgId);

    const byScore = await db.prepare(`
      SELECT lead_score, COUNT(*) as count
      FROM leads WHERE org_id = ? AND status = 'active'
      GROUP BY lead_score
    `).all(orgId);

    const pipelineCounts = await db.prepare(`
      SELECT pipeline_stage, COUNT(*) as count
      FROM leads WHERE org_id = ? AND status = 'active'
      GROUP BY pipeline_stage
      ORDER BY CASE pipeline_stage
        WHEN 'new_inquiry' THEN 1 WHEN 'contacted' THEN 2 WHEN 'meeting_scheduled' THEN 3
        WHEN 'proposal_sent' THEN 4 WHEN 'negotiation' THEN 5 WHEN 'qualified' THEN 6
      END
    `).all(orgId);

    const upcomingFollowups = await db.prepare(`
      SELECT l.id, l.lead_code, l.first_name, l.last_name, l.company_name, l.next_followup_date, l.lead_score, l.pipeline_stage,
        u.first_name || ' ' || u.last_name as assigned_name
      FROM leads l
      LEFT JOIN users u ON l.assigned_to = u.id
      WHERE l.org_id = ? AND l.status = 'active' AND l.next_followup_date IS NOT NULL
      ORDER BY l.next_followup_date ASC
      LIMIT 8
    `).all(orgId);

    const topLeads = await db.prepare(`
      SELECT l.id, l.lead_code, l.first_name, l.last_name, l.company_name, l.expected_value, l.lead_score, l.pipeline_stage,
        u.first_name || ' ' || u.last_name as assigned_name
      FROM leads l
      LEFT JOIN users u ON l.assigned_to = u.id
      WHERE l.org_id = ? AND l.status = 'active'
      ORDER BY l.expected_value DESC
      LIMIT 5
    `).all(orgId);

    return NextResponse.json({ stats, bySource, byScore, pipelineCounts, upcomingFollowups, topLeads });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
