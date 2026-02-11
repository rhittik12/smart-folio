/**
 * Authentication Utilities
 */

import type { User } from './types'

export function getUserDisplayName(user: User | null): string {
  if (!user) return 'Guest'
  return user.name || user.email.split('@')[0]
}

export function getUserInitials(user: User | null): string {
  if (!user) return 'G'
  
  if (user.name) {
    const names = user.name.split(' ')
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase()
    }
    return names[0][0].toUpperCase()
  }
  
  return user.email[0].toUpperCase()
}

export function isEmailVerified(user: User | null): boolean {
  return user?.emailVerified ?? false
}
