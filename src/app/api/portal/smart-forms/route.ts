import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSessionContext } from '@/lib/auth-context';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const session = getSessionContext();
    if (!session || !session.clientId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { clientId } = session;
    const db = getDb();

    // In a real app we might verify if the clientId belongs to the currently active portal context.
    const assignments = await db.prepare(`
      SELECT a.*, f.name as form_name, f.description as form_description
      FROM smart_form_assignments a
      JOIN smart_forms f ON a.form_id = f.id
      WHERE a.client_id = ?
      ORDER BY a.assigned_at DESC
    `).all(clientId);

    return NextResponse.json(assignments);
  } catch (err: any) {
    console.error('GET Portal Smart Forms Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
