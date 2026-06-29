import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const COOKIE_OPTIONS = {
  path: '/',
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000/api/v1';

function clearAuthCookies(response: NextResponse) {
  response.cookies.set('access_token', '', { ...COOKIE_OPTIONS, maxAge: 0 });
  response.cookies.set('refresh_token', '', { ...COOKIE_OPTIONS, maxAge: 0 });
}

/** Server-side token refresh using httpOnly refresh cookie. */
export async function POST() {
  const cookieStore = await cookies();
  const refresh = cookieStore.get('refresh_token')?.value;

  if (!refresh) {
    const response = NextResponse.json(
      { success: false, message: 'No refresh token' },
      { status: 401 },
    );
    clearAuthCookies(response);
    return response;
  }

  try {
    const upstream = await fetch(`${API_BASE_URL}/auth/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh }),
      cache: 'no-store',
    });

    if (!upstream.ok) {
      const response = NextResponse.json(
        { success: false, message: 'Refresh failed' },
        { status: 401 },
      );
      clearAuthCookies(response);
      return response;
    }

    const data = (await upstream.json()) as { access?: string; refresh?: string };
    const access = data.access;
    const newRefresh = data.refresh || refresh;

    if (!access) {
      const response = NextResponse.json(
        { success: false, message: 'Invalid refresh response' },
        { status: 502 },
      );
      clearAuthCookies(response);
      return response;
    }

    const response = NextResponse.json({
      success: true,
      access,
      refresh: newRefresh,
    });

    response.cookies.set('access_token', access, {
      ...COOKIE_OPTIONS,
      maxAge: 60 * 60 * 24,
    });
    response.cookies.set('refresh_token', newRefresh, {
      ...COOKIE_OPTIONS,
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch {
    const response = NextResponse.json(
      { success: false, message: 'Refresh failed' },
      { status: 500 },
    );
    clearAuthCookies(response);
    return response;
  }
}
