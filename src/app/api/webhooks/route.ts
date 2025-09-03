import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/database/supabase/server'
import { logError, logCriticalError, logApiError } from '@/lib/utils/errors/logger'
import crypto from 'crypto'
// Types for webhook events
interface WebhookPayload {
  type: 'INSERT' | 'UPDATE' | 'DELETE'
  table: string
  schema: string
  record?: Record<string, unknown>
  old_record?: Record<string, unknown>
}
interface WebhookEvent {
  type: string
  table: string
  record: Record<string, unknown>
  old_record?: Record<string, unknown>
}
// Verify webhook signature for security
function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  try {
    const hmac = crypto.createHmac('sha256', secret)
    hmac.update(payload)
    const expectedSignature = `sha256=${hmac.digest('hex')}`
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    )
  } catch (_error) {
    logError(_error as Error, 'high', 'api', { 
      context: 'webhook_signature_verification' 
    })
    return false
  }
}
// Handle user creation webhook
async function handleUserCreated(record: Record<string, unknown>): Promise<void> {
  try {
    const supabase = await createClient()
    // Create profile record for new user
    // SECURITY: Do not use raw_app_meta_data (CVE-2025-29927)
    // Extract safe metadata from raw_user_meta_data instead
    const { error } = await supabase
      .from('profiles')
      .insert({
        id: record.id as string,
        email: record.email as string,
        full_name: (record.raw_user_meta_data as Record<string, unknown>)?.full_name as string || null,
        phone: (record.raw_user_meta_data as Record<string, unknown>)?.phone as string || null,
        // Note: role is now stored in user_roles table, not profiles
      })
    if (!error) {
      // Create user_roles entry for new user
      // Default role should be 'customer' for security
      const role = 'customer' // Never trust client-provided role data
      await supabase
        .from('user_roles')
        .insert({
          user_id: record.id as string,
          role: role,
          is_active: true,
          permissions: {},
        })
    }
    if (error) {
      logCriticalError(
        `Failed to create profile for user ${record.id}: ${error.message}`,
        'api',
        { userId: record.id, error: error.message }
      )
    } else {
    }
    // Create notification settings with defaults
    const { error: notificationError } = await supabase
      .from('notification_settings')
      .insert({
        user_id: record.id as string,
        email_appointments: true,
        email_marketing: false,
        email_reminders: true,
        push_appointments: true,
        push_marketing: false,
        push_reminders: true,
        sms_appointments: true,
        sms_marketing: false,
        sms_reminders: true,
        reminder_hours_before: 24,
      })
    if (notificationError) {
      logError(
        `Failed to create notification preferences for user ${record.id}: ${notificationError.message}`,
        'medium',
        'api',
        { userId: record.id, error: notificationError.message }
      )
    }
  } catch (_error) {
    logCriticalError(
      _error as Error,
      'api',
      { context: 'user_created_webhook', userId: record.id }
    )
  }
}
// Handle user updated webhook
async function handleUserUpdated(record: Record<string, unknown>, oldRecord?: Record<string, unknown>): Promise<void> {
  try {
    const supabase = await createClient()
    // Update profile if certain fields changed
    const updates: Record<string, unknown> = {}
    if (record.email !== oldRecord?.email) {
      updates.email = record.email
    }
    // SECURITY: Use raw_user_meta_data instead of raw_app_meta_data (CVE-2025-29927)
    const recordMetadata = record.raw_user_meta_data as Record<string, unknown> | undefined
    const oldRecordMetadata = oldRecord?.raw_user_meta_data as Record<string, unknown> | undefined
    
    if (recordMetadata?.full_name !== oldRecordMetadata?.full_name) {
      updates.full_name = recordMetadata?.full_name || null
    }
    if (recordMetadata?.phone !== oldRecordMetadata?.phone) {
      updates.phone = recordMetadata?.phone || null
    }
    // Role changes should be handled through proper admin endpoints
    // Never allow role changes through webhooks for security
    if (Object.keys(updates).length > 0) {
      updates.updated_at = new Date().toISOString()
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', record.id as string)
      if (error) {
        logError(
          `Failed to update profile for user ${record.id}: ${error.message}`,
          'medium',
          'api',
          { userId: record.id, updates, error: error.message }
        )
      } else {
      }
    }
  } catch (_error) {
    logError(
      _error as Error,
      'medium',
      'api',
      { context: 'user_updated_webhook', userId: record.id }
    )
  }
}
// Handle user deletion webhook
async function handleUserDeleted(oldRecord: Record<string, unknown>): Promise<void> {
  try {
    const supabase = await createClient()
    // The profile should be automatically deleted via CASCADE constraint
    // but we log this event for auditing purposes
    // Create audit log entry
    const { error } = await supabase
      .from('audit_logs')
      .insert({
        user_id: oldRecord.id as string,
        action: 'DELETE',
        entity_type: 'user',
        entity_id: oldRecord.id as string,
        old_data: oldRecord as Record<string, unknown>,
        ip_address: null,
        user_agent: 'system-webhook',
      })
    if (error) {
      logError(
        `Failed to create audit log for user deletion ${oldRecord.id}: ${error.message}`,
        'medium',
        'api',
        { userId: oldRecord.id, error: error.message }
      )
    }
  } catch (_error) {
    logError(
      _error as Error,
      'medium',
      'api',
      { context: 'user_deleted_webhook', userId: oldRecord.id }
    )
  }
}
// Handle booking status changes
async function handleBookingUpdated(record: Record<string, unknown>, oldRecord?: Record<string, unknown>): Promise<void> {
  try {
    // Only process if status changed
    if (!oldRecord || record.status === oldRecord.status) {
      return
    }
    const supabase = await createClient()
    // Log appointment status change for auditing
    const { error: auditError } = await supabase
      .from('audit_logs')
      .insert({
        user_id: null, // System action, no user associated
        action: 'UPDATE',
        entity_type: 'appointment',
        entity_id: record.id as string,
        new_data: {
          status: record.status,
          changed_by: 'webhook',
          reason: 'Status changed via webhook',
        } as Record<string, unknown>,
        old_data: {
          status: oldRecord?.status,
        } as Record<string, unknown>,
        user_agent: 'system-webhook',
      })
    if (auditError) {
      logError(
        `Failed to create audit log for appointment ${record.id}: ${auditError.message}`,
        'medium',
        'api',
        { appointmentId: record.id, error: auditError.message }
      )
    }
    // Handle specific status changes
    switch (record.status) {
      case 'confirmed':
        // TODO: Send confirmation email/SMS
        break
      case 'cancelled':
        // TODO: Send cancellation notification
        // TODO: Update staff availability
        break
      case 'completed':
        // TODO: Trigger review request
        // TODO: Update customer analytics
        break
      case 'no_show':
        // TODO: Update customer analytics
        // TODO: Apply no-show policy
        break
    }
  } catch (_error) {
    logError(
      _error as Error,
      'medium',
      'api',
      { context: 'booking_updated_webhook', bookingId: record.id }
    )
  }
}
// Handle review creation
async function handleReviewCreated(record: Record<string, unknown>): Promise<void> {
  try {
    const supabase = await createClient()
    // TODO: Update staff/location aggregate ratings
    // TODO: Send notification to staff/salon owner
    // TODO: Check for review response automation
    // For now, just log the event
    const { error } = await supabase
      .from('audit_logs')
      .insert({
        user_id: record.customer_id as string || null,
        action: 'CREATE',
        entity_type: 'review',
        entity_id: record.id as string,
        new_data: record as Record<string, unknown>,
        ip_address: null,
        user_agent: 'system-webhook',
      })
    if (error) {
      logError(
        `Failed to create audit log for review creation ${record.id}: ${error.message}`,
        'low',
        'api',
        { reviewId: record.id, error: error.message }
      )
    }
  } catch (_error) {
    logError(
      _error as Error,
      'low',
      'api',
      { context: 'review_created_webhook', reviewId: record.id }
    )
  }
}
// Main webhook processor
async function processWebhookEvent(event: WebhookEvent): Promise<void> {
  const { type, table, record, old_record } = event
  try {
    // Handle different table events
    switch (table) {
      case 'users':
        if (type === 'INSERT') {
          await handleUserCreated(record)
        } else if (type === 'UPDATE') {
          await handleUserUpdated(record, old_record)
        } else if (type === 'DELETE' && old_record) {
          await handleUserDeleted(old_record)
        }
        break
      case 'bookings':
        if (type === 'UPDATE') {
          await handleBookingUpdated(record, old_record)
        }
        break
      case 'reviews':
        if (type === 'INSERT') {
          await handleReviewCreated(record)
        }
        break
      default:
        break
    }
  } catch (_error) {
    logCriticalError(
      _error as Error,
      'api',
      { context: 'webhook_event_processing', table, type }
    )
  }
}
// POST handler for webhook events
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-supabase-signature')
    const webhookSecret = process.env.SUPABASE_WEBHOOK_SECRET
    // Verify webhook signature if secret is configured
    if (webhookSecret && signature) {
      const isValid = verifyWebhookSignature(body, signature, webhookSecret)
      if (!isValid) {
        logError(
          'Invalid webhook signature',
          'high',
          'api',
          { signature, bodyLength: body.length }
        )
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 401 }
        )
      }
    }
    // Parse webhook payload
    let payload: WebhookPayload
    try {
      payload = JSON.parse(body)
    } catch (_parseError) {
      logApiError(
        'Invalid JSON in webhook payload',
        '/api/webhooks',
        400,
        { bodyLength: body.length }
      )
      return NextResponse.json(
        { error: 'Invalid JSON payload' },
        { status: 400 }
      )
    }
    // Validate required fields
    if (!payload.type || !payload.table) {
      logApiError(
        'Missing required webhook fields',
        '/api/webhooks',
        400,
        { payload }
      )
      return NextResponse.json(
        { error: 'Missing required fields: type, table' },
        { status: 400 }
      )
    }
    // Process the webhook event
    const event: WebhookEvent = {
      type: payload.type,
      table: payload.table,
      record: payload.record || {},
      old_record: payload.old_record || {},
    }
    await processWebhookEvent(event)
    // Return success response
    return NextResponse.json({ 
      success: true, 
      processed: true,
      table: payload.table,
      type: payload.type
    })
  } catch (_error) {
    logCriticalError(
      _error as Error,
      'api',
      { context: 'webhook_handler', endpoint: '/api/webhooks' }
    )
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'Failed to process webhook'
      },
      { status: 500 }
    )
  }
}
// GET handler for webhook status check
export async function GET(): Promise<NextResponse> {
  try {
    const webhookSecret = process.env.SUPABASE_WEBHOOK_SECRET
    return NextResponse.json({
      status: 'active',
      configured: !!webhookSecret,
      timestamp: new Date().toISOString(),
      supportedTables: ['users', 'bookings', 'reviews'],
      supportedEvents: ['INSERT', 'UPDATE', 'DELETE']
    })
  } catch (_error) {
    logError(
      _error as Error,
      'low',
      'api',
      { context: 'webhook_status_check' }
    )
    return NextResponse.json(
      { error: 'Failed to get webhook status' },
      { status: 500 }
    )
  }
}