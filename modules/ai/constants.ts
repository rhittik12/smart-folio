/**
 * AI Constants
 */

export const AI_PROVIDERS = {
  OPENAI: 'openai',
  ANTHROPIC: 'anthropic',
  GOOGLE: 'google',
} as const

export const AI_MODELS = {
  GPT_4: 'gpt-4',
  GPT_4_TURBO: 'gpt-4-turbo-preview',
  GPT_35_TURBO: 'gpt-3.5-turbo',
  CLAUDE_3_OPUS: 'claude-3-opus',
  CLAUDE_3_SONNET: 'claude-3-sonnet',
  GEMINI_PRO: 'gemini-pro',
} as const

export const TOKEN_LIMITS = {
  FREE_TIER: 10000, // 10K tokens per month
  PRO_TIER: 100000, // 100K tokens per month
  ENTERPRISE_TIER: 1000000, // 1M tokens per month
} as const

export const GENERATION_LIMITS = {
  FREE_TIER: 10, // 10 generations per month
  PRO_TIER: 100, // 100 generations per month
  ENTERPRISE_TIER: 1000, // 1000 generations per month
} as const

export const DEFAULT_MAX_TOKENS = 500
export const DEFAULT_TEMPERATURE = 0.7

export const PROMPT_TEMPLATES = {
  PORTFOLIO_INTRO: 'portfolio_intro',
  PROJECT_DESC: 'project_description',
  SKILLS_SUMMARY: 'skills_summary',
  SEO_META: 'seo_metadata',
} as const
