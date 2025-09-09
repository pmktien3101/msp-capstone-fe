import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Basic middleware for API route handling
export function middleware(request: NextRequest) {
  // You can add your custom API authentication logic here
  return NextResponse.next()
}

// Optional: Configure which routes use the middleware
export const config = {
  matcher: ['/api/:path*']
}