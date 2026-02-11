import { appRouter } from './routers/_app'

/**
 * Server-side tRPC caller
 * Use this in Server Components, Server Actions, etc.
 */
export const createCaller = appRouter.createCaller