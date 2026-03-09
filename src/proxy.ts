import { type NextRequest, NextResponse } from 'next/server';

export async function proxy(_request: NextRequest) {
  return NextResponse.next(); // ← எல்லாத்தையும் allow பண்ணு
}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
