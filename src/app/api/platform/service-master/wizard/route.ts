import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: Request) {
  const db = getDb();
  
  try {
    const data = await req.json();
    const {
      head_id, name, short_name, description, brief, has_compliance_date,
      dependency_type, dependency_label, period_type, period_value, grace_value,
      grace_unit, is_compulsory, undertaking_required, undertaking_text, quick_create_enabled,
      rules, questions, infoForms, penalties
    } = data;

    if (!head_id || !name) {
      return NextResponse.json({ error: 'Compliance head and name are required' }, { status: 400 });
    }

    db.exec('BEGIN TRANSACTION');

    const scId = uuidv4();
    const now = new Date().toISOString();

    // 1. Insert Sub-Compliance
    db.prepare(`
      INSERT INTO sm_sub_compliances (
        id, compliance_head_id, name, short_name, description, brief, has_compliance_date,
        dependency_type, dependency_label, period_type, period_value, grace_value, grace_unit,
        is_compulsory, undertaking_required, undertaking_text, quick_create_enabled, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      scId, head_id, name, short_name || null, description || null, brief || null,
      has_compliance_date ? 1 : 0, dependency_type || 'none', dependency_label || null,
      period_type || null, period_value || 1, grace_value || null, grace_unit || null,
      is_compulsory ? 1 : 0, undertaking_required ? 1 : 0, undertaking_text || null,
      quick_create_enabled ? 1 : 0, now, now
    );

    // 2. Insert Service Rules
    if (rules && rules.length > 0) {
      const insertRule = db.prepare(`
        INSERT INTO sm_service_rules (id, sub_compliance_id, country_id, state_id, entity_type_id, department_id, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      for (const r of rules) {
        insertRule.run(
          uuidv4(), scId, r.country_id || null, r.state_id || null, r.entity_type_id || null, r.department_id || null, now
        );
      }
    }

    // 3. Insert Questions
    // Map temporary 'frontend' IDs to real UUIDs to preserve parent/child relationships
    if (questions && questions.length > 0) {
      const idMap = new Map<string, string>();
      questions.forEach((q: any) => idMap.set(q._tempId, uuidv4()));

      const insertQuestion = db.prepare(`
        INSERT INTO sm_questions (
          id, sub_compliance_id, question_text, question_type, description,
          is_compulsory_trigger, trigger_value, threshold_context, parent_question_id, options, sort_order, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      for (const q of questions) {
        const realId = idMap.get(q._tempId)!;
        const parentId = q.parent_id ? idMap.get(q.parent_id) : null;
        
        insertQuestion.run(
          realId, scId, q.question_text, q.question_type || 'yes_no', q.description || null,
          q.is_compulsory_trigger ? 1 : 0, q.trigger_value || null, q.threshold_context || null,
          parentId, q.options ? JSON.stringify(q.options) : null, q.sort_order || 0, now
        );
      }
    }

    // 4. Insert Info Fields
    if (infoForms && infoForms.length > 0) {
      const insertInfo = db.prepare(`
        INSERT INTO sm_info_fields (
          id, sub_compliance_id, field_label, field_type, is_required, placeholder, help_text, sort_order, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const f of infoForms) {
        insertInfo.run(
          uuidv4(), scId, f.field_label, f.field_type, f.is_required ? 1 : 0,
          f.placeholder || null, f.help_text || null, f.sort_order || 0, now
        );
      }
    }

    // 5. Insert Penalties
    if (penalties && penalties.length > 0) {
      const insertPenalty = db.prepare(`
        INSERT INTO sm_penalties (
          id, sub_compliance_id, description, penalty_type, amount, rate, max_amount, details, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const p of penalties) {
        insertPenalty.run(
          uuidv4(), scId, p.description, p.penalty_type, p.amount || null, p.rate || null, p.max_amount || null, p.details || null, now
        );
      }
    }

    db.exec('COMMIT');

    return NextResponse.json({ success: true, id: scId });
  } catch (error: any) {
    db.exec('ROLLBACK');
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
