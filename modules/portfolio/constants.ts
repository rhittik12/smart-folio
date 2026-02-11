/**
 * Portfolio Constants
 */

export const PORTFOLIO_LIMITS = {
  FREE_TIER: 1,
  PRO_TIER: 10,
  ENTERPRISE_TIER: 100,
} as const

export const PORTFOLIO_THEMES = {
  MINIMAL: 'minimal',
  MODERN: 'modern',
  CREATIVE: 'creative',
  PROFESSIONAL: 'professional',
  DARK: 'dark',
} as const

export const SECTION_TYPES = {
  HERO: 'hero',
  ABOUT: 'about',
  PROJECTS: 'projects',
  SKILLS: 'skills',
  EXPERIENCE: 'experience',
  EDUCATION: 'education',
  TESTIMONIALS: 'testimonials',
  CONTACT: 'contact',
  BLOG: 'blog',
  GALLERY: 'gallery',
} as const

export const MAX_SLUG_LENGTH = 100
export const MIN_SLUG_LENGTH = 3
export const MAX_TITLE_LENGTH = 100
export const MAX_DESCRIPTION_LENGTH = 500
