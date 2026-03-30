import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { seedDatabase } from '@/lib/seed';
import bcryptjs from 'bcryptjs';
import { verifyTOTP } from '@/lib/mfa';
import { trackLoginAttempt } from '@/lib/security';

export async function POST(request: Request) {
  try {
    // Ensure seeded
    seedDatabase();
    
    const { email, password, mfa_code } = await request.json();
    const db = getDb();

    // ASVS L2: Check account lockout before processing
    const lockStatus = trackLoginAttempt(email, false);
    if (lockStatus.locked) {
      return NextResponse.json(
        { error: `Account temporarily locked due to too many failed attempts. Try again in ${lockStatus.lockoutMinutes} minutes.` },
        { status: 429 }
      );
    }
    
    const user = db.prepare('SELECT * FROM users WHERE email = ? AND is_active = 1').get(email) as any;
    
    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }
    
    const valid = bcryptjs.compareSync(password, user.password_hash);
    if (!valid) {
      trackLoginAttempt(email, false); // Count the failure
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Password correct — reset lockout counter
    trackLoginAttempt(email, true);

    // MFA Check: If user has MFA enabled, require TOTP code
    if (user.mfa_enabled && user.mfa_secret) {
      if (!mfa_code) {
        // Return partial auth — client must show MFA prompt
        return NextResponse.json({
          mfa_required: true,
          user: { email: user.email, first_name: user.first_name },
          message: 'MFA verification required. Please enter your authenticator code.'
        }, { status: 200 });
      }

      // Verify the TOTP code
      const mfaValid = verifyTOTP(user.mfa_secret, mfa_code);
      if (!mfaValid) {
        // Log failed MFA attempt
        const { v4: uuidv4 } = require('uuid');
        db.prepare(`
          INSERT INTO audit_logs (id, actor_id, action, entity_type, entity_id, details, created_at)
          VALUES (?, ?, 'mfa_challenge_failure', 'user', ?, 'Invalid TOTP during login', datetime('now'))
        `).run(uuidv4(), user.id, user.id);

        return NextResponse.json({ error: 'Invalid MFA code. Please try again.' }, { status: 401 });
      }
    }
    
    // Update last login
    db.prepare("UPDATE users SET last_login_at = datetime('now') WHERE id = ?").run(user.id);
    
    // Build response with cookies for RBAC Middleware
    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        mfa_enabled: !!user.mfa_enabled,
      }
    });

    response.cookies.set('auth_role', user.role, { path: '/', httpOnly: true, secure: true, maxAge: 60 * 60 * 24 * 7 });
    response.cookies.set('auth_user_id', user.id, { path: '/', httpOnly: true, secure: true, maxAge: 60 * 60 * 24 * 7 });
    
    // Log successful login
    try {
      const { v4: uuidv4 } = require('uuid');
      db.prepare(`
        INSERT INTO audit_logs (id, actor_id, action, entity_type, entity_id, details, created_at)
        VALUES (?, ?, 'auth_login_success', 'user', ?, ?, datetime('now'))
      `).run(uuidv4(), user.id, user.id, `Login successful${user.mfa_enabled ? ' (MFA verified)' : ''}`);
    } catch (e) { /* audit logging should never block login */ }

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

