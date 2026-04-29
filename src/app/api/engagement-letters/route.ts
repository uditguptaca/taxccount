import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSessionContext } from "@/lib/auth-context";
import { v4 as uuidv4 } from 'uuid';
import { logActivity } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = getSessionContext();
    if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { orgId } = session;

    const db = getDb();
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('client_id');

    let query = `
      SELECT el.*, c.display_name as client_name, c.client_code,
        cc.engagement_code as project_code
      FROM engagement_letters el
      JOIN clients c ON el.client_id = c.id
      LEFT JOIN client_compliances cc ON el.engagement_id = cc.id
      WHERE el.org_id = ?
    `;
    const params: any[] = [orgId];

    if (clientId) {
      query += ` AND el.client_id = ?`;
      params.push(clientId);
    }

    query += ` ORDER BY el.created_at DESC`;

    const letters = await db.prepare(query).all(...params);
    return NextResponse.json({ letters });
  } catch (error: any) {
    console.error('[EngagementLetters GET Error]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = getSessionContext();
    if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { orgId, userId } = session;

    const db = getDb();
    const body = await request.json();
    const { client_id, engagement_id, proposal_id, legal_text } = body;

    if (!client_id || !legal_text) {
      return NextResponse.json({ error: 'Client ID and Legal Text are required' }, { status: 400 });
    }

    const id = uuidv4();
    const now = new Date().toISOString();

    await db.prepare(`
      INSERT INTO engagement_letters (id, org_id, client_id, engagement_id, proposal_id, legal_text, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, 'draft', ?, ?)
    `).run(id, orgId, client_id, engagement_id || null, proposal_id || null, legal_text, now, now);

    await logActivity({
      orgId,
      actorId: userId,
      action: 'generated_engagement_letter',
      entityType: 'engagement_letter',
      entityId: id,
      entityName: 'Engagement Letter',
      clientId: client_id,
      details: `Generated new engagement letter for client.`
    });

    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    console.error('[EngagementLetters POST Error]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
