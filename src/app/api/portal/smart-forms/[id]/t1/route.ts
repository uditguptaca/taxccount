import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSessionContext } from '@/lib/auth-context';
import { clientIdsFor } from '@/lib/portal-client';
import { randomUUID } from 'crypto';

export const dynamic = 'force-dynamic';

const DEFAULT_YEAR = '2025';

/**
 * A client opening an assigned "T1 Personal Income Tax Return" smart form is sent to the detailed T1 intake.
 * This finds that client's intake for the year, or starts it, and returns its id. Starting is safe to repeat.
 */
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = getSessionContext();
    if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const db = getDb();
    const { id } = await params;
    const clientIds = await clientIdsFor(db, session.orgId, session.userId);
    if (clientIds.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const a = await db.prepare(`SELECT a.id, a.client_id, a.org_id, f.form_code, c.display_name
      FROM smart_form_assignments a JOIN smart_forms f ON a.form_id = f.id JOIN clients c ON c.id = a.client_id
      WHERE a.id = ? AND a.org_id = ? AND a.client_id IN (${clientIds.map(() => '?').join(',')})`).get(id, session.orgId, ...clientIds);
    if (!a) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (a.form_code !== 'CAN-T1-INTAKE') return NextResponse.json({ error: 'This form is not the T1 intake' }, { status: 400 });

    let eng = await db.prepare("SELECT id FROM tax_intake_engagements WHERE org_id = ? AND client_id = ? AND tax_year = ? AND filing_type = 'original'").get(a.org_id, a.client_id, DEFAULT_YEAR);
    if (!eng) {
      const now = new Date().toISOString(), newId = randomUUID();
      await db.prepare(`INSERT INTO tax_intake_engagements (id, org_id, client_id, client_name, taxpayer_name, tax_year, filing_type, status, active_modules, created_at, updated_at, portal_token)
        VALUES (?, ?, ?, ?, ?, ?, 'original', 'not_started', '[]', ?, ?, ?) ON CONFLICT DO NOTHING`).run(newId, a.org_id, a.client_id, a.display_name, a.display_name, DEFAULT_YEAR, now, now, randomUUID());
      eng = await db.prepare("SELECT id FROM tax_intake_engagements WHERE org_id = ? AND client_id = ? AND tax_year = ? AND filing_type = 'original'").get(a.org_id, a.client_id, DEFAULT_YEAR);
    }
    return NextResponse.json({ engagementId: eng.id });
  } catch (err: any) {
    console.error('POST Portal T1 start Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
