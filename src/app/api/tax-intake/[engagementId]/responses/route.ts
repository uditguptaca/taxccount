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
    
    // We could filter by module/section if requested via searchParams
    
    const responses = await db.prepare(`
      SELECT * FROM tax_intake_responses WHERE engagement_id = ?
    `).all(params.engagementId);

    return NextResponse.json(responses);
  } catch (err: any) {
    console.error('GET Responses Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { engagementId: string } }) {
  try {
    const db = getDb();
    const auth = await authenticate(req, db, params.engagementId);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const responses = Array.isArray(body) ? body : body.responses;
    if (!responses || !Array.isArray(responses)) {
      return NextResponse.json({ error: 'Invalid body, expected array of responses' }, { status: 400 });
    }

    const now = new Date().toISOString();
    
    const insertSql = (`
      INSERT INTO tax_intake_responses (id, engagement_id, question_id, record_index, value, flag, flag_note, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(engagement_id, question_id, record_index) DO UPDATE SET
        value = excluded.value,
        flag = excluded.flag,
        flag_note = excluded.flag_note,
        updated_at = excluded.updated_at
    `);
    
    const reviewSql = (`
      INSERT INTO tax_intake_review_items (id, engagement_id, question_id, record_index, type, title, description, status, client_note, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    // Using transaction for bulk operation
    const transaction = db.transaction(async (tx: any, resps: any[]) => {
      for (const r of resps) {
        const respId = uuidv4();
        await tx.prepare(insertSql).run(
          respId,
          params.engagementId,
          r.questionId,
          r.recordIndex || 0,
          r.value ?? null,
          r.flag ?? null,
          r.flagNote ?? null,
          now,
          now
        );
        
        // Auto-create review item for unsure/ask_preparer
        if (r.flag === 'unsure' || r.flag === 'ask_preparer') {
          const reviewId = uuidv4();
          await tx.prepare(reviewSql).run(
            reviewId,
            params.engagementId,
            r.questionId,
            r.recordIndex || 0,
            'client_question',
            `Client flagged question: ${r.questionId}`,
            `Flag: ${r.flag}`,
            'open',
            r.flagNote ?? null,
            now
          );
        }
      }

      // Update engagement updated_at
      await tx.prepare(`UPDATE tax_intake_engagements SET updated_at = ? WHERE id = ?`).run(now, params.engagementId);
    });

    await transaction(responses);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('PUT Responses Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
