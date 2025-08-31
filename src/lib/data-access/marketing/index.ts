'use server'

import { createClient } from '@/lib/database/supabase/server'
import type { Database } from '@/types/database.types'
import { getUserWithRole } from '../auth/verify'
import { hasMinimumRoleLevel } from '../auth/roles'
import { canAccessSalon } from '../auth/permissions'

// ULTRA-TYPES: Comprehensive marketing types with future-proofing
type EmailCampaign = Database['public']['Tables']['email_campaigns']['Row']
type EmailCampaignInsert = Database['public']['Tables']['email_campaigns']['Insert']
type EmailCampaignUpdate = Database['public']['Tables']['email_campaigns']['Update']

type SmsCampaign = Database['public']['Tables']['sms_campaigns']['Row']
type SmsCampaignInsert = Database['public']['Tables']['sms_campaigns']['Insert']
type SmsCampaignUpdate = Database['public']['Tables']['sms_campaigns']['Update']

type EmailCampaignRecipient = Database['public']['Tables']['email_campaign_recipients']['Row']
type SmsCampaignRecipient = Database['public']['Tables']['sms_campaign_recipients']['Row']
type SmsOptOut = Database['public']['Tables']['sms_opt_outs']['Row']

// ULTRA-INTERFACES: Extended campaign types with analytics
export interface EmailCampaignWithStats extends EmailCampaign {
  recipients_count?: number
  sent_count?: number
  opened_count?: number
  clicked_count?: number
  bounced_count?: number
  unsubscribed_count?: number
  open_rate?: number
  click_rate?: number
  bounce_rate?: number
  conversion_rate?: number
  revenue_generated?: number
}

export interface SmsCampaignWithStats extends SmsCampaign {
  recipients_count?: number
  sent_count?: number
  delivered_count?: number
  failed_count?: number
  clicked_count?: number
  opted_out_count?: number
  delivery_rate?: number
  click_rate?: number
  opt_out_rate?: number
  cost?: number
}

export interface CampaignSegment {
  id: string
  name: string
  description?: string
  criteria: {
    customer_type?: 'all' | 'new' | 'returning' | 'vip' | 'inactive'
    last_visit?: { days: number; operator: 'within' | 'before' | 'exactly' }
    total_spent?: { amount: number; operator: 'gt' | 'lt' | 'eq' }
    service_categories?: string[]
    location_ids?: string[]
    has_email?: boolean
    has_phone?: boolean
    opt_in_marketing?: boolean
  }
  customer_count?: number
}

export interface CampaignTemplate {
  id: string
  name: string
  type: 'email' | 'sms'
  category: 'promotional' | 'transactional' | 'reminder' | 'survey'
  subject?: string
  preview_text?: string
  html_content?: string
  text_content: string
  variables?: string[]
  thumbnail_url?: string
  is_active: boolean
}

// ULTRA-CONSTANTS: Campaign configuration
export const CAMPAIGN_STATUS = {
  DRAFT: 'draft',
  SCHEDULED: 'scheduled',
  SENDING: 'sending',
  SENT: 'sent',
  PAUSED: 'paused',
  CANCELLED: 'cancelled',
  FAILED: 'failed'
} as const

export const CAMPAIGN_TYPES = {
  PROMOTIONAL: 'promotional',
  TRANSACTIONAL: 'transactional',
  REMINDER: 'reminder',
  SURVEY: 'survey',
  NEWSLETTER: 'newsletter',
  ANNOUNCEMENT: 'announcement'
} as const

// ULTRA-RESULTS: Standardized result types
export interface CampaignResult<T> {
  data: T | null
  error: string | null
}

export interface CampaignListResult<T> {
  data: T[] | null
  error: string | null
  total_count?: number
}

// ULTRA-FUNCTION: Get email campaigns with statistics
export async function getEmailCampaigns(
  filters?: {
    salon_id?: string
    status?: string
    type?: string
    limit?: number
    offset?: number
  }
): Promise<CampaignListResult<EmailCampaignWithStats>> {
  try {
    const { user, role, error: authError } = await getUserWithRole()
    
    if (authError || !user) {
      return { data: null, error: authError || 'Not authenticated' }
    }

    if (!hasMinimumRoleLevel('salon_admin')) {
      return { data: null, error: 'Insufficient permissions' }
    }

    const supabase = await createClient()

    let query = supabase
      .from('email_campaigns')
      .select(`
        *,
        email_campaign_recipients (
          id,
          status,
          opened_at,
          clicked_at,
          bounced_at,
          unsubscribed_at
        )
      `, { count: 'exact' })

    // Apply filters
    if (filters?.salon_id) {
      const { allowed } = await canAccessSalon(filters.salon_id)
      if (!allowed) {
        return { data: null, error: 'Cannot access this salon' }
      }
      query = query.eq('salon_id', filters.salon_id)
    }

    if (filters?.status) {
      query = query.eq('status', filters.status)
    }

    if (filters?.type) {
      query = query.eq('type', filters.type)
    }

    query = query.order('created_at', { ascending: false })

    if (filters?.limit) {
      query = query.limit(filters.limit)
    }

    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
    }

    const { data: campaigns, error, count } = await query

    if (error) {
      return { data: null, error: error.message }
    }

    // Calculate statistics for each campaign
    const campaignsWithStats = (campaigns || []).map(campaign => {
      const recipients = campaign.email_campaign_recipients || []
      const total = recipients.length
      const sent = recipients.filter(r => r.status === 'sent').length
      const opened = recipients.filter(r => r.opened_at).length
      const clicked = recipients.filter(r => r.clicked_at).length
      const bounced = recipients.filter(r => r.bounced_at).length
      const unsubscribed = recipients.filter(r => r.unsubscribed_at).length

      return {
        ...campaign,
        recipients_count: total,
        sent_count: sent,
        opened_count: opened,
        clicked_count: clicked,
        bounced_count: bounced,
        unsubscribed_count: unsubscribed,
        open_rate: sent > 0 ? (opened / sent) * 100 : 0,
        click_rate: opened > 0 ? (clicked / opened) * 100 : 0,
        bounce_rate: sent > 0 ? (bounced / sent) * 100 : 0,
        conversion_rate: 0, // Would calculate from actual conversions
        revenue_generated: 0 // Would calculate from tracked sales
      }
    })

    return { 
      data: campaignsWithStats, 
      error: null,
      total_count: count || 0
    }
  } catch (error) {
    console.error('Error fetching email campaigns:', error)
    return { data: null, error: 'Failed to fetch email campaigns' }
  }
}

// ULTRA-FUNCTION: Get SMS campaigns with statistics
export async function getSmsCampaigns(
  filters?: {
    salon_id?: string
    status?: string
    limit?: number
    offset?: number
  }
): Promise<CampaignListResult<SmsCampaignWithStats>> {
  try {
    const { user, error: authError } = await getUserWithRole()
    
    if (authError || !user) {
      return { data: null, error: authError || 'Not authenticated' }
    }

    if (!hasMinimumRoleLevel('salon_admin')) {
      return { data: null, error: 'Insufficient permissions' }
    }

    const supabase = await createClient()

    let query = supabase
      .from('sms_campaigns')
      .select(`
        *,
        sms_campaign_recipients (
          id,
          status,
          delivered_at,
          failed_at,
          clicked_at
        )
      `, { count: 'exact' })

    if (filters?.salon_id) {
      const { allowed } = await canAccessSalon(filters.salon_id)
      if (!allowed) {
        return { data: null, error: 'Cannot access this salon' }
      }
      query = query.eq('salon_id', filters.salon_id)
    }

    if (filters?.status) {
      query = query.eq('status', filters.status)
    }

    query = query.order('created_at', { ascending: false })

    if (filters?.limit) {
      query = query.limit(filters.limit)
    }

    const { data: campaigns, error, count } = await query

    if (error) {
      return { data: null, error: error.message }
    }

    // Calculate statistics
    const campaignsWithStats = (campaigns || []).map(campaign => {
      const recipients = campaign.sms_campaign_recipients || []
      const total = recipients.length
      const sent = recipients.filter(r => r.status === 'sent').length
      const delivered = recipients.filter(r => r.delivered_at).length
      const failed = recipients.filter(r => r.failed_at).length
      const clicked = recipients.filter(r => r.clicked_at).length

      // SMS cost calculation (example: $0.01 per SMS)
      const costPerSms = 0.01
      const totalCost = sent * costPerSms

      return {
        ...campaign,
        recipients_count: total,
        sent_count: sent,
        delivered_count: delivered,
        failed_count: failed,
        clicked_count: clicked,
        opted_out_count: 0, // Would fetch from opt-outs table
        delivery_rate: sent > 0 ? (delivered / sent) * 100 : 0,
        click_rate: delivered > 0 ? (clicked / delivered) * 100 : 0,
        opt_out_rate: 0,
        cost: totalCost
      }
    })

    return { 
      data: campaignsWithStats, 
      error: null,
      total_count: count || 0
    }
  } catch (error) {
    console.error('Error fetching SMS campaigns:', error)
    return { data: null, error: 'Failed to fetch SMS campaigns' }
  }
}

// ULTRA-FUNCTION: Create email campaign
export async function createEmailCampaign(
  campaignData: EmailCampaignInsert
): Promise<CampaignResult<EmailCampaign>> {
  try {
    const { hasRole: hasPermission, error: roleError } = await hasMinimumRoleLevel('salon_admin')
    
    if (roleError) {
      return { data: null, error: roleError }
    }

    if (!hasPermission) {
      return { data: null, error: 'Insufficient permissions' }
    }

    const supabase = await createClient()

    // Validate salon access
    if (campaignData.salon_id) {
      const { allowed } = await canAccessSalon(campaignData.salon_id)
      if (!allowed) {
        return { data: null, error: 'Cannot access this salon' }
      }
    }

    const { data: campaign, error } = await supabase
      .from('email_campaigns')
      .insert({
        ...campaignData,
        status: campaignData.status || CAMPAIGN_STATUS.DRAFT,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      return { data: null, error: error.message }
    }

    return { data: campaign, error: null }
  } catch (error) {
    console.error('Error creating email campaign:', error)
    return { data: null, error: 'Failed to create email campaign' }
  }
}

// ULTRA-FUNCTION: Create SMS campaign
export async function createSmsCampaign(
  campaignData: SmsCampaignInsert
): Promise<CampaignResult<SmsCampaign>> {
  try {
    const { hasRole: hasPermission, error: roleError } = await hasMinimumRoleLevel('salon_admin')
    
    if (roleError) {
      return { data: null, error: roleError }
    }

    if (!hasPermission) {
      return { data: null, error: 'Insufficient permissions' }
    }

    const supabase = await createClient()

    // Check SMS credits/limits
    // This would integrate with SMS provider to check balance

    const { data: campaign, error } = await supabase
      .from('sms_campaigns')
      .insert({
        ...campaignData,
        status: campaignData.status || CAMPAIGN_STATUS.DRAFT,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      return { data: null, error: error.message }
    }

    return { data: campaign, error: null }
  } catch (error) {
    console.error('Error creating SMS campaign:', error)
    return { data: null, error: 'Failed to create SMS campaign' }
  }
}

// ULTRA-FUNCTION: Get customer segments for targeting
export async function getCustomerSegments(
  salonId: string
): Promise<CampaignListResult<CampaignSegment>> {
  try {
    const { allowed, error: permError } = await canAccessSalon(salonId)
    
    if (!allowed) {
      return { data: null, error: permError || 'Cannot access this salon' }
    }

    const supabase = await createClient()

    // Predefined segments with dynamic counts
    const segments: CampaignSegment[] = [
      {
        id: 'all-customers',
        name: 'All Customers',
        description: 'All customers in your database',
        criteria: { customer_type: 'all' },
        customer_count: 0
      },
      {
        id: 'new-customers',
        name: 'New Customers',
        description: 'Customers who joined in the last 30 days',
        criteria: { customer_type: 'new', last_visit: { days: 30, operator: 'within' } },
        customer_count: 0
      },
      {
        id: 'returning-customers',
        name: 'Returning Customers',
        description: 'Customers with 2+ appointments',
        criteria: { customer_type: 'returning' },
        customer_count: 0
      },
      {
        id: 'vip-customers',
        name: 'VIP Customers',
        description: 'High-value customers (spent $500+)',
        criteria: { customer_type: 'vip', total_spent: { amount: 500, operator: 'gt' } },
        customer_count: 0
      },
      {
        id: 'inactive-customers',
        name: 'Inactive Customers',
        description: 'Haven\'t visited in 60+ days',
        criteria: { customer_type: 'inactive', last_visit: { days: 60, operator: 'before' } },
        customer_count: 0
      },
      {
        id: 'email-subscribers',
        name: 'Email Subscribers',
        description: 'Customers who opted in for email',
        criteria: { has_email: true, opt_in_marketing: true },
        customer_count: 0
      },
      {
        id: 'sms-subscribers',
        name: 'SMS Subscribers',
        description: 'Customers who opted in for SMS',
        criteria: { has_phone: true, opt_in_marketing: true },
        customer_count: 0
      }
    ]

    // Get actual counts for each segment
    for (const segment of segments) {
      let countQuery = supabase
        .from('customers')
        .select('id', { count: 'exact', head: true })
        .eq('salon_id', salonId)

      // Apply segment criteria
      if (segment.criteria.customer_type === 'new') {
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        countQuery = countQuery.gte('created_at', thirtyDaysAgo.toISOString())
      }

      if (segment.criteria.customer_type === 'inactive') {
        const sixtyDaysAgo = new Date()
        sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60)
        countQuery = countQuery.lte('last_visit_at', sixtyDaysAgo.toISOString())
      }

      if (segment.criteria.has_email) {
        countQuery = countQuery.not('email', 'is', null)
      }

      if (segment.criteria.has_phone) {
        countQuery = countQuery.not('phone', 'is', null)
      }

      const { count } = await countQuery
      segment.customer_count = count || 0
    }

    return { data: segments, error: null }
  } catch (error) {
    console.error('Error fetching customer segments:', error)
    return { data: null, error: 'Failed to fetch customer segments' }
  }
}

// ULTRA-FUNCTION: Add recipients to email campaign
export async function addEmailCampaignRecipients(
  campaignId: string,
  customerIds: string[]
): Promise<{ success: boolean; error: string | null; added_count: number }> {
  try {
    const { hasRole: hasPermission, error: roleError } = await hasMinimumRoleLevel('salon_admin')
    
    if (roleError) {
      return { success: false, error: roleError, added_count: 0 }
    }

    if (!hasPermission) {
      return { success: false, error: 'Insufficient permissions', added_count: 0 }
    }

    const supabase = await createClient()

    // Verify campaign exists and is in draft status
    const { data: campaign } = await supabase
      .from('email_campaigns')
      .select('id, status')
      .eq('id', campaignId)
      .single()

    if (!campaign) {
      return { success: false, error: 'Campaign not found', added_count: 0 }
    }

    if (campaign.status !== CAMPAIGN_STATUS.DRAFT) {
      return { success: false, error: 'Can only add recipients to draft campaigns', added_count: 0 }
    }

    // Get customer emails
    const { data: customers } = await supabase
      .from('customers')
      .select('id, email')
      .in('id', customerIds)
      .not('email', 'is', null)

    if (!customers || customers.length === 0) {
      return { success: false, error: 'No valid customers found', added_count: 0 }
    }

    // Add recipients
    const recipients = customers.map(customer => ({
      campaign_id: campaignId,
      customer_id: customer.id,
      email: customer.email,
      status: 'pending',
      created_at: new Date().toISOString()
    }))

    const { error, count } = await supabase
      .from('email_campaign_recipients')
      .insert(recipients)

    if (error) {
      return { success: false, error: error.message, added_count: 0 }
    }

    return { success: true, error: null, added_count: count || recipients.length }
  } catch (error) {
    console.error('Error adding email recipients:', error)
    return { success: false, error: 'Failed to add recipients', added_count: 0 }
  }
}

// ULTRA-FUNCTION: Send email campaign
export async function sendEmailCampaign(
  campaignId: string,
  scheduledFor?: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    const { hasRole: hasPermission, error: roleError } = await hasMinimumRoleLevel('salon_admin')
    
    if (roleError) {
      return { success: false, error: roleError }
    }

    if (!hasPermission) {
      return { success: false, error: 'Insufficient permissions' }
    }

    const supabase = await createClient()

    // Verify campaign is ready
    const { data: campaign } = await supabase
      .from('email_campaigns')
      .select(`
        *,
        email_campaign_recipients (id)
      `)
      .eq('id', campaignId)
      .single()

    if (!campaign) {
      return { success: false, error: 'Campaign not found' }
    }

    if (!campaign.email_campaign_recipients || campaign.email_campaign_recipients.length === 0) {
      return { success: false, error: 'No recipients added to campaign' }
    }

    if (!campaign.subject || !campaign.html_content) {
      return { success: false, error: 'Campaign content is incomplete' }
    }

    // Update campaign status
    const newStatus = scheduledFor ? CAMPAIGN_STATUS.SCHEDULED : CAMPAIGN_STATUS.SENDING

    const { error } = await supabase
      .from('email_campaigns')
      .update({
        status: newStatus,
        scheduled_for: scheduledFor,
        updated_at: new Date().toISOString()
      })
      .eq('id', campaignId)

    if (error) {
      return { success: false, error: error.message }
    }

    // If sending immediately, trigger send process
    if (!scheduledFor) {
      // This would trigger the actual email sending service
      // For now, we just update the status
      await supabase
        .from('email_campaigns')
        .update({
          status: CAMPAIGN_STATUS.SENT,
          sent_at: new Date().toISOString()
        })
        .eq('id', campaignId)
    }

    return { success: true, error: null }
  } catch (error) {
    console.error('Error sending email campaign:', error)
    return { success: false, error: 'Failed to send campaign' }
  }
}

// ULTRA-FUNCTION: Get SMS opt-outs
export async function getSmsOptOuts(
  salonId?: string
): Promise<CampaignListResult<SmsOptOut>> {
  try {
    const { user, error: authError } = await getUserWithRole()
    
    if (authError || !user) {
      return { data: null, error: authError || 'Not authenticated' }
    }

    const supabase = await createClient()

    let query = supabase
      .from('sms_opt_outs')
      .select('*')
      .order('created_at', { ascending: false })

    if (salonId) {
      const { allowed } = await canAccessSalon(salonId)
      if (!allowed) {
        return { data: null, error: 'Cannot access this salon' }
      }
      query = query.eq('salon_id', salonId)
    }

    const { data: optOuts, error } = await query

    if (error) {
      return { data: null, error: error.message }
    }

    return { data: optOuts || [], error: null }
  } catch (error) {
    console.error('Error fetching SMS opt-outs:', error)
    return { data: null, error: 'Failed to fetch SMS opt-outs' }
  }
}

// ULTRA-FUNCTION: Process opt-out request
export async function processSmsOptOut(
  phone: string,
  salonId?: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    const supabase = await createClient()

    const optOutData = {
      phone,
      salon_id: salonId,
      reason: 'User requested',
      created_at: new Date().toISOString()
    }

    const { error } = await supabase
      .from('sms_opt_outs')
      .insert(optOutData)

    if (error) {
      return { success: false, error: error.message }
    }

    // Update customer preferences
    await supabase
      .from('customers')
      .update({ sms_notifications: false })
      .eq('phone', phone)

    return { success: true, error: null }
  } catch (error) {
    console.error('Error processing SMS opt-out:', error)
    return { success: false, error: 'Failed to process opt-out' }
  }
}