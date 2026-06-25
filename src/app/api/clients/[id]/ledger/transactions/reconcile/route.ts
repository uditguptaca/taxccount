import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSessionContext } from '@/lib/auth-context';

export const dynamic = 'force-dynamic';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = getSessionContext();
    if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { orgId } = session;
    const { id: client_id } = await params;
    
    const body = await req.json();
    const { transaction_id, status } = body;

    const db = getDb();
    
    await db.prepare(`
      UPDATE ledger_transactions 
      SET status = ? 
      WHERE id = ? AND org_id = ?
    `).run(status, transaction_id, orgId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Ledger transactions PUT error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
