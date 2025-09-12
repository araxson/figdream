import { cancelAppointment, updateAppointmentStatus } from '@/lib/api/dal/appointments'
import { NextResponse } from 'next/server'
import { Database } from '@/types/database.types'

export async function POST(request: Request) {
  try {
    const { appointmentId, action, status } = await request.json()
    
    if (!appointmentId || !action) {
      return NextResponse.json(
        { error: 'Appointment ID and action are required' },
        { status: 400 }
      )
    }
    
    if (action === 'cancel') {
      const success = await cancelAppointment(appointmentId)
      
      if (!success) {
        return NextResponse.json(
          { error: 'Failed to cancel appointment' },
          { status: 500 }
        )
      }
      
      return NextResponse.json({ success: true })
    }
    
    if (action === 'reschedule' && status) {
      const result = await updateAppointmentStatus(
        appointmentId, 
        status as Database['public']['Enums']['appointment_status']
      )
      
      if (!result) {
        return NextResponse.json(
          { error: 'Failed to update appointment' },
          { status: 500 }
        )
      }
      
      return NextResponse.json(result)
    }
    
    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Appointment action error:', error)
    return NextResponse.json(
      { error: 'Failed to perform appointment action' },
      { status: 500 }
    )
  }
}