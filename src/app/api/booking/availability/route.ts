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
    const salonId = searchParams.get('salonId')
    const staffId = searchParams.get('staffId')
    const date = searchParams.get('date')
    const serviceIds = searchParams.get('serviceIds')?.split(',').filter(Boolean)
    
    const supabase = await createClient()
    const response: Record<string, unknown> = {}
    
    // Get salon staff
    if (salonId) {
      const { data: staffData } = await supabase
        .from('staff_profiles')
        .select('*, profiles(first_name, last_name)')
        .eq('salon_id', salonId)
        .eq('is_active', true)
        .eq('is_bookable', true)
      
      response.staff = staffData || []
    }
    
    // Get services
    if (serviceIds && serviceIds.length > 0) {
      const { data: servicesData } = await supabase
        .from('services')
        .select('*')
        .in('id', serviceIds)
      
      response.services = servicesData || []
    }
    
    // Get available times for specific staff and date
    if (staffId && date) {
      // Get existing appointments
      const { data: appointments } = await supabase
        .from('appointments')
        .select('start_time, end_time')
        .eq('staff_id', staffId)
        .eq('appointment_date', date)
        .neq('status', 'cancelled')
      
      // Get staff schedule
      const dayOfWeek = new Date(date).getDay()
      const { data: schedule } = await supabase
        .from('staff_schedules')
        .select('*')
        .eq('staff_id', staffId)
        .eq('day_of_week', dayOfWeek)
        .single()
      
      if (schedule) {
        // Generate available time slots
        const slots: string[] = []
        const startHour = parseInt(schedule.start_time.split(':')[0])
        const endHour = parseInt(schedule.end_time.split(':')[0])
        const bookedTimes = new Set(
          appointments?.map(apt => apt.start_time.slice(0, 5)) || []
        )
        
        for (let hour = startHour; hour < endHour; hour++) {
          for (let minute = 0; minute < 60; minute += 30) {
            const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
            if (!bookedTimes.has(timeStr)) {
              slots.push(timeStr)
            }
          }
        }
        
        response.availableTimes = slots
      } else {
        response.availableTimes = []
      }
    }
    
    return NextResponse.json(response)
  } catch (error) {
    console.error('Get booking availability error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch availability' },
      { status: 500 }
    )
  }
}