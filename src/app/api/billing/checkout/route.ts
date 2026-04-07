import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSessionContext } from "@/lib/auth-context";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {

        const session = getSessionContext();
    if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { orgId, userId, role } = session;

    const { searchParams } = new URL(request.url);
    const invoiceId = searchParams.get('invoice_id');

    if (!invoiceId) {
      return NextResponse.json({ error: 'invoice_id is required' }, { status: 400 });
    }

    const db = getDb();
    const invoice = db.prepare(`SELECT * FROM invoices WHERE id = ?`).get(invoiceId) as any;

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    if (invoice.status === 'paid') {
      return NextResponse.redirect(new URL('/portal?payment=already_paid', request.url));
    }

    // In a production app, we would:
    // 1. Create a stripe.checkout.sessions.create(...)
    // 2. Pass the invoice.id in the metadata
    // 3. Return the session.url to redirect the user
    
    // For this MVP, we simulate a successful payment process directly.
    // We will asynchronously trigger our own webhook to mock Stripe's webhook event!
    fetch(new URL('/api/billing/webhook', request.url).toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'checkout.session.completed',
        data: {
          object: {
            metadata: { invoice_id: invoice.id },
            amount_total: invoice.total_amount * 100 // Stripe uses cents
          }
        }
      })
    }).catch(console.error); // Fire and forget just like Stripe

    // Redirect the user immediately back to the client portal simulating success_url
    return NextResponse.redirect(new URL('/portal?payment=success', request.url));

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
