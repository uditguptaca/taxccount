import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const response = NextResponse.next();

  // Security Headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Public routes — no auth needed
  if (path === '/' || path === '/login' || path === '/login/mfa' || path === '/signup' || path.startsWith('/api/auth/')) {
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
  const sessionToken = request.cookies.get('auth_session')?.value;

  if (sessionToken) {
    try {
      // Decode JWT payload (base64) without verification — routing only
      const parts = sessionToken.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf-8'));
        roleCookie = payload.role;
        
        // Sliding session refresh: if token expires within 24 hours, silently reissue
        if (payload.exp) {
          const now = Math.floor(Date.now() / 1000);
          const timeLeft = payload.exp - now;
          const ONE_DAY = 60 * 60 * 24;
          const SEVEN_DAYS = ONE_DAY * 7;
          if (timeLeft > 0 && timeLeft < ONE_DAY) {
            // Reconstruct the signing payload (strip iat/exp to let jwt.sign add fresh ones)
            const { iat, exp, ...signingPayload } = payload;
            // We cannot use jsonwebtoken in Edge middleware, so we set a flag header
            // that instructs the API layer to reissue
            response.headers.set('x-session-refresh', 'true');
          }
        }
      }
    } catch {
      // Token decode failed
    }
  }

  // Strict Enforcement: Do NOT fall back to legacy auth_role cookie

  // Unauthenticated → login
  if (!roleCookie) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Platform admin routes
  if (isPlatform) {
    if (roleCookie !== 'platform_admin') {
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
      return NextResponse.redirect(new URL('/platform', request.url));
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
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    if (roleCookie === 'team_member' || roleCookie === 'team_manager') {
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
