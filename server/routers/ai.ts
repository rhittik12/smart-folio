import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../trpc'
import { getServiceContainer } from '../services'

export const aiRouter = createTRPCRouter({
  // Generic AI generation
  generate: protectedProcedure
    .input(
      z.object({
        type: z.enum([
          'PORTFOLIO_CONTENT',
          'PROJECT_DESCRIPTION',
          'ABOUT_SECTION',
          'SKILLS_SUMMARY',
          'SEO_META',
          'IMAGE_ALT_TEXT',
        ]),
        prompt: z.string(),
        maxTokens: z.number().optional(),
      })
    )
.mutation(async ({ ctx, input }) => {
      const aiService = getServiceContainer().getAIService()
      
      return await aiService.generate({
        type: input.type,
        prompt: input.prompt,
        maxTokens: input.maxTokens,
        userId: ctx.session.user.id,
      })
    }),

  // Generate portfolio content
  generatePortfolio: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        profession: z.string(),
        skills: z.array(z.string()),
        experience: z.string().optional(),
        goals: z.string().optional(),
        tone: z.enum(['professional', 'casual', 'creative']).optional(),
      })
    )
.mutation(async ({ ctx, input }) => {
      const aiService = getServiceContainer().getAIService()
      
      return await aiService.generatePortfolio({
        ...input,
        userId: ctx.session.user.id,
      })
    }),

  // Generate project description
  generateProjectDescription: protectedProcedure
    .input(
      z.object({
        projectName: z.string(),
        technologies: z.array(z.string()),
        features: z.array(z.string()),
        impact: z.string().optional(),
      })
    )
.mutation(async ({ ctx, input }) => {
      const aiService = getServiceContainer().getAIService()
      
      return await aiService.generateProjectDescription({
        ...input,
        userId: ctx.session.user.id,
      })
    }),

  // Generate SEO metadata
  generateSEO: protectedProcedure
    .input(
      z.object({
        portfolioTitle: z.string(),
        profession: z.string(),
        specialties: z.array(z.string()),
      })
    )
.mutation(async ({ ctx, input }) => {
      const aiService = getServiceContainer().getAIService()
      
      return await aiService.generateSEO({
        ...input,
        userId: ctx.session.user.id,
      })
    }),

// Get AI generation history
  getHistory: protectedProcedure.query(async ({ ctx }) => {
    const aiService = getServiceContainer().getAIService()
    
    return await aiService.getHistory(ctx.session.user.id)
  }),

  // Get usage stats
  getUsageStats: protectedProcedure.query(async ({ ctx }) => {
    const aiService = getServiceContainer().getAIService()
    
    return await aiService.getUsageStats(ctx.session.user.id)
  }),
})
