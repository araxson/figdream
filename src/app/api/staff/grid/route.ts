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

    const today = new Date().toISOString().split('T')[0]

    // Get staff with their profiles and today's appointment count
    const { data: staffData, error } = await supabase
      .from('staff_profiles')
      .select(`
        *,
        profiles!staff_profiles_user_id_fkey(*),
        appointments:appointments(id)
      `)
      .eq('salon_id', salon.id)
      .eq('appointments.appointment_date', today)

    if (error) {
      console.error('Error fetching staff:', error)
      return NextResponse.json(
        { error: 'Failed to fetch staff data' },
        { status: 500 }
      )
    }

    return NextResponse.json({ staff: staffData || [] })
  } catch (error) {
    console.error('Staff grid API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}