import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { randomUUID, createHash } from 'crypto';
import { authenticateIntake as authenticate, clientMayEdit } from '@/lib/tax-intake-access';
import { CATALOGUE } from '@/lib/t1/catalogue/index';
import { refresh } from '@/lib/t1-server';

export const dynamic = 'force-dynamic';

const MAX_FILE = 4 * 1024 * 1024; // files live in the database and Vercel refuses request bodies over 4.5 MB
const TYPES: Record<string, string[]> = { pdf: ['application/pdf'], jpg: ['image/jpeg'], jpeg: ['image/jpeg'], png: ['image/png'], csv: ['text/csv', 'application/vnd.ms-excel'], txt: ['text/plain'], docx: ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'], xlsx: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'] };
const SLIP_STATUS = ['original', 'amended', 'cancelled', 'replaced'];

/** The first bytes must agree with the file type it claims, so a renamed program is never stored as a PDF. */
function signatureOk(ext: string, b: Buffer): boolean {
  if (ext === 'pdf') return b.subarray(0, 5).toString('latin1') === '%PDF-';
  if (ext === 'jpg' || ext === 'jpeg') return b[0] === 0xff && b[1] === 0xd8;
  if (ext === 'png') return b.subarray(0, 8).toString('hex') === '89504e470d0a1a0a';
  if (ext === 'docx' || ext === 'xlsx') return b[0] === 0x50 && b[1] === 0x4b;
  return true;
}

export async function GET(req: Request, { params }: { params: { engagementId: string } }) {
  try {
    const db = getDb();
    const auth = await authenticate(req, db, params.engagementId);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const documents = await db.prepare(`SELECT id, document_file_id, question_id, section_id, record_index, file_name, file_type, file_size_bytes, upload_status, doc_key, issuer, tax_year, slip_status, uploaded_by, created_at, verified_at${auth.isClient ? '' : ', preparer_note'} FROM tax_intake_documents WHERE engagement_id = ? ORDER BY created_at`).all(params.engagementId);
    return NextResponse.json({ documents });
  } catch (err: any) {
    console.error('GET Documents Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/** Upload one file (multipart: file, questionId, recordIndex, docKey, issuer, taxYear, slipStatus). */
export async function POST(req: Request, { params }: { params: { engagementId: string } }) {
  try {
    const db = getDb();
    const auth = await authenticate(req, db, params.engagementId);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const eng = auth.engagement;
    if (auth.isClient && !clientMayEdit(eng.status)) return NextResponse.json({ error: 'This form was submitted.', locked: true }, { status: 423 });

    const form = await req.formData();
    const file = form.get('file') as File | null;
    if (!file || typeof (file as any).arrayBuffer !== 'function') return NextResponse.json({ error: 'Choose a file to upload' }, { status: 400 });
    if (file.size > MAX_FILE) return NextResponse.json({ error: `This file is ${(file.size / 1048576).toFixed(1)} MB. The limit is 4 MB; a smaller photo or a PDF export usually works.` }, { status: 400 });
    if (file.size === 0) return NextResponse.json({ error: 'That file is empty' }, { status: 400 });
    const ext = (file.name.split('.').pop() || '').toLowerCase();
    if (!TYPES[ext] || (file.type && !TYPES[ext].includes(file.type))) return NextResponse.json({ error: 'Only PDF, JPEG, PNG, CSV, TXT, DOCX and XLSX files can be uploaded' }, { status: 400 });
    const bytes = Buffer.from(await file.arrayBuffer());
    if (!signatureOk(ext, bytes)) return NextResponse.json({ error: `This file does not look like a real .${ext} file` }, { status: 400 });

    const questionId = String(form.get('questionId') || '');
    const q = questionId ? CATALOGUE.q.get(questionId) : undefined;
    if (questionId && !q) return NextResponse.json({ error: 'Unknown question' }, { status: 400 });
    const recordIndex = Math.max(0, parseInt(String(form.get('recordIndex') || '0'), 10) || 0);
    const slip = String(form.get('slipStatus') || '');
    const taxYear = String(form.get('taxYear') || '').slice(0, 4);
    const hash = createHash('sha256').update(bytes).digest('hex');
    const mime = file.type || TYPES[ext][0];

    const fileId = randomUUID(), docId = randomUUID(), now = new Date().toISOString();
    await db.transaction(async (tx: any) => {
      await tx.prepare(`INSERT INTO document_files (id, org_id, client_id, uploaded_by, file_name, mime_type, file_size_bytes, document_category, financial_year, status, storage_path, is_internal_only, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'tax_intake', ?, 'new', ?, 0, NOW(), NOW())`).run(fileId, auth.orgId, eng.client_id, auth.userId, file.name.slice(0, 200), mime, file.size, eng.tax_year, `/api/documents/${fileId}/download`);
      await tx.prepare('INSERT INTO document_blobs (document_id, content) VALUES (?, ?)').run(fileId, bytes);
      await tx.prepare(`INSERT INTO tax_intake_documents (id, engagement_id, question_id, section_id, record_index, file_name, file_type, file_size_bytes, storage_key, upload_status, created_at, document_file_id, doc_key, issuer, tax_year, slip_status, content_hash, uploaded_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'uploaded', ?, ?, ?, ?, ?, ?, ?, ?)`).run(docId, eng.id, questionId || null, q?.sec ?? null, recordIndex, file.name.slice(0, 200), mime, file.size, `/api/documents/${fileId}/download`, now, fileId, String(form.get('docKey') || '').slice(0, 60) || null, String(form.get('issuer') || '').slice(0, 200) || null, /^\d{4}$/.test(taxYear) ? taxYear : null, SLIP_STATUS.includes(slip) ? slip : null, hash, auth.userId);
      await tx.prepare("UPDATE tax_intake_engagements SET updated_at = ?, status = CASE WHEN status = 'not_started' THEN 'in_progress' ELSE status END WHERE id = ?").run(now, eng.id);
      // an upload answers a "provide later" promise for that file question
      if (questionId) await tx.prepare("UPDATE tax_intake_responses SET flag = NULL, updated_at = ? WHERE engagement_id = ? AND question_id = ? AND record_index = ? AND flag = 'later'").run(now, eng.id, questionId, recordIndex);
    })();
    await refresh(db, eng.id);
    return NextResponse.json({ success: true, id: docId, documentFileId: fileId, hash });
  } catch (err: any) {
    console.error('POST Documents Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/** Firm only: mark a file verified or rejected and leave a note. Body: { docId, uploadStatus, preparerNote } */
export async function PATCH(req: Request, { params }: { params: { engagementId: string } }) {
  try {
    const db = getDb();
    const auth = await authenticate(req, db, params.engagementId);
    if (!auth || auth.isClient) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const b = await req.json().catch(() => ({}));
    if (!b.docId) return NextResponse.json({ error: 'Missing docId' }, { status: 400 });
    const sets: string[] = [], args: any[] = [];
    if (['uploaded', 'verified', 'rejected'].includes(b.uploadStatus)) {
      sets.push('upload_status = ?'); args.push(b.uploadStatus);
      sets.push('verified_at = ?'); args.push(b.uploadStatus === 'uploaded' ? null : new Date().toISOString());
      sets.push('verified_by = ?'); args.push(b.uploadStatus === 'uploaded' ? null : auth.userId);
    }
    if (typeof b.preparerNote === 'string') { sets.push('preparer_note = ?'); args.push(b.preparerNote.slice(0, 2000)); }
    if (sets.length === 0) return NextResponse.json({ success: true });
    await db.prepare(`UPDATE tax_intake_documents SET ${sets.join(', ')} WHERE id = ? AND engagement_id = ?`).run(...args, b.docId, params.engagementId);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('PATCH Documents Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/** Remove an upload (?docId=). A client can remove only what they uploaded, and only before submitting. */
export async function DELETE(req: Request, { params }: { params: { engagementId: string } }) {
  try {
    const db = getDb();
    const auth = await authenticate(req, db, params.engagementId);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const docId = new URL(req.url).searchParams.get('docId');
    if (!docId) return NextResponse.json({ error: 'Missing docId' }, { status: 400 });
    const doc = await db.prepare('SELECT id, document_file_id, uploaded_by FROM tax_intake_documents WHERE id = ? AND engagement_id = ?').get(docId, params.engagementId);
    if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (auth.isClient && (!clientMayEdit(auth.engagement.status) || doc.uploaded_by !== auth.userId)) return NextResponse.json({ error: 'You can only remove files you uploaded before submitting' }, { status: 403 });
    await db.transaction(async (tx: any) => {
      await tx.prepare('DELETE FROM tax_intake_documents WHERE id = ?').run(docId);
      if (doc.document_file_id) await tx.prepare('DELETE FROM document_files WHERE id = ? AND org_id = ?').run(doc.document_file_id, auth.orgId);   // its bytes go with it
    })();
    await refresh(db, params.engagementId);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('DELETE Documents Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
