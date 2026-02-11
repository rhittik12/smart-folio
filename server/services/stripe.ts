import Stripe from 'stripe'
import { PrismaClient } from '@prisma/client'

export interface StripeServiceConfig {
  apiKey: string
  webhookSecret?: string
  priceIds: {
    pro?: string
    enterprise?: string
  }
}

export class StripeService {
  private stripe: Stripe
  private prisma: PrismaClient
  private config: StripeServiceConfig

  constructor(config: StripeServiceConfig, prisma: PrismaClient) {
    this.config = config
    this.prisma = prisma
    this.stripe = new Stripe(config.apiKey)
  }

  async createCheckoutSession(userId: string, priceId: string): Promise<{
    sessionId: string
    url: string
  }> {
    // Get or create customer
    let customer = await this.getOrCreateCustomer(userId)

    const session = await this.stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing/cancel`,
      metadata: {
        userId,
      },
    })

    return {
      sessionId: session.id,
      url: session.url || '',
    }
  }

  async createPortalSession(userId: string): Promise<{ url: string }> {
    const customer = await this.getOrCreateCustomer(userId)

    const session = await this.stripe.billingPortal.sessions.create({
      customer: customer.id,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing`,
    })

    return {
      url: session.url,
    }
  }

  async cancelSubscription(userId: string): Promise<{ success: boolean }> {
    const subscription = await this.prisma.subscription.findUnique({
      where: { userId },
    })

    if (!subscription?.stripeSubscriptionId) {
      throw new Error('No active subscription found')
    }

    await this.stripe.subscriptions.update(
      subscription.stripeSubscriptionId,
      { cancel_at_period_end: true }
    )

    await this.prisma.subscription.update({
      where: { userId },
      data: {
        cancelAtPeriodEnd: true,
      },
    })

    return { success: true }
  }

  async resumeSubscription(userId: string): Promise<{ success: boolean }> {
    const subscription = await this.prisma.subscription.findUnique({
      where: { userId },
    })

    if (!subscription?.stripeSubscriptionId) {
      throw new Error('No active subscription found')
    }

    await this.stripe.subscriptions.update(
      subscription.stripeSubscriptionId,
      { cancel_at_period_end: false }
    )

    await this.prisma.subscription.update({
      where: { userId },
      data: {
        cancelAtPeriodEnd: false,
      },
    })

    return { success: true }
  }

  async handleWebhook(event: Stripe.Event): Promise<void> {
    switch (event.type) {
      case 'checkout.session.completed':
        await this.handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
        break
      case 'invoice.payment_succeeded':
        await this.handleInvoiceSucceeded(event.data.object as Stripe.Invoice)
        break
      case 'invoice.payment_failed':
        await this.handleInvoiceFailed(event.data.object as Stripe.Invoice)
        break
      case 'customer.subscription.deleted':
        await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break
    }
  }

  async calculateUsageStats(userId: string): Promise<{
    portfoliosUsed: number
    portfoliosLimit: number
    aiGenerationsUsed: number
    aiGenerationsLimit: number
  }> {
    // Count portfolios
    const portfoliosCount = await this.prisma.portfolio.count({
      where: { userId },
    })

    // Count AI generations this month
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const aiGenerationsCount = await this.prisma.aIGeneration.count({
      where: {
        userId,
        createdAt: { gte: startOfMonth },
      },
    })

    // Get subscription for limits
    const subscription = await this.prisma.subscription.findUnique({
      where: { userId },
    })

    const plan = subscription?.plan || 'FREE'
    const limits = {
      portfolios: { FREE: 1, PRO: 10, ENTERPRISE: 100 },
      aiGenerations: { FREE: 10, PRO: 100, ENTERPRISE: 1000 },
    }

    return {
      portfoliosUsed: portfoliosCount,
      portfoliosLimit: limits.portfolios[plan as keyof typeof limits.portfolios],
      aiGenerationsUsed: aiGenerationsCount,
      aiGenerationsLimit: limits.aiGenerations[plan as keyof typeof limits.aiGenerations],
    }
  }

  private async getOrCreateCustomer(userId: string): Promise<Stripe.Customer> {
    // First check if we have a customer ID in our database
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: true },
    })

    if (user?.subscription?.stripeCustomerId) {
      return await this.stripe.customers.retrieve(user.subscription.stripeCustomerId) as Stripe.Customer
    }

    // Create new customer
    const customer = await this.stripe.customers.create({
      email: user?.email || undefined,
      name: user?.name || undefined,
      metadata: {
        userId,
      },
    })

    // Update or create subscription record with customer ID
    if (user?.subscription) {
      await this.prisma.subscription.update({
        where: { userId },
        data: { stripeCustomerId: customer.id },
      })
    } else {
      await this.prisma.subscription.create({
        data: {
          userId,
          stripeCustomerId: customer.id,
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        },
      })
    }

    return customer
  }

  private async handleCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
    const userId = session.metadata?.userId
    if (!userId) return

    const subscription = await this.stripe.subscriptions.retrieve(
      session.subscription as string
    )

    // Determine plan based on price ID
    let plan = 'PRO'
    if (subscription.items.data[0]?.price.id === this.config.priceIds.enterprise) {
      plan = 'ENTERPRISE'
    }

    await this.prisma.subscription.upsert({
      where: { userId },
      update: {
        plan,
        status: 'ACTIVE',
        stripeSubscriptionId: subscription.id,
        stripePriceId: subscription.items.data[0]?.price.id,
        currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
        currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
        cancelAtPeriodEnd: (subscription as any).cancel_at_period_end,
      },
      create: {
        userId,
        plan,
        status: 'ACTIVE',
        stripeCustomerId: session.customer as string,
        stripeSubscriptionId: subscription.id,
        stripePriceId: subscription.items.data[0]?.price.id,
        currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
        currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
        cancelAtPeriodEnd: (subscription as any).cancel_at_period_end,
      },
    })
  }

  private async handleInvoiceSucceeded(invoice: Stripe.Invoice): Promise<void> {
    const subscriptionId = (invoice as any).subscription as string
    if (!subscriptionId) return

    const subscription = await this.prisma.subscription.findFirst({
      where: { stripeSubscriptionId: subscriptionId },
    })

    if (subscription && subscription.status !== 'ACTIVE') {
      await this.prisma.subscription.update({
        where: { id: subscription.id },
        data: { status: 'ACTIVE' },
      })
    }
  }

  private async handleInvoiceFailed(invoice: Stripe.Invoice): Promise<void> {
    const subscriptionId = (invoice as any).subscription as string
    if (!subscriptionId) return

    const subscription = await this.prisma.subscription.findFirst({
      where: { stripeSubscriptionId: subscriptionId },
    })

    if (subscription) {
      await this.prisma.subscription.update({
        where: { id: subscription.id },
        data: { status: 'PAST_DUE' },
      })
    }
  }

  private async handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
    const dbSubscription = await this.prisma.subscription.findFirst({
      where: { stripeSubscriptionId: subscription.id },
    })

    if (dbSubscription) {
      await this.prisma.subscription.update({
        where: { id: dbSubscription.id },
        data: { status: 'CANCELED' },
      })
    }
  }
}