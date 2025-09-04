'use server'
import { createClient } from '@/lib/database/supabase/server'
import { Database } from '@/types/database.types'
import { revalidatePath } from 'next/cache'
// type SmsOptOut = Database['public']['Tables']['sms_opt_outs']['Row']
type SmsOptOutInsert = Database['public']['Tables']['sms_opt_outs']['Insert']
// Get all SMS opt-outs for a salon
export async function getSmsOptOuts(salonId?: string) {
  const supabase = await createClient()
  let query = supabase
    .from('sms_opt_outs')
    .select(`
      *,
      customers (
        id,
        first_name,
        last_name,
        email,
        phone
      )
    `)
    .order('opted_out_at', { ascending: false })
  if (salonId) {
    query = query.eq('salon_id', salonId)
  }
  const { data, error } = await query
  if (error) {
    throw new Error('Failed to fetch SMS opt-outs')
  }
  return data
}
// Check if a phone number is opted out
export async function isPhoneOptedOut(phone: string, salonId?: string): Promise<boolean> {
  const supabase = await createClient()
  let query = supabase
    .from('sms_opt_outs')
    .select('id')
    .eq('phone', phone)
    .limit(1)
  if (salonId) {
    query = query.eq('salon_id', salonId)
  }
  const { data, error } = await query
  if (error) {
    return false
  }
  return data.length > 0
}
// Opt out a phone number
export async function optOutPhone(optOut: SmsOptOutInsert) {
  const supabase = await createClient()
  // Check if already opted out
  const isOptedOut = await isPhoneOptedOut(optOut.phone, optOut.salon_id || undefined)
  if (isOptedOut) {
    throw new Error('This phone number is already opted out')
  }
  const { data, error } = await supabase
    .from('sms_opt_outs')
    .insert(optOut)
    .select()
    .single()
  if (error) {
    throw new Error('Failed to opt out phone number')
  }
  // Also update notification settings if customer exists
  if (optOut.customer_id) {
    const { error: updateError } = await supabase
      .from('notification_settings')
      .update({
        sms_enabled: false,
        booking_confirmation_sms: false,
        booking_reminder_sms: false,
        booking_cancellation_sms: false,
        review_request_sms: false,
        marketing_sms: false,
        loyalty_updates_sms: false,
        staff_updates_sms: false,
        system_updates_sms: false,
      })
      .eq('user_id', optOut.customer_id)
    if (updateError) {
    }
  }
  revalidatePath('/salon-owner/marketing/sms-opt-outs')
  return data
}
// Remove opt-out (re-subscribe)
export async function removeOptOut(id: string) {
  const supabase = await createClient()
  // Get the opt-out record first
  const { data: optOut, error: fetchError } = await supabase
    .from('sms_opt_outs')
    .select('*')
    .eq('id', id)
    .single()
  if (fetchError || !optOut) {
    throw new Error('Opt-out record not found')
  }
  // Delete the opt-out
  const { error } = await supabase
    .from('sms_opt_outs')
    .delete()
    .eq('id', id)
  if (error) {
    throw new Error('Failed to remove opt-out')
  }
  // Re-enable SMS in notification settings if customer exists
  if (optOut.customer_id) {
    const { error: updateError } = await supabase
      .from('notification_settings')
      .update({
        sms_enabled: true,
      })
      .eq('user_id', optOut.customer_id)
    if (updateError) {
    }
  }
  revalidatePath('/salon-owner/marketing/sms-opt-outs')
  return { success: true }
}
// Bulk opt-out from CSV or list
export async function bulkOptOut(
  phones: string[],
  reason: string,
  salonId?: string
) {
  const supabase = await createClient()
  // Filter out already opted-out numbers
  const newOptOuts: SmsOptOutInsert[] = []
  for (const phone of phones) {
    const isOptedOut = await isPhoneOptedOut(phone, salonId)
    if (!isOptedOut) {
      newOptOuts.push({
        phone,
        salon_id: salonId,
        reason,
        opted_out_at: new Date().toISOString(),
      })
    }
  }
  if (newOptOuts.length === 0) {
    return { success: true, count: 0, message: 'All numbers are already opted out' }
  }
  const { data, error } = await supabase
    .from('sms_opt_outs')
    .insert(newOptOuts)
    .select()
  if (error) {
    throw new Error('Failed to bulk opt-out phone numbers')
  }
  revalidatePath('/salon-owner/marketing/sms-opt-outs')
  return { 
    success: true, 
    count: data.length,
    message: `Successfully opted out ${data.length} phone number(s)`
  }
}
// Get opt-out statistics
export async function getOptOutStats(salonId?: string) {
  const supabase = await createClient()
  let query = supabase
    .from('sms_opt_outs')
    .select('id, opted_out_at, reason')
  if (salonId) {
    query = query.eq('salon_id', salonId)
  }
  const { data, error } = await query
  if (error) {
    throw new Error('Failed to fetch opt-out statistics')
  }
  // Calculate statistics
  const total = data.length
  const thisMonth = data.filter(opt => {
    const date = new Date(opt.opted_out_at)
    const now = new Date()
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
  }).length
  const lastMonth = data.filter(opt => {
    const date = new Date(opt.opted_out_at)
    const now = new Date()
    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1)
    return date.getMonth() === lastMonthDate.getMonth() && 
           date.getFullYear() === lastMonthDate.getFullYear()
  }).length
  // Group by reason
  const byReason = data.reduce((acc, opt) => {
    const reason = opt.reason || 'Not specified'
    acc[reason] = (acc[reason] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  return {
    total,
    thisMonth,
    lastMonth,
    monthlyChange: lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth * 100).toFixed(1) : '0',
    byReason
  }
}
// Process unsubscribe request (from SMS reply)
export async function processUnsubscribeRequest(
  phone: string,
  message: string,
  salonId?: string
) {
  // Check common unsubscribe keywords
  const unsubKeywords = ['stop', 'unsubscribe', 'quit', 'cancel', 'optout', 'opt-out', 'remove']
  const normalizedMessage = message.toLowerCase().trim()
  const isUnsubRequest = unsubKeywords.some(keyword => normalizedMessage.includes(keyword))
  if (!isUnsubRequest) {
    return { processed: false, message: 'Not an unsubscribe request' }
  }
  try {
    await optOutPhone({
      phone,
      salon_id: salonId,
      reason: `SMS reply: ${message}`,
      opted_out_at: new Date().toISOString(),
    })
    return { 
      processed: true, 
      message: 'Successfully processed unsubscribe request' 
    }
  } catch (_error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    if (errorMessage === 'This phone number is already opted out') {
      return { 
        processed: true, 
        message: 'Phone number was already opted out' 
      }
    }
    throw error
  }
}