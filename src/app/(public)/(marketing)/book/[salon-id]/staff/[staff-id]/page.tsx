import { createClient } from '@/lib/database/supabase/server'
import { notFound } from 'next/navigation'
import { StaffBookingClient } from '@/components/customer/booking/client/staff-booking-client'
import type { Database } from '@/types/database.types'
// Unused types kept for future reference
// type StaffProfile = Database['public']['Tables']['staff_profiles']['Row']
// type Service = Database['public']['Tables']['services']['Row']
interface PageParams {
  params: {
    'salon-id': string
    'staff-id': string
  }
}
export default async function StaffBookingPage({ params }: PageParams) {
  const supabase = await createClient()
  const salonId = params['salon-id']
  const staffId = params['staff-id']
  // Fetch staff details
  const { data: staffProfile, error: staffError } = await supabase
    .from('staff_profiles')
    .select(`
      *,
      profiles!inner(
        id,
        full_name,
        avatar_url
      )
    `)
    .eq('id', staffId)
    .eq('salon_id', salonId)
    .single()
  if (staffError || !staffProfile) {
    notFound()
  }
  // Fetch services this staff member provides
  const { data: staffServices } = await supabase
    .from('staff_services')
    .select(`
      service_id,
      duration_override,
      price_override,
      services!inner(
        id,
        name,
        description,
        duration_minutes,
        price,
        service_categories(
          id,
          name
        )
      )
    `)
    .eq('staff_id', staffId)
  // Fetch staff schedules for availability
  const { data: schedules } = await supabase
    .from('staff_schedules')
    .select('*')
    .eq('staff_id', staffId)
    .eq('is_active', true)
    .order('day_of_week')
  // Fetch staff specialties
  const { data: specialties } = await supabase
    .from('staff_specialties')
    .select('specialty_name')
    .eq('staff_id', staffId)
  // Fetch reviews for rating calculation
  const { data: reviews } = await supabase
    .from('reviews')
    .select('rating')
    .eq('staff_id', staffId)
    .eq('is_published', true)
  // Calculate average rating
  const averageRating = reviews && reviews.length > 0
    ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length
    : 0
  // Format services data
  const formattedServices = staffServices?.map(ss => ({
    id: ss.services.id,
    name: ss.services.name,
    description: ss.services.description,
    duration: ss.duration_override || ss.services.duration_minutes,
    price: ss.price_override || ss.services.price,
    category: ss.services.service_categories?.name || 'General'
  })) || []
  // Generate available time slots based on schedules  
  const generateTimeSlots = (schedules: Database['public']['Tables']['staff_schedules']['Row'][]) => {
    const slots: string[] = []
    const defaultSchedule = schedules.find(s => s.day_of_week === new Date().getDay())
    if (defaultSchedule) {
      const startTime = new Date(`2024-01-01 ${defaultSchedule.start_time}`)
      const endTime = new Date(`2024-01-01 ${defaultSchedule.end_time}`)
      const current = new Date(startTime)
      while (current < endTime) {
        slots.push(current.toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit' 
        }))
        current.setMinutes(current.getMinutes() + 30)
      }
    } else {
      // Default slots if no schedule found
      for (let hour = 9; hour < 18; hour++) {
        slots.push(`${hour > 12 ? hour - 12 : hour}:00 ${hour >= 12 ? 'PM' : 'AM'}`)
        slots.push(`${hour > 12 ? hour - 12 : hour}:30 ${hour >= 12 ? 'PM' : 'AM'}`)
      }
    }
    return slots
  }
  const timeSlots = generateTimeSlots(schedules || [])
  const staffData = {
    id: staffProfile.id,
    name: staffProfile.profiles.full_name || 'Staff Member',
    role: staffProfile.title || 'Staff',
    bio: staffProfile.bio || '',
    rating: averageRating,
    reviewCount: reviews?.length || 0,
    experience: staffProfile.years_experience 
      ? `${staffProfile.years_experience}+ years` 
      : 'Experienced',
    specialties: specialties?.map(s => s.specialty_name) || [],
    image: staffProfile.profiles.avatar_url || '',
    services: formattedServices,
    schedules: schedules || []
  }
  return (
    <StaffBookingClient 
      staff={staffData} 
      timeSlots={timeSlots}
      salonId={salonId}
    />
  )
}