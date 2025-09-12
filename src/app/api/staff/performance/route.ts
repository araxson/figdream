import { createClient } from '@/lib/supabase/server'
import { verifySession } from '@/lib/api/dal/auth'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const session = await verifySession()
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const { searchParams } = new URL(request.url)
    const _dateRange = searchParams.get('dateRange') || 'month'
    
    const supabase = await createClient()
    
    // Get salon owned by user
    const { data: salon } = await supabase
      .from('salons')
      .select('id')
      .eq('created_by', session.user.id)
      .single()

    if (!salon) {
      return NextResponse.json(
        { error: 'Salon not found' },
        { status: 404 }
      )
    }

    // Fetch staff
    const { data: staffData } = await supabase
      .from('staff_profiles')
      .select(`
        *,
        profiles(*)
      `)
      .eq('salon_id', salon.id)
      .eq('is_active', true)

    if (!staffData) {
      return NextResponse.json({ performances: [] })
    }

    // Calculate performance metrics for each staff member
    const performanceData = await Promise.all(staffData.map(async (staff) => {
      // Get appointments
      const { data: appointments } = await supabase
        .from('appointments')
        .select('*, payments(*)')
        .eq('staff_id', staff.id)
        .eq('status', 'completed')

      // Calculate total revenue
      const totalRevenue = appointments?.reduce((sum, apt) => 
        sum + (apt.computed_total_price || 0), 0) || 0

      // Get reviews
      const { data: reviews } = await supabase
        .from('reviews')
        .select('rating')
        .eq('staff_id', staff.id)

      const averageRating = reviews?.length 
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0

      // Calculate utilization rate (simulated for now)
      const utilizationRate = 65 + Math.random() * 30

      // Calculate client retention (simulated for now)
      const clientRetention = 70 + Math.random() * 25

      return {
        staff,
        totalRevenue,
        appointmentCount: appointments?.length || 0,
        averageRating,
        utilizationRate,
        clientRetention
      }
    }))

    const sortedPerformances = performanceData.sort((a, b) => b.totalRevenue - a.totalRevenue)

    return NextResponse.json({ performances: sortedPerformances })
  } catch (error) {
    console.error('Staff performance API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch performance data' },
      { status: 500 }
    )
  }
}