import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSessionContext } from '@/lib/auth-context';

export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = getSessionContext();
    if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { orgId } = session;
    const resolvedParams = await params;

    const db = getDb();
    const ledger = await db.prepare('SELECT id FROM ledgers WHERE org_id = ? AND (client_id = ? OR client_id = ?)').get(orgId, resolvedParams.id, 'FIRM') as { id: string };
    
    if (!ledger) return NextResponse.json({ runs: [] });

    const runs = await db.prepare('SELECT * FROM ledger_payroll WHERE ledger_id = ? ORDER BY run_date DESC').all(ledger.id);
    return NextResponse.json({ runs });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
