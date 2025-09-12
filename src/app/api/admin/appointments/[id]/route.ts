import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyApiSession } from '@/lib/api/auth-utils'

interface Params {
  params: Promise<{
    id: string
  }>
}

// PATCH /api/admin/appointments/[id] - Update appointment
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const session = await verifyApiSession(request)
    if (!session || session.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const supabase = await createClient()
    
    // Get current appointment data for audit log
    const { data: oldAppointment } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', id)
      .single()
    
    if (!oldAppointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
    }
    
    // Update appointment
    const { data: updatedAppointment, error: updateError } = await supabase
      .from('appointments')
      .update({
        ...body,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select(`
        *,
        customer:profiles!appointments_customer_id_fkey(id, full_name, email, phone),
        staff:staff_profiles!appointments_staff_id_fkey(id, user_id),
        service:services!appointments_service_id_fkey(id, name, duration_minutes, price),
        salon:salons!appointments_salon_id_fkey(id, name, address)
      `)
      .single()
    
    if (updateError) {
      throw updateError
    }
    
    // Create audit log
    await supabase.from('audit_logs').insert({
      user_id: session.user.id,
      action: 'UPDATE',
      entity_type: 'appointment',
      entity_id: id,
      old_data: oldAppointment,
      new_data: updatedAppointment
    })
    
    // If status changed to cancelled, create notification
    if (body.status === 'cancelled' && oldAppointment.status !== 'cancelled') {
      await supabase.from('notifications').insert({
        user_id: oldAppointment.customer_id,
        type: 'appointment_cancelled',
        title: 'Appointment Cancelled',
        message: 'Your appointment has been cancelled by the administrator.',
        metadata: { appointment_id: params.id }
      })
    }
    
    return NextResponse.json({ appointment: updatedAppointment })
  } catch (error) {
    console.error('Error updating appointment:', error)
    return NextResponse.json(
      { error: 'Failed to update appointment' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/appointments/[id] - Delete appointment
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const session = await verifyApiSession(request)
    if (!session || session.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const supabase = await createClient()
    
    // Get appointment data for audit log
    const { data: appointmentToDelete } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', id)
      .single()
    
    if (!appointmentToDelete) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
    }
    
    // Delete appointment
    const { error: deleteError } = await supabase
      .from('appointments')
      .delete()
      .eq('id', id)
    
    if (deleteError) {
      throw deleteError
    }
    
    // Create audit log
    await supabase.from('audit_logs').insert({
      user_id: session.user.id,
      action: 'DELETE',
      entity_type: 'appointment',
      entity_id: id,
      old_data: appointmentToDelete
    })
    
    return NextResponse.json({ success: true, message: 'Appointment deleted successfully' })
  } catch (error) {
    console.error('Error deleting appointment:', error)
    return NextResponse.json(
      { error: 'Failed to delete appointment' },
      { status: 500 }
    )
  }
}