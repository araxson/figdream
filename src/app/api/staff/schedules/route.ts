import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Get the authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get salon ID
    const { data: salon } = await supabase
      .from('salons')
      .select('id')
      .eq('created_by', user.id)
      .single()

    if (!salon) {
      return NextResponse.json({ error: 'Salon not found' }, { status: 404 })
    }

    // Fetch staff with profiles
    const { data: staffData, error: staffError } = await supabase
      .from('staff_profiles')
      .select(`
        *,
        profiles(*)
      `)
      .eq('salon_id', salon.id)
      .eq('is_active', true)

    if (staffError) {
      console.error('Staff fetch error:', staffError)
      return NextResponse.json({ error: 'Failed to fetch staff' }, { status: 500 })
    }

    // Fetch schedules
    const { data: scheduleData, error: scheduleError } = await supabase
      .from('staff_schedules')
      .select('*')
      .eq('salon_id', salon.id)

    if (scheduleError) {
      console.error('Schedule fetch error:', scheduleError)
      return NextResponse.json({ error: 'Failed to fetch schedules' }, { status: 500 })
    }

    return NextResponse.json({ 
      staff: staffData || [], 
      schedules: scheduleData || [] 
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
    const { staff_id, day_of_week, start_time, end_time, salon_id } = body

    // Validate required fields
    if (!staff_id || day_of_week === undefined || !start_time || !end_time || !salon_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Insert or update schedule
    const { data, error } = await supabase
      .from('staff_schedules')
      .upsert({
        staff_id,
        salon_id,
        day_of_week,
        start_time,
        end_time,
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Schedule upsert error:', error)
      return NextResponse.json({ error: 'Failed to save schedule' }, { status: 500 })
    }

    return NextResponse.json({ schedule: data })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get the authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(request.url)
    const scheduleId = url.searchParams.get('id')

    if (!scheduleId) {
      return NextResponse.json({ error: 'Schedule ID required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('staff_schedules')
      .delete()
      .eq('id', scheduleId)

    if (error) {
      console.error('Schedule delete error:', error)
      return NextResponse.json({ error: 'Failed to delete schedule' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}