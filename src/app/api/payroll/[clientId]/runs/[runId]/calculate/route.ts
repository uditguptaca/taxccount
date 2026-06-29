import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { calculatePayPeriodDeductions, RATES_2026, PayFrequency } from '@/lib/canadian-payroll-engine';

export async function POST(
  request: Request,
  { params }: { params: { clientId: string; runId: string } }
) {
  try {
    const db = getDb();

    // 1. Get pay run and pay group details
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

    const freqStr = run.frequency || 'Bi-weekly';
    const frequencyMap: Record<string, PayFrequency> = {
      'Weekly': 'weekly',
      'Bi-weekly': 'biweekly',
      'Semi-monthly': 'semimonthly',
      'Monthly': 'monthly'
    };
    const freq = frequencyMap[freqStr] || 'biweekly';

    // 2. Fetch all payslips for this run
    const payslips = await db.prepare(`
      SELECT ps.*, p.province_of_employment, p.federal_claim, p.provincial_claim,
             p.additional_tax, p.cpp_exempt, p.ei_exempt, p.northern_deduction, p.type as person_type
      FROM payslip ps
      JOIN payroll_person p ON ps.person_id = p.id
      WHERE ps.pay_run_id = ?
    `).all(params.runId);

    // 3. Process calculations in a transaction
    const calcTransaction = db.transaction(async (txDb) => {
      let totalGross = 0;
      let totalDeductions = 0;
      let totalNet = 0;
      let totalEmployerCost = 0;

      for (const slip of payslips) {
        if (!slip.included) continue;

        // Fetch YTD Balance for this person
        let ytd = await txDb.prepare(`
          SELECT * FROM ytd_balance 
          WHERE person_id = ? AND tax_year = ?
        `).get(slip.person_id, run.rate_table_year || 2026);

        // If no YTD found, create one
        if (!ytd) {
          const orgId = '123e4567-e89b-12d3-a456-426614174000';
          await txDb.prepare(`
            INSERT INTO ytd_balance (org_id, client_id, person_id, tax_year)
            VALUES (?, ?, ?, ?)
          `).run(orgId, params.clientId, slip.person_id, run.rate_table_year || 2026);
          
          ytd = {
            cpp_contribution: 0,
            cpp2_contribution: 0,
            ei_premium: 0,
            pensionable_earnings: 0,
            insurable_earnings: 0
          };
        }

        const gross = slip.gross_pay || 0;

        // Run engine calculations (only for employees; contractors are paid gross)
        if (slip.person_type === 'Contractor') {
          // Contractors have zero deductions, net pay is gross pay
          const net = gross - (slip.other_deductions || 0);
          await txDb.prepare(`
            UPDATE payslip
            SET federal_tax = 0, provincial_tax = 0, cpp = 0, cpp2 = 0, ei = 0,
                total_deductions = ?, net_pay = ?, employer_cpp = 0, employer_cpp2 = 0, employer_ei = 0,
                total_employer_cost = 0, engine_output = null, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
          `).run(slip.other_deductions || 0, net, slip.id);

          totalGross += gross;
          totalDeductions += (slip.other_deductions || 0);
          totalNet += net;
        } else {
          // Employee - calculate statutory deductions
          const calcResult = calculatePayPeriodDeductions({
            province: (slip.province_of_employment || 'ON') as any,
            frequency: freq,
            grossThisPeriod: gross,
            pensionableThisPeriod: slip.cpp_exempt ? 0 : gross,
            insurableThisPeriod: slip.ei_exempt ? 0 : gross,
            federalClaim: slip.federal_claim || undefined,
            provincialClaim: slip.provincial_claim || undefined,
            additionalTaxThisPeriod: slip.additional_tax || 0,
            cppExempt: slip.cpp_exempt || false,
            eiExempt: slip.ei_exempt || false,
            northernDeductionAnnual: slip.northern_deduction || 0,
            ytdCppContribution: ytd.cpp_contribution || 0,
            ytdCpp2Contribution: ytd.cpp2_contribution || 0,
            ytdEiPremium: ytd.ei_premium || 0,
            ytdPensionableEarnings: ytd.pensionable_earnings || 0,
            ytdInsurableEarnings: ytd.insurable_earnings || 0
          }, RATES_2026);

          const finalDeductions = calcResult.totalEmployeeDeductions + (slip.other_deductions || 0);
          const finalNet = calcResult.netPay - (slip.other_deductions || 0);

          await txDb.prepare(`
            UPDATE payslip
            SET federal_tax = ?,
                provincial_tax = ?,
                cpp = ?,
                cpp2 = ?,
                ei = ?,
                total_deductions = ?,
                net_pay = ?,
                employer_cpp = ?,
                employer_cpp2 = ?,
                employer_ei = ?,
                total_employer_cost = ?,
                engine_output = ?::jsonb,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
          `).run(
            calcResult.federalTax, calcResult.provincialTax, calcResult.cpp, calcResult.cpp2, calcResult.ei,
            finalDeductions, finalNet, calcResult.employerCpp, calcResult.employerCpp2, calcResult.employerEi,
            calcResult.totalEmployerContributions, JSON.stringify(calcResult), slip.id
          );

          totalGross += gross;
          totalDeductions += finalDeductions;
          totalNet += finalNet;
          totalEmployerCost += calcResult.totalEmployerContributions;
        }
      }

      // Update pay_run header
      await txDb.prepare(`
        UPDATE pay_run
        SET status = 'CALCULATED',
            total_gross = ?,
            total_net = ?,
            total_deductions = ?,
            total_employer_cost = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(totalGross, totalNet, totalDeductions, totalEmployerCost, params.runId);
    });

    await calcTransaction();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error calculating pay period deductions:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
