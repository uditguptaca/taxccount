import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

// PATCH: Update task status (compliance stage or ad-hoc staff task)
export async function PATCH(req: Request) {
  try {
    const db = getDb();
    const body = await req.json();
    const { task_type, task_id, action, notes, new_user_id } = body;

    if (!task_id) {
      return NextResponse.json({ error: 'task_id is required' }, { status: 400 });
    }

    const now = new Date().toISOString();

    if (task_type === 'stage') {
      // Update compliance stage
      if (action === 'start') {
        db.prepare(`UPDATE client_compliance_stages SET status = 'in_progress', started_at = ?, updated_at = ? WHERE id = ?`).run(now, now, task_id);
      } else if (action === 'complete') {
        db.prepare(`UPDATE client_compliance_stages SET status = 'completed', completed_at = ?, notes = COALESCE(?, notes), updated_at = ? WHERE id = ?`).run(now, notes, now, task_id);
      } else if (action === 'add_note') {
        db.prepare(`UPDATE client_compliance_stages SET notes = ?, updated_at = ? WHERE id = ?`).run(notes, now, task_id);
      } else if (action === 'reassign' && new_user_id) {
        db.prepare(`UPDATE client_compliance_stages SET assigned_user_id = ?, updated_at = ? WHERE id = ?`).run(new_user_id, now, task_id);
      }
    } else if (task_type === 'staff_task') {
      // Update ad-hoc staff task
      if (action === 'start') {
        db.prepare(`UPDATE staff_tasks SET status = 'in_progress', updated_at = ? WHERE id = ?`).run(now, task_id);
      } else if (action === 'complete') {
        db.prepare(`UPDATE staff_tasks SET status = 'completed', completed_at = ?, notes = COALESCE(?, notes), updated_at = ? WHERE id = ?`).run(now, notes, now, task_id);
      } else if (action === 'add_note') {
        db.prepare(`UPDATE staff_tasks SET notes = ?, updated_at = ? WHERE id = ?`).run(notes, now, task_id);
      } else if (action === 'cancel') {
        db.prepare(`UPDATE staff_tasks SET status = 'cancelled', updated_at = ? WHERE id = ?`).run(now, task_id);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
