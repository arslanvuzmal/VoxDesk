import { NextRequest, NextResponse } from 'next/server';

export function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // Protect /dashboard and /dashboard/*
  if (pathname === '/dashboard' || pathname.startsWith('/dashboard/')) {
    const sessionToken = req.cookies.get('voxdesk_session')?.value;

    if (!sessionToken) {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('callbackUrl', `${pathname}${search}`);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard', '/dashboard/:path*'],
};

