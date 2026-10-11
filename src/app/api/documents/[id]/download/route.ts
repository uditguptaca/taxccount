import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { requireClientAccess } from '@/lib/tenant';
import { getSessionContext } from '@/lib/auth-context';

export const dynamic = 'force-dynamic';

/**
 * Sends the stored file. The bytes live in Neon (document_blobs); nothing is read
 * from the server's disk. The caller must belong to the firm that owns the
 * document, and a client or individual may only open files on their own record
 * that the firm has not marked internal-only.
 */
export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = getSessionContext();
    if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const db = getDb();
    const doc = await db.prepare(
      'SELECT id, client_id, file_name, mime_type, is_internal_only FROM document_files WHERE id = ? AND org_id = ?'
    ).get(params.id, session.orgId) as any;
    if (!doc) return NextResponse.json({ error: 'Document not found' }, { status: 404 });

    const denied = await requireClientAccess(db, doc.client_id);
    if (denied) return denied;

    const portalUser = session.role === 'client' || session.role === 'individual';
    if (portalUser && doc.is_internal_only) return NextResponse.json({ error: 'Document not found' }, { status: 404 });

    const blob = await db.prepare('SELECT content FROM document_blobs WHERE document_id = ?').get(doc.id) as any;
    if (!blob) {
      return NextResponse.json(
        { error: 'The file for this document was not kept, so it cannot be opened. Please upload it again.' },
        { status: 404 }
      );
    }

    const bytes = Buffer.from(blob.content);
    const safeName = String(doc.file_name || 'document').replace(/[^\w.\- ]+/g, '_');
    return new NextResponse(bytes, {
      status: 200,
      headers: {
        'Content-Type': doc.mime_type || 'application/octet-stream',
        'Content-Length': String(bytes.length),
        'Content-Disposition': `inline; filename="${safeName}"`,
        'X-Content-Type-Options': 'nosniff',
        'Cache-Control': 'private, no-store',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
