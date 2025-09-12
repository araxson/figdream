import { createClient } from '@/lib/supabase/server'
import { verifySession } from '@/lib/api/dal/auth'
import { NextResponse } from 'next/server'
import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/types/database.types'

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
    const date = searchParams.get('date')
    const staffId = searchParams.get('staffId') // For staff calendar view
    
    if (!date) {
      return NextResponse.json(
        { error: 'Date parameter is required' },
        { status: 400 }
      )
    }
    
    const supabase = await createClient()
    
    // Get user's salon first
    const { data: salon } = await supabase
      .from('salons')
      .select('id')
      .eq('created_by', session.user.id)
      .single()

    if (!salon && !staffId) {
      // If no salon and no specific staff ID, might be a staff member
      // Check if user is a staff member
      const { data: staffProfile } = await supabase
        .from('staff_profiles')
        .select('salon_id')
        .eq('profile_id', session.user.id)
        .single()
      
      if (staffProfile) {
        return getStaffAppointments(supabase, session.user.id, date)
      }
      
      return NextResponse.json(
        { error: 'No salon found for user' },
        { status: 404 }
      )
    }
    
    let query = supabase
      .from('appointments')
      .select(`
        *,
        customers(*),
        appointment_services(
          services(*)
        ),
        staff_profiles(
          profiles(*)
        )
      `)
      .eq('appointment_date', date)
      .order('start_time')
    
    // Filter by salon or staff
    if (staffId) {
      query = query.eq('staff_id', staffId)
    } else if (salon) {
      query = query.eq('salon_id', salon.id)
    }
    
    const { data, error } = await query
    
    if (error) {
      console.error('Error fetching appointments by date:', error)
      return NextResponse.json(
        { error: 'Failed to fetch appointments' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ appointments: data || [] })
  } catch (error) {
    console.error('Get appointments by date error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch appointments' },
      { status: 500 }
    )
  }
}

async function getStaffAppointments(supabase: SupabaseClient<Database>, staffId: string, date: string) {
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('staff_id', staffId)
    .eq('appointment_date', date)
    .order('start_time')

  if (error) {
    console.error('Error fetching staff appointments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch appointments' },
      { status: 500 }
    )
  }

  return NextResponse.json({ appointments: data || [] })
}