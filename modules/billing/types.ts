/**
 * Billing Types
 */

export enum SubscriptionPlan {
  FREE = 'FREE',
  PRO = 'PRO',
  ENTERPRISE = 'ENTERPRISE',
}

export enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  CANCELED = 'CANCELED',
  PAST_DUE = 'PAST_DUE',
  TRIALING = 'TRIALING',
  INCOMPLETE = 'INCOMPLETE',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  SUCCEEDED = 'SUCCEEDED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export interface Subscription {
  id: string
  userId: string
  plan: SubscriptionPlan
  status: SubscriptionStatus
  stripeCustomerId: string | null
  stripeSubscriptionId: string | null
  stripePriceId: string | null
  currentPeriodStart: Date
  currentPeriodEnd: Date
  cancelAtPeriodEnd: boolean
  trialEnd: Date | null
  createdAt: Date
  updatedAt: Date
}

export interface Payment {
  id: string
  userId: string
  subscriptionId: string | null
  stripePaymentIntentId: string
  amount: number
  currency: string
  status: PaymentStatus
  description: string | null
  createdAt: Date
}

export interface PlanFeatures {
  portfolios: number
  customDomain: boolean
  aiGenerations: number
  aiTokens: number
  analytics: boolean
  customThemes: boolean
  prioritySupport: boolean
  removeWatermark: boolean
}

export interface PlanConfig {
  id: SubscriptionPlan
  name: string
  description: string
  price: number
  interval: 'month' | 'year'
  stripePriceId: string
  features: PlanFeatures
  popular?: boolean
}

export interface BillingPortalSession {
  url: string
}

export interface CheckoutSession {
  sessionId: string
  url: string
}
