import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { seedDatabase } from '@/lib/seed';
import { getSessionContext } from "@/lib/auth-context";

export const dynamic = 'force-dynamic';

/**
 * GET /api/teams/assignables
 * Returns a unified list of assignable targets (teams + individual staff members)
 * for use in assignment pickers throughout the platform.
 */
export async function GET() {
  try {

        const session = getSessionContext();
    if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { orgId, userId, role } = session;

    seedDatabase();
    const db = getDb();

    const teams = db.prepare(`
      SELECT t.id, t.name as display_name, t.is_active,
        (SELECT COUNT(*) FROM team_memberships tm WHERE tm.team_id = t.id AND tm.is_active = 1) as member_count
      FROM teams t
      ORDER BY t.name
    `).all() as any[];

    const members = db.prepare(`
      SELECT u.id, u.first_name || ' ' || u.last_name as display_name, u.is_active, u.email, u.role,
        (SELECT t.name FROM team_memberships tm JOIN teams t ON t.id = tm.team_id WHERE tm.user_id = u.id AND tm.is_active = 1 LIMIT 1) as team_name
      FROM users u
      WHERE u.role IN ('super_admin','admin','team_manager','team_member')
      ORDER BY u.first_name
    `).all() as any[];

    const assignables = [
      ...teams.map(t => ({
        id: t.id,
        type: 'team' as const,
        display_name: t.display_name,
        active: !!t.is_active,
        detail: `${t.member_count} member${t.member_count !== 1 ? 's' : ''}`,
      })),
      ...members.map(m => ({
        id: m.id,
        type: 'member' as const,
        display_name: m.display_name,
        active: !!m.is_active,
        detail: m.team_name || 'No team',
        email: m.email,
        role: m.role,
      })),
    ];

    return NextResponse.json({ assignables });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
