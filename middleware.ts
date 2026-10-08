import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const userRole = request.cookies.get('user_role')?.value;

  // 1. Proteger el panel de Entrenador (Coach) contra accesos indebidos de rol 'student'
  if (pathname.startsWith('/dashboard-coach')) {
    if (userRole === 'student') {
      const studentUrl = new URL('/dashboard-student', request.url);
      studentUrl.searchParams.set('denied', 'coach_area_restricted');
      return NextResponse.redirect(studentUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard-coach/:path*', '/dashboard-student/:path*'],
};
