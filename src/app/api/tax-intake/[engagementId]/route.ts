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

export async function PUT(req: Request, { params }: { params: { engagementId: string } }) {
  try {
    const db = getDb();
    const auth = await authenticate(req, db, params.engagementId);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { status, assigned_preparer_id, assigned_reviewer_id, active_modules, due_date } = body;
    
    const now = new Date().toISOString();
    
    let updates = [];
    let queryParams = [];
    
    if (status !== undefined) { updates.push('status = ?'); queryParams.push(status); }
    if (assigned_preparer_id !== undefined) { updates.push('assigned_preparer_id = ?'); queryParams.push(assigned_preparer_id); }
    if (assigned_reviewer_id !== undefined) { updates.push('assigned_reviewer_id = ?'); queryParams.push(assigned_reviewer_id); }
    if (active_modules !== undefined) { 
      updates.push('active_modules = ?'); 
      queryParams.push(typeof active_modules === 'string' ? active_modules : JSON.stringify(active_modules)); 
    }
    if (due_date !== undefined) { updates.push('due_date = ?'); queryParams.push(due_date); }
    
    if (updates.length === 0) {
      return NextResponse.json({ success: true });
    }
    
    updates.push('updated_at = ?');
    queryParams.push(now);
    queryParams.push(params.engagementId);
    queryParams.push(auth.orgId);
    
    await db.prepare(`
      UPDATE tax_intake_engagements
      SET ${updates.join(', ')}
      WHERE id = ? AND org_id = ?
    `).run(...queryParams);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('PUT Tax Intake Engagement Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { engagementId: string } }) {
  try {
    const session = getSessionContext();
    if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
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
