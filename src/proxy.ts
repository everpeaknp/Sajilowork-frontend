/**
 * Next.js Proxy (replaces middleware in Next.js 16+)
 *
 * Route protection and authentication checks.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedRoutes = [
  '/my-tasks',
  '/tasker-dashboard',
  '/message',
  '/profile',
  '/settings',
  '/dashboard',
];

const authRoutes = ['/signin', '/signup'];

function isAccessTokenValid(token: string | undefined): boolean {
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = typeof payload.exp === 'number' ? payload.exp * 1000 : 0;
    return exp > Date.now();
  } catch {
    return false;
  }
}

function hasValidSession(request: NextRequest): boolean {
  const accessToken = request.cookies.get('access_token')?.value;
  if (isAccessTokenValid(accessToken)) return true;

  // Allow through when access expired but refresh is still valid — client will refresh.
  const refreshToken = request.cookies.get('refresh_token')?.value;
  return isAccessTokenValid(refreshToken);
}

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuthenticated = hasValidSession(request);

  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  if (isProtectedRoute && !isAuthenticated) {
    const url = new URL('/signin', request.url);
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
