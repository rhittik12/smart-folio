import type WebSocket from 'ws'

// ============================================
// Client → Server Messages
// ============================================

export interface StartGenerationMessage {
  type: 'start_generation'
  portfolioId: string
  idempotencyKey: string
}

export interface CancelGenerationMessage {
  type: 'cancel_generation'
  portfolioId: string
}

export type ClientMessage = StartGenerationMessage | CancelGenerationMessage

// ============================================
// Server → Client Messages
// ============================================

export interface GenerationStatusMessage {
  type: 'generation_status'
  step: string
  message: string
  percent: number
}

export interface PortfolioChunkMessage {
  type: 'portfolio_chunk'
  partialJson: string
}

export interface PreviewHtmlMessage {
  type: 'preview_html'
  html: string
}

export interface GenerationCompleteMessage {
  type: 'generation_complete'
  portfolioId: string
}

export interface GenerationErrorMessage {
  type: 'generation_error'
  code: 'VALIDATION_ERROR' | 'AI_ERROR' | 'QUOTA_EXCEEDED' | 'RATE_LIMITED' | 'INTERNAL_ERROR' | 'NOT_FOUND' | 'UNAUTHORIZED'
  message: string
}

export interface RateLimitMessage {
  type: 'rate_limit'
  retryAfter: number
  reason: string
}

export type ServerMessage =
  | GenerationStatusMessage
  | PortfolioChunkMessage
  | PreviewHtmlMessage
  | GenerationCompleteMessage
  | GenerationErrorMessage
  | RateLimitMessage

// ============================================
// Portfolio Output Contract
// ============================================

export type ThemeVariant = 'MINIMAL' | 'MODERN' | 'CREATIVE' | 'PROFESSIONAL' | 'DARK'

export interface PortfolioTheme {
  variant: ThemeVariant
}

export interface PortfolioMetadata {
  title: string
  description: string
  author: string
  profession: string
  seoTitle?: string
  seoDescription?: string
  seoKeywords?: string[]
}

export interface HeroSection {
  type: 'HERO'
  headline: string
  subheadline: string
  ctaText?: string
  ctaLink?: string
}

export interface AboutSection {
  type: 'ABOUT'
  bio: string
  highlights?: string[]
}

export interface ProjectItem {
  title: string
  description: string
  technologies: string[]
  link?: string
  image?: string
}

export interface ProjectsSection {
  type: 'PROJECTS'
  items: ProjectItem[]
}

export interface SkillCategory {
  name: string
  skills: string[]
}

export interface SkillsSection {
  type: 'SKILLS'
  categories: SkillCategory[]
}

export interface ContactSection {
  type: 'CONTACT'
  email?: string
  github?: string
  linkedin?: string
  twitter?: string
  website?: string
  message?: string
}

export interface FooterSection {
  type: 'FOOTER'
  text: string
}

export type PortfolioSection =
  | HeroSection
  | AboutSection
  | ProjectsSection
  | SkillsSection
  | ContactSection
  | FooterSection

export interface PortfolioOutput {
  theme: PortfolioTheme
  metadata: PortfolioMetadata
  sections: PortfolioSection[]
}

// ============================================
// AI Generation Events (yielded by async generator)
// ============================================

export interface AIStatusEvent {
  type: 'status'
  step: string
  message: string
  percent: number
}

export interface AIChunkEvent {
  type: 'chunk'
  partialJson: string
}

export interface AICompleteEvent {
  type: 'complete'
  portfolio: PortfolioOutput
  tokensUsed: number
}

export interface AIErrorEvent {
  type: 'error'
  error: string
}

export type AIGenerationEvent = AIStatusEvent | AIChunkEvent | AICompleteEvent | AIErrorEvent

// ============================================
// Authenticated WebSocket
// ============================================

export interface AuthenticatedWs extends WebSocket {
  userId: string
  sessionId: string
}
