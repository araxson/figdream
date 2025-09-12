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
    const view = searchParams.get('view') || 'all' // today, upcoming, past, requests, all
    const customerId = searchParams.get('customerId')
    const staffId = searchParams.get('staffId')
    const salonId = searchParams.get('salonId')
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')
    
    const supabase = await createClient()
    
    let query = supabase
      .from('appointments')
      .select(`
        *,
        customer:profiles!appointments_customer_id_fkey(id, full_name, email, avatar_url),
        salon:salons(id, name, address),
        service:services(id, name, price, duration_minutes),
        staff:profiles!appointments_staff_id_fkey(id, full_name, avatar_url)
      `)
    
    // Filter by customer
    if (customerId) {
      query = query.eq('customer_id', customerId)
    } else if (session.user.role === 'customer' && view !== 'staff') {
      // Default to current user's appointments for customers
      query = query.eq('customer_id', session.user.id)
    }
    
    // Filter by staff
    if (staffId) {
      query = query.eq('staff_id', staffId)
    } else if (session.user.role === 'staff' && !customerId) {
      // Default to current staff's appointments
      query = query.eq('staff_id', session.user.id)
    }
    
    // Filter by salon
    if (salonId) {
      query = query.eq('salon_id', salonId)
    }
    
    // Filter by status
    if (status) {
      query = query.eq('status', status as 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show')
    } else if (view === 'requests') {
      query = query.eq('status', 'pending')
    }
    
    // Filter by date range based on view
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    switch (view) {
      case 'today':
        query = query
          .gte('appointment_date', today.toISOString().split('T')[0])
          .lt('appointment_date', tomorrow.toISOString().split('T')[0])
        break
      
      case 'upcoming':
        query = query
          .gte('appointment_date', today.toISOString().split('T')[0])
          .in('status', ['confirmed', 'pending'])
        break
      
      case 'past':
        query = query
          .lt('appointment_date', today.toISOString().split('T')[0])
        break
      
      case 'requests':
        query = query
          .eq('status', 'pending')
          .gte('appointment_date', today.toISOString().split('T')[0])
        break
    }
    
    // Apply ordering and limit
    query = query
      .order('appointment_date', { ascending: view === 'upcoming' })
      .order('start_time', { ascending: true })
      .limit(limit)
    
    const { data, error } = await query
    
    if (error) {
      console.error('Error fetching appointments:', error)
      return NextResponse.json(
        { error: 'Failed to fetch appointments' },
        { status: 500 }
      )
    }
    
    // Transform the data to ensure consistent structure
    const appointments = (data || []).map(apt => ({
      ...apt,
      // Ensure all nested objects exist
      customer: apt.customer || null,
      salon: apt.salon || null,
      service: apt.service || null,
      staff: apt.staff || null
    }))
    
    return NextResponse.json({ appointments })
  } catch (error) {
    console.error('Get appointments list error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch appointments' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await verifySession()
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const { appointmentId, status, notes }: { 
      appointmentId: string; 
      status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'; 
      notes?: string 
    } = await request.json()
    
    if (!appointmentId || !status) {
      return NextResponse.json(
        { error: 'Appointment ID and status are required' },
        { status: 400 }
      )
    }
    
    const supabase = await createClient()
    
    const updateData: Record<string, string> = { status }
    if (notes !== undefined) updateData.notes = notes
    if (status === 'cancelled') {
      updateData.cancelled_at = new Date().toISOString()
    }
    
    const { error } = await supabase
      .from('appointments')
      .update(updateData)
      .eq('id', appointmentId)
    
    if (error) {
      console.error('Error updating appointment:', error)
      return NextResponse.json(
        { error: 'Failed to update appointment' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Update appointment error:', error)
    return NextResponse.json(
      { error: 'Failed to update appointment' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await verifySession()
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const { searchParams } = new URL(request.url)
    const appointmentId = searchParams.get('id')
    
    if (!appointmentId) {
      return NextResponse.json(
        { error: 'Appointment ID is required' },
        { status: 400 }
      )
    }
    
    const supabase = await createClient()
    
    // Check if user has permission to delete this appointment
    const { data: appointment, error: fetchError } = await supabase
      .from('appointments')
      .select('customer_id, salon_id, status')
      .eq('id', appointmentId)
      .single()
    
    if (fetchError || !appointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      )
    }
    
    // Only allow deletion if:
    // 1. User is the customer who made the appointment
    // 2. User is staff/owner of the salon
    // 3. User is admin
    const isCustomer = session.user.role === 'customer' && appointment.customer_id === session.user.id
    const isStaffOrOwner = ['staff', 'salon_owner', 'salon_manager'].includes(session.user.role || '')
    const isAdmin = session.user.role === 'super_admin'
    
    if (!isCustomer && !isStaffOrOwner && !isAdmin) {
      return NextResponse.json(
        { error: 'Not authorized to delete this appointment' },
        { status: 403 }
      )
    }
    
    // Delete related appointment services first
    const { error: servicesError } = await supabase
      .from('appointment_services')
      .delete()
      .eq('appointment_id', appointmentId)
    
    if (servicesError) {
      console.error('Error deleting appointment services:', servicesError)
    }
    
    // Delete the appointment
    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', appointmentId)
    
    if (error) {
      console.error('Error deleting appointment:', error)
      return NextResponse.json(
        { error: 'Failed to delete appointment' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete appointment error:', error)
    return NextResponse.json(
      { error: 'Failed to delete appointment' },
      { status: 500 }
    )
  }
}