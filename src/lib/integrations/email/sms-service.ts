/**
 * SMS Service for FigDream Marketing
 * Handles SMS sending through Twilio API
 */
import twilio from 'twilio'
import { createClient } from '@/lib/database/supabase/server'
import type { Database } from '@/types/database.types'
const accountSid = process.env.TWILIO_ACCOUNT_SID!
const authToken = process.env.TWILIO_AUTH_TOKEN!
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER!
const client = twilio(accountSid, authToken)
type SmsTemplate = Database['public']['Tables']['sms_templates']['Row']
type Campaign = Database['public']['Tables']['marketing_campaigns']['Row']
interface SmsRecipient {
  id: string
  phone: string
  first_name?: string
  last_name?: string
  metadata?: Record<string, unknown>
}
interface SmsVariables {
  customer_name?: string
  salon_name?: string
  booking_date?: string
  booking_time?: string
  service_name?: string
  staff_name?: string
  amount?: string
  location_name?: string
  opt_out_text?: string
  [key: string]: unknown
}
/**
 * Send marketing campaign SMS messages
 */
export async function sendCampaignSms(
  campaign: Campaign,
  recipients: SmsRecipient[],
  template?: SmsTemplate
): Promise<{
  success: boolean
  sent: number
  failed: number
  errors: string[]
}> {
  const errors: string[] = []
  let sent = 0
  let failed = 0
  // Process messages one by one (Twilio doesn't support true batch sending)
  for (const recipient of recipients) {
    try {
      // Format phone number (ensure it has country code)
      const formattedPhone = formatPhoneNumber(recipient.phone)
      if (!formattedPhone) {
        failed++
        errors.push(`Invalid phone number for ${recipient.id}: ${recipient.phone}`)
        continue
      }
      // Prepare message content
      const messageBody = replaceVariables(
        template?.content || campaign.content,
        {
          customer_name: `${recipient.first_name || ''} ${recipient.last_name || ''}`.trim(),
          opt_out_text: '\n\nReply STOP to unsubscribe',
          ...recipient.metadata,
        }
      )
      // Check message length (SMS limit is 1600 characters)
      if (messageBody.length > 1600) {
        failed++
        errors.push(`Message too long for ${recipient.id}`)
        continue
      }
      // Send SMS
      const message = await client.messages.create({
        body: messageBody,
        from: twilioPhoneNumber,
        to: formattedPhone,
        statusCallback: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/twilio/status`,
      })
      if (message.sid) {
        sent++
        await trackSmsSent(campaign.id, recipient.id, message.sid)
      } else {
        failed++
        errors.push(`Failed to send to ${recipient.phone}`)
        await trackSmsFailed(campaign.id, recipient.id, 'No message SID returned')
      }
      // Add small delay between messages to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100))
    } catch (_error) {
      failed++
      errors.push(`Failed to send to ${recipient.phone}: ${error}`)
      await trackSmsFailed(campaign.id, recipient.id, error)
    }
  }
  // Update campaign metrics
  await updateCampaignSmsMetrics(campaign.id, { sent, failed })
  return {
    success: failed === 0,
    sent,
    failed,
    errors,
  }
}
/**
 * Send transactional SMS
 */
export async function sendTransactionalSms(params: {
  to: string
  body: string
  category: 'booking_confirmation' | 'booking_reminder' | 'verification' | 'alert'
  metadata?: Record<string, unknown>
}): Promise<{ success: boolean; messageSid?: string; error?: string }> {
  try {
    const formattedPhone = formatPhoneNumber(params.to)
    if (!formattedPhone) {
      return {
        success: false,
        error: 'Invalid phone number',
      }
    }
    const message = await client.messages.create({
      body: params.body,
      from: twilioPhoneNumber,
      to: formattedPhone,
      statusCallback: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/twilio/status`,
    })
    // Track transactional SMS
    await trackTransactionalSms({
      phone: params.to,
      message_sid: message.sid,
      category: params.category,
      metadata: params.metadata,
    })
    return {
      success: true,
      messageSid: message.sid,
    }
  } catch (_error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send SMS',
    }
  }
}
/**
 * Send booking confirmation SMS
 */
export async function sendBookingConfirmationSms(booking: {
  id: string
  customer_phone: string
  customer_name: string
  salon_name: string
  service_name: string
  start_time: string
}): Promise<{ success: boolean }> {
  const message = `Hi ${booking.customer_name}, your booking at ${booking.salon_name} for ${booking.service_name} on ${new Date(booking.start_time).toLocaleDateString()} at ${new Date(booking.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} is confirmed. View details: ${process.env.NEXT_PUBLIC_APP_URL}/b/${booking.id}`
  return sendTransactionalSms({
    to: booking.customer_phone,
    body: message,
    category: 'booking_confirmation',
    metadata: {
      booking_id: booking.id,
    },
  })
}
/**
 * Send appointment reminder SMS
 */
export async function sendAppointmentReminderSms(booking: {
  id: string
  customer_phone: string
  customer_name: string
  salon_name: string
  service_name: string
  start_time: string
}): Promise<{ success: boolean }> {
  const message = `Reminder: Hi ${booking.customer_name}, you have an appointment at ${booking.salon_name} for ${booking.service_name} tomorrow at ${new Date(booking.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}. Reply C to confirm or R to reschedule.`
  return sendTransactionalSms({
    to: booking.customer_phone,
    body: message,
    category: 'booking_reminder',
    metadata: {
      booking_id: booking.id,
    },
  })
}
/**
 * Send verification code SMS
 */
export async function sendVerificationSms(
  phone: string,
  code: string
): Promise<{ success: boolean }> {
  const message = `Your FigDream verification code is: ${code}. This code will expire in 10 minutes.`
  return sendTransactionalSms({
    to: phone,
    body: message,
    category: 'verification',
  })
}
/**
 * Format phone number to E.164 format
 */
function formatPhoneNumber(phone: string): string | null {
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '')
  // Check if it's a valid phone number length
  if (cleaned.length < 10 || cleaned.length > 15) {
    return null
  }
  // Add country code if not present (assume US if 10 digits)
  if (cleaned.length === 10) {
    return `+1${cleaned}`
  }
  // Add + if not present
  if (!cleaned.startsWith('1') && cleaned.length === 11) {
    return `+${cleaned}`
  }
  // Already has country code
  if (cleaned.length > 10) {
    return `+${cleaned}`
  }
  return null
}
/**
 * Replace variables in template
 */
function replaceVariables(template: string, variables: SmsVariables): string {
  let result = template
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g')
    result = result.replace(regex, value || '')
  })
  return result
}
/**
 * Track SMS sent
 */
async function trackSmsSent(
  campaignId: string,
  recipientId: string,
  messageSid: string
): Promise<void> {
  const supabase = await createClient()
  try {
    await supabase
      .from('sms_events')
      .insert({
        campaign_id: campaignId,
        recipient_id: recipientId,
        message_sid: messageSid,
        event_type: 'sent',
        timestamp: new Date().toISOString(),
      })
  } catch (_error) {
  }
}
/**
 * Track SMS failed
 */
async function trackSmsFailed(
  campaignId: string,
  recipientId: string,
  reason: unknown
): Promise<void> {
  const supabase = await createClient()
  try {
    await supabase
      .from('sms_events')
      .insert({
        campaign_id: campaignId,
        recipient_id: recipientId,
        event_type: 'failed',
        timestamp: new Date().toISOString(),
        metadata: { error: String(reason) },
      })
  } catch (_error) {
  }
}
/**
 * Track transactional SMS
 */
async function trackTransactionalSms(params: {
  phone: string
  message_sid: string
  category: string
  metadata?: Record<string, unknown>
}): Promise<void> {
  const supabase = await createClient()
  try {
    await supabase
      .from('transactional_sms_log')
      .insert({
        phone: params.phone,
        message_sid: params.message_sid,
        category: params.category,
        metadata: params.metadata,
        sent_at: new Date().toISOString(),
      })
  } catch (_error) {
  }
}
/**
 * Update campaign SMS metrics
 */
async function updateCampaignSmsMetrics(
  campaignId: string,
  metrics: { sent?: number; failed?: number }
): Promise<void> {
  const supabase = await createClient()
  try {
    const { data: existing } = await supabase
      .from('campaign_metrics')
      .select('*')
      .eq('campaign_id', campaignId)
      .single()
    if (existing) {
      await supabase
        .from('campaign_metrics')
        .update({
          sent_count: (existing.sent_count || 0) + (metrics.sent || 0),
          bounced_count: (existing.bounced_count || 0) + (metrics.failed || 0),
          last_updated: new Date().toISOString(),
        })
        .eq('campaign_id', campaignId)
    } else {
      await supabase
        .from('campaign_metrics')
        .insert({
          campaign_id: campaignId,
          sent_count: metrics.sent || 0,
          bounced_count: metrics.failed || 0,
          last_updated: new Date().toISOString(),
        })
    }
  } catch (_error) {
  }
}
/**
 * Handle SMS opt-out
 */
export async function handleSmsOptOut(phone: string): Promise<void> {
  const supabase = await createClient()
  try {
    // Find customer by phone number
    const { data: customer } = await supabase
      .from('customers')
      .select('id')
      .eq('phone', phone)
      .single()
    if (customer) {
      // Update customer preferences
      await supabase
        .from('customer_preferences')
        .upsert({
          customer_id: customer.id,
          sms_enabled: false,
          sms_opted_out_at: new Date().toISOString(),
        })
      // Log opt-out event
      await supabase
        .from('sms_opt_outs')
        .insert({
          phone,
          customer_id: customer.id,
          opted_out_at: new Date().toISOString(),
        })
    }
  } catch (_error) {
  }
}
/**
 * Check if phone number is opted out
 */
export async function isPhoneOptedOut(phone: string): Promise<boolean> {
  const supabase = await createClient()
  try {
    const { data } = await supabase
      .from('sms_opt_outs')
      .select('phone')
      .eq('phone', phone)
      .eq('opted_back_in', false)
      .single()
    return !!data
  } catch (_error) {
    // If no record found, phone is not opted out
    return false
  }
}
/**
 * Get SMS usage statistics
 */
export async function getSmsUsageStats(salonId: string): Promise<{
  sent: number
  failed: number
  delivered: number
  cost: number
}> {
  const supabase = await createClient()
  try {
    // Get SMS events for salon's campaigns
    const { data: campaigns } = await supabase
      .from('marketing_campaigns')
      .select('id')
      .eq('salon_id', salonId)
      .eq('type', 'sms')
    if (!campaigns || campaigns.length === 0) {
      return { sent: 0, failed: 0, delivered: 0, cost: 0 }
    }
    const campaignIds = campaigns.map(c => c.id)
    const { data: events } = await supabase
      .from('sms_events')
      .select('event_type')
      .in('campaign_id', campaignIds)
    const stats = {
      sent: 0,
      failed: 0,
      delivered: 0,
      cost: 0,
    }
    events?.forEach(event => {
      switch (event.event_type) {
        case 'sent':
          stats.sent++
          stats.cost += 0.0075 // Approximate SMS cost
          break
        case 'delivered':
          stats.delivered++
          break
        case 'failed':
          stats.failed++
          break
      }
    })
    return stats
  } catch (_error) {
    return { sent: 0, failed: 0, delivered: 0, cost: 0 }
  }
}