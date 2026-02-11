/**
 * AI Types
 */

export enum AIProvider {
  OPENAI = 'OPENAI',
  ANTHROPIC = 'ANTHROPIC',
  GOOGLE = 'GOOGLE',
}

export enum AIGenerationType {
  PORTFOLIO_CONTENT = 'PORTFOLIO_CONTENT',
  PROJECT_DESCRIPTION = 'PROJECT_DESCRIPTION',
  ABOUT_SECTION = 'ABOUT_SECTION',
  SKILLS_SUMMARY = 'SKILLS_SUMMARY',
  SEO_META = 'SEO_META',
  IMAGE_ALT_TEXT = 'IMAGE_ALT_TEXT',
}

export interface AIGenerationRequest {
  type: AIGenerationType
  prompt: string
  context?: Record<string, any>
  maxTokens?: number
  temperature?: number
}

export interface AIGenerationResponse {
  id: string
  type: AIGenerationType
  content: string
  tokensUsed: number
  provider: AIProvider
  createdAt: Date
}

export interface AIGenerationHistory {
  id: string
  userId: string
  type: AIGenerationType
  prompt: string
  response: string
  tokensUsed: number
  provider: AIProvider
  createdAt: Date
}

export interface PortfolioGenerationInput {
  name: string
  profession: string
  skills: string[]
  experience?: string
  goals?: string
  tone?: 'professional' | 'casual' | 'creative'
}

export interface ProjectDescriptionInput {
  projectName: string
  technologies: string[]
  features: string[]
  impact?: string
}

export interface SEOMetaInput {
  portfolioTitle: string
  profession: string
  specialties: string[]
}
