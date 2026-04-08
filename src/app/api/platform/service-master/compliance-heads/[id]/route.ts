import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const now = new Date().toISOString();
    getDb().prepare(`UPDATE sm_compliance_heads SET name=?,short_name=?,description=?,icon=?,color_code=?,is_active=?,sort_order=?,updated_at=? WHERE id=?`).run(
      body.name, body.short_name||null, body.description||null, body.icon||null, body.color_code||null,
      body.is_active!==false?1:0, body.sort_order||0, now, id
    );
    return NextResponse.json({ success: true });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try { const { id } = await params; getDb().prepare('DELETE FROM sm_compliance_heads WHERE id=?').run(id); return NextResponse.json({ success: true }); }
  catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
