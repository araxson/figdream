import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/database/supabase/server'
import { logError, logCriticalError, logApiError } from '@/src/lib/errors/logger'

// Types for cron tasks
interface CronTask {
  name: string
  description: string
  schedule: string
  handler: () => Promise<void>
}

interface CronTaskResult {
  task: string
  success: boolean
  duration: number
  error?: string
  itemsProcessed?: number
}

// Verify cron request is authorized
function verifyCronAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  
  if (!cronSecret) {
    console.warn('CRON_SECRET not configured - allowing all cron requests')
    return true
  }
  
  if (!authHeader) {
    return false
  }
  
  const token = authHeader.replace('Bearer ', '')
  return token === cronSecret
}

// Send appointment reminders for upcoming appointments
async function sendAppointmentReminders(): Promise<CronTaskResult> {
  const startTime = Date.now()
  let itemsProcessed = 0
  
  try {
    const supabase = await createClient()
    
    // Get appointments scheduled for tomorrow that don't have reminders sent yet
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)
    
    const dayAfterTomorrow = new Date(tomorrow)
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1)
    
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select(`
        id,
        scheduled_at,
        total_price,
        notes,
        customer_id,
        location_id,
        staff_id,
        profiles!customer_id (
          id,
          email,
          full_name,
          phone
        ),
        locations (
          id,
          name,
          address,
          phone
        ),
        staff (
          id,
          display_name
        ),
        booking_services (
          service_id,
          services (
            name,
            duration_minutes
          )
        )
      `)
      .gte('scheduled_at', tomorrow.toISOString())
      .lt('scheduled_at', dayAfterTomorrow.toISOString())
      .eq('status', 'confirmed')
      
    if (error) {
      throw new Error(`Failed to fetch appointments: ${error.message}`)
    }
    
    if (!bookings || bookings.length === 0) {
      console.log('No appointments found for reminder sending')
      return {
        task: 'sendAppointmentReminders',
        success: true,
        duration: Date.now() - startTime,
        itemsProcessed: 0
      }
    }
    
    // Process each booking for reminders
    for (const booking of bookings) {
      try {
        // Check notification preferences
        const { data: preferences } = await supabase
          .from('notification_preferences')
          .select('email_bookings, sms_bookings')
          .eq('user_id', booking.customer_id)
          .single()
        
        if (!preferences) {
          console.log(`No notification preferences found for customer ${booking.customer_id}`)
          continue
        }
        
        // Create notification record
        const notificationData = {
          user_id: booking.customer_id,
          type: 'appointment_reminder',
          title: 'Upcoming Appointment Reminder',
          message: `Your appointment at ${booking.locations?.name} is scheduled for ${new Date(booking.scheduled_at).toLocaleString()}`,
          data: {
            booking_id: booking.id,
            scheduled_at: booking.scheduled_at,
            location_name: booking.locations?.name,
            staff_name: booking.staff?.display_name,
            services: booking.booking_services?.map((bs: any) => bs.services?.name).join(', ')
          }
        }
        
        const { error: notificationError } = await supabase
          .from('notifications')
          .insert(notificationData)
          
        if (notificationError) {
          logError(
            `Failed to create notification for booking ${booking.id}: ${notificationError.message}`,
            'medium',
            'api'
          )
          continue
        }
        
        // TODO: Send actual email/SMS notifications
        // For now, just log what would be sent
        if (preferences.email_bookings && booking.profiles?.email) {
          console.log(`Would send email reminder to ${booking.profiles.email} for booking ${booking.id}`)
        }
        
        if (preferences.sms_bookings && booking.profiles?.phone) {
          console.log(`Would send SMS reminder to ${booking.profiles.phone} for booking ${booking.id}`)
        }
        
        itemsProcessed++
        
      } catch (bookingError) {
        logError(
          `Failed to process reminder for booking ${booking.id}: ${bookingError}`,
          'medium',
          'api',
          { bookingId: booking.id }
        )
      }
    }
    
    console.log(`Processed ${itemsProcessed} appointment reminders`)
    
    return {
      task: 'sendAppointmentReminders',
      success: true,
      duration: Date.now() - startTime,
      itemsProcessed
    }
    
  } catch (error) {
    logCriticalError(
      error as Error,
      'api',
      { context: 'appointment_reminders_cron' }
    )
    
    return {
      task: 'sendAppointmentReminders',
      success: false,
      duration: Date.now() - startTime,
      error: (error as Error).message
    }
  }
}

// Clean up expired waitlist entries
async function cleanupExpiredWaitlist(): Promise<CronTaskResult> {
  const startTime = Date.now()
  let itemsProcessed = 0
  
  try {
    const supabase = await createClient()
    
    // Mark waitlist entries as expired if their preferred date has passed
    const today = new Date()
    today.setHours(23, 59, 59, 999) // End of today
    
    const { data: expiredEntries, error: fetchError } = await supabase
      .from('waitlist')
      .select('id')
      .eq('status', 'waiting')
      .lt('preferred_date', today.toISOString())
      
    if (fetchError) {
      throw new Error(`Failed to fetch expired waitlist entries: ${fetchError.message}`)
    }
    
    if (!expiredEntries || expiredEntries.length === 0) {
      console.log('No expired waitlist entries found')
      return {
        task: 'cleanupExpiredWaitlist',
        success: true,
        duration: Date.now() - startTime,
        itemsProcessed: 0
      }
    }
    
    // Update expired entries
    const { error: updateError } = await supabase
      .from('waitlist')
      .update({ 
        status: 'expired',
        updated_at: new Date().toISOString()
      })
      .eq('status', 'waiting')
      .lt('preferred_date', today.toISOString())
    
    if (updateError) {
      throw new Error(`Failed to update expired waitlist entries: ${updateError.message}`)
    }
    
    itemsProcessed = expiredEntries.length
    console.log(`Marked ${itemsProcessed} waitlist entries as expired`)
    
    return {
      task: 'cleanupExpiredWaitlist',
      success: true,
      duration: Date.now() - startTime,
      itemsProcessed
    }
    
  } catch (error) {
    logError(
      error as Error,
      'medium',
      'api',
      { context: 'waitlist_cleanup_cron' }
    )
    
    return {
      task: 'cleanupExpiredWaitlist',
      success: false,
      duration: Date.now() - startTime,
      error: (error as Error).message
    }
  }
}

// Update daily analytics
async function updateDailyAnalytics(): Promise<CronTaskResult> {
  const startTime = Date.now()
  let itemsProcessed = 0
  
  try {
    const supabase = await createClient()
    
    // Calculate analytics for yesterday
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    yesterday.setHours(0, 0, 0, 0)
    
    const today = new Date(yesterday)
    today.setDate(today.getDate() + 1)
    
    // Get all locations
    const { data: locations, error: locationsError } = await supabase
      .from('locations')
      .select('id')
      .eq('is_active', true)
      
    if (locationsError) {
      throw new Error(`Failed to fetch locations: ${locationsError.message}`)
    }
    
    if (!locations || locations.length === 0) {
      console.log('No active locations found for analytics')
      return {
        task: 'updateDailyAnalytics',
        success: true,
        duration: Date.now() - startTime,
        itemsProcessed: 0
      }
    }
    
    // Process analytics for each location
    for (const location of locations) {
      try {
        // Get bookings data for the location for yesterday
        const { data: bookings, error: bookingsError } = await supabase
          .from('bookings')
          .select(`
            id,
            total_price,
            status,
            customer_id,
            created_at
          `)
          .eq('location_id', location.id)
          .gte('scheduled_at', yesterday.toISOString())
          .lt('scheduled_at', today.toISOString())
          
        if (bookingsError) {
          logError(
            `Failed to fetch bookings for location ${location.id}: ${bookingsError.message}`,
            'medium',
            'api'
          )
          continue
        }
        
        const bookingsArray = bookings || []
        
        // Calculate metrics
        const totalBookings = bookingsArray.length
        const totalRevenue = bookingsArray
          .filter(b => b.status === 'completed')
          .reduce((sum, b) => sum + (b.total_price || 0), 0)
        
        const noShowCount = bookingsArray.filter(b => b.status === 'no_show').length
        const cancellationCount = bookingsArray.filter(b => b.status === 'cancelled').length
        
        const completedBookings = bookingsArray.filter(b => b.status === 'completed')
        const averageBookingValue = completedBookings.length > 0 
          ? totalRevenue / completedBookings.length 
          : 0
        
        // Count new vs returning customers
        const uniqueCustomers = [...new Set(bookingsArray.map(b => b.customer_id))]
        let newCustomers = 0
        let returningCustomers = 0
        
        for (const customerId of uniqueCustomers) {
          // Check if customer had bookings before yesterday
          const { data: previousBookings } = await supabase
            .from('bookings')
            .select('id')
            .eq('customer_id', customerId)
            .lt('created_at', yesterday.toISOString())
            .limit(1)
            
          if (previousBookings && previousBookings.length > 0) {
            returningCustomers++
          } else {
            newCustomers++
          }
        }
        
        // Insert or update daily analytics
        const analyticsData = {
          location_id: location.id,
          date: yesterday.toISOString().split('T')[0], // Just the date part
          total_bookings: totalBookings,
          total_revenue: totalRevenue,
          new_customers: newCustomers,
          returning_customers: returningCustomers,
          average_booking_value: averageBookingValue,
          no_show_count: noShowCount,
          cancellation_count: cancellationCount,
        }
        
        const { error: analyticsError } = await supabase
          .from('analytics_daily')
          .upsert(analyticsData, {
            onConflict: 'location_id,date'
          })
          
        if (analyticsError) {
          logError(
            `Failed to insert analytics for location ${location.id}: ${analyticsError.message}`,
            'medium',
            'api'
          )
          continue
        }
        
        itemsProcessed++
        
      } catch (locationError) {
        logError(
          `Failed to process analytics for location ${location.id}: ${locationError}`,
          'medium',
          'api',
          { locationId: location.id }
        )
      }
    }
    
    console.log(`Updated daily analytics for ${itemsProcessed} locations`)
    
    return {
      task: 'updateDailyAnalytics',
      success: true,
      duration: Date.now() - startTime,
      itemsProcessed
    }
    
  } catch (error) {
    logCriticalError(
      error as Error,
      'api',
      { context: 'daily_analytics_cron' }
    )
    
    return {
      task: 'updateDailyAnalytics',
      success: false,
      duration: Date.now() - startTime,
      error: (error as Error).message
    }
  }
}

// Clean up old notifications
async function cleanupOldNotifications(): Promise<CronTaskResult> {
  const startTime = Date.now()
  let itemsProcessed = 0
  
  try {
    const supabase = await createClient()
    
    // Delete notifications older than 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const { data: deletedNotifications, error } = await supabase
      .from('notifications')
      .delete()
      .lt('created_at', thirtyDaysAgo.toISOString())
      .select('id')
      
    if (error) {
      throw new Error(`Failed to delete old notifications: ${error.message}`)
    }
    
    itemsProcessed = deletedNotifications?.length || 0
    console.log(`Deleted ${itemsProcessed} old notifications`)
    
    return {
      task: 'cleanupOldNotifications',
      success: true,
      duration: Date.now() - startTime,
      itemsProcessed
    }
    
  } catch (error) {
    logError(
      error as Error,
      'low',
      'api',
      { context: 'notification_cleanup_cron' }
    )
    
    return {
      task: 'cleanupOldNotifications',
      success: false,
      duration: Date.now() - startTime,
      error: (error as Error).message
    }
  }
}

// Available cron tasks
const CRON_TASKS: Record<string, CronTask> = {
  'appointment-reminders': {
    name: 'appointment-reminders',
    description: 'Send appointment reminders for tomorrow\'s appointments',
    schedule: '0 18 * * *', // Daily at 6 PM
    handler: sendAppointmentReminders
  },
  'waitlist-cleanup': {
    name: 'waitlist-cleanup',
    description: 'Clean up expired waitlist entries',
    schedule: '0 2 * * *', // Daily at 2 AM
    handler: cleanupExpiredWaitlist
  },
  'daily-analytics': {
    name: 'daily-analytics',
    description: 'Update daily analytics for all locations',
    schedule: '0 1 * * *', // Daily at 1 AM
    handler: updateDailyAnalytics
  },
  'cleanup-notifications': {
    name: 'cleanup-notifications',
    description: 'Clean up old notifications (30+ days)',
    schedule: '0 3 * * 0', // Weekly on Sunday at 3 AM
    handler: cleanupOldNotifications
  }
}

// POST handler for running cron tasks
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Verify authorization
    if (!verifyCronAuth(request)) {
      logApiError(
        'Unauthorized cron request',
        '/api/cron',
        401
      )
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const { searchParams } = new URL(request.url)
    const taskName = searchParams.get('task')
    
    // If no task specified, run all tasks
    const tasksToRun = taskName 
      ? [taskName]
      : Object.keys(CRON_TASKS)
    
    console.log(`Running cron tasks: ${tasksToRun.join(', ')}`)
    
    const results: CronTaskResult[] = []
    
    // Execute tasks sequentially to avoid overwhelming the system
    for (const task of tasksToRun) {
      if (!CRON_TASKS[task]) {
        results.push({
          task,
          success: false,
          duration: 0,
          error: 'Task not found'
        })
        continue
      }
      
      console.log(`Executing cron task: ${task}`)
      const result = await CRON_TASKS[task].handler()
      results.push(result)
      
      console.log(`Cron task ${task} completed in ${result.duration}ms`)
    }
    
    // Calculate summary
    const totalDuration = results.reduce((sum, r) => sum + r.duration, 0)
    const successCount = results.filter(r => r.success).length
    const totalProcessed = results.reduce((sum, r) => sum + (r.itemsProcessed || 0), 0)
    
    const response = {
      success: true,
      tasksRun: tasksToRun.length,
      successfulTasks: successCount,
      failedTasks: tasksToRun.length - successCount,
      totalDuration,
      totalItemsProcessed: totalProcessed,
      timestamp: new Date().toISOString(),
      results
    }
    
    console.log(`Cron execution completed: ${successCount}/${tasksToRun.length} tasks successful`)
    
    return NextResponse.json(response)
    
  } catch (error) {
    logCriticalError(
      error as Error,
      'api',
      { context: 'cron_handler', endpoint: '/api/cron' }
    )
    
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to execute cron tasks'
      },
      { status: 500 }
    )
  }
}

// GET handler for cron status and task list
export async function GET(): Promise<NextResponse> {
  try {
    const tasks = Object.values(CRON_TASKS).map(task => ({
      name: task.name,
      description: task.description,
      schedule: task.schedule
    }))
    
    return NextResponse.json({
      status: 'active',
      totalTasks: tasks.length,
      tasks,
      timestamp: new Date().toISOString(),
      authConfigured: !!process.env.CRON_SECRET
    })
    
  } catch (error) {
    logError(
      error as Error,
      'low',
      'api',
      { context: 'cron_status_check' }
    )
    
    return NextResponse.json(
      { error: 'Failed to get cron status' },
      { status: 500 }
    )
  }
}