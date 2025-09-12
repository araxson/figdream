import { createClient } from '@/lib/supabase/server'
import { EmailCampaignsClient } from './email-campaigns-client'

async function getEmailCampaignsData() {
  const supabase = await createClient()
  
  // Get campaigns with recipient counts
  const { data: campaigns, error: campaignsError } = await supabase
    .from('email_campaigns')
    .select(`
      *,
      recipients:email_campaign_recipients(count)
    `)
    .order('created_at', { ascending: false })
    .limit(50)
  
  if (campaignsError) {
    console.error('Error fetching email campaigns:', campaignsError)
  }
  
  // Get campaign statistics
  const { count: totalCount } = await supabase
    .from('email_campaigns')
    .select('*', { count: 'exact', head: true })
  
  const { count: draftCount } = await supabase
    .from('email_campaigns')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'draft')
  
  const { count: scheduledCount } = await supabase
    .from('email_campaigns')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'scheduled')
  
  const { count: sentCount } = await supabase
    .from('email_campaigns')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'sent')
  
  return {
    campaigns: campaigns || [],
    counts: {
      total: totalCount || 0,
      draft: draftCount || 0,
      scheduled: scheduledCount || 0,
      sent: sentCount || 0
    }
  }
}

export async function EmailCampaignsServer() {
  const data = await getEmailCampaignsData()
  
  return <EmailCampaignsClient {...data} />
}