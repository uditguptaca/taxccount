import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSessionContext } from '@/lib/auth-context';
import { v4 as uuidv4 } from 'uuid';
import { initTaxIntakeSchema } from '@/lib/tax-intake-schema';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const session = getSessionContext();
    if (!session || !session.orgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { orgId } = session;
    const db = getDb();
    
    initTaxIntakeSchema(db);

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const taxYear = searchParams.get('tax_year');
    const clientId = searchParams.get('client_id');
    const assignedPreparerId = searchParams.get('assigned_preparer_id');

    let query = `
      SELECT *
      FROM tax_intake_engagements
      WHERE org_id = ?
    `;
    const params: any[] = [orgId];

    if (status) {
      query += ` AND status = ?`;
      params.push(status);
    }
    if (taxYear) {
      query += ` AND tax_year = ?`;
      params.push(taxYear);
    }
    if (clientId) {
      query += ` AND client_id = ?`;
      params.push(clientId);
    }
    if (assignedPreparerId) {
      query += ` AND assigned_preparer_id = ?`;
      params.push(assignedPreparerId);
    }

    query += ` ORDER BY updated_at DESC`;

    const engagements = db.prepare(query).all(...params);

    return NextResponse.json(engagements);
  } catch (err: any) {
    console.error('GET Tax Intake Engagements Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = getSessionContext();
    if (!session || !session.orgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { orgId } = session;
    const db = getDb();
    
    initTaxIntakeSchema(db);
    
    const body = await req.json();
    const { client_id, client_name, taxpayer_name, tax_year, filing_type, province } = body;
    
    if (!client_id || !tax_year || !filing_type) {
      return NextResponse.json({ error: 'Missing required fields: client_id, tax_year, filing_type' }, { status: 400 });
    }

    const engagementId = uuidv4();
    const now = new Date().toISOString();
    const portalToken = uuidv4();

    db.prepare(`
      INSERT INTO tax_intake_engagements (id, org_id, client_id, client_name, taxpayer_name, tax_year, filing_type, province, status, active_modules, created_at, updated_at, portal_token)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'not_started', '[]', ?, ?, ?)
    `).run(
      engagementId, 
      orgId, 
      client_id, 
      client_name || null, 
      taxpayer_name || null, 
      tax_year, 
      filing_type, 
      province || null, 
      now, 
      now, 
      portalToken
    );

    return NextResponse.json({ success: true, id: engagementId, portalToken });
  } catch (err: any) {
    console.error('POST Tax Intake Engagement Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
