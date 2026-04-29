import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { getSessionContext } from "@/lib/auth-context";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = getSessionContext();
    if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { orgId, userId, role } = session;

    const db = getDb();
    const types = await db.prepare(`SELECT * FROM client_types_config WHERE org_id = ? ORDER BY is_system DESC, name ASC`).all(orgId);
    return NextResponse.json({ types });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch types' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = getSessionContext();
    if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { orgId, userId, role } = session;

const db = getDb();
    const body = await request.json();
    const id = uuidv4();
    
    await db.prepare(`INSERT INTO client_types_config (id, org_id, name, is_system) VALUES (?, ?, ?, 0)`).run(id, orgId, body.name);
    return NextResponse.json({ id, name: body.name });
  } catch (error: any) {
    if (error.message?.includes('UNIQUE constraint')) {
      return NextResponse.json({ error: 'Type already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to create type' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = getSessionContext();
    if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { orgId, userId, role } = session;

const db = getDb();
    const body = await request.json();
    await db.prepare(`UPDATE client_types_config SET name = ? WHERE id = ? AND org_id = ?`).run(body.name, body.id, orgId);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update type' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = getSessionContext();
    if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { orgId, userId, role } = session;

const db = getDb();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    // Safety check: is it heavily used?
    const inUse = await db.prepare(`SELECT COUNT(*) as count FROM clients WHERE client_type_id = ? AND org_id = ?`).get(id, orgId) as any;
    if (inUse.count > 0) {
      return NextResponse.json({ error: `Cannot delete. Type is assigned to ${inUse.count} clients.` }, { status: 400 });
    }

    await db.prepare(`DELETE FROM client_types_config WHERE id = ? AND org_id = ?`).run(id, orgId);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete type' }, { status: 500 });
  }
}
