import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { seedDatabase } from '@/lib/seed';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    seedDatabase();
    const db = getDb();
    const body = await request.json();
    const leadId = params.id;

    const lead = db.prepare('SELECT * FROM leads WHERE id = ?').get(leadId) as any;
    if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    if (lead.status === 'converted') return NextResponse.json({ error: 'Lead already converted' }, { status: 400 });

    // Generate client code
    const clientCount = (db.prepare('SELECT COUNT(*) as c FROM clients').get() as any).c;
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
    db.prepare(`
      INSERT INTO clients (id, client_code, display_name, client_type, status, primary_email, primary_phone, city, province, postal_code, notes, created_by, created_at, updated_at)
      VALUES (?, ?, ?, ?, 'active', ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `).run(
      clientId, clientCode, displayName, clientType,
      lead.email, lead.phone, lead.city, lead.province, lead.postal_code,
      `Converted from lead ${lead.lead_code}. ${lead.notes || ''}`.trim(),
      body.created_by || lead.created_by
    );

    // Update lead as converted
    db.prepare(`
      UPDATE leads SET status = 'converted', pipeline_stage = 'converted', converted_client_id = ?, updated_at = datetime('now')
      WHERE id = ?
    `).run(clientId, leadId);

    // Log activity on lead
    db.prepare(`
      INSERT INTO lead_activities (id, lead_id, activity_type, summary, contact_date, created_by, created_at)
      VALUES (?, ?, 'stage_change', ?, datetime('now'), ?, datetime('now'))
    `).run(uuidv4(), leadId, `Lead converted to Client ${clientCode} (${displayName})`, body.created_by || lead.created_by);

    // Log in global activity feed
    db.prepare(`
      INSERT INTO activity_feed (id, actor_id, action, entity_type, entity_id, entity_name, client_id, details, created_at)
      VALUES (?, ?, 'converted_lead', 'lead', ?, ?, ?, ?, datetime('now'))
    `).run(uuidv4(), body.created_by || lead.created_by, leadId, displayName, clientId, `Converted lead ${lead.lead_code} to client ${clientCode}`);

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
