import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSessionContext } from '@/lib/auth-context';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

function authenticate(req: Request) {
  // Only preparers (authenticated users) can access notes
  const session = getSessionContext();
  if (session && session.orgId) {
    return { orgId: session.orgId, userId: session.userId };
  }
  return null;
}

export async function GET(req: Request, { params }: { params: { engagementId: string } }) {
  try {
    const auth = authenticate(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const db = getDb();

    const notes = db.prepare(`
      SELECT * FROM tax_intake_preparer_notes WHERE engagement_id = ? ORDER BY created_at DESC
    `).all(params.engagementId);

    return NextResponse.json(notes);
  } catch (err: any) {
    console.error('GET Preparer Notes Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: { engagementId: string } }) {
  try {
    const auth = authenticate(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const db = getDb();

    const body = await req.json();
    const { questionId, sectionId, note } = body;
    
    if (!note) {
      return NextResponse.json({ error: 'Missing required field: note' }, { status: 400 });
    }

    const noteId = uuidv4();
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO tax_intake_preparer_notes (id, engagement_id, question_id, section_id, note, created_by, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      noteId,
      params.engagementId,
      questionId || null,
      sectionId || null,
      note,
      auth.userId,
      now,
      now
    );

    return NextResponse.json({ success: true, id: noteId });
  } catch (err: any) {
    console.error('POST Preparer Notes Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { engagementId: string } }) {
  try {
    const auth = authenticate(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const db = getDb();

    const body = await req.json();
    const { id, note } = body;
    
    if (!id || !note) {
      return NextResponse.json({ error: 'Missing required fields: id, note' }, { status: 400 });
    }

    const now = new Date().toISOString();

    db.prepare(`
      UPDATE tax_intake_preparer_notes
      SET note = ?, updated_at = ?
      WHERE id = ? AND engagement_id = ?
    `).run(note, now, id, params.engagementId);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('PUT Preparer Notes Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
