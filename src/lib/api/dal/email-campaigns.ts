import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import { Database } from '@/types/database.types'
import { requireAuth } from './auth'

type Tables = Database['public']['Tables']
type EmailCampaign = Tables['email_campaigns']['Row']
type EmailCampaignInsert = Tables['email_campaigns']['Insert']
type EmailCampaignUpdate = Tables['email_campaigns']['Update']

export interface EmailCampaignDTO {
  id: string
  salon_id: string
  name: string
  subject: string
  content: string
  template_id: string | null
  status: string
  sent_at: string | null
  scheduled_at: string | null
  created_at: string
  updated_at: string
}

function toEmailCampaignDTO(campaign: EmailCampaign): EmailCampaignDTO {
  return {
    id: campaign.id,
    salon_id: campaign.salon_id,
    name: campaign.name,
    subject: campaign.subject,
    content: campaign.content,
    template_id: campaign.template_id,
    status: campaign.status || 'draft',
    sent_at: campaign.sent_at,
    scheduled_at: campaign.scheduled_at,
    created_at: campaign.created_at || new Date().toISOString(),
    updated_at: campaign.updated_at || new Date().toISOString()
  }
}

export const getEmailCampaigns = cache(async (): Promise<EmailCampaignDTO[]> => {
  await requireAuth()
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('email_campaigns')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching email campaigns:', error)
    return []
  }
  
  return (data || []).map(toEmailCampaignDTO)
})

export const getEmailCampaignsBySalon = cache(async (
  salonId: string
): Promise<EmailCampaignDTO[]> => {
  await requireAuth()
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('email_campaigns')
    .select('*')
    .eq('salon_id', salonId)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching salon email campaigns:', error)
    return []
  }
  
  return (data || []).map(toEmailCampaignDTO)
})

export const getEmailCampaignById = cache(async (
  id: string
): Promise<EmailCampaignDTO | null> => {
  await requireAuth()
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('email_campaigns')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) {
    console.error('Error fetching email campaign:', error)
    return null
  }
  
  return data ? toEmailCampaignDTO(data) : null
})

export async function createEmailCampaign(
  campaign: EmailCampaignInsert
): Promise<EmailCampaignDTO | null> {
  await requireAuth()
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('email_campaigns')
    .insert(campaign)
    .select()
    .single()
  
  if (error) {
    console.error('Error creating email campaign:', error)
    throw new Error('Failed to create email campaign')
  }
  
  return data ? toEmailCampaignDTO(data) : null
}

export async function updateEmailCampaign(
  id: string,
  updates: EmailCampaignUpdate
): Promise<EmailCampaignDTO | null> {
  await requireAuth()
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('email_campaigns')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) {
    console.error('Error updating email campaign:', error)
    throw new Error('Failed to update email campaign')
  }
  
  return data ? toEmailCampaignDTO(data) : null
}

export async function deleteEmailCampaign(id: string): Promise<boolean> {
  await requireAuth()
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('email_campaigns')
    .delete()
    .eq('id', id)
  
  if (error) {
    console.error('Error deleting email campaign:', error)
    throw new Error('Failed to delete email campaign')
  }
  
  return true
}

export async function sendEmailCampaign(id: string): Promise<boolean> {
  await requireAuth()
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('email_campaigns')
    .update({
      status: 'sent',
      sent_at: new Date().toISOString()
    })
    .eq('id', id)
  
  if (error) {
    console.error('Error sending email campaign:', error)
    throw new Error('Failed to send email campaign')
  }
  
  return true
}

export async function duplicateEmailCampaign(
  id: string
): Promise<EmailCampaignDTO | null> {
  await requireAuth()
  const supabase = await createClient()
  
  // Get original campaign
  const { data: original, error: fetchError } = await supabase
    .from('email_campaigns')
    .select('*')
    .eq('id', id)
    .single()
  
  if (fetchError || !original) {
    console.error('Error fetching campaign to duplicate:', fetchError)
    throw new Error('Failed to duplicate email campaign')
  }
  
  // Create duplicate with new name
  const duplicate = {
    ...original,
    id: undefined,
    name: `${original.name} (Copy)`,
    status: 'draft',
    sent_at: null,
    created_at: new Date().toISOString()
  }
  
  const { data, error } = await supabase
    .from('email_campaigns')
    .insert(duplicate)
    .select()
    .single()
  
  if (error) {
    console.error('Error duplicating email campaign:', error)
    throw new Error('Failed to duplicate email campaign')
  }
  
  return data ? toEmailCampaignDTO(data) : null
}