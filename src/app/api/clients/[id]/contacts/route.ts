import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { seedDatabase } from '@/lib/seed';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    seedDatabase();
    const db = getDb();
    const { id: clientId } = await params;
    const body = await request.json();

    const dbClient = db.prepare(`SELECT id FROM clients WHERE id = ?`).get(clientId);
    if (!dbClient) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    const contactId = uuidv4();
    db.prepare(`
      INSERT INTO client_contacts (id, client_id, contact_name, relationship, email, phone, is_primary, can_login, notify, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `).run(
      contactId, 
      clientId, 
      body.contact_name, 
      body.relationship || '', 
      body.email || '', 
      body.phone || '', 
      body.is_primary ? 1 : 0, 
      body.can_login ? 1 : 0, 
      body.notify !== undefined ? (body.notify ? 1 : 0) : 1
    );

    return NextResponse.json({ success: true, id: contactId });
  } catch (error) {
    console.error('Create contact error:', error);
    return NextResponse.json({ error: 'Failed to create contact' }, { status: 500 });
  }
}
