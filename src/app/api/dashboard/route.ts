import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSessionContext } from '@/lib/auth-context';

export async function GET() {
  try {
    const session = getSessionContext();
    if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { orgId, userId, role } = session;
    if (!session || !session.orgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const db = getDb();

    const stats = db.prepare(`
      SELECT
        (SELECT COUNT(*) FROM client_compliances WHERE org_id = ? AND status != 'completed') as totalProjects,
        (SELECT COUNT(*) FROM client_compliances WHERE org_id = ? AND due_date < date('now') AND status != 'completed') as overdueProjects,
        (SELECT COUNT(*) FROM client_compliances WHERE org_id = ? AND status = 'completed') as completedProjects,
        (SELECT COUNT(*) FROM clients WHERE org_id = ? AND status = 'active') as totalClients,
        (SELECT COALESCE(SUM(total_amount), 0) FROM invoices WHERE org_id = ? AND status = 'paid') as totalRevenue,
        (SELECT COALESCE(SUM(total_amount), 0) FROM invoices WHERE org_id = ? AND status IN ('unpaid','sent','overdue')) as pendingRevenue,
        (SELECT COALESCE(SUM(total_amount), 0) FROM invoices WHERE org_id = ? AND status = 'paid' AND paid_date >= date('now','start of month')) as monthRevenue,
        (SELECT COUNT(*) FROM invoices WHERE org_id = ? AND status IN ('unpaid','overdue','sent')) as pendingInvoices,
        (SELECT COUNT(*) FROM document_files WHERE org_id = ? AND status = 'new') as pendingDocuments,
        (SELECT COUNT(*) FROM proposals WHERE org_id = ? AND status = 'sent') as pendingProposals,
        (SELECT COUNT(*) FROM reminders WHERE org_id = ? AND status = 'pending' AND trigger_date <= date('now', '+3 days')) as pendingReminders
    `).get(orgId, orgId, orgId, orgId, orgId, orgId, orgId, orgId, orgId, orgId, orgId);

    const projectsByStage = db.prepare(`
      SELECT
        ccs.stage_name,
        ccs.stage_code,
        COUNT(*) as count,
        SUM(CASE WHEN cc.due_date < date('now') THEN 1 ELSE 0 END) as overdue_count,
        ROUND(AVG(julianday('now') - julianday(ccs.started_at)), 1) as avg_days_in_stage
      FROM client_compliance_stages ccs
      JOIN client_compliances cc ON ccs.engagement_id = cc.id
      WHERE cc.org_id = ? AND ccs.status = 'in_progress' AND cc.status != 'completed'
      GROUP BY ccs.stage_name, ccs.stage_code
      ORDER BY count DESC
    `).all(orgId);

    const recentProjects = db.prepare(`
      SELECT cc.*, c.display_name as client_name, c.client_code,
        ct.code as template_code, ct.name as template_name,
        t.name as team_name,
        (SELECT stage_name FROM client_compliance_stages WHERE engagement_id = cc.id AND status = 'in_progress' LIMIT 1) as current_stage_name,
        (SELECT u.first_name || ' ' || u.last_name FROM client_compliance_stages ccs2 JOIN users u ON ccs2.assigned_user_id = u.id WHERE ccs2.engagement_id = cc.id AND ccs2.status = 'in_progress' LIMIT 1) as assigned_to
      FROM client_compliances cc
      JOIN clients c ON cc.client_id = c.id
      JOIN compliance_templates ct ON cc.template_id = ct.id
      LEFT JOIN teams t ON cc.assigned_team_id = t.id
      WHERE cc.org_id = ? AND cc.status != 'completed'
      ORDER BY cc.due_date ASC
      LIMIT 10
    `).all(orgId);

    const teamWorkload = db.prepare(`
      SELECT u.id, u.first_name || ' ' || u.last_name as name,
        (SELECT COUNT(*) FROM client_compliance_stages ccs JOIN client_compliances cc ON ccs.engagement_id = cc.id WHERE ccs.assigned_user_id = u.id AND ccs.status = 'in_progress' AND cc.org_id = ?) as active,
        (SELECT COUNT(*) FROM client_compliance_stages ccs JOIN client_compliances cc ON ccs.engagement_id = cc.id WHERE ccs.assigned_user_id = u.id AND ccs.status = 'pending' AND cc.org_id = ?) as pending,
        (SELECT COUNT(*) FROM client_compliance_stages ccs JOIN client_compliances cc ON ccs.engagement_id = cc.id WHERE ccs.assigned_user_id = u.id AND ccs.status = 'completed' AND cc.org_id = ?) as completed,
        (
          SELECT COALESCE(SUM(i.total_amount), 0) 
          FROM invoices i 
          WHERE i.org_id = ? AND i.status = 'paid' AND i.engagement_id IN (
            SELECT DISTINCT engagement_id FROM client_compliance_stages WHERE assigned_user_id = u.id
          )
        ) as revenue_attributed
      FROM users u 
      JOIN organization_memberships om ON u.id = om.user_id
      WHERE om.org_id = ? AND u.is_active = 1
      ORDER BY revenue_attributed DESC, active DESC
    `).all(orgId, orgId, orgId, orgId, orgId);

    const upcomingDue = db.prepare(`
      SELECT cc.due_date, c.display_name as client_name, ct.name as template_name
      FROM client_compliances cc
      JOIN clients c ON cc.client_id = c.id
      JOIN compliance_templates ct ON cc.template_id = ct.id
      WHERE cc.org_id = ? AND cc.status != 'completed'
      ORDER BY cc.due_date ASC LIMIT 8
    `).all(orgId);

    const revenuePipeline = db.prepare(`
      SELECT status, COUNT(*) as count, SUM(total_amount) as amount
      FROM invoices WHERE org_id = ? GROUP BY status ORDER BY amount DESC
    `).all(orgId);

    const recentActivity = db.prepare(`
      SELECT af.*, u.first_name || ' ' || u.last_name as actor_name,
        c.display_name as client_name
      FROM activity_feed af
      JOIN users u ON af.actor_id = u.id
      LEFT JOIN clients c ON af.client_id = c.id
      WHERE af.org_id = ?
      ORDER BY af.created_at DESC LIMIT 10
    `).all(orgId);

    const blockedProjects = db.prepare(`
      SELECT cc.*, c.display_name as client_name, c.client_code,
        ct.code as template_code, ct.name as template_name,
        (SELECT stage_name FROM client_compliance_stages WHERE engagement_id = cc.id AND status = 'blocked' LIMIT 1) as blocked_stage_name
      FROM client_compliances cc
      JOIN clients c ON cc.client_id = c.id
      JOIN compliance_templates ct ON cc.template_id = ct.id
      WHERE cc.org_id = ? AND cc.status != 'completed' 
        AND (cc.status = 'blocked' OR EXISTS (SELECT 1 FROM client_compliance_stages WHERE engagement_id = cc.id AND status = 'blocked'))
      ORDER BY cc.due_date ASC
    `).all(orgId);

    const leadsMetricsRow = db.prepare(`
      SELECT 
        COUNT(*) as totalReceived,
        SUM(CASE WHEN status = 'converted' THEN 1 ELSE 0 END) as converted,
        SUM(CASE WHEN status = 'lost' THEN 1 ELSE 0 END) as lost
      FROM leads WHERE org_id = ?
    `).get(orgId) as any;

    const totalLeads = leadsMetricsRow?.totalReceived || 0;
    const convertedLeads = leadsMetricsRow?.converted || 0;
    const leadsMetrics = {
      totalReceived: totalLeads,
      converted: convertedLeads,
      lost: leadsMetricsRow?.lost || 0,
      conversionRate: totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0
    };

    return NextResponse.json({
      stats, projectsByStage, recentProjects, teamWorkload, upcomingDue,
      revenuePipeline, recentActivity, blockedProjects, leadsMetrics
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
