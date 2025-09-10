import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { staffId, date, serviceId } = body

    if (!staffId || !date || !serviceId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    // Get service duration
    const { data: service } = await supabase
      .from('services')
      .select('duration_minutes')
      .eq('id', serviceId)
      .single()

    if (!service) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      )
    }

    const serviceDuration = service.duration_minutes || 60

    // Get staff schedule for the day
    const dayOfWeek = new Date(date).getDay()
    const { data: schedule } = await supabase
      .from('staff_schedules')
      .select('*')
      .eq('staff_id', staffId)
      .eq('day_of_week', dayOfWeek)
      .single()

    if (!schedule) {
      return NextResponse.json(
        { available: false, reason: 'Staff not available on this day' },
        { status: 200 }
      )
    }

    // Get existing appointments for the staff on this date
    const { data: appointments } = await supabase
      .from('appointments')
      .select('start_time, end_time')
      .eq('staff_id', staffId)
      .eq('appointment_date', date)
      .neq('status', 'cancelled')
      .order('start_time')

    // Generate available time slots
    const availableSlots: string[] = []
    const [startH, startM] = schedule.start_time.split(':').map(Number)
    const [endH, endM] = schedule.end_time.split(':').map(Number)
    
    const startMinutes = startH * 60 + startM
    const endMinutes = endH * 60 + endM

    // Check for break times (currently not in database schema)
    const breakStart = 0, breakEnd = 0
    // TODO: Add break times to staff_schedules table if needed

    // Generate 30-minute slots
    for (let minutes = startMinutes; minutes <= endMinutes - serviceDuration; minutes += 30) {
      // Skip break times
      if (breakStart && breakEnd && minutes >= breakStart && minutes < breakEnd) {
        continue
      }

      const hours = Math.floor(minutes / 60)
      const mins = minutes % 60
      const timeStr = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`

      // Check if this slot conflicts with existing appointments
      const endTimeMinutes = minutes + serviceDuration
      const isConflict = appointments?.some(apt => {
        const [aptStartH, aptStartM] = apt.start_time.split(':').map(Number)
        const [aptEndH, aptEndM] = apt.end_time.split(':').map(Number)
        const aptStart = aptStartH * 60 + aptStartM
        const aptEnd = aptEndH * 60 + aptEndM

        // Check for overlap
        return (minutes < aptEnd && endTimeMinutes > aptStart)
      })

      if (!isConflict) {
        availableSlots.push(timeStr)
      }
    }

    // Also check if specific time is available
    if (body.time) {
      const [reqH, reqM] = body.time.split(':').map(Number)
      const requestedMinutes = reqH * 60 + reqM
      const requestedEndMinutes = requestedMinutes + serviceDuration

      // Check if within working hours
      if (requestedMinutes < startMinutes || requestedEndMinutes > endMinutes) {
        return NextResponse.json({
          available: false,
          reason: 'Outside working hours',
          availableSlots
        }, { status: 200 })
      }

      // Check if during break
      if (breakStart && breakEnd && 
          requestedMinutes < breakEnd && requestedEndMinutes > breakStart) {
        return NextResponse.json({
          available: false,
          reason: 'Conflicts with break time',
          availableSlots
        }, { status: 200 })
      }

      // Check for conflicts
      const hasConflict = appointments?.some(apt => {
        const [aptStartH, aptStartM] = apt.start_time.split(':').map(Number)
        const [aptEndH, aptEndM] = apt.end_time.split(':').map(Number)
        const aptStart = aptStartH * 60 + aptStartM
        const aptEnd = aptEndH * 60 + aptEndM

        return (requestedMinutes < aptEnd && requestedEndMinutes > aptStart)
      })

      return NextResponse.json({
        available: !hasConflict,
        reason: hasConflict ? 'Time slot already booked' : null,
        availableSlots
      }, { status: 200 })
    }

    return NextResponse.json({
      available: availableSlots.length > 0,
      availableSlots,
      nextAvailable: availableSlots[0] || null
    }, { status: 200 })

  } catch (error) {
    console.error('Availability check error:', error)
    return NextResponse.json(
      { error: 'Failed to check availability' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    
    const staffId = searchParams.get('staffId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    if (!staffId || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    // Get staff member's schedule
    const { data: schedules } = await supabase
      .from('staff_schedules')
      .select('*')
      .eq('staff_id', staffId)

    // Get appointments in date range
    const { data: appointments } = await supabase
      .from('appointments')
      .select('appointment_date, start_time, end_time, status')
      .eq('staff_id', staffId)
      .gte('appointment_date', startDate)
      .lte('appointment_date', endDate)
      .neq('status', 'cancelled')

    // Build availability calendar
    interface DayAvailability {
      available: boolean
      reason?: string
      workingHours?: {
        start: string
        end: string
        break: {
          start: string
          end: string
        } | null
      }
      bookedSlots?: Array<{
        start: string
        end: string
      }>
    }
    
    const availability: Record<string, DayAvailability> = {}
    const start = new Date(startDate)
    const end = new Date(endDate)

    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      const dateStr = date.toISOString().split('T')[0]
      const dayOfWeek = date.getDay()
      const schedule = schedules?.find(s => s.day_of_week === dayOfWeek)

      if (schedule) {
        const dayAppointments = appointments?.filter(a => a.appointment_date === dateStr) || []
        
        availability[dateStr] = {
          available: true,
          workingHours: {
            start: schedule.start_time,
            end: schedule.end_time,
            break: null // Break times not currently in database schema
          },
          bookedSlots: dayAppointments.map(a => ({
            start: a.start_time,
            end: a.end_time
          }))
        }
      } else {
        availability[dateStr] = {
          available: false,
          reason: 'Staff not working'
        }
      }
    }

    return NextResponse.json({ availability }, { status: 200 })

  } catch (error) {
    console.error('Availability fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch availability' },
      { status: 500 }
    )
  }
}