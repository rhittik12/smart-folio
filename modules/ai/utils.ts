/**
 * AI Utilities
 */

import type { AIGenerationType } from './types'

export function formatTokenCount(tokens: number): string {
  if (tokens >= 1000000) {
    return `${(tokens / 1000000).toFixed(2)}M`
  }
  if (tokens >= 1000) {
    return `${(tokens / 1000).toFixed(2)}K`
  }
  return tokens.toString()
}

export function estimateTokenCost(tokens: number, provider: string = 'OPENAI'): number {
  // Approximate costs per 1K tokens (USD)
  const costs = {
    OPENAI: 0.002, // GPT-4
    ANTHROPIC: 0.003, // Claude
    GOOGLE: 0.001, // Gemini
  }
  
  return (tokens / 1000) * (costs[provider as keyof typeof costs] || 0.002)
}

export function getGenerationTypeLabel(type: AIGenerationType): string {
  const labels: Record<AIGenerationType, string> = {
    PORTFOLIO_CONTENT: 'Portfolio Content',
    PROJECT_DESCRIPTION: 'Project Description',
    ABOUT_SECTION: 'About Section',
    SKILLS_SUMMARY: 'Skills Summary',
    SEO_META: 'SEO Metadata',
    IMAGE_ALT_TEXT: 'Image Alt Text',
  }
  
  return labels[type] || type
}

export function truncatePrompt(prompt: string, maxLength: number = 100): string {
  if (prompt.length <= maxLength) return prompt
  return `${prompt.slice(0, maxLength)}...`
}

export function buildPortfolioPrompt(input: {
  name: string
  profession: string
  skills: string[]
  experience?: string
  goals?: string
  tone?: string
}): string {
  const { name, profession, skills, experience, goals, tone = 'professional' } = input

  return `Create a compelling portfolio "About" section for ${name}, a ${profession}.

Skills: ${skills.join(', ')}
${experience ? `Experience: ${experience}` : ''}
${goals ? `Career Goals: ${goals}` : ''}

Tone: ${tone}

Generate a 2-3 paragraph introduction that highlights their expertise, passion, and unique value proposition.`
}

export function buildProjectPrompt(input: {
  projectName: string
  technologies: string[]
  features: string[]
  impact?: string
}): string {
  const { projectName, technologies, features, impact } = input

  return `Write a compelling project description for "${projectName}".

Technologies: ${technologies.join(', ')}
Key Features: ${features.join(', ')}
${impact ? `Impact: ${impact}` : ''}

Generate a clear and engaging description (2-3 paragraphs) that explains what the project does, the problem it solves, and its key features.`
}

export function buildSEOPrompt(input: {
  portfolioTitle: string
  profession: string
  specialties: string[]
}): string {
  const { portfolioTitle, profession, specialties } = input

  return `Generate SEO metadata for a portfolio website.

Title: ${portfolioTitle}
Profession: ${profession}
Specialties: ${specialties.join(', ')}

Generate:
1. Meta Title (50-60 characters)
2. Meta Description (150-160 characters)
3. Keywords (comma-separated)

Focus on searchability and compelling language.`
}
