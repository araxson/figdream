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
    const { cancel_immediately } = body
    
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

    // Check if subscription can be cancelled
    if (subscription.status !== 'active' && subscription.status !== 'trialing') {
      return NextResponse.json(
        { error: 'Only active or trialing subscriptions can be cancelled' },
        { status: 400 }
      )
    }

    // Update subscription
    const updateData = cancel_immediately
      ? {
          status: 'cancelled',
          cancel_at_period_end: false,
          updated_at: new Date().toISOString()
        }
      : {
          cancel_at_period_end: true,
          updated_at: new Date().toISOString()
        }

    const { error: updateError } = await supabase
      .from('platform_subscriptions')
      .update(updateData)
      .eq('id', params.id)

    if (updateError) {
      console.error('Error cancelling subscription:', updateError)
      return NextResponse.json({ error: 'Failed to cancel subscription' }, { status: 500 })
    }

    // Get updated subscription
    const { data: updatedSubscription } = await supabase
      .from('platform_subscriptions')
      .select(`
        *,
        salon:salons!platform_subscriptions_salon_id_fkey(
          id,
          name,
          slug,
          owner_id
        ),
        plan:pricing_plans!platform_subscriptions_plan_id_fkey(
          id,
          name,
          price,
          billing_period
        )
      `)
      .eq('id', params.id)
      .single()

    await logAuditEvent({
      action: 'cancel',
      entity_type: 'subscription',
      entity_id: params.id,
      details: { 
        salon_name: subscription.salon?.name,
        cancel_immediately,
        cancelled_by: session.user.email
      }
    })

    return NextResponse.json({ 
      success: true,
      subscription: updatedSubscription,
      message: cancel_immediately 
        ? 'Subscription cancelled immediately'
        : 'Subscription will be cancelled at period end'
    })
  } catch (error) {
    console.error('Error in POST /api/admin/subscriptions/[id]/cancel:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}