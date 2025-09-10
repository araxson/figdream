'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Mail, MessageSquare, Users, Eye, MousePointer, TrendingUp } from 'lucide-react'
import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database.types'

type EmailCampaign = Database['public']['Tables']['email_campaigns']['Row']

type CampaignWithMetrics = EmailCampaign & {
  type: 'email'
  sent_at: string | null
  metrics: {
    sent: number
    delivered: number
    opened: number
    clicked: number
    converted: number
    unsubscribed: number
  }
}

export function CampaignMetrics() {
  const [campaigns, setCampaigns] = useState<CampaignWithMetrics[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchCampaignMetrics = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: salon } = await supabase
        .from('salons')
        .select('id')
        .eq('created_by', user.id)
        .single()

      if (!salon) return

      const { data: campaignsData, error } = await supabase
        .from('email_campaigns')
        .select('*')
        .eq('salon_id', salon.id)
        .eq('status', 'sent')
        .order('sent_at', { ascending: false })
        .limit(10)

      if (error) throw error

      // Simulate metrics for each campaign
      const campaignsWithMetrics = (campaignsData || []).map(campaign => {
        const sent = Math.floor(100 + Math.random() * 400)
        const delivered = Math.floor(sent * (0.95 + Math.random() * 0.04))
        const opened = Math.floor(delivered * (0.2 + Math.random() * 0.3))
        const clicked = Math.floor(opened * (0.1 + Math.random() * 0.2))
        const converted = Math.floor(clicked * (0.05 + Math.random() * 0.15))
        const unsubscribed = Math.floor(sent * (0.01 + Math.random() * 0.02))

        return {
          ...campaign,
          type: 'email' as const,
          sent_at: campaign.sent_at,
          metrics: {
            sent,
            delivered,
            opened,
            clicked,
            converted,
            unsubscribed
          }
        }
      })

      setCampaigns(campaignsWithMetrics)
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching campaign metrics:', error)
      }
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchCampaignMetrics()
  }, [fetchCampaignMetrics])

  const getTypeIcon = (type: string) => {
    return type === 'email' ? Mail : MessageSquare
  }

  const calculateRate = (value: number, total: number) => {
    return total > 0 ? (value / total * 100).toFixed(1) : '0.0'
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Campaign Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            Loading campaign metrics...
          </div>
        </CardContent>
      </Card>
    )
  }

  const totalMetrics = campaigns.reduce((acc, campaign) => ({
    sent: acc.sent + campaign.metrics.sent,
    delivered: acc.delivered + campaign.metrics.delivered,
    opened: acc.opened + campaign.metrics.opened,
    clicked: acc.clicked + campaign.metrics.clicked,
    converted: acc.converted + campaign.metrics.converted,
    unsubscribed: acc.unsubscribed + campaign.metrics.unsubscribed
  }), { sent: 0, delivered: 0, opened: 0, clicked: 0, converted: 0, unsubscribed: 0 })

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMetrics.sent.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {campaigns.length} campaigns
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Rate</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {calculateRate(totalMetrics.opened, totalMetrics.delivered)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {totalMetrics.opened.toLocaleString()} opened
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Click Rate</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {calculateRate(totalMetrics.clicked, totalMetrics.opened)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {totalMetrics.clicked.toLocaleString()} clicked
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {calculateRate(totalMetrics.converted, totalMetrics.clicked)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {totalMetrics.converted.toLocaleString()} converted
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Campaigns</CardTitle>
        </CardHeader>
        <CardContent>
          {campaigns.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No campaigns sent yet. Create your first campaign to see metrics.
            </div>
          ) : (
            <div className="space-y-4">
              {campaigns.map((campaign) => {
                const TypeIcon = getTypeIcon(campaign.type)
                const openRate = parseFloat(calculateRate(campaign.metrics.opened, campaign.metrics.delivered))
                
                return (
                  <div key={campaign.id} className="space-y-3 p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <TypeIcon className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <h4 className="font-semibold">{campaign.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            Sent {new Date(campaign.sent_at!).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Badge variant={campaign.type === 'email' ? 'default' : 'secondary'}>
                        {campaign.type}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-5 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Sent</p>
                        <p className="font-medium">{campaign.metrics.sent}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Delivered</p>
                        <p className="font-medium">{campaign.metrics.delivered}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Opened</p>
                        <p className="font-medium">{campaign.metrics.opened}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Clicked</p>
                        <p className="font-medium">{campaign.metrics.clicked}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Converted</p>
                        <p className="font-medium">{campaign.metrics.converted}</p>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Open Rate</span>
                        <span className="font-medium">{openRate}%</span>
                      </div>
                      <Progress value={openRate} className="h-2" />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}