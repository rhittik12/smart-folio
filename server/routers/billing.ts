import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../trpc'
import { getServiceContainer } from '../services'

export const billingRouter = createTRPCRouter({
// Get user subscription
  getSubscription: protectedProcedure.query(async ({ ctx }) => {
    const prisma = getServiceContainer().getPrisma()
    const subscription = await prisma.subscription.findFirst({
      where: { userId: ctx.session.user.id },
    })
    
    return subscription
  }),

// Create checkout session
  createCheckoutSession: protectedProcedure
    .input(
      z.object({
        priceId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const stripeService = getServiceContainer().getStripeService()
      
      return await stripeService.createCheckoutSession(
        ctx.session.user.id,
        input.priceId
      )
    }),

// Create billing portal session
  createPortalSession: protectedProcedure.mutation(async ({ ctx }) => {
    const stripeService = getServiceContainer().getStripeService()
    
    return await stripeService.createPortalSession(ctx.session.user.id)
  }),

// Cancel subscription
  cancelSubscription: protectedProcedure.mutation(async ({ ctx }) => {
    const stripeService = getServiceContainer().getStripeService()
    
    return await stripeService.cancelSubscription(ctx.session.user.id)
  }),

  // Resume subscription
  resumeSubscription: protectedProcedure.mutation(async ({ ctx }) => {
    const stripeService = getServiceContainer().getStripeService()
    
    return await stripeService.resumeSubscription(ctx.session.user.id)
  }),

// Get payment history
  getPaymentHistory: protectedProcedure.query(async ({ ctx }) => {
    const prisma = getServiceContainer().getPrisma()
    const payments = await prisma.payment.findMany({
      where: { userId: ctx.session.user.id },
      orderBy: { createdAt: 'desc' },
    })
    
    return payments
  }),

// Get usage stats
  getUsageStats: protectedProcedure.query(async ({ ctx }) => {
    const stripeService = getServiceContainer().getStripeService()
    
    return await stripeService.calculateUsageStats(ctx.session.user.id)
  }),
})
