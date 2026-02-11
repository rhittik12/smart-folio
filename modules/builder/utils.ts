/**
 * Builder Utilities
 */

import type { Block, BlockType } from './types'

export function getBlockIcon(type: BlockType): string {
  const icons: Record<BlockType, string> = {
    HERO: '🎯',
    TEXT: '📝',
    IMAGE: '🖼️',
    GALLERY: '🎨',
    VIDEO: '🎥',
    SKILLS: '⚡',
    TIMELINE: '📅',
    PROJECTS: '💼',
    TESTIMONIALS: '💬',
    CONTACT: '📧',
    CTA: '🎯',
    SPACER: '↕️',
  }
  
  return icons[type] || '📦'
}

export function getBlockLabel(type: BlockType): string {
  const labels: Record<BlockType, string> = {
    HERO: 'Hero Section',
    TEXT: 'Text Block',
    IMAGE: 'Image',
    GALLERY: 'Image Gallery',
    VIDEO: 'Video',
    SKILLS: 'Skills',
    TIMELINE: 'Timeline',
    PROJECTS: 'Projects Grid',
    TESTIMONIALS: 'Testimonials',
    CONTACT: 'Contact Form',
    CTA: 'Call to Action',
    SPACER: 'Spacer',
  }
  
  return labels[type] || type
}

export function getDefaultBlockContent(type: BlockType): Record<string, any> {
  const defaults: Record<BlockType, Record<string, any>> = {
    HERO: {
      title: 'Your Name',
      subtitle: 'Your Profession',
      description: 'A brief introduction about yourself',
    },
    TEXT: {
      content: 'Enter your text here...',
    },
    IMAGE: {
      url: '',
      alt: 'Image description',
      caption: '',
    },
    GALLERY: {
      images: [],
      columns: 3,
    },
    VIDEO: {
      url: '',
      platform: 'youtube',
    },
    SKILLS: {
      skills: [],
      layout: 'grid',
    },
    TIMELINE: {
      items: [],
    },
    PROJECTS: {
      projects: [],
      columns: 2,
    },
    TESTIMONIALS: {
      testimonials: [],
    },
    CONTACT: {
      fields: ['name', 'email', 'message'],
      submitText: 'Send Message',
    },
    CTA: {
      title: 'Ready to work together?',
      description: 'Let\'s create something amazing',
      buttonText: 'Get in Touch',
      buttonLink: '#contact',
    },
    SPACER: {
      height: '40px',
    },
  }
  
  return defaults[type] || {}
}

export function duplicateBlock(block: Block): Block {
  return {
    ...block,
    id: `block-${Date.now()}`,
    order: block.order + 1,
  }
}

export function exportBlocks(blocks: Block[]): string {
  return JSON.stringify(blocks, null, 2)
}

export function importBlocks(json: string): Block[] {
  try {
    return JSON.parse(json)
  } catch {
    return []
  }
}
