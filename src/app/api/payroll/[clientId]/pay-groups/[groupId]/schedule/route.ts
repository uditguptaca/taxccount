import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { clientId: string; groupId: string } }
) {
  try {
    const db = getDb();
    const sql = `
      SELECT * FROM pay_schedule 
      WHERE client_id = ? AND pay_group_id = ? 
      ORDER BY period_start ASC
    `;
    const schedules = await db.prepare(sql).all(params.clientId, params.groupId);
    return NextResponse.json({ schedules });
  } catch (error: any) {
    console.error('Error fetching schedules:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
