import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { verifyWebhookSignature } from '@/lib/api/services/payment.service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const headersList = await headers()
    const signature = headersList.get('stripe-signature')

    if (!signature) {
      return NextResponse.json(
        { error: 'No signature provided' },
        { status: 400 }
      )
    }

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 501 }
      )
    }

    // Stripe webhook verification requires real Stripe SDK integration
    // For now, return error until Stripe is properly configured
    try {
      await verifyWebhookSignature(body, signature, process.env.STRIPE_WEBHOOK_SECRET)
    } catch (err) {
      console.error('Stripe webhook processing error:', err)
      // Return success to prevent Stripe from retrying
      // In production, this should process real webhook events
      return NextResponse.json(
        { error: 'Stripe integration not configured. Please configure Stripe SDK.' },
        { status: 501 } // Not Implemented
      )
    }

    // This code will only execute once Stripe SDK is properly integrated
    // The event structure would come from Stripe's webhook verification
    const event = { 
      type: 'unimplemented' as string, 
      data: { 
        object: {} as Record<string, unknown>
      } 
    }

    const supabase = await createClient()

    // Handle the event (requires real Stripe integration)
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as {
          metadata?: { appointment_id?: string; customer_id?: string }
          amount?: number
        }
        
        // Update appointment with payment information
        const appointmentId = paymentIntent.metadata?.appointment_id
        if (appointmentId) {
          // Update appointment status to confirmed
          // Note: Payment details should be tracked in a separate payments table when implemented
          await supabase
            .from('appointments')
            .update({ 
              status: 'confirmed',
              confirmed_at: new Date().toISOString(),
              computed_total_price: (paymentIntent.amount || 0) / 100 // Convert from cents
            })
            .eq('id', appointmentId)

          // Create notification for successful payment
          if (paymentIntent.metadata?.customer_id) {
            await supabase
              .from('notifications')
              .insert({
                user_id: paymentIntent.metadata.customer_id,
                type: 'appointment_confirmation',
                title: 'Payment Confirmed',
                message: `Your payment of $${((paymentIntent.amount || 0) / 100).toFixed(2)} has been confirmed.`,
                data: {
                  appointment_id: appointmentId,
                  amount: (paymentIntent.amount || 0) / 100,
                  payment_intent_id: 'stripe_payment'
                }
              })
          }
        }
        break

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object as {
          metadata?: { appointment_id?: string; customer_id?: string }
          amount?: number
          last_payment_error?: { message?: string }
        }
        const failedAppointmentId = failedPayment.metadata?.appointment_id
        
        if (failedAppointmentId) {
          // Update appointment status if payment failed
          // Note: Payment details should be tracked in a separate payments table when implemented
          await supabase
            .from('appointments')
            .update({
              status: 'pending'
            })
            .eq('id', failedAppointmentId)

          // Create notification for failed payment
          if (failedPayment.metadata?.customer_id) {
            await supabase
              .from('notifications')
              .insert({
                user_id: failedPayment.metadata.customer_id,
                type: 'appointment_cancelled',
                title: 'Payment Failed',
                message: `Your payment of $${((failedPayment.amount || 0) / 100).toFixed(2)} could not be processed. ${failedPayment.last_payment_error?.message || 'Please try again.'}`,
                data: {
                  appointment_id: failedAppointmentId,
                  amount: (failedPayment.amount || 0) / 100,
                  payment_intent_id: 'stripe_payment',
                  error: failedPayment.last_payment_error?.message
                }
              })
          }
        }
        break

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        const subscription = event.data.object as {
          metadata?: { profile_id?: string }
          customer?: string
        }
        const profileId = subscription.metadata?.profile_id
        
        if (profileId) {
          // Update profile with subscription info
          // Note: Only stripe_customer_id field exists in profiles table
          await supabase
            .from('profiles')
            .update({
              stripe_customer_id: subscription.customer as string,
              updated_at: new Date().toISOString()
            })
            .eq('id', profileId)
        }
        break

      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object as {
          metadata?: { profile_id?: string }
        }
        const deletedProfileId = deletedSubscription.metadata?.profile_id
        
        if (deletedProfileId) {
          // Clear stripe customer ID when subscription is deleted
          await supabase
            .from('profiles')
            .update({ 
              stripe_customer_id: null,
              updated_at: new Date().toISOString()
            })
            .eq('id', deletedProfileId)
        }
        break

      case 'checkout.session.completed':
        const session = event.data.object as {
          metadata?: { appointment_id?: string }
        }
        
        // Handle successful checkout
        if (session.metadata?.appointment_id) {
          await supabase
            .from('appointments')
            .update({ 
              status: 'confirmed',
              confirmed_at: new Date().toISOString()
            })
            .eq('id', session.metadata.appointment_id)
        }
        break

      default:
        console.warn(`Unhandled event type ${event.type}`)
    }

    return NextResponse.json({ received: true }, { status: 200 })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}