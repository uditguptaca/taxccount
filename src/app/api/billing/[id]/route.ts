import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSessionContext } from "@/lib/auth-context";

export const dynamic = 'force-dynamic';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = getSessionContext();
    if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { orgId, userId, role } = session;

    const db = getDb();
    const { id } = await params;
    const body = await request.json();
    const { payment_amount, payment_method, notes } = body;

    const invoice = db.prepare(`SELECT * FROM invoices WHERE id = ?`).get(id) as any;
    if (!invoice) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });

    const newPaidAmount = (invoice.paid_amount || 0) + parseFloat(payment_amount);
    let newStatus = 'partially_paid';
    
    // Status Logic using the available checked constraint:
    // status IN ('draft', 'sent', 'viewed', 'paid', 'partially_paid', 'unpaid', 'overdue', 'cancelled')
    if (newPaidAmount >= invoice.total_amount) {
      newStatus = 'paid';
    } else if (newPaidAmount > 0) {
      newStatus = 'partially_paid';
    } else {
      newStatus = invoice.status; // leave as is (unpaid, sent, etc)
    }

    const { v4: uuidv4 } = require('uuid');
    const paymentId = uuidv4();

    // 1. Insert Payment Record
    db.prepare(`
      INSERT INTO payments (id, invoice_id, amount, payment_date, payment_method, status, notes, created_at, updated_at)
      VALUES (?, ?, ?, datetime('now'), ?, 'completed', ?, datetime('now'), datetime('now'))
    `).run(paymentId, id, parseFloat(payment_amount), payment_method || 'manual', notes || '');

    // 2. Update Invoice
    db.prepare(`
      UPDATE invoices
      SET paid_amount = ?, status = ?, updated_at = datetime('now')
      WHERE id = ?
    `).run(newPaidAmount, newStatus, id);

    // Feature 8.2: Payment-Driven Stage Transition
    if (newStatus === 'paid' && invoice.engagement_id) {
      // Find the 'Final Filing' stage
      const finalFilingStage = db.prepare(`SELECT * FROM client_compliance_stages WHERE engagement_id = ? AND stage_name LIKE '%Final Filing%'`).get(invoice.engagement_id) as any;
      if (finalFilingStage) {
        // Mark all stages before it as completed if they are in_progress or pending
        // The most robust way is to mark the current active stage as completed
        db.prepare(`
          UPDATE client_compliance_stages 
          SET status = 'completed', completed_at = datetime('now'), updated_at = datetime('now') 
          WHERE engagement_id = ? AND status = 'in_progress' AND sequence_order < ?
        `).run(invoice.engagement_id, finalFilingStage.sequence_order);

        // Advance to Final Filing stage
        db.prepare(`
          UPDATE client_compliance_stages 
          SET status = 'in_progress', started_at = datetime('now'), updated_at = datetime('now') 
          WHERE id = ?
        `).run(finalFilingStage.id);

        console.log(`[WORKFLOW] Invoice ${invoice.invoice_number} paid. Advanced engagement ${invoice.engagement_id} to Final Filing phase.`);
      }
    }

    return NextResponse.json({ success: true, payment_id: paymentId, new_status: newStatus });
  } catch (error: any) {
    console.error('Record payment error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = getSessionContext();
    if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { orgId, userId, role } = session;

const db = getDb();
    const { id } = await params;
    const body = await request.json();

    const updates: string[] = [];
    const values: any[] = [];
    if (body.total_amount !== undefined) { updates.push('total_amount = ?'); values.push(parseFloat(body.total_amount)); }
    if (body.due_date !== undefined) { updates.push('due_date = ?'); values.push(body.due_date); }
    if (body.description !== undefined) { updates.push('description = ?'); values.push(body.description); }
    if (body.status !== undefined) { updates.push('status = ?'); values.push(body.status); }
    if (updates.length > 0) {
      updates.push("updated_at = datetime('now')");
      values.push(id);
      db.prepare(`UPDATE invoices SET ${updates.join(', ')} WHERE id = ?`).run(...values);
    }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = getSessionContext();
    if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { orgId, userId, role } = session;

const db = getDb();
    const { id } = await params;
    // Void the invoice (soft delete)
    db.prepare(`UPDATE invoices SET status = 'cancelled', updated_at = datetime('now') WHERE id = ?`).run(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
