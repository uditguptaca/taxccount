import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSessionContext } from '@/lib/auth-context';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = getSessionContext();
    // Only allow platform admins to fetch all users globally
    if (!session || session.role !== 'platform_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getDb();
    const users = db.prepare(`
      SELECT 
        u.id, u.email, u.first_name, u.last_name, u.role, u.created_at, u.last_login_at,
        CASE WHEN u.is_active = 1 THEN 'active' ELSE 'inactive' END as status,
        IFNULL(o.name, 'Unassigned') as org_name
      FROM users u
      LEFT JOIN organization_memberships om ON om.user_id = u.id AND om.status = 'active'
      LEFT JOIN organizations o ON o.id = om.org_id
      ORDER BY u.created_at DESC
    `).all();

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Platform Users API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}
