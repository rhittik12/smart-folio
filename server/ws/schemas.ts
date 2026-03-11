import { z } from 'zod'

// ============================================
// Portfolio Section Schemas
// ============================================

export const heroSectionSchema = z.object({
  type: z.literal('HERO'),
  headline: z.string().min(1).max(200),
  subheadline: z.string().min(1).max(500),
  ctaText: z.string().max(50).optional(),
  ctaLink: z.string().max(500).optional(),
})

export const aboutSectionSchema = z.object({
  type: z.literal('ABOUT'),
  bio: z.string().min(1).max(2000),
  highlights: z.array(z.string().max(200)).max(10).optional(),
})

export const projectItemSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
  technologies: z.array(z.string().max(50)).max(20),
  link: z.string().max(500).optional(),
  image: z.string().max(500).optional(),
})

export const projectsSectionSchema = z.object({
  type: z.literal('PROJECTS'),
  items: z.array(projectItemSchema).min(1).max(10),
})

export const skillCategorySchema = z.object({
  name: z.string().min(1).max(100),
  skills: z.array(z.string().max(50)).min(1).max(20),
})

export const skillsSectionSchema = z.object({
  type: z.literal('SKILLS'),
  categories: z.array(skillCategorySchema).min(1).max(10),
})

export const contactSectionSchema = z.object({
  type: z.literal('CONTACT'),
  email: z.string().email().optional(),
  github: z.string().max(500).optional(),
  linkedin: z.string().max(500).optional(),
  twitter: z.string().max(500).optional(),
  website: z.string().max(500).optional(),
  message: z.string().max(500).optional(),
})

export const footerSectionSchema = z.object({
  type: z.literal('FOOTER'),
  text: z.string().min(1).max(500),
})

export const portfolioSectionSchema = z.discriminatedUnion('type', [
  heroSectionSchema,
  aboutSectionSchema,
  projectsSectionSchema,
  skillsSectionSchema,
  contactSectionSchema,
  footerSectionSchema,
])

// ============================================
// Portfolio Output Schema
// ============================================

export const portfolioThemeSchema = z.object({
  variant: z.enum(['MINIMAL', 'MODERN', 'CREATIVE', 'PROFESSIONAL', 'DARK']),
})

export const portfolioMetadataSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(1000),
  author: z.string().min(1).max(100),
  profession: z.string().min(1).max(100),
  seoTitle: z.string().max(70).optional(),
  seoDescription: z.string().max(160).optional(),
  seoKeywords: z.array(z.string().max(50)).max(10).optional(),
})

export const portfolioOutputSchema = z.object({
  theme: portfolioThemeSchema,
  metadata: portfolioMetadataSchema,
  sections: z.array(portfolioSectionSchema).min(1).max(10),
})

// ============================================
// Client Message Schemas
// ============================================

export const startGenerationSchema = z.object({
  type: z.literal('start_generation'),
  portfolioId: z.string().min(1),
  idempotencyKey: z.string().min(1),
})

export const cancelGenerationSchema = z.object({
  type: z.literal('cancel_generation'),
  portfolioId: z.string().min(1),
})

export const clientMessageSchema = z.discriminatedUnion('type', [
  startGenerationSchema,
  cancelGenerationSchema,
])

// ============================================
// OpenAI Function Tool Schema (for function calling)
// ============================================

export const SAVE_PORTFOLIO_TOOL = {
  type: 'function' as const,
  function: {
    name: 'save_portfolio',
    description: 'Save the generated portfolio with structured sections',
    parameters: {
      type: 'object',
      properties: {
        theme: {
          type: 'object',
          description: 'Visual theme for the portfolio',
          properties: {
            variant: {
              type: 'string',
              enum: ['MINIMAL', 'MODERN', 'CREATIVE', 'PROFESSIONAL', 'DARK'],
              description: 'Theme variant name',
            },
          },
          required: ['variant'],
        },
        metadata: {
          type: 'object',
          properties: {
            title: { type: 'string', description: 'Portfolio title' },
            description: { type: 'string', description: 'Brief portfolio description' },
            author: { type: 'string', description: 'Author name' },
            profession: { type: 'string', description: 'Professional title or role' },
            seoTitle: { type: 'string', description: 'SEO-optimized page title (50-70 chars)' },
            seoDescription: { type: 'string', description: 'SEO meta description (120-160 chars)' },
            seoKeywords: { type: 'array', items: { type: 'string' }, description: '5-8 SEO keywords' },
          },
          required: ['title', 'description', 'author', 'profession'],
        },
        sections: {
          type: 'array',
          description: 'Portfolio sections in order',
          items: {
            type: 'object',
            properties: {
              type: {
                type: 'string',
                enum: ['HERO', 'ABOUT', 'PROJECTS', 'SKILLS', 'CONTACT', 'FOOTER'],
              },
              headline: { type: 'string' },
              subheadline: { type: 'string' },
              ctaText: { type: 'string' },
              ctaLink: { type: 'string' },
              bio: { type: 'string' },
              highlights: { type: 'array', items: { type: 'string' } },
              items: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    title: { type: 'string' },
                    description: { type: 'string' },
                    technologies: { type: 'array', items: { type: 'string' } },
                    link: { type: 'string' },
                    image: { type: 'string' },
                  },
                  required: ['title', 'description', 'technologies'],
                },
              },
              categories: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    skills: { type: 'array', items: { type: 'string' } },
                  },
                  required: ['name', 'skills'],
                },
              },
              email: { type: 'string' },
              github: { type: 'string' },
              linkedin: { type: 'string' },
              twitter: { type: 'string' },
              website: { type: 'string' },
              message: { type: 'string' },
              text: { type: 'string' },
            },
            required: ['type'],
          },
        },
      },
      required: ['theme', 'metadata', 'sections'],
    },
  },
} as const
