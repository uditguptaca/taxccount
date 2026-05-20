import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSessionContext } from '@/lib/auth-context';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = getSessionContext();
    if (!session?.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const db = getDb();
    const categories = await db.prepare(
      'SELECT * FROM template_categories WHERE org_id = ? ORDER BY sort_order, name'
    ).all(session.orgId);
    return NextResponse.json({ categories });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = getSessionContext();
    if (!session?.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const db = getDb();
    const body = await request.json();
    const { name, category_code, description, country, colour, status: catStatus } = body;
    if (!name) return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
    
    const id = uuidv4();
    const sortOrder = ((await db.prepare('SELECT MAX(sort_order) as max_order FROM template_categories WHERE org_id = ?').get(session.orgId) as any)?.max_order || 0) + 1;
    
    await db.prepare(
      `INSERT INTO template_categories (id, org_id, name, category_code, description, country, colour, status, sort_order, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`
    ).run(id, session.orgId, name, category_code || null, description || null, country || null, colour || '#6366f1', catStatus || 'active', sortOrder);
    
    return NextResponse.json({ success: true, id, name });
  } catch (error: any) {
    if (error.message?.includes('unique') || error.message?.includes('23505')) {
      return NextResponse.json({ error: 'A category with this name already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = getSessionContext();
    if (!session?.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const db = getDb();
    const body = await request.json();
    const { id, name, category_code, description, country, colour, status: catStatus } = body;
    if (!id) return NextResponse.json({ error: 'Category ID is required' }, { status: 400 });
    
    await db.prepare(
      `UPDATE template_categories SET name = ?, category_code = ?, description = ?, country = ?, colour = ?, status = ?
       WHERE id = ? AND org_id = ?`
    ).run(name, category_code || null, description || null, country || null, colour || '#6366f1', catStatus || 'active', id, session.orgId);
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = getSessionContext();
    if (!session?.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const db = getDb();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Category ID is required' }, { status: 400 });
    
    // Soft delete
    await db.prepare('UPDATE template_categories SET status = ? WHERE id = ? AND org_id = ?').run('inactive', id, session.orgId);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
