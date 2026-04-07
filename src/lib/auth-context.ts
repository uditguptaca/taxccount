import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'abidebylaw-dev-secret-change-in-production-2026';
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days
const REFRESH_THRESHOLD = 60 * 60 * 24; // 24 hours

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
 * Strictly uses signed JWT — no fallback to plain cookies.
 */
export function getSessionContext(): SessionContext | null {
  const cookieStore = cookies();

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
      console.warn('[Auth] JWT verification failed:', (err as Error).message);
    }
  }

  return null;
}

/**
 * Sliding session refresh: if the current JWT is within 24 hours of expiry,
 * attach a fresh Set-Cookie header to the given response to extend the session.
 */
export function refreshSessionIfNeeded(response: NextResponse): NextResponse {
  try {
    const cookieStore = cookies();
    const sessionToken = cookieStore.get('auth_session')?.value;
    if (!sessionToken) return response;

    const decoded = jwt.verify(sessionToken, JWT_SECRET) as any;
    if (!decoded.exp) return response;

    const timeLeft = decoded.exp - Math.floor(Date.now() / 1000);
    if (timeLeft > 0 && timeLeft < REFRESH_THRESHOLD) {
      const { iat, exp, ...payload } = decoded;
      const freshToken = jwt.sign(payload, JWT_SECRET, { expiresIn: SESSION_MAX_AGE });
      response.cookies.set('auth_session', freshToken, {
        path: '/', httpOnly: true, secure: true, sameSite: 'lax', maxAge: SESSION_MAX_AGE,
      });
    }
  } catch {
    // Silent fail — don't break the request
  }
  return response;
}
