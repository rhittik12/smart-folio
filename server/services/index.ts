import { PrismaClient } from '@prisma/client'
import { AIService } from './ai'
import { StripeService } from './stripe'
import { EmailService } from './email'
import { StorageService } from './storage'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

export class ServiceContainer {
  private prisma: PrismaClient
  private aiService?: AIService
  private stripeService?: StripeService
  private emailService?: EmailService
  private storageService?: StorageService
  private ratelimit?: Ratelimit

  constructor() {
    this.prisma = new PrismaClient()
  }

  getPrisma(): PrismaClient {
    return this.prisma
  }

  getAIService(): AIService {
    if (!this.aiService) {
      this.aiService = new AIService(
        {
          openaiApiKey: process.env.OPENAI_API_KEY || '',
          defaultModel: 'gpt-3.5-turbo',
        },
        this.prisma
      )
    }
    return this.aiService
  }

  getStripeService(): StripeService {
    if (!this.stripeService) {
      this.stripeService = new StripeService(
        {
          apiKey: process.env.STRIPE_SECRET_KEY || '',
          priceIds: {
            pro: process.env.STRIPE_PRICE_ID_PRO,
            enterprise: process.env.STRIPE_PRICE_ID_ENTERPRISE,
          },
        },
        this.prisma
      )
    }
    return this.stripeService
  }

  getEmailService(): EmailService {
    if (!this.emailService) {
      this.emailService = new EmailService(
        {
          smtp: {
            host: process.env.SMTP_HOST || 'localhost',
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: process.env.SMTP_SECURE === 'true',
            user: process.env.SMTP_USER || '',
            pass: process.env.SMTP_PASS || '',
          },
          from: {
            name: process.env.EMAIL_FROM_NAME || 'Smartfolio',
            email: process.env.EMAIL_FROM_EMAIL || 'noreply@smartfolio.com',
          },
        },
        this.prisma
      )
    }
    return this.emailService
  }

  getStorageService(): StorageService {
    if (!this.storageService) {
      this.storageService = new StorageService(
        {
          region: process.env.AWS_REGION || 'us-east-1',
          accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
          bucket: process.env.AWS_S3_BUCKET || '',
        },
        this.prisma
      )
    }
    return this.storageService
  }

  getRatelimit(): Ratelimit {
    if (!this.ratelimit) {
      this.ratelimit = new Ratelimit({
        redis: new Redis({
          url: process.env.UPSTASH_REDIS_REST_URL || '',
          token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
        }),
        limiter: Ratelimit.slidingWindow(10, '10 s'),
        analytics: false,
      })
    }
    return this.ratelimit
  }

  async disconnect(): Promise<void> {
    await this.prisma.$disconnect()
  }
}

// Singleton instance
let serviceContainer: ServiceContainer

export function getServiceContainer(): ServiceContainer {
  if (!serviceContainer) {
    serviceContainer = new ServiceContainer()
  }
  return serviceContainer
}