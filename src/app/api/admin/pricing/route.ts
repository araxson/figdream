import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyApiSession } from '@/lib/api/auth-utils'
import { logAuditEvent } from '@/lib/actions/audit-logs'

// GET /api/admin/pricing - List all pricing plans
export async function GET(request: NextRequest) {
  try {
    const session = await verifyApiSession(request)
    if (!session || session.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const isActive = searchParams.get('is_active')
    const billingPeriod = searchParams.get('billing_period')
    
    const offset = (page - 1) * limit
    
    let query = supabase
      .from('pricing_plans')
      .select(`
        *,
        features:pricing_features(*),
        subscriptions:platform_subscriptions(id)
      `, { count: 'exact' })
      .order('display_order', { ascending: true })
      .range(offset, offset + limit - 1)
    
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    }
    
    if (isActive !== null && isActive !== '') {
      query = query.eq('is_active', isActive === 'true')
    }
    
    if (billingPeriod) {
      query = query.eq('billing_period', billingPeriod)
    }
    
    const { data, error, count } = await query
    
    if (error) throw error
    
    // Transform data to include subscription counts
    const plansWithCounts = data?.map(plan => ({
      ...plan,
      subscriptionCount: plan.subscriptions?.length || 0,
      subscriptions: undefined // Remove raw subscription data
    }))
    
    return NextResponse.json({
      plans: plansWithCounts,
      total: count,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    })
  } catch (error) {
    console.error('Error fetching pricing plans:', error)
    return NextResponse.json(
      { error: 'Failed to fetch pricing plans' },
      { status: 500 }
    )
  }
}

// POST /api/admin/pricing - Create new pricing plan
export async function POST(request: NextRequest) {
  try {
    const session = await verifyApiSession(request)
    if (!session || session.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, price, billing_period, features, is_active, is_featured, display_order } = body
    
    if (!name || price === undefined || !billing_period) {
      return NextResponse.json(
        { error: 'Name, price, and billing period are required' },
        { status: 400 }
      )
    }
    
    const supabase = await createClient()
    
    // Start a transaction by creating the plan first
    const { data: plan, error: planError } = await supabase
      .from('pricing_plans')
      .insert({
        name,
        description,
        price,
        billing_period,
        is_active: is_active ?? true,
        is_featured: is_featured ?? false,
        display_order: display_order ?? 0
      })
      .select()
      .single()
    
    if (planError) throw planError
    
    // Add features if provided
    if (features && features.length > 0) {
      const featuresToInsert = features.map((feature: any, index: number) => ({
        plan_id: plan.id,
        feature_name: feature.name,
        feature_value: feature.value,
        display_order: index
      }))
      
      const { error: featuresError } = await supabase
        .from('pricing_features')
        .insert(featuresToInsert)
      
      if (featuresError) {
        // Rollback by deleting the plan
        await supabase.from('pricing_plans').delete().eq('id', plan.id)
        throw featuresError
      }
    }
    
    // Get the complete plan with features
    const { data: completePlan } = await supabase
      .from('pricing_plans')
      .select(`
        *,
        features:pricing_features(*)
      `)
      .eq('id', plan.id)
      .single()
    
    await logAuditEvent({
      action: 'create',
      entity_type: 'pricing_plan',
      entity_id: plan.id,
      details: { 
        plan_name: name,
        price,
        billing_period,
        created_by: session.user.email
      }
    })
    
    return NextResponse.json({ plan: completePlan })
  } catch (error) {
    console.error('Error creating pricing plan:', error)
    return NextResponse.json(
      { error: 'Failed to create pricing plan' },
      { status: 500 }
    )
  }
}