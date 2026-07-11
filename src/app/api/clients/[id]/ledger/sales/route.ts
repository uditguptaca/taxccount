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

    const customers = await db.prepare('SELECT * FROM ledger_customers WHERE ledger_id = ? AND org_id = ? ORDER BY name ASC').all(ledger.id, orgId);
    const invoices = await db.prepare(`
      SELECT i.*, c.name as customer_name 
      FROM ledger_invoices i 
      LEFT JOIN ledger_customers c ON i.customer_id = c.id
      WHERE i.ledger_id = ? AND i.org_id = ? 
      ORDER BY i.created_at DESC
    `).all(ledger.id, orgId);

    return NextResponse.json({ customers, invoices });
  } catch (error) {
    console.error('Sales route error:', error);
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

    if (type === 'customer') {
      const { name, email, phone, billing_address } = payload;
      if (!name || !name.trim()) {
        return NextResponse.json({ error: 'Customer name is required' }, { status: 400 });
      }
      const id = uuidv4();
      await db.prepare(`
        INSERT INTO ledger_customers (id, org_id, ledger_id, name, email, phone, billing_address)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(id, orgId, ledger.id, name.trim(), email || null, phone || null, billing_address || null);
      return NextResponse.json({ success: true, id });
    }

    if (type === 'invoice') {
      const { customer_id, invoice_number, date, due_date, tax_rate, lines } = payload;
      if (!customer_id || !invoice_number || !lines || lines.length === 0) {
        return NextResponse.json({ error: 'customer_id, invoice_number, and lines are required' }, { status: 400 });
      }

      const id = uuidv4();
      
      const subtotal = lines.reduce((s: number, l: any) => s + (parseFloat(l.quantity || 0) * parseFloat(l.unit_price || 0)), 0);
      const taxRateNum = parseFloat(tax_rate || 0);
      const tax_amount = Math.round(subtotal * (taxRateNum / 100) * 100) / 100;
      const total_amount = subtotal + tax_amount;

      await (db.transaction(async (txDb: any) => {
        // Insert Invoice
        await txDb.prepare(`
          INSERT INTO ledger_invoices (id, org_id, ledger_id, customer_id, invoice_number, issue_date, due_date, subtotal, tax_amount, total_amount, amount_paid, status, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 'sent', datetime('now'), datetime('now'))
        `).run(id, orgId, ledger.id, customer_id, invoice_number, date, due_date, subtotal, tax_amount, total_amount);

        // Insert Invoice Lines
        for (const line of lines) {
          const lineAmount = parseFloat(line.quantity || 0) * parseFloat(line.unit_price || 0);
          await txDb.prepare(`
            INSERT INTO ledger_invoice_lines (id, org_id, invoice_id, account_id, description, quantity, unit_price, amount)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `).run(uuidv4(), orgId, id, line.account_id, line.description || '', parseFloat(line.quantity), parseFloat(line.unit_price), lineAmount);
        }

        // CREATE JOURNAL ENTRIES
        const arAccount = await getAccountBySubtype(txDb, ledger.id, 'receivable');
        const salesAccount = await getAccountBySubtype(txDb, ledger.id, 'sales');
        const taxAccount = await getAccountBySubtype(txDb, ledger.id, 'tax');
        
        if (!arAccount || !salesAccount) {
          throw new Error('Default Accounts Receivable or Sales Revenue account is missing. Please check your Chart of Accounts.');
        }

        const journalLines = [];
        
        // 1. Debit Accounts Receivable
        journalLines.push({
          account_id: arAccount.id,
          debit: total_amount,
          credit: 0,
          memo: `Invoice ${invoice_number}`
        });

        // 2. Credit Sales for each line item
        for (const line of lines) {
          const lineAmount = parseFloat(line.quantity || 0) * parseFloat(line.unit_price || 0);
          journalLines.push({
            account_id: line.account_id || salesAccount.id,
            debit: 0,
            credit: lineAmount,
            memo: line.description || `Invoice line ${invoice_number}`
          });
        }

        // 3. Credit Tax account if applicable
        if (tax_amount > 0) {
          if (!taxAccount) {
            throw new Error('Default GST/HST Payable account is missing but tax amount was specified.');
          }
          journalLines.push({
            account_id: taxAccount.id,
            debit: 0,
            credit: tax_amount,
            memo: `Tax for invoice ${invoice_number}`
          });
        }

        await createJournalEntries(txDb, ledger.id, orgId, date, `Invoice ${invoice_number} created`, journalLines, 'invoice');
      }))();

      return NextResponse.json({ success: true, id });
    }

    if (type === 'invoice_payment') {
      const { invoice_id, payment_amount, date } = payload;
      if (!invoice_id || !payment_amount) {
        return NextResponse.json({ error: 'invoice_id and payment_amount are required' }, { status: 400 });
      }

      const invoice = await db.prepare('SELECT * FROM ledger_invoices WHERE id = ? AND ledger_id = ? AND org_id = ?').get(invoice_id, ledger.id, orgId) as any;
      if (!invoice) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });

      const paymentVal = parseFloat(payment_amount);
      const currentPaid = parseFloat(invoice.amount_paid || 0);
      const newPaid = currentPaid + paymentVal;
      const totalAmount = parseFloat(invoice.total_amount || 0);
      const newStatus = newPaid >= totalAmount ? 'paid' : 'partially_paid';

      await (db.transaction(async (txDb: any) => {
        // Update Invoice status
        await txDb.prepare('UPDATE ledger_invoices SET amount_paid = ?, status = ?, updated_at = datetime(\'now\') WHERE id = ?').run(newPaid, newStatus, invoice_id);

        // CREATE JOURNAL ENTRIES
        const bankAccount = await getAccountBySubtype(txDb, ledger.id, 'bank');
        const arAccount = await getAccountBySubtype(txDb, ledger.id, 'receivable');

        if (!bankAccount || !arAccount) {
          throw new Error('Default Checking Account or Accounts Receivable account is missing. Please check your Chart of Accounts.');
        }

        await createJournalEntries(txDb, ledger.id, orgId, date || new Date().toISOString().split('T')[0], `Payment received for Invoice ${invoice.invoice_number}`, [
          { account_id: bankAccount.id, debit: paymentVal, credit: 0, memo: `Invoice payment ${invoice.invoice_number}` },
          { account_id: arAccount.id, debit: 0, credit: paymentVal, memo: `Invoice payment ${invoice.invoice_number}` }
        ], 'invoice_payment');
      }))();

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch (error: any) {
    console.error('Sales route post error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
