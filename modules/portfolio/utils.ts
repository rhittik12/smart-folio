/**
 * Portfolio Utilities
 */

import type { Portfolio, PortfolioStatus } from './types'

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function getPortfolioUrl(portfolio: Portfolio): string {
  if (portfolio.customDomain) {
    return `https://${portfolio.customDomain}`
  }
  return `${process.env.NEXT_PUBLIC_APP_URL}/p/${portfolio.slug}`
}

export function isPublished(portfolio: Portfolio): boolean {
  return portfolio.status === 'PUBLISHED' && portfolio.published
}

export function canPublish(portfolio: Portfolio): boolean {
  return portfolio.status === 'DRAFT' && portfolio.title.length > 0
}

export function getStatusColor(status: PortfolioStatus): string {
  switch (status) {
    case 'PUBLISHED':
      return 'green'
    case 'DRAFT':
      return 'yellow'
    case 'ARCHIVED':
      return 'gray'
    default:
      return 'gray'
  }
}

export function validateSlug(slug: string): boolean {
  return /^[a-z0-9-]+$/.test(slug) && slug.length >= 3 && slug.length <= 100
}

export function formatViewCount(views: number): string {
  if (views >= 1000000) {
    return `${(views / 1000000).toFixed(1)}M`
  }
  if (views >= 1000) {
    return `${(views / 1000).toFixed(1)}K`
  }
  return views.toString()
}
