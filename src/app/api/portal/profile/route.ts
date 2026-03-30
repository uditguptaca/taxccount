import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('auth_user_id')?.value;
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const db = getDb();
    const client = db.prepare('SELECT * FROM clients WHERE portal_user_id = ?').get(userId) as any;
    if (!client) return NextResponse.json({ error: 'Client not found' }, { status: 404 });

    const user = db.prepare('SELECT id, email, first_name, last_name, phone, role, created_at FROM users WHERE id = ?').get(userId) as any;

    const contacts = db.prepare(`
      SELECT * FROM client_contacts WHERE client_id = ?
      ORDER BY is_primary DESC, contact_name ASC
    `).all(client.id) as any[];

    const personalInfo = db.prepare(`
      SELECT * FROM client_personal_info WHERE client_id = ? AND is_sensitive = 0
      ORDER BY info_key ASC
    `).all(client.id) as any[];

    return NextResponse.json({ client, user, contacts, personalInfo });
  } catch (error) {
    console.error('Portal profile error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
