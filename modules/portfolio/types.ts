/**
 * Portfolio Types
 */

export enum PortfolioStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

export enum PortfolioTheme {
  MINIMAL = 'MINIMAL',
  MODERN = 'MODERN',
  CREATIVE = 'CREATIVE',
  PROFESSIONAL = 'PROFESSIONAL',
  DARK = 'DARK',
}

export interface Portfolio {
  id: string
  userId: string
  title: string
  slug: string
  description: string | null
  theme: PortfolioTheme
  status: PortfolioStatus
  customDomain: string | null
  seoTitle: string | null
  seoDescription: string | null
  favicon: string | null
  published: boolean
  publishedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

export interface PortfolioSection {
  id: string
  portfolioId: string
  type: string
  title: string
  content: Record<string, any>
  order: number
  visible: boolean
}

export interface CreatePortfolioInput {
  title: string
  slug?: string
  description?: string
  theme?: PortfolioTheme
}

export interface UpdatePortfolioInput {
  title?: string
  slug?: string
  description?: string
  theme?: PortfolioTheme
  status?: PortfolioStatus
  customDomain?: string
  seoTitle?: string
  seoDescription?: string
}

export interface PortfolioAnalytics {
  portfolioId: string
  views: number
  uniqueVisitors: number
  avgTimeOnSite: number
  topPages: { path: string; views: number }[]
  referrers: { source: string; count: number }[]
}
