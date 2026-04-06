import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

import { getSessionContext } from "@/lib/auth-context";

export const dynamic = 'force-dynamic';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {

        const session = getSessionContext();
    if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { orgId, userId, role } = session;

    const db = getDb();
    const user = db.prepare('SELECT role FROM users WHERE id = ?').get(userId) as any;
    if (!user || user.role === 'client') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const taskId = params.id;
    const body = await req.json();

    const updates: string[] = [];
    const values: any[] = [];

    if (body.due_date !== undefined) {
      updates.push('due_date = ?');
      values.push(body.due_date);
    }
    if (body.status !== undefined) {
      updates.push('status = ?');
      values.push(body.status);
    }
    if (body.assignee_id !== undefined) {
      updates.push('assignee_id = ?');
      values.push(body.assignee_id);
    }

    if (updates.length === 0) {
      return NextResponse.json({ message: 'No updates provided' });
    }

    values.push(taskId);

    db.prepare(`
      UPDATE client_compliances 
      SET ${updates.join(', ')}, updated_at = datetime('now')
      WHERE id = ?
    `).run(...values);

    // If status changed to completed, we should probably update completed_at
    if (body.status === 'completed') {
      db.prepare(`UPDATE client_compliances SET completed_at = datetime('now') WHERE id = ? AND completed_at IS NULL`).run(taskId);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Calendar update API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
