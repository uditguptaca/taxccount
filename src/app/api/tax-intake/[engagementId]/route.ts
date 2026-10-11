import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSessionContext } from '@/lib/auth-context';

export const dynamic = 'force-dynamic';

import { authenticateIntake as authenticate } from '@/lib/tax-intake-access';

export async function GET(req: Request, { params }: { params: { engagementId: string } }) {
  try {
    const db = getDb();
    const auth = await authenticate(req, db, params.engagementId);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const engagement = await db.prepare(`
      SELECT e.*,
             (SELECT COUNT(*) FROM tax_intake_responses r WHERE r.engagement_id = e.id) as response_count,
             (SELECT COUNT(*) FROM tax_intake_documents d WHERE d.engagement_id = e.id) as document_count,
             (SELECT COUNT(*) FROM tax_intake_review_items ri WHERE ri.engagement_id = e.id) as review_item_count
      FROM tax_intake_engagements e
      WHERE e.id = ? AND e.org_id = ?
    `).get(params.engagementId, auth.orgId);

    if (!engagement) {
      return NextResponse.json({ error: 'Engagement not found' }, { status: 404 });
    }

    return NextResponse.json({ engagement });
  } catch (err: any) {
    console.error('GET Tax Intake Engagement Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

const STATUSES = ['not_started', 'in_progress', 'awaiting_documents', 'needs_clarification', 'submitted', 'under_review', 'reviewed', 'returned_to_client'];

/**
 * A client may only set their language and where they stopped. Everything else (status, who is assigned,
 * the due date) is the firm's: it used to be open to the client, who could mark their own form "reviewed".
 */
export async function PUT(req: Request, { params }: { params: { engagementId: string } }) {
  try {
    const db = getDb();
    const auth = await authenticate(req, db, params.engagementId);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json().catch(() => ({}));
    const sets: string[] = [], args: any[] = [];
    if (body.language === 'en' || body.language === 'fr') { sets.push('language = ?'); args.push(body.language); }
    if (typeof body.currentStep === 'string') { sets.push('current_step = ?'); args.push(body.currentStep.slice(0, 120)); }
    if (!auth.isClient) {
      if (body.status !== undefined) {
        if (!STATUSES.includes(body.status)) return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        sets.push('status = ?'); args.push(body.status);
        if (body.status === 'reviewed') { sets.push('reviewed_at = ?'); args.push(new Date().toISOString()); }
      }
      if (body.assigned_preparer_id !== undefined) { sets.push('assigned_preparer_id = ?'); args.push(body.assigned_preparer_id || null); }
      if (body.assigned_reviewer_id !== undefined) { sets.push('assigned_reviewer_id = ?'); args.push(body.assigned_reviewer_id || null); }
      if (body.active_modules !== undefined) { sets.push('active_modules = ?'); args.push(typeof body.active_modules === 'string' ? body.active_modules : JSON.stringify(body.active_modules)); }
      if (body.due_date !== undefined) { sets.push('due_date = ?'); args.push(body.due_date || null); }
    }
    if (sets.length === 0) return NextResponse.json({ success: true });
    sets.push('updated_at = ?'); args.push(new Date().toISOString());
    await db.prepare(`UPDATE tax_intake_engagements SET ${sets.join(', ')} WHERE id = ? AND org_id = ?`).run(...args, params.engagementId, auth.orgId);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('PUT Tax Intake Engagement Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { engagementId: string } }) {
  try {
    const session = getSessionContext();
    if (!session || !session.orgId || session.role === 'client' || session.role === 'individual') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const db = getDb();
    
    const engagement = await db.prepare(`
      SELECT status FROM tax_intake_engagements 
      WHERE id = ? AND org_id = ?
    `).get(params.engagementId, session.orgId);
    
    if (!engagement) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (engagement.status !== 'not_started') {
      return NextResponse.json({ error: 'Can only delete not_started engagements' }, { status: 400 });
    }
    
    await db.prepare(`DELETE FROM tax_intake_engagements WHERE id = ? AND org_id = ?`).run(params.engagementId, session.orgId);
    
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('DELETE Tax Intake Engagement Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
