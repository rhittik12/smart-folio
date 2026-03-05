import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Routes that are always accessible without auth — no session check at all
const publicRoutes = [
  '/pricing',
  '/about',
  '/contact',
  '/p',              // Published portfolios: /p/[slug]
  '/forgot-password',
  '/reset-password',
  '/verify-email',
]

// Routes that redirect authenticated users to /workspace
// but remain accessible to unauthenticated users
const authRedirectRoutes = [
  '/',
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

  // Redirect Better Auth error page to landing page with login modal
  if (pathname === '/api/auth/error') {
    const dest = new URL('/', request.url)
    dest.searchParams.set('auth', 'login')
    const error = request.nextUrl.searchParams.get('error')
    if (error) dest.searchParams.set('authError', error)
    return NextResponse.redirect(dest)
  }

  // Skip API and static routes
  if (pathname.startsWith('/api') || pathname.startsWith('/_next')) {
    return NextResponse.next()
  }

  const isPublic = publicRoutes.some(route => isRouteMatch(pathname, route))
  const isAuthRedirect = authRedirectRoutes.some(route => isRouteMatch(pathname, route))

  // Purely public routes — no session check needed
  if (isPublic) {
    return NextResponse.next()
  }

  // Auth-redirect routes and protected routes both need a session check
  const hasValidSession = await getSession(request)

  // Authenticated user on /, /sign-in, /sign-up → send to workspace
  // But allow if ?auth= param is present (explicit login/signup request)
  if (hasValidSession && isAuthRedirect) {
    const authParam = request.nextUrl.searchParams.get('auth')

    if (authParam !== "login" && authParam !== "signup") {
      return NextResponse.redirect(new URL('/workspace', request.url))
    }
  }

  // Unauthenticated user on /, /sign-in, /sign-up → allow (landing page)
  if (isAuthRedirect) {
    return NextResponse.next()
  }

  // Protected route without session → redirect to login modal with callback
  if (!hasValidSession) {
    const loginUrl = new URL('/', request.url)
    loginUrl.searchParams.set('auth', 'login')
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Authenticated user on protected route → allow
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder assets
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
