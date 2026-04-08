import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const db = getDb();
    const sc = db.prepare(`SELECT sc.*, ch.name as compliance_head_name FROM sm_sub_compliances sc JOIN sm_compliance_heads ch ON sc.compliance_head_id = ch.id WHERE sc.id = ?`).get(id);
    if (!sc) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const questions = db.prepare('SELECT * FROM sm_questions WHERE sub_compliance_id = ? AND is_active = 1 ORDER BY sort_order').all(id);
    const infoFields = db.prepare('SELECT * FROM sm_info_fields WHERE sub_compliance_id = ? AND is_active = 1 ORDER BY sort_order').all(id);
    const penalties = db.prepare('SELECT * FROM sm_penalties WHERE sub_compliance_id = ? AND is_active = 1').all(id);
    const rules = db.prepare(`SELECT sr.*, c.name as country_name, s.name as state_name, et.name as entity_type_name, d.name as department_name FROM sm_service_rules sr LEFT JOIN sm_countries c ON sr.country_id=c.id LEFT JOIN sm_states s ON sr.state_id=s.id LEFT JOIN sm_entity_types et ON sr.entity_type_id=et.id LEFT JOIN sm_departments d ON sr.department_id=d.id WHERE sr.sub_compliance_id = ?`).all(id);
    return NextResponse.json({ ...(sc as any), questions, info_fields: infoFields, penalties, rules });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const now = new Date().toISOString();
    getDb().prepare(`UPDATE sm_sub_compliances SET compliance_head_id=?,name=?,short_name=?,description=?,brief=?,has_compliance_date=?,dependency_type=?,dependency_label=?,period_type=?,period_value=?,grace_value=?,grace_unit=?,is_compulsory=?,undertaking_required=?,undertaking_text=?,is_active=?,sort_order=?,updated_at=? WHERE id=?`).run(
      body.compliance_head_id, body.name, body.short_name||null, body.description||null, body.brief||null,
      body.has_compliance_date!==false?1:0, body.dependency_type||null, body.dependency_label||null,
      body.period_type||null, body.period_value||1, body.grace_value||0, body.grace_unit||null,
      body.is_compulsory?1:0, body.undertaking_required?1:0, body.undertaking_text||null,
      body.is_active!==false?1:0, body.sort_order||0, now, id
    );
    return NextResponse.json({ success: true });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try { const { id } = await params; getDb().prepare('DELETE FROM sm_sub_compliances WHERE id=?').run(id); return NextResponse.json({ success: true }); }
  catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
