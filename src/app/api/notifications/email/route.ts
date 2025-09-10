import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/api/services/email.service'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Verify authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { type, appointmentId } = body

    switch (type) {
      case 'appointment_confirmation':
        // Fetch appointment details
        const { data: appointment } = await supabase
          .from('appointments')
          .select(`
            *,
            profiles:customer_id(*),
            salons(*),
            appointment_services(
              services(*)
            ),
            staff_profiles(
              *,
              profiles(*)
            )
          `)
          .eq('id', appointmentId)
          .single()

        if (!appointment) {
          return NextResponse.json(
            { error: 'Appointment not found' },
            { status: 404 }
          )
        }

        // Type assertion needed due to Supabase query relationship
        const customer = appointment.profiles as { 
          email?: string
          first_name?: string
          last_name?: string
          phone?: string
        }
        const customerEmail = customer?.email
        if (!customerEmail) {
          return NextResponse.json(
            { error: 'Customer email not found' },
            { status: 400 }
          )
        }

        const emailHtml = `
          <h2>Appointment Confirmation</h2>
          <p>Dear ${customer?.first_name || 'Customer'},</p>
          <p>Your appointment has been confirmed!</p>
          
          <h3>Details:</h3>
          <ul>
            <li><strong>Salon:</strong> ${appointment.salons?.name}</li>
            <li><strong>Date:</strong> ${appointment.appointment_date}</li>
            <li><strong>Time:</strong> ${appointment.start_time}</li>
            <li><strong>Service:</strong> ${appointment.appointment_services?.[0]?.services?.name}</li>
            <li><strong>Staff:</strong> ${appointment.staff_profiles?.profiles?.full_name || appointment.staff_profiles?.employee_id}</li>
          </ul>
          
          <p>Location: ${appointment.salons?.address}</p>
          <p>Contact: ${appointment.salons?.phone}</p>
          
          <p>We look forward to seeing you!</p>
        `

        await sendEmail(
          customerEmail,
          'Appointment Confirmation',
          emailHtml
        )

        // Log email sent
        await supabase
          .from('notifications')
          .insert({
            type: 'appointment_confirmation',
            user_id: appointment.customer_id,
            title: 'Appointment Confirmation',
            message: 'Your appointment has been confirmed',
            data: {
              appointment_id: appointmentId,
              recipient: customerEmail
            },
            is_read: false
          })

        break

      case 'appointment_reminder':
        // Fetch appointments for tomorrow
        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)
        const tomorrowStr = tomorrow.toISOString().split('T')[0]

        const { data: upcomingAppointments } = await supabase
          .from('appointments')
          .select(`
            *,
            profiles:customer_id(*),
            salons(*),
            appointment_services(
              services(*)
            )
          `)
          .eq('appointment_date', tomorrowStr)
          .eq('status', 'confirmed')

        if (upcomingAppointments) {
          for (const apt of upcomingAppointments) {
            const aptCustomer = apt.profiles as { 
              email?: string
              first_name?: string
              last_name?: string
              phone?: string
            }
            if (aptCustomer?.email) {
              const reminderHtml = `
                <h2>Appointment Reminder</h2>
                <p>Dear ${aptCustomer?.first_name || 'Customer'},</p>
                <p>This is a reminder about your appointment tomorrow:</p>
                
                <ul>
                  <li><strong>Time:</strong> ${apt.start_time}</li>
                  <li><strong>Service:</strong> ${apt.appointment_services?.[0]?.services?.name}</li>
                  <li><strong>Location:</strong> ${apt.salons?.name}, ${apt.salons?.address}</li>
                </ul>
                
                <p>See you soon!</p>
              `

              await sendEmail(
                aptCustomer.email,
                'Appointment Reminder',
                reminderHtml
              )

              // Log notification
              await supabase
                .from('notifications')
                .insert({
                  type: 'appointment_reminder',
                  user_id: apt.customer_id,
                  title: 'Appointment Reminder',
                  message: 'Reminder: Your appointment is tomorrow',
                  data: {
                    appointment_id: apt.id,
                    recipient: aptCustomer.email
                  },
                  is_read: false
                })
            }
          }
        }
        break

      case 'appointment_cancelled':
        const { data: cancelledApt } = await supabase
          .from('appointments')
          .select(`
            *,
            profiles:customer_id(*),
            salons(*)
          `)
          .eq('id', appointmentId)
          .single()

        const cancelledCustomer = cancelledApt?.profiles as { 
          email?: string
          first_name?: string
          last_name?: string
          phone?: string
        } | undefined
        if (cancelledApt && cancelledCustomer?.email) {
          const cancellationHtml = `
            <h2>Appointment Cancelled</h2>
            <p>Dear ${cancelledCustomer?.first_name || 'Customer'},</p>
            <p>Your appointment on ${cancelledApt.appointment_date} at ${cancelledApt.start_time} has been cancelled.</p>
            <p>If you have any questions, please contact ${cancelledApt.salons?.name}.</p>
          `

          await sendEmail(
            cancelledCustomer.email,
            'Appointment Cancelled',
            cancellationHtml
          )

          // Log notification
          await supabase
            .from('notifications')
            .insert({
              type: 'appointment_cancelled',
              user_id: cancelledApt.customer_id,
              title: 'Appointment Cancelled',
              message: 'Your appointment has been cancelled',
              data: {
                appointment_id: appointmentId,
                recipient: cancelledCustomer.email
              },
              is_read: false
            })
        }
        break

      default:
        return NextResponse.json(
          { error: 'Invalid email type' },
          { status: 400 }
        )
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Email notification error:', error)
    return NextResponse.json(
      { error: 'Failed to send email notification' },
      { status: 500 }
    )
  }
}