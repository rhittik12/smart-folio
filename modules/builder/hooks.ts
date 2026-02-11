/**
 * Builder React Hooks
 */

'use client'

import { trpc } from '@/lib/trpc-provider'
import { useState, useCallback } from 'react'
import type { Block, BuilderState, BlockType } from './types'

export function useBuilder(portfolioId: string) {
  const [state, setState] = useState<BuilderState>({
    portfolioId,
    blocks: [],
    selectedBlockId: null,
    theme: 'minimal',
    isPreviewMode: false,
    history: [],
    historyIndex: -1,
  })

  const addBlock = useCallback((type: BlockType, index?: number) => {
    const newBlock: Block = {
      id: `block-${Date.now()}`,
      type,
      content: {},
      styles: {},
      order: index ?? state.blocks.length,
      visible: true,
    }

    setState((prev) => ({
      ...prev,
      blocks: [...prev.blocks, newBlock],
    }))
  }, [state.blocks.length])

  const updateBlock = useCallback((blockId: string, updates: Partial<Block>) => {
    setState((prev) => ({
      ...prev,
      blocks: prev.blocks.map((block) =>
        block.id === blockId ? { ...block, ...updates } : block
      ),
    }))
  }, [])

  const deleteBlock = useCallback((blockId: string) => {
    setState((prev) => ({
      ...prev,
      blocks: prev.blocks.filter((block) => block.id !== blockId),
      selectedBlockId: prev.selectedBlockId === blockId ? null : prev.selectedBlockId,
    }))
  }, [])

  const reorderBlocks = useCallback((startIndex: number, endIndex: number) => {
    setState((prev) => {
      const blocks = [...prev.blocks]
      const [removed] = blocks.splice(startIndex, 1)
      blocks.splice(endIndex, 0, removed)
      
      return {
        ...prev,
        blocks: blocks.map((block, index) => ({ ...block, order: index })),
      }
    })
  }, [])

  const selectBlock = useCallback((blockId: string | null) => {
    setState((prev) => ({ ...prev, selectedBlockId: blockId }))
  }, [])

  const togglePreview = useCallback(() => {
    setState((prev) => ({ ...prev, isPreviewMode: !prev.isPreviewMode }))
  }, [])

  return {
    state,
    addBlock,
    updateBlock,
    deleteBlock,
    reorderBlocks,
    selectBlock,
    togglePreview,
  }
}

export function useTemplates() {
  const { data, isLoading } = trpc.builder.getTemplates.useQuery()

  return {
    templates: data ?? [],
    isLoading,
  }
}

export function useApplyTemplate() {
  const mutation = trpc.builder.applyTemplate.useMutation()

  return {
    applyTemplate: mutation.mutate,
    applyTemplateAsync: mutation.mutateAsync,
    isApplying: mutation.isPending,
    error: mutation.error,
  }
}

export function useSaveBlocks() {
  const mutation = trpc.builder.saveBlocks.useMutation()

  return {
    saveBlocks: mutation.mutate,
    saveBlocksAsync: mutation.mutateAsync,
    isSaving: mutation.isPending,
    error: mutation.error,
  }
}
