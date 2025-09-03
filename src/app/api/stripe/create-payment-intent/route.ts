/**
 * Stripe Create Payment Intent API Route for FigDream
 * Handles creating payment intents for bookings and deposits
 */
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getUser } from '@/lib/data-access/auth'
import { createBookingPaymentIntent } from '@/lib/data-access/payments/stripe'
// Request validation schema
const createPaymentIntentSchema = z.object({
  bookingId: z.string().uuid('Invalid booking ID'),
  amount: z.number().min(0.01, 'Amount must be at least $0.01').max(50000, 'Amount cannot exceed $50,000'),
  currency: z.string().length(3, 'Currency must be 3 characters').default('usd'),
  isDeposit: z.boolean().optional().default(false),
  depositAmount: z.number().min(0.01).max(50000).optional(),
  description: z.string().optional(),
  metadata: z.record(z.string()).optional().default({}),
  savePaymentMethod: z.boolean().optional().default(false),
})
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const { user, error: authError } = await getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    // Parse and validate request body
    const body = await request.json()
    const validatedData = createPaymentIntentSchema.parse(body)
    const {
      bookingId,
      amount,
      currency,
      isDeposit,
      depositAmount,
      description,
      metadata,
      savePaymentMethod,
    } = validatedData
    // Validate deposit amount if provided
    if (isDeposit && depositAmount && depositAmount >= amount) {
      return NextResponse.json(
        { error: 'Deposit amount cannot be equal to or exceed total amount' },
        { status: 400 }
      )
    }
    // Create payment intent
    const result = await createBookingPaymentIntent({
      bookingId,
      amount,
      currency,
      depositAmount: isDeposit ? depositAmount : undefined,
      metadata: {
        ...metadata,
        user_id: user.id,
        is_deposit: isDeposit.toString(),
        save_payment_method: savePaymentMethod.toString(),
        description: description || `Booking payment${isDeposit ? ' (deposit)' : ''}`,
      },
    })
    // Return payment intent client secret and payment record
    return NextResponse.json({
      success: true,
      clientSecret: result.paymentIntent.client_secret,
      paymentIntentId: result.paymentIntent.id,
      paymentId: result.paymentRecord.id,
      amount: isDeposit ? (depositAmount || amount) : amount,
      currency,
      isDeposit,
      metadata: result.paymentIntent.metadata,
    })
  } catch (_error) {
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid request data',
          details: error.errors 
        },
        { status: 400 }
      )
    }
    // Handle known errors
    if (error instanceof Error) {
      if (error.message.includes('Booking not found')) {
        return NextResponse.json(
          { error: 'Booking not found' },
          { status: 404 }
        )
      }
      if (error.message.includes('Unauthorized')) {
        return NextResponse.json(
          { error: 'Unauthorized to access this booking' },
          { status: 403 }
        )
      }
    }
    // Generic error response
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    )
  }
}
/**
 * GET endpoint to retrieve payment intent details
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const { user, error: authError } = await getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    const { searchParams } = new URL(request.url)
    const paymentIntentId = searchParams.get('payment_intent_id')
    if (!paymentIntentId) {
      return NextResponse.json(
        { error: 'Payment intent ID is required' },
        { status: 400 }
      )
    }
    // Get payment intent from Stripe
    const { getPaymentIntent } = await import('@/lib/integrations/stripe/server')
    const paymentIntent = await getPaymentIntent(paymentIntentId)
    if (!paymentIntent) {
      return NextResponse.json(
        { error: 'Payment intent not found' },
        { status: 404 }
      )
    }
    // Verify user owns this payment intent
    const paymentUserId = paymentIntent.metadata?.user_id
    if (paymentUserId !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }
    return NextResponse.json({
      success: true,
      paymentIntent: {
        id: paymentIntent.id,
        client_secret: paymentIntent.client_secret,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
        metadata: paymentIntent.metadata,
        created: paymentIntent.created,
        description: paymentIntent.description,
      }
    })
  } catch (_error) {
    return NextResponse.json(
      { error: 'Failed to retrieve payment intent' },
      { status: 500 }
    )
  }
}
/**
 * PUT endpoint to update payment intent
 */
export async function PUT(request: NextRequest) {
  try {
    // Check authentication
    const { user, error: authError } = await getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    // Parse request body
    const body = await request.json()
    const updateSchema = z.object({
      paymentIntentId: z.string().min(1, 'Payment intent ID is required'),
      amount: z.number().min(0.01).optional(),
      metadata: z.record(z.string()).optional(),
      description: z.string().optional(),
    })
    const { paymentIntentId, amount, metadata, description } = updateSchema.parse(body)
    // Get payment intent to verify ownership
    const { getPaymentIntent, stripe } = await import('@/lib/integrations/stripe/server')
    const existingPaymentIntent = await getPaymentIntent(paymentIntentId)
    if (!existingPaymentIntent) {
      return NextResponse.json(
        { error: 'Payment intent not found' },
        { status: 404 }
      )
    }
    // Verify user owns this payment intent
    if (existingPaymentIntent.metadata?.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }
    // Check if payment intent can be updated
    if (existingPaymentIntent.status !== 'requires_payment_method' && 
        existingPaymentIntent.status !== 'requires_confirmation') {
      return NextResponse.json(
        { error: 'Payment intent cannot be updated in current status' },
        { status: 400 }
      )
    }
    // Prepare update parameters
    const updateParams: {
      amount?: number;
      metadata?: Record<string, string>;
    } = {}
    if (amount !== undefined) {
      const { formatAmountForStripe } = await import('@/lib/integrations/stripe/client')
      updateParams.amount = formatAmountForStripe(amount, existingPaymentIntent.currency as string)
    }
    if (metadata !== undefined) {
      updateParams.metadata = {
        ...existingPaymentIntent.metadata,
        ...metadata,
      }
    }
    if (description !== undefined) {
      updateParams.description = description
    }
    // Update payment intent
    const updatedPaymentIntent = await stripe.paymentIntents.update(
      paymentIntentId,
      updateParams
    )
    return NextResponse.json({
      success: true,
      paymentIntent: {
        id: updatedPaymentIntent.id,
        client_secret: updatedPaymentIntent.client_secret,
        amount: updatedPaymentIntent.amount,
        currency: updatedPaymentIntent.currency,
        status: updatedPaymentIntent.status,
        metadata: updatedPaymentIntent.metadata,
        description: updatedPaymentIntent.description,
      }
    })
  } catch (_error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid request data',
          details: error.errors 
        },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to update payment intent' },
      { status: 500 }
    )
  }
}
/**
 * DELETE endpoint to cancel payment intent
 */
export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const { user, error: authError } = await getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    const { searchParams } = new URL(request.url)
    const paymentIntentId = searchParams.get('payment_intent_id')
    if (!paymentIntentId) {
      return NextResponse.json(
        { error: 'Payment intent ID is required' },
        { status: 400 }
      )
    }
    // Get payment intent to verify ownership
    const { getPaymentIntent, stripe } = await import('@/lib/integrations/stripe/server')
    const paymentIntent = await getPaymentIntent(paymentIntentId)
    if (!paymentIntent) {
      return NextResponse.json(
        { error: 'Payment intent not found' },
        { status: 404 }
      )
    }
    // Verify user owns this payment intent
    if (paymentIntent.metadata?.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }
    // Check if payment intent can be canceled
    const cancelableStatuses = ['requires_payment_method', 'requires_confirmation', 'requires_action']
    if (!cancelableStatuses.includes(paymentIntent.status)) {
      return NextResponse.json(
        { error: 'Payment intent cannot be canceled in current status' },
        { status: 400 }
      )
    }
    // Cancel payment intent
    const canceledPaymentIntent = await stripe.paymentIntents.cancel(paymentIntentId)
    // Update payment record status
    const { updatePaymentFromStripe } = await import('@/lib/data-access/payments/stripe')
    await updatePaymentFromStripe(paymentIntentId, 'cancelled', canceledPaymentIntent)
    return NextResponse.json({
      success: true,
      message: 'Payment intent canceled successfully',
      paymentIntentId: canceledPaymentIntent.id,
      status: canceledPaymentIntent.status,
    })
  } catch (_error) {
    return NextResponse.json(
      { error: 'Failed to cancel payment intent' },
      { status: 500 }
    )
  }
}