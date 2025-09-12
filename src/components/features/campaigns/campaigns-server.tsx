import { createClient } from '@/lib/supabase/server'
import { CampaignsClient } from './campaigns-client'

async function getCampaignsData(salonId?: string) {
  const supabase = await createClient()
  
  // Get email campaigns
  let emailQuery = supabase
    .from('email_campaigns')
    .select(`
      *,
      salon:salons!email_campaigns_salon_id_fkey(
        id,
        name,
        slug
      )
    `)
    .order('created_at', { ascending: false })
  
  if (salonId) {
    emailQuery = emailQuery.eq('salon_id', salonId)
  }
  
  const { data: emailCampaigns, error: emailError } = await emailQuery
  
  if (emailError) {
    console.error('Error fetching email campaigns:', emailError)
  }
  
  // Get SMS campaigns
  let smsQuery = supabase
    .from('sms_campaigns')
    .select(`
      *,
      salon:salons!sms_campaigns_salon_id_fkey(
        id,
        name,
        slug
      ),
      creator:profiles!sms_campaigns_created_by_fkey(
        id,
        full_name,
        email
      )
    `)
    .order('created_at', { ascending: false })
  
  if (salonId) {
    smsQuery = smsQuery.eq('salon_id', salonId)
  }
  
  const { data: smsCampaigns, error: smsError } = await smsQuery
  
  if (smsError) {
    console.error('Error fetching SMS campaigns:', smsError)
  }
  
  // Get salons for filter dropdown
  const { data: salons } = await supabase
    .from('salons')
    .select('id, name, slug')
    .eq('is_active', true)
    .order('name', { ascending: true })
  
  // Get statistics
  const emailStatsQuery = supabase
    .from('email_campaigns')
    .select('*', { count: 'exact', head: true })
  
  if (salonId) {
    emailStatsQuery.eq('salon_id', salonId)
  }
  
  const { count: totalEmailCampaigns } = await emailStatsQuery
  
  const smsStatsQuery = supabase
    .from('sms_campaigns')
    .select('*', { count: 'exact', head: true })
  
  if (salonId) {
    smsStatsQuery.eq('salon_id', salonId)
  }
  
  const { count: totalSmsCampaigns } = await smsStatsQuery
  
  // Count active campaigns (scheduled or in progress)
  const activeEmailQuery = supabase
    .from('email_campaigns')
    .select('*', { count: 'exact', head: true })
    .in('status', ['scheduled', 'sending'])
  
  if (salonId) {
    activeEmailQuery.eq('salon_id', salonId)
  }
  
  const { count: activeEmailCount } = await activeEmailQuery
  
  const activeSmsQuery = supabase
    .from('sms_campaigns')
    .select('*', { count: 'exact', head: true })
    .in('status', ['scheduled', 'sending'])
  
  if (salonId) {
    activeSmsQuery.eq('salon_id', salonId)
  }
  
  const { count: activeSmsCount } = await activeSmsQuery
  
  // Calculate total reach (sum of recipients)
  const { data: emailReachData } = await supabase
    .from('email_campaigns')
    .select('recipients_count')
    .eq('status', 'sent')
  
  const { data: smsReachData } = await supabase
    .from('sms_campaigns')
    .select('sent_count')
    .eq('status', 'completed')
  
  const totalReach = 
    (emailReachData?.reduce((sum, c) => sum + (c.recipients_count || 0), 0) || 0) +
    (smsReachData?.reduce((sum, c) => sum + (c.sent_count || 0), 0) || 0)
  
  // Combine and format campaigns
  const allCampaigns = [
    ...(emailCampaigns?.map(c => ({
      ...c,
      type: 'email' as const,
      recipientCount: c.recipients_count,
      engagement: c.recipients_count ? 
        Math.round(((c.opens_count || 0) / c.recipients_count) * 100) : 0
    })) || []),
    ...(smsCampaigns?.map(c => ({
      ...c,
      type: 'sms' as const,
      recipientCount: c.target_count,
      engagement: c.sent_count ? 
        Math.round(((c.clicked_count || 0) / c.sent_count) * 100) : 0
    })) || [])
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  
  return {
    campaigns: allCampaigns,
    salons: salons || [],
    counts: {
      totalEmail: totalEmailCampaigns || 0,
      totalSms: totalSmsCampaigns || 0,
      active: (activeEmailCount || 0) + (activeSmsCount || 0),
      totalReach
    },
    currentSalonId: salonId
  }
}

interface CampaignsServerProps {
  salonId?: string
}

export async function CampaignsServer({ salonId }: CampaignsServerProps) {
  const data = await getCampaignsData(salonId)
  
  return <CampaignsClient {...data} />
}