import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSessionContext } from "@/lib/auth-context";

export const dynamic = 'force-dynamic';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {

        const session = getSessionContext();
    if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { orgId, userId, role } = session;

    const { id } = await params;
    const db = getDb();
    const client = db.prepare('SELECT * FROM clients WHERE portal_user_id = ?').get(userId) as any;
    if (!client) return NextResponse.json({ error: 'Client not found' }, { status: 404 });

    // Verify compliance belongs to this client
    const compliance = db.prepare(`
      SELECT cc.*, ct.name as template_name, ct.code as template_code
      FROM client_compliances cc
      JOIN compliance_templates ct ON cc.template_id = ct.id
      WHERE cc.id = ? AND cc.client_id = ?
    `).get(id, client.id) as any;
    if (!compliance) return NextResponse.json({ error: 'Compliance not found' }, { status: 404 });

    // Get stages (only client-visible)
    const stages = db.prepare(`
      SELECT ccs.*, u.first_name || ' ' || u.last_name as assigned_name
      FROM client_compliance_stages ccs
      LEFT JOIN users u ON ccs.assigned_user_id = u.id
      WHERE ccs.engagement_id = ?
      ORDER BY ccs.sequence_order ASC
    `).all(id) as any[];

    // Filter to client-visible stages using template
    const templateStages = db.prepare(`
      SELECT stage_code, is_client_visible FROM compliance_template_stages WHERE template_id = ?
    `).all(compliance.template_id) as any[];
    const visibleCodes = new Set(templateStages.filter((s: any) => s.is_client_visible).map((s: any) => s.stage_code));
    const clientStages = stages.filter((s: any) => visibleCodes.has(s.stage_code));

    // Documents for this engagement
    const documents = db.prepare(`
      SELECT df.*, u.first_name || ' ' || u.last_name as uploaded_by_name
      FROM document_files df
      LEFT JOIN users u ON df.uploaded_by = u.id
      WHERE df.engagement_id = ? AND df.is_internal_only = 0 AND df.is_client_visible = 1
      ORDER BY df.created_at DESC
    `).all(id) as any[];

    // Required doc checklist
    const requiredDocs = db.prepare(`
      SELECT ctd.*,
        (SELECT COUNT(*) FROM document_files df WHERE df.engagement_id = ? AND df.template_doc_id = ctd.id) as uploaded_count
      FROM compliance_template_documents ctd
      WHERE ctd.template_id = ? AND ctd.upload_by IN ('client', 'either')
      ORDER BY ctd.is_mandatory DESC
    `).all(id, compliance.template_id) as any[];

    // Chat threads for this engagement
    const chatThreads = db.prepare(`
      SELECT cht.*, 
        (SELECT COUNT(*) FROM chat_messages cm WHERE cm.thread_id = cht.id AND cm.is_read = 0 AND cm.sender_id != ?) as unread_count
      FROM chat_threads cht
      WHERE cht.engagement_id = ? AND cht.thread_type = 'client_facing'
      ORDER BY cht.last_message_at DESC
    `).all(userId, id) as any[];

    // Invoices for this engagement
    const invoices = db.prepare(`
      SELECT * FROM invoices WHERE engagement_id = ? AND client_id = ?
      ORDER BY created_at DESC
    `).all(id, client.id) as any[];

    // Map internal status -> client label
    const currentStage = stages.find((s: any) => s.status === 'in_progress');
    let clientStatus = 'In Progress';
    if (compliance.status === 'completed') clientStatus = 'Completed';
    else if (compliance.status === 'new') clientStatus = 'Not Started';
    else if (currentStage) {
      const code = currentStage.stage_code;
      if (['DATA_COLLECTION', 'ONBOARDING'].includes(code)) clientStatus = 'Waiting for You';
      else if (code === 'SENT_TO_CLIENT') clientStatus = 'Review & Sign';
      else if (['BILLING', 'PAYMENT_RECEIVED'].includes(code)) clientStatus = 'Payment Required';
      else if (['FINAL_FILING', 'DOC_CHECKLIST', 'COMPLETED'].includes(code)) clientStatus = 'Completed';
    }

    return NextResponse.json({
      compliance: { ...compliance, client_status: clientStatus },
      stages: clientStages,
      documents,
      requiredDocs,
      chatThreads,
      invoices,
    });
  } catch (error) {
    console.error('Portal compliance detail error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
