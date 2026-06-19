import { NextResponse } from 'next/server';

const COOKIE_OPTIONS = {
  path: '/',
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const access = body?.access;
    const refresh = body?.refresh;

    if (typeof access !== 'string' || typeof refresh !== 'string' || !access || !refresh) {
      return NextResponse.json({ success: false, message: 'Invalid tokens' }, { status: 400 });
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set('access_token', access, {
      ...COOKIE_OPTIONS,
      maxAge: 60 * 60 * 24,
    });
    response.cookies.set('refresh_token', refresh, {
      ...COOKIE_OPTIONS,
      maxAge: 60 * 60 * 24 * 7,
    });
    return response;
  } catch {
    return NextResponse.json({ success: false, message: 'Failed to set session' }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set('access_token', '', { ...COOKIE_OPTIONS, maxAge: 0 });
  response.cookies.set('refresh_token', '', { ...COOKIE_OPTIONS, maxAge: 0 });
  return response;
}
