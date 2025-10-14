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

// Admin-only routes
const adminRoutes = [
  '/admin',
  '/system-settings'
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

// Basic JWT validation (client-side only - not for security)
function isValidJwtFormat(token: string): boolean {
  if (!token || typeof token !== 'string') return false;
  
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  
  try {
    // Try to decode to check if it's valid base64
    atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'));
    return true;
  } catch {
    return false;
  }
}

// Check if JWT token is expired (client-side only)
function isTokenExpired(token: string): boolean {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return true;
    
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    const currentTime = Math.floor(Date.now() / 1000);
    
    return payload.exp < currentTime;
  } catch {
    return true;
  }
}

// Check if JWT token is used before issued at (iat)
function isTokenUsedBeforeIssued(token: string): boolean {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return true;
    
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    
    if (!payload.iat) return false;
    
    const currentTime = Math.floor(Date.now() / 1000);
    // Add 5 minutes tolerance for clock skew
    const tolerance = 5 * 60; // 5 minutes in seconds
    return currentTime < (payload.iat - tolerance);
  } catch {
    return true;
  }
}

// Check if JWT token is valid (not expired and not used before issued)
function isTokenValid(token: string): boolean {
  if (!token || !isValidJwtFormat(token)) return false;
  
  // Check if token is used before issued
  if (isTokenUsedBeforeIssued(token)) {
    console.log('Token used before issued at (iat)');
    return false;
  }
  
  // Check if token is expired
  if (isTokenExpired(token)) {
    console.log('Token is expired');
    return false;
  }
  
  return true;
}

// Extract user role from JWT token
function extractUserRole(token: string): string | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    return payload.role || null;
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  // Check if the current path is an admin route
  const isAdminRoute = adminRoutes.some(route => 
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
  
  // Validate token format and expiration
  const isValidToken = accessToken && isTokenValid(accessToken);
  
  // If accessing a protected route without valid token, let client-side handle refresh
  // Only redirect if there's no token at all (not just expired)
  if (isProtectedRoute && !accessToken) {
    const signInUrl = new URL('/sign-in', request.url);
    signInUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(signInUrl);
  }
  
  // If accessing admin routes, check for admin role
  if (isAdminRoute && isValidToken) {
    const userRole = extractUserRole(accessToken);
    if (userRole !== 'Admin') {
      // Redirect non-admin users to dashboard
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }
  
  // If accessing auth routes (sign-in, sign-up, landing) with valid token, redirect to dashboard
  if (isAuthRoute && isValidToken) {
    console.log(`Redirecting authenticated user from ${pathname} to dashboard`);
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  // Handle root path: redirect to dashboard if authenticated, otherwise to landing
  if (pathname === '/') {
    if (isValidToken) {
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