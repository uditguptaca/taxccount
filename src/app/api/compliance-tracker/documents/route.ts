// The papers a person keeps with a compliance in "My compliances". Owner only: every query carries their user id.
//   POST   form: profileId, complianceId, file      add a file (4 MB at most)
//   GET    ?id=                                     download it
//   DELETE ?id=                                     remove it
import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { getDb } from '@/lib/db';
import { getSessionContext } from '@/lib/auth-context';
import { tableFor } from '@/lib/compliance-tracker';

export const dynamic = 'force-dynamic';
const MAX = 4 * 1024 * 1024;
const TYPES: Record<string, string> = {
  pdf: 'application/pdf', png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp', heic: 'image/heic', txt: 'text/plain', csv: 'text/csv',
  doc: 'application/msword', docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xls: 'application/vnd.ms-excel', xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
};
// The file must be what its name says (independent audit, M8: a web page named x.pdf was stored as a PDF). Binary
// formats are told by their first bytes; text and CSV must not look like a web page.
const SIGS: Record<string, number[][]> = {
  pdf: [[0x25, 0x50, 0x44, 0x46]], png: [[0x89, 0x50, 0x4e, 0x47]], jpg: [[0xff, 0xd8, 0xff]], jpeg: [[0xff, 0xd8, 0xff]],
  webp: [[0x52, 0x49, 0x46, 0x46]], docx: [[0x50, 0x4b, 0x03, 0x04]], xlsx: [[0x50, 0x4b, 0x03, 0x04]],
  doc: [[0xd0, 0xcf, 0x11, 0xe0]], xls: [[0xd0, 0xcf, 0x11, 0xe0]],
};
function looksRight(ext: string, b: Uint8Array): boolean {
  const sig = SIGS[ext];
  if (sig) return sig.some((s) => s.every((v, i) => b[i] === v));
  if (ext === 'txt' || ext === 'csv') return !/^\s*<(!doctype|html|script|svg|\?xml)/i.test(new TextDecoder().decode(b.slice(0, 256)));
  return true;   // heic: varied headers, kept as a download only
}
const me = () => { const s = getSessionContext(); return s && s.userId ? s : null; };

export async function POST(req: Request) {
  try {
    const s = me(); if (!s) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const form = await req.formData().catch(() => null);
    const file = form?.get('file');
    const profileId = String(form?.get('profileId') || ''), complianceId = String(form?.get('complianceId') || '');
    if (!form || !(file instanceof File)) return NextResponse.json({ error: 'Choose a file' }, { status: 400 });
    const db = getDb();
    const p: any = await db.prepare('SELECT id, kind FROM compliance_tracker_profiles WHERE id = ? AND user_id = ?').get(profileId, s.userId);
    if (!p) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const item = await db.prepare(`SELECT id FROM ${tableFor(p.kind)} WHERE tracker_profile_id = ? AND user_id = ? AND tracker_compliance_id = ?`).get(p.id, s.userId, complianceId);
    if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const name = (file.name || 'file').replace(/[\\/\u0000-\u001f]/g, '_').slice(-120);
    const ext = name.includes('.') ? name.split('.').pop()!.toLowerCase() : '';
    if (!TYPES[ext]) return NextResponse.json({ error: 'Use a PDF, an image, or a Word, Excel, CSV or text file' }, { status: 400 });
    if (file.size === 0) return NextResponse.json({ error: 'That file is empty' }, { status: 400 });
    if (file.size > MAX) return NextResponse.json({ error: 'The file is larger than 4 MB' }, { status: 400 });
    const n: any = await db.prepare('SELECT COUNT(*) AS n FROM compliance_tracker_documents WHERE profile_id = ? AND user_id = ?').get(p.id, s.userId);
    if (Number(n.n) >= 300) return NextResponse.json({ error: 'This list already holds 300 files' }, { status: 400 });
    const bytes = Buffer.from(await file.arrayBuffer());
    if (!looksRight(ext, bytes)) return NextResponse.json({ error: `That file is not a real .${ext} file` }, { status: 400 });
    const id = randomUUID();
    await db.prepare('INSERT INTO compliance_tracker_documents (id, profile_id, user_id, compliance_id, file_name, mime_type, size_bytes, content, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
      .run(id, p.id, s.userId, complianceId, name, TYPES[ext], file.size, bytes, new Date().toISOString());
    return NextResponse.json({ success: true, id, name });
  } catch (e: any) { console.error('compliance-tracker documents POST', e); return NextResponse.json({ error: e.message }, { status: 500 }); }
}

export async function GET(req: Request) {
  try {
    const s = me(); if (!s) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const d: any = await getDb().prepare('SELECT file_name, mime_type, content FROM compliance_tracker_documents WHERE id = ? AND user_id = ?').get(new URL(req.url).searchParams.get('id') || '', s.userId);
    if (!d) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const bytes: Buffer = Buffer.isBuffer(d.content) ? d.content : Buffer.from(d.content);
    return new NextResponse(new Uint8Array(bytes), { headers: {
      'Content-Type': d.mime_type, 'Content-Length': String(bytes.length), 'X-Content-Type-Options': 'nosniff', 'Cache-Control': 'private, no-store',
      'Content-Disposition': `attachment; filename="${String(d.file_name).replace(/[^\x20-\x7e]|"/g, '_')}"; filename*=UTF-8''${encodeURIComponent(d.file_name)}`,
    } });
  } catch (e: any) { console.error('compliance-tracker documents GET', e); return NextResponse.json({ error: e.message }, { status: 500 }); }
}

export async function DELETE(req: Request) {
  try {
    const s = me(); if (!s) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const id = new URL(req.url).searchParams.get('id') || '';
    const db = getDb();
    const d = await db.prepare('SELECT id FROM compliance_tracker_documents WHERE id = ? AND user_id = ?').get(id, s.userId);
    if (!d) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    await db.prepare('DELETE FROM compliance_tracker_documents WHERE id = ? AND user_id = ?').run(id, s.userId);
    return NextResponse.json({ success: true });
  } catch (e: any) { console.error('compliance-tracker documents DELETE', e); return NextResponse.json({ error: e.message }, { status: 500 }); }
}
