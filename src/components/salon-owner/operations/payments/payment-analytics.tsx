'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  CreditCard,
  Award,
} from 'lucide-react'


interface PaymentAnalyticsData {
  totalRevenue: number
  totalTips: number
  totalDiscounts: number
  averageTransaction: number
  transactionCount: number
  paymentMethodBreakdown: Record<string, number>
  revenueByPeriod: Record<string, { revenue: number; transactions: number }>
  staffEarnings?: Array<{
    staff_id: string
    staff_name: string
    total_service_amount: number
    total_tips: number
    total_earnings: number
    transaction_count: number
  }>
  topCustomers?: Array<{
    customer_id: string
    customer_name: string
    total_spent: number
    visit_count: number
  }>
}

interface PaymentAnalyticsProps {
  salonId: string
  startDate: string
  endDate: string
  analyticsData?: PaymentAnalyticsData
  isLoading?: boolean
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

export function PaymentAnalytics({
  analyticsData,
  isLoading = false,
}: PaymentAnalyticsProps) {
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('day')

  // Calculate growth percentages (mock data for demo)
  const revenueGrowth = 12.5
  const tipGrowth = 8.3
  const transactionGrowth = 15.2

  // Format revenue by period data for charts
  const revenueChartData = analyticsData?.revenueByPeriod
    ? Object.entries(analyticsData.revenueByPeriod).map(([date, data]) => ({
        date: format(new Date(date), period === 'month' ? 'MMM' : 'MMM d'),
        revenue: data.revenue,
        transactions: data.transactions,
      }))
    : []

  // Format payment method data for pie chart
  const paymentMethodData = analyticsData?.paymentMethodBreakdown
    ? Object.entries(analyticsData.paymentMethodBreakdown).map(([method, amount]) => ({
        name: method.replace('_', ' ').charAt(0).toUpperCase() + method.slice(1),
        value: amount,
      }))
    : []

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
        <Skeleton className="col-span-full h-96" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${analyticsData?.totalRevenue.toFixed(2) || '0.00'}
            </div>
            <p className="text-xs text-muted-foreground">
              {revenueGrowth > 0 ? (
                <span className="flex items-center text-green-600">
                  <TrendingUp className="mr-1 h-3 w-3" />
                  +{revenueGrowth}% from last period
                </span>
              ) : (
                <span className="flex items-center text-red-600">
                  <TrendingDown className="mr-1 h-3 w-3" />
                  {revenueGrowth}% from last period
                </span>
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tips</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${analyticsData?.totalTips.toFixed(2) || '0.00'}
            </div>
            <p className="text-xs text-muted-foreground">
              {tipGrowth > 0 ? (
                <span className="flex items-center text-green-600">
                  <TrendingUp className="mr-1 h-3 w-3" />
                  +{tipGrowth}% from last period
                </span>
              ) : (
                <span className="flex items-center text-red-600">
                  <TrendingDown className="mr-1 h-3 w-3" />
                  {tipGrowth}% from last period
                </span>
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Transaction</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${analyticsData?.averageTransaction.toFixed(2) || '0.00'}
            </div>
            <p className="text-xs text-muted-foreground">
              From {analyticsData?.transactionCount || 0} transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData?.transactionCount || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {transactionGrowth > 0 ? (
                <span className="flex items-center text-green-600">
                  <TrendingUp className="mr-1 h-3 w-3" />
                  +{transactionGrowth}% from last period
                </span>
              ) : (
                <span className="flex items-center text-red-600">
                  <TrendingDown className="mr-1 h-3 w-3" />
                  {transactionGrowth}% from last period
                </span>
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="revenue" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="revenue">Revenue Trend</TabsTrigger>
            <TabsTrigger value="methods">Payment Methods</TabsTrigger>
            <TabsTrigger value="staff">Staff Earnings</TabsTrigger>
            <TabsTrigger value="customers">Top Customers</TabsTrigger>
          </TabsList>
          <Select value={period} onValueChange={(value) => setPeriod(value as 'day' | 'week' | 'month')}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Daily</SelectItem>
              <SelectItem value="week">Weekly</SelectItem>
              <SelectItem value="month">Monthly</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <TabsContent value="revenue">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trend</CardTitle>
              <CardDescription>
                Revenue and transaction trends for the selected period
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={revenueChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="revenue"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    name="Revenue ($)"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="transactions"
                    stroke="#10b981"
                    strokeWidth={2}
                    name="Transactions"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="methods">
          <Card>
            <CardHeader>
              <CardTitle>Payment Method Breakdown</CardTitle>
              <CardDescription>
                Distribution of payments by payment method
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
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
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2">
                  {paymentMethodData.map((method, index) => (
                    <div key={method.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="text-sm font-medium">{method.name}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        ${method.value.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="staff">
          <Card>
            <CardHeader>
              <CardTitle>Staff Earnings Report</CardTitle>
              <CardDescription>
                Service revenue and tips by staff member
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart
                  data={analyticsData?.staffEarnings || []}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="staff_name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="total_service_amount" stackId="a" fill="#3b82f6" name="Services" />
                  <Bar dataKey="total_tips" stackId="a" fill="#10b981" name="Tips" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers">
          <Card>
            <CardHeader>
              <CardTitle>Top Customers</CardTitle>
              <CardDescription>
                Customers with highest spending in the selected period
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData?.topCustomers?.slice(0, 10).map((customer, index) => (
                  <div key={customer.customer_id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">{index + 1}</Badge>
                      <div>
                        <p className="font-medium">{customer.customer_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {customer.visit_count} visits
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${customer.total_spent.toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">
                        Avg: ${(customer.total_spent / customer.visit_count).toFixed(2)}
                      </p>
                    </div>
                  </div>
                )) || (
                  <p className="text-center text-muted-foreground py-4">
                    No customer data available
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}