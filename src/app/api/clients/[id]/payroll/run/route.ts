import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSessionContext } from '@/lib/auth-context';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = getSessionContext();
    if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { orgId } = session;
    const resolvedParams = await params;
    const body = await req.json();

    const db = getDb();
    const ledger = await db.prepare('SELECT id FROM ledgers WHERE org_id = ? AND (client_id = ? OR client_id = ?)').get(orgId, resolvedParams.id, 'FIRM') as { id: string };
    if (!ledger) return NextResponse.json({ error: 'Ledger not found' }, { status: 404 });

    const employees = await db.prepare('SELECT * FROM ledger_employees WHERE ledger_id = ? AND status = ?').all(ledger.id, 'active') as any[];
    if (employees.length === 0) return NextResponse.json({ error: 'No active employees to run payroll for.' }, { status: 400 });

    const payrollId = uuidv4();
    let totalGross = 0;
    let totalNet = 0;
    let totalCPP = 0;
    let totalEI = 0;
    let totalTax = 0;

    // We'll wrap this in a transaction via a simple loop for now, since better-sqlite3 supports transaction methods
    // but we can just execute sequentially for the prototype.
    
    for (const emp of employees) {
      // Simplified estimation: Gross is Monthly pay (Annual / 12)
      // Assuming all employees are monthly for this prototype
      const gross = emp.pay_rate / 12;
      
      // Basic 2026 CRA Estimations (mocked)
      // CPP: ~5.95% up to maximum
      // EI: ~1.63% up to maximum
      // Tax: ~15% Federal + Provincial avg
      const cpp = gross * 0.0595;
      const ei = gross * 0.0163;
      const tax = gross * 0.15;
      
      const net = gross - cpp - ei - tax;
      
      totalGross += gross;
      totalCPP += cpp;
      totalEI += ei;
      totalTax += tax;
      totalNet += net;

      await db.prepare(`
        INSERT INTO ledger_payslips (id, org_id, ledger_id, payroll_id, employee_id, gross_pay, tax_deduction, cpp_deduction, ei_deduction, net_pay, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(uuidv4(), orgId, ledger.id, payrollId, emp.id, gross, tax, cpp, ei, net, 'posted');
    }

    await db.prepare(`
      INSERT INTO ledger_payroll (id, org_id, ledger_id, run_date, period_start, period_end, total_gross, total_net, deductions_json, liabilities_json, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      payrollId, orgId, ledger.id, body.run_date, body.period_start, body.period_end, 
      totalGross, totalNet, 
      JSON.stringify({ cpp: totalCPP, ei: totalEI, tax: totalTax }),
      JSON.stringify({ cpp_payable: totalCPP, ei_payable: totalEI, tax_payable: totalTax }),
      'posted'
    );

    // Create automated Journal Entry for the Payroll
    // Debit Payroll Expense (totalGross)
    // Credit Bank (totalNet)
    // Credit Payroll Liabilities (totalCPP + totalEI + totalTax)
    
    const jeId = uuidv4();
    const reference = `Payroll Run: ${body.period_start} to ${body.period_end}`;
    
    await db.prepare(`
      INSERT INTO ledger_journal_entries (id, org_id, ledger_id, entry_date, reference, description, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(jeId, orgId, ledger.id, body.run_date, `PR-${payrollId.substring(0,6)}`, reference, 'posted');

    // To post actual line items, we'd need account IDs. For the prototype, we assume the user will map these later 
    // or we can just leave it as a high-level summary that the JE is posted!
    // We will simulate it by doing nothing to the lines for now, or you'd need predefined Chart of Account UUIDs.
    
    return NextResponse.json({ success: true, payroll_id: payrollId });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
