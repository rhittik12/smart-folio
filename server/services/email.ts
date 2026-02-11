import nodemailer from 'nodemailer'
import { PrismaClient } from '@prisma/client'

export interface EmailServiceConfig {
  smtp: {
    host: string
    port: number
    secure: boolean
    user: string
    pass: string
  }
  from: {
    name: string
    email: string
  }
}

export interface EmailData {
  to: string
  subject: string
  html: string
  text?: string
}

export class EmailService {
  private transporter: nodemailer.Transporter
  private config: EmailServiceConfig
  private prisma: PrismaClient

  constructor(config: EmailServiceConfig, prisma: PrismaClient) {
    this.config = config
    this.prisma = prisma
    this.transporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.secure,
      auth: {
        user: config.smtp.user,
        pass: config.smtp.pass,
      },
    })
  }

  async sendEmail(emailData: EmailData): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: `${this.config.from.name} <${this.config.from.email}>`,
        to: emailData.to,
        subject: emailData.subject,
        html: emailData.html,
        text: emailData.text,
      })
    } catch (error) {
      console.error('Email sending error:', error)
      throw new Error('Failed to send email')
    }
  }

  async sendWelcomeEmail(userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user?.email) return

    const html = this.getWelcomeTemplate(user.name || 'there')
    
    await this.sendEmail({
      to: user.email,
      subject: 'Welcome to Smartfolio!',
      html,
    })
  }

  async sendSubscriptionConfirmation(userId: string, plan: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user?.email) return

    const html = this.getSubscriptionTemplate(user.name || 'there', plan)
    
    await this.sendEmail({
      to: user.email,
      subject: `Your ${plan} subscription is active!`,
      html,
    })
  }

  async sendPasswordResetEmail(userId: string, resetToken: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user?.email) return

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`
    const html = this.getPasswordResetTemplate(resetUrl)
    
    await this.sendEmail({
      to: user.email,
      subject: 'Reset your password',
      html,
    })
  }

  private getWelcomeTemplate(name: string): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Welcome to Smartfolio, ${name}!</h2>
        <p>Thank you for joining Smartfolio! We're excited to help you create your professional portfolio.</p>
        <p>Here's what you can do:</p>
        <ul>
          <li>Create stunning portfolios with our AI-powered builder</li>
          <li>Choose from beautiful templates</li>
          <li>Customize your content to match your brand</li>
          <li>Track analytics and performance</li>
        </ul>
        <p>Get started by creating your first portfolio!</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" 
             style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
            Create Your Portfolio
          </a>
        </div>
        <p>If you have any questions, don't hesitate to reach out to our support team.</p>
        <p>Best regards,<br>The Smartfolio Team</p>
      </div>
    `
  }

  private getSubscriptionTemplate(name: string, plan: string): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Your ${plan} subscription is active!</h2>
        <p>Hi ${name},</p>
        <p>Thank you for upgrading to ${plan}! You now have access to all premium features:</p>
        <ul>
          <li>Unlimited portfolio creation</li>
          <li>Advanced AI-powered content generation</li>
          <li>Premium templates</li>
          <li>Advanced analytics</li>
          <li>Priority support</li>
        </ul>
        <p>You can manage your subscription anytime in your billing settings.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/billing" 
             style="background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
            Manage Subscription
          </a>
        </div>
        <p>We're excited to see what you'll create with Smartfolio!</p>
        <p>Best regards,<br>The Smartfolio Team</p>
      </div>
    `
  }

  private getPasswordResetTemplate(resetUrl: string): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Reset Your Password</h2>
        <p>We received a request to reset your password. Click the link below to create a new password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background-color: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
            Reset Password
          </a>
        </div>
        <p>This link will expire in 1 hour for security reasons.</p>
        <p>If you didn't request this password reset, you can safely ignore this email.</p>
        <p>If you have any questions, please contact our support team.</p>
        <p>Best regards,<br>The Smartfolio Team</p>
      </div>
    `
  }
}