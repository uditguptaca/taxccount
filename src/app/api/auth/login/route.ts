import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { seedDatabase } from '@/lib/seed';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const dynamic = 'force-dynamic';

const JWT_SECRET = process.env.JWT_SECRET || 'abidebylaw-dev-secret-change-in-production-2026';
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days in seconds

export async function POST(request: Request) {
  try {
    seedDatabase();
    const { email, password } = await request.json();
    const db = getDb();

    const user = db.prepare('SELECT * FROM users WHERE email = ? AND is_active = 1').get(email) as any;
    if (!user) return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });

    const valid = bcryptjs.compareSync(password, user.password_hash);
    if (!valid) return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });

    db.prepare("UPDATE users SET last_login_at = datetime('now') WHERE id = ?").run(user.id);

    // Platform admin — no org needed
    if (user.is_platform_admin || user.role === 'platform_admin') {
      const sessionPayload = { userId: user.id, role: 'platform_admin', orgId: '', orgType: '' };
      const token = jwt.sign(sessionPayload, JWT_SECRET, { expiresIn: SESSION_MAX_AGE });

      const response = NextResponse.json({ user: { id: user.id, email: user.email, first_name: user.first_name, last_name: user.last_name, role: 'platform_admin' } });
      response.cookies.set('auth_session', token, { path: '/', httpOnly: true, secure: true, sameSite: 'lax', maxAge: SESSION_MAX_AGE });
      // Keep legacy cookies for backward compatibility during transition
      response.cookies.set('auth_role', 'platform_admin', { path: '/', httpOnly: true, secure: true, maxAge: SESSION_MAX_AGE });
      response.cookies.set('auth_user_id', user.id, { path: '/', httpOnly: true, secure: true, maxAge: SESSION_MAX_AGE });
      response.cookies.set('auth_org_id', '', { path: '/', httpOnly: true, secure: true, maxAge: SESSION_MAX_AGE });
      response.cookies.set('auth_org_type', '', { path: '/', httpOnly: true, secure: true, maxAge: SESSION_MAX_AGE });
      return response;
    }

    // Individual user — use personal org
    if (user.role === 'individual' && user.personal_org_id) {
      const org = db.prepare('SELECT * FROM organizations WHERE id = ?').get(user.personal_org_id) as any;
      const sessionPayload = { userId: user.id, role: 'individual', orgId: user.personal_org_id, orgType: 'individual' };
      const token = jwt.sign(sessionPayload, JWT_SECRET, { expiresIn: SESSION_MAX_AGE });

      const response = NextResponse.json({ user: { id: user.id, email: user.email, first_name: user.first_name, last_name: user.last_name, role: 'individual', org_id: user.personal_org_id, org_name: org?.name || 'Personal', org_type: 'individual' } });
      response.cookies.set('auth_session', token, { path: '/', httpOnly: true, secure: true, sameSite: 'lax', maxAge: SESSION_MAX_AGE });
      response.cookies.set('auth_role', 'individual', { path: '/', httpOnly: true, secure: true, maxAge: SESSION_MAX_AGE });
      response.cookies.set('auth_user_id', user.id, { path: '/', httpOnly: true, secure: true, maxAge: SESSION_MAX_AGE });
      response.cookies.set('auth_org_id', user.personal_org_id, { path: '/', httpOnly: true, secure: true, maxAge: SESSION_MAX_AGE });
      response.cookies.set('auth_org_type', 'individual', { path: '/', httpOnly: true, secure: true, maxAge: SESSION_MAX_AGE });
      return response;
    }

    // Firm-based user — find their org membership
    const membership = db.prepare(`SELECT om.*, o.name as org_name, o.org_type, o.slug FROM organization_memberships om JOIN organizations o ON om.org_id = o.id WHERE om.user_id = ? AND om.status = 'active' AND o.status = 'active' ORDER BY om.joined_at ASC LIMIT 1`).get(user.id) as any;

    if (!membership) return NextResponse.json({ error: 'No active organization found for this account.' }, { status: 403 });

    const effectiveRole = membership.role === 'firm_admin' ? 'firm_admin' : user.role;
    const sessionPayload = { userId: user.id, role: effectiveRole, orgId: membership.org_id, orgType: membership.org_type };
    const token = jwt.sign(sessionPayload, JWT_SECRET, { expiresIn: SESSION_MAX_AGE });

    const response = NextResponse.json({
      user: { id: user.id, email: user.email, first_name: user.first_name, last_name: user.last_name, role: effectiveRole, org_id: membership.org_id, org_name: membership.org_name, org_type: membership.org_type }
    });

    response.cookies.set('auth_session', token, { path: '/', httpOnly: true, secure: true, sameSite: 'lax', maxAge: SESSION_MAX_AGE });
    // Legacy cookies for backward compatibility
    response.cookies.set('auth_role', effectiveRole, { path: '/', httpOnly: true, secure: true, maxAge: SESSION_MAX_AGE });
    response.cookies.set('auth_user_id', user.id, { path: '/', httpOnly: true, secure: true, maxAge: SESSION_MAX_AGE });
    response.cookies.set('auth_org_id', membership.org_id, { path: '/', httpOnly: true, secure: true, maxAge: SESSION_MAX_AGE });
    response.cookies.set('auth_org_type', membership.org_type, { path: '/', httpOnly: true, secure: true, maxAge: SESSION_MAX_AGE });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
