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
  const tag = `[pipeline:${portfolioId.slice(0, 8)}]`
  let sentTerminal = false

  /**
   * Send a terminal event (generation_complete or generation_error).
   * Guaranteed to fire at most once — duplicates are logged and ignored.
   */
  function sendTerminal(msg: ServerMessage) {
    if (sentTerminal) {
      console.warn(`${tag} Duplicate terminal event suppressed:`, msg.type)
      return
    }
    sentTerminal = true
    console.log(`${tag} terminal -> ${msg.type}`)
    send(msg)
  }

  try {
    // 1. Validate portfolio
    console.log(`${tag} start, user=${userId}`)
    const portfolio = await prisma.portfolio.findFirst({
      where: { id: portfolioId, userId, status: 'GENERATING' },
    })

    if (!portfolio) {
      sendTerminal({
        type: 'generation_error',
        code: 'NOT_FOUND',
        message: 'Portfolio not found or not in GENERATING status',
      })
      return
    }

    const prompt = portfolio.description || portfolio.title
    console.log(`${tag} validated, prompt="${prompt.slice(0, 80)}"`)

    // 2. Create AI service
    const aiService = new AIService(
      {
        openaiApiKey: process.env.OPENAI_API_KEY || '',
        defaultModel: 'gpt-4',
      },
      prisma,
    )

    // 3. Run streaming generation
    console.log(`${tag} openai_stream_start`)
    const generator = aiService.generateFullPortfolio(prompt, userId, { signal })

    for await (const event of generator) {
      if (signal.aborted) break

      switch (event.type) {
        case 'status':
          console.log(`${tag} status: ${event.step} (${event.percent}%)`)
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
          console.log(`${tag} ai_complete, finalizing to DB`)
          try {
            await finalizePortfolio(
              prisma,
              portfolioId,
              userId,
              event.portfolio,
              event.tokensUsed,
              prompt,
            )
            console.log(`${tag} finalize_success`)
            sendTerminal({ type: 'generation_complete', portfolioId })
          } catch (finalizeError: unknown) {
            console.error(`${tag} finalize_failed:`, finalizeError)
            const finalizeMsg = finalizeError instanceof Error ? finalizeError.message : 'Unknown error'
            await failPortfolio(prisma, portfolioId, finalizeMsg)
            sendTerminal({
              type: 'generation_error',
              code: 'INTERNAL_ERROR',
              message: 'Failed to save portfolio data',
            })
          }
          break

        case 'error':
          console.error(`${tag} ai_error: ${event.error}`)
          await failPortfolio(prisma, portfolioId, event.error)
          sendTerminal({
            type: 'generation_error',
            code: 'AI_ERROR',
            message: event.error,
          })
          break
      }
    }

    // Loop exited — handle abort-via-break (no terminal sent yet)
    if (!sentTerminal && signal.aborted) {
      console.log(`${tag} cancelled`)
      await failPortfolio(prisma, portfolioId, 'Cancelled')
      sendTerminal({
        type: 'generation_error',
        code: 'INTERNAL_ERROR',
        message: 'Generation cancelled',
      })
    }
  } catch (err: unknown) {
    console.error(`${tag} unexpected_error:`, err)
    if (!sentTerminal) {
      const errMsg = err instanceof Error ? err.message : 'Unknown error'
      try { await failPortfolio(prisma, portfolioId, errMsg) } catch {}
      sendTerminal({
        type: 'generation_error',
        code: 'INTERNAL_ERROR',
        message: signal.aborted ? 'Generation cancelled' : 'Unexpected error during generation',
      })
    }
  } finally {
    // Safety net — guarantees at least one terminal event
    if (!sentTerminal) {
      console.error(`${tag} SAFETY_NET: no terminal event was sent, forcing cleanup`)
      try { await failPortfolio(prisma, portfolioId, 'No terminal event') } catch {}
      send({
        type: 'generation_error',
        code: 'INTERNAL_ERROR',
        message: 'Generation ended unexpectedly',
      })
    }
    console.log(`${tag} pipeline_finished`)
  }
}
