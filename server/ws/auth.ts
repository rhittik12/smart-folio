import { parse as parseCookie } from 'cookie'
import type { IncomingMessage } from 'http'

export interface AuthResult {
  userId: string
  sessionId: string
}

const AUTH_URL = process.env.BETTER_AUTH_URL || 'http://localhost:3000'

export async function authenticateWsConnection(
  request: IncomingMessage,
): Promise<AuthResult> {
  const cookieHeader = request.headers.cookie
  if (!cookieHeader) {
    throw new Error('No cookies provided')
  }

  const cookies = parseCookie(cookieHeader)
  const sessionToken = cookies['better-auth.session_token']

  if (!sessionToken) {
    throw new Error('No session token found')
  }

  const res = await fetch(`${AUTH_URL}/api/auth/get-session`, {
    headers: {
      cookie: cookieHeader,
    },
  })

  if (!res.ok) {
    throw new Error(`Auth validation failed: ${res.status}`)
  }

  const data = await res.json() as { session?: { id: string }; user?: { id: string } }

  if (!data?.session?.id || !data?.user?.id) {
    throw new Error('Invalid session data')
  }

  return {
    userId: data.user.id,
    sessionId: data.session.id,
  }
}
