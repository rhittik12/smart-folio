import OpenAI from 'openai'
import { PrismaClient } from '@prisma/client'
import { parse as parsePartialJson } from 'partial-json'
import { SAVE_PORTFOLIO_TOOL, portfolioOutputSchema } from '../ws/schemas'
import type { AIGenerationEvent, PortfolioOutput } from '../ws/types'

export interface AIServiceConfig {
  openaiApiKey: string
  anthropicApiKey?: string
  defaultModel?: 'gpt-4' | 'gpt-3.5-turbo' | 'claude-3'
}

export interface GenerationRequest {
  type: string
  prompt: string
  maxTokens?: number
  temperature?: number
  userId: string
}

export interface GenerationResponse {
  id: string
  type: string
  content: string
  tokensUsed: number
  provider: string
  model: string
  createdAt: Date
}

export class AIService {
  private openai: OpenAI
  private prisma: PrismaClient
  private config: AIServiceConfig

  constructor(config: AIServiceConfig, prisma: PrismaClient) {
    this.config = config
    this.prisma = prisma
    this.openai = new OpenAI({
      apiKey: config.openaiApiKey,
    })
  }

  async generate(request: GenerationRequest): Promise<GenerationResponse> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: this.config.defaultModel || 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: this.getSystemPrompt(request.type),
          },
          {
            role: 'user',
            content: request.prompt,
          },
        ],
        max_tokens: request.maxTokens || 1000,
        temperature: request.temperature || 0.7,
      })

      const content = completion.choices[0]?.message?.content || ''
      const tokensUsed = completion.usage?.total_tokens || 0

      // Save to database
      const generation = await this.prisma.aIGeneration.create({
        data: {
          userId: request.userId,
          type: request.type,
          prompt: request.prompt,
          response: content,
          tokensUsed,
          provider: 'OPENAI',
        },
      })

      return {
        id: generation.id,
        type: request.type,
        content,
        tokensUsed,
        provider: 'OPENAI',
        model: completion.model,
        createdAt: generation.createdAt,
      }
    } catch (error) {
      console.error('AI generation error:', error)
      throw new Error('Failed to generate AI content')
    }
  }

  async generatePortfolio(input: {
    name: string
    profession: string
    skills: string[]
    experience?: string
    goals?: string
    tone?: 'professional' | 'casual' | 'creative'
    userId: string
  }): Promise<{ about: string; headline: string }> {
    const prompt = `Create a portfolio for:
Name: ${input.name}
Profession: ${input.profession}
Skills: ${input.skills.join(', ')}
${input.experience ? `Experience: ${input.experience}` : ''}
${input.goals ? `Goals: ${input.goals}` : ''}
Tone: ${input.tone || 'professional'}

Please generate:
1. A compelling headline (max 60 characters)
2. An about section (150-200 words)`

    const response = await this.generate({
      type: 'PORTFOLIO_CONTENT',
      prompt,
      userId: input.userId,
      maxTokens: 500,
    })

    // Parse the response
    const lines = response.content.split('\n').filter(line => line.trim())
    const headline = lines[0]?.replace(/^(Headline|1)\s*[:.-]?\s*/i, '').trim() || ''
    const about = lines.slice(1).join('\n').replace(/^(About|2)\s*[:.-]?\s*/i, '').trim()

    return { about, headline }
  }

  async generateProjectDescription(input: {
    projectName: string
    technologies: string[]
    features: string[]
    impact?: string
    userId: string
  }): Promise<{ description: string }> {
    const prompt = `Create a compelling project description for:
Project Name: ${input.projectName}
Technologies: ${input.technologies.join(', ')}
Key Features: ${input.features.join(', ')}
${input.impact ? `Impact: ${input.impact}` : ''}

Generate a professional description (100-150 words) that highlights the technical achievements and business value.`

    const response = await this.generate({
      type: 'PROJECT_DESCRIPTION',
      prompt,
      userId: input.userId,
      maxTokens: 300,
    })

    return { description: response.content }
  }

  async generateSEO(input: {
    portfolioTitle: string
    profession: string
    specialties: string[]
    userId: string
  }): Promise<{ title: string; description: string; keywords: string }> {
    const prompt = `Generate SEO metadata for:
Portfolio Title: ${input.portfolioTitle}
Profession: ${input.profession}
Specialties: ${input.specialties.join(', ')}

Please generate:
1. SEO Title (50-60 characters)
2. Meta Description (150-160 characters)
3. Keywords (5-8 relevant keywords, comma-separated)`

    const response = await this.generate({
      type: 'SEO_META',
      prompt,
      userId: input.userId,
      maxTokens: 200,
    })

    // Parse the response
    const lines = response.content.split('\n').filter(line => line.trim())
    const title = lines[0]?.replace(/^(Title|1)\s*[:.-]?\s*/i, '').trim() || ''
    const description = lines[1]?.replace(/^(Description|2)\s*[:.-]?\s*/i, '').trim() || ''
    const keywords = lines[2]?.replace(/^(Keywords|3)\s*[:.-]?\s*/i, '').trim() || ''

    return { title, description, keywords }
  }

  async getHistory(userId: string): Promise<any[]> {
    return await this.prisma.aIGeneration.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })
  }

  async getUsageStats(userId: string): Promise<{
    tokensUsed: number
    generationsCount: number
    tokensLimit: number
    generationsLimit: number
  }> {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const stats = await this.prisma.aIGeneration.aggregate({
      where: {
        userId,
        createdAt: { gte: startOfMonth },
      },
      _sum: { tokensUsed: true },
      _count: true,
    })

    // Get user's subscription plan
    const subscription = await this.prisma.subscription.findUnique({
      where: { userId },
    })

    const plan = subscription?.plan || 'FREE'
    const limits = {
      FREE: { tokens: 10000, generations: 10 },
      PRO: { tokens: 50000, generations: 100 },
      ENTERPRISE: { tokens: 200000, generations: 1000 },
    }

    const planLimits = limits[plan as keyof typeof limits] || limits.FREE

    return {
      tokensUsed: stats._sum.tokensUsed || 0,
      generationsCount: stats._count,
      tokensLimit: planLimits.tokens,
      generationsLimit: planLimits.generations,
    }
  }

  async *generateFullPortfolio(
    prompt: string,
    userId: string,
    options?: { model?: string; signal?: AbortSignal },
  ): AsyncGenerator<AIGenerationEvent> {
    const model = options?.model || process.env.OPENAI_MODEL || 'gpt-4'
    const STREAM_TIMEOUT_MS = 120_000 // 2 minutes

    const systemPrompt = `You are Smartfolio, an expert portfolio generator. The user will describe themselves and their work. You MUST call the save_portfolio function with a complete, structured portfolio.

The theme must be an object with a "variant" field (one of: MINIMAL, MODERN, CREATIVE, PROFESSIONAL, DARK).
The metadata must include title, description, author, profession, and SEO fields: seoTitle (50-70 chars), seoDescription (120-160 chars), seoKeywords (5-8 keywords).

Generate a professional portfolio with these sections (in order):
1. HERO - A compelling headline and subheadline
2. ABOUT - A professional bio with highlights
3. PROJECTS - 2-4 portfolio projects with technologies
4. SKILLS - Technical skill categories
5. CONTACT - Contact information placeholders
6. FOOTER - Brief footer text

Choose a theme variant that best fits the user's profession. Make the content authentic and compelling.`

    yield { type: 'status', step: 'analyzing', message: 'Analyzing your requirements...', percent: 5 }

    // Combined abort: caller's signal + stream timeout
    const timeoutController = new AbortController()
    const timeoutId = setTimeout(() => timeoutController.abort(), STREAM_TIMEOUT_MS)

    if (options?.signal) {
      if (options.signal.aborted) {
        clearTimeout(timeoutId)
        yield { type: 'error', error: 'Generation cancelled' }
        return
      }
      options.signal.addEventListener('abort', () => timeoutController.abort(), { once: true })
    }

    try {
      console.log('[ai] openai_stream_start')
      const stream = await this.openai.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        tools: [SAVE_PORTFOLIO_TOOL],
        tool_choice: { type: 'function', function: { name: 'save_portfolio' } },
        stream: true,
        stream_options: { include_usage: true },
        max_tokens: 4000,
        temperature: 0.7,
      }, { signal: timeoutController.signal })

      console.log('[ai] openai_stream_connected, consuming chunks')
      yield { type: 'status', step: 'generating', message: 'Generating portfolio structure...', percent: 15 }

      let functionArgs = ''
      let totalTokens = 0
      let lastChunkPercent = 15

      for await (const chunk of stream) {
        if (options?.signal?.aborted) {
          yield { type: 'error', error: 'Generation cancelled' }
          return
        }

        const delta = chunk.choices[0]?.delta

        // Accumulate function call arguments
        if (delta?.tool_calls?.[0]?.function?.arguments) {
          functionArgs += delta.tool_calls[0].function.arguments

          // Progressive percent (15% to 85% during streaming)
          const estimatedProgress = Math.min(85, lastChunkPercent + 0.5)
          lastChunkPercent = estimatedProgress

          // Attempt partial parse for progressive preview
          try {
            const partial = parsePartialJson(functionArgs)
            if (partial && typeof partial === 'object') {
              yield { type: 'chunk', partialJson: JSON.stringify(partial) }

              // Update status based on what sections we can see
              const sectionCount = (partial as any)?.sections?.length ?? 0
              if (sectionCount > 0) {
                const sectionMessages: Record<number, string> = {
                  1: 'Generating hero section...',
                  2: 'Writing about section...',
                  3: 'Creating project showcases...',
                  4: 'Organizing skills...',
                  5: 'Adding contact details...',
                  6: 'Finalizing portfolio...',
                }
                const msg = sectionMessages[sectionCount] ?? `Processing section ${sectionCount}...`
                yield { type: 'status', step: `section-${sectionCount}`, message: msg, percent: Math.round(estimatedProgress) }
              }
            }
          } catch {
            // Partial JSON not yet parseable, skip
          }
        }

        // Track token usage from stream
        if (chunk.usage) {
          totalTokens = chunk.usage.total_tokens ?? 0
        }
      }

      console.log(`[ai] openai_stream_done, functionArgs length=${functionArgs.length}, tokens=${totalTokens}`)
      yield { type: 'status', step: 'validating', message: 'Validating generated content...', percent: 90 }

      // Parse and validate final output
      let portfolioData: PortfolioOutput
      try {
        const parsed = JSON.parse(functionArgs)
        const validated = portfolioOutputSchema.safeParse(parsed)
        if (!validated.success) {
          yield { type: 'error', error: `Validation failed: ${validated.error.message}` }
          return
        }
        portfolioData = validated.data as PortfolioOutput
      } catch (parseError) {
        yield { type: 'error', error: 'Failed to parse AI response as valid JSON' }
        return
      }

      console.log('[ai] validation_passed')
      yield { type: 'status', step: 'complete', message: 'Portfolio generated successfully!', percent: 100 }
      yield { type: 'complete', portfolio: portfolioData, tokensUsed: totalTokens }
    } catch (error: unknown) {
      // Differentiate: caller cancelled vs timeout vs other error
      const callerAborted = options?.signal?.aborted
      const timedOut = timeoutController.signal.aborted && !callerAborted

      if (callerAborted) {
        yield { type: 'error', error: 'Generation cancelled' }
        return
      }
      if (timedOut) {
        console.error('[ai] OpenAI stream timed out after', STREAM_TIMEOUT_MS, 'ms')
        yield { type: 'error', error: 'AI generation timed out. Please try again.' }
        return
      }
      const message = error instanceof Error ? error.message : 'AI generation failed'
      console.error('[ai] generateFullPortfolio error:', error)
      yield { type: 'error', error: message }
    } finally {
      clearTimeout(timeoutId)
    }
  }

  private getSystemPrompt(type: string): string {
    const prompts = {
      PORTFOLIO_CONTENT: 'You are a professional portfolio writer. Create compelling, authentic content that showcases skills and experience.',
      PROJECT_DESCRIPTION: 'You are a technical writer. Create clear, impactful project descriptions that highlight technical achievements.',
      ABOUT_SECTION: 'You are a professional bio writer. Create engaging, authentic personal narratives.',
      SKILLS_SUMMARY: 'You are a career advisor. Create concise, impactful summaries of technical skills.',
      SEO_META: 'You are an SEO specialist. Create optimized metadata that improves search visibility.',
      IMAGE_ALT_TEXT: 'You are an accessibility expert. Create descriptive alt text for images.',
    }

    return prompts[type as keyof typeof prompts] || 'You are a helpful AI assistant.'
  }
}