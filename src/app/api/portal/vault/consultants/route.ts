import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';

function getUserId() {
  const cookieStore = cookies();
  return cookieStore.get('auth_user_id')?.value;
}

// GET — list consultants with assignments
export async function GET() {
  try {
    const userId = getUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const db = getDb();
    const consultants = db.prepare(`SELECT * FROM personal_consultants WHERE user_id = ? ORDER BY name`).all(userId) as any[];
    for (const c of consultants) {
      c.assignments = db.prepare(`
        SELECT pca.*, 
          CASE pca.compliance_type 
          WHEN 'personal' THEN (SELECT title FROM personal_compliance_items WHERE id = pca.compliance_item_id)
          WHEN 'family' THEN (SELECT title FROM personal_family_compliance WHERE id = pca.compliance_item_id)
          WHEN 'entity' THEN (SELECT title FROM personal_entity_compliance WHERE id = pca.compliance_item_id)
          END as task_title
        FROM personal_consultant_assignments pca WHERE pca.consultant_id = ? AND pca.user_id = ?
      `).all(c.id, userId);
    }
    return NextResponse.json({ consultants });
  } catch (error) {
    console.error('Consultants GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST — add consultant OR assign consultant
export async function POST(request: Request) {
  try {
    const userId = getUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const db = getDb();
    const body = await request.json();
    const now = new Date().toISOString();

    if (body.action === 'assign') {
      const { consultant_id, compliance_item_id, compliance_type } = body;
      if (!consultant_id || !compliance_item_id || !compliance_type) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
      const id = uuidv4();
      try {
        db.prepare(`INSERT INTO personal_consultant_assignments (id, consultant_id, compliance_item_id, compliance_type, user_id, created_at) VALUES (?,?,?,?,?,?)`).run(id, consultant_id, compliance_item_id, compliance_type, userId, now);
        // Also update the compliance item's assigned_consultant_id if personal
        if (compliance_type === 'personal') {
          db.prepare(`UPDATE personal_compliance_items SET assigned_consultant_id = ? WHERE id = ? AND user_id = ?`).run(consultant_id, compliance_item_id, userId);
        }
      } catch (e: any) {
        if (e.message?.includes('UNIQUE')) return NextResponse.json({ error: 'Already assigned' }, { status: 409 });
        throw e;
      }
      return NextResponse.json({ id, message: 'Consultant assigned' });
    }

    const { name, specialty, email, phone, company, notes } = body;
    if (!name) return NextResponse.json({ error: 'Name required' }, { status: 400 });
    const id = uuidv4();
    db.prepare(`INSERT INTO personal_consultants (id, user_id, name, specialty, email, phone, company, notes, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?)`).run(id, userId, name, specialty || 'general', email, phone, company, notes, now, now);
    return NextResponse.json({ id, message: 'Consultant added' });
  } catch (error) {
    console.error('Consultants POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE
export async function DELETE(request: Request) {
  try {
    const userId = getUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const db = getDb();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const type = searchParams.get('type'); // 'consultant' or 'assignment'
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
    if (type === 'assignment') {
      db.prepare(`DELETE FROM personal_consultant_assignments WHERE id = ? AND user_id = ?`).run(id, userId);
    } else {
      db.prepare(`DELETE FROM personal_consultants WHERE id = ? AND user_id = ?`).run(id, userId);
    }
    return NextResponse.json({ message: 'Deleted' });
  } catch (error) {
    console.error('Consultants DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
