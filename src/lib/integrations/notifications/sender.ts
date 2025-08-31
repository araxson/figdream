'use server'

import { createClient } from '@/lib/database/supabase/server'
import { getAdminClient } from '@/lib/database/supabase/admin'
import type { Database } from '@/types/database'

type NotificationType = Database['public']['Tables']['notifications']['Row']['type']

interface NotificationPayload {
  user_id: string
  title: string
  message: string
  type: NotificationType
  action_url?: string
  metadata?: Record<string, any>
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
    const supabase = getAdminClient()
    
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
  } catch (error) {
    console.error('Failed to send notification:', error)
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
  } catch (error) {
    console.error('Failed to send email:', error)
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
  } catch (error) {
    console.error('Failed to send SMS:', error)
    return { success: false, error }
  }
}

/**
 * Send booking confirmation notification
 */
export async function sendBookingConfirmation(
  bookingId: string,
  customerId: string,
  bookingDetails: {
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
  
  // Get notification preferences
  const { data: prefs } = await supabase
    .from('notification_preferences')
    .select('*')
    .eq('user_id', customerId)
    .single()
  
  // Send in-app notification
  await sendNotification({
    user_id: customerId,
    title: 'Booking Confirmed!',
    message: `Your appointment on ${bookingDetails.date} at ${bookingDetails.time} has been confirmed.`,
    type: 'booking',
    action_url: `/customer/appointments/${bookingId}`
  })
  
  // Send email if enabled
  if (prefs?.email_enabled && prefs?.booking_reminders) {
    const emailHtml = `
      <h2>Booking Confirmation</h2>
      <p>Hi ${customer.first_name},</p>
      <p>Your appointment has been confirmed!</p>
      <h3>Booking Details:</h3>
      <ul>
        <li><strong>Date:</strong> ${bookingDetails.date}</li>
        <li><strong>Time:</strong> ${bookingDetails.time}</li>
        <li><strong>Services:</strong> ${bookingDetails.services.join(', ')}</li>
        <li><strong>Staff:</strong> ${bookingDetails.staffName}</li>
        <li><strong>Location:</strong> ${bookingDetails.locationName}</li>
        <li><strong>Total:</strong> $${bookingDetails.totalPrice}</li>
      </ul>
      <p>We look forward to seeing you!</p>
    `
    
    await sendEmailNotification({
      to: customer.email,
      subject: 'Booking Confirmation - FigDream',
      html: emailHtml,
      text: `Your appointment on ${bookingDetails.date} at ${bookingDetails.time} has been confirmed.`
    })
  }
  
  // Send SMS if enabled
  if (prefs?.sms_enabled && prefs?.booking_reminders && customer.phone) {
    await sendSMSNotification({
      to: customer.phone,
      message: `FigDream: Your appointment on ${bookingDetails.date} at ${bookingDetails.time} is confirmed. Reply STOP to unsubscribe.`
    })
  }
}

/**
 * Send appointment reminder
 */
export async function sendAppointmentReminder(
  bookingId: string,
  customerId: string,
  hoursBeforeAppointment: number = 24
) {
  const supabase = await createClient()
  
  // Get booking details
  const { data: booking } = await supabase
    .from('bookings')
    .select(`
      *,
      location:locations(name, address, phone),
      staff:staff(profiles(first_name, last_name)),
      booking_services(services(name))
    `)
    .eq('id', bookingId)
    .single()
  
  if (!booking) return
  
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
    message: `Don't forget your appointment ${reminderMessage} at ${booking.start_time}`,
    type: 'booking',
    action_url: `/customer/appointments/${bookingId}`
  })
  
  // Check preferences and send email/SMS
  const { data: prefs } = await supabase
    .from('notification_preferences')
    .select('*')
    .eq('user_id', customerId)
    .single()
  
  if (prefs?.email_enabled) {
    await sendEmailNotification({
      to: customer.email,
      subject: `Reminder: Your appointment is ${reminderMessage}`,
      html: `
        <p>Hi ${customer.first_name},</p>
        <p>This is a reminder that you have an appointment ${reminderMessage}.</p>
        <p><strong>Time:</strong> ${booking.start_time}</p>
        <p><strong>Location:</strong> ${booking.location.name}</p>
        <p>See you soon!</p>
      `
    })
  }
  
  if (prefs?.sms_enabled && customer.phone) {
    await sendSMSNotification({
      to: customer.phone,
      message: `Reminder: Your FigDream appointment is ${reminderMessage} at ${booking.start_time}`
    })
  }
}

/**
 * Send review request after appointment
 */
export async function sendReviewRequest(
  bookingId: string,
  customerId: string
) {
  const supabase = await createClient()
  
  // Get booking and customer details
  const { data: booking } = await supabase
    .from('bookings')
    .select(`
      *,
      location:locations(name),
      staff:staff(profiles(first_name, last_name))
    `)
    .eq('id', bookingId)
    .single()
  
  if (!booking) return
  
  await sendNotification({
    user_id: customerId,
    title: 'How was your experience?',
    message: `We'd love to hear about your recent visit to ${booking.location.name}`,
    type: 'review',
    action_url: `/customer/bookings/${bookingId}/review`
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
  const supabase = getAdminClient()
  
  // Get users with marketing preferences enabled
  const { data: users } = await supabase
    .from('notification_preferences')
    .select('user_id, email_enabled, sms_enabled, marketing_messages')
    .in('user_id', userIds)
    .eq('marketing_messages', true)
  
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
  const emailUsers = users.filter(u => u.email_enabled)
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