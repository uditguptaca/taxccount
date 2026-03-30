import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { seedDatabase } from '@/lib/seed';

export async function GET() {
  try {
    seedDatabase();
    const db = getDb();

    const activities = db.prepare(`
      SELECT af.*, u.first_name || ' ' || u.last_name as actor_name,
        u.first_name as actor_first,
        c.display_name as client_name
      FROM activity_feed af
      JOIN users u ON af.actor_id = u.id
      LEFT JOIN clients c ON af.client_id = c.id
      ORDER BY af.created_at DESC
    `).all();

    return NextResponse.json({ activities });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
