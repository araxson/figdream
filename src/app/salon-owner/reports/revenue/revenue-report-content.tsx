'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { format, parseISO } from 'date-fns'
import {
  Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { Download, ArrowUp, ArrowDown } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface RevenueAnalytics {
  totalRevenue: number
  totalTransactions: number
  averageTransaction: number
  totalTips: number
  previousPeriodTotal: number
  revenueByPeriod: Record<string, {
    revenue: number
    transactions: number
    tips?: number
    services?: number
    taxes?: number
    discounts?: number
  }>
  paymentMethodBreakdown?: Record<string, number>
  revenueByMethod?: Record<string, number>
  revenueByStaff?: Array<{
    staff_id: string
    staff_name: string
    total: number
  }>
}

interface RevenueReportContentProps {
  salonName: string
  analytics: RevenueAnalytics
  topPerformers: Array<{
    id: string
    staff_name: string
    total_services: number
    total_tips: number
    total: number
    transaction_count: number
  }>
  startDate: string
  endDate: string
  groupBy: 'day' | 'week' | 'month'
}

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#6366f1']

export function RevenueReportContent({
  salonName,
  analytics,
  topPerformers,
  startDate,
  endDate,
  groupBy,
}: RevenueReportContentProps) {
  const router = useRouter()
  const [dateRange, setDateRange] = useState({ start: startDate, end: endDate })
  const [selectedGroupBy, setSelectedGroupBy] = useState(groupBy)

  // Calculate comparison with previous period
  const currentTotal = analytics?.totalRevenue || 0
  const previousPeriodTotal = analytics?.previousPeriodTotal || 0
  const revenueChange = previousPeriodTotal > 0 
    ? ((currentTotal - previousPeriodTotal) / previousPeriodTotal) * 100 
    : 0

  // Process chart data
  const chartData = analytics?.revenueByPeriod
    ? Object.entries(analytics.revenueByPeriod).map(([date, data]) => ({
        date: format(parseISO(date), groupBy === 'month' ? 'MMM yyyy' : 'MMM d'),
        revenue: data.revenue,
        transactions: data.transactions,
        average: data.revenue / (data.transactions || 1),
      }))
    : []

  // Payment method pie chart data
  const paymentMethodData = analytics?.paymentMethodBreakdown
    ? Object.entries(analytics.paymentMethodBreakdown).map(([method, amount]) => ({
        name: method.charAt(0).toUpperCase() + method.slice(1).replace('_', ' '),
        value: amount as number,
      }))
    : []

  const applyDateFilter = () => {
    const params = new URLSearchParams()
    params.set('startDate', dateRange.start)
    params.set('endDate', dateRange.end)
    params.set('groupBy', selectedGroupBy)
    router.push(`/salon-owner/reports/revenue?${params.toString()}`)
  }

  const exportReport = () => {
    // Create CSV content for revenue report
    const headers = ['Date', 'Revenue', 'Transactions', 'Average Transaction']
    const rows = chartData.map(item => [
      item.date,
      item.revenue.toFixed(2),
      item.transactions,
      item.average.toFixed(2),
    ])
    
    const csvContent = [
      `Revenue Report - ${salonName}`,
      `Period: ${format(parseISO(startDate), 'MMM d, yyyy')} to ${format(parseISO(endDate), 'MMM d, yyyy')}`,
      '',
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n')
    
    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `revenue-report-${format(new Date(), 'yyyy-MM-dd')}.csv`
    a.click()
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Revenue Report</h1>
          <p className="text-muted-foreground">
            Financial analytics for {salonName}
          </p>
        </div>
        <Button onClick={exportReport}>
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* Date Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Report Period</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[150px]">
              <Label>Start Date</Label>
              <Input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              />
            </div>
            <div className="flex-1 min-w-[150px]">
              <Label>End Date</Label>
              <Input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              />
            </div>
            <div className="flex-1 min-w-[150px]">
              <Label>Group By</Label>
              <Select value={selectedGroupBy} onValueChange={(v) => setSelectedGroupBy(v as 'day' | 'week' | 'month')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Day</SelectItem>
                  <SelectItem value="week">Week</SelectItem>
                  <SelectItem value="month">Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={applyDateFilter}>Apply</Button>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              Total Revenue
              {revenueChange > 0 ? (
                <ArrowUp className="h-4 w-4 text-green-600" />
              ) : (
                <ArrowDown className="h-4 w-4 text-red-600" />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${currentTotal.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {revenueChange > 0 ? '+' : ''}{revenueChange.toFixed(1)}% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${analytics?.totalTips?.toFixed(2) || '0.00'}</div>
            <p className="text-xs text-muted-foreground">
              {analytics?.totalRevenue > 0
                ? `${((analytics.totalTips / analytics.totalRevenue) * 100).toFixed(1)}% of revenue`
                : 'N/A'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.transactionCount || 0}</div>
            <p className="text-xs text-muted-foreground">
              Avg: ${analytics?.averageTransaction?.toFixed(2) || '0.00'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Discounts Given</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${analytics?.totalDiscounts?.toFixed(2) || '0.00'}</div>
            <p className="text-xs text-muted-foreground">
              Applied to transactions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="revenue">Revenue Trend</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="payment-methods">Payment Methods</TabsTrigger>
          <TabsTrigger value="staff-performance">Staff Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Over Time</CardTitle>
              <CardDescription>
                Daily revenue trends for the selected period
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${Number(value).toFixed(2)}`} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#8b5cf6"
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Transaction Volume</CardTitle>
              <CardDescription>
                Number of transactions and average transaction value
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="transactions" fill="#3b82f6" name="Transactions" />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="average"
                    stroke="#f59e0b"
                    name="Avg Transaction"
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment-methods" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment Method Distribution</CardTitle>
              <CardDescription>
                Revenue breakdown by payment method
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={paymentMethodData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: $${entry.value.toFixed(0)}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {paymentMethodData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `$${Number(value).toFixed(2)}`} />
                  </PieChart>
                </ResponsiveContainer>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Payment Method Breakdown</h4>
                  {paymentMethodData.map((method, index) => (
                    <div key={method.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="text-sm">{method.name}</span>
                      </div>
                      <span className="font-medium">${method.value.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="staff-performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Staff</CardTitle>
              <CardDescription>
                Staff members with highest revenue generation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Staff Member</TableHead>
                    <TableHead className="text-right">Services</TableHead>
                    <TableHead className="text-right">Tips</TableHead>
                    <TableHead className="text-right">Total Revenue</TableHead>
                    <TableHead className="text-right">Transactions</TableHead>
                    <TableHead className="text-right">Avg Transaction</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topPerformers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <p className="text-muted-foreground">No data available for this period</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    topPerformers.map((performer) => (
                      <TableRow key={performer.id}>
                        <TableCell className="font-medium">{performer.staff_name}</TableCell>
                        <TableCell className="text-right">
                          ${performer.total_services.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">
                          ${performer.total_tips.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          ${performer.total.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">{performer.transaction_count}</TableCell>
                        <TableCell className="text-right">
                          ${(performer.total / performer.transaction_count).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Staff Performance Chart */}
          {topPerformers.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Staff Revenue Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={topPerformers}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="staff_name" />
                    <YAxis />
                    <Tooltip formatter={(value) => `$${Number(value).toFixed(2)}`} />
                    <Legend />
                    <Bar dataKey="total_services" stackId="a" fill="#8b5cf6" name="Services" />
                    <Bar dataKey="total_tips" stackId="a" fill="#3b82f6" name="Tips" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => router.push('/salon-owner/payments/record')}>
            Record New Payment
          </Button>
          <Button variant="outline" onClick={() => router.push('/salon-owner/payments/history')}>
            View Payment History
          </Button>
          <Button variant="outline" onClick={() => router.push('/salon-owner/reports/tips')}>
            View Tips Report
          </Button>
          <Button variant="outline" onClick={() => router.push('/salon-owner/staff/performance')}>
            Staff Performance
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}