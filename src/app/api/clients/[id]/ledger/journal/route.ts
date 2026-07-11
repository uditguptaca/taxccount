import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSessionContext } from '@/lib/auth-context';
import { createJournalEntries } from '@/lib/accounting';

export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = getSessionContext();
    if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { orgId } = session;
    const { id: client_id } = await params;

    const db = getDb();
    const ledger = await db.prepare('SELECT id FROM ledgers WHERE client_id = ? AND org_id = ?').get(client_id, orgId) as any;
    if (!ledger) return NextResponse.json({ error: 'Ledger not found' }, { status: 404 });

    // Optional date range filtering
    const { searchParams } = new URL(req.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    let dateFilter = '';
    const queryParams: any[] = [ledger.id, orgId];

    if (from) {
      dateFilter += ' AND t.date >= ?';
      queryParams.push(from);
    }
    if (to) {
      dateFilter += ' AND t.date <= ?';
      queryParams.push(to);
    }

    // Get all transactions with their journal entries + account names in one query
    const rows = await db.prepare(`
      SELECT 
        t.id as transaction_id,
        t.date,
        t.description as transaction_description,
        t.type as transaction_type,
        t.status as transaction_status,
        t.amount as transaction_amount,
        t.created_at as transaction_created_at,
        je.id as entry_id,
        je.account_id,
        je.debit,
        je.credit,
        je.memo,
        a.name as account_name,
        a.type as account_type,
        a.account_code
      FROM ledger_transactions t
      LEFT JOIN ledger_journal_entries je ON je.transaction_id = t.id AND je.org_id = t.org_id
      LEFT JOIN ledger_accounts a ON a.id = je.account_id
      WHERE t.ledger_id = ? AND t.org_id = ?${dateFilter}
      ORDER BY t.date DESC, t.created_at DESC, je.debit DESC
    `).all(...queryParams);

    // Group by transaction
    const transactionsMap = new Map<string, any>();
    for (const row of rows) {
      if (!transactionsMap.has(row.transaction_id)) {
        transactionsMap.set(row.transaction_id, {
          id: row.transaction_id,
          date: row.date,
          description: row.transaction_description,
          type: row.transaction_type,
          status: row.transaction_status,
          amount: row.transaction_amount,
          created_at: row.transaction_created_at,
          entries: [],
        });
      }
      if (row.entry_id) {
        transactionsMap.get(row.transaction_id).entries.push({
          id: row.entry_id,
          account_id: row.account_id,
          account_name: row.account_name,
          account_type: row.account_type,
          account_code: row.account_code,
          debit: parseFloat(row.debit) || 0,
          credit: parseFloat(row.credit) || 0,
          memo: row.memo,
        });
      }
    }

    const transactions = Array.from(transactionsMap.values());
    return NextResponse.json({ transactions });
  } catch (error) {
    console.error('Journal GET error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = getSessionContext();
    if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { orgId } = session;
    const { id: client_id } = await params;
    const body = await req.json();
    const { date, description, entries } = body; // entries: [{ account_id, debit, credit, memo? }]

    if (!date || !entries || entries.length < 2) {
      return NextResponse.json({ error: 'Invalid journal entry: date and at least 2 entries required' }, { status: 400 });
    }

    const db = getDb();
    const ledger = await db.prepare('SELECT id FROM ledgers WHERE client_id = ? AND org_id = ?').get(client_id, orgId) as any;
    if (!ledger) return NextResponse.json({ error: 'Ledger not found' }, { status: 404 });

    // Validate entries
    for (const e of entries) {
      const debit = parseFloat(e.debit || 0);
      const credit = parseFloat(e.credit || 0);

      if (debit < 0 || credit < 0) {
        return NextResponse.json({ error: 'Debit and credit values cannot be negative' }, { status: 400 });
      }
      if (!e.account_id) {
        return NextResponse.json({ error: 'Each entry must have an account_id' }, { status: 400 });
      }

      // Validate account exists
      const account = await db.prepare(
        'SELECT id FROM ledger_accounts WHERE id = ? AND ledger_id = ? AND org_id = ? AND is_active = 1'
      ).get(e.account_id, ledger.id, orgId) as any;
      if (!account) {
        return NextResponse.json({ error: `Account ${e.account_id} not found or inactive` }, { status: 400 });
      }
    }

    // Validate debits == credits
    const totalDebit = entries.reduce((s: number, e: any) => s + (parseFloat(e.debit || 0)), 0);
    const totalCredit = entries.reduce((s: number, e: any) => s + (parseFloat(e.credit || 0)), 0);
    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      return NextResponse.json({ error: 'Debits must equal credits' }, { status: 400 });
    }

    // Normalize entries
    const normalizedEntries = entries.map((e: any) => ({
      account_id: e.account_id,
      debit: parseFloat(e.debit || 0),
      credit: parseFloat(e.credit || 0),
      memo: e.memo || undefined,
    }));

    const txnId = await (db.transaction(async (txDb: any) => {
      return createJournalEntries(txDb, ledger.id, orgId, date, description || '', normalizedEntries, 'manual_journal');
    }))();

    return NextResponse.json({ success: true, transaction_id: txnId });
  } catch (error) {
    console.error('Manual journal POST error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
