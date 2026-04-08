import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params; const body = await req.json();
    getDb().prepare(`UPDATE sm_penalties SET sub_compliance_id=?,description=?,penalty_type=?,amount=?,rate=?,max_amount=?,details=?,is_active=? WHERE id=?`).run(
      body.sub_compliance_id, body.description, body.penalty_type||'fixed',
      body.amount||null, body.rate||null, body.max_amount||null, body.details||null,
      body.is_active!==false?1:0, id);
    return NextResponse.json({ success: true });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try { const { id } = await params; getDb().prepare('DELETE FROM sm_penalties WHERE id=?').run(id); return NextResponse.json({ success: true }); }
  catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
