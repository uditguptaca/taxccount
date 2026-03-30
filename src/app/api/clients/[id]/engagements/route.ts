import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { seedDatabase } from '@/lib/seed';
import { v4 as uuidv4 } from 'uuid';

/**
 * POST /api/clients/[id]/engagements
 * The core "Add Compliance" wizard endpoint.
 * Creates engagement, copies template snapshot, generates reminders and recurrence schedule.
 */
export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    seedDatabase();
    const db = getDb();
    const clientId = params.id;
    const body = await request.json();

    const {
      template_id,
      financial_year,
      period_label,
      due_date,
      price,
      assignee_type = 'unassigned',
      assignee_id = null,
      is_recurring = false,
      recurrence_rule,
      recurrence_start,
      recurrence_until,
      recurrence_count,
      reminder_rules = [],
      question_answers = [],
      priority = 'medium',
    } = body;

    if (!template_id || !due_date) {
      return NextResponse.json({ error: 'Template and due date are required' }, { status: 400 });
    }

    // Get the template + version
    const template = db.prepare(`SELECT * FROM compliance_templates WHERE id = ?`).get(template_id) as any;
    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    // Get admin user for created_by
    const admin = db.prepare(`SELECT id FROM users WHERE role IN ('super_admin','admin') LIMIT 1`).get() as any;
    const createdBy = admin?.id || 'system';
    const now = new Date().toISOString();

    // Generate engagement code
    const lastEng = db.prepare(`SELECT COUNT(*) as count FROM client_compliances`).get() as any;
    const engCode = `ENG-${financial_year || new Date().getFullYear()}-${String((lastEng?.count || 0) + 1).padStart(4, '0')}`;

    const engagementId = uuidv4();

    // Resolve assignment: if team, get the assigned_team_id
    const assignedTeamId = assignee_type === 'team' ? assignee_id : null;

    // === CREATE ENGAGEMENT ===
    db.prepare(`
      INSERT INTO client_compliances (
        id, engagement_code, client_id, template_id, financial_year, period_label,
        due_date, price, status, client_facing_status, priority,
        assigned_team_id, assignee_type, assignee_id,
        template_version_at_creation,
        created_by, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'new', 'future', ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      engagementId, engCode, clientId, template_id,
      financial_year || String(new Date().getFullYear()),
      period_label || `FY ${financial_year || new Date().getFullYear()}`,
      due_date, price ?? template.default_price, priority,
      assignedTeamId, assignee_type, assignee_id,
      template.version,
      createdBy, now, now
    );

    // === COPY TEMPLATE STAGES ===
    const templateStages = db.prepare(`
      SELECT * FROM compliance_template_stages WHERE template_id = ? ORDER BY sequence_order ASC
    `).all(template_id) as any[];

    // Find the assignee user for stage assignment
    let stageAssigneeId: string | null = null;
    if (assignee_type === 'member') {
      stageAssigneeId = assignee_id;
    } else if (assignee_type === 'team' && assignee_id) {
      // Get first member of the team
      const firstMember = db.prepare(`
        SELECT user_id FROM team_memberships WHERE team_id = ? AND is_active = 1 ORDER BY role_in_team LIMIT 1
      `).get(assignee_id) as any;
      stageAssigneeId = firstMember?.user_id || null;
    }

    const insertStage = db.prepare(`
      INSERT INTO client_compliance_stages (
        id, engagement_id, template_stage_id, stage_name, stage_code, sequence_order,
        status, assigned_user_id, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?)
    `);

    for (const stage of templateStages) {
      insertStage.run(
        uuidv4(), engagementId, stage.id,
        stage.stage_name, stage.stage_code, stage.sequence_order,
        stageAssigneeId, now, now
      );
    }

    // === COPY TEMPLATE DOCUMENT REQUIREMENTS ===
    const templateDocs = db.prepare(`
      SELECT * FROM compliance_template_documents WHERE template_id = ?
    `).all(template_id) as any[];

    const insertDocReq = db.prepare(`
      INSERT INTO engagement_doc_requirements (
        id, engagement_id, document_name, document_category, is_mandatory, upload_by, linked_stage_code, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const doc of templateDocs) {
      insertDocReq.run(
        uuidv4(), engagementId, doc.document_name, doc.document_category,
        doc.is_mandatory, doc.upload_by, doc.linked_stage_code, now
      );
    }

    // === COPY/CREATE REMINDER RULES ===
    const insertReminderRule = db.prepare(`
      INSERT INTO engagement_reminder_rules (id, engagement_id, offset_value, offset_unit, channel, recipient_scope, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    // Use provided rules, or fall back to template defaults
    let effectiveRules = reminder_rules;
    if (effectiveRules.length === 0) {
      effectiveRules = db.prepare(`
        SELECT offset_value, offset_unit, channel, recipient_scope FROM template_reminder_rules WHERE template_id = ?
      `).all(template_id) as any[];
    }

    for (const rule of effectiveRules) {
      insertReminderRule.run(
        uuidv4(), engagementId,
        rule.offset_value, rule.offset_unit, rule.channel, rule.recipient_scope || 'client', now
      );
    }

    // === GENERATE ACTUAL REMINDER INSTANCES ===
    const insertReminder = db.prepare(`
      INSERT INTO reminders (id, reminder_type, engagement_id, client_id, user_id, title, message, trigger_date, channel, status, created_by, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)
    `);

    const client = db.prepare(`SELECT display_name FROM clients WHERE id = ?`).get(clientId) as any;

    for (const rule of effectiveRules) {
      const offsetMs = rule.offset_unit === 'weeks'
        ? rule.offset_value * 7 * 86400000
        : rule.offset_value * 86400000;
      const triggerDate = new Date(new Date(due_date).getTime() - offsetMs);
      const triggerStr = triggerDate.toISOString().split('T')[0];

      // Only create reminders for future dates
      if (triggerDate > new Date()) {
        insertReminder.run(
          uuidv4(), 'deadline', engagementId, clientId,
          stageAssigneeId || createdBy,
          `${template.name} due in ${rule.offset_value} ${rule.offset_unit} — ${client?.display_name || ''}`,
          `Upcoming deadline for ${template.name} (${engCode})`,
          triggerStr, rule.channel, createdBy, now
        );
      }
    }

    // === SAVE QUESTION ANSWERS ===
    if (question_answers.length > 0) {
      const insertAnswer = db.prepare(`
        INSERT INTO engagement_questions (id, engagement_id, question_text, question_type, is_required, sequence_order, options, answer_text, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      for (const qa of question_answers) {
        insertAnswer.run(
          uuidv4(), engagementId,
          qa.question_text, qa.question_type || 'text',
          qa.is_required ? 1 : 0, qa.sequence_order || 0,
          qa.options || null, qa.answer_text || null, now
        );
      }
    }

    // === CREATE RECURRENCE SCHEDULE ===
    let scheduleId = null;
    if (is_recurring && recurrence_rule) {
      scheduleId = uuidv4();
      const startDate = recurrence_start || due_date;

      db.prepare(`
        INSERT INTO engagement_recurrence_schedules (
          id, source_engagement_id, client_id, template_id,
          rrule, dtstart, until_date, occurrence_count,
          next_occurrence_date, assignee_type, assignee_id, price,
          is_active, created_by, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?)
      `).run(
        scheduleId, engagementId, clientId, template_id,
        recurrence_rule, startDate, recurrence_until || null, recurrence_count || null,
        startDate, assignee_type, assignee_id, price ?? template.default_price,
        createdBy, now, now
      );

      // Update engagement with schedule reference
      db.prepare(`UPDATE client_compliances SET recurrence_schedule_id = ? WHERE id = ?`)
        .run(scheduleId, engagementId);
    }

    // === LOG ACTIVITY ===
    db.prepare(`
      INSERT INTO activity_feed (id, actor_id, action, entity_type, entity_id, entity_name, client_id, details, created_at)
      VALUES (?, ?, 'created_engagement', 'engagement', ?, ?, ?, ?, ?)
    `).run(
      uuidv4(), createdBy, engagementId, engCode, clientId,
      `Created ${template.name} engagement for ${client?.display_name || 'client'}${is_recurring ? ' (recurring)' : ''}`,
      now
    );

    return NextResponse.json({
      success: true,
      engagement_id: engagementId,
      engagement_code: engCode,
      stages_created: templateStages.length,
      doc_requirements_created: templateDocs.length,
      reminder_instances_created: effectiveRules.length,
      recurrence_schedule_id: scheduleId,
    });
  } catch (error: any) {
    console.error('Add compliance error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * GET /api/clients/[id]/engagements
 * List all engagements for a client.
 */
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    seedDatabase();
    const db = getDb();

    const engagements = db.prepare(`
      SELECT cc.*, ct.name as template_name, ct.code as template_code,
        (SELECT stage_name FROM client_compliance_stages WHERE engagement_id = cc.id AND status = 'in_progress' LIMIT 1) as current_stage,
        (SELECT u.first_name || ' ' || u.last_name FROM users u WHERE u.id = cc.assignee_id) as assigned_to_name,
        (SELECT t.name FROM teams t WHERE t.id = cc.assigned_team_id) as assigned_team_name
      FROM client_compliances cc
      JOIN compliance_templates ct ON cc.template_id = ct.id
      WHERE cc.client_id = ?
      ORDER BY cc.due_date ASC
    `).all(params.id);

    return NextResponse.json({ engagements });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
