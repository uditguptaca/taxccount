import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSessionContext } from '@/lib/auth-context';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

import { authenticateIntake as authenticate } from '@/lib/tax-intake-access';

export async function GET(req: Request, { params }: { params: { engagementId: string } }) {
  try {
    const db = getDb();
    const auth = await authenticate(req, db, params.engagementId);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    
    let query = `SELECT * FROM tax_intake_review_items WHERE engagement_id = ?`;
    const queryParams: any[] = [params.engagementId];

    if (status) {
      query += ` AND status = ?`;
      queryParams.push(status);
    }
    if (type) {
      query += ` AND type = ?`;
      queryParams.push(type);
    }

    const reviewItems = await db.prepare(query).all(...queryParams);

    return NextResponse.json({ reviewItems });
  } catch (err: any) {
    console.error('GET Review Items Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: { engagementId: string } }) {
  try {
    const db = getDb();
    const auth = await authenticate(req, db, params.engagementId);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { questionId, recordIndex, type, title, description, clientNote, preparerNote, assignedTo } = body;
    
    if (!type || !title) {
      return NextResponse.json({ error: 'Missing required fields: type, title' }, { status: 400 });
    }

    const reviewId = uuidv4();
    const now = new Date().toISOString();

    await db.prepare(`
      INSERT INTO tax_intake_review_items (id, engagement_id, question_id, record_index, type, title, description, status, assigned_to, client_note, preparer_note, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'open', ?, ?, ?, ?)
    `).run(
      reviewId,
      params.engagementId,
      questionId || null,
      recordIndex || 0,
      type,
      title,
      description || null,
      assignedTo || null,
      clientNote || null,
      preparerNote || null,
      now
    );

    return NextResponse.json({ success: true, id: reviewId });
  } catch (err: any) {
    console.error('POST Review Items Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { engagementId: string } }) {
  try {
    const db = getDb();
    const auth = await authenticate(req, db, params.engagementId);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { id, status } = body;
    const preparerNote = body.preparerNote ?? body.preparer_note;
    const clientNote = body.clientNote ?? body.client_note;
    const assignedTo = body.assignedTo ?? body.assigned_to;
    
    if (!id) {
      return NextResponse.json({ error: 'Missing review item id' }, { status: 400 });
    }

    const now = new Date().toISOString();
    
    let updates = [];
    let queryParams = [];
    
    if (status !== undefined) { 
      updates.push('status = ?'); 
      queryParams.push(status); 
      
      if (status === 'resolved') {
        updates.push('resolved_at = ?');
        queryParams.push(now);
        updates.push('resolved_by = ?');
        queryParams.push(auth.isClient ? 'client' : 'preparer');
      } else {
        updates.push('resolved_at = NULL');
        updates.push('resolved_by = NULL');
      }
    }
    
    if (preparerNote !== undefined) { updates.push('preparer_note = ?'); queryParams.push(preparerNote); }
    if (clientNote !== undefined) { updates.push('client_note = ?'); queryParams.push(clientNote); }
    if (assignedTo !== undefined) { updates.push('assigned_to = ?'); queryParams.push(assignedTo); }
    
    if (updates.length === 0) {
      return NextResponse.json({ success: true });
    }
    
    queryParams.push(id);
    queryParams.push(params.engagementId);
    
    await db.prepare(`
      UPDATE tax_intake_review_items
      SET ${updates.join(', ')}
      WHERE id = ? AND engagement_id = ?
    `).run(...queryParams);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('PUT Review Items Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
