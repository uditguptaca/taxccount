import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSessionContext } from "@/lib/auth-context";

export const dynamic = 'force-dynamic';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = getSessionContext();
    if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const body = await req.json();
    const { name, specialty, email, phone, company, notes } = body;
    const { id } = params;
    
    if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });

    const db = getDb();
    
    // Check if consultant exists and belongs to user
    const existing = db.prepare('SELECT id FROM personal_consultants WHERE id = ? AND user_id = ?').get(id, session.userId);
    if (!existing) return NextResponse.json({ error: 'Not found or forbidden' }, { status: 404 });

    const now = new Date().toISOString();

    db.prepare(`
      UPDATE personal_consultants 
      SET name = ?, specialty = ?, email = ?, phone = ?, company = ?, notes = ?, updated_at = ?
      WHERE id = ? AND user_id = ?
    `).run(name, specialty || 'general', email || null, phone || null, company || null, notes || null, now, id, session.userId);

    const updatedConsultant = db.prepare('SELECT * FROM personal_consultants WHERE id = ?').get(id);

    return NextResponse.json({ success: true, consultant: updatedConsultant });
  } catch (error) {
    console.error('Update consultant error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = getSessionContext();
    if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const { id } = params;
    
    const db = getDb();
    
    // Check if consultant exists and belongs to user
    const existing = db.prepare('SELECT id FROM personal_consultants WHERE id = ? AND user_id = ?').get(id, session.userId);
    if (!existing) return NextResponse.json({ error: 'Not found or forbidden' }, { status: 404 });

    // Also remove assignments (optional but good hygiene)
    db.prepare('DELETE FROM personal_consultant_assignments WHERE consultant_id = ? AND user_id = ?').run(id, session.userId);

    // Delete consultant
    db.prepare('DELETE FROM personal_consultants WHERE id = ? AND user_id = ?').run(id, session.userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete consultant error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
