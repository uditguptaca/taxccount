import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSessionContext } from "@/lib/auth-context";

export async function POST(req: Request) {
  try {
    const session = getSessionContext();
    if (!session || !session.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { userId } = session;

    const body = await req.json();
    const { default_date_range, target_billable_hours_weekly, target_utilization_pct, visible_kpis } = body;

    const db = getDb();
    
    // UPSERT style logic
    const exists = db.prepare('SELECT user_id FROM user_reporting_preferences WHERE user_id = ?').get(userId);

    if (exists) {
      db.prepare(`
        UPDATE user_reporting_preferences 
        SET default_date_range = ?, target_billable_hours_weekly = ?, target_utilization_pct = ?, visible_kpis = ?, updated_at = datetime('now')
        WHERE user_id = ?
      `).run(default_date_range || '30d', target_billable_hours_weekly || 35, target_utilization_pct || 80, visible_kpis ? JSON.stringify(visible_kpis) : null, userId);
    } else {
      db.prepare(`
        INSERT INTO user_reporting_preferences (user_id, default_date_range, target_billable_hours_weekly, target_utilization_pct, visible_kpis)
        VALUES (?, ?, ?, ?, ?)
      `).run(userId, default_date_range || '30d', target_billable_hours_weekly || 35, target_utilization_pct || 80, visible_kpis ? JSON.stringify(visible_kpis) : null);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Staff reporting settings error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
