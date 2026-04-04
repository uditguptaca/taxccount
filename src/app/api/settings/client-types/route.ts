import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
  try {
    const db = getDb();
    const types = db.prepare(`SELECT * FROM client_types_config ORDER BY is_system DESC, name ASC`).all();
    return NextResponse.json({ types });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch types' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const db = getDb();
    const body = await request.json();
    const id = uuidv4();
    
    db.prepare(`INSERT INTO client_types_config (id, name, is_system) VALUES (?, ?, 0)`).run(id, body.name);
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
    const db = getDb();
    const body = await request.json();
    db.prepare(`UPDATE client_types_config SET name = ? WHERE id = ?`).run(body.name, body.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update type' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const db = getDb();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    // Safety check: is it heavily used?
    const inUse = db.prepare(`SELECT COUNT(*) as count FROM clients WHERE client_type_id = ?`).get() as any;
    if (inUse.count > 0) {
      return NextResponse.json({ error: `Cannot delete. Type is assigned to ${inUse.count} clients.` }, { status: 400 });
    }

    db.prepare(`DELETE FROM client_types_config WHERE id = ?`).run(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete type' }, { status: 500 });
  }
}
