/**
 * Authentication Types
 */

export interface User {
  id: string
  email: string
  name: string | null
  image: string | null
  emailVerified: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Session {
  user: User
  expires: Date
}

export interface SignInCredentials {
  email: string
  password: string
}

export interface SignUpCredentials {
  email: string
  password: string
  name?: string
}

export interface AuthResponse {
  success: boolean
  message?: string
  user?: User
}
