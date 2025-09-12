import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get revenue data from appointments
    const { data: revenue, error: revenueError } = await supabase
      .from('appointments')
      .select(`
        id,
        appointment_date,
        computed_total_price,
        status,
        services (
          id,
          name,
          price
        ),
        customers (
          id,
          full_name
        ),
        staff (
          id,
          full_name
        )
      `)
      .eq('status', 'completed')
      .not('computed_total_price', 'is', null)
      .order('appointment_date', { ascending: false })

    if (revenueError) {
      console.error('Revenue fetch error:', revenueError)
      return NextResponse.json({ error: 'Failed to fetch revenue data' }, { status: 500 })
    }

    // Calculate summary metrics
    const totalRevenue = revenue?.reduce((sum, appointment) => sum + (appointment.computed_total_price || 0), 0) || 0
    const totalAppointments = revenue?.length || 0
    const averageRevenue = totalAppointments > 0 ? totalRevenue / totalAppointments : 0

    // Group by date for trends
    const revenueByDate = revenue?.reduce((acc, appointment) => {
      const date = new Date(appointment.appointment_date).toISOString().split('T')[0]
      acc[date] = (acc[date] || 0) + (appointment.computed_total_price || 0)
      return acc
    }, {} as Record<string, number>) || {}

    return NextResponse.json({
      success: true,
      data: {
        revenue,
        summary: {
          totalRevenue,
          totalAppointments,
          averageRevenue
        },
        revenueByDate
      }
    })
  } catch (error) {
    console.error('Revenue API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { appointmentId, amount, description } = body

    // Update appointment total amount
    const { data, error } = await supabase
      .from('appointments')
      .update({ 
        computed_total_price: amount,
        notes: description ? `Revenue updated: ${description}` : undefined
      })
      .eq('id', appointmentId)
      .select()

    if (error) {
      console.error('Revenue update error:', error)
      return NextResponse.json({ error: 'Failed to update revenue' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data
    })
  } catch (error) {
    console.error('Revenue update API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}