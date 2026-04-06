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
  if (path === '/' || path === '/login' || path === '/signup' || path.startsWith('/api/auth/')) {
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

  const roleCookie = request.cookies.get('auth_role')?.value;
  const orgIdCookie = request.cookies.get('auth_org_id')?.value;

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

  // API routes — just pass through (auth checked in route handlers)
  return response;
}

export const config = {
  matcher: ['/dashboard/:path*', '/portal/:path*', '/staff/:path*', '/platform/:path*', '/api/:path*'],
};
