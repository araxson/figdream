import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendSMS } from '@/lib/api/services/sms.service'

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
    const { type, appointmentId, message: customMessage } = body

    switch (type) {
      case 'appointment_confirmation':
        const { data: appointment } = await supabase
          .from('appointments')
          .select(`
            *,
            profiles:customer_id(*),
            salons(*),
            appointment_services(
              services(*)
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

        const customer = appointment.profiles as { 
          email?: string
          first_name?: string
          last_name?: string
          phone?: string
        }
        const customerPhone = customer?.phone
        if (!customerPhone) {
          return NextResponse.json(
            { error: 'Customer phone not found' },
            { status: 400 }
          )
        }

        const confirmationMessage = `Hi ${customer?.first_name || 'there'}! Your appointment at ${appointment.salons?.name} on ${appointment.appointment_date} at ${appointment.start_time} is confirmed. Reply CANCEL to cancel.`

        await sendSMS(customerPhone, confirmationMessage)

        // Log notification
        await supabase
          .from('notifications')
          .insert({
            type: 'appointment_confirmation',
            user_id: appointment.customer_id,
            title: 'Appointment Confirmation',
            message: confirmationMessage,
            data: {
              appointment_id: appointmentId,
              recipient: customerPhone
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
            salons(*)
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
            if (aptCustomer?.phone) {
              const reminderMessage = `Reminder: You have an appointment tomorrow at ${apt.salons?.name} at ${apt.start_time}. See you then!`
              
              await sendSMS(aptCustomer.phone, reminderMessage)
              
              // Log notification
              await supabase
                .from('notifications')
                .insert({
                  type: 'appointment_reminder',
                  user_id: apt.customer_id,
                  title: 'Appointment Reminder',
                  message: reminderMessage,
                  data: {
                    appointment_id: apt.id,
                    recipient: aptCustomer.phone
                  },
                  is_read: false
                })
            }
          }
        }
        break

      case 'marketing':
        // Send marketing SMS to opted-in customers
        const { data: campaign } = await supabase
          .from('sms_campaigns')
          .select(`
            *,
            sms_campaign_recipients(
              *,
              profiles!sms_campaign_recipients_customer_id_fkey(*)
            )
          `)
          .eq('id', body.campaignId)
          .single()

        if (!campaign) {
          return NextResponse.json(
            { error: 'Campaign not found' },
            { status: 404 }
          )
        }

        const recipients = campaign.sms_campaign_recipients || []
        let sentCount = 0

        for (const recipient of recipients) {
          const recipientCustomer = recipient.profiles
          if (recipientCustomer?.phone) {
            await sendSMS(
              recipientCustomer.phone,
              campaign.message_template || customMessage
            )
            sentCount++

            // Update recipient status
            await supabase
              .from('sms_campaign_recipients')
              .update({
                sent_at: new Date().toISOString(),
                status: 'sent'
              })
              .eq('id', recipient.id)
          }
        }

        // Update campaign stats
        await supabase
          .from('sms_campaigns')
          .update({
            sent_count: sentCount,
            started_at: new Date().toISOString()
          })
          .eq('id', campaign.id)

        break

      case 'custom':
        // Send custom SMS
        if (!body.phone || !customMessage) {
          return NextResponse.json(
            { error: 'Phone and message are required' },
            { status: 400 }
          )
        }

        await sendSMS(body.phone, customMessage)

        // Log notification if user ID is provided
        if (body.userId) {
          await supabase
            .from('notifications')
            .insert({
              type: 'system',
              user_id: body.userId,
              title: 'SMS Notification',
              message: customMessage,
              data: {
                recipient: body.phone
              },
              is_read: false
            })
        }

        break

      default:
        return NextResponse.json(
          { error: 'Invalid SMS type' },
          { status: 400 }
        )
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('SMS notification error:', error)
    return NextResponse.json(
      { error: 'Failed to send SMS notification' },
      { status: 500 }
    )
  }
}