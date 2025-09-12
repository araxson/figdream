import { createClient } from '@/lib/supabase/server'
import { verifySession } from '@/lib/api/dal/auth'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const session = await verifySession()
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const supabase = await createClient()
    
    // Get current user's staff profile
    const { data: staffProfile } = await supabase
      .from('staff_profiles')
      .select('id, salon_id')
      .eq('user_id', session.user.id)
      .single()

    if (!staffProfile) {
      return NextResponse.json(
        { error: 'Staff profile not found' },
        { status: 404 }
      )
    }

    // Calculate tip statistics
    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - weekStart.getDay())
    const monthStart = new Date()
    monthStart.setDate(1)

    // Get staff earnings for tips
    const { data: earnings } = await supabase
      .from('staff_earnings')
      .select('tip_amount, created_at, customer_name')
      .eq('staff_id', session.user.id)
      .not('tip_amount', 'is', null)
      .gt('tip_amount', 0)

    const today = new Date().toDateString()
    const thisWeek = earnings?.filter(e => new Date(e.created_at) >= weekStart) || []
    const thisMonth = earnings?.filter(e => new Date(e.created_at) >= monthStart) || []
    const todayEarnings = earnings?.filter(e => new Date(e.created_at).toDateString() === today) || []

    const todayTips = todayEarnings.reduce((sum, e) => sum + (e.tip_amount || 0), 0)
    const weeklyTips = thisWeek.reduce((sum, e) => sum + (e.tip_amount || 0), 0)
    const monthlyTips = thisMonth.reduce((sum, e) => sum + (e.tip_amount || 0), 0)
    const averageTip = earnings?.length 
      ? earnings.reduce((sum, e) => sum + (e.tip_amount || 0), 0) / earnings.length
      : 0

    // Get appointment counts
    const { data: appointments } = await supabase
      .from('appointments')
      .select('id, status, customer_id, created_at')
      .eq('staff_id', staffProfile.id)

    const todayAppointments = appointments?.filter(apt => 
      new Date(apt.created_at).toDateString() === today
    ) || []

    const uniqueCustomers = new Set(appointments?.map(apt => apt.customer_id) || [])
    const tippingCustomers = new Set(earnings?.map(e => e.customer_name).filter(Boolean) || [])

    const stats = {
      todayTips,
      weeklyTips,
      monthlyTips,
      averageTip,
      tippingCustomers: tippingCustomers.size,
      totalCustomers: uniqueCustomers.size,
      todayAppointments: todayAppointments.length
    }

    return NextResponse.json({ stats })
  } catch (error) {
    console.error('Staff overview API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch overview data' },
      { status: 500 }
    )
  }
}