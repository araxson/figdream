import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyApiSession } from '@/lib/api/auth-utils'

interface Params {
  params: {
    id: string
  }
}

// GET /api/admin/services/[id] - Get single service
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const session = await verifyApiSession(request)
    if (!session || session.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createClient()
    
    const { data: service, error } = await supabase
      .from('services')
      .select(`
        *,
        salon:salons(id, name),
        category:service_categories(id, name),
        appointments:appointments!appointments_service_id_fkey (
          id,
          start_time,
          status
        )
      `)
      .eq('id', params.id)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Service not found' }, { status: 404 })
      }
      throw error
    }
    
    return NextResponse.json({ service })
  } catch (error) {
    console.error('Error fetching service:', error)
    return NextResponse.json(
      { error: 'Failed to fetch service' },
      { status: 500 }
    )
  }
}

// PATCH /api/admin/services/[id] - Update service
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const session = await verifyApiSession(request)
    if (!session || session.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const supabase = await createClient()
    
    // Get current service data for audit log
    const { data: oldService } = await supabase
      .from('services')
      .select('*')
      .eq('id', params.id)
      .single()
    
    // If name is being updated, regenerate slug
    let updates = { ...body }
    if (body.name && body.name !== oldService?.name) {
      updates.slug = body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    }
    
    // Update service
    const { data: updatedService, error: updateError } = await supabase
      .from('services')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select(`
        *,
        salon:salons(id, name),
        category:service_categories(id, name)
      `)
      .single()
    
    if (updateError) {
      if (updateError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Service not found' }, { status: 404 })
      }
      throw updateError
    }
    
    // Create audit log
    await supabase.from('audit_logs').insert({
      user_id: session.user.id,
      action: 'UPDATE',
      entity_type: 'service',
      entity_id: params.id,
      old_data: oldService,
      new_data: updatedService
    })
    
    return NextResponse.json({ service: updatedService })
  } catch (error) {
    console.error('Error updating service:', error)
    return NextResponse.json(
      { error: 'Failed to update service' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/services/[id] - Delete service
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const session = await verifyApiSession(request)
    if (!session || session.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createClient()
    
    // Get service data for audit log
    const { data: serviceToDelete } = await supabase
      .from('services')
      .select('*')
      .eq('id', params.id)
      .single()
    
    if (!serviceToDelete) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }
    
    // Check if service has appointments
    const { count: appointmentCount } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('service_id', params.id)
    
    if (appointmentCount && appointmentCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete service with existing appointments. Please deactivate it instead.' },
        { status: 400 }
      )
    }
    
    // Delete service
    const { error: deleteError } = await supabase
      .from('services')
      .delete()
      .eq('id', params.id)
    
    if (deleteError) {
      throw deleteError
    }
    
    // Create audit log
    await supabase.from('audit_logs').insert({
      user_id: session.user.id,
      action: 'DELETE',
      entity_type: 'service',
      entity_id: params.id,
      old_data: serviceToDelete
    })
    
    return NextResponse.json({ success: true, message: 'Service deleted successfully' })
  } catch (error) {
    console.error('Error deleting service:', error)
    return NextResponse.json(
      { error: 'Failed to delete service' },
      { status: 500 }
    )
  }
}