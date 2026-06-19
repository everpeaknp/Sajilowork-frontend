/**
 * Next.js Proxy (replaces middleware in Next.js 16+)
 *
 * Route protection and authentication checks.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isJwtNotExpired } from '@/lib/jwt';

const protectedRoutes = [
  '/my-tasks',
  '/tasker-dashboard',
  '/message',
  '/profile',
  '/settings',
];

const authRoutes = ['/signin', '/signup'];

function hasValidSession(request: NextRequest): boolean {
  const accessToken = request.cookies.get('access_token')?.value;
  const refreshToken = request.cookies.get('refresh_token')?.value;

  if (!accessToken && !refreshToken) return false;
  if (isJwtNotExpired(accessToken)) return true;
  if (isJwtNotExpired(refreshToken)) return true;

  // Both cookies present — allow through so the client can refresh the session.
  return !!(accessToken && refreshToken);
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
    const redirect = request.nextUrl.searchParams.get('redirect');
    if (redirect && redirect.startsWith('/') && !redirect.startsWith('//')) {
      return NextResponse.redirect(new URL(redirect, request.url));
    }
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
