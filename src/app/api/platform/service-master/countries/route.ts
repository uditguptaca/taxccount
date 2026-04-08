// ══════════════════════════════════════════════════════════════════
// SERVICE MASTER — Countries API (Platform Admin)
// ══════════════════════════════════════════════════════════════════
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
  try {
    const db = getDb();
    const rows = db.prepare('SELECT * FROM sm_countries ORDER BY sort_order, name').all();
    // Attach state count
    const result = (rows as any[]).map(c => {
      const stateCount = db.prepare('SELECT COUNT(*) as c FROM sm_states WHERE country_id = ?').get(c.id) as any;
      return { ...c, state_count: stateCount?.c || 0 };
    });
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const db = getDb();
    const body = await req.json();
    const id = uuidv4();
    const now = new Date().toISOString();
    db.prepare(`INSERT INTO sm_countries (id,name,iso_code,financial_year_end_default,fy_is_fixed,is_active,sort_order,created_at) VALUES (?,?,?,?,?,?,?,?)`).run(
      id, body.name, body.iso_code || null, body.financial_year_end_default || null,
      body.fy_is_fixed ? 1 : 0, body.is_active !== false ? 1 : 0, body.sort_order || 0, now
    );
    return NextResponse.json({ id, ...body });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
