/**
 * Email Service for FigDream Marketing
 * Handles email sending through Resend API
 */
import { Resend } from 'resend'
import { createClient } from '@/lib/database/supabase/server'
import type { Database } from '@/types/database.types'
const resend = new Resend(process.env.RESEND_API_KEY!)
type EmailTemplate = Database['public']['Tables']['email_templates']['Row']
type Campaign = Database['public']['Tables']['marketing_campaigns']['Row']
interface EmailRecipient {
  id: string
  email: string
  first_name?: string
  last_name?: string
  metadata?: Record<string, unknown>
}
interface EmailVariables {
  customer_name?: string
  salon_name?: string
  booking_date?: string
  booking_time?: string
  service_name?: string
  staff_name?: string
  amount?: string
  location_name?: string
  location_address?: string
  unsubscribe_url?: string
  [key: string]: unknown
}
/**
 * Send marketing campaign emails
 */
export async function sendCampaignEmails(
  campaign: Campaign,
  recipients: EmailRecipient[],
  template?: EmailTemplate
): Promise<{
  success: boolean
  sent: number
  failed: number
  errors: string[]
}> {
  const errors: string[] = []
  let sent = 0
  let failed = 0
  // Process in batches
  const batchSize = 50
  for (let i = 0; i < recipients.length; i += batchSize) {
    const batch = recipients.slice(i, i + batchSize)
    try {
      const emails = batch.map(recipient => ({
        from: campaign.from_email || 'noreply@figdream.com',
        to: recipient.email,
        subject: replaceVariables(campaign.subject || 'FigDream Update', {
          customer_name: `${recipient.first_name || ''} ${recipient.last_name || ''}`.trim(),
          ...recipient.metadata,
        }),
        html: replaceVariables(template?.html_content || campaign.content, {
          customer_name: `${recipient.first_name || ''} ${recipient.last_name || ''}`.trim(),
          unsubscribe_url: `${process.env.NEXT_PUBLIC_APP_URL}/unsubscribe?token=${generateUnsubscribeToken(recipient.id)}`,
          ...recipient.metadata,
        }),
        text: template?.text_content,
        reply_to: campaign.reply_to,
        headers: {
          'X-Campaign-ID': campaign.id,
          'X-Entity-Ref-ID': recipient.id,
        },
        tags: [
          {
            name: 'campaign_id',
            value: campaign.id,
          },
          {
            name: 'campaign_type',
            value: campaign.type,
          },
        ],
      }))
      // Send batch
      const results = await Promise.allSettled(
        emails.map(email => resend.emails.send(email))
      )
      // Process results
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          sent++
          trackEmailSent(campaign.id, batch[index].id)
        } else {
          failed++
          errors.push(`Failed to send to ${batch[index].email}: ${result.reason}`)
          trackEmailFailed(campaign.id, batch[index].id, result.reason)
        }
      })
      // Add delay between batches
      if (i + batchSize < recipients.length) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    } catch (_error) {
      failed += batch.length
      errors.push(`Batch error: ${error}`)
    }
  }
  // Update campaign metrics
  await updateCampaignMetrics(campaign.id, { sent, failed })
  return {
    success: failed === 0,
    sent,
    failed,
    errors,
  }
}
/**
 * Send transactional email
 */
export async function sendTransactionalEmail(params: {
  to: string
  subject: string
  html: string
  text?: string
  from?: string
  replyTo?: string
  category: 'booking_confirmation' | 'booking_reminder' | 'review_request' | 'password_reset' | 'welcome'
  metadata?: Record<string, unknown>
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const result = await resend.emails.send({
      from: params.from || 'FigDream <noreply@figdream.com>',
      to: params.to,
      subject: params.subject,
      html: params.html,
      text: params.text,
      reply_to: params.replyTo,
      headers: {
        'X-Category': params.category,
      },
      tags: Object.entries(params.metadata || {}).map(([name, value]) => ({
        name,
        value: String(value),
      })),
    })
    if (result.error) {
      return {
        success: false,
        error: result.error.message,
      }
    }
    return {
      success: true,
      messageId: result.data?.id,
    }
  } catch (_error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send email',
    }
  }
}
/**
 * Send booking confirmation email
 */
export async function sendBookingConfirmationEmail(booking: {
  id: string
  customer_email: string
  customer_name: string
  salon_name: string
  location_name: string
  location_address: string
  service_name: string
  staff_name: string
  start_time: string
  end_time: string
  total_amount: number
}): Promise<{ success: boolean }> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #6366f1; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
        .button { display: inline-block; background: #6366f1; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Booking Confirmed!</h1>
        </div>
        <div class="content">
          <p>Hi ${booking.customer_name},</p>
          <p>Your appointment at ${booking.salon_name} has been confirmed. We look forward to seeing you!</p>
          <div class="booking-details">
            <h2>Booking Details</h2>
            <div class="detail-row">
              <span><strong>Service:</strong></span>
              <span>${booking.service_name}</span>
            </div>
            <div class="detail-row">
              <span><strong>Staff:</strong></span>
              <span>${booking.staff_name}</span>
            </div>
            <div class="detail-row">
              <span><strong>Date:</strong></span>
              <span>${new Date(booking.start_time).toLocaleDateString()}</span>
            </div>
            <div class="detail-row">
              <span><strong>Time:</strong></span>
              <span>${new Date(booking.start_time).toLocaleTimeString()} - ${new Date(booking.end_time).toLocaleTimeString()}</span>
            </div>
            <div class="detail-row">
              <span><strong>Location:</strong></span>
              <span>${booking.location_name}<br>${booking.location_address}</span>
            </div>
            <div class="detail-row">
              <span><strong>Total:</strong></span>
              <span>$${booking.total_amount.toFixed(2)}</span>
            </div>
          </div>
          <div style="text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/customer/bookings/${booking.id}" class="button">View Booking</a>
          </div>
          <p><strong>Need to make changes?</strong><br>
          You can reschedule or cancel your appointment from your dashboard.</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} FigDream. All rights reserved.</p>
          <p>This is an automated confirmation email. Please do not reply.</p>
        </div>
      </div>
    </body>
    </html>
  `
  return sendTransactionalEmail({
    to: booking.customer_email,
    subject: `Booking Confirmed - ${booking.salon_name}`,
    html,
    category: 'booking_confirmation',
    metadata: {
      booking_id: booking.id,
    },
  })
}
/**
 * Send appointment reminder email
 */
export async function sendAppointmentReminderEmail(booking: {
  id: string
  customer_email: string
  customer_name: string
  salon_name: string
  service_name: string
  staff_name: string
  start_time: string
  location_name: string
}): Promise<{ success: boolean }> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f59e0b; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .reminder-box { background: #fef3c7; border: 2px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .button { display: inline-block; background: #6366f1; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Appointment Reminder</h1>
        </div>
        <div class="content">
          <p>Hi ${booking.customer_name},</p>
          <p>This is a friendly reminder about your upcoming appointment:</p>
          <div class="reminder-box">
            <h2>${booking.service_name}</h2>
            <p><strong>When:</strong> ${new Date(booking.start_time).toLocaleString()}</p>
            <p><strong>Where:</strong> ${booking.salon_name} - ${booking.location_name}</p>
            <p><strong>With:</strong> ${booking.staff_name}</p>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/customer/bookings/${booking.id}" class="button">View Details</a>
          </div>
        </div>
      </div>
    </body>
    </html>
  `
  return sendTransactionalEmail({
    to: booking.customer_email,
    subject: `Reminder: Your appointment at ${booking.salon_name}`,
    html,
    category: 'booking_reminder',
    metadata: {
      booking_id: booking.id,
    },
  })
}
/**
 * Replace variables in template
 */
function replaceVariables(template: string, variables: EmailVariables): string {
  let result = template
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g')
    result = result.replace(regex, value || '')
  })
  return result
}
/**
 * Generate unsubscribe token
 */
function generateUnsubscribeToken(customerId: string): string {
  // In production, use a proper JWT or encrypted token
  return Buffer.from(`${customerId}:${Date.now()}`).toString('base64')
}
/**
 * Track email sent
 */
async function trackEmailSent(campaignId: string, recipientId: string): Promise<void> {
  const supabase = await createClient()
  try {
    await supabase
      .from('email_events')
      .insert({
        campaign_id: campaignId,
        recipient_id: recipientId,
        event_type: 'sent',
        timestamp: new Date().toISOString(),
      })
  } catch (_error) {
  }
}
/**
 * Track email failed
 */
async function trackEmailFailed(campaignId: string, recipientId: string, reason: unknown): Promise<void> {
  const supabase = await createClient()
  try {
    await supabase
      .from('email_events')
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
 * Update campaign metrics
 */
async function updateCampaignMetrics(
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