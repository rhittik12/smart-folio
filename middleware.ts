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

async function getSession(request: NextRequest): Promise<boolean> {
  const cookie = request.cookies.get('better-auth.session_token')
  if (!cookie?.value) return false

  try {
    const res = await fetch(new URL('/api/auth/get-session', request.url), {
      headers: { cookie: request.headers.get('cookie') || '' },
    })
    if (!res.ok) return false
    const data = await res.json()
    return !!data?.session
  } catch {
    return false
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip API and static routes — no auth gating needed
  if (pathname.startsWith('/api') || pathname.startsWith('/_next')) {
    return NextResponse.next()
  }

  const isPublicRoute = publicRoutes.some(route => isRouteMatch(pathname, route))
  const isAuthRoute = authRoutes.some(route => isRouteMatch(pathname, route))

  // Public routes that aren't auth routes need no session check at all
  if (isPublicRoute && !isAuthRoute) {
    return NextResponse.next()
  }

  // Validate session via Better Auth API (runs on Node.js, has Prisma access).
  // Only called when the route actually requires knowing auth state:
  // protected routes and auth routes (to redirect logged-in users away).
  const hasValidSession = await getSession(request)

  if (hasValidSession && isAuthRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  if (isPublicRoute) {
    return NextResponse.next()
  }

  if (!hasValidSession) {
    const signInUrl = new URL('/', request.url)
    signInUrl.searchParams.set('auth', 'login')
    signInUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(signInUrl)
  }

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
