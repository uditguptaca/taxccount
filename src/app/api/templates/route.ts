import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { seedDatabase } from '@/lib/seed';
import { getSessionContext } from "@/lib/auth-context";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = getSessionContext();
    if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { orgId, userId, role } = session;

seedDatabase();
    const db = getDb();
    const templates = await db.prepare(`SELECT * FROM compliance_templates ORDER BY name ASC`).all() as any[];

    const stagesStmt = await db.prepare(`SELECT * FROM compliance_template_stages WHERE template_id = ? ORDER BY sequence_order ASC`);
    const docsStmt = await db.prepare(`SELECT * FROM compliance_template_documents WHERE template_id = ?`);
    const reminderRulesStmt = await db.prepare(`SELECT * FROM template_reminder_rules WHERE template_id = ?`);
    const questionsStmt = await db.prepare(`SELECT * FROM template_questions WHERE template_id = ? ORDER BY sequence_order`);
    const usageStmt = await db.prepare(`SELECT COUNT(*) as count FROM client_compliances WHERE template_id = ?`);

    const configuredTemplates = await Promise.all(templates.map(async (tpl: any) => {
      const stages = await stagesStmt.all(tpl.id);
      const docs = await docsStmt.all(tpl.id);
      const reminderRules = await reminderRulesStmt.all(tpl.id);
      const questions = await questionsStmt.all(tpl.id);
      const usage = await usageStmt.get(tpl.id) as any;

      return {
        ...tpl,
        stages,
        stage_count: stages.length,
        doc_count: docs.length,
        reminder_rules: reminderRules,
        questions,
        usage_count: usage?.count || 0,
      };
    }));

    // Also return categories
    const categories = await db.prepare(`SELECT * FROM template_categories ORDER BY sort_order`).all();

    return NextResponse.json({ templates: configuredTemplates, categories });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = getSessionContext();
    if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { orgId, userId, role } = session;

const db = getDb();
    const body = await req.json();
    const { name, code, description, category, default_price, stages } = body;

    if (!name || !code) {
      return NextResponse.json({ error: 'Name and Code are required' }, { status: 400 });
    }

    const templateId = uuidv4();
    const now = new Date().toISOString();

    const adminId = userId; // Use the session user's ID to prevent invalid UUID error

    await db.prepare(`
      INSERT INTO compliance_templates (id, org_id, name, code, description, category, default_price, assignee_type, created_by, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'unassigned', ?, ?, ?)
    `).run(templateId, orgId, name, code, description || '', category || '', default_price || 0, adminId, now, now);

    if (stages && Array.isArray(stages)) {
      const insertStage = await db.prepare(`
        INSERT INTO compliance_template_stages (id, org_id, template_id, stage_name, stage_code, stage_group, sequence_order, is_client_visible, auto_advance)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      await db.transaction(async () => {
        for (let idx = 0; idx < stages.length; idx++) {
          const stage = stages[idx];
          await insertStage.run(
            uuidv4(), orgId, templateId,
            stage.stage_name, stage.stage_code,
            stage.stage_group || 'work_in_progress',
            idx + 1,
            stage.is_client_visible !== false ? 1 : 0,
            stage.auto_advance ? 1 : 0
          );
        }
      })();
    }

    const newTpl = await db.prepare(`SELECT * FROM compliance_templates WHERE id = ?`).get(templateId);
    const newStages = await db.prepare(`SELECT * FROM compliance_template_stages WHERE template_id = ? ORDER BY sequence_order ASC`).all(templateId);

    return NextResponse.json({ ...(newTpl as any), stages: newStages });
  } catch (error: any) {
    if (error.message && error.message.includes('UNIQUE constraint failed')) {
      return NextResponse.json({ error: 'A template with this code already exists.' }, { status: 400 });
    }
    console.error('[Template Error]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = getSessionContext();
    if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { orgId, userId, role } = session;

    const db = getDb();
    const body = await req.json();
    const { id, name, code, description, default_price, category } = body;
    
    const actualPrice = default_price !== undefined ? default_price : (body.price || 0);

    if (!id || !name || !code) return NextResponse.json({ error: 'ID, Name, and Code are required' }, { status: 400 });

    const now = new Date().toISOString();
    await db.prepare(`
      UPDATE compliance_templates
      SET name = ?, code = ?, description = ?, category = ?, default_price = ?, updated_at = ?
      WHERE id = ?
    `).run(name, code, description || '', category || 'General', actualPrice, now, id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message.includes('UNIQUE constraint failed')) {
      return NextResponse.json({ error: 'A template with this code already exists.' }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = getSessionContext();
    if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { orgId, userId, role } = session;

const db = getDb();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    db.transaction(async () => {
      await db.prepare(`DELETE FROM compliance_template_stages WHERE template_id = ?`).run(id);
      await db.prepare(`DELETE FROM compliance_template_documents WHERE template_id = ?`).run(id);
      await db.prepare(`DELETE FROM template_reminder_rules WHERE template_id = ?`).run(id);
      await db.prepare(`DELETE FROM template_questions WHERE template_id = ?`).run(id);
      await db.prepare(`DELETE FROM compliance_templates WHERE id = ?`).run(id);
    })();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message.includes('FOREIGN KEY constraint failed')) {
      return NextResponse.json({ error: 'Cannot delete template because it is in use by active clients or projects.' }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
