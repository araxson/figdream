'use server'

import { createClient } from '@/lib/database/supabase/server'
import { Database } from '@/types/database.types'

// Type definitions from database
type CustomerPreference = Database['public']['Tables']['customer_preferences']['Row']
type CustomerPreferenceInsert = Database['public']['Tables']['customer_preferences']['Insert']
type CustomerPreferenceUpdate = Database['public']['Tables']['customer_preferences']['Update']

export interface PreferenceSettings {
  preferred_staff?: string[]
  preferred_services?: string[]
  preferred_times?: string[]
  preferred_days?: number[]
  communication_preferences?: {
    email: boolean
    sms: boolean
    push: boolean
    marketing: boolean
  }
  accessibility_needs?: string[]
  language?: string
  notes?: string
}

export interface NotificationPreferences {
  appointment_reminders: boolean
  appointment_confirmations: boolean
  marketing_emails: boolean
  marketing_sms: boolean
  loyalty_updates: boolean
  review_requests: boolean
  birthday_wishes: boolean
}

/**
 * Get customer preferences
 * @param customerId - The customer ID
 * @returns Customer preference record
 */
export async function getCustomerPreferences(
  customerId: string
): Promise<CustomerPreference | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('customer_preferences')
    .select('*')
    .eq('customer_id', customerId)
    .single()
  
  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching customer preferences:', error)
    throw new Error('Failed to fetch customer preferences')
  }
  
  return data
}

/**
 * Create or update customer preferences
 * @param customerId - The customer ID
 * @param preferences - Preference settings
 * @returns The created or updated preference record
 */
export async function upsertCustomerPreferences(
  customerId: string,
  preferences: Omit<CustomerPreferenceInsert, 'customer_id'>
): Promise<CustomerPreference> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('customer_preferences')
    .upsert({
      customer_id: customerId,
      ...preferences,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'customer_id'
    })
    .select()
    .single()
  
  if (error) {
    console.error('Error upserting customer preferences:', error)
    throw new Error('Failed to update customer preferences')
  }
  
  return data
}

/**
 * Update specific customer preferences
 * @param customerId - The customer ID
 * @param updates - Partial preference updates
 * @returns Updated preference record
 */
export async function updateCustomerPreferences(
  customerId: string,
  updates: CustomerPreferenceUpdate
): Promise<CustomerPreference> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('customer_preferences')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('customer_id', customerId)
    .select()
    .single()
  
  if (error) {
    console.error('Error updating customer preferences:', error)
    throw new Error('Failed to update customer preferences')
  }
  
  return data
}

/**
 * Set preferred staff members for a customer
 * @param customerId - The customer ID
 * @param staffIds - Array of preferred staff IDs
 * @returns Updated preferences
 */
export async function setPreferredStaff(
  customerId: string,
  staffIds: string[]
): Promise<CustomerPreference> {
  return upsertCustomerPreferences(customerId, {
    preferred_staff_ids: staffIds
  })
}

/**
 * Set preferred services for a customer
 * @param customerId - The customer ID
 * @param serviceIds - Array of preferred service IDs
 * @returns Updated preferences
 */
export async function setPreferredServices(
  customerId: string,
  serviceIds: string[]
): Promise<CustomerPreference> {
  return upsertCustomerPreferences(customerId, {
    preferred_service_ids: serviceIds
  })
}

/**
 * Update notification preferences
 * @param customerId - The customer ID
 * @param notifications - Notification settings
 * @returns Updated preferences
 */
export async function updateNotificationPreferences(
  customerId: string,
  notifications: NotificationPreferences
): Promise<CustomerPreference> {
  return upsertCustomerPreferences(customerId, {
    email_reminders: notifications.appointment_reminders,
    sms_reminders: notifications.appointment_reminders,
    marketing_emails: notifications.marketing_emails,
    marketing_sms: notifications.marketing_sms
  })
}

/**
 * Get customers with specific preferences
 * @param filters - Preference filters
 * @returns Array of customer preferences matching filters
 */
export async function getCustomersByPreferences(filters: {
  preferred_staff_id?: string
  preferred_service_id?: string
  email_reminders?: boolean
  sms_reminders?: boolean
  marketing_emails?: boolean
  marketing_sms?: boolean
}): Promise<CustomerPreference[]> {
  const supabase = await createClient()
  
  let query = supabase.from('customer_preferences').select('*')
  
  if (filters.preferred_staff_id) {
    query = query.contains('preferred_staff_ids', [filters.preferred_staff_id])
  }
  if (filters.preferred_service_id) {
    query = query.contains('preferred_service_ids', [filters.preferred_service_id])
  }
  if (filters.email_reminders !== undefined) {
    query = query.eq('email_reminders', filters.email_reminders)
  }
  if (filters.sms_reminders !== undefined) {
    query = query.eq('sms_reminders', filters.sms_reminders)
  }
  if (filters.marketing_emails !== undefined) {
    query = query.eq('marketing_emails', filters.marketing_emails)
  }
  if (filters.marketing_sms !== undefined) {
    query = query.eq('marketing_sms', filters.marketing_sms)
  }
  
  const { data, error } = await query
  
  if (error) {
    console.error('Error fetching customers by preferences:', error)
    throw new Error('Failed to fetch customers')
  }
  
  return data || []
}

/**
 * Check if customer wants reminders
 * @param customerId - The customer ID
 * @param type - Type of reminder ('email' or 'sms')
 * @returns Whether customer wants reminders
 */
export async function checkReminderPreference(
  customerId: string,
  type: 'email' | 'sms'
): Promise<boolean> {
  const preferences = await getCustomerPreferences(customerId)
  
  if (!preferences) {
    return true // Default to sending reminders if no preferences set
  }
  
  return type === 'email' ? 
    preferences.email_reminders !== false : 
    preferences.sms_reminders !== false
}

/**
 * Check if customer wants marketing communications
 * @param customerId - The customer ID
 * @param type - Type of marketing ('email' or 'sms')
 * @returns Whether customer wants marketing
 */
export async function checkMarketingPreference(
  customerId: string,
  type: 'email' | 'sms'
): Promise<boolean> {
  const preferences = await getCustomerPreferences(customerId)
  
  if (!preferences) {
    return false // Default to no marketing if no preferences set
  }
  
  return type === 'email' ? 
    preferences.marketing_emails === true : 
    preferences.marketing_sms === true
}

/**
 * Set customer's preferred booking times
 * @param customerId - The customer ID
 * @param timeSlots - Array of preferred time slots (e.g., ['09:00', '14:00'])
 * @returns Updated preferences
 */
export async function setPreferredTimes(
  customerId: string,
  timeSlots: string[]
): Promise<CustomerPreference> {
  return upsertCustomerPreferences(customerId, {
    preferred_time_slots: timeSlots
  })
}

/**
 * Set customer's preferred days of week
 * @param customerId - The customer ID
 * @param days - Array of preferred days (0 = Sunday, 6 = Saturday)
 * @returns Updated preferences
 */
export async function setPreferredDays(
  customerId: string,
  days: number[]
): Promise<CustomerPreference> {
  return upsertCustomerPreferences(customerId, {
    preferred_days_of_week: days
  })
}

/**
 * Add a note to customer preferences
 * @param customerId - The customer ID
 * @param note - Note to add
 * @returns Updated preferences
 */
export async function addCustomerNote(
  customerId: string,
  note: string
): Promise<CustomerPreference> {
  const current = await getCustomerPreferences(customerId)
  const existingNotes = current?.notes || ''
  
  return upsertCustomerPreferences(customerId, {
    notes: existingNotes ? `${existingNotes}\n${note}` : note
  })
}

/**
 * Get customer's preferred staff members
 * @param customerId - The customer ID
 * @returns Array of staff IDs
 */
export async function getPreferredStaffIds(customerId: string): Promise<string[]> {
  const preferences = await getCustomerPreferences(customerId)
  return preferences?.preferred_staff_ids || []
}

/**
 * Get customer's preferred services
 * @param customerId - The customer ID
 * @returns Array of service IDs
 */
export async function getPreferredServiceIds(customerId: string): Promise<string[]> {
  const preferences = await getCustomerPreferences(customerId)
  return preferences?.preferred_service_ids || []
}

/**
 * Bulk update preferences for multiple customers
 * @param updates - Array of customer preference updates
 * @returns Number of updated records
 */
export async function bulkUpdatePreferences(
  updates: Array<{ customer_id: string } & Partial<CustomerPreferenceUpdate>>
): Promise<number> {
  const supabase = await createClient()
  
  const updatesWithTimestamp = updates.map(update => ({
    ...update,
    updated_at: new Date().toISOString()
  }))
  
  const { data, error } = await supabase
    .from('customer_preferences')
    .upsert(updatesWithTimestamp, {
      onConflict: 'customer_id'
    })
    .select()
  
  if (error) {
    console.error('Error bulk updating preferences:', error)
    throw new Error('Failed to bulk update preferences')
  }
  
  return data?.length || 0
}

/**
 * Reset customer preferences to defaults
 * @param customerId - The customer ID
 * @returns Reset preferences
 */
export async function resetCustomerPreferences(customerId: string): Promise<CustomerPreference> {
  return upsertCustomerPreferences(customerId, {
    preferred_staff_ids: [],
    preferred_service_ids: [],
    preferred_time_slots: [],
    preferred_days_of_week: [],
    email_reminders: true,
    sms_reminders: true,
    marketing_emails: false,
    marketing_sms: false,
    notes: null
  })
}

/**
 * Copy preferences from one customer to another
 * @param sourceCustomerId - Source customer ID
 * @param targetCustomerId - Target customer ID
 * @returns Copied preferences
 */
export async function copyCustomerPreferences(
  sourceCustomerId: string,
  targetCustomerId: string
): Promise<CustomerPreference> {
  const sourcePrefs = await getCustomerPreferences(sourceCustomerId)
  
  if (!sourcePrefs) {
    throw new Error('Source customer has no preferences')
  }
  
  return upsertCustomerPreferences(targetCustomerId, {
    preferred_staff_ids: sourcePrefs.preferred_staff_ids,
    preferred_service_ids: sourcePrefs.preferred_service_ids,
    preferred_time_slots: sourcePrefs.preferred_time_slots,
    preferred_days_of_week: sourcePrefs.preferred_days_of_week,
    email_reminders: sourcePrefs.email_reminders,
    sms_reminders: sourcePrefs.sms_reminders,
    marketing_emails: sourcePrefs.marketing_emails,
    marketing_sms: sourcePrefs.marketing_sms,
    notes: sourcePrefs.notes
  })
}