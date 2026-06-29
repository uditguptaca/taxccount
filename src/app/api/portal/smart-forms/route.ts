import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSessionContext } from '@/lib/auth-context';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const session = getSessionContext();
    if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { orgId, userId, role } = session;

    const { searchParams } = new URL(req.url);
    const requestedClientId = searchParams.get('client_id');

    const db = getDb();
    let client: any = null;

    if (requestedClientId) {
      client = await db.prepare('SELECT * FROM clients WHERE id = ? AND portal_user_id = ? AND org_id = ?').get(requestedClientId, userId, orgId) as any;
    }

    if (!client) {
      client = await db.prepare('SELECT * FROM clients WHERE portal_user_id = ?').get(userId) as any;
    }

    if (!client) return NextResponse.json({ error: 'Client not found' }, { status: 404 });

    const assignments = await db.prepare(`
      SELECT a.*, f.name as form_name, f.description as form_description
      FROM smart_form_assignments a
      JOIN smart_forms f ON a.form_id = f.id
      WHERE a.client_id = ?
      ORDER BY a.assigned_at DESC
    `).all(client.id);

    return NextResponse.json(assignments);
  } catch (err: any) {
    console.error('GET Portal Smart Forms Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
