'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Mail } from 'lucide-react'
import { useEffect, useCallback, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database.types'
import { formatDate } from '@/lib/utils/format'

type EmailCampaign = Database['public']['Tables']['email_campaigns']['Row']
type SmsCampaign = Database['public']['Tables']['sms_campaigns']['Row']

type Campaign = (EmailCampaign | SmsCampaign) & {
  type: 'email' | 'sms'
}

export function CampaignsList() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchCampaigns = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get salon owned by user
      const { data: salon } = await supabase
        .from('salons')
        .select('id')
        .eq('created_by', user.id)
        .single()

      if (!salon) return

      // Fetch email campaigns
      const { data: emailCampaigns } = await supabase
        .from('email_campaigns')
        .select(`
          *,
          email_campaign_recipients(count)
        `)
        .eq('salon_id', salon.id)
        .order('created_at', { ascending: false })
        .limit(5)

      // Fetch SMS campaigns
      const { data: smsCampaigns } = await supabase
        .from('sms_campaigns')
        .select(`
          *,
          sms_campaign_recipients(count)
        `)
        .eq('salon_id', salon.id)
        .order('created_at', { ascending: false })
        .limit(5)

      // Combine and sort campaigns
      const allCampaigns: Campaign[] = [
        ...(emailCampaigns || []).map(c => ({ 
          ...c, 
          type: 'email' as const,
          // Use existing fields from email_campaigns table
        })),
        ...(smsCampaigns || []).map(c => ({ 
          ...c, 
          type: 'sms' as const,
          sent_count: c.sent_count || 0,
          opened_count: c.delivered_count || 0,
          clicked_count: c.clicked_count || 0
        }))
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

      setCampaigns(allCampaigns.slice(0, 5))
    } catch (error) {
      console.error('Error fetching campaigns:', error)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchCampaigns()
  }, [fetchCampaigns])

  if (loading) {
    return (
      <div className="grid gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="flex items-center justify-center py-8">
              Loading campaigns...
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default">Active</Badge>
      case 'scheduled':
        return <Badge variant="secondary">Scheduled</Badge>
      case 'completed':
        return <Badge variant="outline">Completed</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <div className="grid gap-6">
      {campaigns.map((campaign) => (
        <Card key={campaign.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>{campaign.name}</CardTitle>
                <CardDescription>
                  {formatDate(campaign.created_at)}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  {campaign.type === 'email' ? <Mail className="h-3 w-3" /> : 'SMS'}
                </Badge>
                {getStatusBadge(campaign.status)}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {campaign.status !== 'scheduled' && (
              <>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Sent</p>
                    <p className="text-2xl font-bold">{(campaign as EmailCampaign).recipients_count || 0}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Opened</p>
                    <p className="text-2xl font-bold">{(campaign as EmailCampaign).opens_count || 0}</p>
                    <Progress 
                      value={(campaign as EmailCampaign).recipients_count > 0 ? ((campaign as EmailCampaign).opens_count / (campaign as EmailCampaign).recipients_count) * 100 : 0} 
                      className="h-1"
                    />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Clicked</p>
                    <p className="text-2xl font-bold">{(campaign as EmailCampaign).clicks_count || 0}</p>
                    <Progress 
                      value={(campaign as EmailCampaign).recipients_count > 0 ? ((campaign as EmailCampaign).clicks_count / (campaign as EmailCampaign).recipients_count) * 100 : 0} 
                      className="h-1"
                    />
                  </div>
                </div>
              </>
            )}
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                View Details
              </Button>
              {campaign.status === 'active' && (
                <Button variant="outline" size="sm">
                  Pause
                </Button>
              )}
              {campaign.status === 'scheduled' && (
                <Button variant="outline" size="sm">
                  Edit
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}