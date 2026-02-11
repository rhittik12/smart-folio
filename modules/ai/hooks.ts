/**
 * AI React Hooks
 */

'use client'

import { trpc } from '@/lib/trpc-provider'
import type { AIGenerationRequest, PortfolioGenerationInput, ProjectDescriptionInput, SEOMetaInput } from './types'

export function useAIGeneration() {
  const mutation = trpc.ai.generate.useMutation()

  return {
    generate: mutation.mutate,
    generateAsync: mutation.mutateAsync,
    isGenerating: mutation.isPending,
    error: mutation.error,
    data: mutation.data,
  }
}

export function useGeneratePortfolioContent() {
  const mutation = trpc.ai.generatePortfolio.useMutation()

  return {
    generatePortfolio: mutation.mutate,
    generatePortfolioAsync: mutation.mutateAsync,
    isGenerating: mutation.isPending,
    error: mutation.error,
    data: mutation.data,
  }
}

export function useGenerateProjectDescription() {
  const mutation = trpc.ai.generateProjectDescription.useMutation()

  return {
    generateDescription: mutation.mutate,
    generateDescriptionAsync: mutation.mutateAsync,
    isGenerating: mutation.isPending,
    error: mutation.error,
    data: mutation.data,
  }
}

export function useGenerateSEO() {
  const mutation = trpc.ai.generateSEO.useMutation()

  return {
    generateSEO: mutation.mutate,
    generateSEOAsync: mutation.mutateAsync,
    isGenerating: mutation.isPending,
    error: mutation.error,
    data: mutation.data,
  }
}

export function useAIHistory() {
  const { data, isLoading, error } = trpc.ai.getHistory.useQuery()

  return {
    history: data ?? [],
    isLoading,
    error,
  }
}

export function useAIUsageStats() {
  const { data, isLoading } = trpc.ai.getUsageStats.useQuery()

  return {
    stats: data,
    isLoading,
  }
}
