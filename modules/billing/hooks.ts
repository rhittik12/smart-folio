/**
 * Billing React Hooks
 */

'use client'

import { trpc } from '@/lib/trpc-provider'
import type { SubscriptionPlan } from './types'

export function useSubscription() {
  const { data, isLoading, error } = trpc.billing.getSubscription.useQuery()

  return {
    subscription: data ?? null,
    isLoading,
    error,
  }
}

export function useCreateCheckoutSession() {
  const mutation = trpc.billing.createCheckoutSession.useMutation()

  return {
    createSession: mutation.mutate,
    createSessionAsync: mutation.mutateAsync,
    isCreating: mutation.isPending,
    error: mutation.error,
  }
}

export function useCreateBillingPortalSession() {
  const mutation = trpc.billing.createPortalSession.useMutation()

  return {
    createPortalSession: mutation.mutate,
    createPortalSessionAsync: mutation.mutateAsync,
    isCreating: mutation.isPending,
    error: mutation.error,
  }
}

export function useCancelSubscription() {
  const utils = trpc.useUtils()
  
  const mutation = trpc.billing.cancelSubscription.useMutation({
    onSuccess: () => {
      utils.billing.getSubscription.invalidate()
    },
  })

  return {
    cancelSubscription: mutation.mutate,
    isCanceling: mutation.isPending,
    error: mutation.error,
  }
}

export function useResumeSubscription() {
  const utils = trpc.useUtils()
  
  const mutation = trpc.billing.resumeSubscription.useMutation({
    onSuccess: () => {
      utils.billing.getSubscription.invalidate()
    },
  })

  return {
    resumeSubscription: mutation.mutate,
    isResuming: mutation.isPending,
    error: mutation.error,
  }
}

export function usePaymentHistory() {
  const { data, isLoading } = trpc.billing.getPaymentHistory.useQuery()

  return {
    payments: data ?? [],
    isLoading,
  }
}

export function useUsageStats() {
  const { data, isLoading } = trpc.billing.getUsageStats.useQuery()

  return {
    usage: data,
    isLoading,
  }
}
