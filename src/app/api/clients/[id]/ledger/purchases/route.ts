import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSessionContext } from '@/lib/auth-context';
import { v4 as uuidv4 } from 'uuid';
import { createJournalEntries, getAccountBySubtype } from '@/lib/accounting';

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
    const ledger = await db.prepare('SELECT id FROM ledgers WHERE client_id = ? AND org_id = ?').get(client_id, orgId) as any;
    if (!ledger) return NextResponse.json({ error: 'Ledger not found' }, { status: 404 });

    const payload = body.data || body;

    if (type === 'vendor') {
      const { name, email, phone, billing_address } = payload;
      if (!name || !name.trim()) {
        return NextResponse.json({ error: 'Vendor name is required' }, { status: 400 });
      }
      const id = uuidv4();
      await db.prepare(`
        INSERT INTO ledger_vendors (id, org_id, ledger_id, name, email, phone, billing_address)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(id, orgId, ledger.id, name.trim(), email || null, phone || null, billing_address || null);
      return NextResponse.json({ success: true, id });
    }

    if (type === 'bill') {
      const { vendor_id, bill_number, date, due_date, tax_rate, lines } = payload;
      if (!vendor_id || !bill_number || !lines || lines.length === 0) {
        return NextResponse.json({ error: 'vendor_id, bill_number, and lines are required' }, { status: 400 });
      }

      const id = uuidv4();
      
      const subtotal = lines.reduce((s: number, l: any) => s + (parseFloat(l.quantity || 0) * parseFloat(l.unit_price || 0)), 0);
      const taxRateNum = parseFloat(tax_rate || 0);
      const tax_amount = Math.round(subtotal * (taxRateNum / 100) * 100) / 100;
      const total_amount = subtotal + tax_amount;

      await (db.transaction(async (txDb: any) => {
        // Insert Bill
        await txDb.prepare(`
          INSERT INTO ledger_bills (id, org_id, ledger_id, vendor_id, bill_number, issue_date, due_date, subtotal, tax_amount, total_amount, amount_paid, status, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 'sent', datetime('now'), datetime('now'))
        `).run(id, orgId, ledger.id, vendor_id, bill_number, date, due_date, subtotal, tax_amount, total_amount);

        // Insert Bill Lines
        for (const line of lines) {
          const lineAmount = parseFloat(line.quantity || 0) * parseFloat(line.unit_price || 0);
          await txDb.prepare(`
            INSERT INTO ledger_bill_lines (id, org_id, bill_id, account_id, description, quantity, unit_price, amount)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `).run(uuidv4(), orgId, id, line.account_id, line.description || '', parseFloat(line.quantity), parseFloat(line.unit_price), lineAmount);
        }

        // CREATE JOURNAL ENTRIES
        const apAccount = await getAccountBySubtype(txDb, ledger.id, 'payable');
        const taxAccount = await getAccountBySubtype(txDb, ledger.id, 'tax');
        
        if (!apAccount) {
          throw new Error('Default Accounts Payable account is missing. Please check your Chart of Accounts.');
        }

        const journalLines = [];

        // 1. Credit Accounts Payable
        journalLines.push({
          account_id: apAccount.id,
          debit: 0,
          credit: total_amount,
          memo: `Bill ${bill_number}`
        });

        // 2. Debit Expense accounts for each line
        for (const line of lines) {
          const lineAmount = parseFloat(line.quantity || 0) * parseFloat(line.unit_price || 0);
          journalLines.push({
            account_id: line.account_id,
            debit: lineAmount,
            credit: 0,
            memo: line.description || `Bill line ${bill_number}`
          });
        }

        // 3. Debit Tax account if applicable
        if (tax_amount > 0) {
          if (!taxAccount) {
            throw new Error('Default GST/HST Payable account is missing but tax amount was specified.');
          }
          journalLines.push({
            account_id: taxAccount.id,
            debit: tax_amount,
            credit: 0,
            memo: `Tax for bill ${bill_number}`
          });
        }

        await createJournalEntries(txDb, ledger.id, orgId, date, `Bill ${bill_number} created`, journalLines, 'bill');
      }))();

      return NextResponse.json({ success: true, id });
    }

    if (type === 'bill_payment') {
      const { bill_id, payment_amount, date } = payload;
      if (!bill_id || !payment_amount) {
        return NextResponse.json({ error: 'bill_id and payment_amount are required' }, { status: 400 });
      }

      const bill = await db.prepare('SELECT * FROM ledger_bills WHERE id = ? AND ledger_id = ? AND org_id = ?').get(bill_id, ledger.id, orgId) as any;
      if (!bill) return NextResponse.json({ error: 'Bill not found' }, { status: 404 });

      const paymentVal = parseFloat(payment_amount);
      const currentPaid = parseFloat(bill.amount_paid || 0);
      const newPaid = currentPaid + paymentVal;
      const totalAmount = parseFloat(bill.total_amount || 0);
      const newStatus = newPaid >= totalAmount ? 'paid' : 'partially_paid';

      await (db.transaction(async (txDb: any) => {
        // Update Bill status
        await txDb.prepare('UPDATE ledger_bills SET amount_paid = ?, status = ?, updated_at = datetime(\'now\') WHERE id = ?').run(newPaid, newStatus, bill_id);

        // CREATE JOURNAL ENTRIES
        const bankAccount = await getAccountBySubtype(txDb, ledger.id, 'bank');
        const apAccount = await getAccountBySubtype(txDb, ledger.id, 'payable');

        if (!bankAccount || !apAccount) {
          throw new Error('Default Checking Account or Accounts Payable account is missing. Please check your Chart of Accounts.');
        }

        await createJournalEntries(txDb, ledger.id, orgId, date || new Date().toISOString().split('T')[0], `Payment to vendor for Bill ${bill.bill_number}`, [
          { account_id: apAccount.id, debit: paymentVal, credit: 0, memo: `Bill payment ${bill.bill_number}` },
          { account_id: bankAccount.id, debit: 0, credit: paymentVal, memo: `Bill payment ${bill.bill_number}` }
        ], 'bill_payment');
      }))();

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch (error: any) {
    console.error('Purchases route post error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
