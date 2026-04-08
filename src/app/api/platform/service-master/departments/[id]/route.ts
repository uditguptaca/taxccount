import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    getDb().prepare(`UPDATE sm_departments SET name=?,description=?,is_active=?,sort_order=? WHERE id=?`).run(body.name, body.description||null, body.is_active!==false?1:0, body.sort_order||0, id);
    return NextResponse.json({ success: true });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try { const { id } = await params; getDb().prepare('DELETE FROM sm_departments WHERE id=?').run(id); return NextResponse.json({ success: true }); }
  catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
