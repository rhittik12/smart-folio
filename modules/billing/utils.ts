/**
 * Billing Utilities
 */

import type { Subscription, SubscriptionPlan, SubscriptionStatus, PlanFeatures } from './types'
import { PLANS } from './constants'

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount / 100) // Stripe uses cents
}

export function isSubscriptionActive(subscription: Subscription | null): boolean {
  if (!subscription) return false
  return subscription.status === 'ACTIVE' || subscription.status === 'TRIALING'
}

export function isSubscriptionCanceled(subscription: Subscription | null): boolean {
  return subscription?.cancelAtPeriodEnd ?? false
}

export function getPlanFeatures(plan: SubscriptionPlan): PlanFeatures {
  const planConfig = PLANS.find(p => p.id === plan)
  return planConfig?.features ?? PLANS[0].features
}

export function canAccessFeature(
  subscription: Subscription | null,
  feature: keyof PlanFeatures
): boolean {
  const plan = subscription?.plan ?? 'FREE'
  const features = getPlanFeatures(plan as SubscriptionPlan)
  
  const value = features[feature]
  return typeof value === 'boolean' ? value : (value as number) > 0
}

export function getRemainingQuota(
  subscription: Subscription | null,
  feature: keyof PlanFeatures,
  currentUsage: number
): number {
  const plan = subscription?.plan ?? 'FREE'
  const features = getPlanFeatures(plan as SubscriptionPlan)
  const limit = features[feature]
  
  if (typeof limit === 'number') {
    return Math.max(0, limit - currentUsage)
  }
  
  return 0
}

export function getStatusColor(status: SubscriptionStatus): string {
  switch (status) {
    case 'ACTIVE':
      return 'green'
    case 'TRIALING':
      return 'blue'
    case 'CANCELED':
      return 'gray'
    case 'PAST_DUE':
      return 'red'
    case 'INCOMPLETE':
      return 'yellow'
    default:
      return 'gray'
  }
}

export function getStatusLabel(status: SubscriptionStatus): string {
  const labels: Record<SubscriptionStatus, string> = {
    ACTIVE: 'Active',
    CANCELED: 'Canceled',
    PAST_DUE: 'Past Due',
    TRIALING: 'Trial',
    INCOMPLETE: 'Incomplete',
  }
  
  return labels[status] || status
}

export function getDaysUntilRenewal(subscription: Subscription | null): number {
  if (!subscription) return 0
  
  const now = new Date()
  const end = new Date(subscription.currentPeriodEnd)
  const diffTime = end.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  return Math.max(0, diffDays)
}

export function isTrialActive(subscription: Subscription | null): boolean {
  if (!subscription || subscription.status !== 'TRIALING') return false
  if (!subscription.trialEnd) return false
  
  return new Date(subscription.trialEnd) > new Date()
}
