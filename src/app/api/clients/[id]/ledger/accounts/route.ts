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

    const accounts = await db.prepare('SELECT * FROM ledger_accounts WHERE ledger_id = ? AND org_id = ? AND is_active = 1 ORDER BY type, name').all(ledger.id, orgId);

    // Calculate balances
    for (const acc of accounts) {
      const balResult = await db.prepare(`
        SELECT SUM(debit) as debits, SUM(credit) as credits 
        FROM ledger_journal_entries 
        WHERE account_id = ? AND org_id = ?
      `).get(acc.id, orgId) as any;
      
      const debits = balResult?.debits || 0;
      const credits = balResult?.credits || 0;
      
      if (acc.type === 'asset' || acc.type === 'expense') {
        acc.balance = debits - credits;
      } else {
        acc.balance = credits - debits;
      }
    }

    return NextResponse.json({ accounts });
  } catch (error) {
    console.error('Ledger accounts error:', error);
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
    const accountId = uuidv4();

    await db.prepare(`
      INSERT INTO ledger_accounts (id, org_id, ledger_id, account_code, name, type, subtype, description) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(accountId, orgId, ledger.id, body.account_code || null, body.name, body.type, body.subtype || null, body.description || null);

    return NextResponse.json({ success: true, id: accountId });
  } catch (error) {
    console.error('Ledger accounts error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
