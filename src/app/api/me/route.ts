import { NextResponse } from 'next/server';
import { getSessionContext } from '@/lib/auth-context';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * GET /api/me
 * Returns the currently authenticated user's profile info.
 * Used by automated testing tools and client-side session verification.
 */
export async function GET(request: Request) {
  try {
    // Prevent AI test runners from getting stuck viewing raw JSON in the browser
    const acceptHeader = request.headers.get('accept') || '';
    if (acceptHeader.includes('text/html')) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    const session = getSessionContext();
    if (!session || !session.userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const db = getDb();
    const user = await db.prepare(`
      SELECT u.id, u.email, u.first_name, u.last_name, u.role, u.phone, u.avatar_url,
        u.mfa_enabled, u.last_login_at, u.created_at
      FROM users u
      WHERE u.id = ?
    `).get(session.userId) as any;

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get org info if available
    let org = null;
    if (session.orgId) {
      org = await db.prepare('SELECT id, name, slug FROM organizations WHERE id = ?').get(session.orgId) as any;
    }

    return NextResponse.json({
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      name: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
      role: user.role,
      phone: user.phone,
      avatar_url: user.avatar_url,
      mfa_enabled: user.mfa_enabled,
      last_login_at: user.last_login_at,
      created_at: user.created_at,
      org: org ? { id: org.id, name: org.name, slug: org.slug } : null,
      session: {
        orgId: session.orgId,
        orgType: session.orgType,
        isPlatformAdmin: session.isPlatformAdmin,
        isFirmAdmin: session.isFirmAdmin,
        isIndividual: session.isIndividual,
        isClient: session.isClient,
      },
    });
  } catch (error: any) {
    console.error('/api/me error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
