import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSessionContext } from '@/lib/auth-context';
import { v4 as uuidv4 } from 'uuid';

export async function GET(request: Request) {
  try {
    const session = getSessionContext();
    if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { orgId, userId, role } = session;

    const db = getDb();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const clientType = searchParams.get('type') || '';

    let query = `
      SELECT c.*, 
        ctc.name as client_type_name,
        (SELECT COUNT(*) FROM client_compliances cc WHERE cc.client_id = c.id AND cc.status NOT IN ('completed','archived')) as active_projects,
        (SELECT COUNT(*) FROM client_compliances cc WHERE cc.client_id = c.id) as total_projects,
        (SELECT COALESCE(SUM(cc.price), 0) FROM client_compliances cc WHERE cc.client_id = c.id) as total_billed,
        (SELECT COALESCE(SUM(i.total_amount - i.paid_amount), 0) FROM invoices i WHERE i.client_id = c.id AND i.status IN ('unpaid','overdue','sent','partially_paid')) as net_due
      FROM clients c 
      LEFT JOIN client_types_config ctc ON ctc.id = c.client_type_id
      WHERE c.org_id = ?
    `;
    const params: any[] = [orgId];

    // Row-Level Security: Restrict team_member to assigned clients
    if (role === 'team_member' && userId) {
      query += `
        AND c.id IN (
          SELECT cc.client_id 
          FROM client_compliances cc
          LEFT JOIN team_memberships tm ON tm.team_id = cc.assigned_team_id
          LEFT JOIN client_compliance_stages ccs ON ccs.engagement_id = cc.id
          WHERE (cc.org_id = ?) AND (tm.user_id = ? OR ccs.assigned_user_id = ?)
        )
      `;
      params.push(orgId, userId, userId);
    }

    if (search) {
      query += ` AND (c.display_name LIKE ? OR c.client_code LIKE ? OR c.primary_email LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (status) {
      query += ` AND c.status = ?`;
      params.push(status);
    }
    if (clientType) {
      query += ` AND (c.client_type = ? OR c.client_type_id = ?)`;
      params.push(clientType, clientType);
    }

    query += ` ORDER BY c.display_name ASC`;
    const clients = db.prepare(query).all(...params);

    // Fetch tags for all clients in this org
    const allTags = db.prepare(`
      SELECT cta.client_id, ct.name, ct.color
      FROM client_tag_assignments cta
      JOIN client_tags ct ON ct.id = cta.tag_id
      WHERE ct.org_id = ?
      ORDER BY ct.name
    `).all(orgId) as any[];

    const tagsByClient: Record<string, {name: string; color: string}[]> = {};
    allTags.forEach(t => {
      if (!tagsByClient[t.client_id]) tagsByClient[t.client_id] = [];
      tagsByClient[t.client_id].push({ name: t.name, color: t.color });
    });

    const enrichedClients = (clients as any[]).map(c => ({
      ...c,
      tags: tagsByClient[c.id] || [],
    }));

    return NextResponse.json({ clients: enrichedClients });
  } catch (error) {
    console.error('Clients error:', error);
    return NextResponse.json({ error: 'Failed to load clients' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = getSessionContext();
    if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { orgId, userId, role } = session;

    const db = getDb();
    const body = await request.json();

    // Generate client code for org
    const lastCode = db.prepare(`SELECT client_code FROM clients WHERE org_id = ? ORDER BY client_code DESC LIMIT 1`).get(orgId) as any;
    let nextNum = 1;
    if (lastCode && lastCode.client_code) {
      const match = lastCode.client_code.match(/\d+$/);
      if (match) nextNum = parseInt(match[0]) + 1;
    }
    const clientCode = `CLI-${String(nextNum).padStart(4, '0')}`;

    const id = uuidv4();
    try {
      db.prepare(`
        INSERT INTO clients (id, org_id, client_code, display_name, client_type, client_type_id, status, primary_email, tax_id, primary_phone, address_line_1, city, province, postal_code, notes, created_by, created_at, updated_at)
        VALUES (?, ?, ?, ?, 'individual', ?, 'active', ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      `).run(id, orgId, clientCode, body.display_name, body.client_type_id || null, body.primary_email || null, body.tax_id || null, body.primary_phone || null, body.address_line_1 || null, body.city || null, body.province || null, body.postal_code || null, body.notes || null, userId);

      if (body.send_invitation && body.primary_email) {
        console.log(`[MOCK EMAIL] Invitation sent to ${body.primary_email} for client ${id}`);
      }

      return NextResponse.json({ id, client_code: clientCode });
    } catch (dbError: any) {
      if (dbError.message?.includes('UNIQUE constraint failed')) {
        return NextResponse.json({ error: 'A client with this Email or Tax ID already exists in this organization.' }, { status: 409 });
      }
      throw dbError;
    }
  } catch (error) {
    console.error('Create client error:', error);
    return NextResponse.json({ error: 'Failed to create client' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = getSessionContext();
    if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { orgId, userId, role } = session;

    const db = getDb();
    const body = await request.json();
    const { id, is_favorite, client_type_id } = body;

    const updates = [];
    const params = [];
    
    if (is_favorite !== undefined) {
      updates.push(`is_favorite = ?`);
      params.push(is_favorite ? 1 : 0);
    }
    
    if (client_type_id !== undefined) {
      updates.push(`client_type_id = ?`);
      params.push(client_type_id);
    }

    if (id && updates.length > 0) {
      params.push(id, orgId);
      db.prepare(`UPDATE clients SET ${updates.join(', ')}, updated_at = datetime('now') WHERE id = ? AND org_id = ?`).run(...params);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update client' }, { status: 500 });
  }
}
