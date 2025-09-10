import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'
import { WalkInFormData, Service } from './walk-in-types'

export async function createWalkInAppointment(
  salonId: string,
  formData: WalkInFormData,
  selectedServices: string[],
  services: Service[]
) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Create or find customer
  let customerId: string | null = null
  if (formData.customer_email) {
    const { data: existingCustomer } = await supabase
      .from('customers')
      .select('id')
      .eq('salon_id', salonId)
      .eq('email', formData.customer_email)
      .single()

    if (existingCustomer) {
      customerId = existingCustomer.id
    } else {
      const { data: newCustomer, error: customerError } = await supabase
        .from('customers')
        .insert({
          user_id: user.id,
          salon_id: salonId,
          first_name: formData.customer_name.split(' ')[0],
          last_name: formData.customer_name.split(' ').slice(1).join(' '),
          email: formData.customer_email,
          phone: formData.customer_phone || null
        })
        .select('id')
        .single()

      if (customerError) throw customerError
      customerId = newCustomer.id
    }
  }

  if (!customerId) {
    throw new Error('Failed to create or find customer')
  }

  const now = new Date()
  const duration = calculateDuration(selectedServices, services)
  const endTime = new Date(now.getTime() + duration * 60000)
  const total = calculateTotal(selectedServices, services)

  // Create appointment
  const { data: appointment, error: appointmentError } = await supabase
    .from('appointments')
    .insert({
      salon_id: salonId,
      customer_id: customerId,
      staff_id: formData.staff_id || user.id,
      location_id: salonId,
      appointment_date: format(now, 'yyyy-MM-dd'),
      start_time: now.toISOString(),
      end_time: endTime.toISOString(),
      status: 'completed',
      is_walk_in: true,
      notes: `Walk-in customer: ${formData.customer_name}`,
      manual_total_amount: formData.collect_payment_now ? total : null,
      payment_collected: formData.collect_payment_now,
      payment_collected_at: formData.collect_payment_now ? now.toISOString() : null,
      payment_collected_by: formData.collect_payment_now ? user.id : null,
      payment_method: formData.collect_payment_now ? formData.payment_method : null
    })
    .select('id')
    .single()

  if (appointmentError) throw appointmentError

  // Add services
  const appointmentServices = selectedServices.map(serviceId => {
    const service = services.find(s => s.id === serviceId)
    return {
      appointment_id: appointment.id,
      service_id: serviceId,
      price: service?.price || 0,
      duration_minutes: service?.duration_minutes || 30
    }
  })

  const { error: servicesError } = await supabase
    .from('appointment_services')
    .insert(appointmentServices)

  if (servicesError) throw servicesError

  // Record earnings if payment collected
  if (formData.collect_payment_now) {
    await recordEarnings(
      salonId,
      formData.staff_id || user.id,
      appointment.id,
      selectedServices,
      services,
      formData,
      total,
      user.id
    )
  }

  return appointment
}

async function recordEarnings(
  salonId: string,
  staffId: string,
  appointmentId: string,
  selectedServices: string[],
  services: Service[],
  formData: WalkInFormData,
  total: number,
  userId: string
) {
  const supabase = createClient()
  const serviceNames = selectedServices.map(id => 
    services.find(s => s.id === id)?.name || 'Service'
  ).join(', ')

  const { error } = await supabase
    .from('staff_earnings')
    .insert({
      salon_id: salonId,
      staff_id: staffId,
      appointment_id: appointmentId,
      service_date: format(new Date(), 'yyyy-MM-dd'),
      service_name: serviceNames,
      service_amount: total,
      tip_amount: 0,
      customer_name: formData.customer_name,
      payment_method: formData.payment_method,
      category: 'service',
      recorded_by: userId,
      location_id: salonId
    })

  if (error) {
    console.error('Error recording earnings:', error)
  }
}

export function calculateTotal(selectedServices: string[], services: Service[]): number {
  return selectedServices.reduce((sum, serviceId) => {
    const service = services.find(s => s.id === serviceId)
    return sum + (service?.price || 0)
  }, 0)
}

export function calculateDuration(selectedServices: string[], services: Service[]): number {
  return selectedServices.reduce((sum, serviceId) => {
    const service = services.find(s => s.id === serviceId)
    return sum + (service?.duration_minutes || 0)
  }, 0)
}