import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { getSessionContext } from "@/lib/auth-context";

// GET — list family members with compliance
export async function GET() {
  try {
    const session = getSessionContext();
    if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { orgId, userId, role } = session;

    const db = getDb();
    const members = db.prepare(`SELECT * FROM personal_family_members WHERE user_id = ? ORDER BY relationship, name`).all(userId) as any[];
    for (const m of members) {
      m.compliance = db.prepare(`SELECT * FROM personal_family_compliance WHERE family_member_id = ? AND user_id = ? ORDER BY due_date ASC`).all(m.id, userId);
    }
    return NextResponse.json({ members });
  } catch (error) {
    console.error('Family GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST — add family member OR add compliance to family member
export async function POST(request: Request) {
  try {
    const session = getSessionContext();
    if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { orgId, userId, role } = session;

    const db = getDb();
    const body = await request.json();
    const now = new Date().toISOString();

    if (body.action === 'add_compliance') {
      const { family_member_id, title, category, description, due_date, recurrence_rule, recurrence_label, notes } = body;
      if (!family_member_id || !title) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
      const id = uuidv4();
      const urgency = computeUrgency(due_date, 'pending');
      db.prepare(`INSERT INTO personal_family_compliance (id, family_member_id, user_id, title, category, description, due_date, recurrence_rule, recurrence_label, status, urgency, notes, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(id, family_member_id, userId, title, category || 'custom', description, due_date, recurrence_rule, recurrence_label, 'pending', urgency, notes, now, now);
      return NextResponse.json({ id, message: 'Family compliance item added' });
    }

    const { name, relationship, date_of_birth, email, phone, notes } = body;
    if (!name || !relationship) return NextResponse.json({ error: 'Name and relationship required' }, { status: 400 });
    const id = uuidv4();
    db.prepare(`INSERT INTO personal_family_members (id, user_id, name, relationship, date_of_birth, email, phone, notes, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?)`).run(id, userId, name, relationship, date_of_birth, email, phone, notes, now, now);
    return NextResponse.json({ id, message: 'Family member added' });
  } catch (error) {
    console.error('Family POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH — update family member or compliance item
export async function PATCH(request: Request) {
  try {
    const session = getSessionContext();
    if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { orgId, userId, role } = session;

    const db = getDb();
    const body = await request.json();

    if (body.compliance_id) {
      const { compliance_id, status, title, due_date } = body;
      const newStatus = status || 'pending';
      const completedAt = newStatus === 'completed' ? new Date().toISOString() : null;
      const urgency = computeUrgency(due_date, newStatus);
      db.prepare(`UPDATE personal_family_compliance SET status = ?, urgency = ?, completed_at = ?, title = COALESCE(?, title), due_date = COALESCE(?, due_date), updated_at = datetime('now') WHERE id = ? AND user_id = ?`).run(newStatus, urgency, completedAt, title, due_date, compliance_id, userId);
      return NextResponse.json({ message: 'Updated' });
    }

    const { id, name, relationship, date_of_birth, email, phone, notes } = body;
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
    db.prepare(`UPDATE personal_family_members SET name = COALESCE(?, name), relationship = COALESCE(?, relationship), date_of_birth = COALESCE(?, date_of_birth), email = COALESCE(?, email), phone = COALESCE(?, phone), notes = COALESCE(?, notes), updated_at = datetime('now') WHERE id = ? AND user_id = ?`).run(name, relationship, date_of_birth, email, phone, notes, id, userId);
    return NextResponse.json({ message: 'Updated' });
  } catch (error) {
    console.error('Family PATCH error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE — remove family member or compliance
export async function DELETE(request: Request) {
  try {
    const session = getSessionContext();
    if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { orgId, userId, role } = session;

    const db = getDb();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const type = searchParams.get('type'); // 'member' or 'compliance'
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
    if (type === 'compliance') {
      db.prepare(`DELETE FROM personal_family_compliance WHERE id = ? AND user_id = ?`).run(id, userId);
    } else {
      db.prepare(`DELETE FROM personal_family_members WHERE id = ? AND user_id = ?`).run(id, userId);
    }
    return NextResponse.json({ message: 'Deleted' });
  } catch (error) {
    console.error('Family DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function computeUrgency(dueDate: string | null, status: string): string {
  if (status === 'completed') return 'green';
  if (!dueDate) return 'gray';
  const now = new Date();
  const due = new Date(dueDate);
  const daysUntil = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (daysUntil < 0) return 'red';
  if (daysUntil <= 7) return 'red';
  if (daysUntil <= 30) return 'yellow';
  return 'green';
}
