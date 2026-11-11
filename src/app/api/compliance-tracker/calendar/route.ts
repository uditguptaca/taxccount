// The signed-in person's due dates as a calendar file (.ics): every open compliance of every saved check, with its
// next dates, a reminder a week before and the day before, the penalty and the official source in the notes.
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSessionContext } from '@/lib/auth-context';
import { loadProfile, type ProfileRow } from '@/lib/compliance-tracker';
import { toIcs, type CalItem } from '@/lib/compliance/ics';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const s = getSessionContext();
    if (!s || !s.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const db = getDb();
    const rows: ProfileRow[] = await db.prepare("SELECT * FROM compliance_tracker_profiles WHERE user_id = ? AND status = 'active' ORDER BY created_at").all(s.userId);
    const items: CalItem[] = [];
    for (const p of rows) {
      const prof = await loadProfile(db, p);
      for (const i of prof.items) {
        if (i.status === 'completed' || !i.dueDate) continue;
        const base = { id: i.id, title: i.title, who: prof.label, penalty: i.penalty, sourceUrl: i.sourceUrl || null, authority: i.authority || null };
        const first = String(i.dueDate).slice(0, 10);
        items.push({ ...base, date: first });
        // the dates after that, when the rule gives them (a date the person set by hand stands alone)
        for (const u of (i.upcoming ?? []) as { date: string }[]) if (u.date > first && !items.some((x) => x.id === i.id && x.date === u.date)) items.push({ ...base, date: u.date });
      }
    }
    return new NextResponse(toIcs(items, new Date().toISOString()), { headers: { 'Content-Type': 'text/calendar; charset=utf-8', 'Content-Disposition': 'attachment; filename="my-compliances.ics"', 'Cache-Control': 'private, no-store' } });
  } catch (e: any) { console.error('compliance-tracker calendar GET', e); return NextResponse.json({ error: e.message }, { status: 500 }); }
}
