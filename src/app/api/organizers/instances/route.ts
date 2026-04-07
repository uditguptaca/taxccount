import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { getSessionContext } from "@/lib/auth-context";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const session = getSessionContext();
    if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { orgId, userId, role } = session;

const { searchParams } = new URL(req.url);
    const clientId = searchParams.get('client_id');
    const engagementId = searchParams.get('engagement_id');

    const db = getDb();
    
    let query = `
      SELECT o.*, t.name as template_name, t.description as template_description 
      FROM organizer_instances o
      JOIN organizer_templates t ON o.template_id = t.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (clientId) {
      query += ` AND o.client_id = ?`;
      params.push(clientId);
    }
    if (engagementId) {
      query += ` AND o.engagement_id = ?`;
      params.push(engagementId);
    }

    query += ` ORDER BY o.created_at DESC`;

    const instances = db.prepare(query).all(...params);
    return NextResponse.json(instances);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = getSessionContext();
    if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { orgId, userId, role } = session;

const db = getDb();
    const body = await req.json();
    const { template_id, client_id, engagement_id } = body;

    if (!template_id || !client_id) {
      return NextResponse.json({ error: 'Template ID and Client ID are required' }, { status: 400 });
    }

    const instanceId = uuidv4();
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO organizer_instances (id, template_id, client_id, engagement_id, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, 'pending', ?, ?)
    `).run(instanceId, template_id, client_id, engagement_id || null, now, now);

    return NextResponse.json({ id: instanceId, message: 'Organizer drafted for client' }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
