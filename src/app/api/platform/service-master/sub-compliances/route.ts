import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function GET(req: Request) {
  try {
    const db = getDb();
    const { searchParams } = new URL(req.url);
    const headId = searchParams.get('headId');
    const sql = headId
      ? `SELECT sc.*, ch.name as compliance_head_name FROM sm_sub_compliances sc JOIN sm_compliance_heads ch ON sc.compliance_head_id = ch.id WHERE sc.compliance_head_id = ? ORDER BY sc.sort_order`
      : `SELECT sc.*, ch.name as compliance_head_name FROM sm_sub_compliances sc JOIN sm_compliance_heads ch ON sc.compliance_head_id = ch.id ORDER BY ch.sort_order, sc.sort_order`;
    const rows = headId ? db.prepare(sql).all(headId) : db.prepare(sql).all();
    return NextResponse.json(rows);
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const id = uuidv4();
    const now = new Date().toISOString();
    getDb().prepare(`INSERT INTO sm_sub_compliances (id,compliance_head_id,name,short_name,description,brief,has_compliance_date,dependency_type,dependency_label,period_type,period_value,grace_value,grace_unit,is_compulsory,undertaking_required,undertaking_text,quick_create_enabled,is_active,sort_order,created_by,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(
      id, body.compliance_head_id, body.name, body.short_name||null, body.description||null, body.brief||null,
      body.has_compliance_date!==false?1:0, body.dependency_type||null, body.dependency_label||null,
      body.period_type||null, body.period_value||1, body.grace_value||0, body.grace_unit||null,
      body.is_compulsory?1:0, body.undertaking_required?1:0, body.undertaking_text||null,
      body.quick_create_enabled?1:0, body.is_active!==false?1:0, body.sort_order||0, body.created_by||null, now, now
    );
    return NextResponse.json({ id, ...body });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
