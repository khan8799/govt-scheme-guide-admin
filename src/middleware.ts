import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';


const protectedRoutes = [
  '/admin',
  '/scheme',
  '/category',
  '/state',
  '/profile',
];

const publicRoutes = [
  '/signin',
  '/signup',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token')?.value || request.headers.get('authorization');

  const isProtectedRoute = protectedRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );

  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );

  if (isProtectedRoute && !token) {
    const signinUrl = new URL('/signin', request.url);
    signinUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(signinUrl);
  }

  if (isPublicRoute && token) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [

    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
