import type { PrismaClient } from '@prisma/client'
import { AIService } from '../services/ai'
import { finalizePortfolio, failPortfolio } from './finalize'
import { buildPreviewHtml } from './preview-builder'
import type { ServerMessage, PortfolioOutput } from './types'

export async function runGeneration(
  ws: { userId: string },
  portfolioId: string,
  userId: string,
  signal: AbortSignal,
  prisma: PrismaClient,
  send: (msg: ServerMessage) => void,
): Promise<void> {
  // 1. Validate portfolio
  const portfolio = await prisma.portfolio.findFirst({
    where: { id: portfolioId, userId, status: 'GENERATING' },
  })

  if (!portfolio) {
    send({
      type: 'generation_error',
      code: 'NOT_FOUND',
      message: 'Portfolio not found or not in GENERATING status',
    })
    return
  }

  const prompt = portfolio.description || portfolio.title

  // 2. Create AI service
  const aiService = new AIService(
    {
      openaiApiKey: process.env.OPENAI_API_KEY || '',
      defaultModel: 'gpt-4',
    },
    prisma,
  )

  // 3. Run streaming generation
  try {
    const generator = aiService.generateFullPortfolio(prompt, userId, { signal })

    for await (const event of generator) {
      if (signal.aborted) break

      switch (event.type) {
        case 'status':
          send({
            type: 'generation_status',
            step: event.step,
            message: event.message,
            percent: event.percent,
          })
          break

        case 'chunk':
          send({ type: 'portfolio_chunk', partialJson: event.partialJson })

          // Build preview HTML from partial data
          try {
            const partial = JSON.parse(event.partialJson) as Partial<PortfolioOutput>
            const html = buildPreviewHtml(partial)
            send({ type: 'preview_html', html })
          } catch {
            // Partial data may not be renderable yet
          }
          break

        case 'complete':
          // Finalize to database
          try {
            await finalizePortfolio(
              prisma,
              portfolioId,
              userId,
              event.portfolio,
              event.tokensUsed,
              prompt,
            )
            send({ type: 'generation_complete', portfolioId })
          } catch (finalizeError: any) {
            console.error('[pipeline] Finalization failed:', finalizeError)
            await failPortfolio(prisma, portfolioId, finalizeError.message)
            send({
              type: 'generation_error',
              code: 'INTERNAL_ERROR',
              message: 'Failed to save portfolio data',
            })
          }
          break

        case 'error':
          await failPortfolio(prisma, portfolioId, event.error)
          send({
            type: 'generation_error',
            code: 'AI_ERROR',
            message: event.error,
          })
          break
      }
    }
  } catch (err: any) {
    if (signal.aborted) {
      await failPortfolio(prisma, portfolioId, 'Cancelled')
      return
    }
    console.error('[pipeline] Unexpected error:', err)
    await failPortfolio(prisma, portfolioId, err.message)
    send({
      type: 'generation_error',
      code: 'INTERNAL_ERROR',
      message: 'Unexpected error during generation',
    })
  }
}
