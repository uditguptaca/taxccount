import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSessionContext } from '@/lib/auth-context';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

const VALID_ACCOUNT_TYPES = ['asset', 'liability', 'equity', 'revenue', 'expense'];

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = getSessionContext();
    if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { orgId } = session;
    const { id: client_id } = await params;

    const db = getDb();
    const ledger = await db.prepare('SELECT id FROM ledgers WHERE client_id = ? AND org_id = ?').get(client_id, orgId) as any;
    if (!ledger) return NextResponse.json({ error: 'Ledger not found' }, { status: 404 });

    // Single query with LEFT JOIN — no N+1
    const accounts = await db.prepare(`
      SELECT 
        a.*,
        COALESCE(SUM(je.debit), 0) as total_debits,
        COALESCE(SUM(je.credit), 0) as total_credits
      FROM ledger_accounts a
      LEFT JOIN ledger_journal_entries je ON je.account_id = a.id AND je.org_id = a.org_id
      WHERE a.ledger_id = ? AND a.org_id = ? AND a.is_active = 1
      GROUP BY a.id
      ORDER BY a.type, a.name
    `).all(ledger.id, orgId);

    // Compute balance based on normal balance rules
    for (const acc of accounts) {
      const debits = parseFloat(acc.total_debits) || 0;
      const credits = parseFloat(acc.total_credits) || 0;
      if (acc.type === 'asset' || acc.type === 'expense') {
        acc.balance = debits - credits;
      } else {
        // liability, equity, revenue: credit normal balance
        acc.balance = credits - debits;
      }
    }

    return NextResponse.json({ accounts });
  } catch (error) {
    console.error('Ledger accounts GET error:', error);
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

    // Validate required fields
    if (!body.name || !body.name.trim()) {
      return NextResponse.json({ error: 'Account name is required' }, { status: 400 });
    }
    if (!body.type || !VALID_ACCOUNT_TYPES.includes(body.type)) {
      return NextResponse.json({ error: `Account type must be one of: ${VALID_ACCOUNT_TYPES.join(', ')}` }, { status: 400 });
    }

    const accountId = uuidv4();
    await db.prepare(`
      INSERT INTO ledger_accounts (id, org_id, ledger_id, account_code, name, type, subtype, description, is_active, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, NOW(), NOW())
    `).run(accountId, orgId, ledger.id, body.account_code || null, body.name.trim(), body.type, body.subtype || null, body.description || null);

    return NextResponse.json({ success: true, id: accountId });
  } catch (error) {
    console.error('Ledger accounts POST error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = getSessionContext();
    if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { orgId } = session;
    const { id: client_id } = await params;

    const db = getDb();
    const ledger = await db.prepare('SELECT id FROM ledgers WHERE client_id = ? AND org_id = ?').get(client_id, orgId) as any;
    if (!ledger) return NextResponse.json({ error: 'Ledger not found' }, { status: 404 });

    const body = await req.json();
    const { account_id, name, type, subtype } = body;

    if (!account_id) {
      return NextResponse.json({ error: 'account_id is required' }, { status: 400 });
    }

    // Fetch existing account
    const account = await db.prepare(
      'SELECT * FROM ledger_accounts WHERE id = ? AND ledger_id = ? AND org_id = ?'
    ).get(account_id, ledger.id, orgId) as any;
    if (!account) return NextResponse.json({ error: 'Account not found' }, { status: 404 });

    // Don't allow changing system accounts
    if (account.is_system) {
      return NextResponse.json({ error: 'Cannot modify system accounts' }, { status: 403 });
    }

    // Validate type if provided
    if (type && !VALID_ACCOUNT_TYPES.includes(type)) {
      return NextResponse.json({ error: `Account type must be one of: ${VALID_ACCOUNT_TYPES.join(', ')}` }, { status: 400 });
    }

    await db.prepare(`
      UPDATE ledger_accounts 
      SET name = COALESCE(?, name), type = COALESCE(?, type), subtype = COALESCE(?, subtype), updated_at = NOW()
      WHERE id = ? AND ledger_id = ? AND org_id = ?
    `).run(name || null, type || null, subtype !== undefined ? subtype : null, account_id, ledger.id, orgId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Ledger accounts PUT error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = getSessionContext();
    if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { orgId } = session;
    const { id: client_id } = await params;

    const db = getDb();
    const ledger = await db.prepare('SELECT id FROM ledgers WHERE client_id = ? AND org_id = ?').get(client_id, orgId) as any;
    if (!ledger) return NextResponse.json({ error: 'Ledger not found' }, { status: 404 });

    const { searchParams } = new URL(req.url);
    const account_id = searchParams.get('account_id');
    if (!account_id) {
      return NextResponse.json({ error: 'account_id query param is required' }, { status: 400 });
    }

    // Fetch existing account
    const account = await db.prepare(
      'SELECT * FROM ledger_accounts WHERE id = ? AND ledger_id = ? AND org_id = ?'
    ).get(account_id, ledger.id, orgId) as any;
    if (!account) return NextResponse.json({ error: 'Account not found' }, { status: 404 });

    // Don't allow deleting system accounts
    if (account.is_system) {
      return NextResponse.json({ error: 'Cannot delete system accounts' }, { status: 403 });
    }

    // Don't allow deleting accounts with journal entries
    const entryCount = await db.prepare(
      'SELECT COUNT(*) as cnt FROM ledger_journal_entries WHERE account_id = ? AND org_id = ?'
    ).get(account_id, orgId) as any;
    if (entryCount && parseInt(entryCount.cnt) > 0) {
      return NextResponse.json({ error: 'Cannot delete account with existing journal entries' }, { status: 400 });
    }

    // Soft-delete
    await db.prepare(
      "UPDATE ledger_accounts SET is_active = 0, updated_at = NOW() WHERE id = ? AND ledger_id = ? AND org_id = ?"
    ).run(account_id, ledger.id, orgId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Ledger accounts DELETE error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
