import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { cookies } from 'next/headers';
import { generateMfaSecret, buildOtpAuthUri, generateRecoveryCodes, verifyTOTP } from '@/lib/mfa';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('auth_user_id')?.value;
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const db = getDb();
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as any;
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // Generate a new TOTP secret
    const secret = generateMfaSecret();
    const otpauthUri = buildOtpAuthUri(secret, user.email);
    const recoveryCodes = generateRecoveryCodes(8);

    // Store secret temporarily (not yet confirmed until verify step)
    // We use a migration-safe approach: add columns if they don't exist
    try {
      db.exec(`ALTER TABLE users ADD COLUMN mfa_secret TEXT;`);
    } catch (e) { /* column already exists */ }
    try {
      db.exec(`ALTER TABLE users ADD COLUMN mfa_enabled INTEGER NOT NULL DEFAULT 0;`);
    } catch (e) { /* column already exists */ }
    try {
      db.exec(`ALTER TABLE users ADD COLUMN mfa_recovery_codes TEXT;`);
    } catch (e) { /* column already exists */ }

    // Store the pending secret (not enabled yet until verified)
    db.prepare('UPDATE users SET mfa_secret = ? WHERE id = ?').run(secret, userId);

    // Log to audit
    const { v4: uuidv4 } = require('uuid');
    db.prepare(`
      INSERT INTO audit_logs (id, actor_id, action, entity_type, entity_id, details, created_at)
      VALUES (?, ?, 'mfa_setup_initiated', 'user', ?, 'MFA enrollment started', datetime('now'))
    `).run(uuidv4(), userId, userId);

    return NextResponse.json({
      secret,
      otpauthUri,
      recoveryCodes,
      message: 'Scan the QR code with your authenticator app, then verify with a code.'
    });
  } catch (error: any) {
    console.error('MFA setup error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
