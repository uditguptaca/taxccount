import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSessionContext } from '@/lib/auth-context';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const session = getSessionContext();
    if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { orgId } = session;
    const db = getDb();

    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const status = searchParams.get('status');

    let query = `
      SELECT f.*,
             (SELECT COUNT(*) FROM smart_form_questions q JOIN smart_form_versions v ON q.version_id = v.id WHERE v.form_id = f.id AND v.status = 'Published') as question_count,
             (SELECT COUNT(*) FROM smart_form_documents d JOIN smart_form_versions v ON d.version_id = v.id WHERE v.form_id = f.id AND v.status = 'Published') as doc_count,
             (SELECT total_assigned FROM smart_form_analytics a WHERE a.form_id = f.id) as usage_count
      FROM smart_forms f
      WHERE f.org_id = ?
    `;
    const params: any[] = [orgId];

    if (category) {
      query += ` AND f.category_id = ?`;
      params.push(category);
    }
    if (status) {
      query += ` AND f.status = ?`;
      params.push(status);
    }

    query += ` ORDER BY f.updated_at DESC`;

    const forms = await db.prepare(query).all(...params);

    return NextResponse.json(forms);
  } catch (err: any) {
    console.error('GET Smart Forms Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = getSessionContext();
    if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { orgId } = session;
    const db = getDb();
    
    const body = await req.json();
    const { name, form_code, description, country, compliance_type, category_id, tags } = body;
    
    if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });

    const formId = uuidv4();
    const versionId = uuidv4();
    const now = new Date().toISOString();

    // Create the form
    await db.prepare(`
      INSERT INTO smart_forms (id, org_id, name, form_code, description, country, compliance_type, category_id, tags, current_version, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Draft', ?, ?)
    `).run(formId, orgId, name, form_code || null, description || null, country || null, compliance_type || null, category_id || null, tags || null, versionId, now, now);

    // Create the initial draft version
    await db.prepare(`
      INSERT INTO smart_form_versions (id, org_id, form_id, version_number, status, created_at, created_by)
      VALUES (?, ?, ?, 1, 'Draft', ?, ?)
    `).run(versionId, orgId, formId, now, session.userId);

    // Create a default section
    const sectionId = uuidv4();
    await db.prepare(`
      INSERT INTO smart_form_sections (id, org_id, version_id, title, sort_order, created_at)
      VALUES (?, ?, ?, 'Section 1', 1, ?)
    `).run(sectionId, orgId, versionId, now);

    return NextResponse.json({ success: true, id: formId, versionId });
  } catch (err: any) {
    console.error('POST Smart Form Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
