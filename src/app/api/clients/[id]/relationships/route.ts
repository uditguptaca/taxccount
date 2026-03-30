import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const db = getDb();
    
    // Fetch all connected nodes in the graph (both incoming and outgoing edges)
    const relationships = db.prepare(`
      SELECT cr.id as link_id, cr.role,
        c2.id as client_id, c2.display_name, c2.client_code, ctc.name as client_type_name
      FROM client_relationships cr
      JOIN clients c2 ON c2.id = CASE 
        WHEN cr.client_id = ? THEN cr.linked_client_id 
        ELSE cr.client_id 
      END
      LEFT JOIN client_types_config ctc ON ctc.id = c2.client_type_id
      WHERE cr.client_id = ? OR cr.linked_client_id = ?
      ORDER BY cr.created_at DESC
    `).all(params.id, params.id, params.id);
    
    return NextResponse.json({ relationships });
  } catch (error) {
    console.error('Failed to fetch relationships:', error);
    return NextResponse.json({ error: 'Failed to fetch relationships' }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const db = getDb();
    const body = await request.json();
    
    if (params.id === body.linked_client_id) {
      return NextResponse.json({ error: 'Cannot link a client to themselves' }, { status: 400 });
    }

    const id = uuidv4();
    db.prepare(`
      INSERT INTO client_relationships (id, client_id, linked_client_id, role)
      VALUES (?, ?, ?, ?)
    `).run(id, params.id, body.linked_client_id, body.role);
    
    return NextResponse.json({ id, success: true });
  } catch (error: any) {
    if (error.message?.includes('UNIQUE')) {
      return NextResponse.json({ error: 'This specific relationship already exists.' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to link entity' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const db = getDb();
    const { searchParams } = new URL(request.url);
    const linkId = searchParams.get('link_id');
    
    // Ensure the link actually belongs to this client before deleting
    db.prepare(`
      DELETE FROM client_relationships 
      WHERE id = ? AND (client_id = ? OR linked_client_id = ?)
    `).run(linkId, params.id, params.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to untie relationship' }, { status: 500 });
  }
}
