import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSessionContext } from "@/lib/auth-context";
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = getSessionContext();
    if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { orgId } = session;

    const db = getDb();
    const rates = await db.prepare('SELECT * FROM tax_rates WHERE org_id = ? ORDER BY is_system DESC, province ASC').all(orgId);
    return NextResponse.json({ rates });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = getSessionContext();
    if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { orgId } = session;

    const db = getDb();
    const body = await request.json();
    const { province, gst, pst, pst_label } = body;

    const id = uuidv4();
    await db.prepare(`
      INSERT INTO tax_rates (id, org_id, province, gst, pst, pst_label, is_system, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, 0, NOW(), NOW())
    `).run(id, orgId, province, gst, pst, pst_label);

    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = getSessionContext();
    if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { orgId } = session;

    const db = getDb();
    const body = await request.json();
    const { id, province, gst, pst, pst_label } = body;

    await db.prepare(`
      UPDATE tax_rates 
      SET province = ?, gst = ?, pst = ?, pst_label = ?, updated_at = NOW()
      WHERE id = ? AND org_id = ?
    `).run(province, gst, pst, pst_label, id, orgId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = getSessionContext();
    if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { orgId } = session;

    const db = getDb();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    await db.prepare('DELETE FROM tax_rates WHERE id = ? AND org_id = ?').run(id, orgId);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
