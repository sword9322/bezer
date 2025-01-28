import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname

  // Define protected routes
  const protectedRoutes = ['/settings', '/profile', '/inventory', '/']

  // Check if the path is protected
  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route))

  // Get the Firebase auth token from the cookie
  const token = request.cookies.get('firebase-token')?.value

  // If the route is protected and there's no token, redirect to login
  if (isProtectedRoute && !token) {
    const response = NextResponse.redirect(new URL('/login', request.url))
    response.cookies.delete('firebase-token') // Clear any invalid token
    return response
  }

  return NextResponse.next()
}

// Configure which routes to run middleware on
export const config = {
  matcher: ['/settings/:path*', '/profile/:path*', '/inventory/:path*', '/']
} 