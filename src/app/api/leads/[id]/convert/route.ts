import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { seedDatabase } from '@/lib/seed';
import { getSessionContext } from '@/lib/auth-context';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = getSessionContext();
    if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { orgId, userId } = session;

    const db = getDb();
    const body = await request.json();
    const { id: leadId } = await params;

    const lead = await db.prepare('SELECT * FROM leads WHERE id = ? AND org_id = ?').get(leadId, orgId) as any;
    if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    if (lead.status === 'converted') return NextResponse.json({ error: 'Lead already converted' }, { status: 400 });

    // Generate client code
    const clientCount = (await db.prepare('SELECT COUNT(*) as c FROM clients WHERE org_id = ?').get(orgId) as any).c;
    const clientCode = `CLI-${String(clientCount + 1).padStart(4, '0')}`;

    // Map lead type to client type
    const typeMap: Record<string, string> = {
      individual: 'individual',
      corporation: 'business',
      trust: 'trust',
      partnership: 'business',
      sole_proprietor: 'sole_proprietor',
    };

    const clientId = uuidv4();
    const clientType = body.client_type || typeMap[lead.lead_type] || 'individual';
    const displayName = lead.company_name || `${lead.first_name} ${lead.last_name || ''}`.trim();

    // Create client
    await db.prepare(`
      INSERT INTO clients (id, org_id, client_code, display_name, client_type, status, primary_email, primary_phone, city, state_province, postal_code, notes, created_by, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, 'active', ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `).run(
      clientId, orgId, clientCode, displayName, clientType,
      lead.email, lead.phone, lead.city, lead.state_province || lead.province, lead.postal_code,
      `Converted from lead ${lead.lead_code}. ${lead.notes || ''}`.trim(),
      userId
    );

    // Update lead as converted
    await db.prepare(`
      UPDATE leads SET status = 'converted', pipeline_stage = 'converted', converted_client_id = ?, updated_at = NOW()
      WHERE id = ? AND org_id = ?
    `).run(clientId, leadId, orgId);

    // Log activity on lead
    await db.prepare(`
      INSERT INTO lead_activities (id, org_id, lead_id, activity_type, summary, contact_date, created_by, created_at)
      VALUES (?, ?, ?, 'stage_change', ?, NOW(), ?, NOW())
    `).run(uuidv4(), orgId, leadId, `Lead converted to Client ${clientCode} (${displayName})`, userId);

    // Log in global activity feed
    await db.prepare(`
      INSERT INTO activity_feed (id, org_id, actor_id, action, entity_type, entity_id, entity_name, client_id, details, created_at)
      VALUES (?, ?, ?, 'converted_lead', 'lead', ?, ?, ?, ?, NOW())
    `).run(uuidv4(), orgId, userId, leadId, displayName, clientId, `Converted lead ${lead.lead_code} to client ${clientCode}`);

    return NextResponse.json({
      success: true,
      client_id: clientId,
      client_code: clientCode,
      display_name: displayName,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
