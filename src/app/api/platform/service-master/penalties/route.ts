import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const subCompId = searchParams.get('subCompId');
    const db = getDb();
    const sql = subCompId
      ? `SELECT p.*, sc.name as sub_compliance_name FROM sm_penalties p JOIN sm_sub_compliances sc ON p.sub_compliance_id=sc.id WHERE p.sub_compliance_id=? ORDER BY p.created_at`
      : `SELECT p.*, sc.name as sub_compliance_name FROM sm_penalties p JOIN sm_sub_compliances sc ON p.sub_compliance_id=sc.id ORDER BY sc.name`;
    return NextResponse.json(subCompId ? db.prepare(sql).all(subCompId) : db.prepare(sql).all());
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const id = uuidv4();
    getDb().prepare(`INSERT INTO sm_penalties (id,sub_compliance_id,description,penalty_type,amount,rate,max_amount,details,is_active,created_at) VALUES (?,?,?,?,?,?,?,?,?,?)`).run(
      id, body.sub_compliance_id, body.description, body.penalty_type||'fixed',
      body.amount||null, body.rate||null, body.max_amount||null, body.details||null,
      body.is_active!==false?1:0, new Date().toISOString()
    );
    return NextResponse.json({ id, ...body });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
