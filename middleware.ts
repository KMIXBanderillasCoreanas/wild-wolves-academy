import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  try {
    const { pathname, searchParams } = request.nextUrl;
    
    // Lectura de cookies de sesión
    const rawRole = request.cookies.get('user_role')?.value;
    const userRole = rawRole ? decodeURIComponent(rawRole).toLowerCase().trim() : '';
    const rawCategory = request.cookies.get('account_category')?.value;
    const accountCategory = rawCategory ? decodeURIComponent(rawCategory).toLowerCase().trim() : '';
    const rawEmail = request.cookies.get('user_email')?.value;
    const userEmail = rawEmail ? decodeURIComponent(rawEmail).toLowerCase().trim() : '';

    // El ÚNICO dueño, programador y SuperAdmin con acceso total irrestricto a todo el sistema
    const isOwner = userEmail === 'wildwolvescdmx@gmail.com';

    // Detección estricta e inmutable de Tutor (Rol, Categoría o Patrón de Correo)
    const isGuardian = 
      userRole === 'guardian' || 
      userRole === 'parent' || 
      accountCategory === 'guardian_family' || 
      userEmail.includes('tutor') || 
      userEmail.includes('catalinalopez');

    // 1. Control de Cuota de IA
    if (pathname.startsWith('/api/student-mentor-ai') || pathname.startsWith('/api/ai/chat')) {
      const aiExceededCookie = request.cookies.get('ww_ai_limit_reached')?.value;
      if (aiExceededCookie === 'true' && !isOwner) {
        return NextResponse.json(
          {
            success: false,
            isExceeded: true,
            reply: 'Has alcanzado el límite mensual de consultas de IA de tu plan. Solicita asistencia con el Coach Ricardo.',
          },
          { status: 429 }
        );
      }
    }

    // 2. Blindaje de /master-bunker-hq (SOLO wildwolvescdmx@gmail.com)
    if (pathname.startsWith('/master-bunker-hq')) {
      if (isOwner) {
        return NextResponse.next();
      }

      // Si no es el dueño, redirigir al portal que le corresponda o a login
      if (userRole === 'coach') {
        return NextResponse.redirect(new URL('/dashboard-coach', request.url));
      }
      if (userRole === 'guardian' || userRole === 'parent') {
        return NextResponse.redirect(new URL('/dashboard-guardian', request.url));
      }
      if (userRole === 'student') {
        return NextResponse.redirect(new URL('/dashboard-student', request.url));
      }

      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', '/master-bunker-hq');
      return NextResponse.redirect(loginUrl);
    }

    // 3. Blindaje de /dashboard-coach (SOLO Coach Staff y Dueño wildwolvescdmx@gmail.com)
    if (pathname.startsWith('/dashboard-coach')) {
      if (isOwner || userRole === 'coach' || userRole === 'superadmin') {
        return NextResponse.next();
      }

      // Si un alumno o tutor intenta entrar a la vista del coach en incógnito o sin login
      if (userRole === 'student') {
        return NextResponse.redirect(new URL('/dashboard-student', request.url));
      }
      if (userRole === 'guardian' || userRole === 'parent') {
        return NextResponse.redirect(new URL('/dashboard-guardian', request.url));
      }

      // En modo incógnito sin sesión, bloquear y mandar a login
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', '/dashboard-coach');
      return NextResponse.redirect(loginUrl);
    }

    // 4. Blindaje de /dashboard-student (SOLO Alumnos y Dueño wildwolvescdmx@gmail.com)
    if (pathname.startsWith('/dashboard-student')) {
      // Si es tutor bajo cualquier criterio, BLOQUEAR y desviar INMEDIATAMENTE a su portal
      if (isGuardian && !isOwner) {
        return NextResponse.redirect(new URL('/dashboard-guardian', request.url));
      }

      if (isOwner || userRole === 'student') {
        return NextResponse.next();
      }

      // Si es coach, mandarlo a la duela
      if (userRole === 'coach') {
        return NextResponse.redirect(new URL('/dashboard-coach', request.url));
      }

      // Si entra en incógnito sin sesión, debe iniciar sesión primero
      if (!userEmail && !userRole) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', '/dashboard-student');
        return NextResponse.redirect(loginUrl);
      }
      return NextResponse.next();
    }

    // 5. Blindaje de /dashboard-guardian (SOLO Tutores/Padres y Dueño wildwolvescdmx@gmail.com)
    if (pathname.startsWith('/dashboard-guardian')) {
      if (isOwner || isGuardian) {
        return NextResponse.next();
      }

      // Si es estudiante verificado (y no tutor), mandarlo a su zona de estudiante
      if (userRole === 'student') {
        return NextResponse.redirect(new URL('/dashboard-student', request.url));
      }
      // Si es coach, mandarlo a la duela
      if (userRole === 'coach') {
        return NextResponse.redirect(new URL('/dashboard-coach', request.url));
      }

      // Si entra en incógnito sin sesión, debe iniciar sesión primero
      if (!userEmail && !userRole) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', '/dashboard-guardian');
        return NextResponse.redirect(loginUrl);
      }
      return NextResponse.next();
    }

    return NextResponse.next();
  } catch (err) {
    console.warn('Wild Wolves Middleware Fallback:', err);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    '/master-bunker-hq/:path*',
    '/dashboard-coach/:path*',
    '/dashboard-student/:path*',
    '/dashboard-guardian/:path*',
    '/api/student-mentor-ai/:path*',
    '/api/ai/:path*'
  ],
};
