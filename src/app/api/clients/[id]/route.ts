import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { seedDatabase } from '@/lib/seed';
import { getSessionContext } from '@/lib/auth-context';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = getSessionContext();
    if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { orgId, userId, role } = session;

    seedDatabase();
    const db = getDb();
    const { id } = await params;

    if (role === 'team_member' && userId) {
      const accessCheck = db.prepare(`
        SELECT 1 FROM client_compliances cc
        LEFT JOIN team_memberships tm ON tm.team_id = cc.assigned_team_id
        LEFT JOIN client_compliance_stages ccs ON ccs.engagement_id = cc.id
        WHERE cc.client_id = ? AND cc.org_id = ? AND (tm.user_id = ? OR ccs.assigned_user_id = ?)
        LIMIT 1
      `).get(id, orgId, userId, userId);

      if (!accessCheck) {
        return NextResponse.json({ error: 'Unauthorized: Client not assigned to you' }, { status: 403 });
      }
    }

    const client = db.prepare(`SELECT * FROM clients WHERE id = ? AND org_id = ?`).get(id, orgId);
    if (!client) return NextResponse.json({ error: 'Client not found' }, { status: 404 });

    const contacts = db.prepare(`SELECT * FROM client_contacts WHERE client_id = ?`).all(id);
    const personalInfo = db.prepare(`SELECT * FROM client_personal_info WHERE client_id = ?`).all(id);

    const engagements = db.prepare(`
      SELECT cc.*, ct.name as template_name, ct.code as template_code, t.name as team_name,
        (SELECT ccs.stage_name FROM client_compliance_stages ccs WHERE ccs.engagement_id = cc.id AND ccs.status = 'in_progress' LIMIT 1) as current_stage,
        (SELECT u.first_name || ' ' || u.last_name FROM client_compliance_stages ccs JOIN users u ON u.id = ccs.assigned_user_id WHERE ccs.engagement_id = cc.id AND ccs.status = 'in_progress' LIMIT 1) as assigned_to
      FROM client_compliances cc
      JOIN compliance_templates ct ON ct.id = cc.template_id
      LEFT JOIN teams t ON t.id = cc.assigned_team_id
      WHERE cc.client_id = ? AND cc.org_id = ?
      ORDER BY cc.financial_year DESC, cc.created_at DESC
    `).all(id, orgId);

    // Tags
    const tags = db.prepare(`
      SELECT ct.name, ct.color
      FROM client_tag_assignments cta
      JOIN client_tags ct ON ct.id = cta.tag_id
      WHERE cta.client_id = ?
      ORDER BY ct.name
    `).all(id);

    // Invoices for this client
    const invoices = db.prepare(`
      SELECT i.*, cc.engagement_code
      FROM invoices i
      LEFT JOIN client_compliances cc ON i.engagement_id = cc.id
      WHERE i.client_id = ? AND i.org_id = ?
      ORDER BY i.issued_date DESC
    `).all(id, orgId);

    // Documents for this client
    const documents = db.prepare(`
      SELECT df.*, u.first_name || ' ' || u.last_name as uploaded_by_name
      FROM document_files df
      LEFT JOIN users u ON df.uploaded_by = u.id
      WHERE df.client_id = ? AND df.org_id = ?
      ORDER BY df.created_at DESC
    `).all(id, orgId);

    // Chat threads for this client
    const threads = db.prepare(`
      SELECT ct.*,
        (SELECT cm.content FROM chat_messages cm WHERE cm.thread_id = ct.id ORDER BY cm.created_at DESC LIMIT 1) as last_message,
        (SELECT COUNT(*) FROM chat_messages cm WHERE cm.thread_id = ct.id AND cm.is_read = 0) as unread_count
      FROM chat_threads ct
      WHERE ct.client_id = ? AND ct.org_id = ?
      ORDER BY ct.last_message_at DESC
    `).all(id, orgId);

    // Summary stats
    const summary = {
      total_billed: (invoices as any[]).reduce((sum: number, i: any) => sum + (i.total_amount || 0), 0),
      total_paid: (invoices as any[]).reduce((sum: number, i: any) => sum + (i.paid_amount || 0), 0),
      outstanding: (invoices as any[]).reduce((sum: number, i: any) => sum + (i.total_amount - i.paid_amount), 0),
      active_projects: (engagements as any[]).filter((e: any) => e.status !== 'completed').length,
      total_documents: (documents as any[]).length,
    };

    return NextResponse.json({ client, contacts, personalInfo, engagements, tags, invoices, documents, threads, summary });
  } catch (error) {
    console.error('Client detail error:', error);
    return NextResponse.json({ error: 'Failed to load client' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = getSessionContext();
    if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { orgId } = session;

    const db = getDb();
    const { id } = await params;
    const body = await request.json();

    const {
      display_name,
      primary_email,
      primary_phone,
      client_type,
      status,
      address_line_1,
      city,
      province,
      postal_code,
      notes
    } = body;

    db.prepare(`
      UPDATE clients 
      SET display_name = COALESCE(?, display_name),
          primary_email = COALESCE(?, primary_email),
          primary_phone = COALESCE(?, primary_phone),
          client_type = COALESCE(?, client_type),
          status = COALESCE(?, status),
          address_line_1 = COALESCE(?, address_line_1),
          city = COALESCE(?, city),
          province = COALESCE(?, province),
          postal_code = COALESCE(?, postal_code),
          notes = COALESCE(?, notes),
          updated_at = datetime('now')
      WHERE id = ? AND org_id = ?
    `).run(
      display_name,
      primary_email,
      primary_phone,
      client_type,
      status,
      address_line_1,
      city,
      province,
      postal_code,
      notes,
      id,
      orgId
    );

    return NextResponse.json({ success: true, message: 'Client updated successfully' });
  } catch (error) {
    console.error('Client update error:', error);
    return NextResponse.json({ error: 'Failed to update client' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = getSessionContext();
    if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { orgId, role } = session;

    if (role === 'team_member') {
      return NextResponse.json({ error: 'Unauthorized: Team members cannot delete records' }, { status: 403 });
    }

    const db = getDb();
    const { id } = await params;

    db.prepare(`UPDATE clients SET status = 'archived', updated_at = datetime('now') WHERE id = ? AND org_id = ?`).run(id, orgId);

    return NextResponse.json({ success: true, message: 'Client archived successfully' });
  } catch (error) {
    console.error('Client delete error:', error);
    return NextResponse.json({ error: 'Failed to archive client' }, { status: 500 });
  }
}
