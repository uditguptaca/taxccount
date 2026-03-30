import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import fs from 'fs';
import path from 'path';
import { cookies } from 'next/headers';

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const db = getDb();
    const { id } = await params;

    const document = db.prepare(`SELECT * FROM document_files WHERE id = ?`).get(id) as any;
    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    if (document.storage_path && document.storage_path.startsWith('/uploads/')) {
      const filePath = path.join(process.cwd(), 'public', document.storage_path);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // Audit log for deletion
    const cookieStore = cookies();
    const actorId = cookieStore.get('auth_user_id')?.value || 'system';
    try {
      db.prepare(`
        INSERT INTO audit_logs (id, actor_id, action, entity_type, entity_id, details, created_at)
        VALUES (?, ?, 'DOCUMENT_DELETED', 'document', ?, ?, datetime('now'))
      `).run(uuidv4(), actorId, id, JSON.stringify({ file_name: document.file_name, client_id: document.client_id }));
    } catch (e) { /* audit log optional */ }

    db.prepare(`DELETE FROM document_files WHERE id = ?`).run(id);

    return NextResponse.json({ success: true, message: 'Document deleted successfully' });
  } catch (error: any) {
    console.error('Document delete error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const db = getDb();
    const { id } = await params;
    const body = await request.json();

    const cookieStore = cookies();
    const actorId = cookieStore.get('auth_user_id')?.value || 'system';
    const actorName = cookieStore.get('auth_user_name')?.value || 'System';

    const document = db.prepare(`SELECT * FROM document_files WHERE id = ?`).get(id) as any;
    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    if (body.approval_status) {
      const oldStatus = document.approval_status;
      db.prepare(`UPDATE document_files SET approval_status = ?, updated_at = datetime('now') WHERE id = ?`)
        .run(body.approval_status, id);

      // Record audit log for approval status change
      try {
        db.prepare(`
          INSERT INTO audit_logs (id, actor_id, action, entity_type, entity_id, details, created_at)
          VALUES (?, ?, ?, 'document', ?, ?, datetime('now'))
        `).run(
          uuidv4(),
          actorId,
          `DOCUMENT_${body.approval_status}`,
          id,
          JSON.stringify({
            file_name: document.file_name,
            client_id: document.client_id,
            engagement_id: document.engagement_id,
            old_status: oldStatus,
            new_status: body.approval_status,
            actor_name: actorName,
          })
        );
      } catch (e) { /* audit log optional */ }
    }

    if (body.status) {
      db.prepare(`UPDATE document_files SET status = ?, updated_at = datetime('now') WHERE id = ?`)
        .run(body.status, id);
    }

    // Allow updating document_category, financial_year for re-filing
    if (body.document_category) {
      db.prepare(`UPDATE document_files SET document_category = ?, updated_at = datetime('now') WHERE id = ?`)
        .run(body.document_category, id);
    }
    if (body.financial_year !== undefined) {
      db.prepare(`UPDATE document_files SET financial_year = ?, updated_at = datetime('now') WHERE id = ?`)
        .run(body.financial_year, id);
    }

    return NextResponse.json({ success: true, message: 'Document updated successfully' });
  } catch (error: any) {
    console.error('Document update error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
