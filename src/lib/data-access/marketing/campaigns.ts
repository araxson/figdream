/**
 * Marketing Campaigns Data Access Layer for FigDream
 * Handles all marketing campaign database operations
 */
'use server'
import { createClient } from '@/lib/database/supabase/server'
import { getUser, getUserRole } from '@/lib/data-access/auth'
import type { Database } from '@/types/database.types'
import { 
  createCampaignSchema,
  updateCampaignSchema,
  createSegmentSchema,
  createEmailTemplateSchema,
  createSmsTemplateSchema,
  sendCampaignSchema,
  type CreateCampaignInput,
  type UpdateCampaignInput,
  type CreateSegmentInput,
  type CreateEmailTemplateInput,
  type CreateSmsTemplateInput,
  type SendCampaignInput,
} from '@/lib/validations/marketing-schema'
type Campaign = Database['public']['Tables']['marketing_campaigns']['Row']
// Note: customer_segments table does not exist in database
// Segment functionality is currently not available
type EmailTemplate = Database['public']['Tables']['email_templates']['Row']
type SmsTemplate = Database['public']['Tables']['sms_templates']['Row']
/**
 * Create a new marketing campaign
 */
export async function createCampaign(input: CreateCampaignInput): Promise<Campaign | null> {
  const supabase = await createClient()
  const { user } = await getUser()
  if (!user) {
    throw new Error('Authentication required')
  }
  try {
    const validated = createCampaignSchema.parse(input)
    // Check permissions
    const { data: salon } = await supabase
      .from('salons')
      .select('id, owner_id')
      .eq('id', validated.salon_id)
      .single()
    if (!salon || (salon.owner_id !== user.id && getUserRole(user) !== 'super_admin')) {
      throw new Error('Unauthorized to create campaigns for this salon')
    }
    const { data, error } = await supabase
      .from('marketing_campaigns')
      .insert({
        ...validated,
        created_by: user.id,
      })
      .select()
      .single()
    if (error) {
      return null
    }
    return data
  } catch (_error) {
    throw error
  }
}
/**
 * Update an existing campaign
 */
export async function updateCampaign(input: UpdateCampaignInput): Promise<Campaign | null> {
  const supabase = await createClient()
  const { user } = await getUser()
  if (!user) {
    throw new Error('Authentication required')
  }
  try {
    const validated = updateCampaignSchema.parse(input)
    const { id, ...updateData } = validated
    // Check permissions
    const { data: campaign } = await supabase
      .from('marketing_campaigns')
      .select('salon_id, status')
      .eq('id', id)
      .single()
    if (!campaign) {
      throw new Error('Campaign not found')
    }
    // Can't update active or completed campaigns
    if (['active', 'completed'].includes(campaign.status)) {
      throw new Error('Cannot update active or completed campaigns')
    }
    const { data: salon } = await supabase
      .from('salons')
      .select('owner_id')
      .eq('id', campaign.salon_id)
      .single()
    if (!salon || (salon.owner_id !== user.id && getUserRole(user) !== 'super_admin')) {
      throw new Error('Unauthorized to update this campaign')
    }
    const { data, error } = await supabase
      .from('marketing_campaigns')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()
    if (error) {
      return null
    }
    return data
  } catch (_error) {
    throw error
  }
}
/**
 * Get campaigns for a salon
 */
export async function getCampaigns(
  salonId: string,
  filters?: {
    status?: string
    type?: string
    startDate?: string
    endDate?: string
  }
): Promise<Campaign[]> {
  const supabase = await createClient()
  const { user } = await getUser()
  if (!user) {
    throw new Error('Authentication required')
  }
  try {
    let query = supabase
      .from('marketing_campaigns')
      .select('*')
      .eq('salon_id', salonId)
      .order('created_at', { ascending: false })
    if (filters?.status) {
      query = query.eq('status', filters.status)
    }
    if (filters?.type) {
      query = query.eq('type', filters.type)
    }
    if (filters?.startDate) {
      query = query.gte('created_at', filters.startDate)
    }
    if (filters?.endDate) {
      query = query.lte('created_at', filters.endDate)
    }
    const { data, error } = await query
    if (error) {
      return []
    }
    return data || []
  } catch (_error) {
    return []
  }
}
/**
 * Create audience segment
 */
export async function createSegment(input: CreateSegmentInput): Promise<Segment | null> {
  const supabase = await createClient()
  const { user } = await getUser()
  if (!user) {
    throw new Error('Authentication required')
  }
  try {
    const validated = createSegmentSchema.parse(input)
    // Check permissions
    const { data: salon } = await supabase
      .from('salons')
      .select('owner_id')
      .eq('id', validated.salon_id)
      .single()
    if (!salon || (salon.owner_id !== user.id && getUserRole(user) !== 'super_admin')) {
      throw new Error('Unauthorized to create segments for this salon')
    }
    const { data, error } = await supabase
      .from('customer_segments')
      .insert({
        ...validated,
        created_by: user.id,
      })
      .select()
      .single()
    if (error) {
      return null
    }
    // Calculate segment size
    await updateSegmentSize(data.id)
    return data
  } catch (_error) {
    throw error
  }
}
/**
 * Update segment size based on conditions
 */
async function updateSegmentSize(segmentId: string): Promise<void> {
  const supabase = await createClient()
  try {
    const { data: segment } = await supabase
      .from('customer_segments')
      .select('*')
      .eq('id', segmentId)
      .single()
    if (!segment) return
    // Build dynamic query based on conditions
    let query = supabase
      .from('customers')
      .select('id', { count: 'exact', head: true })
    // Apply conditions
    for (const condition of segment.conditions as unknown[]) {
      const { field, operator, value } = condition
      switch (operator) {
        case 'equals':
          query = query.eq(field, value)
          break
        case 'not_equals':
          query = query.neq(field, value)
          break
        case 'contains':
          query = query.ilike(field, `%${value}%`)
          break
        case 'greater_than':
          query = query.gt(field, value)
          break
        case 'less_than':
          query = query.lt(field, value)
          break
        case 'between':
          if (Array.isArray(value) && value.length === 2) {
            query = query.gte(field, value[0]).lte(field, value[1])
          }
          break
        case 'in':
          if (Array.isArray(value)) {
            query = query.in(field, value)
          }
          break
        case 'not_in':
          if (Array.isArray(value)) {
            query = query.not(field, 'in', value)
          }
          break
      }
    }
    const { count } = await query
    // Update segment with member count
    await supabase
      .from('customer_segments')
      .update({ 
        member_count: count || 0,
        last_calculated: new Date().toISOString(),
      })
      .eq('id', segmentId)
  } catch (_error) {
  }
}
/**
 * Get segments for a salon
 * NOTE: customer_segments table does not exist in database
 * This function returns empty array until table is created
 */
export async function getSegments(_salonId: string): Promise<[]> {
  // customer_segments table does not exist in database.types.ts
  // Returning empty array until table is implemented
  return []
}
/**
 * Create email template
 */
export async function createEmailTemplate(input: CreateEmailTemplateInput): Promise<EmailTemplate | null> {
  const supabase = await createClient()
  const { user } = await getUser()
  if (!user) {
    throw new Error('Authentication required')
  }
  try {
    const validated = createEmailTemplateSchema.parse(input)
    // Check permissions
    const { data: salon } = await supabase
      .from('salons')
      .select('owner_id')
      .eq('id', validated.salon_id)
      .single()
    if (!salon || (salon.owner_id !== user.id && getUserRole(user) !== 'super_admin')) {
      throw new Error('Unauthorized to create templates for this salon')
    }
    const { data, error } = await supabase
      .from('email_templates')
      .insert({
        ...validated,
        created_by: user.id,
      })
      .select()
      .single()
    if (error) {
      return null
    }
    return data
  } catch (_error) {
    throw error
  }
}
/**
 * Create SMS template
 */
export async function createSmsTemplate(input: CreateSmsTemplateInput): Promise<SmsTemplate | null> {
  const supabase = await createClient()
  const { user } = await getUser()
  if (!user) {
    throw new Error('Authentication required')
  }
  try {
    const validated = createSmsTemplateSchema.parse(input)
    // Check permissions
    const { data: salon } = await supabase
      .from('salons')
      .select('owner_id')
      .eq('id', validated.salon_id)
      .single()
    if (!salon || (salon.owner_id !== user.id && getUserRole(user) !== 'super_admin')) {
      throw new Error('Unauthorized to create templates for this salon')
    }
    const { data, error } = await supabase
      .from('sms_templates')
      .insert({
        ...validated,
        created_by: user.id,
      })
      .select()
      .single()
    if (error) {
      return null
    }
    return data
  } catch (_error) {
    throw error
  }
}
/**
 * Get email templates for a salon
 */
export async function getEmailTemplates(salonId: string): Promise<EmailTemplate[]> {
  const supabase = await createClient()
  const { user } = await getUser()
  if (!user) {
    throw new Error('Authentication required')
  }
  try {
    const { data, error } = await supabase
      .from('email_templates')
      .select('*')
      .eq('salon_id', salonId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
    if (error) {
      return []
    }
    return data || []
  } catch (_error) {
    return []
  }
}
/**
 * Get SMS templates for a salon
 */
export async function getSmsTemplates(salonId: string): Promise<SmsTemplate[]> {
  const supabase = await createClient()
  const { user } = await getUser()
  if (!user) {
    throw new Error('Authentication required')
  }
  try {
    const { data, error } = await supabase
      .from('sms_templates')
      .select('*')
      .eq('salon_id', salonId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
    if (error) {
      return []
    }
    return data || []
  } catch (_error) {
    return []
  }
}
/**
 * Send a campaign
 */
export async function sendCampaign(input: SendCampaignInput): Promise<{ success: boolean; message: string }> {
  const supabase = await createClient()
  const { user } = await getUser()
  if (!user) {
    throw new Error('Authentication required')
  }
  try {
    const validated = sendCampaignSchema.parse(input)
    // Get campaign details
    const { data: campaign } = await supabase
      .from('marketing_campaigns')
      .select(`
        *,
        salons (
          owner_id,
          name
        )
      `)
      .eq('id', validated.campaign_id)
      .single()
    if (!campaign) {
      throw new Error('Campaign not found')
    }
    // Check permissions
    if (campaign.salons.owner_id !== user.id && getUserRole(user) !== 'super_admin') {
      throw new Error('Unauthorized to send this campaign')
    }
    // Check campaign status
    if (campaign.status !== 'draft' && campaign.status !== 'scheduled') {
      throw new Error('Campaign must be in draft or scheduled status to send')
    }
    // Update campaign status
    await supabase
      .from('marketing_campaigns')
      .update({ 
        status: validated.test_mode ? 'draft' : 'active',
        sent_at: validated.test_mode ? null : new Date().toISOString(),
      })
      .eq('id', validated.campaign_id)
    // Queue campaign for sending
    const { error: queueError } = await supabase
      .from('campaign_queue')
      .insert({
        campaign_id: validated.campaign_id,
        test_mode: validated.test_mode,
        test_recipients: validated.test_recipients,
        exclude_unsubscribed: validated.exclude_unsubscribed,
        exclude_bounced: validated.exclude_bounced,
        respect_quiet_hours: validated.respect_quiet_hours,
        batch_size: validated.batch_size,
        delay_between_batches: validated.delay_between_batches,
        status: 'pending',
        queued_by: user.id,
      })
    if (queueError) {
      throw new Error('Failed to queue campaign for sending')
    }
    return {
      success: true,
      message: validated.test_mode 
        ? 'Test campaign queued for sending' 
        : 'Campaign queued for sending',
    }
  } catch (_error) {
    throw error
  }
}
/**
 * Get campaign metrics
 */
export async function getCampaignMetrics(campaignId: string): Promise<{
  campaign_id: string;
  sent_count: number;
  delivered_count: number;
  open_count: number;
  click_count: number;
  unsubscribe_count: number;
  error_count: number;
}> {
  const supabase = await createClient()
  const { user } = await getUser()
  if (!user) {
    throw new Error('Authentication required')
  }
  try {
    const { data, error } = await supabase
      .from('campaign_metrics')
      .select('*')
      .eq('campaign_id', campaignId)
      .single()
    if (error && error.code !== 'PGRST116') {
      return null
    }
    // Return default metrics if none exist
    if (!data) {
      return {
        campaign_id: campaignId,
        sent_count: 0,
        delivered_count: 0,
        opened_count: 0,
        clicked_count: 0,
        bounced_count: 0,
        unsubscribed_count: 0,
        complained_count: 0,
        open_rate: 0,
        click_rate: 0,
        bounce_rate: 0,
        revenue_generated: 0,
        conversions: 0,
      }
    }
    return data
  } catch (_error) {
    return null
  }
}
/**
 * Delete a campaign
 */
export async function deleteCampaign(campaignId: string): Promise<boolean> {
  const supabase = await createClient()
  const { user } = await getUser()
  if (!user) {
    throw new Error('Authentication required')
  }
  try {
    // Get campaign details
    const { data: campaign } = await supabase
      .from('marketing_campaigns')
      .select('salon_id, status')
      .eq('id', campaignId)
      .single()
    if (!campaign) {
      throw new Error('Campaign not found')
    }
    // Can't delete active or completed campaigns
    if (['active', 'completed'].includes(campaign.status)) {
      throw new Error('Cannot delete active or completed campaigns')
    }
    // Check permissions
    const { data: salon } = await supabase
      .from('salons')
      .select('owner_id')
      .eq('id', campaign.salon_id)
      .single()
    if (!salon || (salon.owner_id !== user.id && getUserRole(user) !== 'super_admin')) {
      throw new Error('Unauthorized to delete this campaign')
    }
    const { error } = await supabase
      .from('marketing_campaigns')
      .delete()
      .eq('id', campaignId)
    if (error) {
      return false
    }
    return true
  } catch (_error) {
    throw error
  }
}