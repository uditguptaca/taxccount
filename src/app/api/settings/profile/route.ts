import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSessionContext } from "@/lib/auth-context";
import { logActivity } from '@/lib/audit';

export async function GET() {
  try {
    const session = getSessionContext();
    if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { orgId } = session;

    const db = getDb();
    const org = await db.prepare('SELECT * FROM organizations WHERE id = ?').get(orgId) as any;
    
    if (!org) return NextResponse.json({ error: 'Organization not found' }, { status: 404 });

    // Map DB columns to frontend state
    const profile = {
      name: org.name,
      address: org.address_line_1 || '',
      city: org.city || '',
      province: org.state_province || '',
      postal_code: org.postal_code || '',
      phone: org.phone || '',
      email: org.email || '',
      website: org.website || '',
      gst_number: org.tax_id || '',
      fiscal_year_end: org.fiscal_year_end || '',
    };

    return NextResponse.json({ profile });
  } catch (error: any) {
    console.error('Firm profile fetch error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = getSessionContext();
    if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { orgId } = session;

    const db = getDb();
    const body = await request.json();
    const { name, address, city, province, postal_code, phone, email, website, gst_number, fiscal_year_end } = body;

    await db.prepare(`
      UPDATE organizations 
      SET name = ?, address_line_1 = ?, city = ?, state_province = ?, postal_code = ?, 
          phone = ?, email = ?, website = ?, tax_id = ?, fiscal_year_end = ?, updated_at = NOW()
      WHERE id = ?
    `).run(name, address, city, province, postal_code, phone, email, website, gst_number, fiscal_year_end, orgId);

    await logActivity({
      orgId,
      actorId: session.userId,
      action: 'updated_firm_profile',
      entityType: 'organization',
      entityId: orgId,
      entityName: name,
      details: 'Updated firm contact and profile information.'
    });

    return NextResponse.json({ success: true, message: 'Profile updated' });
  } catch (error: any) {
    console.error('Firm profile update error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
