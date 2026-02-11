import { headers as getHeaders } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { getServiceContainer } from '@/server/services'
import Stripe from 'stripe'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const headerList = getHeaders()
  const signature = (await headerList).get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe signature' },
      { status: 400 }
    )
  }

  try {
    const stripeService = getServiceContainer().getStripeService()
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '')
    
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    )

    await stripeService.handleWebhook(event)

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    )
  }
}