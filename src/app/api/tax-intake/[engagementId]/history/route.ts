import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { authenticateIntake as authenticate } from '@/lib/tax-intake-access';

export const dynamic = 'force-dynamic';

/** Every change to answers, newest first. Firm only. ?questionId=&recordIndex= narrows it to one answer. */
export async function GET(req: Request, { params }: { params: { engagementId: string } }) {
  try {
    const db = getDb();
    const auth = await authenticate(req, db, params.engagementId);
    if (!auth || auth.isClient) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const sp = new URL(req.url).searchParams;
    let sql = `SELECT h.question_id, h.record_index, h.value, h.flag, h.flag_note, h.action, h.changed_by_role, h.catalogue_version, h.changed_at,
      COALESCE(u.first_name || ' ' || u.last_name, h.changed_by) AS changed_by_name
      FROM tax_intake_response_history h LEFT JOIN users u ON u.id = h.changed_by WHERE h.engagement_id = ?`;
    const args: any[] = [params.engagementId];
    if (sp.get('questionId')) { sql += ' AND h.question_id = ?'; args.push(sp.get('questionId')); }
    if (sp.get('recordIndex') !== null && sp.get('recordIndex') !== '') { sql += ' AND h.record_index = ?'; args.push(Number(sp.get('recordIndex'))); }
    sql += ' ORDER BY h.changed_at DESC LIMIT 300';
    const rows = await db.prepare(sql).all(...args);
    return NextResponse.json({ history: rows });
  } catch (err: any) {
    console.error('GET History Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
