import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { seedDatabase } from '@/lib/seed';
import { getSessionContext } from "@/lib/auth-context";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = getSessionContext();
    if (!session || !session.isPlatformAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
seedDatabase();
    const db = getDb();
    const totalOrgs = (db.prepare('SELECT COUNT(*) as c FROM organizations').get() as any).c;
    const totalFirms = (db.prepare("SELECT COUNT(*) as c FROM organizations WHERE org_type = 'consulting_firm'").get() as any).c;
    const totalIndividuals = (db.prepare("SELECT COUNT(*) as c FROM organizations WHERE org_type = 'individual'").get() as any).c;
    const totalUsers = (db.prepare('SELECT COUNT(*) as c FROM users').get() as any).c;
    const organizations = db.prepare(`
      SELECT o.*, (SELECT COUNT(*) FROM organization_memberships WHERE org_id = o.id) as member_count
      FROM organizations o ORDER BY o.created_at DESC
    `).all();
    return NextResponse.json({ totalOrgs, totalFirms, totalIndividuals, totalUsers, organizations });
  } catch (error) {
    console.error('Platform stats error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
