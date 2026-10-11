import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { randomUUID } from 'crypto';
import { authenticateIntake as authenticate, clientMayEdit } from '@/lib/tax-intake-access';
import { CATALOGUE } from '@/lib/t1/catalogue/index';
import { canSubmit, countFindings } from '@/lib/t1/validate';
import { buildPackage } from '@/lib/t1/package';
import { loadState, findingsOf, ctxOf, uploadsOf, refresh, lang } from '@/lib/t1-server';

export const dynamic = 'force-dynamic';

/** The frozen copies of what was submitted, newest first. Firm only: a snapshot holds the whole file. */
export async function GET(req: Request, { params }: { params: { engagementId: string } }) {
  try {
    const db = getDb();
    const auth = await authenticate(req, db, params.engagementId);
    if (!auth || auth.isClient) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const id = new URL(req.url).searchParams.get('id');
    if (id) {
      const row = await db.prepare('SELECT * FROM tax_intake_submissions WHERE id = ? AND engagement_id = ?').get(id, params.engagementId);
      return row ? NextResponse.json(row) : NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    const rows = await db.prepare('SELECT id, engagement_id, version_number, submitted_at, submitted_by, catalogue_version, language, client_acknowledgements FROM tax_intake_submissions WHERE engagement_id = ? ORDER BY version_number DESC').all(params.engagementId);
    return NextResponse.json(rows);
  } catch (err: any) {
    console.error('GET Submissions Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/**
 * "Submit information to my preparer". The rules run again on the server: anything still blocking stops the
 * submission and is returned. Questions the client could not answer are fine when they are flagged. The
 * snapshot is frozen with the questionnaire version and language the client saw.
 */
export async function POST(req: Request, { params }: { params: { engagementId: string } }) {
  try {
    const db = getDb();
    const auth = await authenticate(req, db, params.engagementId);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (auth.isClient && !clientMayEdit(auth.engagement.status)) return NextResponse.json({ error: 'This form was already submitted.', locked: true }, { status: 423 });
    const body = await req.json().catch(() => ({}));
    const acks = body.clientAcknowledgements ?? null;

    const st = await loadState(db, auth.engagement);
    const findings = findingsOf(st);
    if (!canSubmit(findings)) {
      const blocking = findings.filter((f) => f.sev === 'blocking');
      return NextResponse.json({ error: 'A few required items are still missing', blocking: blocking.slice(0, 60), counts: countFindings(findings) }, { status: 422 });
    }
    const L = lang(st.engagement);
    const pkg = buildPackage(CATALOGUE, ctxOf(st), { lang: L, uploads: uploadsOf(st), findings });
    const reviewItems = await db.prepare('SELECT * FROM tax_intake_review_items WHERE engagement_id = ?').all(params.engagementId);
    const now = new Date().toISOString();
    const snapshot = { catalogueVersion: CATALOGUE.version, language: L, answers: st.answers, records: st.records, documents: st.documents, legacy: st.legacy, reviewItems, package: pkg, submittedAt: now };
    const next = await db.prepare('SELECT COALESCE(MAX(version_number), 0) + 1 AS n FROM tax_intake_submissions WHERE engagement_id = ?').get(params.engagementId);
    await db.transaction(async (tx: any) => {
      await tx.prepare('INSERT INTO tax_intake_submissions (id, engagement_id, version_number, snapshot_data, submitted_at, submitted_by, client_acknowledgements, catalogue_version, language, findings_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
        .run(randomUUID(), params.engagementId, Number(next.n), JSON.stringify(snapshot), now, auth.isClient ? 'client' : 'preparer', acks ? JSON.stringify(acks) : null, CATALOGUE.version, L, JSON.stringify(findings));
      await tx.prepare("UPDATE tax_intake_engagements SET status = 'submitted', submitted_at = ?, updated_at = ?, catalogue_version = ? WHERE id = ?").run(now, now, CATALOGUE.version, params.engagementId);
    })();
    await refresh(db, params.engagementId);
    return NextResponse.json({ success: true, version: Number(next.n), counts: countFindings(findings) });
  } catch (err: any) {
    console.error('POST Submit Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
