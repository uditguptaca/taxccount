import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSessionContext } from '@/lib/auth-context';
import { v4 as uuidv4 } from 'uuid';
import { initTaxIntakeSchema } from '@/lib/tax-intake-schema';
import { authenticateIntake } from '@/lib/tax-intake-access';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const db = getDb();
    const auth = await authenticateIntake(req, db);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { orgId } = auth;

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

    // A client sees only the intakes of their own client record(s)
    if (auth.clientIds) {
      if (auth.clientIds.length === 0) return NextResponse.json({ engagements: [] });
      query += ` AND client_id IN (${auth.clientIds.map(() => '?').join(',')})`;
      params.push(...auth.clientIds);
    }

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

    const engagements = await db.prepare(query).all(...params);

    return NextResponse.json({ engagements });
  } catch (err: any) {
    console.error('GET Tax Intake Engagements Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const db = getDb();
    const auth = await authenticateIntake(req, db);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (auth.isClient) {
      return NextResponse.json({ error: 'Only the firm can start a tax intake' }, { status: 403 });
    }
    const { orgId } = auth;

    const body = await req.json();
    const { client_name, taxpayer_name, client_email, tax_year, filing_type, province } = body;
    let { client_id } = body;

    if (!tax_year || !filing_type || (!client_id && !client_name && !client_email)) {
      return NextResponse.json({ error: 'Missing required fields: a client (id, name or email), tax_year, filing_type' }, { status: 400 });
    }

    // The intake belongs to a REAL client record of this firm: use the one named, else the one
    // with that email, else create it. (The dashboard used to send a made-up id, so the intake
    // belonged to nobody and the client could never open it.)
    let client: any = client_id
      ? await db.prepare('SELECT id, display_name FROM clients WHERE id = ? AND org_id = ?').get(client_id, orgId)
      : null;
    if (!client && client_email) {
      client = await db.prepare('SELECT id, display_name FROM clients WHERE org_id = ? AND LOWER(primary_email) = LOWER(?) LIMIT 1').get(orgId, client_email);
    }
    if (!client) {
      const next = await db.prepare(`SELECT COALESCE(MAX(CAST(SUBSTRING(client_code FROM 5) AS INTEGER)), 0) + 1 AS n FROM clients WHERE org_id = ? AND client_code ~ '^CLI-[0-9]+$'`).get(orgId);
      client_id = uuidv4();
      const name = client_name || taxpayer_name || client_email;
      await db.prepare(`
        INSERT INTO clients (id, org_id, client_code, display_name, client_type, status, primary_email, created_by, created_at, updated_at)
        VALUES (?, ?, ?, ?, 'individual', 'active', ?, ?, NOW(), NOW())
      `).run(client_id, orgId, `CLI-${String(next.n).padStart(4, '0')}`, name, client_email || null, auth.userId);
      client = { id: client_id, display_name: name };
    }

    const engagementId = uuidv4();
    const now = new Date().toISOString();
    const portalToken = uuidv4();

    try {
      await db.prepare(`
        INSERT INTO tax_intake_engagements (id, org_id, client_id, client_name, taxpayer_name, tax_year, filing_type, province, status, active_modules, created_at, updated_at, portal_token)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'not_started', '[]', ?, ?, ?)
      `).run(engagementId, orgId, client.id, client_name || client.display_name, taxpayer_name || client_name || client.display_name, tax_year, filing_type, province || null, now, now, portalToken);
    } catch (e: any) {
      if (e?.code === '23505') {
        return NextResponse.json({ error: 'This client already has a tax intake for that year and filing type' }, { status: 409 });
      }
      throw e;
    }

    return NextResponse.json({ success: true, id: engagementId, clientId: client.id, portalToken });
  } catch (err: any) {
    console.error('POST Tax Intake Engagement Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
