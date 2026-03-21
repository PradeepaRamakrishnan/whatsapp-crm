import { type NextRequest, NextResponse } from 'next/server';
import type { User } from './features/auth/types/auth.types';

const publicRoutes = ['/login', '/interested', '/not-interested', '/users/upload'];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  try {
    const url = process.env.NEXT_PUBLIC_USERS_API_URL;

    const response = await fetch(`${url}/me`, {
      method: 'GET',
      headers: {
        Cookie: request.headers.get('cookie') || '',
      },
    });

    if (!response.ok) {
      throw new Error(`${response.status}`);
    }

    const user: User = await response.json();

    console.info('Authenticated user:', user.id);

    if (pathname === '/' || pathname.startsWith('/login')) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
  } catch (error) {
    if (error instanceof Error && error.message !== '401') {
      console.error('Authentication error:', error.message);
    }

    if (pathname === '/' || pathname.startsWith('/login')) {
      return NextResponse.next();
    }

    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
