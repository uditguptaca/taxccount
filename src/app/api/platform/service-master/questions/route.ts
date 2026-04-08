import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const subCompId = searchParams.get('subCompId');
    const db = getDb();
    
    let sql = `
      SELECT q.*, 
        sc.name as sub_compliance_name,
        c.name as country_name,
        s.name as state_name,
        e.name as entity_type_name,
        d.name as department_name,
        ch.name as compliance_head_name
      FROM sm_questions q
      LEFT JOIN sm_sub_compliances sc ON q.sub_compliance_id = sc.id
      LEFT JOIN sm_countries c ON q.country_id = c.id
      LEFT JOIN sm_states s ON q.state_id = s.id
      LEFT JOIN sm_entity_types e ON q.entity_type_id = e.id
      LEFT JOIN sm_departments d ON q.department_id = d.id
      LEFT JOIN sm_compliance_heads ch ON q.compliance_head_id = ch.id
    `;
    
    // We can filter by subCompId or order by everything if not present
    if (subCompId) {
      sql += ` WHERE q.sub_compliance_id = ? ORDER BY q.sort_order`;
      const rows = db.prepare(sql).all(subCompId);
      return NextResponse.json(rows);
    } else {
      sql += ` ORDER BY q.sort_order`;
      const rows = db.prepare(sql).all();
      return NextResponse.json(rows);
    }
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const id = uuidv4();
    getDb().prepare(`
      INSERT INTO sm_questions (
        id, sub_compliance_id, country_id, state_id, entity_type_id, department_id, compliance_head_id,
        question_text, question_type, description, is_compulsory_trigger, trigger_value, 
        triggers_sub_compliance_id, threshold_context, parent_question_id, options, sort_order, is_active, created_at
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    `).run(
      id, body.sub_compliance_id || null, body.country_id || null, body.state_id || null, body.entity_type_id || null, body.department_id || null, body.compliance_head_id || null,
      body.question_text, body.question_type || 'yes_no', body.description || null,
      body.is_compulsory_trigger ? 1 : 0, body.trigger_value || null, body.triggers_sub_compliance_id || null,
      body.threshold_context || null, body.parent_question_id || null, body.options || null, body.sort_order || 0,
      body.is_active !== false ? 1 : 0, new Date().toISOString()
    );
    return NextResponse.json({ id, ...body });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
