import { createClient } from '@/lib/database/supabase/server'
import { getCustomerMetrics } from '@/lib/data-access/analytics/metrics'
import { redirect } from 'next/navigation'
import { CustomerSegmentChart } from '@/components/salon-owner/charts/customer-segment-chart'
import { RetentionChart } from '@/components/salon-owner/charts/retention-chart'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Button,
  Badge,
  Progress
} from '@/components/ui'
import { 
  Users,
  UserPlus,
  UserCheck,
  TrendingUp,
  Calendar,
  DollarSign,
  ArrowLeft,
  Download,
  Heart,
  Star,
  Target,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import Link from 'next/link'
// import CustomerSegmentChart from './customer-segment-chart'
// import RetentionChart from './retention-chart'

export default async function CustomerAnalyticsPage() {
  const supabase = await createClient()
  
  // Check authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Get user's salon
  const { data: userRole } = await supabase
    .from('user_roles')
    .select('salon_id')
    .eq('user_id', user.id)
    .single()

  if (!userRole?.salon_id) {
    redirect('/401')
  }

  // Get customer metrics
  const customerData = await getCustomerMetrics(userRole.salon_id)

  // Get additional customer insights
  const { data: recentCustomers } = await supabase
    .from('customers')
    .select('*')
    .eq('salon_id', userRole.salon_id)
    .order('created_at', { ascending: false })
    .limit(5)

  const { data: topSpenders } = await supabase
    .from('appointments')
    .select(`
      customer_id,
      total_amount,
      profiles!appointments_customer_id_fkey (
        id,
        first_name,
        last_name,
        email
      )
    `)
    .eq('salon_id', userRole.salon_id)
    .eq('status', 'completed')
    .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

  // Calculate top spenders
  const spenderMap = new Map<string, { customer: any; total: number }>()
  topSpenders?.forEach(t => {
    if (t.customer_id && t.profiles) {
      const existing = spenderMap.get(t.customer_id) || { customer: t.profiles, total: 0 }
      existing.total += t.total_amount || 0
      spenderMap.set(t.customer_id, existing)
    }
  })

  const topCustomers = Array.from(spenderMap.values())
    .sort((a, b) => b.total - a.total)
    .slice(0, 5)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`
  }

  // Customer segments (mock data for now)
  const segments = {
    vip: { count: Math.floor(customerData.totalCustomers * 0.1), percentage: 10 },
    regular: { count: Math.floor(customerData.totalCustomers * 0.3), percentage: 30 },
    occasional: { count: Math.floor(customerData.totalCustomers * 0.4), percentage: 40 },
    new: { count: customerData.newCustomers, percentage: 20 }
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/salon-admin/dashboard/metrics">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Customer Analytics</h1>
            <p className="text-muted-foreground mt-1">
              Understanding your customer base and behavior
            </p>
          </div>
        </div>
        <Button>
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription>Total Customers</CardDescription>
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {customerData.totalCustomers.toLocaleString()}
            </div>
            <div className="flex items-center gap-1 mt-1">
              <ArrowUpRight className="h-3 w-3 text-green-600" />
              <span className="text-xs text-green-600">
                {formatPercentage(customerData.customerGrowth)}
              </span>
              <span className="text-xs text-muted-foreground">growth</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription>New Customers</CardDescription>
              <UserPlus className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {customerData.newCustomers}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Last 30 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription>Retention Rate</CardDescription>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {customerData.retentionRate.toFixed(1)}%
            </div>
            <Progress 
              value={customerData.retentionRate} 
              className="h-1 mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription>Avg Lifetime Value</CardDescription>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(customerData.avgLifetimeValue)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Per customer
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="segments" className="space-y-4">
        <TabsList>
          <TabsTrigger value="segments">Segments</TabsTrigger>
          <TabsTrigger value="retention">Retention</TabsTrigger>
          <TabsTrigger value="acquisition">Acquisition</TabsTrigger>
          <TabsTrigger value="behavior">Behavior</TabsTrigger>
        </TabsList>

        {/* Segments Tab */}
        <TabsContent value="segments" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Customer Segments</CardTitle>
                <CardDescription>
                  Distribution by engagement level
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CustomerSegmentChart data={segments} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Segment Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm font-medium">VIP Customers</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">{segments.vip.count}</p>
                      <p className="text-xs text-muted-foreground">{segments.vip.percentage}%</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Heart className="h-4 w-4 text-red-500" />
                      <span className="text-sm font-medium">Regular Visitors</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">{segments.regular.count}</p>
                      <p className="text-xs text-muted-foreground">{segments.regular.percentage}%</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium">Occasional</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">{segments.occasional.count}</p>
                      <p className="text-xs text-muted-foreground">{segments.occasional.percentage}%</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <UserPlus className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium">New Customers</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">{segments.new.count}</p>
                      <p className="text-xs text-muted-foreground">{segments.new.percentage}%</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Customers */}
          <Card>
            <CardHeader>
              <CardTitle>Top Customers</CardTitle>
              <CardDescription>
                Highest value customers this month
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topCustomers.map((customer, index) => (
                  <div key={customer.customer.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center h-8 w-8 rounded-full bg-muted text-sm font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {customer.customer.first_name} {customer.customer.last_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {customer.customer.email}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">
                        {formatCurrency(customer.total)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Retention Tab */}
        <TabsContent value="retention" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Retention Analysis</CardTitle>
              <CardDescription>
                Customer retention over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RetentionChart data={[]} 
                currentRate={customerData.retentionRate}
                returningCustomers={customerData.returningCustomers}
                totalCustomers={customerData.totalCustomers}
              />
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Returning Customers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {customerData.returningCustomers}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Visited in last 60 days
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Churn Risk</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {Math.max(0, customerData.totalCustomers - customerData.returningCustomers - customerData.newCustomers)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Haven't visited recently
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Win-Back Target</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.floor((customerData.totalCustomers - customerData.returningCustomers) * 0.3)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Prime for re-engagement
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Acquisition Tab */}
        <TabsContent value="acquisition" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Customer Acquisition</CardTitle>
              <CardDescription>
                How customers find and join your salon
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Acquisition Cost</p>
                    <p className="text-2xl font-bold">$45</p>
                    <Badge variant="outline" className="text-xs">Per customer</Badge>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Conversion Rate</p>
                    <p className="text-2xl font-bold">23%</p>
                    <Badge variant="outline" className="text-xs">From leads</Badge>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Referral Rate</p>
                    <p className="text-2xl font-bold">35%</p>
                    <Badge variant="outline" className="text-xs">Word of mouth</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Customers */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Sign-ups</CardTitle>
              <CardDescription>
                Newest customers in your salon
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentCustomers?.map((customer) => (
                  <div key={customer.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">
                        {customer.first_name} {customer.last_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {customer.email}
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {new Date(customer.created_at).toLocaleDateString()}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Behavior Tab */}
        <TabsContent value="behavior" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Customer Behavior Patterns</CardTitle>
              <CardDescription>
                Understanding how customers interact with your salon
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <h4 className="text-sm font-medium">Booking Patterns</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Avg booking frequency</span>
                      <span className="font-medium">Every 4.2 weeks</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Preferred booking day</span>
                      <span className="font-medium">Saturday</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Advance booking</span>
                      <span className="font-medium">5.3 days</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-medium">Service Preferences</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Services per visit</span>
                      <span className="font-medium">1.8</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Avg spend per visit</span>
                      <span className="font-medium">$85</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Loyalty program</span>
                      <span className="font-medium">62% enrolled</span>
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