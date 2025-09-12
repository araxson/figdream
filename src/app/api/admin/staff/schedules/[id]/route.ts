import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyApiSession } from '@/lib/api/auth-utils'
import { logAuditEvent } from '@/lib/actions/audit-logs'

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { user } = await verifyApiSession(request)
    if (!user || !['salon_owner', 'salon_manager'].includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createClient()
    const data = await request.json()

    // Get the schedule to verify ownership
    const { data: existingSchedule } = await supabase
      .from('staff_schedules')
      .select(`
        *,
        staff:staff_members(salon_id)
      `)
      .eq('id', params.id)
      .single()

    if (!existingSchedule) {
      return NextResponse.json({ error: 'Schedule not found' }, { status: 404 })
    }

    // Check if user has access to this salon
    const { data: userSalon } = await supabase
      .from('salons')
      .select('id')
      .eq('id', existingSchedule.staff.salon_id)
      .eq('owner_id', user.id)
      .single()

    if (!userSalon && user.role !== 'salon_manager') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Update the schedule
    const { data: schedule, error } = await supabase
      .from('staff_schedules')
      .update({
        staff_id: data.staff_id || existingSchedule.staff_id,
        date: data.date || existingSchedule.date,
        start_time: data.start_time || existingSchedule.start_time,
        end_time: data.end_time || existingSchedule.end_time,
        break_start_time: data.break_start_time !== undefined ? data.break_start_time : existingSchedule.break_start_time,
        break_end_time: data.break_end_time !== undefined ? data.break_end_time : existingSchedule.break_end_time,
        is_available: data.is_available !== undefined ? data.is_available : existingSchedule.is_available,
        notes: data.notes !== undefined ? data.notes : existingSchedule.notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating schedule:', error)
      return NextResponse.json({ error: 'Failed to update schedule' }, { status: 500 })
    }

    await logAuditEvent({
      action: 'update',
      entity_type: 'staff_schedule',
      entity_id: params.id,
      details: { 
        old: existingSchedule,
        new: schedule 
      }
    })

    return NextResponse.json(schedule)
  } catch (error) {
    console.error('Error in PATCH /api/admin/staff/schedules/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { user } = await verifyApiSession(request)
    if (!user || !['salon_owner', 'salon_manager'].includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createClient()

    // Get the schedule to verify ownership
    const { data: existingSchedule } = await supabase
      .from('staff_schedules')
      .select(`
        *,
        staff:staff_members(salon_id)
      `)
      .eq('id', params.id)
      .single()

    if (!existingSchedule) {
      return NextResponse.json({ error: 'Schedule not found' }, { status: 404 })
    }

    // Check if user has access to this salon
    const { data: userSalon } = await supabase
      .from('salons')
      .select('id')
      .eq('id', existingSchedule.staff.salon_id)
      .eq('owner_id', user.id)
      .single()

    if (!userSalon && user.role !== 'salon_manager') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Delete the schedule
    const { error } = await supabase
      .from('staff_schedules')
      .delete()
      .eq('id', params.id)

    if (error) {
      console.error('Error deleting schedule:', error)
      return NextResponse.json({ error: 'Failed to delete schedule' }, { status: 500 })
    }

    await logAuditEvent({
      action: 'delete',
      entity_type: 'staff_schedule',
      entity_id: params.id,
      details: { schedule: existingSchedule }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/admin/staff/schedules/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}