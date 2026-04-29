import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { seedDatabase } from '@/lib/seed';
import { getSessionContext } from "@/lib/auth-context";
import { logActivity } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = getSessionContext();
    if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { orgId, userId, role } = session;
    console.log('[Billing GET] Fetching for Org:', orgId);

    const db = getDb();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const invoices = await db.prepare(`
      SELECT i.*, c.display_name as client_name, c.client_code,
        cc.engagement_code, ct.code as template_code
      FROM invoices i
      JOIN clients c ON i.client_id = c.id
      LEFT JOIN client_compliances cc ON i.engagement_id = cc.id
      LEFT JOIN compliance_templates ct ON cc.template_id = ct.id
      WHERE i.org_id = ? ${status && status !== 'all' ? 'AND i.status = ?' : ''}
      ORDER BY i.created_at DESC
    `).all(...(status && status !== 'all' ? [orgId, status] : [orgId]));

    const summary = await db.prepare(`
      SELECT
        COUNT(*) as total_count,
        SUM(total_amount) as total_amount,
        SUM(CASE WHEN status = 'paid' THEN total_amount ELSE 0 END) as paid_amount,
        SUM(CASE WHEN status IN ('unpaid','sent') THEN total_amount ELSE 0 END) as unpaid_amount,
        SUM(CASE WHEN status = 'overdue' THEN total_amount ELSE 0 END) as overdue_amount,
        SUM(CASE WHEN status = 'draft' THEN total_amount ELSE 0 END) as draft_amount,
        SUM(paid_amount) as collected_amount
      FROM invoices
      WHERE org_id = ?
    `).get(orgId);

    const timeEntries = await db.prepare(`
      SELECT te.*, u.first_name || ' ' || u.last_name as user_name,
        c.display_name as client_name
      FROM time_entries te
      JOIN users u ON te.user_id = u.id
      LEFT JOIN clients c ON te.client_id = c.id
      WHERE te.org_id = ?
      ORDER BY te.entry_date DESC LIMIT 50
    `).all(orgId);

    const proposals = await db.prepare(`
      SELECT p.*, c.display_name as client_name
      FROM proposals p
      JOIN clients c ON p.client_id = c.id
      WHERE p.org_id = ?
      ORDER BY p.created_at DESC
    `).all(orgId);

    const payments = await db.prepare(`
      SELECT p.*, i.invoice_number, c.display_name as client_name
      FROM payments p
      JOIN invoices i ON p.invoice_id = i.id
      JOIN clients c ON i.client_id = c.id
      WHERE p.org_id = ?
      ORDER BY p.payment_date DESC LIMIT 50
    `).all(orgId);

    return NextResponse.json({ invoices, summary, timeEntries, proposals, payments });
  } catch (error: any) {
    console.error('[Billing GET] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = getSessionContext();
    if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { orgId, userId } = session;

    const db = getDb();
    const body = await request.json();
    console.log('[Billing POST] Body:', body);
    const { client_id, engagement_id, total_amount, due_date, notes } = body;

    if (!client_id || !total_amount) {
      return NextResponse.json({ error: 'Client ID and Total Amount are required' }, { status: 400 });
    }

    const { v4: uuidv4 } = require('uuid');
    const invoiceId = uuidv4();

    // Generate invoice number (scoped by org_id)
    const lastNum = await db.prepare(`SELECT count(*) as count FROM invoices WHERE org_id = ?`).get(orgId) as any;
    const invNumber = `INV-${new Date().getFullYear()}-${String((lastNum?.count || 0) + 1).padStart(4, '0')}`;

    console.log('[Billing POST] Inserting invoice:', invoiceId);
    await db.prepare(`
      INSERT INTO invoices (
        id, org_id, invoice_number, client_id, engagement_id, 
        amount, total_amount, paid_amount, status, issued_date, 
        due_date, paid_date, discount_amount, tax_amount, currency, 
        notes, created_by, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, NULL, 0, 0, 'CAD', ?, ?, NOW(), NOW())
    `).run(
      invoiceId, 
      orgId, 
      invNumber, 
      client_id, 
      engagement_id || null, 
      parseFloat(total_amount), 
      parseFloat(total_amount), 
      0, // paid_amount
      'unpaid', // status
      due_date || null, 
      notes || null, 
      userId
    );

    await logActivity({
      orgId,
      actorId: userId,
      action: 'created_invoice',
      entityType: 'invoice',
      entityId: invoiceId,
      entityName: invNumber,
      clientId: client_id,
      details: `Invoice ${invNumber} generated for amount CAD ${total_amount}.`
    });

    return NextResponse.json({ success: true, invoice_id: invoiceId, invoice_number: invNumber });
  } catch (error: any) {
    console.error('[Billing POST] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
