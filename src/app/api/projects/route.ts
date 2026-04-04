import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { seedDatabase } from '@/lib/seed';
import { parseDynamicVariables } from '@/lib/dynamic-vars';

export async function GET(request: Request) {
  try {
    seedDatabase();
    const db = getDb();
    
    // Read auth cookies (Set by auth/login route)
    const cookies = request.headers.get('cookie') || '';
    const isTeamMember = cookies.includes('auth_role=team_member');
    const userIdMatch = cookies.match(/auth_user_id=([^;]+)/);
    const userId = userIdMatch ? userIdMatch[1] : null;

    let rlsWhere = '';
    const rlsParams: any[] = [];

    // Enforce Row-Level Security for Team Members
    if (isTeamMember && userId) {
      rlsWhere = `
        WHERE cc.assigned_team_id IN (SELECT team_id FROM team_memberships WHERE user_id = ?)
        OR EXISTS (SELECT 1 FROM client_compliance_stages ccs WHERE ccs.engagement_id = cc.id AND ccs.assigned_user_id = ?)
      `;
      rlsParams.push(userId, userId);
    }

    const projects = db.prepare(`
      SELECT cc.*, c.display_name as client_name, c.client_code, ct.name as template_name, ct.code as template_code,
        t.name as team_name,
        (SELECT ccs.stage_name FROM client_compliance_stages ccs WHERE ccs.engagement_id = cc.id AND ccs.status = 'in_progress' LIMIT 1) as current_stage,
        (SELECT u.first_name || ' ' || u.last_name FROM client_compliance_stages ccs JOIN users u ON u.id = ccs.assigned_user_id WHERE ccs.engagement_id = cc.id AND ccs.status = 'in_progress' LIMIT 1) as assigned_to,
        (SELECT COUNT(*) FROM client_compliance_stages ccs WHERE ccs.engagement_id = cc.id AND ccs.status = 'completed') as stages_completed,
        (SELECT COUNT(*) FROM client_compliance_stages ccs WHERE ccs.engagement_id = cc.id) as stages_total,
        (SELECT COUNT(*) FROM client_compliance_stages ccs WHERE ccs.engagement_id = cc.id AND ccs.status = 'blocked') as is_blocked,
        (SELECT json_group_array(json_object(
          'id', ccs.id, 
          'stage_name', ccs.stage_name, 
          'status', ccs.status, 
          'sequence_order', ccs.sequence_order,
          'started_at', ccs.started_at,
          'completed_at', ccs.completed_at
        )) FROM client_compliance_stages ccs WHERE ccs.engagement_id = cc.id) as stages_json
      FROM client_compliances cc
      JOIN clients c ON c.id = cc.client_id
      JOIN compliance_templates ct ON ct.id = cc.template_id
      LEFT JOIN teams t ON t.id = cc.assigned_team_id
      ${rlsWhere}
      ORDER BY cc.due_date ASC
    `).all(...rlsParams).map((p: any) => ({
      ...p,
      status: p.is_blocked > 0 ? 'blocked' : p.status,
      stages: p.stages_json ? JSON.parse(p.stages_json) : []
    }));

    const templates = db.prepare(`SELECT id, name, code, is_active FROM compliance_templates WHERE is_active = 1`).all();
    const clients = db.prepare(`SELECT id, display_name, client_code FROM clients WHERE status = 'active'`).all();
    const teams = db.prepare(`SELECT id, name FROM teams`).all();

    return NextResponse.json({ projects, templates, clients, teams });
  } catch (error) {
    console.error('Projects error:', error);
    return NextResponse.json({ error: 'Failed to load projects' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const db = getDb();
    const body = await request.json();
    const { client_id, template_id, financial_year, due_date, assigned_team_id, priority, notes } = body;

    if (!client_id || !template_id || !financial_year) {
      return NextResponse.json({ error: 'Client, Template, and Year are required' }, { status: 400 });
    }

    const { v4: uuidv4 } = require('uuid');
    const engagementId = uuidv4();

    // Get template details
    const template = db.prepare(`SELECT * FROM compliance_templates WHERE id = ?`).get(template_id) as any;
    if (!template) return NextResponse.json({ error: 'Template not found' }, { status: 404 });

    // Generate engagement code
    // Generate engagement code
    const client = db.prepare(`SELECT display_name, client_code FROM clients WHERE id = ?`).get(client_id) as any;
    
    // Support parsing shortcodes like "[LAST_YEAR]" in template codes
    const baseCode = `${client.client_code}-${template.code}-${financial_year}`;
    const engagementCode = parseDynamicVariables(baseCode, { client_name: client.display_name, financial_year });

    // Create the project/engagement
    db.prepare(`
      INSERT INTO client_compliances (
        id, client_id, template_id, engagement_code, financial_year, 
        status, due_date, price, priority, assigned_team_id, notes, 
        created_by, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, 'in_progress', ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `).run(
      engagementId, client_id, template_id, engagementCode, financial_year,
      due_date || null, template.base_price || 0, priority || 'medium', assigned_team_id || null, notes || null,
      'system'
    );


    // Copy template stages to client_compliance_stages
    const templateStages = db.prepare(`SELECT * FROM compliance_template_stages WHERE template_id = ? ORDER BY sequence_order ASC`).all(template_id) as any[];
    
    // Default assignments to the logged in user or system
    const systemUserId = 'system'; // we could extract from headers in real app
    
    const insertStage = db.prepare(`
      INSERT INTO client_compliance_stages (
        id, engagement_id, template_stage_id, stage_name, stage_code, sequence_order, 
        status, assigned_user_id, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `);

    db.transaction(() => {
      for (let i = 0; i < templateStages.length; i++) {
        const ts = templateStages[i];
        const status = i === 0 ? 'in_progress' : 'pending';
        
        let stageAssigneeId = systemUserId;

        // Auto-Assignment Logic
        if (ts.default_assignee_role && assigned_team_id) {
          const targetMember = db.prepare(`
            SELECT u.id 
            FROM users u
            JOIN team_memberships tm ON tm.user_id = u.id
            WHERE tm.team_id = ? AND u.role = ? AND u.is_active = 1
            LIMIT 1
          `).get(assigned_team_id, ts.default_assignee_role) as { id: string } | undefined;
          
          if (targetMember) {
            stageAssigneeId = targetMember.id;
          }
        }

        insertStage.run(uuidv4(), engagementId, ts.id, ts.stage_name, ts.stage_code, ts.sequence_order, status, stageAssigneeId);
      }
    })();

    return NextResponse.json({ success: true, project_id: engagementId, engagement_code: engagementCode });
  } catch (error: any) {
    console.error('Create project error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const db = getDb();
    const body = await request.json();
    const { project_id, new_stage, template_filter } = body;

    // Based on user dropping in a specific column, update the relevant fields
    if (template_filter === 'all') {
      // High-level movement updates status
      let newStatus = 'in_progress';
      if (new_stage === 'completed') newStatus = 'completed';
      if (new_stage === 'onboarding') newStatus = 'new';
      
      db.prepare(`UPDATE client_compliances SET status = ?, updated_at = datetime('now') WHERE id = ?`).run(newStatus, project_id);
    } else {
      // Moving stage in a specific template
      const stages = db.prepare(`SELECT id, stage_code, sequence_order FROM client_compliance_stages WHERE engagement_id = ? ORDER BY sequence_order ASC`).all(project_id) as any[];
      const targetStage = stages.find(s => s.stage_code === new_stage);
      
      if (targetStage) {
        db.transaction(() => {
          // Set everything before to completed, target to in_progress, everything after to pending
          for (const s of stages) {
            if (s.sequence_order < targetStage.sequence_order) {
              db.prepare(`UPDATE client_compliance_stages SET status = 'completed', updated_at = datetime('now') WHERE id = ? AND status != 'completed'`).run(s.id);
            } else if (s.sequence_order === targetStage.sequence_order) {
              db.prepare(`UPDATE client_compliance_stages SET status = 'in_progress', started_at = coalesce(started_at, datetime('now')), updated_at = datetime('now') WHERE id = ?`).run(s.id);
            } else {
              db.prepare(`UPDATE client_compliance_stages SET status = 'pending', updated_at = datetime('now') WHERE id = ?`).run(s.id);
            }
          }
        })();
        
        // Ensure Project status is in_progress
        db.prepare(`UPDATE client_compliances SET status = 'in_progress', updated_at = datetime('now') WHERE id = ?`).run(project_id);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Update project status error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

