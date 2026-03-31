import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';

function getUserId() {
  const cookieStore = cookies();
  return cookieStore.get('auth_user_id')?.value;
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

// GET — list entities with compliance
export async function GET() {
  try {
    const userId = getUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const db = getDb();
    const entities = db.prepare(`SELECT * FROM personal_entities WHERE user_id = ? ORDER BY name`).all(userId) as any[];
    for (const e of entities) {
      e.compliance = db.prepare(`SELECT * FROM personal_entity_compliance WHERE entity_id = ? AND user_id = ? ORDER BY due_date ASC`).all(e.id, userId);
    }
    return NextResponse.json({ entities });
  } catch (error) {
    console.error('Entities GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST — add entity OR add compliance to entity
export async function POST(request: Request) {
  try {
    const userId = getUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const db = getDb();
    const body = await request.json();
    const now = new Date().toISOString();

    if (body.action === 'add_compliance') {
      const { entity_id, title, category, description, due_date, recurrence_rule, recurrence_label, notes } = body;
      if (!entity_id || !title) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
      const id = uuidv4();
      const urgency = computeUrgency(due_date, 'pending');
      db.prepare(`INSERT INTO personal_entity_compliance (id, entity_id, user_id, title, category, description, due_date, recurrence_rule, recurrence_label, status, urgency, notes, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(id, entity_id, userId, title, category || 'custom', description, due_date, recurrence_rule, recurrence_label, 'pending', urgency, notes, now, now);
      return NextResponse.json({ id, message: 'Entity compliance item added' });
    }

    const { name, entity_type, registration_number, description } = body;
    if (!name || !entity_type) return NextResponse.json({ error: 'Name and type required' }, { status: 400 });
    const id = uuidv4();
    db.prepare(`INSERT INTO personal_entities (id, user_id, name, entity_type, registration_number, description, status, created_at, updated_at) VALUES (?,?,?,?,?,?,'active',?,?)`).run(id, userId, name, entity_type, registration_number, description, now, now);
    return NextResponse.json({ id, message: 'Entity added' });
  } catch (error) {
    console.error('Entities POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH — update entity or compliance item
export async function PATCH(request: Request) {
  try {
    const userId = getUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const db = getDb();
    const body = await request.json();

    if (body.compliance_id) {
      const { compliance_id, status, title, due_date } = body;
      const newStatus = status || 'pending';
      const completedAt = newStatus === 'completed' ? new Date().toISOString() : null;
      const urgency = computeUrgency(due_date, newStatus);
      db.prepare(`UPDATE personal_entity_compliance SET status = ?, urgency = ?, completed_at = ?, title = COALESCE(?, title), due_date = COALESCE(?, due_date), updated_at = datetime('now') WHERE id = ? AND user_id = ?`).run(newStatus, urgency, completedAt, title, due_date, compliance_id, userId);
      return NextResponse.json({ message: 'Updated' });
    }

    const { id, name, entity_type, registration_number, description, status } = body;
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
    db.prepare(`UPDATE personal_entities SET name = COALESCE(?, name), entity_type = COALESCE(?, entity_type), registration_number = COALESCE(?, registration_number), description = COALESCE(?, description), status = COALESCE(?, status), updated_at = datetime('now') WHERE id = ? AND user_id = ?`).run(name, entity_type, registration_number, description, status, id, userId);
    return NextResponse.json({ message: 'Updated' });
  } catch (error) {
    console.error('Entities PATCH error:', error);
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
    const type = searchParams.get('type');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
    if (type === 'compliance') {
      db.prepare(`DELETE FROM personal_entity_compliance WHERE id = ? AND user_id = ?`).run(id, userId);
    } else {
      db.prepare(`DELETE FROM personal_entities WHERE id = ? AND user_id = ?`).run(id, userId);
    }
    return NextResponse.json({ message: 'Deleted' });
  } catch (error) {
    console.error('Entities DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
