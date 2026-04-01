import { type NextRequest, NextResponse } from 'next/server';
import type { User } from './features/auth/types/auth.types';
import { API_URLS } from './lib/api-urls';

const publicRoutes = ['/login', '/interested', '/not-interested', '/users/upload'];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  try {
    const response = await fetch(`${API_URLS.users}/me`, {
      method: 'GET',
      headers: {
        Cookie: request.headers.get('cookie') || '',
      },
    });

    if (response.status === 401) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    if (!response.ok) {
      // Non-401 errors (5xx, etc.) — don't kick the user out, let the page handle it
      console.error('Auth check non-OK response:', response.status);
      return NextResponse.next();
    }

    const user: User = await response.json();

    console.info('Authenticated user:', user.id);

    if (pathname === '/' || pathname.startsWith('/login')) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
  } catch (error) {
    // Network errors (fetch failed, DNS, etc.) — backend unreachable, don't redirect to login
    // as this would kick out authenticated users during transient backend issues
    console.error(
      'Authentication check failed (network error):',
      error instanceof Error ? error.message : error,
    );
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
