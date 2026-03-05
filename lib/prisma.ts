import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function buildDatasourceUrl(): string {
  const raw = process.env.DATABASE_URL ?? ''
  // Append connection timeout params for Neon serverless resilience.
  // Neon aggressively closes idle TCP connections; these params ensure
  // Prisma re-establishes the connection before queries time out.
  const sep = raw.includes('?') ? '&' : '?'
  return `${raw}${sep}connect_timeout=15&pool_timeout=15&connection_limit=5`
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl: buildDatasourceUrl(),
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
