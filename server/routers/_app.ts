import { createTRPCRouter } from '../trpc'
import { userRouter } from './user'
import { portfolioRouter } from './portfolio'
import { aiRouter } from './ai'
import { builderRouter } from './builder'
import { billingRouter } from './billing'

/**
 * Root tRPC router
 * All feature routers are organized here
 */
export const appRouter = createTRPCRouter({
  user: userRouter,
  portfolio: portfolioRouter,
  ai: aiRouter,
  builder: builderRouter,
  billing: billingRouter,
})

export type AppRouter = typeof appRouter
