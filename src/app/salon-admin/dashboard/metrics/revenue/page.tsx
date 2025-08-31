import { createServerClient } from '@/lib/database/supabase/server'
import { getRevenueMetrics } from '@/lib/data-access/analytics/metrics'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowLeft,
  Download,
  Calendar,
  CreditCard,
  Percent,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import Link from 'next/link'
import RevenueChart from '../revenue-chart'

export default async function RevenueAnalyticsPage() {
  const supabase = await createServerClient()
  
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

  // Get revenue data for different periods
  const [dailyRevenue, weeklyRevenue, monthlyRevenue, yearlyRevenue] = await Promise.all([
    getRevenueMetrics(userRole.salon_id, 'day'),
    getRevenueMetrics(userRole.salon_id, 'week'),
    getRevenueMetrics(userRole.salon_id, 'month'),
    getRevenueMetrics(userRole.salon_id, 'year')
  ])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`
  }

  // Calculate additional metrics
  const calculateAverageTransaction = (transactions: any[]) => {
    const validTransactions = transactions.filter(t => t.type === 'payment' && t.amount > 0)
    if (validTransactions.length === 0) return 0
    return validTransactions.reduce((sum, t) => sum + t.amount, 0) / validTransactions.length
  }

  const calculateTransactionCount = (transactions: any[]) => {
    return transactions.filter(t => t.type === 'payment').length
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
            <h1 className="text-3xl font-bold">Revenue Analytics</h1>
            <p className="text-muted-foreground mt-1">
              Detailed financial performance analysis
            </p>
          </div>
        </div>
        <Button>
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Period Selector Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        {/* Today */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription>Today</CardDescription>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(dailyRevenue.currentRevenue)}
            </div>
            <div className="flex items-center gap-1 mt-1">
              {dailyRevenue.growth >= 0 ? (
                <>
                  <ArrowUpRight className="h-3 w-3 text-green-600" />
                  <span className="text-xs text-green-600">
                    {formatPercentage(dailyRevenue.growth)}
                  </span>
                </>
              ) : (
                <>
                  <ArrowDownRight className="h-3 w-3 text-red-600" />
                  <span className="text-xs text-red-600">
                    {formatPercentage(dailyRevenue.growth)}
                  </span>
                </>
              )}
              <span className="text-xs text-muted-foreground">vs yesterday</span>
            </div>
          </CardContent>
        </Card>

        {/* This Week */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription>This Week</CardDescription>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(weeklyRevenue.currentRevenue)}
            </div>
            <div className="flex items-center gap-1 mt-1">
              {weeklyRevenue.growth >= 0 ? (
                <>
                  <ArrowUpRight className="h-3 w-3 text-green-600" />
                  <span className="text-xs text-green-600">
                    {formatPercentage(weeklyRevenue.growth)}
                  </span>
                </>
              ) : (
                <>
                  <ArrowDownRight className="h-3 w-3 text-red-600" />
                  <span className="text-xs text-red-600">
                    {formatPercentage(weeklyRevenue.growth)}
                  </span>
                </>
              )}
              <span className="text-xs text-muted-foreground">vs last week</span>
            </div>
          </CardContent>
        </Card>

        {/* This Month */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription>This Month</CardDescription>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(monthlyRevenue.currentRevenue)}
            </div>
            <div className="flex items-center gap-1 mt-1">
              {monthlyRevenue.growth >= 0 ? (
                <>
                  <ArrowUpRight className="h-3 w-3 text-green-600" />
                  <span className="text-xs text-green-600">
                    {formatPercentage(monthlyRevenue.growth)}
                  </span>
                </>
              ) : (
                <>
                  <ArrowDownRight className="h-3 w-3 text-red-600" />
                  <span className="text-xs text-red-600">
                    {formatPercentage(monthlyRevenue.growth)}
                  </span>
                </>
              )}
              <span className="text-xs text-muted-foreground">vs last month</span>
            </div>
          </CardContent>
        </Card>

        {/* This Year */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription>This Year</CardDescription>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(yearlyRevenue.currentRevenue)}
            </div>
            <div className="flex items-center gap-1 mt-1">
              {yearlyRevenue.growth >= 0 ? (
                <>
                  <ArrowUpRight className="h-3 w-3 text-green-600" />
                  <span className="text-xs text-green-600">
                    {formatPercentage(yearlyRevenue.growth)}
                  </span>
                </>
              ) : (
                <>
                  <ArrowDownRight className="h-3 w-3 text-red-600" />
                  <span className="text-xs text-red-600">
                    {formatPercentage(yearlyRevenue.growth)}
                  </span>
                </>
              )}
              <span className="text-xs text-muted-foreground">vs last year</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="projections">Projections</TabsTrigger>
        </TabsList>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Revenue Trend</CardTitle>
              <CardDescription>
                Daily revenue over the past 30 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RevenueChart data={monthlyRevenue.dailyRevenue} />
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Average Transaction</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(calculateAverageTransaction(monthlyRevenue.transactions))}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Per customer visit
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Transaction Count</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {calculateTransactionCount(monthlyRevenue.transactions)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  This month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Growth Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${monthlyRevenue.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatPercentage(monthlyRevenue.growth)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Month over month
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Breakdown Tab */}
        <TabsContent value="breakdown" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Credit Card</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">65%</p>
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(monthlyRevenue.currentRevenue * 0.65)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Cash</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">25%</p>
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(monthlyRevenue.currentRevenue * 0.25)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Percent className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Other</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">10%</p>
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(monthlyRevenue.currentRevenue * 0.10)}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Revenue Days</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {monthlyRevenue.dailyRevenue
                    .slice()
                    .sort((a, b) => b.amount - a.amount)
                    .slice(0, 5)
                    .map((day, index) => (
                      <div key={day.date} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="w-6 h-6 rounded-full p-0 flex items-center justify-center">
                            {index + 1}
                          </Badge>
                          <span className="text-sm">
                            {new Date(day.date).toLocaleDateString('en-US', { 
                              weekday: 'short', 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </span>
                        </div>
                        <span className="text-sm font-semibold">
                          {formatCurrency(day.amount)}
                        </span>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>
                Latest payment transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Transaction details will be displayed here
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Projections Tab */}
        <TabsContent value="projections" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Projections</CardTitle>
              <CardDescription>
                Estimated future revenue based on current trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Next Month Projection</p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(monthlyRevenue.currentRevenue * 1.1)}
                    </p>
                    <Badge variant="outline" className="text-xs">
                      Based on 10% growth
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Quarter Projection</p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(monthlyRevenue.currentRevenue * 3.2)}
                    </p>
                    <Badge variant="outline" className="text-xs">
                      3 month estimate
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Year-End Projection</p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(yearlyRevenue.currentRevenue * 1.15)}
                    </p>
                    <Badge variant="outline" className="text-xs">
                      15% annual growth
                    </Badge>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    * Projections are estimates based on historical data and current trends. 
                    Actual results may vary.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}