import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyApiSession } from '@/lib/api/auth-utils'
import { logAuditEvent } from '@/lib/actions/audit-logs'

interface Params {
  params: {
    id: string
  }
}

// GET /api/admin/pricing/[id] - Get single pricing plan
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const session = await verifyApiSession(request)
    if (!session || session.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createClient()
    
    const { data: plan, error } = await supabase
      .from('pricing_plans')
      .select(`
        *,
        features:pricing_features(*),
        subscriptions:platform_subscriptions(
          id,
          salon_id,
          status,
          start_date,
          end_date
        )
      `)
      .eq('id', params.id)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Pricing plan not found' }, { status: 404 })
      }
      throw error
    }
    
    return NextResponse.json({ plan })
  } catch (error) {
    console.error('Error fetching pricing plan:', error)
    return NextResponse.json(
      { error: 'Failed to fetch pricing plan' },
      { status: 500 }
    )
  }
}

// PATCH /api/admin/pricing/[id] - Update pricing plan
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const session = await verifyApiSession(request)
    if (!session || session.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { features, ...planData } = body
    
    const supabase = await createClient()
    
    // Get current plan data for audit log
    const { data: oldPlan } = await supabase
      .from('pricing_plans')
      .select(`
        *,
        features:pricing_features(*)
      `)
      .eq('id', params.id)
      .single()
    
    if (!oldPlan) {
      return NextResponse.json({ error: 'Pricing plan not found' }, { status: 404 })
    }
    
    // Update the plan
    const { data: updatedPlan, error: updateError } = await supabase
      .from('pricing_plans')
      .update({
        ...planData,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single()
    
    if (updateError) throw updateError
    
    // Update features if provided
    if (features !== undefined) {
      // Delete existing features
      await supabase
        .from('pricing_features')
        .delete()
        .eq('plan_id', params.id)
      
      // Insert new features
      if (features && features.length > 0) {
        const featuresToInsert = features.map((feature: any, index: number) => ({
          plan_id: params.id,
          feature_name: feature.name,
          feature_value: feature.value,
          display_order: index
        }))
        
        const { error: featuresError } = await supabase
          .from('pricing_features')
          .insert(featuresToInsert)
        
        if (featuresError) throw featuresError
      }
    }
    
    // Get the complete updated plan with features
    const { data: completePlan } = await supabase
      .from('pricing_plans')
      .select(`
        *,
        features:pricing_features(*)
      `)
      .eq('id', params.id)
      .single()
    
    await logAuditEvent({
      action: 'update',
      entity_type: 'pricing_plan',
      entity_id: params.id,
      details: { 
        plan_name: updatedPlan.name,
        old_data: oldPlan,
        new_data: completePlan,
        updated_by: session.user.email
      }
    })
    
    return NextResponse.json({ plan: completePlan })
  } catch (error) {
    console.error('Error updating pricing plan:', error)
    return NextResponse.json(
      { error: 'Failed to update pricing plan' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/pricing/[id] - Delete pricing plan
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const session = await verifyApiSession(request)
    if (!session || session.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createClient()
    
    // Check if plan has active subscriptions
    const { count: subscriptionCount } = await supabase
      .from('platform_subscriptions')
      .select('*', { count: 'exact', head: true })
      .eq('plan_id', params.id)
      .eq('status', 'active')
    
    if (subscriptionCount && subscriptionCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete plan with active subscriptions' },
        { status: 400 }
      )
    }
    
    // Get plan data for audit log
    const { data: planToDelete } = await supabase
      .from('pricing_plans')
      .select(`
        *,
        features:pricing_features(*)
      `)
      .eq('id', params.id)
      .single()
    
    if (!planToDelete) {
      return NextResponse.json({ error: 'Pricing plan not found' }, { status: 404 })
    }
    
    // Delete features first (due to foreign key constraint)
    await supabase
      .from('pricing_features')
      .delete()
      .eq('plan_id', params.id)
    
    // Delete the plan
    const { error: deleteError } = await supabase
      .from('pricing_plans')
      .delete()
      .eq('id', params.id)
    
    if (deleteError) throw deleteError
    
    await logAuditEvent({
      action: 'delete',
      entity_type: 'pricing_plan',
      entity_id: params.id,
      details: { 
        plan_name: planToDelete.name,
        deleted_data: planToDelete,
        deleted_by: session.user.email
      }
    })
    
    return NextResponse.json({ 
      success: true, 
      message: 'Pricing plan deleted successfully' 
    })
  } catch (error) {
    console.error('Error deleting pricing plan:', error)
    return NextResponse.json(
      { error: 'Failed to delete pricing plan' },
      { status: 500 }
    )
  }
}