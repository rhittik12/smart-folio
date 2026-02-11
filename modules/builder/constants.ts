/**
 * Builder Constants
 */

export const BLOCK_CATEGORIES = {
  HEADER: 'header',
  CONTENT: 'content',
  MEDIA: 'media',
  PORTFOLIO: 'portfolio',
  SOCIAL: 'social',
  LAYOUT: 'layout',
} as const

export const AVAILABLE_BLOCKS = [
  { type: 'HERO', category: 'HEADER', label: 'Hero Section', icon: '🎯' },
  { type: 'TEXT', category: 'CONTENT', label: 'Text Block', icon: '📝' },
  { type: 'IMAGE', category: 'MEDIA', label: 'Image', icon: '🖼️' },
  { type: 'GALLERY', category: 'MEDIA', label: 'Gallery', icon: '🎨' },
  { type: 'VIDEO', category: 'MEDIA', label: 'Video', icon: '🎥' },
  { type: 'SKILLS', category: 'PORTFOLIO', label: 'Skills', icon: '⚡' },
  { type: 'TIMELINE', category: 'PORTFOLIO', label: 'Timeline', icon: '📅' },
  { type: 'PROJECTS', category: 'PORTFOLIO', label: 'Projects', icon: '💼' },
  { type: 'TESTIMONIALS', category: 'SOCIAL', label: 'Testimonials', icon: '💬' },
  { type: 'CONTACT', category: 'SOCIAL', label: 'Contact Form', icon: '📧' },
  { type: 'CTA', category: 'CONTENT', label: 'Call to Action', icon: '🎯' },
  { type: 'SPACER', category: 'LAYOUT', label: 'Spacer', icon: '↕️' },
] as const

export const TEMPLATE_CATEGORIES = [
  'All',
  'Developer',
  'Designer',
  'Writer',
  'Photographer',
  'Business',
] as const

export const MAX_BLOCKS_PER_PORTFOLIO = 50

export const AUTO_SAVE_INTERVAL = 30000 // 30 seconds
