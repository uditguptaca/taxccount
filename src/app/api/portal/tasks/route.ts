import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('auth_user_id')?.value;
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const db = getDb();
    const client = db.prepare('SELECT * FROM clients WHERE portal_user_id = ?').get(userId) as any;
    if (!client) return NextResponse.json({ error: 'Client not found' }, { status: 404 });

    // All tasks for this client
    const tasks = db.prepare(`
      SELECT ct.*, cht.subject as thread_subject,
        cc.engagement_code, cc.financial_year, cct.name as template_name
      FROM client_tasks ct
      LEFT JOIN chat_threads cht ON ct.thread_id = cht.id
      LEFT JOIN client_compliances cc ON cht.engagement_id = cc.id
      LEFT JOIN compliance_templates cct ON cc.template_id = cct.id
      WHERE ct.client_id = ?
      ORDER BY ct.is_completed ASC, ct.created_at DESC
    `).all(client.id) as any[];

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error('Portal tasks error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Toggle task completion
export async function PATCH(request: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('auth_user_id')?.value;
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { taskId, completed } = await request.json();
    if (!taskId) return NextResponse.json({ error: 'taskId required' }, { status: 400 });

    const db = getDb();
    const client = db.prepare('SELECT * FROM clients WHERE portal_user_id = ?').get(userId) as any;
    if (!client) return NextResponse.json({ error: 'Client not found' }, { status: 404 });

    // Verify task belongs to this client
    const task = db.prepare('SELECT * FROM client_tasks WHERE id = ? AND client_id = ?').get(taskId, client.id) as any;
    if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 });

    db.prepare(`UPDATE client_tasks SET is_completed = ?, completed_at = ${completed ? "datetime('now')" : 'NULL'} WHERE id = ?`).run(completed ? 1 : 0, taskId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Portal task update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
