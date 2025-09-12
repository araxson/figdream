import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyApiSession } from '@/lib/api/auth-utils'
import { logAuditEvent } from '@/lib/actions/audit-logs'

// GET /api/admin/subscriptions - List all subscriptions
export async function GET(request: NextRequest) {
  try {
    const session = await verifyApiSession(request)
    if (!session || session.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const search = searchParams.get('search') || ''
    const salonId = searchParams.get('salon_id')
    const status = searchParams.get('status')
    
    const offset = (page - 1) * limit
    
    let query = supabase
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
          billing_period,
          features:pricing_features(*)
        )
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
    
    if (salonId) {
      query = query.eq('salon_id', salonId)
    }
    
    if (status) {
      query = query.eq('status', status)
    }
    
    const { data, error, count } = await query
    
    if (error) throw error
    
    return NextResponse.json({
      subscriptions: data,
      total: count,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    })
  } catch (error) {
    console.error('Error fetching subscriptions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subscriptions' },
      { status: 500 }
    )
  }
}

// POST /api/admin/subscriptions - Create new subscription
export async function POST(request: NextRequest) {
  try {
    const session = await verifyApiSession(request)
    if (!session || session.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { salon_id, plan_id, status, amount } = body
    
    if (!salon_id || !plan_id) {
      return NextResponse.json(
        { error: 'Salon and plan are required' },
        { status: 400 }
      )
    }
    
    const supabase = await createClient()
    
    // Check if salon already has an active subscription
    const { data: existingSubscription } = await supabase
      .from('platform_subscriptions')
      .select('id')
      .eq('salon_id', salon_id)
      .eq('status', 'active')
      .single()
    
    if (existingSubscription) {
      return NextResponse.json(
        { error: 'Salon already has an active subscription' },
        { status: 400 }
      )
    }
    
    // Get plan details
    const { data: plan } = await supabase
      .from('pricing_plans')
      .select('*')
      .eq('id', plan_id)
      .single()
    
    if (!plan) {
      return NextResponse.json(
        { error: 'Invalid plan selected' },
        { status: 400 }
      )
    }
    
    // Calculate billing period dates
    const now = new Date()
    const periodEnd = new Date(now)
    
    if (plan.billing_period === 'monthly') {
      periodEnd.setMonth(periodEnd.getMonth() + 1)
    } else if (plan.billing_period === 'yearly') {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1)
    }
    
    // Create the subscription
    const { data: subscription, error: subscriptionError } = await supabase
      .from('platform_subscriptions')
      .insert({
        salon_id,
        plan_id,
        status: status || 'active',
        current_period_start: now.toISOString().split('T')[0],
        current_period_end: periodEnd.toISOString().split('T')[0],
        cancel_at_period_end: false,
        amount: amount || plan.price
      })
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
    
    if (subscriptionError) throw subscriptionError
    
    await logAuditEvent({
      action: 'create',
      entity_type: 'subscription',
      entity_id: subscription.id,
      details: { 
        salon_id,
        plan_id,
        plan_name: plan.name,
        amount: subscription.amount,
        created_by: session.user.email
      }
    })
    
    return NextResponse.json({ subscription })
  } catch (error) {
    console.error('Error creating subscription:', error)
    return NextResponse.json(
      { error: 'Failed to create subscription' },
      { status: 500 }
    )
  }
}