import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSessionContext } from "@/lib/auth-context";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = getSessionContext();
    if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { userId } = session;

    const db = getDb();
    
    // Ensure table exists (Simplified migration)
    await db.exec(`
      CREATE TABLE IF NOT EXISTS user_notification_preferences (
        user_id TEXT PRIMARY KEY,
        preferences_json TEXT NOT NULL,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const prefs = await db.prepare('SELECT preferences_json FROM user_notification_preferences WHERE user_id = ?').get(userId) as any;
    
    if (!prefs) {
      return NextResponse.json({ preferences: null });
    }

    return NextResponse.json({ preferences: JSON.parse(prefs.preferences_json) });
  } catch (error: any) {
    console.error('Notification settings fetch error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = getSessionContext();
    if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { userId } = session;

    const db = getDb();
    const { preferences } = await request.json();

    if (!preferences) {
      return NextResponse.json({ error: 'Preferences are required' }, { status: 400 });
    }

    const jsonStr = JSON.stringify(preferences);

    await db.prepare(`
      INSERT INTO user_notification_preferences (user_id, preferences_json, updated_at)
      VALUES (?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT (user_id) DO UPDATE SET 
        preferences_json = EXCLUDED.preferences_json,
        updated_at = CURRENT_TIMESTAMP
    `).run(userId, jsonStr);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Notification settings update error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
