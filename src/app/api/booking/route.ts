import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifySession } from '@/lib/api/dal/auth'
import type { Database } from '@/types/database.types'

// GET - Retrieve bookings
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
    const customerId = searchParams.get('customerId')
    const salonId = searchParams.get('salonId')
    const staffId = searchParams.get('staffId')
    const status = searchParams.get('status')
    const date = searchParams.get('date')

    const supabase = await createClient()

    let query = supabase
      .from('appointments')
      .select(`
        *,
        salons(id, name, address),
        staff_profiles(id, user_id, profiles(first_name, last_name)),
        customers(id, user_id, profiles(first_name, last_name)),
        appointment_services(
          id,
          services(id, name, price, duration_minutes)
        )
      `)
      .order('appointment_date', { ascending: false })
      .order('start_time', { ascending: false })

    if (customerId) {
      query = query.eq('customer_id', customerId)
    }

    if (salonId) {
      query = query.eq('salon_id', salonId)
    }

    if (staffId) {
      query = query.eq('staff_id', staffId)
    }

    if (status) {
      query = query.eq('status', status as Database['public']['Enums']['appointment_status'])
    }

    if (date) {
      query = query.eq('appointment_date', date)
    }

    const { data: bookings, error } = await query

    if (error) {
      console.error('Error fetching bookings:', error)
      return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 })
    }

    return NextResponse.json({ bookings: bookings || [] })

  } catch (error) {
    console.error('Get bookings error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    )
  }
}

// POST - Create a new booking
export async function POST(request: NextRequest) {
  try {
    const session = await verifySession()
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      salonId,
      staffId,
      serviceIds,
      date,
      time,
      customerId,
      notes
    } = body

    // Validate required fields
    if (!salonId || !staffId || !serviceIds || !date || !time) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Get or create customer
    let customerIdToUse = customerId
    if (!customerIdToUse) {
      // Get customer for current user
      const { data: customer } = await supabase
        .from('customers')
        .select('id')
        .eq('user_id', session.user.id)
        .single()

      if (customer) {
        customerIdToUse = customer.id
      } else {
        // Create customer profile if doesn't exist
        const { data: newCustomer, error: customerError } = await supabase
          .from('customers')
          .insert({
            salon_id: salonId,
            user_id: session.user.id,
            first_name: '',
            last_name: '',
            email: session.user.email || '',
            phone: ''
          })
          .select()
          .single()

        if (customerError) {
          console.error('Error creating customer:', customerError)
          return NextResponse.json({ error: 'Failed to create customer profile' }, { status: 500 })
        }
        customerIdToUse = newCustomer.id
      }
    }

    // Get services to calculate total price and duration
    const { data: services, error: servicesError } = await supabase
      .from('services')
      .select('id, price, duration_minutes')
      .in('id', serviceIds)

    if (servicesError || !services) {
      return NextResponse.json({ error: 'Invalid services' }, { status: 400 })
    }

    const _totalPrice = services.reduce((sum, s) => sum + (s.price || 0), 0)
    const totalDuration = services.reduce((sum, s) => sum + (s.duration_minutes || 0), 0)

    // Calculate end time
    const startDate = new Date(`${date}T${time}:00`)
    const endDate = new Date(startDate.getTime() + totalDuration * 60000)
    const endTime = `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`

    // Get location_id from staff
    const { data: staffData } = await supabase
      .from('staff_profiles')
      .select('location_id, salon_id')
      .eq('id', staffId)
      .single()

    // Create appointment
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .insert({
        salon_id: staffData?.salon_id || salonId,
        location_id: staffData?.location_id || '',
        staff_id: staffId,
        customer_id: customerIdToUse,
        appointment_date: date,
        start_time: time,
        end_time: endTime,
        status: 'pending',
        notes: notes || null
      })
      .select()
      .single()

    if (appointmentError) {
      console.error('Error creating appointment:', appointmentError)
      return NextResponse.json({ error: 'Failed to create appointment' }, { status: 500 })
    }

    // Create appointment services
    const appointmentServices = serviceIds.map((serviceId: string) => ({
      appointment_id: appointment.id,
      service_id: serviceId
    }))

    const { error: servicesLinkError } = await supabase
      .from('appointment_services')
      .insert(appointmentServices)

    if (servicesLinkError) {
      console.error('Error linking services:', servicesLinkError)
      // Rollback appointment
      await supabase.from('appointments').delete().eq('id', appointment.id)
      return NextResponse.json({ error: 'Failed to link services' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      appointment,
      message: 'Booking created successfully'
    })

  } catch (error) {
    console.error('Create booking error:', error)
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    )
  }
}

// PATCH - Update a booking
export async function PATCH(request: NextRequest) {
  try {
    const session = await verifySession()
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { appointmentId, ...updateData } = body

    if (!appointmentId) {
      return NextResponse.json(
        { error: 'Appointment ID is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Special handling for status updates
    if (updateData.status) {
      // Validate status transitions
      const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled', 'no_show']
      if (!validStatuses.includes(updateData.status)) {
        return NextResponse.json(
          { error: 'Invalid status' },
          { status: 400 }
        )
      }

      // Add timestamp for certain status changes
      if (updateData.status === 'confirmed') {
        updateData.confirmed_at = new Date().toISOString()
      } else if (updateData.status === 'cancelled') {
        updateData.cancelled_at = new Date().toISOString()
      } else if (updateData.status === 'completed') {
        updateData.completed_at = new Date().toISOString()
      }
    }

    // Update appointment
    const { data: appointment, error } = await supabase
      .from('appointments')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', appointmentId)
      .select()
      .single()

    if (error) {
      console.error('Error updating appointment:', error)
      return NextResponse.json({ error: 'Failed to update appointment' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      appointment,
      message: 'Booking updated successfully'
    })

  } catch (error) {
    console.error('Update booking error:', error)
    return NextResponse.json(
      { error: 'Failed to update booking' },
      { status: 500 }
    )
  }
}

// DELETE - Cancel/Delete a booking
export async function DELETE(request: NextRequest) {
  try {
    const session = await verifySession()
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const appointmentId = searchParams.get('appointmentId')
    const hardDelete = searchParams.get('hardDelete') === 'true'

    if (!appointmentId) {
      return NextResponse.json(
        { error: 'Appointment ID is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    if (hardDelete) {
      // First delete related appointment services
      await supabase
        .from('appointment_services')
        .delete()
        .eq('appointment_id', appointmentId)

      // Then delete the appointment
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', appointmentId)

      if (error) {
        console.error('Error deleting appointment:', error)
        return NextResponse.json({ error: 'Failed to delete appointment' }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        message: 'Booking deleted permanently'
      })
    } else {
      // Soft delete - just mark as cancelled
      const { data: appointment, error } = await supabase
        .from('appointments')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', appointmentId)
        .select()
        .single()

      if (error) {
        console.error('Error cancelling appointment:', error)
        return NextResponse.json({ error: 'Failed to cancel appointment' }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        appointment,
        message: 'Booking cancelled successfully'
      })
    }

  } catch (error) {
    console.error('Delete booking error:', error)
    return NextResponse.json(
      { error: 'Failed to delete booking' },
      { status: 500 }
    )
  }
}