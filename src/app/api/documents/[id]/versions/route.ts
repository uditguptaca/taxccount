import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

import { getSessionContext } from "@/lib/auth-context";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {

        const session = getSessionContext();
    if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { orgId, userId, role } = session;

    const db = getDb();
    const documentId = params.id;

    // Check the document exists and belongs to an accessible client
    const doc = db.prepare(`
      SELECT df.*, c.portal_user_id FROM document_files df
      JOIN clients c ON df.client_id = c.id
      WHERE df.id = ?
    `).get(documentId) as any;

    if (!doc) return NextResponse.json({ error: 'Document not found' }, { status: 404 });

    // RLS: Client can only see their own docs
    // role is already available from session destructure above
    if (role === 'client' && doc.portal_user_id !== userId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Fetch version history
    const versions = db.prepare(`
      SELECT dv.*, u.first_name || ' ' || u.last_name as uploaded_by_name
      FROM document_versions dv
      LEFT JOIN users u ON dv.uploaded_by = u.id
      WHERE dv.document_id = ?
      ORDER BY dv.version_number DESC
    `).all(documentId) as any[];

    // If no explicit versions exist yet, return the current document as version 1
    if (versions.length === 0) {
      return NextResponse.json({
        document_id: documentId,
        current_version: 1,
        versions: [{
          id: doc.id,
          document_id: doc.id,
          version_number: doc.version || 1,
          file_name: doc.file_name,
          storage_path: doc.storage_path,
          file_size_bytes: doc.file_size_bytes,
          mime_type: doc.mime_type,
          uploaded_by: doc.uploaded_by,
          uploaded_by_name: null,
          is_locked: 0,
          created_at: doc.created_at,
        }]
      });
    }

    return NextResponse.json({
      document_id: documentId,
      current_version: versions[0]?.version_number || 1,
      versions,
    });
  } catch (error: any) {
    console.error('Document versions error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
