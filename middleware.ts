import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Define public routes that don't require authentication
const publicRoutes = [
  '/',
  '/pricing',
  '/about',
  '/contact',
  '/sign-in',
  '/sign-up',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
]

// Define routes that should redirect to dashboard if authenticated
const authRoutes = [
  '/sign-in',
  '/sign-up',
]

function isRouteMatch(pathname: string, route: string): boolean {
  if (route === '/') return pathname === '/'
  return pathname === route || pathname.startsWith(route + '/')
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip static assets and API routes early
  if (pathname.startsWith('/api') || pathname.startsWith('/_next')) {
    return NextResponse.next()
  }

  // Check if the route is public
  const isPublicRoute = publicRoutes.some(route => isRouteMatch(pathname, route))
  const isAuthRoute = authRoutes.some(route => isRouteMatch(pathname, route))

  // Check for session cookie instead of calling Prisma directly.
  // Better Auth stores the session token in a cookie named "better-auth.session_token".
  // This avoids importing Prisma Client, which cannot run on Edge runtime.
  const sessionCookie = request.cookies.get('better-auth.session_token')
  const hasSession = !!sessionCookie?.value

  // If user is authenticated and trying to access auth routes, redirect to dashboard
  if (hasSession && isAuthRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // If route is public, allow access
  if (isPublicRoute) {
    return NextResponse.next()
  }

  // If user is not authenticated and trying to access protected route
  if (!hasSession) {
    const signInUrl = new URL('/', request.url)
    signInUrl.searchParams.set('auth', 'login')
    signInUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(signInUrl)
  }

  // Allow access to protected routes for authenticated users
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
