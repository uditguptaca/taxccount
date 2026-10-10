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
    const sectionId = searchParams.get('sectionId');
    
    let query = `SELECT * FROM tax_intake_repeat_records WHERE engagement_id = ?`;
    const queryParams: any[] = [params.engagementId];

    if (sectionId) {
      query += ` AND section_id = ?`;
      queryParams.push(sectionId);
    }
    
    query += ` ORDER BY record_index ASC`;

    const records = await db.prepare(query).all(...queryParams);

    return NextResponse.json(records);
  } catch (err: any) {
    console.error('GET Repeat Records Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: { engagementId: string } }) {
  try {
    const db = getDb();
    const auth = await authenticate(req, db, params.engagementId);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { sectionId, label } = body;
    
    if (!sectionId) {
      return NextResponse.json({ error: 'Missing required field: sectionId' }, { status: 400 });
    }

    const row = await db.prepare(`
      SELECT MAX(record_index) as max_idx FROM tax_intake_repeat_records
      WHERE engagement_id = ? AND section_id = ?
    `).get(params.engagementId, sectionId);
    
    const nextIndex = (row?.max_idx || 0) + 1;
    const recordId = uuidv4();
    const now = new Date().toISOString();

    await db.prepare(`
      INSERT INTO tax_intake_repeat_records (id, engagement_id, section_id, record_index, label, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      recordId,
      params.engagementId,
      sectionId,
      nextIndex,
      label || `Record ${nextIndex}`,
      now
    );

    return NextResponse.json({ success: true, id: recordId, recordIndex: nextIndex });
  } catch (err: any) {
    console.error('POST Repeat Records Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { engagementId: string } }) {
  try {
    const db = getDb();
    const auth = await authenticate(req, db, params.engagementId);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const { searchParams } = new URL(req.url);
    const sectionId = searchParams.get('sectionId');
    const recordIndex = searchParams.get('recordIndex');
    const questionIds = searchParams.get('questionIds'); // comma separated
    
    if (!sectionId || !recordIndex) {
      return NextResponse.json({ error: 'Missing sectionId or recordIndex' }, { status: 400 });
    }

    const transaction = db.transaction(async (tx: any) => {
      await tx.prepare(`
        DELETE FROM tax_intake_repeat_records 
        WHERE engagement_id = ? AND section_id = ? AND record_index = ?
      `).run(params.engagementId, sectionId, recordIndex);
      
      if (questionIds) {
        const ids = questionIds.split(',').map(id => id.trim());
        if (ids.length > 0) {
          const placeholders = ids.map(() => '?').join(',');
          await tx.prepare(`
            DELETE FROM tax_intake_responses
            WHERE engagement_id = ? AND record_index = ? AND question_id IN (${placeholders})
          `).run(params.engagementId, recordIndex, ...ids);
        }
      }
    });

    await transaction();
    
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('DELETE Repeat Records Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
