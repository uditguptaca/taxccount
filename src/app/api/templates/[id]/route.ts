import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { getSessionContext } from "@/lib/auth-context";

export const dynamic = 'force-dynamic';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {

        const session = getSessionContext();
    if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { orgId, userId, role } = session;

    const db = getDb();
    const { id } = await params;

    const template = await db.prepare('SELECT * FROM compliance_templates WHERE id = ?').get(id);
    if (!template) return NextResponse.json({ error: 'Template not found' }, { status: 404 });

    const stages = await db.prepare('SELECT * FROM compliance_template_stages WHERE template_id = ? ORDER BY sequence_order ASC').all(id);
    const documents = await db.prepare('SELECT * FROM compliance_template_documents WHERE template_id = ?').all(id);
    const reminderRules = await db.prepare('SELECT * FROM template_reminder_rules WHERE template_id = ?').all(id);
    const questions = await db.prepare('SELECT * FROM template_questions WHERE template_id = ? ORDER BY sequence_order').all(id);

    return NextResponse.json({ template, stages, documents, reminderRules, questions });
  } catch (error) {
    console.error('Template detail error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = getSessionContext();
    if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { orgId } = session;

    const db = getDb();
    const { id } = await params;
    const body = await request.json();
    const now = new Date().toISOString();

    const VALID_STAGE_GROUPS = ['onboarding', 'work_in_progress', 'invoicing', 'completed'];

    // === UPDATE WORKFLOW STAGES ===
    if (body.action === 'update_stages') {
      const { stages } = body;

      await (db.transaction(async (txDb: any) => {
        await txDb.prepare('DELETE FROM compliance_template_stages WHERE template_id = ? AND org_id = ?').run(id, orgId);
        let sequence = 1;
        for (const stage of stages) {
          const stageGroup = VALID_STAGE_GROUPS.includes(stage.stage_group) ? stage.stage_group : 'work_in_progress';
          await txDb.prepare(`
            INSERT INTO compliance_template_stages (id, org_id, template_id, stage_name, stage_code, stage_group, sequence_order, default_assignee_role, auto_advance, is_client_visible, assigned_team_id, assigned_user_id, is_required, completion_rule, phase)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?, ?)
          `).run(
            stage.id || uuidv4(), orgId, id,
            stage.stage_name, stage.stage_code, stageGroup,
            sequence++,
            stage.default_assignee_role || null,
            stage.auto_advance ? 1 : 0,
            stage.assigned_team_id || null,
            stage.assigned_user_id || null,
            stage.is_required !== false ? 1 : 0,
            stage.completion_rule || null,
            stage.phase || null
          );
        }
        await txDb.prepare(`UPDATE compliance_templates SET version = version + 1, updated_at = ? WHERE id = ? AND org_id = ?`).run(now, id, orgId);
      }))();

      return NextResponse.json({ success: true });
    }

    // === UPDATE TEMPLATE SETTINGS (EXTENDED) ===
    if (body.action === 'update_settings') {
      await db.prepare(`
        UPDATE compliance_templates SET
          assignee_type = ?,
          default_assignee_id = ?,
          is_recurring_default = ?,
          default_recurrence_rule = ?,
          recurrence_interval_value = ?,
          recurrence_interval_unit = ?,
          auto_create_next = ?,
          default_due_rule = ?,
          default_due_offset_days = ?,
          due_date_offset_unit = ?,
          due_date_offset_direction = ?,
          due_date_base_date = ?,
          due_date_fixed_date = ?,
          due_date_notes = ?,
          default_price = ?,
          currency = ?,
          price_type = ?,
          country = ?,
          category = ?,
          category_id = ?,
          description = ?,
          smart_form_id = ?,
          smart_form_ids = ?,
          version = version + 1,
          updated_at = ?
        WHERE id = ? AND org_id = ?
      `).run(
        body.assignee_type || 'unassigned',
        body.default_assignee_id || null,
        body.is_recurring_default ? 1 : 0,
        body.default_recurrence_rule || null,
        body.recurrence_interval_value || null,
        body.recurrence_interval_unit || 'months',
        body.auto_create_next ? 1 : 0,
        body.default_due_rule || 'manual',
        body.default_due_offset_days || null,
        body.due_date_offset_unit || 'days',
        body.due_date_offset_direction || 'after',
        body.due_date_base_date || 'start_date',
        body.due_date_fixed_date || null,
        body.due_date_notes || null,
        body.default_price ?? null,
        body.currency || null,
        body.price_type || null,
        body.country || 'Canada',
        body.category || null,
        body.category_id || null,
        body.description || null,
        body.smart_form_id || null,
        JSON.stringify(body.smart_form_ids || []),
        now, id, orgId
      );

      return NextResponse.json({ success: true });
    }

    // === UPDATE DOCUMENTS CHECKLIST ===
    if (body.action === 'update_documents') {
      const { documents } = body;

      await (db.transaction(async (txDb: any) => {
        await txDb.prepare('DELETE FROM compliance_template_documents WHERE template_id = ? AND org_id = ?').run(id, orgId);
        for (let idx = 0; idx < documents.length; idx++) {
          const doc = documents[idx];
          await txDb.prepare(`
            INSERT INTO compliance_template_documents (
              id, org_id, template_id, document_name, document_code, document_category,
              is_mandatory, description, upload_by, linked_stage_code, sort_order,
              accepted_file_types, client_visible, staff_only, notes, upload_required
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).run(
            doc.id || uuidv4(), orgId, id,
            doc.document_name, doc.document_code || null, doc.document_category || 'client_supporting',
            doc.is_mandatory ? 1 : 0, doc.description || null, doc.upload_by || 'either',
            doc.linked_stage_code || null, doc.sort_order ?? idx + 1,
            doc.accepted_file_types || null, doc.client_visible !== false ? 1 : 0,
            doc.staff_only ? 1 : 0, doc.notes || null, doc.upload_required ? 1 : 0
          );
        }
        await txDb.prepare(`UPDATE compliance_templates SET version = version + 1, updated_at = ? WHERE id = ? AND org_id = ?`).run(now, id, orgId);
      }))();

      return NextResponse.json({ success: true });
    }

    // === UPDATE REMINDER RULES ===
    if (body.action === 'update_reminder_rules') {
      const { rules } = body;

      await (db.transaction(async (txDb: any) => {
        await txDb.prepare('DELETE FROM template_reminder_rules WHERE template_id = ?').run(id);
        for (const rule of rules) {
          await txDb.prepare(`
            INSERT INTO template_reminder_rules (id, template_id, offset_value, offset_unit, channel, recipient_scope, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `).run(uuidv4(), id, rule.offset_value, rule.offset_unit, rule.channel, rule.recipient_scope || 'client', now);
        }
        await txDb.prepare(`UPDATE compliance_templates SET version = version + 1, updated_at = ? WHERE id = ?`).run(now, id);
      }))();

      return NextResponse.json({ success: true });
    }

    // === UPDATE QUESTIONS ===
    if (body.action === 'update_questions') {
      const { questions } = body;

      await (db.transaction(async (txDb: any) => {
        await txDb.prepare('DELETE FROM template_questions WHERE template_id = ?').run(id);
        for (let idx = 0; idx < questions.length; idx++) {
          const q = questions[idx];
          await txDb.prepare(`
            INSERT INTO template_questions (id, template_id, question_text, question_type, is_required, sequence_order, options, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `).run(uuidv4(), id, q.question_text, q.question_type || 'text', q.is_required ? 1 : 0, idx + 1, q.options || null, now);
        }
        await txDb.prepare(`UPDATE compliance_templates SET version = version + 1, updated_at = ? WHERE id = ?`).run(now, id);
      }))();

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Template update error:', error);
    return NextResponse.json({ error: 'Failed to update template' }, { status: 500 });
  }
}
