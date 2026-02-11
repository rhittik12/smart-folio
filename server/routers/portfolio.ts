import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../trpc'

export const portfolioRouter = createTRPCRouter({
  // List all user's portfolios
  list: protectedProcedure.query(async ({ ctx }) => {
    const portfolios = await ctx.prisma.portfolio.findMany({
      where: { userId: ctx.session.user.id },
      orderBy: { createdAt: 'desc' },
    })
    
    return { portfolios }
  }),

  // Get portfolio by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const portfolio = await ctx.prisma.portfolio.findFirst({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
      })
      
      return portfolio
    }),

  // Create new portfolio
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1).max(100),
        slug: z.string().min(3).max(100).optional(),
        description: z.string().max(500).optional(),
        theme: z.enum(['MINIMAL', 'MODERN', 'CREATIVE', 'PROFESSIONAL', 'DARK']).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const slug = input.slug || input.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      
      const portfolio = await ctx.prisma.portfolio.create({
        data: {
          userId: ctx.session.user.id,
          title: input.title,
          slug,
          description: input.description,
          theme: input.theme || 'MINIMAL',
          status: 'DRAFT',
        },
      })
      
      return portfolio
    }),

  // Update portfolio
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(1).max(100).optional(),
        slug: z.string().min(3).max(100).optional(),
        description: z.string().max(500).optional(),
        theme: z.enum(['MINIMAL', 'MODERN', 'CREATIVE', 'PROFESSIONAL', 'DARK']).optional(),
        status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input
      
      const portfolio = await ctx.prisma.portfolio.updateMany({
        where: {
          id,
          userId: ctx.session.user.id,
        },
        data,
      })
      
      return portfolio
    }),

  // Delete portfolio
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.portfolio.deleteMany({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
      })
      
      return { success: true }
    }),

  // Publish portfolio
  publish: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const portfolio = await ctx.prisma.portfolio.updateMany({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
        data: {
          status: 'PUBLISHED',
          published: true,
          publishedAt: new Date(),
        },
      })
      
      return portfolio
    }),
})
