import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSessionContext } from "@/lib/auth-context";
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const session = getSessionContext();
    if (!session || !session.isPlatformAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const db = getDb();
    const body = await request.json();
    const { name, email, org_type, plan, phone } = body;

    if (!name || !email) return NextResponse.json({ error: 'Name and Email are required' }, { status: 400 });

    const orgId = uuidv4();
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    // 1. Create Organization
    await db.prepare(`
      INSERT INTO organizations (id, name, slug, org_type, status, plan, email, phone, created_at, updated_at)
      VALUES (?, ?, ?, ?, 'active', ?, ?, ?, NOW(), NOW())
    `).run(orgId, name, slug, org_type || 'consulting_firm', plan || 'free', email, phone || null);

    // 2. Check if admin user already exists, or needs invitation
    // For now, we just return success. In a real app, we'd create the user or invite them.
    
    return NextResponse.json({ success: true, id: orgId });
  } catch (error: any) {
    console.error('Create organization error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
