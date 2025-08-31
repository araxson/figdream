import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/database/supabase/server'
import { logError, logCriticalError, logApiError } from '@/src/lib/errors/logger'
import crypto from 'crypto'

// Types for webhook events
interface WebhookPayload {
  type: 'INSERT' | 'UPDATE' | 'DELETE'
  table: string
  schema: string
  record?: any
  old_record?: any
}

interface WebhookEvent {
  type: string
  table: string
  record: any
  old_record?: any
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
  } catch (error) {
    logError(error as Error, 'high', 'api', { 
      context: 'webhook_signature_verification' 
    })
    return false
  }
}

// Handle user creation webhook
async function handleUserCreated(record: any): Promise<void> {
  try {
    const supabase = await createClient()
    
    // Create profile record for new user
    const { error } = await supabase
      .from('profiles')
      .insert({
        id: record.id,
        email: record.email,
        full_name: record.raw_app_meta_data?.full_name || null,
        phone: record.raw_app_meta_data?.phone || null,
        role: record.raw_app_meta_data?.role || 'customer',
      })

    if (error) {
      logCriticalError(
        `Failed to create profile for user ${record.id}: ${error.message}`,
        'api',
        { userId: record.id, error: error.message }
      )
    } else {
      console.log(`Profile created for user: ${record.id}`)
    }

    // Create notification preferences with defaults
    const { error: notificationError } = await supabase
      .from('notification_preferences')
      .insert({
        user_id: record.id,
        email_bookings: true,
        email_marketing: false,
        sms_bookings: true,
        sms_marketing: false,
        push_bookings: true,
        push_marketing: false,
      })

    if (notificationError) {
      logError(
        `Failed to create notification preferences for user ${record.id}: ${notificationError.message}`,
        'medium',
        'api',
        { userId: record.id, error: notificationError.message }
      )
    }

  } catch (error) {
    logCriticalError(
      error as Error,
      'api',
      { context: 'user_created_webhook', userId: record.id }
    )
  }
}

// Handle user updated webhook
async function handleUserUpdated(record: any, oldRecord?: any): Promise<void> {
  try {
    const supabase = await createClient()
    
    // Update profile if certain fields changed
    const updates: any = {}
    
    if (record.email !== oldRecord?.email) {
      updates.email = record.email
    }
    
    if (record.raw_app_meta_data?.full_name !== oldRecord?.raw_app_meta_data?.full_name) {
      updates.full_name = record.raw_app_meta_data?.full_name || null
    }
    
    if (record.raw_app_meta_data?.phone !== oldRecord?.raw_app_meta_data?.phone) {
      updates.phone = record.raw_app_meta_data?.phone || null
    }
    
    if (record.raw_app_meta_data?.role !== oldRecord?.raw_app_meta_data?.role) {
      updates.role = record.raw_app_meta_data?.role || 'customer'
    }

    if (Object.keys(updates).length > 0) {
      updates.updated_at = new Date().toISOString()
      
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', record.id)

      if (error) {
        logError(
          `Failed to update profile for user ${record.id}: ${error.message}`,
          'medium',
          'api',
          { userId: record.id, updates, error: error.message }
        )
      } else {
        console.log(`Profile updated for user: ${record.id}`)
      }
    }

  } catch (error) {
    logError(
      error as Error,
      'medium',
      'api',
      { context: 'user_updated_webhook', userId: record.id }
    )
  }
}

// Handle user deletion webhook
async function handleUserDeleted(oldRecord: any): Promise<void> {
  try {
    const supabase = await createClient()
    
    // The profile should be automatically deleted via CASCADE constraint
    // but we log this event for auditing purposes
    console.log(`User deleted: ${oldRecord.id}`)
    
    // Create audit log entry
    const { error } = await supabase
      .from('audit_logs')
      .insert({
        user_id: oldRecord.id,
        action: 'delete',
        entity_type: 'user',
        entity_id: oldRecord.id,
        old_values: oldRecord,
        ip_address: null,
        user_agent: 'system',
      })

    if (error) {
      logError(
        `Failed to create audit log for user deletion ${oldRecord.id}: ${error.message}`,
        'medium',
        'api',
        { userId: oldRecord.id, error: error.message }
      )
    }

  } catch (error) {
    logError(
      error as Error,
      'medium',
      'api',
      { context: 'user_deleted_webhook', userId: oldRecord.id }
    )
  }
}

// Handle booking status changes
async function handleBookingUpdated(record: any, oldRecord?: any): Promise<void> {
  try {
    // Only process if status changed
    if (!oldRecord || record.status === oldRecord.status) {
      return
    }

    const supabase = await createClient()
    
    // Create booking status history record
    const { error: historyError } = await supabase
      .from('booking_status_history')
      .insert({
        booking_id: record.id,
        status: record.status,
        changed_by: 'system', // In a webhook context, we don't have user context
        reason: 'Status changed via webhook',
      })

    if (historyError) {
      logError(
        `Failed to create booking status history for booking ${record.id}: ${historyError.message}`,
        'medium',
        'api',
        { bookingId: record.id, error: historyError.message }
      )
    }

    // Handle specific status changes
    switch (record.status) {
      case 'confirmed':
        console.log(`Booking confirmed: ${record.id}`)
        // TODO: Send confirmation email/SMS
        break
        
      case 'cancelled':
        console.log(`Booking cancelled: ${record.id}`)
        // TODO: Send cancellation notification
        // TODO: Update staff availability
        break
        
      case 'completed':
        console.log(`Booking completed: ${record.id}`)
        // TODO: Trigger review request
        // TODO: Update customer analytics
        break
        
      case 'no_show':
        console.log(`Booking no-show: ${record.id}`)
        // TODO: Update customer analytics
        // TODO: Apply no-show policy
        break
    }

  } catch (error) {
    logError(
      error as Error,
      'medium',
      'api',
      { context: 'booking_updated_webhook', bookingId: record.id }
    )
  }
}

// Handle review creation
async function handleReviewCreated(record: any): Promise<void> {
  try {
    const supabase = await createClient()
    
    console.log(`New review created: ${record.id} with rating ${record.rating}`)
    
    // TODO: Update staff/location aggregate ratings
    // TODO: Send notification to staff/salon owner
    // TODO: Check for review response automation
    
    // For now, just log the event
    const { error } = await supabase
      .from('audit_logs')
      .insert({
        user_id: record.customer_id,
        action: 'create',
        entity_type: 'review',
        entity_id: record.id,
        new_values: record,
        ip_address: null,
        user_agent: 'system',
      })

    if (error) {
      logError(
        `Failed to create audit log for review creation ${record.id}: ${error.message}`,
        'low',
        'api',
        { reviewId: record.id, error: error.message }
      )
    }

  } catch (error) {
    logError(
      error as Error,
      'low',
      'api',
      { context: 'review_created_webhook', reviewId: record.id }
    )
  }
}

// Main webhook processor
async function processWebhookEvent(event: WebhookEvent): Promise<void> {
  const { type, table, record, old_record } = event
  
  console.log(`Processing webhook: ${type} on ${table}`)
  
  try {
    // Handle different table events
    switch (table) {
      case 'users':
        if (type === 'INSERT') {
          await handleUserCreated(record)
        } else if (type === 'UPDATE') {
          await handleUserUpdated(record, old_record)
        } else if (type === 'DELETE') {
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
        console.log(`Unhandled webhook event for table: ${table}`)
        break
    }
    
  } catch (error) {
    logCriticalError(
      error as Error,
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
    } catch (parseError) {
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
      record: payload.record,
      old_record: payload.old_record,
    }

    await processWebhookEvent(event)

    // Return success response
    return NextResponse.json({ 
      success: true, 
      processed: true,
      table: payload.table,
      type: payload.type
    })

  } catch (error) {
    logCriticalError(
      error as Error,
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
    
  } catch (error) {
    logError(
      error as Error,
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