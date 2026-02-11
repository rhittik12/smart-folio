/**
 * Portfolio React Hooks
 */

'use client'

import { trpc } from '@/lib/trpc-provider'
import type { Portfolio, CreatePortfolioInput, UpdatePortfolioInput } from './types'

export function usePortfolios() {
  const { data, isLoading, error } = trpc.portfolio.list.useQuery()

  return {
    portfolios: data?.portfolios ?? [],
    isLoading,
    error,
  }
}

export function usePortfolio(portfolioId: string) {
  const { data, isLoading, error } = trpc.portfolio.getById.useQuery(
    { id: portfolioId },
    { enabled: !!portfolioId }
  )

  return {
    portfolio: data ?? null,
    isLoading,
    error,
  }
}

export function useCreatePortfolio() {
  const utils = trpc.useUtils()
  
  const mutation = trpc.portfolio.create.useMutation({
    onSuccess: () => {
      utils.portfolio.list.invalidate()
    },
  })

  return {
    createPortfolio: mutation.mutate,
    createPortfolioAsync: mutation.mutateAsync,
    isCreating: mutation.isPending,
    error: mutation.error,
  }
}

export function useUpdatePortfolio() {
  const utils = trpc.useUtils()
  
const mutation = trpc.portfolio.update.useMutation({
    onSuccess: () => {
      utils.portfolio.list.invalidate()
    },
  })

  return {
    updatePortfolio: mutation.mutate,
    updatePortfolioAsync: mutation.mutateAsync,
    isUpdating: mutation.isPending,
    error: mutation.error,
  }
}

export function useDeletePortfolio() {
  const utils = trpc.useUtils()
  
  const mutation = trpc.portfolio.delete.useMutation({
    onSuccess: () => {
      utils.portfolio.list.invalidate()
    },
  })

  return {
    deletePortfolio: mutation.mutate,
    deletePortfolioAsync: mutation.mutateAsync,
    isDeleting: mutation.isPending,
    error: mutation.error,
  }
}

export function usePublishPortfolio() {
  const utils = trpc.useUtils()
  
const mutation = trpc.portfolio.publish.useMutation({
    onSuccess: () => {
      utils.portfolio.list.invalidate()
    },
  })

  return {
    publishPortfolio: mutation.mutate,
    isPublishing: mutation.isPending,
    error: mutation.error,
  }
}
