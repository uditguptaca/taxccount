import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSessionContext } from '@/lib/auth-context';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = getSessionContext();
    if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { orgId } = session;
    const db = getDb();
    
    const checklistId = params.id;
    const body = await req.json();
    const { name, checklist_code, description, category, country, status, is_default, items } = body;
    
    if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });

    const now = new Date().toISOString();

    db.exec('BEGIN');

    if (is_default) {
      db.prepare(`UPDATE checklist_library SET is_default = 0 WHERE org_id = ?`).run(orgId);
    }

    db.prepare(`
      UPDATE checklist_library 
      SET name = ?, checklist_code = ?, description = ?, category = ?, country = ?, status = ?, is_default = ?, updated_at = ?
      WHERE id = ? AND org_id = ?
    `).run(name, checklist_code || null, description || null, category || null, country || null, status || 'Active', is_default ? 1 : 0, now, checklistId, orgId);

    // Replace all items
    db.prepare(`DELETE FROM checklist_library_items WHERE checklist_id = ? AND org_id = ?`).run(checklistId, orgId);

    if (items && Array.isArray(items)) {
      const insertItem = db.prepare(`
        INSERT INTO checklist_library_items (
          id, org_id, checklist_id, document_name, document_code, description,
          document_category, is_mandatory, upload_required, upload_by,
          suggested_stage, client_visible, staff_only, accepted_file_types, notes, sort_order,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      let sortOrder = 1;
      for (const item of items) {
        insertItem.run(
          uuidv4(), orgId, checklistId,
          item.document_name, item.document_code || null, item.description || null,
          item.document_category || 'client_supporting',
          item.is_mandatory ? 1 : 0, item.upload_required ? 1 : 0, item.upload_by || 'either',
          item.suggested_stage || null, item.client_visible === false ? 0 : 1, item.staff_only ? 1 : 0,
          item.accepted_file_types || null, item.notes || null, sortOrder++,
          now, now
        );
      }
    }

    db.exec('COMMIT');

    return NextResponse.json({ success: true });
  } catch (err: any) {
    const db = getDb();
    if (db.inTransaction) db.exec('ROLLBACK');
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = getSessionContext();
    if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { orgId } = session;
    const db = getDb();
    const checklistId = params.id;

    // Check if in use
    const templatesUsingIt = db.prepare(`SELECT COUNT(*) as count FROM compliance_template_documents WHERE source_checklist_library_id = ? AND org_id = ?`).get(checklistId, orgId);
    
    if (templatesUsingIt && templatesUsingIt.count > 0) {
      // Soft delete
      db.prepare(`UPDATE checklist_library SET deleted_at = ? WHERE id = ? AND org_id = ?`).run(new Date().toISOString(), checklistId, orgId);
      return NextResponse.json({ success: true, message: 'Checklist soft deleted / deactivated because it is in use.' });
    } else {
      // Hard delete
      db.prepare(`DELETE FROM checklist_library_items WHERE checklist_id = ? AND org_id = ?`).run(checklistId, orgId);
      db.prepare(`DELETE FROM checklist_library WHERE id = ? AND org_id = ?`).run(checklistId, orgId);
      return NextResponse.json({ success: true, message: 'Checklist deleted.' });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  // Duplicate a checklist
  try {
    const session = getSessionContext();
    if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { orgId } = session;
    const db = getDb();
    const checklistId = params.id;

    const original = db.prepare(`SELECT * FROM checklist_library WHERE id = ? AND org_id = ?`).get(checklistId, orgId);
    if (!original) return NextResponse.json({ error: 'Checklist not found' }, { status: 404 });

    const items = db.prepare(`SELECT * FROM checklist_library_items WHERE checklist_id = ? AND org_id = ? ORDER BY sort_order ASC`).all(checklistId, orgId);

    const newId = uuidv4();
    const now = new Date().toISOString();

    db.exec('BEGIN');

    db.prepare(`
      INSERT INTO checklist_library (id, org_id, name, checklist_code, description, category, country, status, is_default, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(newId, orgId, 'Copy of ' + original.name, original.checklist_code ? original.checklist_code + '-COPY' : null, original.description, original.category, original.country, original.status, 0, now, now);

    const insertItem = db.prepare(`
      INSERT INTO checklist_library_items (
        id, org_id, checklist_id, document_name, document_code, description,
        document_category, is_mandatory, upload_required, upload_by,
        suggested_stage, client_visible, staff_only, accepted_file_types, notes, sort_order,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const item of items) {
      insertItem.run(
        uuidv4(), orgId, newId,
        item.document_name, item.document_code, item.description,
        item.document_category, item.is_mandatory, item.upload_required, item.upload_by,
        item.suggested_stage, item.client_visible, item.staff_only, item.accepted_file_types, item.notes, item.sort_order,
        now, now
      );
    }

    db.exec('COMMIT');

    return NextResponse.json({ success: true, id: newId });
  } catch (err: any) {
    const db = getDb();
    if (db.inTransaction) db.exec('ROLLBACK');
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
