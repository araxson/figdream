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

    // Check if subscription can be reactivated
    if (!subscription.cancel_at_period_end && subscription.status === 'active') {
      return NextResponse.json(
        { error: 'Subscription is already active' },
        { status: 400 }
      )
    }

    // Reactivate subscription
    const { error: updateError } = await supabase
      .from('platform_subscriptions')
      .update({ 
        cancel_at_period_end: false,
        status: subscription.status === 'cancelled' ? 'active' : subscription.status,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)

    if (updateError) {
      console.error('Error reactivating subscription:', updateError)
      return NextResponse.json({ error: 'Failed to reactivate subscription' }, { status: 500 })
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
      action: 'reactivate',
      entity_type: 'subscription',
      entity_id: params.id,
      details: { 
        salon_name: subscription.salon?.name,
        reactivated_by: session.user.email
      }
    })

    return NextResponse.json({ 
      success: true,
      subscription: updatedSubscription,
      message: 'Subscription reactivated successfully'
    })
  } catch (error) {
    console.error('Error in POST /api/admin/subscriptions/[id]/reactivate:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}