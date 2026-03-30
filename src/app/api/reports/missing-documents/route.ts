import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const db = getDb();
    
    // Find missing mandatory documents for active engagements
    const missingDocs = db.prepare(`
      SELECT 
        c.id as client_id,
        c.display_name as client_name,
        c.client_code,
        ct.name as template_name,
        cc.id as engagement_id,
        cc.engagement_code,
        cc.due_date,
        ctd.document_name,
        ctd.description as document_description
      FROM client_compliances cc
      JOIN clients c ON cc.client_id = c.id
      JOIN compliance_templates ct ON cc.template_id = ct.id
      JOIN compliance_template_documents ctd ON ct.id = ctd.template_id
      LEFT JOIN document_files df 
        ON df.engagement_id = cc.id 
        AND df.template_doc_id = ctd.id
      WHERE cc.status NOT IN ('completed', 'cancelled')
        AND ctd.is_mandatory = 1
        AND df.id IS NULL
      ORDER BY cc.due_date ASC, c.display_name ASC
    `).all();

    return NextResponse.json({ missingDocuments: missingDocs });
  } catch (error) {
    console.error('Error fetching missing documents report:', error);
    return NextResponse.json({ error: 'Failed to fetch report' }, { status: 500 });
  }
}
