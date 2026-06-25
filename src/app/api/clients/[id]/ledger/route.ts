import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSessionContext } from '@/lib/auth-context';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = getSessionContext();
    if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { orgId } = session;
    const { id: client_id } = await params;

    const db = getDb();
    
    // Ensure ledger exists for this client
    let ledger = await db.prepare('SELECT * FROM ledgers WHERE client_id = ? AND org_id = ?').get(client_id, orgId);
    
    if (!ledger) {
      // Create ledger and default Chart of Accounts
      const ledgerId = uuidv4();
      await db.prepare('INSERT INTO ledgers (id, org_id, client_id) VALUES (?, ?, ?)').run(ledgerId, orgId, client_id);
      
      const defaultAccounts = [
        { name: 'Checking Account', type: 'asset', subtype: 'bank' },
        { name: 'Accounts Receivable', type: 'asset', subtype: 'receivable' },
        { name: 'Inventory', type: 'asset', subtype: 'inventory' },
        { name: 'Accounts Payable', type: 'liability', subtype: 'payable' },
        { name: 'GST/HST Payable', type: 'liability', subtype: 'tax' },
        { name: 'Owner Drawings', type: 'equity', subtype: 'drawings' },
        { name: 'Retained Earnings', type: 'equity', subtype: 'retained_earnings' },
        { name: 'Sales Revenue', type: 'revenue', subtype: 'sales' },
        { name: 'Rent Expense', type: 'expense', subtype: 'rent' },
        { name: 'Payroll Expense', type: 'expense', subtype: 'payroll' },
        { name: 'Office Supplies', type: 'expense', subtype: 'office' },
        { name: 'Bank Fees', type: 'expense', subtype: 'fees' },
      ];

      for (const acc of defaultAccounts) {
        await db.prepare(`
          INSERT INTO ledger_accounts (id, org_id, ledger_id, name, type, subtype, is_system) 
          VALUES (?, ?, ?, ?, ?, ?, 1)
        `).run(uuidv4(), orgId, ledgerId, acc.name, acc.type, acc.subtype);
      }
      
      ledger = await db.prepare('SELECT * FROM ledgers WHERE client_id = ? AND org_id = ?').get(client_id, orgId);
    }

    const ledger_id = ledger.id;

    // Fetch summary stats
    const totalRevenueResult = await db.prepare(`
      SELECT SUM(credit - debit) as total 
      FROM ledger_journal_entries je 
      JOIN ledger_accounts a ON je.account_id = a.id
      WHERE je.org_id = ? AND a.ledger_id = ? AND a.type = 'revenue'
    `).get(orgId, ledger_id) as any;
    
    const totalExpensesResult = await db.prepare(`
      SELECT SUM(debit - credit) as total 
      FROM ledger_journal_entries je 
      JOIN ledger_accounts a ON je.account_id = a.id
      WHERE je.org_id = ? AND a.ledger_id = ? AND a.type = 'expense'
    `).get(orgId, ledger_id) as any;

    const cashResult = await db.prepare(`
      SELECT SUM(debit - credit) as total 
      FROM ledger_journal_entries je 
      JOIN ledger_accounts a ON je.account_id = a.id
      WHERE je.org_id = ? AND a.ledger_id = ? AND a.subtype = 'bank'
    `).get(orgId, ledger_id) as any;

    const totalRevenue = totalRevenueResult?.total || 0;
    const totalExpenses = totalExpensesResult?.total || 0;
    const netProfit = totalRevenue - totalExpenses;
    const cashInBank = cashResult?.total || 0;

    return NextResponse.json({
      ledger,
      stats: {
        totalRevenue,
        totalExpenses,
        netProfit,
        cashInBank
      }
    });

  } catch (error) {
    console.error('Ledger dashboard error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
