import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSessionContext } from '@/lib/auth-context';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = getSessionContext();
    if (!session?.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const db = getDb();
    const rates = await db.prepare(
      'SELECT * FROM currency_exchange_rates WHERE org_id = ? ORDER BY from_currency, to_currency'
    ).all(session.orgId);
    return NextResponse.json({ rates });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = getSessionContext();
    if (!session?.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const db = getDb();
    const body = await request.json();
    const { from_currency, to_currency, exchange_rate, effective_date, notes } = body;
    
    if (!from_currency || !to_currency || !exchange_rate) {
      return NextResponse.json({ error: 'from_currency, to_currency, and exchange_rate are required' }, { status: 400 });
    }
    
    const id = uuidv4();
    await db.prepare(
      `INSERT INTO currency_exchange_rates (id, org_id, from_currency, to_currency, exchange_rate, effective_date, status, notes, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, 'active', ?, NOW(), NOW())`
    ).run(id, session.orgId, from_currency, to_currency, exchange_rate, effective_date || null, notes || null);
    
    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = getSessionContext();
    if (!session?.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const db = getDb();
    const body = await request.json();
    const { id, from_currency, to_currency, exchange_rate, effective_date, status: rateStatus, notes } = body;
    if (!id) return NextResponse.json({ error: 'Rate ID is required' }, { status: 400 });
    
    await db.prepare(
      `UPDATE currency_exchange_rates SET from_currency = ?, to_currency = ?, exchange_rate = ?, effective_date = ?, status = ?, notes = ?, updated_at = NOW()
       WHERE id = ? AND org_id = ?`
    ).run(from_currency, to_currency, exchange_rate, effective_date || null, rateStatus || 'active', notes || null, id, session.orgId);
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = getSessionContext();
    if (!session?.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const db = getDb();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Rate ID is required' }, { status: 400 });
    
    await db.prepare('UPDATE currency_exchange_rates SET status = ? WHERE id = ? AND org_id = ?').run('inactive', id, session.orgId);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
