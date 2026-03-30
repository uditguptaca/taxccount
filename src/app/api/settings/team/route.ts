import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const db = getDb();
    const body = await request.json();
    const { first_name, last_name, email, role, phone, team_id } = body;

    if (!first_name || !last_name || !email || !role) {
      return NextResponse.json({ error: 'Name, Email, and Role are required' }, { status: 400 });
    }

    const { v4: uuidv4 } = require('uuid');
    const userId = uuidv4();

    // Default password for simplicity in this demo MVP
    const password_hash = 'default_hashed_password';

    db.transaction(() => {
      // Create user
      db.prepare(`
        INSERT INTO users (id, first_name, last_name, email, phone, role, password_hash, is_active, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, 1, datetime('now'), datetime('now'))
      `).run(userId, first_name, last_name, email, phone || null, role, password_hash);

      // Join team if selected
      if (team_id) {
        db.prepare(`
          INSERT INTO team_memberships (id, team_id, user_id, role_in_team, joined_at, is_active)
          VALUES (?, ?, ?, 'member', datetime('now'), 1)
        `).run(uuidv4(), team_id, userId);
      }
    })();

    return NextResponse.json({ success: true, user_id: userId });
  } catch (error: any) {
    if (error.message.includes('UNIQUE constraint failed: users.email')) {
      return NextResponse.json({ error: 'A user with this email already exists' }, { status: 400 });
    }
    console.error('Create team member error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
