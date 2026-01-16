import axios from 'axios';
import { type NextRequest, NextResponse } from 'next/server';
import type { User } from './features/auth/types/auth.types';

const publicRoutes = ['/interested', '/interested-form'];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip auth check for public routes
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  try {
    const url = process.env.NEXT_PUBLIC_USERS_API_URL;

    const response = await axios<User>({
      method: 'GET',
      url: `${url}/me`,
      headers: {
        Cookie: request.headers.get('cookie') || '',
      },
      withCredentials: true,
    });

    console.info('Authenticated user:', response.data.id);

    if (pathname.startsWith('/login')) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // TODO: Add role-based access control here
    // if (data.role !== 'admin' && pathname.startsWith('/admin')) {
    //   return NextResponse.redirect(new URL('/unauthorized', request.url));
    // }

    return NextResponse.next();
  } catch (error) {
    console.error('Auth check failed:', error);
    if (pathname.startsWith('/login')) {
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
