import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSessionContext } from '@/lib/auth-context';
import { v4 as uuidv4 } from 'uuid';
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

    const transactions = await db.prepare(`
      SELECT * FROM ledger_transactions 
      WHERE ledger_id = ? AND org_id = ? 
      ORDER BY date DESC 
      LIMIT 100
    `).all(ledger.id, orgId);

    // Fetch associated journal entries
    for (const txn of transactions) {
      txn.entries = await db.prepare(`
        SELECT je.*, a.name as account_name, a.type as account_type 
        FROM ledger_journal_entries je
        JOIN ledger_accounts a ON je.account_id = a.id
        WHERE je.transaction_id = ? AND je.org_id = ?
      `).all(txn.id, orgId);
    }

    return NextResponse.json({ transactions });
  } catch (error) {
    console.error('Ledger transactions GET error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = getSessionContext();
    if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { orgId } = session;
    const { id: client_id } = await params;

    const db = getDb();
    const ledger = await db.prepare('SELECT id FROM ledgers WHERE client_id = ? AND org_id = ?').get(client_id, orgId) as any;
    if (!ledger) return NextResponse.json({ error: 'Ledger not found' }, { status: 404 });

    const body = await req.json();
    const { date, description, type, status, amount, reference, entries } = body;

    if (!date || amount === undefined) {
      return NextResponse.json({ error: 'date and amount are required' }, { status: 400 });
    }

    const transactionStatus = status || 'pending';

    await (db.transaction(async (txDb: any) => {
      const txnId = uuidv4();

      if (entries && Array.isArray(entries) && entries.length > 0) {
        // Enforce debit = credit validation
        const totalDebit = entries.reduce((s, e) => s + (parseFloat(e.debit || 0)), 0);
        const totalCredit = entries.reduce((s, e) => s + (parseFloat(e.credit || 0)), 0);
        if (Math.abs(totalDebit - totalCredit) > 0.01) {
          throw new Error(`Unbalanced journal entries: debits (${totalDebit}) != credits (${totalCredit})`);
        }

        await txDb.prepare(`
          INSERT INTO ledger_transactions (id, org_id, ledger_id, date, description, type, status, amount, reference, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
        `).run(txnId, orgId, ledger.id, date, description || '', type || 'deposit', 'categorized', parseFloat(amount), reference || null);

        for (const entry of entries) {
          await txDb.prepare(`
            INSERT INTO ledger_journal_entries (id, org_id, transaction_id, account_id, debit, credit, memo, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
          `).run(uuidv4(), orgId, txnId, entry.account_id, parseFloat(entry.debit || 0), parseFloat(entry.credit || 0), entry.memo || null);
        }
      } else {
        // Just create a transaction without entries (e.g. pending transaction from bank statement)
        await txDb.prepare(`
          INSERT INTO ledger_transactions (id, org_id, ledger_id, date, description, type, status, amount, reference, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
        `).run(txnId, orgId, ledger.id, date, description || '', type || 'deposit', transactionStatus, parseFloat(amount), reference || null);
      }
    }))();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Ledger transactions POST error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
