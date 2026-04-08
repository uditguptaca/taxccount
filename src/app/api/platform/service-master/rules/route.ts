import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const subCompId = searchParams.get('subCompId');
    const db = getDb();
    const sql = `SELECT sr.*, c.name as country_name, s.name as state_name, et.name as entity_type_name, d.name as department_name, sc.name as sub_compliance_name
      FROM sm_service_rules sr
      LEFT JOIN sm_countries c ON sr.country_id=c.id LEFT JOIN sm_states s ON sr.state_id=s.id
      LEFT JOIN sm_entity_types et ON sr.entity_type_id=et.id LEFT JOIN sm_departments d ON sr.department_id=d.id
      JOIN sm_sub_compliances sc ON sr.sub_compliance_id=sc.id
      ${subCompId ? 'WHERE sr.sub_compliance_id = ?' : ''} ORDER BY sc.name`;
    const rows = subCompId ? db.prepare(sql).all(subCompId) : db.prepare(sql).all();
    return NextResponse.json(rows);
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const id = uuidv4();
    getDb().prepare(`INSERT INTO sm_service_rules (id,sub_compliance_id,country_id,state_id,entity_type_id,department_id,is_active,created_at) VALUES (?,?,?,?,?,?,?,?)`).run(
      id, body.sub_compliance_id, body.country_id||null, body.state_id||null,
      body.entity_type_id||null, body.department_id||null, body.is_active!==false?1:0, new Date().toISOString()
    );
    return NextResponse.json({ id, ...body });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
