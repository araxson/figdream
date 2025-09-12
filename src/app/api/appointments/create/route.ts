import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const serviceSchema = z.object({
  duration_minutes: z.number().min(15).optional(),
  price: z.number().min(0).optional()
})

const createAppointmentSchema = z.object({
  salonId: z.string().uuid('Invalid salon ID'),
  serviceIds: z.array(z.string().uuid('Invalid service ID')).min(1, 'At least one service required'),
  staffId: z.string().uuid('Invalid staff ID'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
  services: z.array(serviceSchema).min(1, 'At least one service required')
})

type ServiceInput = z.infer<typeof serviceSchema>

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    
    // Validate request body with Zod
    const validation = createAppointmentSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 }
      )
    }
    
    const { salonId, serviceIds, staffId, date, time, services } = validation.data

    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get customer profile
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('id')
      .eq('auth_user_id', user.id)
      .single()

    if (customerError || !customer) {
      return NextResponse.json({ error: 'Customer profile not found' }, { status: 404 })
    }

    // Calculate total duration and price
    const totalDuration = services.reduce((sum: number, service: ServiceInput) => sum + (service.duration_minutes || 0), 0)
    const totalPrice = services.reduce((sum: number, service: ServiceInput) => sum + (service.price || 0), 0)

    // Calculate end time
    const [hours, minutes] = time.split(':').map(Number)
    const endTime = new Date()
    endTime.setHours(hours)
    endTime.setMinutes(minutes + totalDuration)
    const endTimeStr = `${endTime.getHours().toString().padStart(2, '0')}:${endTime.getMinutes().toString().padStart(2, '0')}`

    // Create appointment
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .insert({
        salon_id: salonId,
        customer_id: customer.id,
        staff_id: staffId,
        appointment_date: date,
        start_time: time,
        end_time: endTimeStr,
        status: 'pending' as const,
        computed_total_price: totalPrice,
        location_id: salonId
      })
      .select()
      .single()

    if (appointmentError) {
      console.error('Error creating appointment:', appointmentError)
      return NextResponse.json({ error: 'Failed to create appointment' }, { status: 500 })
    }

    // Add appointment services
    const appointmentServices = serviceIds.map((serviceId: string, index: number) => ({
      appointment_id: appointment.id,
      service_id: serviceId,
      duration_minutes: services[index]?.duration_minutes || 30,
      price: services[index]?.price || 0
    }))

    const { error: servicesError } = await supabase
      .from('appointment_services')
      .insert(appointmentServices)

    if (servicesError) {
      console.error('Error creating appointment services:', servicesError)
      // Try to clean up the appointment if services failed
      await supabase.from('appointments').delete().eq('id', appointment.id)
      return NextResponse.json({ error: 'Failed to create appointment services' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      appointmentId: appointment.id
    })

  } catch (error) {
    console.error('Error creating appointment:', error)
    return NextResponse.json(
      { error: 'Failed to create appointment' },
      { status: 500 }
    )
  }
}