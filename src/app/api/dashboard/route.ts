import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { seedDatabase } from '@/lib/seed';

export async function GET() {
  try {
    seedDatabase();
    const db = getDb();

    const stats = db.prepare(`
      SELECT
        (SELECT COUNT(*) FROM client_compliances WHERE status != 'completed') as totalProjects,
        (SELECT COUNT(*) FROM client_compliances WHERE due_date < date('now') AND status != 'completed') as overdueProjects,
        (SELECT COUNT(*) FROM client_compliances WHERE status = 'completed') as completedProjects,
        (SELECT COUNT(*) FROM clients WHERE status = 'active') as totalClients,
        (SELECT COALESCE(SUM(total_amount), 0) FROM invoices WHERE status = 'paid') as totalRevenue,
        (SELECT COALESCE(SUM(total_amount), 0) FROM invoices WHERE status IN ('unpaid','sent','overdue')) as pendingRevenue,
        (SELECT COALESCE(SUM(total_amount), 0) FROM invoices WHERE status = 'paid' AND paid_date >= date('now','start of month')) as monthRevenue,
        (SELECT COUNT(*) FROM invoices WHERE status IN ('unpaid','overdue','sent')) as pendingInvoices,
        (SELECT COUNT(*) FROM document_files WHERE status = 'new') as pendingDocuments,
        (SELECT COUNT(*) FROM proposals WHERE status = 'sent') as pendingProposals,
        (SELECT COUNT(*) FROM reminders WHERE status = 'pending' AND trigger_date <= date('now', '+3 days')) as pendingReminders
    `).get();

    const projectsByStage = db.prepare(`
      SELECT
        ccs.stage_name,
        ccs.stage_code,
        COUNT(*) as count,
        SUM(CASE WHEN cc.due_date < date('now') THEN 1 ELSE 0 END) as overdue_count,
        ROUND(AVG(julianday('now') - julianday(ccs.started_at)), 1) as avg_days_in_stage
      FROM client_compliance_stages ccs
      JOIN client_compliances cc ON ccs.engagement_id = cc.id
      WHERE ccs.status = 'in_progress' AND cc.status != 'completed'
      GROUP BY ccs.stage_name, ccs.stage_code
      ORDER BY count DESC
    `).all();

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
      WHERE cc.status != 'completed'
      ORDER BY cc.due_date ASC
      LIMIT 10
    `).all();

    const teamWorkload = db.prepare(`
      SELECT u.id, u.first_name || ' ' || u.last_name as name,
        (SELECT COUNT(*) FROM client_compliance_stages WHERE assigned_user_id = u.id AND status = 'in_progress') as active,
        (SELECT COUNT(*) FROM client_compliance_stages WHERE assigned_user_id = u.id AND status = 'pending') as pending,
        (SELECT COUNT(*) FROM client_compliance_stages WHERE assigned_user_id = u.id AND status = 'completed') as completed,
        (
          SELECT COALESCE(SUM(i.total_amount), 0) 
          FROM invoices i 
          WHERE i.status = 'paid' AND i.engagement_id IN (
            SELECT DISTINCT engagement_id FROM client_compliance_stages WHERE assigned_user_id = u.id
          )
        ) as revenue_attributed
      FROM users u WHERE u.role IN ('team_member','team_manager','admin','super_admin') AND u.is_active = 1
      ORDER BY revenue_attributed DESC, active DESC
    `).all();

    const upcomingDue = db.prepare(`
      SELECT cc.due_date, c.display_name as client_name, ct.name as template_name
      FROM client_compliances cc
      JOIN clients c ON cc.client_id = c.id
      JOIN compliance_templates ct ON cc.template_id = ct.id
      WHERE cc.status != 'completed'
      ORDER BY cc.due_date ASC LIMIT 8
    `).all();

    const revenuePipeline = db.prepare(`
      SELECT status, COUNT(*) as count, SUM(total_amount) as amount
      FROM invoices GROUP BY status ORDER BY amount DESC
    `).all();

    const recentActivity = db.prepare(`
      SELECT af.*, u.first_name || ' ' || u.last_name as actor_name,
        c.display_name as client_name
      FROM activity_feed af
      JOIN users u ON af.actor_id = u.id
      LEFT JOIN clients c ON af.client_id = c.id
      ORDER BY af.created_at DESC LIMIT 10
    `).all();

    const blockedProjects = db.prepare(`
      SELECT cc.*, c.display_name as client_name, c.client_code,
        ct.code as template_code, ct.name as template_name,
        (SELECT stage_name FROM client_compliance_stages WHERE engagement_id = cc.id AND status = 'blocked' LIMIT 1) as blocked_stage_name
      FROM client_compliances cc
      JOIN clients c ON cc.client_id = c.id
      JOIN compliance_templates ct ON cc.template_id = ct.id
      WHERE cc.status != 'completed' 
        AND (cc.status = 'blocked' OR EXISTS (SELECT 1 FROM client_compliance_stages WHERE engagement_id = cc.id AND status = 'blocked'))
      ORDER BY cc.due_date ASC
    `).all();

    return NextResponse.json({
      stats, projectsByStage, recentProjects, teamWorkload, upcomingDue,
      revenuePipeline, recentActivity, blockedProjects
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
