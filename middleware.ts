import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtDecode } from 'jwt-decode'

interface DecodedToken {
  role?: string;
  [key: string]: any;
}

export async function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname

  // Define protected routes and admin-only routes
  const protectedRoutes = ['/settings', '/profile', '/inventory', '/']
  const adminOnlyRoutes = ['/settings/users']
  const managerRoutes = ['/settings']

  // Check if the path is protected
  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route))
  const isAdminRoute = adminOnlyRoutes.some(route => path.startsWith(route))
  const isManagerRoute = managerRoutes.some(route => path.startsWith(route))

  // Get the Firebase auth token from the cookie
  const token = request.cookies.get('firebase-token')?.value

  // If the route is protected and there's no token, redirect to login
  if (isProtectedRoute && !token) {
    const response = NextResponse.redirect(new URL('/login', request.url))
    response.cookies.delete('firebase-token') // Clear any invalid token
    return response
  }

  // If there's a token and it's an admin/manager route, check claims
  if (token && (isAdminRoute || isManagerRoute)) {
    try {
      const decodedToken = jwtDecode<DecodedToken>(token)
      const role = decodedToken?.role || 'user'

      // Check permissions for admin routes
      if (isAdminRoute && role !== 'admin') {
        return NextResponse.redirect(new URL('/', request.url))
      }

      // Check permissions for manager routes
      if (isManagerRoute && role !== 'admin' && role !== 'manager') {
        return NextResponse.redirect(new URL('/', request.url))
      }
    } catch (error) {
      // If token decoding fails, redirect to login
      const response = NextResponse.redirect(new URL('/login', request.url))
      response.cookies.delete('firebase-token')
      return response
    }
  }

  return NextResponse.next()
}

// Configure which routes to run middleware on
export const config = {
  matcher: ['/settings/:path*', '/profile/:path*', '/inventory/:path*', '/']
} 