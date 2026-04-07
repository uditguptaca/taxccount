import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { seedDatabase } from '@/lib/seed';

export const dynamic = 'force-dynamic';

export async function PUT(request: Request) {
  try {
    seedDatabase();
    const db = getDb();
    const body = await request.json();
    const { stage_ids, new_user_id } = body;

    if (!Array.isArray(stage_ids) || stage_ids.length === 0 || !new_user_id) {
      return NextResponse.json({ error: 'Valid stage_ids array and new_user_id required' }, { status: 400 });
    }

    db.transaction(() => {
      const updateStmt = db.prepare(`
        UPDATE client_compliance_stages 
        SET assigned_user_id = ?, updated_at = datetime('now')
        WHERE id = ?
      `);
      
      for (const id of stage_ids) {
        updateStmt.run(new_user_id, id);
      }
    })();

    return NextResponse.json({ success: true, count: stage_ids.length });
  } catch (error) {
    console.error('Bulk reassignment error:', error);
    return NextResponse.json({ error: 'Failed to bulk reassign stages' }, { status: 500 });
  }
}
