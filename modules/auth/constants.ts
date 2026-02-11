/**
 * Authentication Constants
 */

export const AUTH_ROUTES = {
  SIGN_IN: '/sign-in',
  SIGN_UP: '/sign-up',
  SIGN_OUT: '/sign-out',
  VERIFY_EMAIL: '/verify-email',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
} as const

export const PROTECTED_ROUTES = {
  DASHBOARD: '/dashboard',
  PORTFOLIOS: '/portfolios',
  BUILDER: '/builder',
  SETTINGS: '/settings',
  BILLING: '/billing',
} as const

export const PUBLIC_ROUTES = {
  HOME: '/',
  PRICING: '/pricing',
  ABOUT: '/about',
  CONTACT: '/contact',
} as const
