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
    const { id: client_id } = await params;
    const body = await req.json();
    const { date, description, entries } = body; // entries: [{ account_id, debit, credit }]

    if (!date || !entries || entries.length < 2) {
      return NextResponse.json({ error: 'Invalid journal entry data' }, { status: 400 });
    }

    const db = getDb();
    const ledger = await db.prepare('SELECT id FROM ledgers WHERE client_id = ? AND org_id = ?').get(client_id, orgId);
    if (!ledger) return NextResponse.json({ error: 'Ledger not found' }, { status: 404 });

    // Validate debits == credits
    let totalDebit = 0;
    let totalCredit = 0;
    for (const e of entries) {
      totalDebit += parseFloat(e.debit || 0);
      totalCredit += parseFloat(e.credit || 0);
    }
    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      return NextResponse.json({ error: 'Debits must equal credits' }, { status: 400 });
    }

    db.transaction(() => {
      const txnId = uuidv4();
      db.prepare(`
        INSERT INTO ledger_transactions (id, org_id, ledger_id, date, description, type, status, amount)
        VALUES (?, ?, ?, ?, ?, 'manual_journal', 'categorized', ?)
      `).run(txnId, orgId, ledger.id, date, description, totalDebit);

      for (const e of entries) {
        db.prepare(`
          INSERT INTO ledger_journal_entries (id, org_id, transaction_id, account_id, debit, credit)
          VALUES (?, ?, ?, ?, ?, ?)
        `).run(uuidv4(), orgId, txnId, e.account_id, parseFloat(e.debit || 0), parseFloat(e.credit || 0));
      }
    })();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Manual journal error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
