import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(request: Request, { params }: { params: { clientId: string } }) {
  try {
    const db = getDb();
    
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
