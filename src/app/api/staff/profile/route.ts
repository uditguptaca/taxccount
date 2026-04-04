import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import bcryptjs from 'bcryptjs';

// GET: Fetch user profile
export async function GET(req: Request) {
  try {
    const db = getDb();
    const url = new URL(req.url);
    const userId = url.searchParams.get('user_id');

    if (!userId) {
      return NextResponse.json({ error: 'user_id is required' }, { status: 400 });
    }

    const user = db.prepare(`
      SELECT u.id, u.email, u.first_name, u.last_name, u.phone, u.role, u.avatar_url, u.created_at,
        u.mfa_enabled, u.last_login_at
      FROM users u WHERE u.id = ?
    `).get(userId) as any;

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get team memberships
    const teams = db.prepare(`
      SELECT t.name as team_name, tm.role_in_team, tm.joined_at
      FROM team_memberships tm
      JOIN teams t ON t.id = tm.team_id
      WHERE tm.user_id = ? AND tm.is_active = 1
    `).all(userId);

    return NextResponse.json({ user, teams });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH: Update profile
export async function PATCH(req: Request) {
  try {
    const db = getDb();
    const body = await req.json();
    const { user_id, phone, current_password, new_password } = body;

    if (!user_id) {
      return NextResponse.json({ error: 'user_id is required' }, { status: 400 });
    }

    // Update phone if provided
    if (phone !== undefined) {
      db.prepare(`UPDATE users SET phone = ?, updated_at = datetime('now') WHERE id = ?`).run(phone, user_id);
    }

    // Update password if provided
    if (current_password && new_password) {
      const user = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(user_id) as any;
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      const valid = bcryptjs.compareSync(current_password, user.password_hash);
      if (!valid) {
        return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
      }

      const newHash = bcryptjs.hashSync(new_password, 10);
      db.prepare(`UPDATE users SET password_hash = ?, updated_at = datetime('now') WHERE id = ?`).run(newHash, user_id);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
