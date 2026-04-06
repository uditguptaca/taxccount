import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSessionContext } from "@/lib/auth-context";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {

        const session = getSessionContext();
    if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { orgId, userId, role } = session;

    const db = getDb();
    const client = db.prepare('SELECT * FROM clients WHERE portal_user_id = ?').get(userId) as any;
    if (!client) return NextResponse.json({ error: 'Client not found' }, { status: 404 });

    const invoices = db.prepare(`
      SELECT i.*, cc.engagement_code, ct.name as template_name, cc.financial_year
      FROM invoices i
      LEFT JOIN client_compliances cc ON i.engagement_id = cc.id
      LEFT JOIN compliance_templates ct ON cc.template_id = ct.id
      WHERE i.client_id = ?
      ORDER BY i.created_at DESC
    `).all(client.id) as any[];

    const summary = db.prepare(`
      SELECT 
        COALESCE(SUM(total_amount), 0) as total_billed,
        COALESCE(SUM(paid_amount), 0) as total_paid,
        COALESCE(SUM(CASE WHEN status IN ('sent','overdue','partially_paid') THEN total_amount - paid_amount ELSE 0 END), 0) as outstanding,
        COALESCE(SUM(CASE WHEN status = 'overdue' THEN total_amount - paid_amount ELSE 0 END), 0) as overdue,
        COUNT(*) as total_invoices,
        COUNT(CASE WHEN status = 'paid' THEN 1 END) as paid_count,
        COUNT(CASE WHEN status = 'overdue' THEN 1 END) as overdue_count,
        COUNT(CASE WHEN status IN ('sent','partially_paid') THEN 1 END) as pending_count
      FROM invoices WHERE client_id = ?
    `).get(client.id) as any;

    return NextResponse.json({ invoices, summary });
  } catch (error) {
    console.error('Portal invoices error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
