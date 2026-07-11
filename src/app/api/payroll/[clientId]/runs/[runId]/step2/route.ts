import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function PATCH(
  request: Request,
  { params }: { params: { clientId: string; runId: string } }
) {
  try {
    const db = getDb();
    const body = await request.json();

    const { payslips } = body;
    if (!Array.isArray(payslips)) {
      return NextResponse.json({ error: 'Invalid payload: payslips array required' }, { status: 400 });
    }

    // 1. Get pay group frequency divisor
    const runSql = `
      SELECT pr.*, pg.frequency, pg.id as pay_group_id
      FROM pay_run pr
      JOIN pay_group pg ON pr.pay_group_id = pg.id
      WHERE pr.id = ?
    `;
    const run = await db.prepare(runSql).get(params.runId);
    if (!run) {
      return NextResponse.json({ error: 'Pay run not found' }, { status: 404 });
    }

    const freq = run.frequency || 'Bi-weekly';
    const P = freq === 'Weekly' ? 52 : freq === 'Bi-weekly' ? 26 : freq === 'Semi-monthly' ? 24 : 12;

    // 2. Wrap updates in a transaction
    const updateTransaction = db.transaction(async (txDb) => {
      let totalGross = 0;
      let totalNet = 0;
      let totalDeductions = 0;
      let employeeCount = 0;
      let contractorCount = 0;

      for (const slip of payslips) {
        const { id, regular_hours = 0, overtime_hours = 0, other_income = 0, other_deductions = 0, included = true, vacation_pay = 0 } = slip;

        // Fetch current payslip joined with person details
        const currentSlip = await txDb.prepare(`
          SELECT ps.id, p.pay_type, p.pay_rate, p.standard_hours, p.vacation_rate, p.vacation_pay_method, p.type as person_type
          FROM payslip ps
          JOIN payroll_person p ON ps.person_id = p.id
          WHERE ps.id = ?
        `).get(id);

        if (!currentSlip) continue;

        if (!included) {
          // Zero out if not included
          await txDb.prepare(`
            UPDATE payslip
            SET included = false, regular_hours = 0, overtime_hours = 0, regular_pay = 0,
                overtime_pay = 0, other_income = 0, gross_pay = 0, net_pay = 0,
                vacation_pay = 0, total_deductions = 0, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
          `).run(id);
          continue;
        }

        const rate = currentSlip.pay_rate || 0;
        const stdHours = currentSlip.standard_hours || 40;
        let regularPay = 0;
        let overtimePay = 0;

        if (currentSlip.pay_type === 'Salary') {
          regularPay = rate / P;
          const hourlyEquivalent = rate / (stdHours * P);
          overtimePay = hourlyEquivalent * 1.5 * overtime_hours;
        } else {
          // Hourly
          regularPay = rate * regular_hours;
          overtimePay = rate * 1.5 * overtime_hours;
        }

        // Handle vacation pay if requested/due
        let finalVacationPay = vacation_pay;
        if (currentSlip.vacation_pay_method === 'pay_each_period' && finalVacationPay === 0) {
          finalVacationPay = (regularPay + overtimePay + other_income) * ((currentSlip.vacation_rate || 4) / 100);
        }

        const grossPay = regularPay + overtimePay + other_income + finalVacationPay;

        // Save progress to payslip (Step 2 updates status to HOURS_ENTERED)
        // Net pay defaults to gross pay before tax calculation (Step 3)
        await txDb.prepare(`
          UPDATE payslip
          SET included = true,
              regular_hours = ?,
              overtime_hours = ?,
              regular_pay = ?,
              overtime_pay = ?,
              other_income = ?,
              other_deductions = ?,
              vacation_pay = ?,
              gross_pay = ?,
              net_pay = ?,
              updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).run(
          regular_hours, overtime_hours, regularPay, overtimePay, other_income, other_deductions,
          finalVacationPay, grossPay, grossPay - other_deductions, id
        );

        totalGross += grossPay;
        totalDeductions += other_deductions;
        totalNet += (grossPay - other_deductions);

        if (currentSlip.person_type === 'Employee') employeeCount++;
        else contractorCount++;
      }

      // Update run status to HOURS_ENTERED
      await txDb.prepare(`
        UPDATE pay_run
        SET status = 'HOURS_ENTERED',
            total_gross = ?,
            total_net = ?,
            total_deductions = ?,
            employee_count = ?,
            contractor_count = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(totalGross, totalNet, totalDeductions, employeeCount, contractorCount, params.runId);
    });

    await updateTransaction();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating step 2 details:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
