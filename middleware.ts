import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Protected routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/projects',
  '/tasks',
  '/worklogs',
  '/performance',
  '/settings',
  '/meeting'
];

// Public routes that don't require authentication (excluding root path which is handled separately)
const publicRoutes = [
  '/sign-in',
  '/sign-up',
  '/landing'
];

// Routes that should redirect to dashboard if user is already authenticated
const authRoutes = [
  '/sign-in',
  '/sign-up',
  '/landing'
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  // Check if the current path is a public route
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route)
  );
  
  // Check if the current path is an auth route (should redirect if authenticated)
  const isAuthRoute = authRoutes.some(route => 
    pathname === route || pathname.startsWith(route)
  );
  
  // Get access token from cookies or headers
  const accessToken = request.cookies.get('accessToken')?.value || 
                     request.headers.get('authorization')?.replace('Bearer ', '');
  
  // If accessing a protected route without token, redirect to sign-in
  if (isProtectedRoute && !accessToken) {
    const signInUrl = new URL('/sign-in', request.url);
    signInUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(signInUrl);
  }
  
  // If accessing auth routes (sign-in, sign-up, landing) with valid token, redirect to dashboard
  if (isAuthRoute && accessToken) {
    console.log(`Redirecting authenticated user from ${pathname} to dashboard`);
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  // Handle root path: redirect to dashboard if authenticated, otherwise to landing
  if (pathname === '/') {
    if (accessToken) {
      console.log('Redirecting authenticated user from root to dashboard');
      return NextResponse.redirect(new URL('/dashboard', request.url));
    } else {
      console.log('Redirecting unauthenticated user from root to landing');
      return NextResponse.redirect(new URL('/landing', request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}