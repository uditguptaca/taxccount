import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSessionContext } from '@/lib/auth-context';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const session = getSessionContext();
    const orgId = session?.orgId || '123e4567-e89b-12d3-a456-426614174000'; // Fallback if no session

    const db = getDb();

    // 1. Fetch all clients with their payroll status and counts
    const clientsSql = `
      SELECT c.id, c.display_name, c.client_code, c.state_province, c.client_type,
             (SELECT COUNT(*) FROM payroll_person WHERE client_id = c.id AND status = 'ACTIVE') as active_team,
             pc.legal_name as payroll_setup, pc.default_province, pc.remitter_type,
             (SELECT MAX(pay_date) FROM pay_run WHERE client_id = c.id AND status = 'PAID') as last_run_date
      FROM clients c
      LEFT JOIN payroll_company pc ON c.id = pc.client_id
      WHERE c.org_id = ?
      ORDER BY c.display_name ASC
    `;
    const clients = await db.prepare(clientsSql).all(orgId);

    // 2. Fetch pending pay runs across all clients
    const pendingRunsSql = `
      SELECT pr.*, c.display_name as client_name, pg.name as pay_group_name
      FROM pay_run pr
      JOIN clients c ON pr.client_id = c.id
      JOIN pay_group pg ON pr.pay_group_id = pg.id
      WHERE pr.org_id = ? AND pr.status IN ('DRAFT', 'HOURS_ENTERED', 'CALCULATED')
      ORDER BY pr.pay_date ASC
    `;
    const pendingRuns = await db.prepare(pendingRunsSql).all(orgId);

    // 3. Fetch pending remittances across all clients
    const pendingRemittancesSql = `
      SELECT r.*, c.display_name as client_name
      FROM remittance r
      JOIN clients c ON r.client_id = c.id
      WHERE r.org_id = ? AND r.status = 'PENDING'
      ORDER BY r.due_date ASC
    `;
    const pendingRemittances = await db.prepare(pendingRemittancesSql).all(orgId);

    // 4. Fetch recent completed payroll activity
    const recentActivitySql = `
      SELECT pr.id, pr.period_start, pr.period_end, pr.pay_date, pr.total_gross, pr.updated_at,
             c.display_name as client_name, pg.name as pay_group_name
      FROM pay_run pr
      JOIN clients c ON pr.client_id = c.id
      JOIN pay_group pg ON pr.pay_group_id = pg.id
      WHERE pr.org_id = ? AND pr.status = 'PAID'
      ORDER BY pr.updated_at DESC
      LIMIT 5
    `;
    const recentActivity = await db.prepare(recentActivitySql).all(orgId);

    // 5. Calculate global metrics
    const payrollClientsCount = clients.filter((c: any) => c.payroll_setup).length;
    const totalActiveEmployees = clients.reduce((sum: number, c: any) => sum + Number(c.active_team || 0), 0);
    const totalProcessedThisMonth = recentActivity.reduce((sum: number, a: any) => sum + (Number(a.total_gross) || 0), 0);

    return NextResponse.json({
      clients,
      pendingRuns,
      pendingRemittances,
      recentActivity,
      stats: {
        totalClients: clients.length,
        payrollClientsCount,
        totalActiveEmployees,
        totalProcessedThisMonth
      }
    });

  } catch (error: any) {
    console.error('Firm dashboard API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
