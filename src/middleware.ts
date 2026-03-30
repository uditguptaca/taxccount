import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// In-memory rate limit store (edge-compatible, no imports from Node.js libs)
const rateLimits = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = rateLimits.get(key);
  if (!entry || now > entry.resetAt) {
    rateLimits.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }
  entry.count++;
  return entry.count > max;
}

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const response = NextResponse.next();

  // ── Security Headers (ASVS L2) ──────────────────────────────────────
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(self), microphone=(), geolocation=(), payment=(self)');

  // ── Rate Limiting for Auth Endpoints ────────────────────────────────
  if (path.startsWith('/api/auth/')) {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
               request.headers.get('x-real-ip') || 
               'unknown';
    const key = `auth:${ip}`;
    
    // 10 auth requests per minute per IP
    if (checkRateLimit(key, 10, 60_000)) {
      return NextResponse.json(
        { error: 'Too many authentication attempts. Please try again later.' },
        { status: 429, headers: { 'Retry-After': '60' } }
      );
    }
  }

  // ── Rate Limiting for File Uploads ──────────────────────────────────
  if (path === '/api/documents' && request.method === 'POST') {
    const userId = request.cookies.get('auth_user_id')?.value || 'anon';
    const key = `upload:${userId}`;
    
    // 30 uploads per minute per user
    if (checkRateLimit(key, 30, 60_000)) {
      return NextResponse.json(
        { error: 'Upload rate limit exceeded. Please try again shortly.' },
        { status: 429, headers: { 'Retry-After': '60' } }
      );
    }
  }

  // ── Rate Limiting for Payment Endpoints ─────────────────────────────
  if (path.includes('/pay') && request.method === 'POST') {
    const userId = request.cookies.get('auth_user_id')?.value || 'anon';
    const key = `pay:${userId}`;
    
    // 5 payment attempts per minute
    if (checkRateLimit(key, 5, 60_000)) {
      return NextResponse.json(
        { error: 'Payment rate limit exceeded. Please wait before trying again.' },
        { status: 429, headers: { 'Retry-After': '60' } }
      );
    }
  }

  // ── RBAC Access Control ─────────────────────────────────────────────
  const isDashboard = path.startsWith('/dashboard');
  const isPortal = path.startsWith('/portal');

  if (!isDashboard && !isPortal) {
    return response;
  }

  const roleCookie = request.cookies.get('auth_role')?.value;

  // Unauthenticated users trying to access protected routes -> Login
  if (!roleCookie) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Clients shouldn't access dashboard
  if (isDashboard && roleCookie === 'client') {
    return NextResponse.redirect(new URL('/portal', request.url));
  }

  // Admins/Teams shouldn't access client sandbox
  if (isPortal && roleCookie !== 'client') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Team Members (non-admin/manager) cannot access Settings or Billing
  if (roleCookie === 'team_member') {
    if (path.startsWith('/dashboard/settings') || path.startsWith('/dashboard/billing')) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return response;
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ['/dashboard/:path*', '/portal/:path*', '/api/:path*'],
};
