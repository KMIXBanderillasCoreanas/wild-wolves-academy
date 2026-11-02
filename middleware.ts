import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const userRole = request.cookies.get('user_role')?.value;
  const userEmail = request.cookies.get('user_email')?.value?.toLowerCase();
  const host = request.headers.get('host') || '';
  const isLocalhost = host.includes('localhost') || host.includes('127.0.0.1');

  // 1. Control Inteligente de Cuota de IA: Bloqueo/Redirección amable con WhatsApp
  if (pathname.startsWith('/api/student-mentor-ai') || pathname.startsWith('/api/ai/chat')) {
    const aiExceededCookie = request.cookies.get('ww_ai_limit_reached')?.value;
    if (aiExceededCookie === 'true') {
      const coachWhatsAppUrl = `https://wa.me/525522427769?text=${encodeURIComponent(
        'Hola Coach Ricardo, alcancé mi límite mensual de consultas de IA en Wild Wolves CDMX. Quisiera activar o renovar mi Membresía Lobo Pro ($99 MXN) o Pack Familiar Élite ($149 MXN).'
      )}`;

      return NextResponse.json(
        {
          success: false,
          isExceeded: true,
          reply: '🐺 Has alcanzado el límite mensual de consultas de IA de tu plan (5 para Free, 50 para Atleta Lobo Pro, 100 para Familiar Élite). Para continuar recibiendo asistencia táctica y biomecánica en duela, solicita la activación o recarga con el Coach Ricardo.',
          whatsappUrl: coachWhatsAppUrl
        },
        { status: 429 }
      );
    }
  }

  // Identificación de cuentas directivas de Fundador / Dirección General
  const isDirector = 
    userRole === 'superadmin' || 
    userEmail === 'wildwolvescdmx@gmail.com' ||
    userEmail === 'ricardo@wildwolves.mx' ||
    userEmail === 'director@wildwolves.mx' ||
    userEmail === 'carlos@wildwolves.mx';

  // 2. Blindaje de /master-bunker-hq (SuperAdmin / Dirección General)
  if (pathname.startsWith('/master-bunker-hq')) {
    // Si un alumno o tutor intenta acceder, redirigir a su portal correspondiente
    if (userRole === 'student') {
      const studentUrl = new URL('/dashboard-student', request.url);
      studentUrl.searchParams.set('denied', 'bunker_restricted');
      return NextResponse.redirect(studentUrl);
    }
    if (userRole === 'guardian' || userRole === 'parent') {
      const guardianUrl = new URL('/dashboard-guardian', request.url);
      guardianUrl.searchParams.set('denied', 'bunker_restricted');
      return NextResponse.redirect(guardianUrl);
    }
    return NextResponse.next();
  }

  // 3. Blindaje de /dashboard-coach (Coach Staff & SuperAdmin)
  if (pathname.startsWith('/dashboard-coach')) {
    if (isDirector || userRole === 'coach') {
      return NextResponse.next();
    }

    // Parámetros de pase directo para staff o modo demo
    if (searchParams.get('full_access') === 'unrestricted' || searchParams.get('access') === 'coach') {
      const response = NextResponse.next();
      if (!userRole) {
        response.cookies.set('user_role', 'coach', { path: '/', maxAge: 86400, sameSite: 'lax' });
      }
      return response;
    }

    // En entorno de desarrollo local (localhost:3000), permitir acceso para pruebas
    if (isLocalhost && !userRole) {
      const response = NextResponse.next();
      response.cookies.set('user_role', 'coach', { path: '/', maxAge: 86400, sameSite: 'lax' });
      return response;
    }

    // Si es estudiante o tutor, restringir hacia su portal respectivo
    if (userRole === 'student') {
      const studentUrl = new URL('/dashboard-student', request.url);
      studentUrl.searchParams.set('denied', 'coach_area_restricted');
      return NextResponse.redirect(studentUrl);
    }
    if (userRole === 'guardian' || userRole === 'parent') {
      const guardianUrl = new URL('/dashboard-guardian', request.url);
      guardianUrl.searchParams.set('denied', 'coach_area_restricted');
      return NextResponse.redirect(guardianUrl);
    }

    // Si no tiene sesión activa de coach/superadmin, enviar al login
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', '/dashboard-coach');
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/master-bunker-hq/:path*',
    '/dashboard-coach/:path*',
    '/api/student-mentor-ai/:path*',
    '/api/ai/:path*'
  ],
};
