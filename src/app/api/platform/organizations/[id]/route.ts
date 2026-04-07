import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSessionContext } from '@/lib/auth-context';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = getSessionContext();
    if (!session || session.role !== 'platform_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await req.json();
    const { action } = body; // expect 'suspend' or 'activate'

    if (!['suspend', 'activate'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const newStatus = action === 'suspend' ? 'suspended' : 'active';
    const db = getDb();

    // Check if it exists
    const org = db.prepare('SELECT id FROM organizations WHERE id = ?').get(id);
    if (!org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    db.prepare(`UPDATE organizations SET status = ?, updated_at = datetime('now') WHERE id = ?`).run(newStatus, id);

    return NextResponse.json({ success: true, message: `Organization ${newStatus}` });
  } catch (error) {
    console.error('Platform API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = getSessionContext();
    if (!session || session.role !== 'platform_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const db = getDb();

    const org = db.prepare('SELECT id FROM organizations WHERE id = ?').get(id);
    if (!org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    // Soft delete equivalent
    db.prepare(`UPDATE organizations SET status = 'cancelled', updated_at = datetime('now') WHERE id = ?`).run(id);

    return NextResponse.json({ success: true, message: 'Organization cancelled' });
  } catch (error) {
    console.error('Platform API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
