import { notFound } from 'next/navigation'
import { createClient } from '@/lib/database/supabase/server'
import { getServiceById } from '@/lib/data-access/services'
import { getAvailableTimeSlots } from '@/lib/data-access/bookings'
import ServiceBookingClient from '@/components/customer/booking/client/service-booking-client'
interface PageProps {
  params: Promise<{
    'salon-id': string
    'service-id': string
  }>
}
export default async function ServiceBookingPage({ params }: PageProps) {
  const { 'salon-id': salonId, 'service-id': serviceId } = await params
  const supabase = await createClient()
  // Fetch service details
  const { data: service, error: serviceError } = await getServiceById(serviceId)
  if (serviceError || !service || service.salon_id !== salonId) {
    notFound()
  }
  // Fetch salon details
  const { data: salon } = await supabase
    .from('salons')
    .select('id, name, description')
    .eq('id', salonId)
    .single()
  if (!salon) {
    notFound()
  }
  // Fetch available staff for this service
  const { data: staffData } = await supabase
    .from('staff_profiles')
    .select(`
      *,
      profiles:user_id (
        *
      ),
      staff_services!inner (
        service_id
      )
    `)
    .eq('salon_id', salonId)
    .eq('is_active', true)
    .eq('is_bookable', true)
    .eq('staff_services.service_id', serviceId)
  
  const availableStaff = staffData || []
  // Get initial available time slots for today
  const today = new Date().toISOString().split('T')[0]
  const firstStaff = availableStaff[0]
  const timeSlotsResult = firstStaff ? await getAvailableTimeSlots({
    staff_id: firstStaff.id,
    service_id: serviceId,
    date: today,
    location_id: firstStaff.location_id || salonId
  }) : { data: [] }
  const timeSlotsData = 'data' in timeSlotsResult ? (timeSlotsResult.data || []) : []
  // Convert to string array format expected by client component
  const timeSlots = timeSlotsData
    .filter(slot => slot.available)
    .map(slot => slot.start)
  return (
    <ServiceBookingClient
      service={service}
      salon={salon}
      availableStaff={availableStaff}
      initialTimeSlots={timeSlots}
      salonId={salonId}
    />
  )
}