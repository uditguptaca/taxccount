import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'abidebylaw-dev-secret-change-in-production-2026';

interface SessionContext {
  userId: string;
  role: string;
  orgId: string;
  orgType: string;
  isPlatformAdmin: boolean;
  isFirmAdmin: boolean;
  isIndividual: boolean;
  isClient: boolean;
}

/**
 * Get the authenticated session context.
 * Tries JWT first (secure), falls back to legacy cookies (backward compat).
 */
export function getSessionContext(): SessionContext | null {
  const cookieStore = cookies();

  // 1. Try signed JWT session (preferred, tamper-proof)
  const sessionToken = cookieStore.get('auth_session')?.value;
  if (sessionToken) {
    try {
      const decoded = jwt.verify(sessionToken, JWT_SECRET) as any;
      return {
        userId: decoded.userId,
        role: decoded.role,
        orgId: decoded.orgId || '',
        orgType: decoded.orgType || '',
        isPlatformAdmin: decoded.role === 'platform_admin',
        isFirmAdmin: decoded.role === 'firm_admin',
        isIndividual: decoded.role === 'individual',
        isClient: decoded.role === 'client',
      };
    } catch (err) {
      // JWT invalid or expired — fall through to legacy cookies
      console.warn('[Auth] JWT verification failed:', (err as Error).message);
    }
  }

  // 2. Fallback: read legacy plain cookies (backward compat)
  const userId = cookieStore.get('auth_user_id')?.value;
  const role = cookieStore.get('auth_role')?.value;
  const orgId = cookieStore.get('auth_org_id')?.value;
  const orgType = cookieStore.get('auth_org_type')?.value;

  if (!userId || !role) {
    return null;
  }

  return {
    userId,
    role,
    orgId: orgId || '',
    orgType: orgType || '',
    isPlatformAdmin: role === 'platform_admin',
    isFirmAdmin: role === 'firm_admin',
    isIndividual: role === 'individual',
    isClient: role === 'client',
  };
}
