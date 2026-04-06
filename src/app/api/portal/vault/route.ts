import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { getSessionContext } from "@/lib/auth-context";

function computeUrgency(dueDate: string | null, status: string): string {
  if (status === 'completed') return 'green';
  if (!dueDate) return 'gray';
  const now = new Date();
  const due = new Date(dueDate);
  const daysUntil = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (daysUntil < 0 || status === 'overdue') return 'red';
  if (daysUntil <= 7) return 'red';
  if (daysUntil <= 30) return 'yellow';
  return 'green';
}

// GET /api/portal/vault — Get all personal compliance items + dashboard summary
export async function GET(request: Request) {
  try {
    const session = getSessionContext();
    if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { orgId, userId, role } = session;

    const db = getDb();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all'; // all, personal, family, entity

    // Personal items
    const personalItems = db.prepare(`
      SELECT pci.*, pc.name as consultant_name, pc.specialty as consultant_specialty
      FROM personal_compliance_items pci
      LEFT JOIN personal_consultants pc ON pci.assigned_consultant_id = pc.id
      WHERE pci.user_id = ?
      ORDER BY CASE pci.status WHEN 'overdue' THEN 0 WHEN 'pending' THEN 1 WHEN 'in_progress' THEN 2 ELSE 3 END, pci.due_date ASC
    `).all(userId);

    // Family members with their compliance
    const familyMembers = db.prepare(`SELECT * FROM personal_family_members WHERE user_id = ? ORDER BY relationship, name`).all(userId) as any[];
    for (const fm of familyMembers) {
      fm.compliance = db.prepare(`SELECT * FROM personal_family_compliance WHERE family_member_id = ? AND user_id = ? ORDER BY due_date ASC`).all(fm.id, userId);
    }

    // Entities with their compliance
    const entities = db.prepare(`SELECT * FROM personal_entities WHERE user_id = ? ORDER BY name`).all(userId) as any[];
    for (const e of entities) {
      e.compliance = db.prepare(`SELECT * FROM personal_entity_compliance WHERE entity_id = ? AND user_id = ? ORDER BY due_date ASC`).all(e.id, userId);
    }

    // Consultants
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

    // Update urgency for all items dynamically
    const updateUrgency = db.prepare(`UPDATE personal_compliance_items SET urgency = ?, status = CASE WHEN status != 'completed' AND ? = 'red' AND due_date < datetime('now') THEN 'overdue' ELSE status END WHERE id = ?`);
    for (const item of personalItems as any[]) {
      const newUrgency = computeUrgency(item.due_date, item.status);
      if (newUrgency !== item.urgency) {
        updateUrgency.run(newUrgency, newUrgency, item.id);
        item.urgency = newUrgency;
      }
    }

    // Summary
    const allItems = [
      ...(personalItems as any[]),
      ...familyMembers.flatMap((fm: any) => fm.compliance || []),
      ...entities.flatMap((e: any) => e.compliance || []),
    ];
    const summary = {
      total: allItems.length,
      pending: allItems.filter(i => i.status === 'pending' || i.status === 'in_progress').length,
      overdue: allItems.filter(i => i.urgency === 'red' && i.status !== 'completed').length,
      completed: allItems.filter(i => i.status === 'completed').length,
      upcoming_30: allItems.filter(i => {
        if (!i.due_date || i.status === 'completed') return false;
        const d = new Date(i.due_date);
        const now = new Date();
        return d > now && d < new Date(now.getTime() + 30 * 86400000);
      }).length,
      family_count: familyMembers.length,
      entity_count: entities.length,
      consultant_count: consultants.length,
    };

    return NextResponse.json({
      personalItems,
      familyMembers,
      entities,
      consultants,
      summary,
    });
  } catch (error) {
    console.error('Vault GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/portal/vault — Create personal compliance item
export async function POST(request: Request) {
  try {
    const session = getSessionContext();
    if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { orgId, userId, role } = session;

    const db = getDb();
    const body = await request.json();
    const { title, category, description, due_date, recurrence_rule, recurrence_label, notes } = body;

    if (!title) return NextResponse.json({ error: 'Title is required' }, { status: 400 });

    const id = uuidv4();
    const urgency = computeUrgency(due_date, 'pending');
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO personal_compliance_items (id, user_id, title, category, description, due_date, recurrence_rule, recurrence_label, status, urgency, notes, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?, ?)
    `).run(id, userId, title, category || 'custom', description || null, due_date || null, recurrence_rule || null, recurrence_label || null, urgency, notes || null, now, now);

    return NextResponse.json({ id, message: 'Compliance item created' });
  } catch (error) {
    console.error('Vault POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/portal/vault — Update compliance item
export async function PATCH(request: Request) {
  try {
    const session = getSessionContext();
    if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { orgId, userId, role } = session;

    const db = getDb();
    const body = await request.json();
    const { id, title, category, description, due_date, recurrence_rule, recurrence_label, status, notes, assigned_consultant_id } = body;

    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

    const existing = db.prepare(`SELECT * FROM personal_compliance_items WHERE id = ? AND user_id = ?`).get(id, userId);
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const newStatus = status || (existing as any).status;
    const newUrgency = computeUrgency(due_date || (existing as any).due_date, newStatus);
    const completedAt = newStatus === 'completed' ? new Date().toISOString() : (existing as any).completed_at;

    db.prepare(`
      UPDATE personal_compliance_items 
      SET title = COALESCE(?, title), category = COALESCE(?, category), description = COALESCE(?, description),
          due_date = COALESCE(?, due_date), recurrence_rule = COALESCE(?, recurrence_rule), recurrence_label = COALESCE(?, recurrence_label),
          status = ?, urgency = ?, notes = COALESCE(?, notes), assigned_consultant_id = ?,
          completed_at = ?, updated_at = datetime('now')
      WHERE id = ? AND user_id = ?
    `).run(title, category, description, due_date, recurrence_rule, recurrence_label, newStatus, newUrgency, notes, assigned_consultant_id !== undefined ? assigned_consultant_id : (existing as any).assigned_consultant_id, completedAt, id, userId);

    return NextResponse.json({ message: 'Updated' });
  } catch (error) {
    console.error('Vault PATCH error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/portal/vault — Delete compliance item
export async function DELETE(request: Request) {
  try {
    const session = getSessionContext();
    if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { orgId, userId, role } = session;

    const db = getDb();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

    db.prepare(`DELETE FROM personal_compliance_items WHERE id = ? AND user_id = ?`).run(id, userId);
    return NextResponse.json({ message: 'Deleted' });
  } catch (error) {
    console.error('Vault DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
