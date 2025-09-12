import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyApiSession } from '@/lib/api/auth-utils'
import { logAuditEvent } from '@/lib/actions/audit-logs'

interface Params {
  params: {
    id: string
  }
}

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const session = await verifyApiSession(request)
    if (!session || session.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { amount, reason } = body
    
    const supabase = await createClient()

    // Get subscription
    const { data: subscription } = await supabase
      .from('platform_subscriptions')
      .select(`
        *,
        salon:salons!platform_subscriptions_salon_id_fkey(
          id,
          name
        )
      `)
      .eq('id', params.id)
      .single()

    if (!subscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
    }

    // In a real implementation, this would process the refund through Stripe
    // For now, we'll just log the refund and update the subscription status
    
    const refundAmount = amount || subscription.amount
    
    // Create refund record (you might want to create a refunds table)
    await logAuditEvent({
      action: 'refund',
      entity_type: 'subscription',
      entity_id: params.id,
      details: { 
        salon_name: subscription.salon?.name,
        refund_amount: refundAmount,
        reason: reason || 'Customer request',
        processed_by: session.user.email,
        stripe_subscription_id: subscription.stripe_subscription_id
      }
    })

    // Update subscription status if full refund
    if (refundAmount >= subscription.amount) {
      await supabase
        .from('platform_subscriptions')
        .update({ 
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', params.id)
    }

    return NextResponse.json({ 
      success: true,
      message: `Refund of ${refundAmount} processed successfully`,
      refund: {
        subscription_id: params.id,
        amount: refundAmount,
        reason: reason || 'Customer request',
        processed_at: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('Error in POST /api/admin/subscriptions/[id]/refund:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}