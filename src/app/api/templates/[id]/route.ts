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
            INSERT INTO compliance_template_stages (id, org_id, template_id, stage_name, stage_code, stage_group, sequence_order, default_assignee_role, auto_advance, is_client_visible)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
          `).run(
            stage.id || uuidv4(), orgId, id,
            stage.stage_name, stage.stage_code, stageGroup,
            sequence++,
            stage.default_assignee_role || null,
            stage.auto_advance ? 1 : 0
          );
        }
        await txDb.prepare(`UPDATE compliance_templates SET version = version + 1, updated_at = ? WHERE id = ? AND org_id = ?`).run(now, id, orgId);
      }))();

      return NextResponse.json({ success: true });
    }

    // === UPDATE TEMPLATE SETTINGS ===
    if (body.action === 'update_settings') {
      await db.prepare(`
        UPDATE compliance_templates SET
          assignee_type = ?,
          default_assignee_id = ?,
          is_recurring_default = ?,
          default_recurrence_rule = ?,
          default_due_rule = ?,
          default_due_offset_days = ?,
          default_price = ?,
          description = ?,
          version = version + 1,
          updated_at = ?
        WHERE id = ? AND org_id = ?
      `).run(
        body.assignee_type || 'unassigned',
        body.default_assignee_id || null,
        body.is_recurring_default ? 1 : 0,
        body.default_recurrence_rule || null,
        body.default_due_rule || 'manual',
        body.default_due_offset_days || null,
        body.default_price ?? null,
        body.description ?? null,
        now, id, orgId
      );

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
