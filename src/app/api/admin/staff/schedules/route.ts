import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyApiSession } from '@/lib/api/auth-utils'
import { logAuditEvent } from '@/lib/actions/audit-logs'

export async function POST(request: Request) {
  try {
    const { user } = await verifyApiSession(request)
    if (!user || !['salon_owner', 'salon_manager'].includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createClient()
    const data = await request.json()

    // Verify the staff member belongs to the user's salon
    const { data: staffMember } = await supabase
      .from('staff_members')
      .select('salon_id')
      .eq('id', data.staff_id)
      .single()

    if (!staffMember) {
      return NextResponse.json({ error: 'Staff member not found' }, { status: 404 })
    }

    // Check if user has access to this salon
    const { data: userSalon } = await supabase
      .from('salons')
      .select('id')
      .eq('id', staffMember.salon_id)
      .eq('owner_id', user.id)
      .single()

    if (!userSalon && user.role !== 'salon_manager') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Create the schedule
    const { data: schedule, error } = await supabase
      .from('staff_schedules')
      .insert([{
        staff_id: data.staff_id,
        date: data.date,
        start_time: data.start_time,
        end_time: data.end_time,
        break_start_time: data.break_start_time || null,
        break_end_time: data.break_end_time || null,
        is_available: data.is_available ?? true,
        notes: data.notes || null,
        created_by: user.id
      }])
      .select()
      .single()

    if (error) {
      console.error('Error creating schedule:', error)
      return NextResponse.json({ error: 'Failed to create schedule' }, { status: 500 })
    }

    await logAuditEvent({
      action: 'create',
      entity_type: 'staff_schedule',
      entity_id: schedule.id,
      details: { schedule }
    })

    return NextResponse.json(schedule)
  } catch (error) {
    console.error('Error in POST /api/admin/staff/schedules:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const { user } = await verifyApiSession(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const staffId = searchParams.get('staff_id')
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')

    let query = supabase
      .from('staff_schedules')
      .select(`
        *,
        staff:staff_members(
          id,
          first_name,
          last_name,
          email,
          position,
          salon:salons(id, name)
        )
      `)

    // Filter by user's salon(s)
    if (user.role === 'salon_owner') {
      const { data: salons } = await supabase
        .from('salons')
        .select('id')
        .eq('owner_id', user.id)
      
      const salonIds = salons?.map(s => s.id) || []
      
      const { data: staffIds } = await supabase
        .from('staff_members')
        .select('id')
        .in('salon_id', salonIds)
      
      const staffMemberIds = staffIds?.map(s => s.id) || []
      query = query.in('staff_id', staffMemberIds)
    }

    if (staffId) {
      query = query.eq('staff_id', staffId)
    }

    if (startDate) {
      query = query.gte('date', startDate)
    }

    if (endDate) {
      query = query.lte('date', endDate)
    }

    const { data: schedules, error } = await query
      .order('date', { ascending: true })
      .order('start_time', { ascending: true })

    if (error) {
      console.error('Error fetching schedules:', error)
      return NextResponse.json({ error: 'Failed to fetch schedules' }, { status: 500 })
    }

    return NextResponse.json(schedules)
  } catch (error) {
    console.error('Error in GET /api/admin/staff/schedules:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}