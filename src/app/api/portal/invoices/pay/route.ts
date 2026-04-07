import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { getSessionContext } from "@/lib/auth-context";

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {

        const session = getSessionContext();
    if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { orgId, userId, role } = session;

    const { invoice_id, amount, payment_method = 'portal_payment' } = await request.json();

    if (!invoice_id || !amount || amount <= 0) {
      return NextResponse.json({ error: 'Valid invoice_id and positive amount are required' }, { status: 400 });
    }

    const db = getDb();

    // Verify the client owns this invoice
    const client = db.prepare('SELECT * FROM clients WHERE portal_user_id = ?').get(userId) as any;
    if (!client) return NextResponse.json({ error: 'Client not found' }, { status: 404 });

    const invoice = db.prepare('SELECT * FROM invoices WHERE id = ? AND client_id = ?').get(invoice_id, client.id) as any;
    if (!invoice) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });

    if (['paid', 'cancelled', 'draft'].includes(invoice.status)) {
      return NextResponse.json({ error: `Cannot pay an invoice with status: ${invoice.status}` }, { status: 400 });
    }

    const remainingBalance = invoice.total_amount - invoice.paid_amount;
    if (amount > remainingBalance + 0.01) { // small float tolerance
      return NextResponse.json({ error: `Payment amount ($${amount.toFixed(2)}) exceeds remaining balance ($${remainingBalance.toFixed(2)})` }, { status: 400 });
    }

    const paymentAmount = Math.min(amount, remainingBalance);
    const newPaidAmount = invoice.paid_amount + paymentAmount;
    const newStatus = newPaidAmount >= invoice.total_amount ? 'paid' : 'partially_paid';

    const paymentId = uuidv4();
    const now = new Date().toISOString();

    // Record the payment
    db.prepare(`
      INSERT INTO payments (id, invoice_id, amount, payment_date, payment_method, reference_number, notes, recorded_by, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(paymentId, invoice_id, paymentAmount, now, payment_method, `PAY-${Date.now()}`, 'Portal payment', userId, now);

    // Update invoice
    db.prepare(`
      UPDATE invoices SET 
        paid_amount = ?, 
        status = ?,
        paid_date = ${newStatus === 'paid' ? '?' : 'paid_date'},
        payment_method = ?,
        updated_at = datetime('now')
      WHERE id = ?
    `).run(
      newPaidAmount,
      newStatus,
      ...(newStatus === 'paid' ? [now] : []),
      payment_method,
      invoice_id
    );

    // If fully paid, auto-advance engagement stage (Billing → Final Filing)
    if (newStatus === 'paid' && invoice.engagement_id) {
      const billingStage = db.prepare(`
        SELECT * FROM client_compliance_stages
        WHERE engagement_id = ? AND stage_code = 'BILLING' AND status = 'in_progress'
      `).get(invoice.engagement_id) as any;

      if (billingStage) {
        db.prepare(`
          UPDATE client_compliance_stages SET status = 'completed', completed_at = ?, updated_at = ? WHERE id = ?
        `).run(now, now, billingStage.id);

        const nextStage = db.prepare(`
          SELECT * FROM client_compliance_stages
          WHERE engagement_id = ? AND sequence_order > ?
          ORDER BY sequence_order ASC LIMIT 1
        `).get(invoice.engagement_id, billingStage.sequence_order) as any;

        if (nextStage && nextStage.status === 'pending') {
          db.prepare(`
            UPDATE client_compliance_stages SET status = 'in_progress', started_at = ?, updated_at = ? WHERE id = ?
          `).run(now, now, nextStage.id);
          console.log(`[WORKFLOW] Invoice paid. Advanced engagement ${invoice.engagement_id} from BILLING to ${nextStage.stage_code}`);
        }
      }
    }

    // Log to audit
    db.prepare(`
      INSERT INTO audit_logs (id, actor_id, action, entity_type, entity_id, details, created_at)
      VALUES (?, ?, 'invoice_payment', 'invoice', ?, ?, datetime('now'))
    `).run(uuidv4(), userId, invoice_id, `Payment of $${paymentAmount.toFixed(2)} recorded. New status: ${newStatus}`);

    // Log to activity feed
    db.prepare(`
      INSERT INTO activity_feed (id, actor_id, action, entity_type, entity_id, entity_name, client_id, details, created_at)
      VALUES (?, ?, 'payment_received', 'invoice', ?, ?, ?, ?, datetime('now'))
    `).run(uuidv4(), userId, invoice_id, `Invoice #${invoice.invoice_number}`, client.id, `$${paymentAmount.toFixed(2)} payment received`);

    return NextResponse.json({
      success: true,
      payment_id: paymentId,
      amount_paid: paymentAmount,
      new_balance: invoice.total_amount - newPaidAmount,
      new_status: newStatus,
    });
  } catch (error: any) {
    console.error('Portal payment error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
