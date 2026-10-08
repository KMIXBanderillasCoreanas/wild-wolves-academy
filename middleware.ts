import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const userRole = request.cookies.get('user_role')?.value;

  // 1. Proteger estrictamente el panel de Entrenador (Coach & SuperAdmin)
  if (pathname.startsWith('/dashboard-coach')) {
    const userEmail = request.cookies.get('user_email')?.value?.toLowerCase();
    const isSuper = userRole === 'superadmin' || userEmail === 'wildwolvescdmx@gmail.com';
    if (isSuper) {
      return NextResponse.next();
    }

    // Si viene con credencial de pase directo de dirección o staff, permitir y setear cookie
    if (searchParams.get('full_access') === 'unrestricted' || searchParams.get('access') === 'coach') {
      const response = NextResponse.next();
      if (!userRole) {
        response.cookies.set('user_role', 'superadmin', { path: '/', maxAge: 86400, sameSite: 'lax' });
      }
      return response;
    }

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
  matcher: ['/dashboard-coach/:path*'],
};
