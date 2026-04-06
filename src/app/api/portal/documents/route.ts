import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSessionContext } from "@/lib/auth-context";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {

        const session = getSessionContext();
    if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { orgId, userId, role } = session;

    const db = getDb();
    const client = db.prepare('SELECT * FROM clients WHERE portal_user_id = ?').get(userId) as any;
    if (!client) return NextResponse.json({ error: 'Client not found' }, { status: 404 });

    const documents = db.prepare(`
      SELECT df.*, cc.engagement_code, cc.financial_year as eng_year, ct.name as template_name,
        u.first_name || ' ' || u.last_name as uploaded_by_name
      FROM document_files df
      LEFT JOIN client_compliances cc ON df.engagement_id = cc.id
      LEFT JOIN compliance_templates ct ON cc.template_id = ct.id
      LEFT JOIN users u ON df.uploaded_by = u.id
      WHERE df.client_id = ? AND df.is_internal_only = 0 AND df.is_client_visible = 1
      ORDER BY df.created_at DESC
    `).all(client.id) as any[];

    // Get required docs that are still missing
    const requiredDocs = db.prepare(`
      SELECT ctd.document_name, ctd.document_category, ctd.is_mandatory, ctd.id as template_doc_id,
        cc.id as engagement_id, cc.engagement_code, cc.financial_year,
        ct2.name as template_name
      FROM client_compliances cc
      JOIN compliance_templates ct2 ON cc.template_id = ct2.id
      JOIN compliance_template_documents ctd ON ctd.template_id = cc.template_id
        AND ctd.upload_by IN ('client', 'either')
      WHERE cc.client_id = ? AND cc.status != 'completed'
      ORDER BY ctd.is_mandatory DESC
    `).all(client.id) as any[];

    // Mark which required docs have been uploaded
    const enrichedRequired = requiredDocs.map((rd: any) => {
      const existing = documents.find((d: any) => d.engagement_id === rd.engagement_id && d.template_doc_id === rd.template_doc_id);
      return { ...rd, is_uploaded: !!existing, uploaded_file: existing || null };
    });

    return NextResponse.json({ documents, requiredDocs: enrichedRequired });
  } catch (error) {
    console.error('Portal documents error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
