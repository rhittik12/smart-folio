/**
 * Authentication React Hooks
 */

'use client'

import { useSession as useBetterAuthSession } from '@/lib/auth-client'

export function useAuth() {
  const { data: session, isPending } = useBetterAuthSession()

  return {
    user: session?.user ?? null,
    session,
    isLoading: isPending,
    isAuthenticated: !!session?.user,
  }
}

export function useRequireAuth() {
  const { user, isLoading } = useAuth()

  if (!isLoading && !user) {
    throw new Error('Authentication required')
  }

  return { user, isLoading }
}
