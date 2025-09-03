'use server'
import { createClient } from '@/lib/database/supabase/server'
import { createAdminClient } from '@/lib/database/supabase/admin'
import type { Database } from '@/types/database.types'
type NotificationType = Database['public']['Tables']['notifications']['Row']['type']
interface NotificationPayload {
  user_id: string
  title: string
  message: string
  type: NotificationType
  action_url?: string
  metadata?: Record<string, unknown>
}
interface EmailPayload {
  to: string
  subject: string
  html: string
  text?: string
}
interface SMSPayload {
  to: string
  message: string
}
/**
 * Send in-app notification
 */
export async function sendNotification(payload: NotificationPayload) {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: payload.user_id,
        title: payload.title,
        message: payload.message,
        type: payload.type,
        is_read: false
      })
      .select()
      .single()
    if (error) throw error
    // Trigger real-time update (if using Supabase Realtime)
    await supabase
      .channel('notifications')
      .send({
        type: 'broadcast',
        event: 'new_notification',
        payload: data
      })
    return { success: true, data }
  } catch (_error) {
    return { success: false, error }
  }
}
/**
 * Send email notification using Resend
 */
export async function sendEmailNotification(payload: EmailPayload) {
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: 'FigDream <notifications@figdream.com>',
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
        text: payload.text
      })
    })
    if (!response.ok) {
      throw new Error('Failed to send email')
    }
    const data = await response.json()
    return { success: true, data }
  } catch (_error) {
    return { success: false, error }
  }
}
/**
 * Send SMS notification using Twilio
 */
export async function sendSMSNotification(payload: SMSPayload) {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN
    const fromNumber = process.env.TWILIO_PHONE_NUMBER
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64')
        },
        body: new URLSearchParams({
          From: fromNumber!,
          To: payload.to,
          Body: payload.message
        })
      }
    )
    if (!response.ok) {
      throw new Error('Failed to send SMS')
    }
    const data = await response.json()
    return { success: true, data }
  } catch (_error) {
    return { success: false, error }
  }
}
/**
 * Send appointment confirmation notification
 */
export async function sendAppointmentConfirmation(
  appointmentId: string,
  customerId: string,
  appointmentDetails: {
    date: string
    time: string
    services: string[]
    staffName: string
    locationName: string
    totalPrice: number
  }
) {
  const supabase = await createClient()
  // Get customer details
  const { data: customer } = await supabase
    .from('profiles')
    .select('email, phone, first_name, last_name')
    .eq('user_id', customerId)
    .single()
  if (!customer) return
  // Get notification settings
  const { data: prefs } = await supabase
    .from('notification_settings')
    .select('*')
    .eq('user_id', customerId)
    .single()
  // Send in-app notification
  await sendNotification({
    user_id: customerId,
    title: 'Appointment Confirmed!',
    message: `Your appointment on ${appointmentDetails.date} at ${appointmentDetails.time} has been confirmed.`,
    type: 'appointment_confirmation',
    action_url: `/customer/appointments/${appointmentId}`
  })
  // Send email if enabled
  if (prefs?.email_appointments) {
    const emailHtml = `
      <h2>Appointment Confirmation</h2>
      <p>Hi ${customer.first_name},</p>
      <p>Your appointment has been confirmed!</p>
      <h3>Appointment Details:</h3>
      <ul>
        <li><strong>Date:</strong> ${appointmentDetails.date}</li>
        <li><strong>Time:</strong> ${appointmentDetails.time}</li>
        <li><strong>Services:</strong> ${appointmentDetails.services.join(', ')}</li>
        <li><strong>Staff:</strong> ${appointmentDetails.staffName}</li>
        <li><strong>Location:</strong> ${appointmentDetails.locationName}</li>
        <li><strong>Total:</strong> $${appointmentDetails.totalPrice}</li>
      </ul>
      <p>We look forward to seeing you!</p>
    `
    await sendEmailNotification({
      to: customer.email,
      subject: 'Appointment Confirmation - FigDream',
      html: emailHtml,
      text: `Your appointment on ${appointmentDetails.date} at ${appointmentDetails.time} has been confirmed.`
    })
  }
  // Send SMS if enabled
  if (prefs?.sms_appointments && customer.phone) {
    await sendSMSNotification({
      to: customer.phone,
      message: `FigDream: Your appointment on ${appointmentDetails.date} at ${appointmentDetails.time} is confirmed. Reply STOP to unsubscribe.`
    })
  }
}
/**
 * Send appointment reminder
 */
export async function sendAppointmentReminder(
  appointmentId: string,
  customerId: string,
  hoursBeforeAppointment: number = 24
) {
  const supabase = await createClient()
  // Get appointment details
  const { data: appointment } = await supabase
    .from('appointments')
    .select(`
      *,
      salon_locations:location_id(name, address_line_1, phone),
      staff_profiles:staff_id(user_id),
      services(name)
    `)
    .eq('id', appointmentId)
    .single()
  if (!appointment) return
  // Get customer details
  const { data: customer } = await supabase
    .from('profiles')
    .select('email, phone, first_name')
    .eq('user_id', customerId)
    .single()
  if (!customer) return
  const reminderMessage = hoursBeforeAppointment === 24
    ? 'tomorrow'
    : `in ${hoursBeforeAppointment} hours`
  // Send in-app notification
  await sendNotification({
    user_id: customerId,
    title: 'Appointment Reminder',
    message: `Don't forget your appointment ${reminderMessage} at ${appointment.appointment_date}`,
    type: 'appointment_confirmation',
    action_url: `/customer/appointments/${appointmentId}`
  })
  // Check notification settings and send email/SMS
  const { data: prefs } = await supabase
    .from('notification_settings')
    .select('*')
    .eq('user_id', customerId)
    .single()
  if (prefs?.email_notifications && prefs?.appointment_reminders) {
    await sendEmailNotification({
      to: customer.email,
      subject: `Reminder: Your appointment is ${reminderMessage}`,
      html: `
        <p>Hi ${customer.first_name},</p>
        <p>This is a reminder that you have an appointment ${reminderMessage}.</p>
        <p><strong>Time:</strong> ${appointment.appointment_date}</p>
        <p><strong>Location:</strong> ${appointment.location.name}</p>
        <p>See you soon!</p>
      `
    })
  }
  if (prefs?.sms_notifications && prefs?.appointment_reminders && customer.phone) {
    await sendSMSNotification({
      to: customer.phone,
      message: `Reminder: Your FigDream appointment is ${reminderMessage} at ${appointment.appointment_date}`
    })
  }
}
/**
 * Send review request after appointment
 */
export async function sendReviewRequest(
  appointmentId: string,
  customerId: string
) {
  const supabase = await createClient()
  // Get appointment and customer details
  const { data: appointment } = await supabase
    .from('appointments')
    .select(`
      *,
      location:locations(name),
      staff:staff(profiles(first_name, last_name))
    `)
    .eq('id', appointmentId)
    .single()
  if (!appointment) return
  await sendNotification({
    user_id: customerId,
    title: 'How was your experience?',
    message: `We'd love to hear about your recent visit to ${appointment.location.name}`,
    type: 'review',
    action_url: `/customer/appointments/${appointmentId}/review`
  })
}
/**
 * Send marketing notification
 */
export async function sendMarketingNotification(
  userIds: string[],
  campaign: {
    title: string
    message: string
    action_url?: string
    image_url?: string
  }
) {
  const supabase = createAdminClient()
  // Get users with marketing preferences enabled
  const { data: users } = await supabase
    .from('notification_settings')
    .select('user_id, email_notifications, sms_notifications, marketing_emails, marketing_sms')
    .in('user_id', userIds)
    .where('marketing_emails', 'eq', true)
    .or('marketing_sms', 'eq', true)
  if (!users || users.length === 0) return
  // Send in-app notifications
  const notifications = users.map(user => ({
    user_id: user.user_id,
    title: campaign.title,
    message: campaign.message,
    type: 'marketing' as NotificationType,
    is_read: false
  }))
  await supabase.from('notifications').insert(notifications)
  // Send emails to users with email enabled
  const emailUsers = users.filter(u => u.email_notifications && u.marketing_emails)
  if (emailUsers.length > 0) {
    // Batch send emails (implement batch logic based on email provider)
    // This is a simplified version
    for (const user of emailUsers) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('email, first_name')
        .eq('user_id', user.user_id)
        .single()
      if (profile?.email) {
        await sendEmailNotification({
          to: profile.email,
          subject: campaign.title,
          html: `
            <p>Hi ${profile.first_name},</p>
            ${campaign.image_url ? `<img src="${campaign.image_url}" alt="${campaign.title}" />` : ''}
            <p>${campaign.message}</p>
            ${campaign.action_url ? `<a href="${campaign.action_url}">Learn More</a>` : ''}
          `
        })
      }
    }
  }
}