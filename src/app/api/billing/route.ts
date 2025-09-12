import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get the authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(request.url)
    const salonId = url.searchParams.get('salon_id')
    const startDate = url.searchParams.get('start_date')
    const endDate = url.searchParams.get('end_date')
    const limit = parseInt(url.searchParams.get('limit') || '100')

    if (!salonId) {
      return NextResponse.json({ error: 'Salon ID required' }, { status: 400 })
    }

    // Fetch revenue summary with appointment details
    let query = supabase
      .from('revenue_summary')
      .select(`
        appointment_id,
        appointment_date,
        total_amount,
        tip_amount,
        total_revenue,
        payment_collected,
        payment_method,
        is_walk_in,
        appointments!inner(
          customers(first_name, last_name),
          staff_profiles(
            profiles(first_name, last_name)
          ),
          appointment_services(
            services(name, price)
          )
        )
      `)
      .eq('salon_id', salonId)
      .order('appointment_date', { ascending: false })
      .limit(limit)

    // Add date filters if provided
    if (startDate) {
      query = query.gte('appointment_date', startDate)
    }
    if (endDate) {
      query = query.lte('appointment_date', endDate)
    }

    const { data, error } = await query

    if (error) {
      console.error('Revenue fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch revenue data' }, { status: 500 })
    }

    // Also fetch summary statistics
    const { data: summaryData, error: summaryError } = await supabase
      .from('revenue_summary')
      .select('total_amount, tip_amount, total_revenue, payment_collected')
      .eq('salon_id', salonId)

    if (summaryError) {
      console.error('Summary fetch error:', summaryError)
    }

    // Calculate summary stats
    const totalRevenue = summaryData?.reduce((sum, item) => sum + (item.total_revenue || 0), 0) || 0
    const totalPayments = summaryData?.reduce((sum, item) => sum + (item.total_amount || 0), 0) || 0
    const totalTips = summaryData?.reduce((sum, item) => sum + (item.tip_amount || 0), 0) || 0
    const collectedCount = summaryData?.filter(item => item.payment_collected).length || 0
    const pendingCount = summaryData?.filter(item => !item.payment_collected).length || 0

    return NextResponse.json({ 
      revenues: data || [],
      summary: {
        total_revenue: totalRevenue,
        total_payments: totalPayments,
        total_tips: totalTips,
        collected_count: collectedCount,
        pending_count: pendingCount
      }
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get the authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { appointment_id, payment_method, total_amount, tip_amount } = body

    // Validate required fields
    if (!appointment_id || !payment_method) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Update the payment status in the revenue_summary table
    const { data, error } = await supabase
      .from('revenue_summary')
      .update({
        payment_collected: true,
        payment_method,
        total_amount: total_amount || 0,
        tip_amount: tip_amount || 0,
        total_revenue: (total_amount || 0) + (tip_amount || 0),
        updated_at: new Date().toISOString()
      })
      .eq('appointment_id', appointment_id)
      .select()
      .single()

    if (error) {
      console.error('Payment update error:', error)
      return NextResponse.json({ error: 'Failed to update payment' }, { status: 500 })
    }

    return NextResponse.json({ revenue: data })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}