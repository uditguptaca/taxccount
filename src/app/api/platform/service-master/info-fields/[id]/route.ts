import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params; const body = await req.json();
    getDb().prepare(`UPDATE sm_info_fields SET sub_compliance_id=?,field_label=?,field_type=?,is_required=?,placeholder=?,help_text=?,options=?,sort_order=?,is_active=? WHERE id=?`).run(
      body.sub_compliance_id, body.field_label, body.field_type||'text', body.is_required?1:0,
      body.placeholder||null, body.help_text||null, body.options||null, body.sort_order||0,
      body.is_active!==false?1:0, id);
    return NextResponse.json({ success: true });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try { const { id } = await params; getDb().prepare('DELETE FROM sm_info_fields WHERE id=?').run(id); return NextResponse.json({ success: true }); }
  catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
