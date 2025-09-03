import { notFound } from 'next/navigation'
import { createClient } from '@/lib/database/supabase/server'
import { getServiceById } from '@/lib/data-access/services'
import { getStaffBySalon } from '@/lib/data-access/staff'
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
  const service = await getServiceById(serviceId)
  if (!service || service.salon_id !== salonId) {
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
  const allStaff = await getStaffBySalon(salonId)
  // Filter staff who can perform this service
  const { data: serviceStaff } = await supabase
    .from('staff_services')
    .select('staff_id')
    .eq('service_id', serviceId)
  const availableStaffIds = serviceStaff?.map(ss => ss.staff_id) || []
  const availableStaff = allStaff.filter(staff => 
    availableStaffIds.includes(staff.id) && staff.is_bookable
  )
  // Get initial available time slots for today
  const today = new Date().toISOString().split('T')[0]
  const timeSlots = await getAvailableTimeSlots({
    salonId,
    date: today,
    serviceId,
    duration: service.duration_minutes
  })
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