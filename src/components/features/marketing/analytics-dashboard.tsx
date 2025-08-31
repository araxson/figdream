/**
 * Marketing Analytics Dashboard Component for FigDream
 * Comprehensive analytics and reporting for marketing campaigns
 */

'use client'

import { useState, useMemo } from 'react'
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Mail,
  MessageSquare,
  DollarSign,
  Eye,
  MousePointer,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Filter,
  Download,
  RefreshCw,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface CampaignMetric {
  campaign_id: string
  campaign_name: string
  type: 'email' | 'sms' | 'push' | 'in_app'
  sent_count: number
  delivered_count: number
  opened_count: number
  clicked_count: number
  bounced_count: number
  unsubscribed_count: number
  revenue_generated: number
  conversions: number
  sent_date: string
}

interface AnalyticsData {
  overview: {
    total_sent: number
    total_delivered: number
    total_opened: number
    total_clicked: number
    total_revenue: number
    total_conversions: number
    avg_open_rate: number
    avg_click_rate: number
    avg_conversion_rate: number
  }
  campaigns: CampaignMetric[]
  trends: {
    date: string
    sent: number
    opened: number
    clicked: number
    revenue: number
  }[]
  segments: {
    segment_name: string
    member_count: number
    engagement_rate: number
    revenue_per_member: number
  }[]
}

interface AnalyticsDashboardProps {
  data: AnalyticsData
  onRefresh?: () => void
  onExport?: () => void
}

export function AnalyticsDashboard({ data, onRefresh, onExport }: AnalyticsDashboardProps) {
  const [dateRange, setDateRange] = useState('30d')
  const [campaignType, setCampaignType] = useState<string>('all')
  const [selectedMetric, setSelectedMetric] = useState<'revenue' | 'engagement' | 'growth'>('engagement')

  // Calculate percentage changes
  const calculateChange = (current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? 100 : 0
    return ((current - previous) / previous) * 100
  }

  // Filter campaigns by type
  const filteredCampaigns = useMemo(() => {
    if (campaignType === 'all') return data.campaigns
    return data.campaigns.filter(c => c.type === campaignType)
  }, [data.campaigns, campaignType])

  // Calculate top performing campaigns
  const topCampaigns = useMemo(() => {
    return [...filteredCampaigns]
      .sort((a, b) => {
        if (selectedMetric === 'revenue') {
          return b.revenue_generated - a.revenue_generated
        } else if (selectedMetric === 'engagement') {
          const aRate = (a.opened_count + a.clicked_count) / (a.sent_count || 1)
          const bRate = (b.opened_count + b.clicked_count) / (b.sent_count || 1)
          return bRate - aRate
        } else {
          return b.conversions - a.conversions
        }
      })
      .slice(0, 5)
  }, [filteredCampaigns, selectedMetric])

  const MetricCard = ({ 
    title, 
    value, 
    change, 
    icon: Icon,
    format = 'number'
  }: {
    title: string
    value: number
    change?: number
    icon: any
    format?: 'number' | 'percentage' | 'currency'
  }) => {
    const formattedValue = () => {
      switch (format) {
        case 'percentage':
          return `${value.toFixed(1)}%`
        case 'currency':
          return `$${value.toLocaleString()}`
        default:
          return value.toLocaleString()
      }
    }

    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formattedValue()}</div>
          {change !== undefined && (
            <div className="flex items-center text-xs text-muted-foreground">
              {change > 0 ? (
                <>
                  <ArrowUpRight className="mr-1 h-3 w-3 text-green-500" />
                  <span className="text-green-500">+{change.toFixed(1)}%</span>
                </>
              ) : (
                <>
                  <ArrowDownRight className="mr-1 h-3 w-3 text-red-500" />
                  <span className="text-red-500">{change.toFixed(1)}%</span>
                </>
              )}
              <span className="ml-1">from last period</span>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Select date range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="365d">Last year</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>

          <Select value={campaignType} onValueChange={setCampaignType}>
            <SelectTrigger className="w-[150px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Campaign type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="sms">SMS</SelectItem>
              <SelectItem value="push">Push</SelectItem>
              <SelectItem value="in_app">In-App</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          {onRefresh && (
            <Button variant="outline" size="sm" onClick={onRefresh}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          )}
          {onExport && (
            <Button variant="outline" size="sm" onClick={onExport}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          )}
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Sent"
          value={data.overview.total_sent}
          change={12.5}
          icon={Mail}
        />
        <MetricCard
          title="Open Rate"
          value={data.overview.avg_open_rate}
          change={-2.3}
          icon={Eye}
          format="percentage"
        />
        <MetricCard
          title="Click Rate"
          value={data.overview.avg_click_rate}
          change={5.7}
          icon={MousePointer}
          format="percentage"
        />
        <MetricCard
          title="Revenue"
          value={data.overview.total_revenue}
          change={18.2}
          icon={DollarSign}
          format="currency"
        />
      </div>

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="segments">Segments</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Top Performing Campaigns</CardTitle>
                  <CardDescription>Based on {selectedMetric}</CardDescription>
                </div>
                <Select value={selectedMetric} onValueChange={(v: any) => setSelectedMetric(v)}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="engagement">Engagement</SelectItem>
                    <SelectItem value="revenue">Revenue</SelectItem>
                    <SelectItem value="growth">Growth</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topCampaigns.map((campaign) => {
                  const openRate = (campaign.opened_count / campaign.sent_count) * 100
                  const clickRate = (campaign.clicked_count / campaign.opened_count) * 100
                  
                  return (
                    <div key={campaign.campaign_id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {campaign.type === 'email' && <Mail className="h-3 w-3" />}
                            {campaign.type === 'sms' && <MessageSquare className="h-3 w-3" />}
                          </Badge>
                          <span className="font-medium">{campaign.campaign_name}</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <div className="flex items-center gap-1">
                                  <Eye className="h-3 w-3" />
                                  <span>{openRate.toFixed(1)}%</span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>Open Rate</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <div className="flex items-center gap-1">
                                  <MousePointer className="h-3 w-3" />
                                  <span>{clickRate.toFixed(1)}%</span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>Click Rate</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <div className="flex items-center gap-1">
                                  <DollarSign className="h-3 w-3" />
                                  <span>${campaign.revenue_generated.toFixed(0)}</span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>Revenue Generated</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>
                      <Progress value={openRate} className="h-2" />
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Campaign Comparison */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Email vs SMS Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Email Campaigns</span>
                      <span className="text-sm text-muted-foreground">
                        {data.campaigns.filter(c => c.type === 'email').length} campaigns
                      </span>
                    </div>
                    <Progress value={65} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">65% avg open rate</p>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">SMS Campaigns</span>
                      <span className="text-sm text-muted-foreground">
                        {data.campaigns.filter(c => c.type === 'sms').length} campaigns
                      </span>
                    </div>
                    <Progress value={98} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">98% avg delivery rate</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Conversion Funnel</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Sent</span>
                    <span className="font-medium">{data.overview.total_sent.toLocaleString()}</span>
                  </div>
                  <Progress value={100} className="h-2" />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Delivered</span>
                    <span className="font-medium">{data.overview.total_delivered.toLocaleString()}</span>
                  </div>
                  <Progress value={(data.overview.total_delivered / data.overview.total_sent) * 100} className="h-2" />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Opened</span>
                    <span className="font-medium">{data.overview.total_opened.toLocaleString()}</span>
                  </div>
                  <Progress value={(data.overview.total_opened / data.overview.total_sent) * 100} className="h-2" />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Clicked</span>
                    <span className="font-medium">{data.overview.total_clicked.toLocaleString()}</span>
                  </div>
                  <Progress value={(data.overview.total_clicked / data.overview.total_sent) * 100} className="h-2" />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Converted</span>
                    <span className="font-medium">{data.overview.total_conversions.toLocaleString()}</span>
                  </div>
                  <Progress value={(data.overview.total_conversions / data.overview.total_sent) * 100} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Engagement Tab */}
        <TabsContent value="engagement" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Engagement by Day</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day, idx) => {
                    const value = 50 + Math.random() * 50
                    return (
                      <div key={day} className="flex items-center justify-between">
                        <span className="text-sm">{day.slice(0, 3)}</span>
                        <div className="flex items-center gap-2">
                          <Progress value={value} className="w-20 h-2" />
                          <span className="text-xs text-muted-foreground w-10">
                            {value.toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Best Send Times</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2 rounded bg-green-50 dark:bg-green-950">
                    <span className="text-sm font-medium">10:00 AM - 12:00 PM</span>
                    <Badge variant="success">Best</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded">
                    <span className="text-sm">2:00 PM - 4:00 PM</span>
                    <span className="text-xs text-muted-foreground">Good</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded">
                    <span className="text-sm">6:00 PM - 8:00 PM</span>
                    <span className="text-xs text-muted-foreground">Good</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded">
                    <span className="text-sm">8:00 AM - 10:00 AM</span>
                    <span className="text-xs text-muted-foreground">Fair</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Device Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm">Mobile</span>
                      <span className="text-sm font-medium">68%</span>
                    </div>
                    <Progress value={68} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm">Desktop</span>
                      <span className="text-sm font-medium">28%</span>
                    </div>
                    <Progress value={28} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm">Tablet</span>
                      <span className="text-sm font-medium">4%</span>
                    </div>
                    <Progress value={4} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Segments Tab */}
        <TabsContent value="segments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Audience Segments Performance</CardTitle>
              <CardDescription>
                Engagement and revenue metrics by customer segment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.segments.map((segment) => (
                  <div key={segment.segment_name} className="space-y-2 p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{segment.segment_name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {segment.member_count.toLocaleString()} members
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold">
                          ${segment.revenue_per_member.toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground">per member</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Engagement Rate</span>
                      <div className="flex items-center gap-2">
                        <Progress value={segment.engagement_rate} className="w-24 h-2" />
                        <span>{segment.engagement_rate.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Performance Trends</CardTitle>
              <CardDescription>
                Key metrics over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                {/* Chart would go here - using placeholder */}
                <BarChart3 className="h-16 w-16" />
                <span className="ml-4">Chart visualization would appear here</span>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Growth Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="text-sm">List Growth</span>
                    </div>
                    <span className="font-medium">+12.5%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Engagement Growth</span>
                    </div>
                    <span className="font-medium">+8.3%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingDown className="h-4 w-4 text-red-500" />
                      <span className="text-sm">Unsubscribe Rate</span>
                    </div>
                    <span className="font-medium">-2.1%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>ROI Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-center py-4">
                    <p className="text-3xl font-bold text-green-600">423%</p>
                    <p className="text-sm text-muted-foreground">Overall ROI</p>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Total Investment</span>
                      <span>$2,450</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Revenue</span>
                      <span className="font-medium">$10,364</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t">
                      <span>Net Profit</span>
                      <span className="font-bold text-green-600">$7,914</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}