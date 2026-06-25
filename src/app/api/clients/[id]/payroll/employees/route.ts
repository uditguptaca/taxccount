import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSessionContext } from '@/lib/auth-context';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = getSessionContext();
    if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { orgId } = session;
    const resolvedParams = await params;

    const db = getDb();
    
    // We need to fetch the ledger_id for this client/org
    const ledger = await db.prepare('SELECT id FROM ledgers WHERE org_id = ? AND (client_id = ? OR client_id = ?)').get(orgId, resolvedParams.id, 'FIRM') as { id: string };
    
    if (!ledger) return NextResponse.json({ employees: [] });

    const employees = await db.prepare('SELECT * FROM ledger_employees WHERE ledger_id = ? ORDER BY first_name ASC').all(ledger.id);
    return NextResponse.json({ employees });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = getSessionContext();
    if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { orgId } = session;
    const resolvedParams = await params;
    const body = await req.json();

    const db = getDb();
    
    // Find or create ledger
    let ledger = await db.prepare('SELECT id FROM ledgers WHERE org_id = ? AND (client_id = ? OR client_id = ?)').get(orgId, resolvedParams.id, 'FIRM') as { id: string };
    if (!ledger) {
      ledger = { id: uuidv4() };
      await db.prepare('INSERT INTO ledgers (id, org_id, client_id, name) VALUES (?, ?, ?, ?)').run(ledger.id, orgId, resolvedParams.id, 'Primary Ledger');
    }

    const empId = uuidv4();
    await db.prepare(`
      INSERT INTO ledger_employees (id, org_id, ledger_id, first_name, last_name, sin, pay_rate, pay_frequency)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(empId, orgId, ledger.id, body.first_name, body.last_name, body.sin, parseFloat(body.pay_rate), body.pay_frequency);

    return NextResponse.json({ success: true, employee_id: empId });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
