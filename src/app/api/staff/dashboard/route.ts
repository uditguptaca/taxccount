import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { seedDatabase } from '@/lib/seed';
import { getSessionContext } from "@/lib/auth-context";

export async function GET(req: Request) {
  try {

        const session = getSessionContext();
    if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { orgId, userId, role } = session;

    seedDatabase();
    const db = getDb();
    const url = new URL(req.url);
    const staffUserId = url.searchParams.get('user_id');

    if (!staffUserId) {
      return NextResponse.json({ error: 'user_id is required' }, { status: 400 });
    }

    // Get user info with team
    const user = db.prepare(`
      SELECT u.id, u.email, u.first_name, u.last_name, u.phone, u.role, u.avatar_url, u.last_login_at, u.created_at,
        (SELECT t.name FROM team_memberships tm JOIN teams t ON t.id = tm.team_id WHERE tm.user_id = u.id AND tm.is_active = 1 LIMIT 1) as team_name,
        (SELECT tm.role_in_team FROM team_memberships tm WHERE tm.user_id = u.id AND tm.is_active = 1 LIMIT 1) as role_in_team,
        (SELECT t.id FROM team_memberships tm JOIN teams t ON t.id = tm.team_id WHERE tm.user_id = u.id AND tm.is_active = 1 LIMIT 1) as team_id
      FROM users u WHERE u.id = ?
    `).get(userId) as any;

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get all compliance stages assigned to this user
    const assignedStages = db.prepare(`
      SELECT ccs.id as stage_id, ccs.stage_name, ccs.stage_code, ccs.sequence_order, ccs.status as stage_status,
        ccs.started_at, ccs.completed_at, ccs.notes as stage_notes,
        cc.id as engagement_id, cc.engagement_code, cc.financial_year, cc.due_date, cc.price, cc.status as engagement_status,
        cc.priority, cc.current_stage_id,
        ct.name as template_name, ct.code as template_code,
        c.id as client_id, c.display_name as client_name, c.client_code, c.client_type,
        t.name as team_name
      FROM client_compliance_stages ccs
      JOIN client_compliances cc ON cc.id = ccs.engagement_id
      JOIN compliance_templates ct ON ct.id = cc.template_id
      JOIN clients c ON c.id = cc.client_id
      LEFT JOIN teams t ON t.id = cc.assigned_team_id
      WHERE ccs.assigned_user_id = ?
      ORDER BY 
        CASE ccs.status WHEN 'in_progress' THEN 0 WHEN 'pending' THEN 1 WHEN 'completed' THEN 2 ELSE 3 END,
        cc.due_date ASC
    `).all(userId);

    // Get ad-hoc staff tasks
    const staffTasks = db.prepare(`
      SELECT st.*, 
        c.display_name as client_name, c.client_code,
        cc.engagement_code, ct.name as template_name,
        u.first_name || ' ' || u.last_name as assigned_by_name
      FROM staff_tasks st
      LEFT JOIN clients c ON c.id = st.client_id
      LEFT JOIN client_compliances cc ON cc.id = st.engagement_id
      LEFT JOIN compliance_templates ct ON ct.id = cc.template_id
      LEFT JOIN users u ON u.id = st.assigned_by
      WHERE st.assigned_to = ?
      ORDER BY 
        CASE st.status WHEN 'in_progress' THEN 0 WHEN 'pending' THEN 1 WHEN 'completed' THEN 2 ELSE 3 END,
        st.due_date ASC
    `).all(userId);

    // Time entries for last 30 days
    const timeEntries = db.prepare(`
      SELECT te.*, c.display_name as client_name, c.client_code,
        cc.engagement_code, ct.name as template_name
      FROM time_entries te
      LEFT JOIN clients c ON c.id = te.client_id
      LEFT JOIN client_compliances cc ON cc.id = te.engagement_id
      LEFT JOIN compliance_templates ct ON ct.id = cc.template_id
      WHERE te.user_id = ? AND te.entry_date >= date('now', '-30 days')
      ORDER BY te.entry_date DESC
    `).all(userId);

    // Notifications
    const notifications = db.prepare(`
      SELECT * FROM inbox_items WHERE user_id = ? AND is_archived = 0
      ORDER BY created_at DESC LIMIT 20
    `).all(userId);

    // System reminders for this user
    const systemReminders = db.prepare(`
      SELECT r.*, c.display_name as client_name, cc.engagement_code
      FROM reminders r
      LEFT JOIN clients c ON c.id = r.client_id
      LEFT JOIN client_compliances cc ON cc.id = r.engagement_id
      WHERE r.user_id = ? AND r.status = 'pending'
      ORDER BY r.trigger_date ASC
    `).all(userId);

    // Personal staff reminders
    const staffReminders = db.prepare(`
      SELECT * FROM staff_reminders WHERE user_id = ? AND status = 'pending'
      ORDER BY trigger_date ASC
    `).all(userId);

    // KPI calculations
    const now = new Date();
    const stages = assignedStages as any[];
    const tasks = staffTasks as any[];
    
    const activeStages = stages.filter(s => s.stage_status === 'in_progress').length;
    const pendingStages = stages.filter(s => s.stage_status === 'pending').length;
    const completedStages = stages.filter(s => s.stage_status === 'completed').length;
    const overdueStages = stages.filter(s => {
      if (s.stage_status === 'completed') return false;
      return s.due_date && new Date(s.due_date) < now;
    }).length;

    const activeAdHoc = tasks.filter(t => t.status === 'in_progress').length;
    const pendingAdHoc = tasks.filter(t => t.status === 'pending').length;
    const completedAdHoc = tasks.filter(t => t.status === 'completed').length;
    const overdueAdHoc = tasks.filter(t => {
      if (t.status === 'completed' || t.status === 'cancelled') return false;
      return t.due_date && new Date(t.due_date) < now;
    }).length;

    const totalMinutes = (timeEntries as any[]).reduce((sum, te: any) => sum + (te.duration_minutes || 0), 0);
    const totalHours = Math.round(totalMinutes / 60 * 10) / 10;

    // Revenue attribution
    const revenueData = db.prepare(`
      SELECT COALESCE(SUM(DISTINCT cc.price), 0) as total_value,
        COUNT(DISTINCT cc.id) as projects_involved
      FROM client_compliance_stages ccs
      JOIN client_compliances cc ON cc.id = ccs.engagement_id
      WHERE ccs.assigned_user_id = ? AND cc.status != 'new'
    `).get(userId) as any;

    // Unique clients served
    const clientsServed = db.prepare(`
      SELECT COUNT(DISTINCT c.id) as count
      FROM client_compliance_stages ccs
      JOIN client_compliances cc ON cc.id = ccs.engagement_id
      JOIN clients c ON c.id = cc.client_id
      WHERE ccs.assigned_user_id = ?
    `).get(userId) as any;

    const totalAssigned = activeStages + pendingStages + completedStages;
    const completionRate = totalAssigned > 0 ? Math.round((completedStages / totalAssigned) * 100) : 0;

    // Teammates
    const teammates = db.prepare(`
      SELECT u.id, u.first_name || ' ' || u.last_name as name, u.email, u.role,
        (SELECT t.name FROM team_memberships tm JOIN teams t ON t.id = tm.team_id WHERE tm.user_id = u.id AND tm.is_active = 1 LIMIT 1) as team_name,
        (SELECT tm.role_in_team FROM team_memberships tm WHERE tm.user_id = u.id AND tm.is_active = 1 LIMIT 1) as role_in_team
      FROM users u
      WHERE u.role IN ('super_admin','admin','team_manager','team_member')
        AND u.id != ? AND u.is_active = 1
      ORDER BY u.first_name
    `).all(userId);

    return NextResponse.json({
      user,
      kpis: {
        activeStages,
        pendingStages,
        completedStages,
        overdueStages,
        activeAdHoc,
        pendingAdHoc,
        completedAdHoc,
        overdueAdHoc,
        totalActive: activeStages + activeAdHoc,
        totalPending: pendingStages + pendingAdHoc,
        totalCompleted: completedStages + completedAdHoc,
        totalOverdue: overdueStages + overdueAdHoc,
        totalHours,
        totalMinutes,
        completionRate,
        clientsServed: clientsServed?.count || 0,
        projectsInvolved: revenueData?.projects_involved || 0,
        totalRevenue: revenueData?.total_value || 0,
      },
      assignedStages,
      staffTasks,
      timeEntries,
      notifications,
      systemReminders,
      staffReminders,
      teammates,
    });
  } catch (error: any) {
    console.error('Staff dashboard error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
