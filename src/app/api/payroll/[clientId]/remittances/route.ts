import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(request: Request, { params }: { params: { clientId: string } }) {
  try {
    const db = getDb();
    const sql = `
      SELECT r.*, pr.period_start, pr.period_end, pr.pay_date
      FROM remittance r
      LEFT JOIN pay_run pr ON r.pay_run_id = pr.id
      WHERE r.client_id = ?
      ORDER BY r.due_date DESC
    `;
    const remittances = await db.prepare(sql).all(params.clientId);
    return NextResponse.json({ remittances });
  } catch (error: any) {
    console.error('Error fetching remittances:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
