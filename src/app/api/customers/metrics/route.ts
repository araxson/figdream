import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()

    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get salon owned by the user
    const { data: salon, error: salonError } = await supabase
      .from('salons')
      .select('id')
      .eq('created_by', user.id)
      .single()

    if (salonError || !salon) {
      return NextResponse.json({ error: 'Salon not found' }, { status: 404 })
    }

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate())

    // Fetch all required data in parallel
    const [
      allAppointmentsRes,
      newCustomerAppointmentsRes,
      activeCustomersRes,
      completedAppointmentsRes,
      reviewsRes
    ] = await Promise.all([
      // Total customers (unique customers who have appointments)
      supabase
        .from('appointments')
        .select('customer_id')
        .eq('salon_id', salon.id),
      
      // New customers this month
      supabase
        .from('appointments')
        .select('customer_id')
        .eq('salon_id', salon.id)
        .gte('created_at', startOfMonth.toISOString()),
      
      // Active customers (visited in last 3 months)
      supabase
        .from('appointments')
        .select('customer_id')
        .eq('salon_id', salon.id)
        .gte('appointment_date', threeMonthsAgo.toISOString())
        .eq('status', 'completed'),
      
      // Completed appointments for lifetime value
      supabase
        .from('appointments')
        .select('computed_total_price, customer_id')
        .eq('salon_id', salon.id)
        .eq('status', 'completed'),
      
      // Reviews for average rating
      supabase
        .from('reviews')
        .select('rating')
        .eq('salon_id', salon.id)
    ])

    // Calculate metrics
    const uniqueCustomers = new Set(allAppointmentsRes.data?.map(a => a.customer_id) || [])
    const totalCustomers = uniqueCustomers.size

    const uniqueNewCustomers = new Set(newCustomerAppointmentsRes.data?.map(a => a.customer_id) || [])
    const newThisMonth = uniqueNewCustomers.size

    const uniqueActiveCustomers = new Set(activeCustomersRes.data?.map(a => a.customer_id) || [])
    const activeCustomers = uniqueActiveCustomers.size

    // Calculate average lifetime value
    const customerTotals = completedAppointmentsRes.data?.reduce((acc, appointment) => {
      if (appointment.customer_id) {
        acc[appointment.customer_id] = (acc[appointment.customer_id] || 0) + (appointment.computed_total_price || 0)
      }
      return acc
    }, {} as Record<string, number>) || {}

    const averageLifetimeValue = Object.values(customerTotals).length > 0
      ? Object.values(customerTotals).reduce((sum, val) => sum + val, 0) / Object.values(customerTotals).length
      : 0

    // Calculate retention rate
    const retentionRate = totalCustomers ? (activeCustomers / totalCustomers) * 100 : 0

    // Calculate average rating
    const averageRating = reviewsRes.data?.length
      ? reviewsRes.data.reduce((sum, r) => sum + r.rating, 0) / reviewsRes.data.length
      : 0

    const metrics = {
      totalCustomers,
      newThisMonth,
      activeCustomers,
      averageLifetimeValue,
      retentionRate,
      averageRating
    }

    return NextResponse.json({ metrics })

  } catch (error) {
    console.error('Error fetching customer metrics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch customer metrics' },
      { status: 500 }
    )
  }
}