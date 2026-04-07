import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSessionContext } from "@/lib/auth-context";

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {

        const session = getSessionContext();
    if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { orgId, userId, role } = session;

    const db = getDb();
    const docId = params.id;

    if (!docId) {
      return NextResponse.json({ error: 'Document ID is required' }, { status: 400 });
    }

    const doc = db.prepare(`SELECT storage_path FROM document_files WHERE id = ?`).get(docId) as any;

    if (!doc || !doc.storage_path) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // In a production app, here is where we would verify the user making the request
    // using cookies/tokens and verify they have access to the client_id attached to the document.
    // Then we would call S3: await getSignedUrl(s3Client, new GetObjectCommand({Bucket, Key}), { expiresIn: 3600 })
    
    // For this MVP, we simulate the signed URL behavior by just returning the local path
    // which the frontend will use to initiate the download.
    const signedUrlMock = doc.storage_path;
    return NextResponse.redirect(new URL(signedUrlMock, request.url));

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
