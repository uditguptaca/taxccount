import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSessionContext } from "@/lib/auth-context";
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const session = getSessionContext();
    if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    // Only individuals should have personal consultants, but just return empty array if not supported
    const db = getDb();
    const consultants = db.prepare(`SELECT * FROM personal_consultants WHERE user_id = ?`).all(session.userId) as any[];
    return NextResponse.json({ consultants });
  } catch (error) {
    console.error('Fetch consultants error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = getSessionContext();
    if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const body = await req.json();
    const { name, specialty, email, phone, company, notes } = body;
    
    if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });

    const db = getDb();
    const id = uuidv4();
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO personal_consultants (id, user_id, org_id, name, specialty, email, phone, company, notes, created_at, updated_at) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, session.userId, session.orgId, name, specialty || 'general', email || null, phone || null, company || null, notes || null, now, now);

    const newConsultant = db.prepare('SELECT * FROM personal_consultants WHERE id = ?').get(id);

    return NextResponse.json({ success: true, consultant: newConsultant });
  } catch (error) {
    console.error('Create consultant error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
