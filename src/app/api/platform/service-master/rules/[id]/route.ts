import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params; const body = await req.json();
    getDb().prepare(`UPDATE sm_service_rules SET sub_compliance_id=?,country_id=?,state_id=?,entity_type_id=?,department_id=?,is_active=? WHERE id=?`).run(
      body.sub_compliance_id, body.country_id||null, body.state_id||null, body.entity_type_id||null, body.department_id||null, body.is_active!==false?1:0, id);
    return NextResponse.json({ success: true });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try { const { id } = await params; getDb().prepare('DELETE FROM sm_service_rules WHERE id=?').run(id); return NextResponse.json({ success: true }); }
  catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
