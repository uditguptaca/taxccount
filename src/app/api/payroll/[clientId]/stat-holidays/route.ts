import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { requireClientAccess } from '@/lib/tenant';

export async function GET(request: Request, { params }: { params: { clientId: string } }) {
  try {
    const db = getDb();
    const denied = await requireClientAccess(db, params.clientId);
    if (denied) return denied;
    
    // In a real app we'd get the url params (e.g. ?year=2026&province=ON)
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year') || new Date().getFullYear().toString();
    
    const sql = `SELECT * FROM stat_holiday WHERE client_id = ? AND year = ? ORDER BY date ASC`;
    const holidays = await db.prepare(sql).all(params.clientId, parseInt(year));
    
    return NextResponse.json({ holidays });
  } catch (error: any) {
    console.error('Error fetching stat holidays:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
