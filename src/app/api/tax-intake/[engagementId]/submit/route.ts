import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSessionContext } from '@/lib/auth-context';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

async function authenticate(req: Request, db: any, engagementId: string) {
  const { searchParams } = new URL(req.url);
  const portalToken = searchParams.get('portal_token');
  
  if (portalToken) {
    const engagement = await db.prepare(`SELECT org_id FROM tax_intake_engagements WHERE id = ? AND portal_token = ?`).get(engagementId, portalToken);
    if (engagement) return { orgId: engagement.org_id, isClient: true };
    return null;
  }
  
  const session = getSessionContext();
  if (session && session.orgId) return { orgId: session.orgId, isClient: false };
  return null;
}

export async function GET(req: Request, { params }: { params: { engagementId: string } }) {
  try {
    const db = getDb();
    const auth = await authenticate(req, db, params.engagementId);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const submissions = await db.prepare(`
      SELECT * FROM tax_intake_submissions WHERE engagement_id = ? ORDER BY version_number DESC
    `).all(params.engagementId);

    return NextResponse.json(submissions);
  } catch (err: any) {
    console.error('GET Submissions Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: { engagementId: string } }) {
  try {
    const db = getDb();
    const auth = await authenticate(req, db, params.engagementId);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const body = await req.json();
    const { clientAcknowledgements } = body;

    const now = new Date().toISOString();

    // 1. Gather all data
    const responses = await db.prepare(`SELECT * FROM tax_intake_responses WHERE engagement_id = ?`).all(params.engagementId);
    const documents = await db.prepare(`SELECT * FROM tax_intake_documents WHERE engagement_id = ?`).all(params.engagementId);
    const reviewItems = await db.prepare(`SELECT * FROM tax_intake_review_items WHERE engagement_id = ?`).all(params.engagementId);
    const repeatRecords = await db.prepare(`SELECT * FROM tax_intake_repeat_records WHERE engagement_id = ?`).all(params.engagementId);

    const snapshot = {
      responses,
      documents,
      reviewItems,
      repeatRecords,
      submittedAt: now
    };

    // 2. Get next version number
    const nextVersionRow = await db.prepare(`
      SELECT MAX(version_number) as max_v FROM tax_intake_submissions WHERE engagement_id = ?
    `).get(params.engagementId);
    const nextVersion = (nextVersionRow?.max_v || 0) + 1;

    // 3. Start transaction
    const transaction = db.transaction(async (tx: any) => {
      const subId = uuidv4();
      
      // Create snapshot
      await tx.prepare(`
        INSERT INTO tax_intake_submissions (id, engagement_id, version_number, snapshot_data, submitted_at, submitted_by, client_acknowledgements)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        subId,
        params.engagementId,
        nextVersion,
        JSON.stringify(snapshot),
        now,
        auth.isClient ? 'client' : 'preparer',
        clientAcknowledgements ? JSON.stringify(clientAcknowledgements) : null
      );

      // Update engagement status
      await tx.prepare(`
        UPDATE tax_intake_engagements 
        SET status = 'submitted', submitted_at = ?, updated_at = ?
        WHERE id = ?
      `).run(now, now, params.engagementId);
    });

    await transaction();

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('POST Submit Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
