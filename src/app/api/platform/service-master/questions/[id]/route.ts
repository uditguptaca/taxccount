import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params; const body = await req.json();
    getDb().prepare(`UPDATE sm_questions SET sub_compliance_id=?,question_text=?,question_type=?,description=?,is_compulsory_trigger=?,trigger_value=?,triggers_sub_compliance_id=?,threshold_context=?,parent_question_id=?,options=?,sort_order=?,is_active=? WHERE id=?`).run(
      body.sub_compliance_id, body.question_text, body.question_type||'yes_no', body.description||null,
      body.is_compulsory_trigger?1:0, body.trigger_value||null, body.triggers_sub_compliance_id||null,
      body.threshold_context||null, body.parent_question_id||null, body.options||null, body.sort_order||0,
      body.is_active!==false?1:0, id);
    return NextResponse.json({ success: true });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try { const { id } = await params; getDb().prepare('DELETE FROM sm_questions WHERE id=?').run(id); return NextResponse.json({ success: true }); }
  catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
