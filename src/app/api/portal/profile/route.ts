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

export async function PUT(req: Request) {
  try {
    const session = getSessionContext();
    if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { orgId, userId } = session;

    const body = await req.json();
    const { first_name, last_name, phone, display_name, email } = body;

    const db = getDb();

    // 1. Update the user details
    db.prepare(`
      UPDATE users 
      SET first_name = ?, last_name = ?, phone = ?, updated_at = datetime('now')
      WHERE id = ?
    `).run(first_name, last_name, phone, userId);

    // 2. Fetch org and client to see if we need to update 'organizations' or 'clients'
    const org = db.prepare('SELECT id, org_type FROM organizations WHERE id = ?').get(orgId) as any;
    const client = db.prepare('SELECT id FROM clients WHERE portal_user_id = ?').get(userId) as any;

    if (client) {
      // Traditional client
      db.prepare(`
        UPDATE clients 
        SET display_name = ?, primary_email = ?, primary_phone = ?, updated_at = datetime('now')
        WHERE id = ? AND org_id = ?
      `).run(display_name || `${first_name} ${last_name}`, email, phone, client.id, orgId);
    } else if (org?.org_type === 'individual') {
      // It's a personal org — update organizations name/email
      db.prepare(`
        UPDATE organizations
        SET name = ?, email = ?, phone = ?, updated_at = datetime('now')
        WHERE id = ?
      `).run(display_name || `${first_name} ${last_name}`, email, phone, orgId);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Portal profile update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
