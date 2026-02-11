/**
 * Billing Constants
 */

import type { PlanConfig, SubscriptionPlan } from './types'

export const PLANS: PlanConfig[] = [
  {
    id: 'FREE' as SubscriptionPlan,
    name: 'Free',
    description: 'Perfect for getting started',
    price: 0,
    interval: 'month',
    stripePriceId: '',
    features: {
      portfolios: 1,
      customDomain: false,
      aiGenerations: 10,
      aiTokens: 10000,
      analytics: false,
      customThemes: false,
      prioritySupport: false,
      removeWatermark: false,
    },
  },
  {
    id: 'PRO' as SubscriptionPlan,
    name: 'Pro',
    description: 'For professionals who need more',
    price: 1900, // $19.00
    interval: 'month',
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID || '',
    popular: true,
    features: {
      portfolios: 10,
      customDomain: true,
      aiGenerations: 100,
      aiTokens: 100000,
      analytics: true,
      customThemes: true,
      prioritySupport: true,
      removeWatermark: true,
    },
  },
  {
    id: 'ENTERPRISE' as SubscriptionPlan,
    name: 'Enterprise',
    description: 'For teams and agencies',
    price: 9900, // $99.00
    interval: 'month',
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID || '',
    features: {
      portfolios: 100,
      customDomain: true,
      aiGenerations: 1000,
      aiTokens: 1000000,
      analytics: true,
      customThemes: true,
      prioritySupport: true,
      removeWatermark: true,
    },
  },
] as const

export const STRIPE_CONFIG = {
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
  successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/billing?session_id={CHECKOUT_SESSION_ID}`,
  cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
} as const

export const TRIAL_PERIOD_DAYS = 14

export const WEBHOOK_EVENTS = {
  CHECKOUT_COMPLETED: 'checkout.session.completed',
  SUBSCRIPTION_CREATED: 'customer.subscription.created',
  SUBSCRIPTION_UPDATED: 'customer.subscription.updated',
  SUBSCRIPTION_DELETED: 'customer.subscription.deleted',
  PAYMENT_SUCCEEDED: 'invoice.payment_succeeded',
  PAYMENT_FAILED: 'invoice.payment_failed',
} as const
