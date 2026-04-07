import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const db = getDb();
    const event = await req.json();

    // 1. Verify the Stripe event
    if (event.type !== 'checkout.session.completed') {
      return NextResponse.json({ received: true });
    }

    const session = event.data.object;
    const invoiceId = session.metadata?.invoice_id;
    const amountPaid = session.amount_total / 100;

    if (!invoiceId) {
      return NextResponse.json({ error: 'Missing invoice ID in metadata' }, { status: 400 });
    }

    const invoice = db.prepare(`SELECT * FROM invoices WHERE id = ?`).get(invoiceId) as any;
    if (!invoice) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });

    // 2. Mark Invoice as Paid
    const now = new Date().toISOString();
    db.prepare(`
      UPDATE invoices
      SET status = 'paid', paid_amount = ?, paid_date = ?, updated_at = ?
      WHERE id = ?
    `).run(amountPaid, now, now, invoice.id);

    // 3. Record the Payment
    db.prepare(`
      INSERT INTO payments (id, invoice_id, amount, payment_date, payment_method, recorded_by, created_at)
      VALUES (?, ?, ?, ?, 'credit_card', 'system_webhook', ?)
    `).run(uuidv4(), invoice.id, amountPaid, now, now);

    // 4. Auto-Advance Engagement Stage
    if (invoice.engagement_id) {
      const engagement = db.prepare(`SELECT * FROM client_compliances WHERE id = ?`).get(invoice.engagement_id) as any;

      // Feature 8.2: Payment-Driven Stage Transition to Final Filing
      const finalFilingStage = db.prepare(`SELECT * FROM client_compliance_stages WHERE engagement_id = ? AND stage_name LIKE '%Final Filing%'`).get(invoice.engagement_id) as any;
      if (finalFilingStage) {
        // Mark actively working stages prior to Final Filing as completed
        db.prepare(`
          UPDATE client_compliance_stages 
          SET status = 'completed', completed_at = ?, completed_by = 'system_webhook', updated_at = ? 
          WHERE engagement_id = ? AND status = 'in_progress' AND sequence_order < ?
        `).run(now, now, invoice.engagement_id, finalFilingStage.sequence_order);

        // Advance to Final Filing stage
        db.prepare(`
          UPDATE client_compliance_stages 
          SET status = 'in_progress', started_at = ?, updated_at = ? 
          WHERE id = ?
        `).run(now, now, finalFilingStage.id);

        // Update engagement pointer
        db.prepare(`UPDATE client_compliances SET current_stage_id = ?, updated_at = ? WHERE id = ?`)
          .run(finalFilingStage.id, now, invoice.engagement_id);
      }
      
      // Add notification to activity feed
      db.prepare(`
        INSERT INTO activity_feed (id, actor_id, action, entity_type, entity_id, entity_name, client_id, details, created_at)
        VALUES (?, 'system', 'payment_received', 'invoice', ?, ?, ?, ?, ?)
      `).run(uuidv4(), invoice.id, invoice.invoice_number, invoice.client_id, "Automated payment processed for " + invoice.invoice_number, now);
    }

    return NextResponse.json({ success: true, processed: true });

  } catch (error: any) {
    console.error('Stripe Webhook Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
