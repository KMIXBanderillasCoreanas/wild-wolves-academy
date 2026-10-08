import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const userRole = request.cookies.get('user_role')?.value;

  // 1. Proteger estrictamente el panel de Entrenador (Coach & SuperAdmin)
  if (pathname.startsWith('/dashboard-coach')) {
    // Si es estudiante, restringir hacia su portal
    if (userRole === 'student') {
      const studentUrl = new URL('/dashboard-student', request.url);
      studentUrl.searchParams.set('denied', 'coach_area_restricted');
      return NextResponse.redirect(studentUrl);
    }
    // Si no tiene sesión activa de coach/superadmin, enviar al login
    if (!userRole || (userRole !== 'coach' && userRole !== 'superadmin')) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', '/dashboard-coach');
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard-coach/:path*', '/dashboard-student/:path*'],
};
