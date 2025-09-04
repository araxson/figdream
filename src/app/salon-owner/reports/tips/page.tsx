import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/database/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Award, Download } from 'lucide-react'
import { format, parseISO } from 'date-fns'

interface PageProps {
  searchParams: {
    startDate?: string
    endDate?: string
    staffId?: string
  }
}

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444']

async function TipsReportContent({ searchParams }: PageProps) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Get salon info
  const { data: salonData } = await supabase
    .from('salons')
    .select('id, name')
    .eq('owner_id', user.id)
    .single()

  if (!salonData) {
    return (
      <div className="container py-8">
        <Card>
          <CardHeader>
            <CardTitle>No Salon Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              You don&apos;t have access to any salon. Please contact support if this is an error.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Set default date range (last 30 days)
  const endDate = searchParams.endDate || new Date().toISOString().split('T')[0]
  const startDate = searchParams.startDate || (() => {
    const date = new Date()
    date.setDate(date.getDate() - 30)
    return date.toISOString().split('T')[0]
  })()

  // Get all payment records with tips for the period
  let tipsQuery = supabase
    .from('payment_records')
    .select(`
      id,
      staff_id,
      customer_id,
      service_amount,
      tip_amount,
      payment_date,
      payment_method,
      staff:profiles!payment_records_staff_id_fkey(
        id,
        full_name
      ),
      customer:profiles!payment_records_customer_id_fkey(
        id,
        full_name
      )
    `)
    .eq('salon_id', salonData.id)
    .gt('tip_amount', 0)
    .gte('payment_date', startDate)
    .lte('payment_date', endDate)
    .order('payment_date', { ascending: false })

  if (searchParams.staffId) {
    tipsQuery = tipsQuery.eq('staff_id', searchParams.staffId)
  }

  const { data: tipsData } = await tipsQuery

  // Get all staff members
  const { data: _staffMembers } = await supabase
    .from('profiles')
    .select('id, full_name')
    .eq('role', 'staff')
    .eq('salon_id', salonData.id)

  // Process tips data
  interface StaffTips {
    id: string
    name: string
    totalTips: number
    totalServices: number
    transactionCount: number
    averageTip: number
    tipPercentage: number
    topTippers: Array<{ name: string; amount: number }>
  }
  const staffTipsMap: Record<string, StaffTips> = {}
  let totalTips = 0
  let totalServices = 0
  const dailyTips: Record<string, number> = {}
  const tipsByMethod: Record<string, number> = {}

  tipsData?.forEach(record => {
    const staffId = record.staff_id
    const staffName = record.staff?.full_name || 'Unknown'
    
    // Staff aggregation
    if (!staffTipsMap[staffId]) {
      staffTipsMap[staffId] = {
        id: staffId,
        name: staffName,
        totalTips: 0,
        totalServices: 0,
        transactionCount: 0,
        averageTip: 0,
        tipPercentage: 0,
        topTippers: [],
      }
    }
    
    staffTipsMap[staffId].totalTips += record.tip_amount
    staffTipsMap[staffId].totalServices += record.service_amount
    staffTipsMap[staffId].transactionCount += 1
    
    // Track top tippers
    if (record.customer?.full_name) {
      staffTipsMap[staffId].topTippers.push({
        name: record.customer.full_name,
        amount: record.tip_amount,
      })
    }
    
    // Overall totals
    totalTips += record.tip_amount
    totalServices += record.service_amount
    
    // Daily aggregation
    const dateKey = record.payment_date.split('T')[0]
    dailyTips[dateKey] = (dailyTips[dateKey] || 0) + record.tip_amount
    
    // Payment method aggregation
    const method = record.payment_method
    tipsByMethod[method] = (tipsByMethod[method] || 0) + record.tip_amount
  })

  // Calculate averages and percentages
  Object.values(staffTipsMap).forEach((staff) => {
    staff.averageTip = staff.transactionCount > 0 ? staff.totalTips / staff.transactionCount : 0
    staff.tipPercentage = staff.totalServices > 0 ? (staff.totalTips / staff.totalServices) * 100 : 0
    // Sort and keep only top 3 tippers
    staff.topTippers = staff.topTippers
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 3)
  })

  // Sort staff by total tips
  const staffRanking = Object.values(staffTipsMap).sort((a, b) => b.totalTips - a.totalTips)

  // Prepare chart data
  const dailyChartData = Object.entries(dailyTips)
    .map(([date, amount]) => ({
      date: format(parseISO(date), 'MMM d'),
      amount,
    }))
    .sort((a, b) => a.date.localeCompare(b.date))

  const methodChartData = Object.entries(tipsByMethod).map(([method, amount]) => ({
    name: method.charAt(0).toUpperCase() + method.slice(1).replace('_', ' '),
    value: amount,
  }))

  const averageTipPercentage = totalServices > 0 ? (totalTips / totalServices) * 100 : 0

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tips Report</h1>
          <p className="text-muted-foreground">
            Staff tips analysis for {salonData.name}
          </p>
        </div>
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalTips.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {tipsData?.length || 0} tipped transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Tip %</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageTipPercentage.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Of service amount</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Top Performer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {staffRanking[0]?.name || 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              ${staffRanking[0]?.totalTips?.toFixed(2) || '0.00'} in tips
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Daily Average</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(totalTips / Object.keys(dailyTips).length || 1).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Per day</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="staff" className="space-y-4">
        <TabsList>
          <TabsTrigger value="staff">Staff Rankings</TabsTrigger>
          <TabsTrigger value="trends">Tip Trends</TabsTrigger>
          <TabsTrigger value="distribution">Distribution</TabsTrigger>
        </TabsList>

        <TabsContent value="staff" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Staff Tips Performance</CardTitle>
              <CardDescription>
                Ranking of staff members by tips received
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rank</TableHead>
                    <TableHead>Staff Member</TableHead>
                    <TableHead className="text-right">Total Tips</TableHead>
                    <TableHead className="text-right">Avg Tip</TableHead>
                    <TableHead className="text-right">Tip %</TableHead>
                    <TableHead className="text-right">Transactions</TableHead>
                    <TableHead>Top Tippers</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {staffRanking.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <p className="text-muted-foreground">No tips data available</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    staffRanking.map((staff, index) => (
                      <TableRow key={staff.id}>
                        <TableCell>
                          {index === 0 && <Award className="h-5 w-5 text-yellow-500 inline mr-1" />}
                          {index + 1}
                        </TableCell>
                        <TableCell className="font-medium">{staff.name}</TableCell>
                        <TableCell className="text-right font-semibold">
                          ${staff.totalTips.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">
                          ${staff.averageTip.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant="secondary">
                            {staff.tipPercentage.toFixed(1)}%
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">{staff.transactionCount}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {staff.topTippers.slice(0, 2).map((tipper, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                ${tipper.amount.toFixed(0)}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              {staffRanking.length > 0 && (
                <div className="mt-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={staffRanking.slice(0, 5)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => `$${Number(value).toFixed(2)}`} />
                      <Bar dataKey="totalTips" fill="#8b5cf6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Daily Tips Trend</CardTitle>
              <CardDescription>
                Tips received over the selected period
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
        </TabsContent>

        <TabsContent value="distribution" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Tips by Payment Method</CardTitle>
                <CardDescription>
                  Distribution of tips across payment methods
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={methodChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: $${entry.value.toFixed(0)}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {methodChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `$${Number(value).toFixed(2)}`} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tip Percentage Distribution</CardTitle>
                <CardDescription>
                  How tip percentages vary across staff
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={staffRanking.slice(0, 5)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => `${Number(value).toFixed(1)}%`} />
                    <Bar dataKey="tipPercentage" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
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

export default function TipsReportPage({ searchParams }: PageProps) {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <TipsReportContent searchParams={searchParams} />
    </Suspense>
  )
}