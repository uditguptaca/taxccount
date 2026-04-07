import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { cookies } from 'next/headers';
import { verifyTOTP } from '@/lib/mfa';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const mfaToken = cookieStore.get('mfa_pending')?.value || cookieStore.get('auth_session')?.value;
    if (!mfaToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    let payload: any;
    try {
      const jwt = require('jsonwebtoken');
      payload = jwt.verify(mfaToken, process.env.JWT_SECRET || 'abidebylaw-dev-secret-change-in-production-2026');
    } catch {
      return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 });
    }
    
    const userId = payload.userId;
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { code, recovery_code } = await request.json();

    const db = getDb();
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as any;
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    if (!user.mfa_secret) {
      return NextResponse.json({ error: 'MFA not set up. Call /api/auth/mfa/setup first.' }, { status: 400 });
    }

    // Recovery code path
    if (recovery_code) {
      const storedCodes = user.mfa_recovery_codes ? JSON.parse(user.mfa_recovery_codes) : [];
      const codeIndex = storedCodes.indexOf(recovery_code);
      if (codeIndex === -1) {
        return NextResponse.json({ error: 'Invalid recovery code' }, { status: 401 });
      }
      // Consume the recovery code (one-time use)
      storedCodes.splice(codeIndex, 1);
      db.prepare('UPDATE users SET mfa_recovery_codes = ? WHERE id = ?').run(JSON.stringify(storedCodes), userId);

      const { v4: uuidv4 } = require('uuid');
      db.prepare(`
        INSERT INTO audit_logs (id, actor_id, action, entity_type, entity_id, details, created_at)
        VALUES (?, ?, 'mfa_recovery_used', 'user', ?, 'Recovery code consumed', datetime('now'))
      `).run(uuidv4(), userId, userId);

      return NextResponse.json({ verified: true, method: 'recovery_code', remaining_codes: storedCodes.length });
    }

    // TOTP verification path
    if (!code) {
      return NextResponse.json({ error: 'Verification code is required' }, { status: 400 });
    }

    const isValid = verifyTOTP(user.mfa_secret, code);

    if (!isValid) {
      const { v4: uuidv4 } = require('uuid');
      db.prepare(`
        INSERT INTO audit_logs (id, actor_id, action, entity_type, entity_id, details, created_at)
        VALUES (?, ?, 'mfa_challenge_failure', 'user', ?, 'Invalid TOTP code', datetime('now'))
      `).run(uuidv4(), userId, userId);

      return NextResponse.json({ error: 'Invalid verification code. Please try again.' }, { status: 401 });
    }

    // If MFA was not yet enabled, enable it now (first-time verification confirms enrollment)
    if (!user.mfa_enabled) {
      db.prepare('UPDATE users SET mfa_enabled = 1 WHERE id = ?').run(userId);
    }

    const { v4: uuidv4 } = require('uuid');
    db.prepare(`
      INSERT INTO audit_logs (id, actor_id, action, entity_type, entity_id, details, created_at)
      VALUES (?, ?, 'mfa_challenge_success', 'user', ?, 'TOTP verified successfully', datetime('now'))
    `).run(uuidv4(), userId, userId);

    // Issue a full session JWT now that MFA is verified
    const SESSION_MAX_AGE = 60 * 60 * 24 * 7;
    const sessionPayload = { userId: payload.userId, role: payload.role, orgId: payload.orgId, orgType: payload.orgType };
    const fullToken = require('jsonwebtoken').sign(sessionPayload, process.env.JWT_SECRET || 'abidebylaw-dev-secret-change-in-production-2026', { expiresIn: SESSION_MAX_AGE });

    // Determine redirect based on role
    let redirectTo = '/dashboard';
    if (payload.role === 'platform_admin') redirectTo = '/platform';
    else if (payload.role === 'individual' || payload.role === 'client') redirectTo = '/portal';
    else if (payload.role === 'team_member' || payload.role === 'team_manager') redirectTo = '/staff';

    // Build user info for the frontend
    const userInfo = { id: user.id, email: user.email, first_name: user.first_name, last_name: user.last_name, role: payload.role, org_id: payload.orgId };

    const response = NextResponse.json({ verified: true, mfa_enabled: true, user: userInfo, redirect: redirectTo });
    response.cookies.set('auth_session', fullToken, { path: '/', httpOnly: true, secure: true, sameSite: 'lax', maxAge: SESSION_MAX_AGE });
    response.cookies.delete('mfa_pending');
    return response;
  } catch (error: any) {
    console.error('MFA verify error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
