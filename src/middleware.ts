import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'abidebylaw-dev-secret-change-in-production-2026';

function base64urlToBytes(input: string): Uint8Array {
  const b64 = input.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(input.length / 4) * 4, '=');
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

/**
 * Verify an HS256 token's signature and expiry (Edge-safe, no jsonwebtoken).
 * The middleware used to only DECODE the payload, so a token with any signature
 * passed, and routes that rely on the middleware alone (payroll, the service
 * master) were open to anyone who could write a JSON object.
 */
async function verifySession(token: string): Promise<any | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const header = JSON.parse(new TextDecoder().decode(base64urlToBytes(parts[0])));
    if (header.alg !== 'HS256') return null;
    const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(JWT_SECRET), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']);
    const ok = await crypto.subtle.verify('HMAC', key, base64urlToBytes(parts[2]) as unknown as BufferSource, new TextEncoder().encode(parts[0] + '.' + parts[1]));
    if (!ok) return null;
    const payload = JSON.parse(new TextDecoder().decode(base64urlToBytes(parts[1])));
    if (typeof payload.exp === 'number' && payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const response = NextResponse.next();

  // Security Headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Public routes — no auth needed
  if (path === '/' || path === '/login' || path === '/login/mfa' || path === '/signup' || path === '/api/auth' || path.startsWith('/api/auth/')) {
    return response;
  }

  const isPlatform = path.startsWith('/platform');
  const isDashboard = path.startsWith('/dashboard');
  const isPortal = path.startsWith('/portal');
  const isStaff = path.startsWith('/staff');
  const isApi = path.startsWith('/api/');

  if (!isPlatform && !isDashboard && !isPortal && !isStaff && !isApi) {
    return response;
  }

  // Extract role from JWT session (decode only — full verification happens in API routes)
  // Edge middleware can't use the full jsonwebtoken library, so we decode the JWT payload
  let roleCookie: string | undefined;
  let sessionToken = request.cookies.get('auth_session')?.value;

  if (!sessionToken) {
    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      sessionToken = authHeader.slice(7);
    }
  }

  if (sessionToken) {
    const payload = await verifySession(sessionToken);
    if (payload) {
      roleCookie = payload.role;

      // Sliding session refresh: if token expires within 24 hours, ask the API layer to reissue
      if (payload.exp) {
        const timeLeft = payload.exp - Math.floor(Date.now() / 1000);
        if (timeLeft > 0 && timeLeft < 60 * 60 * 24) {
          response.headers.set('x-session-refresh', 'true');
        }
      }
    }
  }

  // Strict Enforcement: Do NOT fall back to legacy auth_role cookie

  // Unauthenticated → login
  if (!roleCookie) {
    if (isApi) {
      return NextResponse.json({ error: 'Unauthorized: Authentication required' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Platform admin routes
  if (isPlatform || path.startsWith('/api/platform')) {
    if (roleCookie !== 'platform_admin') {
      if (isApi) return NextResponse.json({ error: 'Unauthorized: Platform access required' }, { status: 403 });
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return response;
  }

  // Dashboard → only firm_admin / admin
  if (isDashboard) {
    if (roleCookie === 'client' || roleCookie === 'individual') {
      return NextResponse.redirect(new URL('/portal', request.url));
    }
    if (roleCookie === 'team_member' || roleCookie === 'team_manager') {
      return NextResponse.redirect(new URL('/staff', request.url));
    }
    if (roleCookie === 'platform_admin') {
      return NextResponse.redirect(new URL('/platform/service-master', request.url));
    }
    return response;
  }

  // Staff → team_manager / team_member (admins can also access)
  if (isStaff) {
    if (roleCookie === 'client' || roleCookie === 'individual') {
      return NextResponse.redirect(new URL('/portal', request.url));
    }
    if (roleCookie === 'platform_admin') {
      return NextResponse.redirect(new URL('/platform', request.url));
    }
    return response;
  }

  // Portal → client / individual
  if (isPortal) {
    if (roleCookie === 'platform_admin') {
      return NextResponse.redirect(new URL('/platform', request.url));
    }
    if (roleCookie === 'firm_admin' || roleCookie === 'admin') {
      if (path.startsWith('/portal/smart-forms/fill/')) {
        return response;
      }
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    if (roleCookie === 'team_member' || roleCookie === 'team_manager') {
      if (path.startsWith('/portal/smart-forms/fill/')) {
        return response;
      }
      return NextResponse.redirect(new URL('/staff', request.url));
    }
    return response;
  }

  // API routes — just pass through (auth checked in route handlers via JWT verification)
  return response;
}

export const config = {
  matcher: ['/dashboard/:path*', '/portal/:path*', '/staff/:path*', '/platform/:path*', '/api/:path*'],
};
