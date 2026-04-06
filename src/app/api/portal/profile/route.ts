import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSessionContext } from "@/lib/auth-context";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {

        const session = getSessionContext();
    if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { orgId, userId, role } = session;

    const db = getDb();
    
    // Get organization details (for google drive connection status and basic info)
    const org = db.prepare('SELECT id, name, org_type, email, google_drive_connected FROM organizations WHERE id = ?').get(orgId) as any;
    
    let client = db.prepare('SELECT * FROM clients WHERE portal_user_id = ?').get(userId) as any;
    
    // If not a traditional firm client, but an autonomous individual, mock the client object
    if (!client && org?.org_type === 'individual') {
      client = {
        id: orgId,
        display_name: org.name,
        client_type: 'Individual',
        client_code: 'PERSONAL',
        primary_email: org.email
      };
    } else if (!client) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const user = db.prepare('SELECT id, email, first_name, last_name, phone, role, created_at FROM users WHERE id = ?').get(userId) as any;

    const contacts = client.client_code !== 'PERSONAL' ? db.prepare(`
      SELECT * FROM client_contacts WHERE client_id = ?
      ORDER BY is_primary DESC, contact_name ASC
    `).all(client.id) as any[] : [];

    const personalInfo = client.client_code !== 'PERSONAL' ? db.prepare(`
      SELECT * FROM client_personal_info WHERE client_id = ? AND is_sensitive = 0
      ORDER BY info_key ASC
    `).all(client.id) as any[] : [];

    return NextResponse.json({ client, user, contacts, personalInfo, org });
  } catch (error) {
    console.error('Portal profile error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
