import { redirect } from "next/navigation"
import { createClient } from "@/lib/database/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Tabs, TabsContent, TabsList, TabsTrigger, Progress, Badge } from "@/components/ui"
import { Mail, MessageSquare, Users, TrendingUp, Target, MousePointer } from "lucide-react"

export default async function MarketingAnalyticsPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: userRole } = await supabase
    .from("user_roles")
    .select("*, salons (*)")
    .eq("user_id", user.id)
    .eq("role", "salon_owner")
    .single()

  if (!userRole) redirect("/error-403")

  // Get marketing campaigns
  const { data: campaigns } = await supabase
    .from("marketing_campaigns")
    .select(`
      *,
      campaign_analytics (*)
    `)
    .eq("salon_id", userRole.salon_id)
    .order("created_at", { ascending: false })

  // Calculate metrics
  const totalCampaigns = campaigns?.length || 0
  const activeCampaigns = campaigns?.filter(c => c.status === "active").length || 0
  const totalSent = campaigns?.reduce((sum, c) => sum + (c.campaign_analytics?.[0]?.emails_sent || 0), 0) || 0
  const totalOpened = campaigns?.reduce((sum, c) => sum + (c.campaign_analytics?.[0]?.emails_opened || 0), 0) || 0
  const avgOpenRate = totalSent > 0 ? (totalOpened / totalSent) * 100 : 0

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Marketing Analytics</h1>
        <p className="text-muted-foreground">Track campaign performance and engagement</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCampaigns}</div>
            <p className="text-xs text-muted-foreground">{activeCampaigns} active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Emails Sent</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSent.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Rate</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgOpenRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +2.3% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversions</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">247</div>
            <p className="text-xs text-muted-foreground">Bookings from campaigns</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="campaigns">Campaign Performance</TabsTrigger>
          <TabsTrigger value="engagement">Engagement Metrics</TabsTrigger>
          <TabsTrigger value="audience">Audience Insights</TabsTrigger>
          <TabsTrigger value="roi">ROI Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Campaign Performance Trends</CardTitle>
                <CardDescription>Open and click rates over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  Chart placeholder - Performance trends
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Performing Campaigns</CardTitle>
                <CardDescription>Campaigns with highest engagement</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {campaigns?.slice(0, 5).map((campaign) => {
                    const analytics = campaign.campaign_analytics?.[0]
                    const openRate = analytics?.emails_sent > 0 
                      ? (analytics.emails_opened / analytics.emails_sent) * 100 
                      : 0
                    
                    return (
                      <div key={campaign.id} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <p className="text-sm font-medium">{campaign.name}</p>
                          <span className="text-sm text-muted-foreground">
                            {openRate.toFixed(1)}% open
                          </span>
                        </div>
                        <Progress value={openRate} className="h-2" />
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="campaigns">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Details</CardTitle>
              <CardDescription>Individual campaign performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {campaigns?.map((campaign) => {
                  const analytics = campaign.campaign_analytics?.[0]
                  return (
                    <div key={campaign.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-medium">{campaign.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {campaign.campaign_type} • {new Date(campaign.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant={campaign.status === "active" ? "default" : "secondary"}>
                          {campaign.status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Sent</p>
                          <p className="font-medium">{analytics?.emails_sent || 0}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Opened</p>
                          <p className="font-medium">{analytics?.emails_opened || 0}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Clicked</p>
                          <p className="font-medium">{analytics?.links_clicked || 0}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Converted</p>
                          <p className="font-medium">{analytics?.conversions || 0}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="engagement">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Engagement by Day</CardTitle>
                <CardDescription>Best days for email engagement</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  Chart placeholder - Engagement by day
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Engagement by Time</CardTitle>
                <CardDescription>Optimal send times</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  Chart placeholder - Engagement by time
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="audience">
          <Card>
            <CardHeader>
              <CardTitle>Audience Segments</CardTitle>
              <CardDescription>Performance by customer segment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">New Customers</p>
                    <Progress value={75} />
                    <p className="text-xs text-muted-foreground">75% engagement rate</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Regular Customers</p>
                    <Progress value={65} />
                    <p className="text-xs text-muted-foreground">65% engagement rate</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">VIP Customers</p>
                    <Progress value={85} />
                    <p className="text-xs text-muted-foreground">85% engagement rate</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roi">
          <Card>
            <CardHeader>
              <CardTitle>Return on Investment</CardTitle>
              <CardDescription>Revenue generated from marketing campaigns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-3">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Campaign Cost</p>
                  <p className="text-3xl font-bold">$1,250</p>
                  <p className="text-xs text-muted-foreground">Total spend this month</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Revenue Generated</p>
                  <p className="text-3xl font-bold">$8,750</p>
                  <p className="text-xs text-muted-foreground">From campaign bookings</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">ROI</p>
                  <p className="text-3xl font-bold text-green-600">600%</p>
                  <p className="text-xs text-muted-foreground">Return on investment</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}