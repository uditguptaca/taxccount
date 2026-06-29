import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { clientId: string; runId: string } }
) {
  try {
    const db = getDb();

    // 1. Get pay run
    const runSql = `
      SELECT pr.*, pg.name as pay_group_name, pg.frequency as pay_group_frequency
      FROM pay_run pr
      LEFT JOIN pay_group pg ON pr.pay_group_id = pg.id
      WHERE pr.client_id = ? AND pr.id = ?
    `;
    const run = await db.prepare(runSql).get(params.clientId, params.runId);

    if (!run) {
      return NextResponse.json({ error: 'Pay run not found' }, { status: 404 });
    }

    // 2. Get all payslips with employee details
    const payslipsSql = `
      SELECT ps.*, 
             p.first_name, p.last_name, p.type as person_type, p.title, p.department, 
             p.province_of_employment, p.pay_type, p.pay_rate, p.standard_hours as person_standard_hours,
             p.vacation_rate as person_vacation_rate, p.vacation_pay_method as person_vacation_pay_method,
             y.gross_pay as ytd_gross, y.cpp_contribution as ytd_cpp, y.ei_premium as ytd_ei, y.federal_tax + y.provincial_tax as ytd_tax
      FROM payslip ps
      JOIN payroll_person p ON ps.person_id = p.id
      LEFT JOIN ytd_balance y ON p.id = y.person_id AND y.tax_year = ?
      WHERE ps.pay_run_id = ?
      ORDER BY p.first_name ASC
    `;
    const payslips = await db.prepare(payslipsSql).all(run.rate_table_year || 2026, params.runId);

    return NextResponse.json({ run, payslips });
  } catch (error: any) {
    console.error('Error fetching pay run details:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { clientId: string; runId: string } }
) {
  try {
    const db = getDb();
    const body = await request.json();

    const { direct_deposit, remit_taxes, pay_date, notes } = body;

    // Update pay run basic details (Step 1)
    const sql = `
      UPDATE pay_run
      SET direct_deposit = COALESCE(?, direct_deposit),
          remit_taxes = COALESCE(?, remit_taxes),
          pay_date = COALESCE(?, pay_date),
          notes = COALESCE(?, notes),
          updated_at = CURRENT_TIMESTAMP
      WHERE client_id = ? AND id = ?
      RETURNING *
    `;
    const run = await db.prepare(sql).get(
      direct_deposit, remit_taxes, pay_date, notes, params.clientId, params.runId
    );

    return NextResponse.json({ run });
  } catch (error: any) {
    console.error('Error updating pay run:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
