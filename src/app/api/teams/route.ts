import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { seedDatabase } from '@/lib/seed';
import { getSessionContext } from "@/lib/auth-context";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = getSessionContext();
    if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { orgId, userId, role } = session;

seedDatabase();
    const db = getDb();
    const teams = db.prepare(`
      SELECT t.*, u.first_name || ' ' || u.last_name as manager_name
      FROM teams t
      LEFT JOIN users u ON u.id = t.manager_id
      ORDER BY t.name ASC
    `).all();

    const members = db.prepare(`
      SELECT tm.*, u.first_name || ' ' || u.last_name as name, u.email, u.role as user_role, u.phone,
        u.first_name, u.last_name,
        t.name as team_name, t.id as team_id,
        (SELECT COUNT(*) FROM client_compliance_stages ccs WHERE ccs.assigned_user_id = u.id AND ccs.status = 'in_progress') as active_stages,
        (SELECT COUNT(*) FROM client_compliance_stages ccs WHERE ccs.assigned_user_id = u.id AND ccs.status = 'pending') as pending_stages,
        (SELECT COUNT(*) FROM client_compliance_stages ccs WHERE ccs.assigned_user_id = u.id AND ccs.status = 'completed') as completed_stages
      FROM team_memberships tm
      JOIN users u ON u.id = tm.user_id
      JOIN teams t ON t.id = tm.team_id
      WHERE tm.is_active = 1
      ORDER BY tm.role_in_team, u.first_name
    `).all();

    // ALL staff members (including unteamed) — powering the "Staff Directory" section
    const allStaff = db.prepare(`
      SELECT u.id, u.first_name, u.last_name, u.first_name || ' ' || u.last_name as name,
        u.email, u.phone, u.role, u.is_active, u.avatar_url, u.last_login_at,
        (SELECT GROUP_CONCAT(t.name, ', ') FROM team_memberships tm JOIN teams t ON t.id = tm.team_id WHERE tm.user_id = u.id AND tm.is_active = 1) as team_names,
        (SELECT COUNT(*) FROM client_compliance_stages ccs WHERE ccs.assigned_user_id = u.id AND ccs.status = 'in_progress') as active_stages,
        (SELECT COUNT(*) FROM client_compliance_stages ccs WHERE ccs.assigned_user_id = u.id AND ccs.status = 'pending') as pending_stages,
        (SELECT COUNT(*) FROM client_compliance_stages ccs WHERE ccs.assigned_user_id = u.id AND ccs.status = 'completed') as completed_stages,
        (SELECT SUM(te.duration_minutes) FROM time_entries te WHERE te.user_id = u.id AND te.entry_date >= date('now', '-30 days')) as hours_last_30
      FROM users u
      WHERE u.role IN ('super_admin','admin','team_manager','team_member')
      ORDER BY u.first_name
    `).all();

    // Also return direct user list for dropdowns
    const users = db.prepare(`
      SELECT u.id, u.first_name, u.last_name, u.email, u.role, u.is_active, u.phone,
        (SELECT t.name FROM team_memberships tm JOIN teams t ON t.id = tm.team_id WHERE tm.user_id = u.id AND tm.is_active = 1 LIMIT 1) as team_name
      FROM users u
      WHERE u.role != 'client'
      ORDER BY u.first_name
    `).all();

    return NextResponse.json({ teams, members, users, allStaff });
  } catch (error) {
    console.error('Teams error:', error);
    return NextResponse.json({ error: 'Failed to load teams' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = getSessionContext();
    if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { orgId, userId, role } = session;

const db = getDb();
    const body = await req.json();
    const { name, description, manager_id } = body;

    if (!name) {
      return NextResponse.json({ error: 'Team name is required' }, { status: 400 });
    }

    const { v4: uuidv4 } = require('uuid');
    const teamId = uuidv4();

    db.prepare(`
      INSERT INTO teams (id, name, description, manager_id, is_active, created_at, updated_at)
      VALUES (?, ?, ?, ?, 1, datetime('now'), datetime('now'))
    `).run(teamId, name, description || '', manager_id || null);

    const newTeam = db.prepare(`SELECT * FROM teams WHERE id = ?`).get(teamId);
    return NextResponse.json(newTeam);
  } catch (error: any) {
    if (error.message.includes('UNIQUE constraint failed')) {
      return NextResponse.json({ error: 'A team with this name already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = getSessionContext();
    if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { orgId, userId, role } = session;

    const db = getDb();
    const body = await req.json();
    const { id, name, description, manager_id } = body;
    if (!id) return NextResponse.json({ error: 'Team ID is required' }, { status: 400 });

    const updates: string[] = [];
    const values: any[] = [];
    if (name !== undefined) { updates.push('name = ?'); values.push(name); }
    if (description !== undefined) { updates.push('description = ?'); values.push(description); }
    if (manager_id !== undefined) { updates.push('manager_id = ?'); values.push(manager_id || null); }
    if (updates.length > 0) {
      updates.push("updated_at = datetime('now')");
      values.push(id);
      db.prepare(`UPDATE teams SET ${updates.join(', ')} WHERE id = ?`).run(...values);
    }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = getSessionContext();
    if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { orgId, userId, role } = session;

const db = getDb();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Team ID is required' }, { status: 400 });
    // Soft delete: deactivate team and memberships
    db.prepare(`UPDATE teams SET is_active = 0, updated_at = datetime('now') WHERE id = ?`).run(id);
    db.prepare(`UPDATE team_memberships SET is_active = 0 WHERE team_id = ?`).run(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
