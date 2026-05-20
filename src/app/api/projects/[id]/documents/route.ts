import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSessionContext } from '@/lib/auth-context';

export const dynamic = 'force-dynamic';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = getSessionContext();
    if (!session?.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const db = getDb();
    const { id: projectId } = await params;
    
    const documents = await db.prepare(
      `SELECT edr.*, ctd.document_name as template_doc_name, ctd.document_category, ctd.is_mandatory, ctd.upload_by
       FROM engagement_doc_requirements edr
       LEFT JOIN compliance_template_documents ctd ON edr.template_doc_id = ctd.id
       WHERE edr.engagement_id = ? AND edr.org_id = ?
       ORDER BY edr.sort_order, edr.document_name`
    ).all(projectId, session.orgId);
    
    // Calculate progress
    const total = documents.length;
    const required = documents.filter((d: any) => d.is_mandatory === 1).length;
    const completed = documents.filter((d: any) => ['approved', 'not_applicable'].includes(d.status)).length;
    const requiredCompleted = documents.filter((d: any) => d.is_mandatory === 1 && ['approved', 'not_applicable'].includes(d.status)).length;
    
    return NextResponse.json({ documents, progress: { total, required, completed, requiredCompleted } });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = getSessionContext();
    if (!session?.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const db = getDb();
    const { id: projectId } = await params;
    const body = await request.json();
    const { document_id, status, notes, uploaded_file_url } = body;
    
    if (!document_id || !status) {
      return NextResponse.json({ error: 'document_id and status are required' }, { status: 400 });
    }
    
    const validStatuses = ['pending', 'uploaded', 'reviewed', 'approved', 'rejected', 'not_applicable'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` }, { status: 400 });
    }
    
    const updates: string[] = ['status = ?'];
    const values: any[] = [status];
    
    if (uploaded_file_url !== undefined) { updates.push('uploaded_file_url = ?'); values.push(uploaded_file_url); }
    if (notes !== undefined) { updates.push('notes = ?'); values.push(notes); }
    
    if (status === 'uploaded') {
      updates.push('uploaded_by = ?');
      values.push(session.userId);
    }
    if (['reviewed', 'approved', 'rejected'].includes(status)) {
      updates.push('reviewed_by = ?', 'reviewed_at = NOW()');
      values.push(session.userId);
    }
    
    values.push(document_id, session.orgId);
    
    await db.prepare(
      `UPDATE engagement_doc_requirements SET ${updates.join(', ')} WHERE id = ? AND org_id = ?`
    ).run(...values);
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
