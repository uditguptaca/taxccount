import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(request: Request, { params }: { params: { clientId: string } }) {
  try {
    const db = getDb();
    const sql = `SELECT * FROM pay_group WHERE client_id = ? ORDER BY created_at DESC`;
    const groups = await db.prepare(sql).all(params.clientId);
    return NextResponse.json({ groups });
  } catch (error: any) {
    console.error('Error fetching pay groups:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: { clientId: string } }) {
  try {
    const db = getDb();
    const body = await request.json();
    
    const orgId = '123e4567-e89b-12d3-a456-426614174000'; // mock session org_id
    
    const sql = `
      INSERT INTO pay_group (org_id, client_id, name, frequency, auto_run, cutoff_time, cutoff_timezone)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      RETURNING *
    `;
    const result = await db.prepare(sql).get(
      orgId, params.clientId, body.name, body.frequency, 
      body.auto_run || false, body.cutoff_time || '12:00', body.cutoff_timezone || 'ET'
    );
    
    return NextResponse.json({ group: result });
  } catch (error: any) {
    console.error('Error creating pay group:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
