import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSessionContext } from "@/lib/auth-context";

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {

        const session = getSessionContext();
    if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { orgId, userId, role } = session;

    const db = getDb();
    const body = await request.json();
    const { first_name, last_name, email, role: newMemberRole, phone, team_id } = body;

    if (!first_name || !last_name || !email || !newMemberRole) {
      return NextResponse.json({ error: 'Name, Email, and Role are required' }, { status: 400 });
    }

    const { v4: uuidv4 } = require('uuid');
    const newUserId = uuidv4();

    // Default password for simplicity in this demo MVP
    const password_hash = 'default_hashed_password';

    await db.transaction(async function(this: any) {
      const txDb = this;
      // Create user
      await txDb.prepare(`
        INSERT INTO users (id, first_name, last_name, email, phone, role, password_hash, is_active, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, 1, NOW(), NOW())
      `).run(newUserId, first_name, last_name, email, phone || null, newMemberRole, password_hash);

      // Add to organization
      await txDb.prepare(`
        INSERT INTO organization_memberships (id, org_id, user_id, role, status, joined_at)
        VALUES (?, ?, ?, ?, 'active', NOW())
      `).run(uuidv4(), orgId, newUserId, newMemberRole);

      // Join team if selected
      if (team_id) {
        await txDb.prepare(`
          INSERT INTO team_memberships (id, org_id, team_id, user_id, role_in_team, joined_at, is_active)
          VALUES (?, ?, ?, ?, 'member', NOW(), 1)
        `).run(uuidv4(), orgId, team_id, newUserId);
      }
    });

    return NextResponse.json({ success: true, user_id: newUserId });
  } catch (error: any) {
    console.error('Create team member error:', error);
    const msg = error.message || '';
    if (msg.includes('UNIQUE constraint failed') || msg.includes('duplicate key value') || msg.includes('already exists')) {
      return NextResponse.json({ error: 'A user with this email already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = getSessionContext();
    if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { orgId } = session;

    const db = getDb();
    const body = await request.json();
    const { user_id, role: memberRole, team_id } = body;

    if (!user_id || !memberRole) {
      return NextResponse.json({ error: 'User ID and Role are required' }, { status: 400 });
    }

    await db.transaction(async function(this: any) {
      const txDb = this;
      // Update user role
      await txDb.prepare(`UPDATE users SET role = ?, updated_at = NOW() WHERE id = ?`).run(memberRole, user_id);

      // Update organization membership role
      await txDb.prepare(`UPDATE organization_memberships SET role = ? WHERE user_id = ? AND org_id = ?`).run(memberRole, user_id, orgId);

      // Replace team memberships (scoped to org)
      await txDb.prepare(`DELETE FROM team_memberships WHERE user_id = ? AND org_id = ?`).run(user_id, orgId);
      
      if (team_id) {
        const { v4: uuidv4 } = require('uuid');
        await txDb.prepare(`
          INSERT INTO team_memberships (id, org_id, team_id, user_id, role_in_team, joined_at, is_active)
          VALUES (?, ?, ?, ?, 'member', NOW(), 1)
        `).run(uuidv4(), orgId, team_id, user_id);
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Update team member error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
