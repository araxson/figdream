import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/database/supabase/server'
import { getStaffTipsReport } from '@/lib/data-access/payments/payment-records'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingUp, DollarSign, Calendar, Award, Gift } from 'lucide-react'
import { format, parseISO, startOfWeek, endOfWeek } from 'date-fns'

interface PageProps {
  searchParams: {
    startDate?: string
    endDate?: string
  }
}

async function StaffTipsContent({ searchParams }: PageProps) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Get staff profile
  const { data: staffProfile } = await supabase
    .from('profiles')
    .select('id, full_name, role, salon_id')
    .eq('id', user.id)
    .single()

  if (!staffProfile || staffProfile.role !== 'staff') {
    redirect('/')
  }

  // Set default date range (last 30 days)
  const endDate = searchParams.endDate || new Date().toISOString().split('T')[0]
  const startDate = searchParams.startDate || (() => {
    const date = new Date()
    date.setDate(date.getDate() - 30)
    return date.toISOString().split('T')[0]
  })()

  // Get tips report
  const { tips, total } = await getStaffTipsReport(staffProfile.id, {
    startDate,
    endDate,
  })

  // Get additional payment data for charts
  const { data: paymentData } = await supabase
    .from('payment_records')
    .select('payment_date, tip_amount, service_amount, payment_method')
    .eq('staff_id', staffProfile.id)
    .gte('payment_date', startDate)
    .lte('payment_date', endDate)
    .order('payment_date', { ascending: false })

  // Process data for charts
  const dailyTips: Record<string, number> = {}
  const tipsByMethod: Record<string, number> = {}
  let totalServices = 0

  paymentData?.forEach(payment => {
    // Daily aggregation
    const dateKey = payment.payment_date.split('T')[0]
    dailyTips[dateKey] = (dailyTips[dateKey] || 0) + (payment.tip_amount || 0)
    
    // Payment method aggregation
    if (payment.tip_amount > 0) {
      const method = payment.payment_method || 'unknown'
      tipsByMethod[method] = (tipsByMethod[method] || 0) + payment.tip_amount
    }
    
    totalServices += payment.service_amount || 0
  })

  const averageTipPercentage = totalServices > 0 ? (total / totalServices) * 100 : 0
  const averageTipAmount = tips.length > 0 ? total / tips.length : 0

  // Prepare chart data
  const dailyChartData = Object.entries(dailyTips)
    .map(([date, amount]) => ({
      date: format(parseISO(date), 'MMM d'),
      amount,
    }))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-14) // Show last 14 days

  // Current week vs last week comparison
  const currentWeekStart = startOfWeek(new Date())
  const currentWeekEnd = endOfWeek(new Date())
  const lastWeekStart = new Date(currentWeekStart)
  lastWeekStart.setDate(lastWeekStart.getDate() - 7)
  const lastWeekEnd = new Date(currentWeekEnd)
  lastWeekEnd.setDate(lastWeekEnd.getDate() - 7)

  let currentWeekTotal = 0
  let lastWeekTotal = 0

  Object.entries(dailyTips).forEach(([date, amount]) => {
    const d = parseISO(date)
    if (d >= currentWeekStart && d <= currentWeekEnd) {
      currentWeekTotal += amount
    } else if (d >= lastWeekStart && d <= lastWeekEnd) {
      lastWeekTotal += amount
    }
  })

  const weekOverWeekChange = lastWeekTotal > 0 
    ? ((currentWeekTotal - lastWeekTotal) / lastWeekTotal) * 100 
    : 0

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Tips</h1>
        <p className="text-muted-foreground">
          Track your tips and earnings performance
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Total Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${total.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {tips.length} tipped services
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Average Tip
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${averageTipAmount.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {averageTipPercentage.toFixed(1)}% of services
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              This Week
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${currentWeekTotal.toFixed(2)}</div>
            <div className="flex items-center text-xs">
              {weekOverWeekChange > 0 ? (
                <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
              ) : (
                <TrendingUp className="h-3 w-3 mr-1 text-red-600 rotate-180" />
              )}
              <span className={weekOverWeekChange > 0 ? 'text-green-600' : 'text-red-600'}>
                {weekOverWeekChange > 0 ? '+' : ''}{weekOverWeekChange.toFixed(1)}% vs last week
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Award className="h-4 w-4" />
              Best Day
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${Math.max(...Object.values(dailyTips), 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Single day record
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="recent" className="space-y-4">
        <TabsList>
          <TabsTrigger value="recent">Recent Tips</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Tips Received</CardTitle>
              <CardDescription>
                Your most recent tipped services
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead className="text-right">Service Amount</TableHead>
                    <TableHead className="text-right">Tip Amount</TableHead>
                    <TableHead className="text-right">Tip %</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tips.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        <p className="text-muted-foreground">No tips received in this period</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    tips.slice(0, 10).map((tip, index) => {
                      const serviceAmount = paymentData?.find(
                        p => p.payment_date === tip.payment_date && p.tip_amount === tip.tip_amount
                      )?.service_amount || 0
                      const tipPercentage = serviceAmount > 0 
                        ? (tip.tip_amount / serviceAmount) * 100 
                        : 0
                      
                      return (
                        <TableRow key={index}>
                          <TableCell>
                            {format(parseISO(tip.payment_date), 'MMM d, yyyy')}
                          </TableCell>
                          <TableCell>{tip.customer?.full_name || 'Anonymous'}</TableCell>
                          <TableCell className="text-right">
                            ${serviceAmount.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            ${tip.tip_amount.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge variant={tipPercentage >= 20 ? 'default' : 'secondary'}>
                              {tipPercentage.toFixed(1)}%
                            </Badge>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Daily Tips Trend</CardTitle>
              <CardDescription>
                Your tips over the last 14 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={dailyChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${Number(value).toFixed(2)}`} />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    dot={{ fill: '#8b5cf6' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Weekly Performance</CardTitle>
              <CardDescription>
                Compare your weekly tip earnings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Current Week</p>
                    <p className="text-2xl font-bold">${currentWeekTotal.toFixed(2)}</p>
                  </div>
                  {weekOverWeekChange > 0 && (
                    <Badge className="bg-green-100 text-green-800">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Up {weekOverWeekChange.toFixed(1)}%
                    </Badge>
                  )}
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Last Week</p>
                    <p className="text-2xl font-bold text-muted-foreground">
                      ${lastWeekTotal.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Tips by Payment Method</CardTitle>
                <CardDescription>
                  Which payment methods generate the most tips
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(tipsByMethod)
                    .sort((a, b) => b[1] - a[1])
                    .map(([method, amount]) => {
                      const percentage = (amount / total) * 100
                      return (
                        <div key={method} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm capitalize">
                              {method.replace('_', ' ')}
                            </span>
                            <span className="font-medium">${amount.toFixed(2)}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-purple-600 h-2 rounded-full"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      )
                    })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Tippers</CardTitle>
                <CardDescription>
                  Customers who tip you the most
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {tips
                    .filter((t) => t.customer?.full_name)
                    .slice(0, 5)
                    .map((tip, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                            <Gift className="h-4 w-4 text-purple-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">
                              {tip.customer.full_name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {format(parseISO(tip.payment_date), 'MMM d')}
                            </p>
                          </div>
                        </div>
                        <span className="font-semibold">${tip.tip_amount.toFixed(2)}</span>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Tips Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm">Average Tip Percentage</span>
                <Badge>{averageTipPercentage.toFixed(1)}%</Badge>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm">Average Tip Amount</span>
                <span className="font-medium">${averageTipAmount.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm">Total Tipped Services</span>
                <span className="font-medium">{tips.length}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm">Period Total</span>
                <span className="font-bold text-lg">${total.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="space-y-1">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      
      <div className="grid gap-4 md:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-3 w-20 mt-1" />
            </CardContent>
          </Card>
        ))}
      </div>
      
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    </div>
  )
}

export default function StaffTipsPage({ searchParams }: PageProps) {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <StaffTipsContent searchParams={searchParams} />
    </Suspense>
  )
}