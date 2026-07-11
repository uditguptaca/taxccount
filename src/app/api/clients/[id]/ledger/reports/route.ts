import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSessionContext } from '@/lib/auth-context';

export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = getSessionContext();
    if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { orgId } = session;
    const { id: client_id } = await params;

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type'); // trial-balance, profit-loss, balance-sheet, general-ledger

    const db = getDb();
    const ledger = await db.prepare('SELECT id FROM ledgers WHERE client_id = ? AND org_id = ?').get(client_id, orgId) as any;
    if (!ledger) return NextResponse.json({ error: 'Ledger not found' }, { status: 404 });

    if (type === 'trial-balance') {
      const asOf = searchParams.get('as_of') || new Date().toISOString().split('T')[0];
      
      const rows = await db.prepare(`
        SELECT 
          a.id, a.name, a.type, a.account_code, a.subtype,
          COALESCE(SUM(je.debit), 0) as total_debit,
          COALESCE(SUM(je.credit), 0) as total_credit
        FROM ledger_accounts a
        LEFT JOIN ledger_journal_entries je ON je.account_id = a.id AND je.org_id = a.org_id
        LEFT JOIN ledger_transactions t ON je.transaction_id = t.id AND t.org_id = je.org_id
        WHERE a.ledger_id = ? AND a.org_id = ? AND a.is_active = 1
          AND (t.date <= ? OR t.date IS NULL)
        GROUP BY a.id
        ORDER BY a.type, a.account_code, a.name
      `).all(ledger.id, orgId, asOf);

      const accounts = rows.map((r: any) => {
        const debit = parseFloat(r.total_debit) || 0;
        const credit = parseFloat(r.total_credit) || 0;
        let balance = 0;
        let displayDebit = 0;
        let displayCredit = 0;

        if (r.type === 'asset' || r.type === 'expense') {
          balance = debit - credit;
          if (balance >= 0) displayDebit = balance;
          else displayCredit = Math.abs(balance);
        } else {
          balance = credit - debit;
          if (balance >= 0) displayCredit = balance;
          else displayDebit = Math.abs(balance);
        }

        return {
          id: r.id,
          name: r.name,
          type: r.type,
          account_code: r.account_code,
          debit: displayDebit,
          credit: displayCredit,
          balance
        };
      });

      const totalDebit = accounts.reduce((s, a) => s + a.debit, 0);
      const totalCredit = accounts.reduce((s, a) => s + a.credit, 0);
      const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

      return NextResponse.json({
        report_type: 'trial-balance',
        as_of: asOf,
        accounts,
        total_debit: totalDebit,
        total_credit: totalCredit,
        is_balanced: isBalanced
      });
    }

    if (type === 'profit-loss') {
      const from = searchParams.get('from') || new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0]; // Jan 1st
      const to = searchParams.get('to') || new Date().toISOString().split('T')[0];

      const rows = await db.prepare(`
        SELECT 
          a.id, a.name, a.type, a.account_code,
          COALESCE(SUM(je.debit), 0) as total_debit,
          COALESCE(SUM(je.credit), 0) as total_credit
        FROM ledger_accounts a
        JOIN ledger_journal_entries je ON je.account_id = a.id AND je.org_id = a.org_id
        JOIN ledger_transactions t ON je.transaction_id = t.id AND t.org_id = je.org_id
        WHERE a.ledger_id = ? AND a.org_id = ? AND a.is_active = 1
          AND t.date >= ? AND t.date <= ?
          AND a.type IN ('revenue', 'expense')
        GROUP BY a.id
        ORDER BY a.type, a.name
      `).all(ledger.id, orgId, from, to);

      const revenue = [];
      const expenses = [];

      for (const r of rows) {
        const debit = parseFloat(r.total_debit) || 0;
        const credit = parseFloat(r.total_credit) || 0;
        if (r.type === 'revenue') {
          revenue.push({ id: r.id, name: r.name, code: r.account_code, amount: credit - debit });
        } else {
          expenses.push({ id: r.id, name: r.name, code: r.account_code, amount: debit - credit });
        }
      }

      const totalRevenue = revenue.reduce((s, r) => s + r.amount, 0);
      const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
      const netIncome = totalRevenue - totalExpenses;

      return NextResponse.json({
        report_type: 'profit-loss',
        from,
        to,
        revenue,
        expenses,
        total_revenue: totalRevenue,
        total_expenses: totalExpenses,
        net_income: netIncome
      });
    }

    if (type === 'balance-sheet') {
      const asOf = searchParams.get('as_of') || new Date().toISOString().split('T')[0];

      const rows = await db.prepare(`
        SELECT 
          a.id, a.name, a.type, a.account_code,
          COALESCE(SUM(je.debit), 0) as total_debit,
          COALESCE(SUM(je.credit), 0) as total_credit
        FROM ledger_accounts a
        LEFT JOIN ledger_journal_entries je ON je.account_id = a.id AND je.org_id = a.org_id
        LEFT JOIN ledger_transactions t ON je.transaction_id = t.id AND t.org_id = je.org_id
        WHERE a.ledger_id = ? AND a.org_id = ? AND a.is_active = 1
          AND (t.date <= ? OR t.date IS NULL)
        GROUP BY a.id
        ORDER BY a.type, a.name
      `).all(ledger.id, orgId, asOf);

      const assets = [];
      const liabilities = [];
      const equity = [];

      // Also compute Net Income up to the asOf date to balance the sheet
      let totalRevenue = 0;
      let totalExpense = 0;

      for (const r of rows) {
        const debit = parseFloat(r.total_debit) || 0;
        const credit = parseFloat(r.total_credit) || 0;

        if (r.type === 'asset') {
          assets.push({ id: r.id, name: r.name, code: r.account_code, amount: debit - credit });
        } else if (r.type === 'liability') {
          liabilities.push({ id: r.id, name: r.name, code: r.account_code, amount: credit - debit });
        } else if (r.type === 'equity') {
          equity.push({ id: r.id, name: r.name, code: r.account_code, amount: credit - debit });
        } else if (r.type === 'revenue') {
          totalRevenue += (credit - debit);
        } else if (r.type === 'expense') {
          totalExpense += (debit - credit);
        }
      }

      const netIncome = totalRevenue - totalExpense;
      equity.push({ id: 'net-income-retained', name: 'Net Income / Retained Earnings (YTD)', code: '', amount: netIncome });

      const totalAssets = assets.reduce((s, a) => s + a.amount, 0);
      const totalLiabilities = liabilities.reduce((s, l) => s + l.amount, 0);
      const totalEquity = equity.reduce((s, e) => s + e.amount, 0);

      return NextResponse.json({
        report_type: 'balance-sheet',
        as_of: asOf,
        assets,
        liabilities,
        equity,
        total_assets: totalAssets,
        total_liabilities: totalLiabilities,
        total_equity: totalEquity,
        total_liabilities_equity: totalLiabilities + totalEquity
      });
    }

    if (type === 'general-ledger') {
      const from = searchParams.get('from') || new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0];
      const to = searchParams.get('to') || new Date().toISOString().split('T')[0];
      const accountId = searchParams.get('account_id');

      let accountFilter = '';
      const paramsList: any[] = [ledger.id, orgId];

      if (accountId && accountId !== 'all') {
        accountFilter = ' AND a.id = ?';
        paramsList.push(accountId);
      }

      // 1. Get Accounts list
      const accounts = await db.prepare(`
        SELECT id, name, type, account_code 
        FROM ledger_accounts a
        WHERE ledger_id = ? AND org_id = ? AND is_active = 1 ${accountFilter}
        ORDER BY type, name
      `).all(...paramsList);

      const result = [];

      for (const acc of accounts) {
        // Calculate opening balance (debits - credits prior to "from" date)
        const openingRows = await db.prepare(`
          SELECT 
            COALESCE(SUM(je.debit), 0) as total_debit,
            COALESCE(SUM(je.credit), 0) as total_credit
          FROM ledger_journal_entries je
          JOIN ledger_transactions t ON je.transaction_id = t.id AND t.org_id = je.org_id
          WHERE je.account_id = ? AND je.org_id = ? AND t.date < ?
        `).get(acc.id, orgId, from) as any;

        const opDebit = parseFloat(openingRows?.total_debit || 0);
        const opCredit = parseFloat(openingRows?.total_credit || 0);
        let openingBalance = 0;
        if (acc.type === 'asset' || acc.type === 'expense') {
          openingBalance = opDebit - opCredit;
        } else {
          openingBalance = opCredit - opDebit;
        }

        // Get journal entries within date range
        const entries = await db.prepare(`
          SELECT 
            t.date, t.description, t.type as txn_type,
            je.debit, je.credit, je.memo
          FROM ledger_journal_entries je
          JOIN ledger_transactions t ON je.transaction_id = t.id AND t.org_id = je.org_id
          WHERE je.account_id = ? AND je.org_id = ? AND t.date >= ? AND t.date <= ?
          ORDER BY t.date ASC, t.created_at ASC
        `).all(acc.id, orgId, from, to);

        let runningBalance = openingBalance;
        const mappedEntries = entries.map((e: any) => {
          const debit = parseFloat(e.debit) || 0;
          const credit = parseFloat(e.credit) || 0;
          if (acc.type === 'asset' || acc.type === 'expense') {
            runningBalance += (debit - credit);
          } else {
            runningBalance += (credit - debit);
          }
          return {
            date: e.date,
            description: e.description,
            txn_type: e.txn_type,
            debit,
            credit,
            memo: e.memo,
            balance: runningBalance
          };
        });

        result.push({
          account_id: acc.id,
          account_name: acc.name,
          account_code: acc.account_code,
          account_type: acc.type,
          opening_balance: openingBalance,
          entries: mappedEntries,
          closing_balance: runningBalance
        });
      }

      return NextResponse.json({
        report_type: 'general-ledger',
        from,
        to,
        accounts: result
      });
    }

    return NextResponse.json({ error: 'Invalid or missing type parameter' }, { status: 400 });
  } catch (error) {
    console.error('Reports endpoint error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
