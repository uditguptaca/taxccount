import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const db = getDb();
    const body = await req.json();
    db.prepare(`UPDATE sm_countries SET name=?,iso_code=?,financial_year_end_default=?,fy_is_fixed=?,is_active=?,sort_order=? WHERE id=?`).run(
      body.name, body.iso_code || null, body.financial_year_end_default || null,
      body.fy_is_fixed ? 1 : 0, body.is_active !== false ? 1 : 0, body.sort_order || 0, id
    );
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const db = getDb();
    db.prepare('DELETE FROM sm_countries WHERE id = ?').run(id);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
