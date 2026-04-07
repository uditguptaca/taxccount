import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { seedDatabase } from '@/lib/seed';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    seedDatabase();
    const db = getDb();

    const stats = db.prepare(`
      SELECT
        (SELECT COUNT(*) FROM leads) as total_leads,
        (SELECT COUNT(*) FROM leads WHERE created_at >= datetime('now', '-7 days')) as new_leads_7d,
        (SELECT COUNT(*) FROM leads WHERE pipeline_stage = 'qualified' AND status = 'active') as qualified_leads,
        (SELECT COUNT(*) FROM leads WHERE status = 'converted') as converted_leads,
        (SELECT COUNT(*) FROM leads WHERE status = 'lost') as lost_leads,
        (SELECT COUNT(*) FROM leads WHERE status = 'active') as active_leads,
        (SELECT COALESCE(SUM(expected_value), 0) FROM leads WHERE status = 'active') as pipeline_value,
        (SELECT COALESCE(SUM(expected_value), 0) FROM leads WHERE status = 'converted') as won_value
    `).get() as any;

    const totalDecided = stats.converted_leads + stats.lost_leads;
    stats.conversion_rate = totalDecided > 0 ? Math.round((stats.converted_leads / totalDecided) * 100) : 0;

    const bySource = db.prepare(`
      SELECT source, COUNT(*) as count, SUM(expected_value) as total_value
      FROM leads
      GROUP BY source ORDER BY count DESC
    `).all();

    const byScore = db.prepare(`
      SELECT lead_score, COUNT(*) as count
      FROM leads WHERE status = 'active'
      GROUP BY lead_score
    `).all();

    const pipelineCounts = db.prepare(`
      SELECT pipeline_stage, COUNT(*) as count
      FROM leads WHERE status = 'active'
      GROUP BY pipeline_stage
      ORDER BY CASE pipeline_stage
        WHEN 'new_inquiry' THEN 1 WHEN 'contacted' THEN 2 WHEN 'meeting_scheduled' THEN 3
        WHEN 'proposal_sent' THEN 4 WHEN 'negotiation' THEN 5 WHEN 'qualified' THEN 6
      END
    `).all();

    const upcomingFollowups = db.prepare(`
      SELECT l.id, l.lead_code, l.first_name, l.last_name, l.company_name, l.next_followup_date, l.lead_score, l.pipeline_stage,
        u.first_name || ' ' || u.last_name as assigned_name
      FROM leads l
      LEFT JOIN users u ON l.assigned_to = u.id
      WHERE l.status = 'active' AND l.next_followup_date IS NOT NULL
      ORDER BY l.next_followup_date ASC
      LIMIT 8
    `).all();

    const topLeads = db.prepare(`
      SELECT l.id, l.lead_code, l.first_name, l.last_name, l.company_name, l.expected_value, l.lead_score, l.pipeline_stage,
        u.first_name || ' ' || u.last_name as assigned_name
      FROM leads l
      LEFT JOIN users u ON l.assigned_to = u.id
      WHERE l.status = 'active'
      ORDER BY l.expected_value DESC
      LIMIT 5
    `).all();

    return NextResponse.json({ stats, bySource, byScore, pipelineCounts, upcomingFollowups, topLeads });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
