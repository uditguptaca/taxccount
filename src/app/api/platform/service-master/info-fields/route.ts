import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const subCompId = searchParams.get('subCompId');
    const db = getDb();
    const sql = subCompId
      ? `SELECT f.*, sc.name as sub_compliance_name FROM sm_info_fields f JOIN sm_sub_compliances sc ON f.sub_compliance_id=sc.id WHERE f.sub_compliance_id=? ORDER BY f.sort_order`
      : `SELECT f.*, sc.name as sub_compliance_name FROM sm_info_fields f JOIN sm_sub_compliances sc ON f.sub_compliance_id=sc.id ORDER BY sc.name, f.sort_order`;
    return NextResponse.json(subCompId ? db.prepare(sql).all(subCompId) : db.prepare(sql).all());
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const id = uuidv4();
    getDb().prepare(`INSERT INTO sm_info_fields (id,sub_compliance_id,field_label,field_type,is_required,placeholder,help_text,options,sort_order,is_active,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)`).run(
      id, body.sub_compliance_id, body.field_label, body.field_type||'text', body.is_required?1:0,
      body.placeholder||null, body.help_text||null, body.options||null, body.sort_order||0,
      body.is_active!==false?1:0, new Date().toISOString()
    );
    return NextResponse.json({ id, ...body });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
