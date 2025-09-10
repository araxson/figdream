import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';
import { requireRole, verifySession } from './auth';

export type EmailCampaignDTO = {
  id: string;
  salon_id: string;
  name: string;
  subject: string;
  content: string;
  status: string;
  scheduled_for: string | null;
  sent_at: string | null;
  created_at: string;
  updated_at: string;
};

export type SmsCampaignDTO = {
  id: string;
  salon_id: string;
  name: string;
  message: string;
  status: string;
  scheduled_for: string | null;
  sent_at: string | null;
  created_at: string;
  updated_at: string;
};

/**
 * Get email campaigns for salon
 */
export const getSalonEmailCampaigns = cache(async (salonId: string): Promise<EmailCampaignDTO[]> => {
  await requireRole(['salon_owner', 'super_admin']);
  
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('email_campaigns')
    .select('*')
    .eq('salon_id', salonId)
    .order('created_at', { ascending: false });
  
  if (error || !data) return [];
  
  return data.map(campaign => ({
    id: campaign.id,
    salon_id: campaign.salon_id,
    name: campaign.name,
    subject: campaign.subject,
    content: campaign.content,
    status: campaign.status,
    scheduled_for: campaign.scheduled_at,
    sent_at: campaign.sent_at,
    created_at: campaign.created_at,
    updated_at: campaign.updated_at,
  }));
});

/**
 * Get SMS campaigns for salon
 */
export const getSalonSmsCampaigns = cache(async (salonId: string): Promise<SmsCampaignDTO[]> => {
  await requireRole(['salon_owner', 'super_admin']);
  
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('sms_campaigns')
    .select('*')
    .eq('salon_id', salonId)
    .order('created_at', { ascending: false });
  
  if (error || !data) return [];
  
  return data.map(campaign => ({
    id: campaign.id,
    salon_id: campaign.salon_id,
    name: campaign.name,
    message: campaign.message_template,
    status: campaign.status,
    scheduled_for: campaign.scheduled_at,
    sent_at: campaign.completed_at,
    created_at: campaign.created_at,
    updated_at: campaign.updated_at || campaign.created_at,
  }));
});

/**
 * Create email campaign
 */
export const createEmailCampaign = async (campaign: Omit<EmailCampaignDTO, 'id' | 'created_at' | 'updated_at'>): Promise<EmailCampaignDTO | null> => {
  await requireRole(['salon_owner', 'super_admin']);
  
  const session = await verifySession();
  if (!session) return null;
  
  const supabase = await createClient();

  // Verify salon ownership
  const { data: salon } = await supabase
    .from('salons')
    .select('created_by')
    .eq('id', campaign.salon_id)
    .single();
  
  if (!salon || (salon.created_by !== session.user.id && session.user.role !== 'super_admin')) {
    return null;
  }
  
  const { data, error } = await supabase
    .from('email_campaigns')
    .insert({
      ...campaign,
      created_by: session.user.id,
    })
    .select()
    .single();
  
  if (error || !data) return null;
  
  return {
    id: data.id,
    salon_id: data.salon_id,
    name: data.name,
    subject: data.subject,
    content: data.content,
    status: data.status,
    scheduled_for: data.scheduled_at,
    sent_at: data.sent_at,
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
};

/**
 * Create SMS campaign
 */
export const createSmsCampaign = async (campaign: Omit<SmsCampaignDTO, 'id' | 'created_at' | 'updated_at'>): Promise<SmsCampaignDTO | null> => {
  await requireRole(['salon_owner', 'super_admin']);
  
  const session = await verifySession();
  if (!session) return null;
  
  const supabase = await createClient();

  // Verify salon ownership
  const { data: salon } = await supabase
    .from('salons')
    .select('created_by')
    .eq('id', campaign.salon_id)
    .single();
  
  if (!salon || (salon.created_by !== session.user.id && session.user.role !== 'super_admin')) {
    return null;
  }
  
  const { data, error } = await supabase
    .from('sms_campaigns')
    .insert({
      salon_id: campaign.salon_id,
      name: campaign.name,
      message_template: campaign.message,
      status: campaign.status,
      scheduled_at: campaign.scheduled_for,
      campaign_type: 'promotional', // Default campaign type
      created_by: session.user.id,
    })
    .select()
    .single();
  
  if (error || !data) return null;
  
  return {
    id: data.id,
    salon_id: data.salon_id,
    name: data.name,
    message: data.message_template,
    status: data.status,
    scheduled_for: data.scheduled_at,
    sent_at: data.completed_at,
    created_at: data.created_at,
    updated_at: data.updated_at || data.created_at,
  };
};

/**
 * Send email campaign
 */
export const sendEmailCampaign = async (campaignId: string): Promise<boolean> => {
  await requireRole(['salon_owner', 'super_admin']);
  
  const supabase = await createClient();
  
  // Update campaign status
  const { error } = await supabase
    .from('email_campaigns')
    .update({
      status: 'sent',
      sent_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', campaignId);
  
  if (error) return false;
  
  // TODO: Trigger actual email sending via Edge Function or API
  
  return true;
};

/**
 * Send SMS campaign
 */
export const sendSmsCampaign = async (campaignId: string): Promise<boolean> => {
  await requireRole(['salon_owner', 'super_admin']);
  
  const supabase = await createClient();
  
  // Update campaign status
  const { error } = await supabase
    .from('sms_campaigns')
    .update({
      status: 'sent',
      sent_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', campaignId);
  
  if (error) return false;
  
  // TODO: Trigger actual SMS sending via Edge Function or API
  
  return true;
};