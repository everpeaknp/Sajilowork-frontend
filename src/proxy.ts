/**
 * Next.js Proxy (formerly Middleware)
 * 
 * Handles route protection and authentication checks
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that require authentication
const protectedRoutes = [
  '/post-task',
  '/my-tasks',
  '/tasker-dashboard',
  '/message',
  '/profile',
  '/settings'
];

// Routes that should redirect to dashboard if already authenticated
const authRoutes = ['/signin', '/signup'];

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get token from cookies
  const accessToken = request.cookies.get('access_token')?.value;
  const isAuthenticated = !!accessToken;

  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );

  // Check if route is auth route
  const isAuthRoute = authRoutes.some(route => 
    pathname.startsWith(route)
  );

  // Redirect to signin if accessing protected route without auth
  if (isProtectedRoute && !isAuthenticated) {
    const url = new URL('/signin', request.url);
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  // Redirect to home if accessing auth routes while authenticated
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
