'use server'

import { createClient } from '@/lib/database/supabase/server'
import { Database } from '@/types/database.types'
import { revalidatePath } from 'next/cache'

type Settings = Database['public']['Tables']['settings']['Row']
type SettingsInsert = Database['public']['Tables']['settings']['Insert']
type SettingsUpdate = Database['public']['Tables']['settings']['Update']
type SystemConfiguration = Database['public']['Tables']['system_configuration']['Row']

// Settings Management
export async function getSettings(category?: string, salonId?: string) {
  const supabase = await createClient()
  
  const query = supabase
    .from('settings')
    .select('*')
    .order('category', { ascending: true })
    .order('key', { ascending: true })

  if (category) {
    query.eq('category', category)
  }

  if (salonId) {
    query.eq('salon_id', salonId)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching settings:', error)
    throw new Error('Failed to fetch settings')
  }

  return data
}

export async function getSetting(key: string, salonId?: string) {
  const supabase = await createClient()
  
  const query = supabase
    .from('settings')
    .select('*')
    .eq('key', key)
    .single()

  if (salonId) {
    query.eq('salon_id', salonId)
  }

  const { data, error } = await query

  if (error && error.code !== 'PGRST116') { // Ignore not found errors
    console.error('Error fetching setting:', error)
    throw new Error('Failed to fetch setting')
  }

  return data
}

export async function updateSetting(key: string, value: any, salonId?: string) {
  const supabase = await createClient()
  
  // Check if setting exists
  const existing = await getSetting(key, salonId)
  
  if (existing) {
    // Update existing setting
    const { data, error } = await supabase
      .from('settings')
      .update({
        value,
        updated_at: new Date().toISOString()
      })
      .eq('key', key)
      .eq('salon_id', salonId || existing.salon_id)
      .select()
      .single()

    if (error) {
      console.error('Error updating setting:', error)
      throw new Error('Failed to update setting')
    }

    revalidatePath('/salon-admin/settings')
    revalidatePath('/super-admin/settings')
    
    return data
  } else {
    // Create new setting
    const { data, error } = await supabase
      .from('settings')
      .insert({
        key,
        value,
        salon_id: salonId,
        category: getCategoryFromKey(key)
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating setting:', error)
      throw new Error('Failed to create setting')
    }

    revalidatePath('/salon-admin/settings')
    revalidatePath('/super-admin/settings')
    
    return data
  }
}

export async function bulkUpdateSettings(settings: Array<{ key: string; value: any }>, salonId?: string) {
  const supabase = await createClient()
  
  const updates = await Promise.all(
    settings.map(({ key, value }) => updateSetting(key, value, salonId))
  )
  
  return updates
}

// System Configuration (Super Admin)
export async function getSystemConfiguration() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('system_configuration')
    .select('*')
    .order('category', { ascending: true })
    .order('key', { ascending: true })

  if (error) {
    console.error('Error fetching system configuration:', error)
    throw new Error('Failed to fetch system configuration')
  }

  return data
}

export async function updateSystemConfiguration(key: string, value: any) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('system_configuration')
    .update({
      value,
      updated_at: new Date().toISOString()
    })
    .eq('key', key)
    .select()
    .single()

  if (error) {
    console.error('Error updating system configuration:', error)
    throw new Error('Failed to update system configuration')
  }

  revalidatePath('/super-admin/settings')
  
  return data
}

// Helper function to determine category from key
function getCategoryFromKey(key: string): string {
  const categoryMappings: Record<string, string> = {
    // General
    'business_name': 'general',
    'business_email': 'general',
    'business_phone': 'general',
    'timezone': 'general',
    'currency': 'general',
    'date_format': 'general',
    'time_format': 'general',
    
    // Booking
    'booking_enabled': 'booking',
    'booking_advance_days': 'booking',
    'booking_min_notice_hours': 'booking',
    'booking_max_per_day': 'booking',
    'booking_requires_approval': 'booking',
    'booking_allow_cancellation': 'booking',
    'booking_cancellation_hours': 'booking',
    
    // Notifications
    'notifications_email_enabled': 'notifications',
    'notifications_sms_enabled': 'notifications',
    'notifications_push_enabled': 'notifications',
    'notifications_booking_confirmation': 'notifications',
    'notifications_booking_reminder': 'notifications',
    'notifications_review_request': 'notifications',
    
    // Payments
    'payments_enabled': 'payments',
    'payments_stripe_enabled': 'payments',
    'payments_cash_enabled': 'payments',
    'payments_deposit_required': 'payments',
    'payments_deposit_percentage': 'payments',
    
    // Marketing
    'marketing_enabled': 'marketing',
    'marketing_email_campaigns': 'marketing',
    'marketing_sms_campaigns': 'marketing',
    'marketing_loyalty_enabled': 'marketing',
    'marketing_referral_enabled': 'marketing',
    
    // Staff
    'staff_commission_enabled': 'staff',
    'staff_commission_percentage': 'staff',
    'staff_schedule_visible': 'staff',
    'staff_can_manage_bookings': 'staff',
    'staff_can_view_earnings': 'staff',
    
    // Reviews
    'reviews_enabled': 'reviews',
    'reviews_auto_request': 'reviews',
    'reviews_require_approval': 'reviews',
    'reviews_min_rating_display': 'reviews',
    
    // Security
    'security_two_factor': 'security',
    'security_password_expiry': 'security',
    'security_session_timeout': 'security',
    'security_ip_whitelist': 'security',
  }
  
  // Find matching category or default to 'general'
  for (const [pattern, category] of Object.entries(categoryMappings)) {
    if (key.startsWith(pattern.split('_')[0])) {
      return category
    }
  }
  
  return 'general'
}

// Preset setting templates
export const SETTING_TEMPLATES = {
  general: [
    { key: 'business_name', label: 'Business Name', type: 'text', defaultValue: '' },
    { key: 'business_email', label: 'Business Email', type: 'email', defaultValue: '' },
    { key: 'business_phone', label: 'Business Phone', type: 'tel', defaultValue: '' },
    { key: 'timezone', label: 'Timezone', type: 'select', defaultValue: 'America/New_York' },
    { key: 'currency', label: 'Currency', type: 'select', defaultValue: 'USD' },
    { key: 'date_format', label: 'Date Format', type: 'select', defaultValue: 'MM/DD/YYYY' },
    { key: 'time_format', label: 'Time Format', type: 'select', defaultValue: '12h' },
  ],
  booking: [
    { key: 'booking_enabled', label: 'Enable Online Booking', type: 'boolean', defaultValue: true },
    { key: 'booking_advance_days', label: 'Max Advance Booking (days)', type: 'number', defaultValue: 30 },
    { key: 'booking_min_notice_hours', label: 'Min Notice (hours)', type: 'number', defaultValue: 2 },
    { key: 'booking_max_per_day', label: 'Max Bookings Per Day', type: 'number', defaultValue: 50 },
    { key: 'booking_requires_approval', label: 'Require Approval', type: 'boolean', defaultValue: false },
    { key: 'booking_allow_cancellation', label: 'Allow Cancellation', type: 'boolean', defaultValue: true },
    { key: 'booking_cancellation_hours', label: 'Cancellation Notice (hours)', type: 'number', defaultValue: 24 },
  ],
  notifications: [
    { key: 'notifications_email_enabled', label: 'Email Notifications', type: 'boolean', defaultValue: true },
    { key: 'notifications_sms_enabled', label: 'SMS Notifications', type: 'boolean', defaultValue: false },
    { key: 'notifications_push_enabled', label: 'Push Notifications', type: 'boolean', defaultValue: false },
    { key: 'notifications_booking_confirmation', label: 'Booking Confirmations', type: 'boolean', defaultValue: true },
    { key: 'notifications_booking_reminder', label: 'Booking Reminders', type: 'boolean', defaultValue: true },
    { key: 'notifications_review_request', label: 'Review Requests', type: 'boolean', defaultValue: true },
  ],
  payments: [
    { key: 'payments_enabled', label: 'Enable Payments', type: 'boolean', defaultValue: true },
    { key: 'payments_stripe_enabled', label: 'Enable Stripe', type: 'boolean', defaultValue: true },
    { key: 'payments_cash_enabled', label: 'Accept Cash', type: 'boolean', defaultValue: true },
    { key: 'payments_deposit_required', label: 'Require Deposit', type: 'boolean', defaultValue: false },
    { key: 'payments_deposit_percentage', label: 'Deposit Percentage', type: 'number', defaultValue: 20 },
  ],
  marketing: [
    { key: 'marketing_enabled', label: 'Enable Marketing', type: 'boolean', defaultValue: true },
    { key: 'marketing_email_campaigns', label: 'Email Campaigns', type: 'boolean', defaultValue: true },
    { key: 'marketing_sms_campaigns', label: 'SMS Campaigns', type: 'boolean', defaultValue: false },
    { key: 'marketing_loyalty_enabled', label: 'Loyalty Program', type: 'boolean', defaultValue: true },
    { key: 'marketing_referral_enabled', label: 'Referral Program', type: 'boolean', defaultValue: false },
  ],
  staff: [
    { key: 'staff_commission_enabled', label: 'Enable Commissions', type: 'boolean', defaultValue: true },
    { key: 'staff_commission_percentage', label: 'Commission %', type: 'number', defaultValue: 30 },
    { key: 'staff_schedule_visible', label: 'Public Schedule', type: 'boolean', defaultValue: true },
    { key: 'staff_can_manage_bookings', label: 'Manage Own Bookings', type: 'boolean', defaultValue: true },
    { key: 'staff_can_view_earnings', label: 'View Own Earnings', type: 'boolean', defaultValue: true },
  ],
  reviews: [
    { key: 'reviews_enabled', label: 'Enable Reviews', type: 'boolean', defaultValue: true },
    { key: 'reviews_auto_request', label: 'Auto Request Reviews', type: 'boolean', defaultValue: true },
    { key: 'reviews_require_approval', label: 'Require Approval', type: 'boolean', defaultValue: false },
    { key: 'reviews_min_rating_display', label: 'Min Rating to Display', type: 'number', defaultValue: 3 },
  ],
}