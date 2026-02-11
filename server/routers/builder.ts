import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../trpc'
import { getServiceContainer } from '../services'

export const builderRouter = createTRPCRouter({
// Get available templates
  getTemplates: protectedProcedure.query(async ({ ctx }) => {
    const prisma = getServiceContainer().getPrisma()
    
    const templates = await prisma.template.findMany({
      orderBy: { createdAt: 'desc' },
    })
    
    return templates
  }),

// Apply template to portfolio
  applyTemplate: protectedProcedure
    .input(
      z.object({
        portfolioId: z.string(),
        templateId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const prisma = getServiceContainer().getPrisma()
      
      // Get template
      const template = await prisma.template.findUnique({
        where: { id: input.templateId },
      })
      
      if (!template) {
        throw new Error('Template not found')
      }
      
      // Get portfolio to verify ownership
      const portfolio = await prisma.portfolio.findUnique({
        where: { id: input.portfolioId },
      })
      
      if (!portfolio || portfolio.userId !== ctx.session.user.id) {
        throw new Error('Portfolio not found or access denied')
      }
      
      // Delete existing sections
      await prisma.portfolioSection.deleteMany({
        where: { portfolioId: input.portfolioId },
      })
      
      // Apply template blocks as sections
      const blocks = template.blocks as any[]
      for (let i = 0; i < blocks.length; i++) {
        const block = blocks[i]
        await prisma.portfolioSection.create({
          data: {
            portfolioId: input.portfolioId,
            type: block.type,
            title: block.title || '',
            content: block.content || {},
            order: i,
            visible: block.visible !== false,
          },
        })
      }
      
      return { success: true }
    }),

// Save blocks
  saveBlocks: protectedProcedure
    .input(
      z.object({
        portfolioId: z.string(),
        blocks: z.array(
          z.object({
            id: z.string(),
            type: z.string(),
            content: z.record(z.string(), z.unknown()),
            styles: z.record(z.string(), z.unknown()),
            order: z.number(),
            visible: z.boolean(),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const prisma = getServiceContainer().getPrisma()
      
      // Verify portfolio ownership
      const portfolio = await prisma.portfolio.findUnique({
        where: { id: input.portfolioId },
      })
      
      if (!portfolio || portfolio.userId !== ctx.session.user.id) {
        throw new Error('Portfolio not found or access denied')
      }
      
      // Delete existing sections
      await prisma.portfolioSection.deleteMany({
        where: { portfolioId: input.portfolioId },
      })
      
      // Save new blocks as sections
      for (const block of input.blocks) {
        await prisma.portfolioSection.create({
          data: {
            portfolioId: input.portfolioId,
            type: block.type,
            title: (block.content.title as string) || '',
            content: block.content as any,
            order: block.order,
            visible: block.visible,
          },
        })
      }
      
      return { success: true }
    }),

// Get portfolio blocks
  getBlocks: protectedProcedure
    .input(z.object({ portfolioId: z.string() }))
    .query(async ({ ctx, input }) => {
      const prisma = getServiceContainer().getPrisma()
      
      // Verify portfolio ownership
      const portfolio = await prisma.portfolio.findUnique({
        where: { id: input.portfolioId },
      })
      
      if (!portfolio || portfolio.userId !== ctx.session.user.id) {
        throw new Error('Portfolio not found or access denied')
      }
      
      // Get portfolio sections (blocks)
      const sections = await prisma.portfolioSection.findMany({
        where: { portfolioId: input.portfolioId },
        orderBy: { order: 'asc' },
      })
      
      // Transform to block format
      return sections.map(section => ({
        id: section.id,
        type: section.type,
        content: {
          title: section.title,
          ...(section.content as any),
        },
        styles: (section.content as any)?.styles || {},
        order: section.order,
        visible: section.visible,
      }))
    }),
})
