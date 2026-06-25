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
    
    await (db.transaction(async (txDb: any) => {
      const txnId = uuidv4();
      await txDb.prepare(`
        INSERT INTO ledger_transactions (id, org_id, ledger_id, date, description, type, status, amount, reference)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(txnId, orgId, ledger.id, body.date, body.description, body.type || 'manual_journal', 'categorized', body.amount || 0, body.reference || null);

      if (body.entries && Array.isArray(body.entries)) {
        for (const entry of body.entries) {
          await txDb.prepare(`
            INSERT INTO ledger_journal_entries (id, org_id, transaction_id, account_id, debit, credit, memo)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `).run(uuidv4(), orgId, txnId, entry.account_id, entry.debit || 0, entry.credit || 0, entry.memo || null);
        }
      }
    }))();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Ledger transactions POST error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
