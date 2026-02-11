/**
 * Server Middleware for tRPC
 */

import { TRPCError } from '@trpc/server'
import type { TRPCContext } from '../trpc'
import { getServiceContainer } from '../services'

/**
 * Rate limiting middleware
 * Limits requests per user
 */
export async function rateLimitMiddleware(opts: { ctx: TRPCContext; next: () => Promise<any> }) {
  const { ctx } = opts
  
  if (!ctx.session?.user?.id) {
    return opts.next()
  }
  
  try {
    const ratelimit = getServiceContainer().getRatelimit()
    const { success } = await ratelimit.limit(ctx.session.user.id)
    
    if (!success) {
      throw new TRPCError({
        code: 'TOO_MANY_REQUESTS',
        message: 'Rate limit exceeded. Please try again later.',
      })
    }
  } catch (error) {
    // If rate limiting fails, allow the request to proceed
    console.error('Rate limiting error:', error)
  }
  
  return opts.next()
}

/**
 * Subscription check middleware
 * Verifies user has active subscription for premium features
 */
export async function subscriptionMiddleware(opts: { ctx: TRPCContext; next: () => Promise<any> }) {
  const { ctx } = opts

  if (!ctx.session?.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }

  const prisma = getServiceContainer().getPrisma()
  const subscription = await prisma.subscription.findFirst({
    where: { userId: ctx.session.user.id },
  })

  if (!subscription || subscription.status !== 'ACTIVE') {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Active subscription required',
    })
  }

  return opts.next()
}

/**
 * Admin check middleware
 * Verifies user has admin permissions
 */
export async function adminMiddleware(opts: { ctx: TRPCContext; next: () => Promise<any> }) {
  const { ctx } = opts

  if (!ctx.session?.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }

  const prisma = getServiceContainer().getPrisma()
  const user = await prisma.user.findUnique({
    where: { id: ctx.session.user.id },
  })

  if (user?.role !== 'ADMIN') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' })
  }

  return opts.next()
}

/**
 * Usage limit middleware
 * Checks if user has exceeded their plan limits
 */
export async function usageLimitMiddleware(
  limitType: 'portfolios' | 'aiGenerations',
  opts: { ctx: TRPCContext; next: () => Promise<any> }
) {
  const { ctx } = opts

  if (!ctx.session?.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }

  const prisma = getServiceContainer().getPrisma()
  const subscription = await prisma.subscription.findFirst({
    where: { userId: ctx.session.user.id },
  })

  const plan = subscription?.plan || 'FREE'

  // Define limits per plan
  const limits = {
    portfolios: { FREE: 1, PRO: 10, ENTERPRISE: 100 },
    aiGenerations: { FREE: 10, PRO: 100, ENTERPRISE: 1000 },
  }

  // Get current usage
  if (limitType === 'portfolios') {
    const count = await prisma.portfolio.count({
      where: { userId: ctx.session.user.id },
    })

    const limit = limits.portfolios[plan as keyof typeof limits.portfolios]

    if (count >= limit) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: `Portfolio limit reached. Upgrade your plan to create more.`,
      })
    }
  }

  if (limitType === 'aiGenerations') {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    
    const count = await prisma.aIGeneration.count({
      where: {
        userId: ctx.session.user.id,
        createdAt: { gte: startOfMonth },
      },
    })

    const limit = limits.aiGenerations[plan as keyof typeof limits.aiGenerations]

    if (count >= limit) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: `AI generation limit reached. Upgrade your plan for more generations.`,
      })
    }
  }

  return opts.next()
}
