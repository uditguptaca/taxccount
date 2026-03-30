import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { cookies } from 'next/headers';
import { verifyTOTP } from '@/lib/mfa';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('auth_user_id')?.value;
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

    return NextResponse.json({ verified: true, mfa_enabled: true });
  } catch (error: any) {
    console.error('MFA verify error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
