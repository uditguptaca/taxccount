import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
  try {
    const db = getDb();
    const rows = db.prepare('SELECT * FROM sm_compliance_heads ORDER BY sort_order, name').all();
    const result = (rows as any[]).map(h => {
      const sc = db.prepare('SELECT COUNT(*) as c FROM sm_sub_compliances WHERE compliance_head_id = ?').get(h.id) as any;
      return { ...h, sub_compliance_count: sc?.c || 0 };
    });
    return NextResponse.json(result);
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const id = uuidv4();
    const now = new Date().toISOString();
    getDb().prepare(`INSERT INTO sm_compliance_heads (id,name,short_name,description,icon,color_code,is_active,sort_order,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?)`).run(
      id, body.name, body.short_name||null, body.description||null, body.icon||null, body.color_code||null,
      body.is_active!==false?1:0, body.sort_order||0, now, now
    );
    return NextResponse.json({ id, ...body });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
