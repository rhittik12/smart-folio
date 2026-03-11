import type { PrismaClient } from '@prisma/client'

interface RateLimitResult {
  allowed: boolean
  retryAfter?: number
  reason?: string
}

interface SlidingWindowEntry {
  timestamps: number[]
}

const PLAN_LIMITS = {
  FREE: { monthlyGenerations: 10, monthlyTokens: 10_000 },
  PRO: { monthlyGenerations: 100, monthlyTokens: 100_000 },
  ENTERPRISE: { monthlyGenerations: 1000, monthlyTokens: 1_000_000 },
} as const

const RATE_WINDOW_MS = 60_000 // 1 minute
const RATE_MAX_PER_WINDOW = 5 // max 5 generation starts per minute

export class GenerationRateLimiter {
  private prisma: PrismaClient
  private slidingWindows = new Map<string, SlidingWindowEntry>()

  constructor(prisma: PrismaClient) {
    this.prisma = prisma
  }

  async checkAllowance(userId: string): Promise<RateLimitResult> {
    // 1. Sliding window: max starts per minute
    const windowCheck = this.checkSlidingWindow(userId)
    if (!windowCheck.allowed) return windowCheck

    // 2. Monthly quota check
    const quotaCheck = await this.checkMonthlyQuota(userId)
    if (!quotaCheck.allowed) return quotaCheck

    // Record this start in sliding window
    this.recordStart(userId)

    return { allowed: true }
  }

  private checkSlidingWindow(userId: string): RateLimitResult {
    const now = Date.now()
    const entry = this.slidingWindows.get(userId)

    if (!entry) {
      return { allowed: true }
    }

    // Remove expired timestamps
    entry.timestamps = entry.timestamps.filter((t) => now - t < RATE_WINDOW_MS)

    if (entry.timestamps.length >= RATE_MAX_PER_WINDOW) {
      const oldestInWindow = entry.timestamps[0]!
      const retryAfter = Math.ceil((RATE_WINDOW_MS - (now - oldestInWindow)) / 1000)
      return {
        allowed: false,
        retryAfter,
        reason: `Rate limited: max ${RATE_MAX_PER_WINDOW} generations per minute`,
      }
    }

    return { allowed: true }
  }

  private recordStart(userId: string): void {
    const entry = this.slidingWindows.get(userId) ?? { timestamps: [] }
    entry.timestamps.push(Date.now())
    this.slidingWindows.set(userId, entry)
  }

  private async checkMonthlyQuota(userId: string): Promise<RateLimitResult> {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const [subscription, stats] = await Promise.all([
      this.prisma.subscription.findUnique({ where: { userId } }),
      this.prisma.aIGeneration.aggregate({
        where: {
          userId,
          createdAt: { gte: startOfMonth },
        },
        _sum: { tokensUsed: true },
        _count: true,
      }),
    ])

    const plan = (subscription?.plan || 'FREE') as keyof typeof PLAN_LIMITS
    const limits = PLAN_LIMITS[plan] ?? PLAN_LIMITS.FREE

    const monthlyCount = stats._count
    const monthlyTokens = stats._sum.tokensUsed ?? 0

    if (monthlyCount >= limits.monthlyGenerations) {
      return {
        allowed: false,
        retryAfter: this.secondsUntilNextMonth(),
        reason: `Monthly generation limit reached (${limits.monthlyGenerations} per month on ${plan} plan)`,
      }
    }

    if (monthlyTokens >= limits.monthlyTokens) {
      return {
        allowed: false,
        retryAfter: this.secondsUntilNextMonth(),
        reason: `Monthly token budget exhausted (${limits.monthlyTokens.toLocaleString()} tokens on ${plan} plan)`,
      }
    }

    return { allowed: true }
  }

  private secondsUntilNextMonth(): number {
    const now = new Date()
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
    return Math.ceil((nextMonth.getTime() - now.getTime()) / 1000)
  }
}
