import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function GET(req: Request) {
  try {
    const db = getDb();
    const { searchParams } = new URL(req.url);
    const countryId = searchParams.get('countryId');
    const rows = countryId
      ? db.prepare('SELECT * FROM sm_states WHERE country_id = ? ORDER BY sort_order, name').all(countryId)
      : db.prepare('SELECT s.*, c.name as country_name FROM sm_states s LEFT JOIN sm_countries c ON s.country_id = c.id ORDER BY c.sort_order, s.sort_order').all();
    return NextResponse.json(rows);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const db = getDb();
    const body = await req.json();
    const id = uuidv4();
    db.prepare(`INSERT INTO sm_states (id,country_id,name,code,is_active,sort_order,created_at) VALUES (?,?,?,?,?,?,?)`).run(
      id, body.country_id, body.name, body.code || null, body.is_active !== false ? 1 : 0, body.sort_order || 0, new Date().toISOString()
    );
    return NextResponse.json({ id, ...body });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
