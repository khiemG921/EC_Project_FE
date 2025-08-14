import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;

  // Protected routes that require authentication
  const protectedRoutes = [
    '/dashboard',
    '/booking',
    '/history', 
    '/vouchers',
    '/profile',
    '/favorite'
  ];

  // Check if current path starts with any protected route
  const isProtectedRoute = protectedRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  );

  // If accessing protected route without token, redirect to login
  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/dashboard/:path*', '/booking/:path*', '/history/:path*', '/vouchers/:path*', '/profile/:path*', '/favorite/:path*'],
};
