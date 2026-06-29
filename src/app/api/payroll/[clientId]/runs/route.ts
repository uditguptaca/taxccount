import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function GET(request: Request, { params }: { params: { clientId: string } }) {
  try {
    const db = getDb();
    const sql = `
      SELECT pr.*, pg.name as pay_group_name 
      FROM pay_run pr
      LEFT JOIN pay_group pg ON pr.pay_group_id = pg.id
      WHERE pr.client_id = ?
      ORDER BY pr.created_at DESC
    `;
    const runs = await db.prepare(sql).all(params.clientId);
    return NextResponse.json({ runs });
  } catch (error: any) {
    console.error('Error fetching pay runs:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: { clientId: string } }) {
  try {
    const db = getDb();
    const body = await request.json();
    const orgId = '123e4567-e89b-12d3-a456-426614174000'; // Mock session org ID

    const { pay_group_id, period_start, period_end, pay_date } = body;
    if (!pay_group_id || !period_start || !period_end || !pay_date) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // 1. Get pay group details
    const payGroup = await db.prepare('SELECT * FROM pay_group WHERE id = ?').get(pay_group_id);
    if (!payGroup) {
      return NextResponse.json({ error: 'Pay group not found' }, { status: 404 });
    }

    // 2. Fetch all active employees in this pay group
    const people = await db.prepare(`
      SELECT * FROM payroll_person 
      WHERE client_id = ? AND pay_group_id = ? AND status = 'ACTIVE'
    `).all(params.clientId, pay_group_id);

    if (people.length === 0) {
      return NextResponse.json({ error: 'No active employees found in this pay group' }, { status: 400 });
    }

    // 3. Create the pay_run
    const runId = uuidv4();
    const employeeCount = people.filter((p: any) => p.type === 'Employee').length;
    const contractorCount = people.filter((p: any) => p.type === 'Contractor').length;

    const runSql = `
      INSERT INTO pay_run (
        id, org_id, client_id, pay_group_id, run_type, status, period_start, period_end, pay_date,
        direct_deposit, remit_taxes, rate_table_year, employee_count, contractor_count
      )
      VALUES (?, ?, ?, ?, 'REGULAR', 'DRAFT', ?, ?, ?, true, true, 2026, ?, ?)
      RETURNING *
    `;
    const run = await db.prepare(runSql).get(
      runId, orgId, params.clientId, pay_group_id, period_start, period_end, pay_date,
      employeeCount, contractorCount
    );

    // 4. Create payslips for each active person
    const freq = payGroup.frequency || 'Bi-weekly';
    const P = freq === 'Weekly' ? 52 : freq === 'Bi-weekly' ? 26 : freq === 'Semi-monthly' ? 24 : 12;

    const payslipSql = `
      INSERT INTO payslip (
        id, org_id, client_id, pay_run_id, person_id, included, regular_hours, overtime_hours,
        regular_pay, overtime_pay, other_income, gross_pay, net_pay, payment_method
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    for (const p of people) {
      const standardHours = p.standard_hours || 40;
      const rate = p.pay_rate || 0;
      let regularPay = 0;

      if (p.pay_type === 'Salary') {
        regularPay = rate / P;
      } else {
        // Hourly: hourly rate * standard hours
        // For biweekly/weekly, standard hours is standard hours per period or per week?
        // Let's assume standard hours is per period. Seed has 40 hours standard.
        // If weekly, 40 hours. If biweekly, let's assume standard_hours * 2 for biweekly.
        const multiplier = freq === 'Bi-weekly' ? 2 : 1;
        regularPay = rate * standardHours * multiplier;
      }

      const payMethod = p.vacation_pay_method === 'cheque' ? 'cheque' : 'direct_deposit';

      await db.prepare(payslipSql).run(
        uuidv4(), orgId, params.clientId, runId, p.id, true, standardHours * (freq === 'Bi-weekly' ? 2 : 1), 0,
        regularPay, 0, 0, regularPay, regularPay, payMethod
      );
    }

    return NextResponse.json({ run });
  } catch (error: any) {
    console.error('Error creating pay run:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
