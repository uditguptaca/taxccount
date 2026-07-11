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
    const ledger = await db.prepare('SELECT id FROM ledgers WHERE client_id = ? AND org_id = ?').get(client_id, orgId);
    if (!ledger) return NextResponse.json({ error: 'Ledger not found' }, { status: 404 });

    const vendors = await db.prepare('SELECT * FROM ledger_vendors WHERE ledger_id = ? AND org_id = ? ORDER BY name ASC').all(ledger.id, orgId);
    const bills = await db.prepare(`
      SELECT b.*, v.name as vendor_name 
      FROM ledger_bills b 
      LEFT JOIN ledger_vendors v ON b.vendor_id = v.id
      WHERE b.ledger_id = ? AND b.org_id = ? 
      ORDER BY b.created_at DESC
    `).all(ledger.id, orgId);

    return NextResponse.json({ vendors, bills });
  } catch (error) {
    console.error('Purchases route error:', error);
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
    const { type } = body; 

    const db = getDb();
    const ledger = await db.prepare('SELECT id FROM ledgers WHERE client_id = ? AND org_id = ?').get(client_id, orgId);
    if (!ledger) return NextResponse.json({ error: 'Ledger not found' }, { status: 404 });

    if (type === 'vendor') {
      const { name, email, phone, billing_address } = body.data;
      const id = uuidv4();
      await db.prepare(`
        INSERT INTO ledger_vendors (id, org_id, ledger_id, name, email, phone, billing_address)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(id, orgId, ledger.id, name, email, phone, billing_address);
      return NextResponse.json({ id });
    }

    if (type === 'bill') {
      const { vendor_id, bill_number, issue_date, due_date, items } = body.data;
      const id = uuidv4();
      
      let total = 0;
      for (const it of items) total += (parseFloat(it.quantity) * parseFloat(it.unit_price));

      await (db.transaction(async (txDb: any) => {
        await txDb.prepare(`
          INSERT INTO ledger_bills (id, org_id, ledger_id, vendor_id, bill_number, issue_date, due_date, total_amount, subtotal)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(id, orgId, ledger.id, vendor_id, bill_number, issue_date, due_date, total, total);

        for (const it of items) {
          await txDb.prepare(`
            INSERT INTO ledger_bill_lines (id, org_id, bill_id, account_id, description, quantity, unit_price, amount)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `).run(uuidv4(), orgId, id, it.account_id, it.description, it.quantity, it.unit_price, (it.quantity * it.unit_price));
        }
      }))();
      return NextResponse.json({ id });
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch (error) {
    console.error('Purchases route post error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
