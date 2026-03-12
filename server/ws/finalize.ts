import type { PrismaClient } from '@prisma/client'
import type { PortfolioOutput, PortfolioSection } from './types'

function sectionTitle(section: PortfolioSection): string {
  switch (section.type) {
    case 'HERO': return section.headline
    case 'ABOUT': return 'About'
    case 'PROJECTS': return 'Projects'
    case 'SKILLS': return 'Skills'
    case 'CONTACT': return 'Contact'
    case 'FOOTER': return 'Footer'
    default: return 'Section'
  }
}

function sectionContent(section: PortfolioSection): object {
  // Strip 'type' field — stored separately in the DB column
  const { type, ...rest } = section as any
  return rest
}

export async function finalizePortfolio(
  prisma: PrismaClient,
  portfolioId: string,
  userId: string,
  output: PortfolioOutput,
  tokensUsed: number,
  prompt: string,
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    // 1. Verify ownership and GENERATING status
    const portfolio = await tx.portfolio.findFirst({
      where: {
        id: portfolioId,
        userId,
        status: 'GENERATING',
      },
    })

    if (!portfolio) {
      throw new Error('Portfolio not found, not owned by user, or not in GENERATING status')
    }

    // 2. Update portfolio metadata
    await tx.portfolio.update({
      where: { id: portfolioId },
      data: {
        status: 'READY',
        theme: output.theme.variant,
        seoTitle: output.metadata.seoTitle ?? output.metadata.title,
        seoDescription: output.metadata.seoDescription ?? output.metadata.description,
      },
    })

    // 3. Delete any existing sections (idempotent)
    await tx.portfolioSection.deleteMany({
      where: { portfolioId },
    })

    // 4. Create new sections
    for (let i = 0; i < output.sections.length; i++) {
      const section = output.sections[i]!
      await tx.portfolioSection.create({
        data: {
          portfolioId,
          type: section.type,
          title: sectionTitle(section),
          content: sectionContent(section),
          order: i,
          visible: true,
        },
      })
    }

    // 5. Record AI generation
    await tx.aIGeneration.create({
      data: {
        userId,
        type: 'FULL_PORTFOLIO',
        prompt,
        response: JSON.stringify(output),
        tokensUsed,
        provider: 'OPENAI',
      },
    })
  })
}

export async function failPortfolio(
  prisma: PrismaClient,
  portfolioId: string,
  errorMessage: string,
): Promise<void> {
  try {
    await prisma.$transaction(async (tx) => {
      // Only clean up if the portfolio is still in GENERATING status.
      // If it has already moved to READY (via finalizePortfolio), do nothing.
      const target = await tx.portfolio.findFirst({
        where: { id: portfolioId, status: 'GENERATING' },
        select: { id: true },
      })

      if (!target) return

      // Delete sections first, then the portfolio
      await tx.portfolioSection.deleteMany({
        where: { portfolioId },
      })
      await tx.portfolio.delete({
        where: { id: portfolioId },
      })
    })
  } catch (err) {
    console.error(`[finalize] Failed to clean up portfolio ${portfolioId}:`, err)
  }
}
