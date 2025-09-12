import { createClient } from '@/lib/supabase/server'
import { SmsCampaignsClient } from './sms-campaigns-client'

async function getSmsCampaignsData() {
  const supabase = await createClient()
  
  // Get campaigns with recipient counts and opt-out stats
  const { data: campaigns, error: campaignsError } = await supabase
    .from('sms_campaigns')
    .select(`
      *,
      recipients:sms_campaign_recipients(count)
    `)
    .order('created_at', { ascending: false })
    .limit(50)
  
  if (campaignsError) {
    console.error('Error fetching SMS campaigns:', campaignsError)
  }
  
  // Get campaign statistics
  const { count: totalCount } = await supabase
    .from('sms_campaigns')
    .select('*', { count: 'exact', head: true })
  
  const { count: draftCount } = await supabase
    .from('sms_campaigns')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'draft')
  
  const { count: scheduledCount } = await supabase
    .from('sms_campaigns')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'scheduled')
  
  const { count: sentCount } = await supabase
    .from('sms_campaigns')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'sent')
  
  // Get opt-out statistics
  const { count: optOutCount } = await supabase
    .from('sms_opt_outs')
    .select('*', { count: 'exact', head: true })
  
  return {
    campaigns: campaigns || [],
    counts: {
      total: totalCount || 0,
      draft: draftCount || 0,
      scheduled: scheduledCount || 0,
      sent: sentCount || 0,
      optOuts: optOutCount || 0
    }
  }
}

export async function SmsCampaignsServer() {
  const data = await getSmsCampaignsData()
  
  return <SmsCampaignsClient {...data} />
}