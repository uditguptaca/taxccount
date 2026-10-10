import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSessionContext } from '@/lib/auth-context';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

function authenticate(req: Request, db: any, engagementId: string) {
  const { searchParams } = new URL(req.url);
  const portalToken = searchParams.get('portal_token');
  
  if (portalToken) {
    const engagement = db.prepare(`SELECT org_id FROM tax_intake_engagements WHERE id = ? AND portal_token = ?`).get(engagementId, portalToken);
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
    const auth = authenticate(req, db, params.engagementId);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const documents = db.prepare(`
      SELECT * FROM tax_intake_documents WHERE engagement_id = ?
    `).all(params.engagementId);

    return NextResponse.json(documents);
  } catch (err: any) {
    console.error('GET Documents Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: { engagementId: string } }) {
  try {
    const db = getDb();
    const auth = authenticate(req, db, params.engagementId);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { questionId, sectionId, recordIndex, fileName, fileType, fileSizeBytes, storageKey } = body;
    
    if (!fileName) {
      return NextResponse.json({ error: 'Missing required field: fileName' }, { status: 400 });
    }

    const documentId = uuidv4();
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO tax_intake_documents (id, engagement_id, question_id, section_id, record_index, file_name, file_type, file_size_bytes, storage_key, upload_status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)
    `).run(
      documentId,
      params.engagementId,
      questionId || null,
      sectionId || null,
      recordIndex || 0,
      fileName,
      fileType || null,
      fileSizeBytes || 0,
      storageKey || null,
      now
    );

    return NextResponse.json({ success: true, id: documentId });
  } catch (err: any) {
    console.error('POST Documents Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// NOTE: We put DELETE inside this same route, although standard REST sometimes expects it at /documents/[id].
// This expects docId passed as query parameter ?docId=
export async function DELETE(req: Request, { params }: { params: { engagementId: string } }) {
  try {
    const db = getDb();
    const auth = authenticate(req, db, params.engagementId);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const { searchParams } = new URL(req.url);
    const docId = searchParams.get('docId');
    if (!docId) {
      return NextResponse.json({ error: 'Missing docId' }, { status: 400 });
    }

    db.prepare(`DELETE FROM tax_intake_documents WHERE id = ? AND engagement_id = ?`).run(docId, params.engagementId);
    
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('DELETE Documents Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
