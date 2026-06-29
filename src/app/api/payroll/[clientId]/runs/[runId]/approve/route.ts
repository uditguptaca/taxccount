import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function POST(
  request: Request,
  { params }: { params: { clientId: string; runId: string } }
) {
  try {
    const db = getDb();

    // 1. Get pay run details
    const runSql = `
      SELECT pr.*, pg.frequency
      FROM pay_run pr
      JOIN pay_group pg ON pr.pay_group_id = pg.id
      WHERE pr.id = ?
    `;
    const run = await db.prepare(runSql).get(params.runId);
    if (!run) {
      return NextResponse.json({ error: 'Pay run not found' }, { status: 404 });
    }

    if (run.status === 'APPROVED' || run.status === 'PAID') {
      return NextResponse.json({ error: 'Pay run is already approved/paid' }, { status: 400 });
    }

    // 2. Get all included payslips
    const payslips = await db.prepare(`
      SELECT ps.*, p.first_name, p.last_name, p.vacation_rate, p.vacation_pay_method, p.type as person_type
      FROM payslip ps
      JOIN payroll_person p ON ps.person_id = p.id
      WHERE ps.pay_run_id = ? AND ps.included = true
    `).all(params.runId);

    if (payslips.length === 0) {
      return NextResponse.json({ error: 'No active/included payslips to approve' }, { status: 400 });
    }

    const orgId = run.org_id || '123e4567-e89b-12d3-a456-426614174000';

    // 3. Perform database operations in a transaction
    const approveTransaction = db.transaction(async (txDb) => {
      // 3.1 Update YTD Balances for each person
      for (const slip of payslips) {
        if (slip.person_type === 'Contractor') {
          // Update contractor YTD (Gross only)
          const updateYtd = `
            UPDATE ytd_balance
            SET gross_pay = gross_pay + ?,
                insurable_earnings = insurable_earnings + ?
            WHERE person_id = ? AND tax_year = ?
          `;
          await txDb.prepare(updateYtd).run(
            slip.gross_pay, slip.gross_pay, slip.person_id, run.rate_table_year || 2026
          );
        } else {
          // Employee - update all statutory fields
          const updateYtd = `
            UPDATE ytd_balance
            SET gross_pay = gross_pay + ?,
                pensionable_earnings = pensionable_earnings + ?,
                insurable_earnings = insurable_earnings + ?,
                federal_tax = federal_tax + ?,
                provincial_tax = provincial_tax + ?,
                cpp_contribution = cpp_contribution + ?,
                cpp2_contribution = cpp2_contribution + ?,
                ei_premium = ei_premium + ?,
                employer_cpp = employer_cpp + ?,
                employer_cpp2 = employer_cpp2 + ?,
                employer_ei = employer_ei + ?,
                vacation_accrued = vacation_accrued + ?,
                vacation_paid = vacation_paid + ?
            WHERE person_id = ? AND tax_year = ?
          `;

          // Vacation accrued this period
          const vacRate = slip.vacation_rate || 4;
          // Accrued is only on earnings (regular + OT + other)
          const earnings = (slip.regular_pay || 0) + (slip.overtime_pay || 0) + (slip.other_income || 0);
          const vacAccrued = slip.vacation_pay_method === 'accrue' ? (earnings * vacRate) / 100 : 0;
          const vacPaid = slip.vacation_pay || 0;

          await txDb.prepare(updateYtd).run(
            slip.gross_pay,
            slip.cpp_exempt ? 0 : slip.gross_pay,
            slip.ei_exempt ? 0 : slip.gross_pay,
            slip.federal_tax,
            slip.provincial_tax,
            slip.cpp,
            slip.cpp2,
            slip.ei,
            slip.employer_cpp,
            slip.employer_cpp2,
            slip.employer_ei,
            vacAccrued,
            vacPaid,
            slip.person_id,
            run.rate_table_year || 2026
          );
        }
      }

      // 3.2 Compute total tax, CPP, EI for remittance
      let totalCpp = 0;
      let totalEi = 0;
      let totalTax = 0;
      let totalEmployerCpp = 0;
      let totalEmployerEi = 0;

      for (const slip of payslips) {
        totalCpp += (slip.cpp || 0) + (slip.cpp2 || 0);
        totalEi += (slip.ei || 0);
        totalTax += (slip.federal_tax || 0) + (slip.provincial_tax || 0);
        totalEmployerCpp += (slip.employer_cpp || 0) + (slip.employer_cpp2 || 0);
        totalEmployerEi += (slip.employer_ei || 0);
      }

      const totalRemittanceAmount = totalCpp + totalEi + totalTax + totalEmployerCpp + totalEmployerEi;

      // 3.3 Create CRA Remittance Record (Pending)
      const payDate = new Date(run.pay_date);
      // Remittance is due by the 15th of the following month
      const dueYear = payDate.getMonth() === 11 ? payDate.getFullYear() + 1 : payDate.getFullYear();
      const dueMonth = payDate.getMonth() === 11 ? 1 : payDate.getMonth() + 2; // 1-indexed next month
      const dueDateStr = `${dueYear}-${String(dueMonth).padStart(2, '0')}-15`;

      const remittanceSql = `
        INSERT INTO remittance (
          org_id, client_id, pay_run_id, authority, period_start, period_end, due_date,
          total_cpp, total_ei, total_tax, total_employer_cpp, total_employer_ei, total_amount, status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING')
      `;
      await txDb.prepare(remittanceSql).run(
        orgId, params.clientId, params.runId, 'CRA', run.period_start, run.period_end, dueDateStr,
        totalCpp, totalEi, totalTax, totalEmployerCpp, totalEmployerEi, totalRemittanceAmount
      );

      // 3.4 Sync to LedgerFlow (System B) if a ledger exists
      const ledger = await txDb.prepare(`
        SELECT id FROM ledgers 
        WHERE client_id = ? OR client_id = 'FIRM' 
        LIMIT 1
      `).get(params.clientId);

      if (ledger) {
        const ledgerId = ledger.id;
        const systemBPayrollId = uuidv4();

        // 3.4.1 Create ledger_payroll
        await txDb.prepare(`
          INSERT INTO ledger_payroll (
            id, org_id, ledger_id, run_date, period_start, period_end, total_gross, total_net, deductions_json, liabilities_json, status
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'posted')
        `).run(
          systemBPayrollId, orgId, ledgerId, run.pay_date, run.period_start, run.period_end,
          run.total_gross, run.total_net,
          JSON.stringify({ cpp: totalCpp, ei: totalEi, tax: totalTax }),
          JSON.stringify({ cpp_payable: totalCpp + totalEmployerCpp, ei_payable: totalEi + totalEmployerEi, tax_payable: totalTax }),
        );

        // 3.4.2 Create ledger_payslips & ledger_employees
        for (const slip of payslips) {
          // Find or create ledger_employee
          let emp = await txDb.prepare(`
            SELECT id FROM ledger_employees 
            WHERE org_id = ? AND ledger_id = ? AND (email = ? OR (first_name = ? AND last_name = ?))
            LIMIT 1
          `).get(orgId, ledgerId, slip.email || '', slip.first_name, slip.last_name);

          let empId = emp?.id;
          if (!empId) {
            empId = uuidv4();
            await txDb.prepare(`
              INSERT INTO ledger_employees (id, org_id, ledger_id, first_name, last_name, sin, status)
              VALUES (?, ?, ?, ?, ?, '000-000-000', 'active')
            `).run(empId, orgId, ledgerId, slip.first_name, slip.last_name);
          }

          // Create System B payslip
          await txDb.prepare(`
            INSERT INTO ledger_payslips (
              id, org_id, ledger_id, payroll_id, employee_id, gross_pay, tax_deduction, cpp_deduction, ei_deduction, net_pay, status
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'posted')
          `).run(
            uuidv4(), orgId, ledgerId, systemBPayrollId, empId,
            slip.gross_pay, (slip.federal_tax || 0) + (slip.provincial_tax || 0),
            slip.cpp || 0, slip.ei || 0, slip.net_pay, 'posted'
          );
        }

        // 3.4.3 Create automated journal entry (transactions + lines)
        const txId = uuidv4();
        const ref = `PR-${params.runId.substring(0, 8)}`;
        const desc = `Payroll Run: ${run.period_start} to ${run.period_end}`;

        // Insert ledger transaction
        await txDb.prepare(`
          INSERT INTO ledger_transactions (id, org_id, ledger_id, date, description, type, status, amount, reference)
          VALUES (?, ?, ?, ?, ?, 'manual_journal', 'categorized', ?, ?)
        `).run(txId, orgId, ledgerId, run.pay_date, desc, run.total_gross, ref);

        // Fetch or simulate system accounts
        const expenseAcc = await txDb.prepare(`SELECT id FROM ledger_accounts WHERE ledger_id = ? AND type = 'expense' LIMIT 1`).get(ledgerId);
        const assetAcc = await txDb.prepare(`SELECT id FROM ledger_accounts WHERE ledger_id = ? AND type = 'asset' LIMIT 1`).get(ledgerId);
        const liabilityAcc = await txDb.prepare(`SELECT id FROM ledger_accounts WHERE ledger_id = ? AND type = 'liability' LIMIT 1`).get(ledgerId);

        const expAccId = expenseAcc?.id || uuidv4();
        const cashAccId = assetAcc?.id || uuidv4();
        const liabAccId = liabilityAcc?.id || uuidv4();

        // Line 1: Debit Payroll Expense (Gross)
        await txDb.prepare(`
          INSERT INTO ledger_journal_entries (id, org_id, transaction_id, account_id, debit, credit, memo)
          VALUES (?, ?, ?, ?, ?, 0, 'Wages Expense')
        `).run(uuidv4(), orgId, txId, expAccId, run.total_gross);

        // Line 2: Credit Cash/Bank (Net)
        await txDb.prepare(`
          INSERT INTO ledger_journal_entries (id, org_id, transaction_id, account_id, debit, credit, memo)
          VALUES (?, ?, ?, ?, 0, ?, 'Net Payroll Payout')
        `).run(uuidv4(), orgId, txId, cashAccId, run.total_net);

        // Line 3: Credit Liabilities (Employee Deductions + Employer Cost)
        const totalLiabilities = (run.total_gross - run.total_net) + (run.total_employer_cost || 0);
        if (totalLiabilities > 0) {
          await txDb.prepare(`
            INSERT INTO ledger_journal_entries (id, org_id, transaction_id, account_id, debit, credit, memo)
            VALUES (?, ?, ?, ?, 0, ?, 'Payroll Source Deductions Payable')
          `).run(uuidv4(), orgId, txId, liabAccId, totalLiabilities);
        }
      }

      // 3.5 Update pay_run status to PAID
      await txDb.prepare(`
        UPDATE pay_run
        SET status = 'PAID',
            approved_by = 'firm-admin-uuid',
            approved_at = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(params.runId);
    });

    await approveTransaction();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error approving payroll:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
