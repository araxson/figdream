import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyApiSession } from '@/lib/api/auth-utils'
import { logAuditEvent } from '@/lib/actions/audit-logs'

interface Params {
  params: {
    id: string
  }
}

// GET /api/admin/subscriptions/[id] - Get single subscription
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const session = await verifyApiSession(request)
    if (!session || session.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createClient()
    
    const { data: subscription, error } = await supabase
      .from('platform_subscriptions')
      .select(`
        *,
        salon:salons!platform_subscriptions_salon_id_fkey(
          id,
          name,
          slug,
          owner_id,
          profiles!salons_owner_id_fkey(
            full_name,
            email,
            phone
          )
        ),
        plan:pricing_plans!platform_subscriptions_plan_id_fkey(
          id,
          name,
          price,
          billing_period,
          features:pricing_features(*)
        )
      `)
      .eq('id', params.id)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
      }
      throw error
    }
    
    return NextResponse.json({ subscription })
  } catch (error) {
    console.error('Error fetching subscription:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subscription' },
      { status: 500 }
    )
  }
}

// PATCH /api/admin/subscriptions/[id] - Update subscription
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const session = await verifyApiSession(request)
    if (!session || session.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const supabase = await createClient()
    
    // Get current subscription data for audit log
    const { data: oldSubscription } = await supabase
      .from('platform_subscriptions')
      .select('*')
      .eq('id', params.id)
      .single()
    
    if (!oldSubscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
    }
    
    // If changing plan, update amount
    let updates = { ...body }
    if (body.plan_id && body.plan_id !== oldSubscription.plan_id) {
      const { data: newPlan } = await supabase
        .from('pricing_plans')
        .select('price')
        .eq('id', body.plan_id)
        .single()
      
      if (newPlan) {
        updates.amount = newPlan.price
      }
    }
    
    // Update the subscription
    const { data: updatedSubscription, error: updateError } = await supabase
      .from('platform_subscriptions')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
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
      .single()
    
    if (updateError) throw updateError
    
    await logAuditEvent({
      action: 'update',
      entity_type: 'subscription',
      entity_id: params.id,
      details: { 
        old_data: oldSubscription,
        new_data: updatedSubscription,
        updated_by: session.user.email
      }
    })
    
    return NextResponse.json({ subscription: updatedSubscription })
  } catch (error) {
    console.error('Error updating subscription:', error)
    return NextResponse.json(
      { error: 'Failed to update subscription' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/subscriptions/[id] - Delete subscription
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const session = await verifyApiSession(request)
    if (!session || session.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createClient()
    
    // Get subscription data for audit log
    const { data: subscriptionToDelete } = await supabase
      .from('platform_subscriptions')
      .select('*')
      .eq('id', params.id)
      .single()
    
    if (!subscriptionToDelete) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
    }
    
    // Don't allow deleting active subscriptions
    if (subscriptionToDelete.status === 'active') {
      return NextResponse.json(
        { error: 'Cannot delete an active subscription. Please cancel it first.' },
        { status: 400 }
      )
    }
    
    // Delete the subscription
    const { error: deleteError } = await supabase
      .from('platform_subscriptions')
      .delete()
      .eq('id', params.id)
    
    if (deleteError) throw deleteError
    
    await logAuditEvent({
      action: 'delete',
      entity_type: 'subscription',
      entity_id: params.id,
      details: { 
        deleted_data: subscriptionToDelete,
        deleted_by: session.user.email
      }
    })
    
    return NextResponse.json({ 
      success: true, 
      message: 'Subscription deleted successfully' 
    })
  } catch (error) {
    console.error('Error deleting subscription:', error)
    return NextResponse.json(
      { error: 'Failed to delete subscription' },
      { status: 500 }
    )
  }
}