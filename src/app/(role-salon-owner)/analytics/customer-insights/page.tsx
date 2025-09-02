import { Card, CardContent, CardDescription, CardHeader, CardTitle, Tabs, TabsContent, TabsList, TabsTrigger, Badge, Progress } from '@/components/ui'
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Calendar,
  DollarSign,
  Star,
  Clock,
  ShoppingBag
} from 'lucide-react'
import { createClient } from '@/lib/database/supabase/server'
import { formatDistanceToNow } from 'date-fns'

export default async function CustomerInsightsPage() {
  const supabase = await createClient()
  
  // Get customer analytics data
  const { data: customerAnalytics } = await supabase
    .from('customer_analytics')
    .select('*')
    .order('last_visit_date', { ascending: false })
    .limit(100)
  
  // Calculate aggregate metrics
  const totalCustomers = customerAnalytics?.length || 0
  const avgLifetimeValue = totalCustomers > 0 ? (customerAnalytics?.reduce((sum, c) => sum + (c.lifetime_revenue || 0), 0) || 0) / totalCustomers : 0
  const avgVisitFrequency = totalCustomers > 0 ? (customerAnalytics?.reduce((sum, c) => sum + (c.lifetime_appointments || 0), 0) || 0) / totalCustomers : 0
  const avgSpendPerVisit = totalCustomers > 0 && avgVisitFrequency > 0 ? avgLifetimeValue / avgVisitFrequency : 0
  
  // Segment customers
  const vipCustomers = customerAnalytics?.filter(c => (c.lifetime_revenue || 0) > 1000) || []
  const regularCustomers = customerAnalytics?.filter(c => (c.lifetime_appointments || 0) >= 3) || []
  const newCustomers = customerAnalytics?.filter(c => (c.lifetime_appointments || 0) === 1) || []
  const churningCustomers = customerAnalytics?.filter(c => {
    if (!c.last_visit_date) return false
    const daysSinceLastVisit = (Date.now() - new Date(c.last_visit_date).getTime()) / (1000 * 60 * 60 * 24)
    return daysSinceLastVisit > 60
  }) || []
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Customer Insights</h1>
        <p className="text-muted-foreground">Deep analytics on customer behavior and value</p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCustomers}</div>
            <p className="text-xs text-muted-foreground">Active in database</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Lifetime Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${avgLifetimeValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Per customer</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Visit Frequency</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgVisitFrequency.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">Visits per month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Spend</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${avgSpendPerVisit.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Per visit</p>
          </CardContent>
        </Card>
      </div>

      {/* Customer Segments */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">VIP Customers</CardTitle>
            <CardDescription>LTV &gt; $1000</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">{vipCustomers.length}</div>
              <Badge variant="default">
                {((vipCustomers.length / totalCustomers) * 100).toFixed(1)}%
              </Badge>
            </div>
            <Progress 
              value={(vipCustomers.length / totalCustomers) * 100} 
              className="mt-2"
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Regular Customers</CardTitle>
            <CardDescription>3+ visits</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">{regularCustomers.length}</div>
              <Badge variant="secondary">
                {((regularCustomers.length / totalCustomers) * 100).toFixed(1)}%
              </Badge>
            </div>
            <Progress 
              value={(regularCustomers.length / totalCustomers) * 100} 
              className="mt-2"
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-base">New Customers</CardTitle>
            <CardDescription>First visit only</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">{newCustomers.length}</div>
              <Badge variant="outline">
                {((newCustomers.length / totalCustomers) * 100).toFixed(1)}%
              </Badge>
            </div>
            <Progress 
              value={(newCustomers.length / totalCustomers) * 100} 
              className="mt-2"
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-base">At Risk</CardTitle>
            <CardDescription>60+ days inactive</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">{churningCustomers.length}</div>
              <Badge variant="destructive">
                {((churningCustomers.length / totalCustomers) * 100).toFixed(1)}%
              </Badge>
            </div>
            <Progress 
              value={(churningCustomers.length / totalCustomers) * 100} 
              className="mt-2"
            />
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="top-customers" className="space-y-4">
        <TabsList>
          <TabsTrigger value="top-customers">Top Customers</TabsTrigger>
          <TabsTrigger value="recent-activity">Recent Activity</TabsTrigger>
          <TabsTrigger value="retention">Retention Analysis</TabsTrigger>
        </TabsList>
        
        <TabsContent value="top-customers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Customers by Lifetime Value</CardTitle>
              <CardDescription>Your most valuable customers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {customerAnalytics?.slice(0, 10).map((customer, index) => (
                  <div key={customer.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-sm font-medium text-muted-foreground">
                        #{index + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium">Customer {customer.customer_id.slice(0, 8)}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>{customer.lifetime_appointments || 0} visits</span>
                          <span>Avg: ${((customer.lifetime_revenue || 0) / Math.max(customer.lifetime_appointments || 1, 1)).toFixed(2)}</span>
                          {customer.last_visit_date && (
                            <span>
                              Last: {formatDistanceToNow(new Date(customer.last_visit_date), { addSuffix: true })}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${customer.lifetime_revenue?.toFixed(2)}</p>
                      <div className="flex items-center gap-1 text-xs">
                        {((customer.lifetime_appointments || 0) / Math.max(customer.days_since_last_visit || 30, 1) * 30) > avgVisitFrequency ? (
                          <TrendingUp className="h-3 w-3 text-green-500" />
                        ) : (
                          <TrendingDown className="h-3 w-3 text-red-500" />
                        )}
                        <span>{((customer.lifetime_appointments || 0) / Math.max(customer.days_since_last_visit || 30, 1) * 30).toFixed(1)} visits/mo</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="recent-activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Customer Activity</CardTitle>
              <CardDescription>Latest customer visits and purchases</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {customerAnalytics
                  ?.filter(c => c.last_visit_date)
                  .sort((a, b) => new Date(b.last_visit_date!).getTime() - new Date(a.last_visit_date!).getTime())
                  .slice(0, 15)
                  .map((customer) => (
                    <div key={customer.id} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <p className="text-sm font-medium">Customer {customer.customer_id.slice(0, 8)}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(customer.last_visit_date!), { addSuffix: true })}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant="outline">
                          {customer.lifetime_appointments || 0} visits
                        </Badge>
                        <span className="text-sm font-medium">
                          ${((customer.lifetime_revenue || 0) / Math.max(customer.lifetime_appointments || 1, 1)).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="retention" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Customer Retention Metrics</CardTitle>
              <CardDescription>Understanding customer loyalty patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-2">Visit Frequency Distribution</p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Daily (30+ visits/mo)</span>
                        <Badge>{customerAnalytics?.filter(c => ((c.lifetime_appointments || 0) / Math.max(c.days_since_last_visit || 30, 1) * 30) >= 30).length}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Weekly (4-30 visits/mo)</span>
                        <Badge>{customerAnalytics?.filter(c => { const freq = (c.lifetime_appointments || 0) / Math.max(c.days_since_last_visit || 30, 1) * 30; return freq >= 4 && freq < 30; }).length}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Monthly (1-4 visits/mo)</span>
                        <Badge>{customerAnalytics?.filter(c => { const freq = (c.lifetime_appointments || 0) / Math.max(c.days_since_last_visit || 30, 1) * 30; return freq >= 1 && freq < 4; }).length}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Occasional (&lt;1 visit/mo)</span>
                        <Badge>{customerAnalytics?.filter(c => ((c.lifetime_appointments || 0) / Math.max(c.days_since_last_visit || 30, 1) * 30) < 1).length}</Badge>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-2">Lifetime Value Brackets</p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">$1000+</span>
                        <Badge variant="default">{customerAnalytics?.filter(c => (c.lifetime_revenue || 0) >= 1000).length}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">$500-$1000</span>
                        <Badge variant="secondary">{customerAnalytics?.filter(c => (c.lifetime_revenue || 0) >= 500 && (c.lifetime_revenue || 0) < 1000).length}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">$100-$500</span>
                        <Badge variant="outline">{customerAnalytics?.filter(c => (c.lifetime_revenue || 0) >= 100 && (c.lifetime_revenue || 0) < 500).length}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Under $100</span>
                        <Badge variant="outline">{customerAnalytics?.filter(c => (c.lifetime_revenue || 0) < 100).length}</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}