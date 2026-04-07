import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSessionContext } from "@/lib/auth-context";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const session = getSessionContext();
    if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { orgId } = session;

    const db = getDb();
    
    // Get all rules with consultant details
    const rules = db.prepare(`
      SELECT r.*, u.first_name, u.last_name, u.email, u.phone 
      FROM firm_consultant_onboarding_rules r
      JOIN users u ON r.consultant_id = u.id
      WHERE r.org_id = ?
      ORDER BY r.priority_order ASC
    `).all(orgId);

    // Parse JSON
    return NextResponse.json({ 
      rules: rules.map((r: any) => ({
        ...r,
        assigned_clients: JSON.parse(r.assigned_clients || '[]'),
        assigned_entities: JSON.parse(r.assigned_entities || '[]'),
        visibility_scopes: JSON.parse(r.visibility_scopes || '{}'),
      })) 
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = getSessionContext();
    if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { orgId } = session;

    const body = await req.json();
    const { consultant_id, assigned_clients, assigned_entities, visibility_scopes, onboarding_status, role_type, internal_notes, priority_order } = body;

    const db = getDb();
    
    // check if it exists
    const exists = db.prepare('SELECT id FROM firm_consultant_onboarding_rules WHERE org_id = ? AND consultant_id = ?').get(orgId, consultant_id);
    if (exists) return NextResponse.json({ error: 'Rules already exist for this consultant' }, { status: 400 });

    const id = crypto.randomUUID();
    db.prepare(`
      INSERT INTO firm_consultant_onboarding_rules 
      (id, org_id, consultant_id, assigned_clients, assigned_entities, visibility_scopes, onboarding_status, role_type, internal_notes, priority_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, orgId, consultant_id, 
      JSON.stringify(assigned_clients || []), 
      JSON.stringify(assigned_entities || []), 
      JSON.stringify(visibility_scopes || {}), 
      onboarding_status || 'draft', 
      role_type || 'external_consultant', 
      internal_notes || '', 
      priority_order || 0
    );

    return NextResponse.json({ success: true, id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = getSessionContext();
    if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { orgId } = session;

    const body = await req.json();
    const { id, assigned_clients, assigned_entities, visibility_scopes, onboarding_status, role_type, internal_notes, priority_order } = body;

    const db = getDb();
    
    db.prepare(`
      UPDATE firm_consultant_onboarding_rules 
      SET assigned_clients = ?, 
          assigned_entities = ?, 
          visibility_scopes = ?, 
          onboarding_status = ?, 
          role_type = ?, 
          internal_notes = ?, 
          priority_order = ?,
          updated_at = datetime('now')
      WHERE id = ? AND org_id = ?
    `).run(
      JSON.stringify(assigned_clients || []), 
      JSON.stringify(assigned_entities || []), 
      JSON.stringify(visibility_scopes || {}), 
      onboarding_status, 
      role_type, 
      internal_notes, 
      priority_order,
      id, 
      orgId
    );

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = getSessionContext();
    if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { orgId } = session;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    const db = getDb();
    db.prepare('DELETE FROM firm_consultant_onboarding_rules WHERE id = ? AND org_id = ?').run(id, orgId);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
