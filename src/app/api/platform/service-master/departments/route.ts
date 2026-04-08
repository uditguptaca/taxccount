import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
  try {
    return NextResponse.json(getDb().prepare('SELECT * FROM sm_departments ORDER BY sort_order, name').all());
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const id = uuidv4();
    getDb().prepare(`INSERT INTO sm_departments (id,name,description,is_active,sort_order,created_at) VALUES (?,?,?,?,?,?)`).run(
      id, body.name, body.description || null, body.is_active !== false ? 1 : 0, body.sort_order || 0, new Date().toISOString()
    );
    return NextResponse.json({ id, ...body });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
