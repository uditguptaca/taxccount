import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function POST(
  request: Request,
  { params }: { params: { clientId: string; runId: string } }
) {
  try {
    const db = getDb();

    // 1. Get pay run details
    const runSql = `SELECT * FROM pay_run WHERE id = ?`;
    const run = await db.prepare(runSql).get(params.runId);
    if (!run) {
      return NextResponse.json({ error: 'Pay run not found' }, { status: 404 });
    }

    if (run.status !== 'PAID' && run.status !== 'APPROVED') {
      return NextResponse.json({ error: 'Pay run cannot be reversed in its current state' }, { status: 400 });
    }

    // 2. Get all included payslips
    const payslips = await db.prepare(`
      SELECT ps.*, p.vacation_rate, p.vacation_pay_method, p.type as person_type
      FROM payslip ps
      JOIN payroll_person p ON ps.person_id = p.id
      WHERE ps.pay_run_id = ? AND ps.included = true
    `).all(params.runId);

    // 3. Rollback in a transaction
    const reverseTransaction = db.transaction(async (txDb) => {
      // 3.1 Subtract values from YTD balances
      for (const slip of payslips) {
        const vacRate = slip.vacation_rate || 4;
        const earnings = (slip.regular_pay || 0) + (slip.overtime_pay || 0) + (slip.other_income || 0);
        const vacAccrued = slip.vacation_pay_method === 'accrue' ? (earnings * vacRate) / 100 : 0;
        const vacPaid = slip.vacation_pay || 0;

        if (slip.person_type === 'Contractor') {
          await txDb.prepare(`
            UPDATE ytd_balance
            SET gross_pay = gross_pay - ?,
                insurable_earnings = insurable_earnings - ?
            WHERE person_id = ? AND tax_year = ?
          `).run(slip.gross_pay, slip.gross_pay, slip.person_id, run.rate_table_year || 2026);
        } else {
          await txDb.prepare(`
            UPDATE ytd_balance
            SET gross_pay = gross_pay - ?,
                pensionable_earnings = pensionable_earnings - ?,
                insurable_earnings = insurable_earnings - ?,
                federal_tax = federal_tax - ?,
                provincial_tax = provincial_tax - ?,
                cpp_contribution = cpp_contribution - ?,
                cpp2_contribution = cpp2_contribution - ?,
                ei_premium = ei_premium - ?,
                employer_cpp = employer_cpp - ?,
                employer_cpp2 = employer_cpp2 - ?,
                employer_ei = employer_ei - ?,
                vacation_accrued = vacation_accrued - ?,
                vacation_paid = vacation_paid - ?
            WHERE person_id = ? AND tax_year = ?
          `).run(
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

      // 3.2 Remove remittance record
      await txDb.prepare(`DELETE FROM remittance WHERE pay_run_id = ?`).run(params.runId);

      // 3.3 Remove/Rollback Ledgerflow entries
      const ledger = await txDb.prepare(`
        SELECT id FROM ledgers 
        WHERE client_id = ? OR client_id = 'FIRM' 
        LIMIT 1
      `).get(params.clientId);

      if (ledger) {
        const ledgerId = ledger.id;
        const ref = `PR-${params.runId.substring(0, 8)}`;

        // Find transaction
        const tx = await txDb.prepare(`
          SELECT id FROM ledger_transactions 
          WHERE ledger_id = ? AND reference = ?
          LIMIT 1
        `).get(ledgerId, ref);

        if (tx) {
          // Delete journal entries
          await txDb.prepare(`DELETE FROM ledger_journal_entries WHERE transaction_id = ?`).run(tx.id);
          // Delete transaction
          await txDb.prepare(`DELETE FROM ledger_transactions WHERE id = ?`).run(tx.id);
        }

        // Find System B payroll
        const systemBPayroll = await txDb.prepare(`
          SELECT id FROM ledger_payroll
          WHERE ledger_id = ? AND period_start = ? AND period_end = ?
          LIMIT 1
        `).get(ledgerId, run.period_start, run.period_end);

        if (systemBPayroll) {
          // Delete System B payslips
          await txDb.prepare(`DELETE FROM ledger_payslips WHERE payroll_id = ?`).run(systemBPayroll.id);
          // Delete System B payroll
          await txDb.prepare(`DELETE FROM ledger_payroll WHERE id = ?`).run(systemBPayroll.id);
        }
      }

      // 3.4 Update status to REVERSED
      await txDb.prepare(`
        UPDATE pay_run
        SET status = 'REVERSED',
            reversed_at = CURRENT_TIMESTAMP,
            reversed_by = 'firm-admin-uuid',
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(params.runId);
    });

    await reverseTransaction();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error reversing payroll:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
