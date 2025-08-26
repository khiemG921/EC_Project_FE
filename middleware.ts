import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Edge middleware: only guard admin to avoid false redirects right after login.
export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const path = request.nextUrl.pathname;

  if (path.startsWith('/admin')) {
    console.log('[MW] Admin gate', {
      path,
      hasToken: Boolean(token),
    });
  }

  if (path.startsWith('/admin') && !token) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
  ],
};
