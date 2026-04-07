import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { seedDatabase } from '@/lib/seed';
import { getSessionContext } from "@/lib/auth-context";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = getSessionContext();
    if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { orgId, userId, role } = session;

seedDatabase();
    const db = getDb();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    let where = '';
    const params: string[] = [];
    if (status && status !== 'all') {
      where = 'WHERE i.status = ?';
      params.push(status);
    }

    const invoices = db.prepare(`
      SELECT i.*, c.display_name as client_name, c.client_code,
        cc.engagement_code, ct.code as template_code
      FROM invoices i
      JOIN clients c ON i.client_id = c.id
      LEFT JOIN client_compliances cc ON i.engagement_id = cc.id
      LEFT JOIN compliance_templates ct ON cc.template_id = ct.id
      ${where}
      ORDER BY i.created_at DESC
    `).all(...params);

    const summary = db.prepare(`
      SELECT
        COUNT(*) as total_count,
        SUM(total_amount) as total_amount,
        SUM(CASE WHEN status = 'paid' THEN total_amount ELSE 0 END) as paid_amount,
        SUM(CASE WHEN status IN ('unpaid','sent') THEN total_amount ELSE 0 END) as unpaid_amount,
        SUM(CASE WHEN status = 'overdue' THEN total_amount ELSE 0 END) as overdue_amount,
        SUM(CASE WHEN status = 'draft' THEN total_amount ELSE 0 END) as draft_amount,
        SUM(paid_amount) as collected_amount
      FROM invoices
    `).get();

    const timeEntries = db.prepare(`
      SELECT te.*, u.first_name || ' ' || u.last_name as user_name,
        c.display_name as client_name
      FROM time_entries te
      JOIN users u ON te.user_id = u.id
      LEFT JOIN clients c ON te.client_id = c.id
      ORDER BY te.entry_date DESC LIMIT 50
    `).all();

    const proposals = db.prepare(`
      SELECT p.*, c.display_name as client_name
      FROM proposals p
      JOIN clients c ON p.client_id = c.id
      ORDER BY p.created_at DESC
    `).all();

    const payments = db.prepare(`
      SELECT p.*, i.invoice_number, c.display_name as client_name
      FROM payments p
      JOIN invoices i ON p.invoice_id = i.id
      JOIN clients c ON i.client_id = c.id
      ORDER BY p.payment_date DESC LIMIT 50
    `).all();

    return NextResponse.json({ invoices, summary, timeEntries, proposals, payments });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = getSessionContext();
    if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { orgId, userId, role } = session;

const db = getDb();
    const body = await request.json();
    const { client_id, engagement_id, total_amount, due_date, notes } = body;

    if (!client_id || !total_amount) {
      return NextResponse.json({ error: 'Client ID and Total Amount are required' }, { status: 400 });
    }

    const { v4: uuidv4 } = require('uuid');
    const invoiceId = uuidv4();

    // Generate invoice number
    const lastNum = db.prepare(`SELECT count(*) as count FROM invoices`).get() as any;
    const invNumber = `INV-${new Date().getFullYear()}-${String((lastNum?.count || 0) + 1).padStart(4, '0')}`;

    db.prepare(`
      INSERT INTO invoices (
        id, client_id, engagement_id, invoice_number, total_amount, 
        paid_amount, status, issued_date, due_date, notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, 0, 'unpaid', datetime('now'), ?, ?, datetime('now'), datetime('now'))
    `).run(
      invoiceId, client_id, engagement_id || null, invNumber, 
      parseFloat(total_amount), due_date || null, notes || null
    );

    return NextResponse.json({ success: true, invoice_id: invoiceId, invoice_number: invNumber });
  } catch (error: any) {
    console.error('Create invoice error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
