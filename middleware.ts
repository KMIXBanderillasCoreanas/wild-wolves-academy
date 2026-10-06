import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const userRole = request.cookies.get('user_role')?.value;

  // 1. Guard Coach Dashboard: Only accessible by users with role 'coach'
  if (pathname.startsWith('/dashboard-coach')) {
    if (!userRole) {
      // Unauthenticated, redirect to login
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', '/dashboard-coach');
      return NextResponse.redirect(loginUrl);
    }

    if (userRole !== 'coach') {
      // Role is student, redirect to student dashboard with error
      const studentUrl = new URL('/dashboard-student', request.url);
      studentUrl.searchParams.set('denied', 'coach_area_restricted');
      return NextResponse.redirect(studentUrl);
    }
  }

  // 2. Guard Student Dashboard: Requires authentication
  if (pathname.startsWith('/dashboard-student')) {
    if (!userRole) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', '/dashboard-student');
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard-coach/:path*',
    '/dashboard-student/:path*',
  ],
};
