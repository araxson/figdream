'use client'
import { Badge } from "@/components/ui/feedback/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/data-display/card"
import { Calendar } from "lucide-react"
import { 
  Line, 
  AreaChart,
  Area,
  BarChart,
  Bar,
  ComposedChart,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ReferenceLine,
  Brush
} from 'recharts'
import { DollarSign, TrendingUp, TrendingDown, Target } from 'lucide-react'
interface RevenueAnalyticsProps {
  revenueData: Array<Record<string, unknown>>
  appointmentsData: Array<Record<string, unknown>>
}
export function RevenueAnalytics({ revenueData, appointmentsData }: RevenueAnalyticsProps) {
  // Process revenue data by various dimensions
  const processMonthlyRevenue = () => {
    const monthlyData: Record<string, { revenue: number; appointments: number; avgTicket: number }> = {}
    revenueData.forEach((payment: Record<string, unknown>) => {
      const date = new Date((payment.appointments as Record<string, unknown>)?.appointment_date as string)
      const monthKey = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { revenue: 0, appointments: 0, avgTicket: 0 }
      }
      monthlyData[monthKey].revenue += payment.amount as number || 0
      monthlyData[monthKey].appointments++
    })
    return Object.entries(monthlyData).map(([month, data]) => ({
      month,
      revenue: data.revenue,
      appointments: data.appointments,
      avgTicket: data.appointments > 0 ? data.revenue / data.appointments : 0
    })).slice(-12) // Last 12 months
  }
  const processWeeklyRevenue = () => {
    const weeklyData: Record<string, number> = {}
    const today = new Date()
    for (let i = 11; i >= 0; i--) {
      const weekStart = new Date(today)
      weekStart.setDate(today.getDate() - (i * 7))
      const weekKey = `Week ${12 - i}`
      weeklyData[weekKey] = 0
    }
    revenueData.forEach((payment: Record<string, unknown>) => {
      const paymentDate = new Date((payment.appointments as Record<string, unknown>)?.appointment_date as string)
      const weeksDiff = Math.floor((today.getTime() - paymentDate.getTime()) / (7 * 24 * 60 * 60 * 1000))
      if (weeksDiff >= 0 && weeksDiff < 12) {
        const weekKey = `Week ${12 - weeksDiff}`
        if (weeklyData[weekKey] !== undefined) {
          weeklyData[weekKey] += payment.amount as number || 0
        }
      }
    })
    return Object.entries(weeklyData).map(([week, revenue]) => ({
      week,
      revenue,
      target: 5000 // Example target
    }))
  }
  const processRevenueByService = () => {
    const serviceRevenue: Record<string, number> = {}
    // This would need actual service data joined with payments
    // For now, using sample data structure
    appointmentsData.forEach((apt: Record<string, unknown>) => {
      if (apt.status === 'completed') {
        const services = (apt.appointment_services as Array<Record<string, unknown>>) || []
        services.forEach(service => {
          const serviceName = (service.services as Record<string, unknown>)?.name as string || 'Unknown'
          serviceRevenue[serviceName] = (serviceRevenue[serviceName] || 0) + ((apt.total_amount as number || 0) / services.length)
        })
      }
    })
    return Object.entries(serviceRevenue)
      .map(([service, revenue]) => ({
        service,
        revenue
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)
  }
  const processPaymentMethods = () => {
    const methods: Record<string, number> = {
      'Credit Card': 0,
      'Cash': 0,
      'Debit Card': 0,
      'Gift Card': 0,
      'Other': 0
    }
    revenueData.forEach((payment: Record<string, unknown>) => {
      const method = payment.payment_method as string || 'Other'
      const methodKey = methods[method] !== undefined ? method : 'Other'
      methods[methodKey] += payment.amount as number || 0
    })
    return Object.entries(methods).map(([method, amount]) => ({
      method,
      amount,
      percentage: (amount / revenueData.reduce((sum, p: Record<string, unknown>) => sum + (p.amount as number || 0), 0) * 100).toFixed(1)
    }))
  }
  const monthlyRevenue = processMonthlyRevenue()
  const weeklyRevenue = processWeeklyRevenue()
  const serviceRevenue = processRevenueByService()
  const paymentMethods = processPaymentMethods()
  // Calculate key metrics
  const totalRevenue = revenueData.reduce((sum, p: Record<string, unknown>) => sum + (p.amount as number || 0), 0)
  const avgMonthlyRevenue = monthlyRevenue.length > 0 
    ? monthlyRevenue.reduce((sum, m) => sum + m.revenue, 0) / monthlyRevenue.length 
    : 0
  const monthOverMonthGrowth = monthlyRevenue.length >= 2
    ? ((monthlyRevenue[monthlyRevenue.length - 1].revenue - monthlyRevenue[monthlyRevenue.length - 2].revenue) / monthlyRevenue[monthlyRevenue.length - 2].revenue * 100)
    : 0
  return (
    <div className="space-y-6">
      {/* Revenue KPIs */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Avg Monthly</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${avgMonthlyRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Per month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>MoM Growth</CardTitle>
            {monthOverMonthGrowth > 0 ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {monthOverMonthGrowth > 0 ? '+' : ''}{monthOverMonthGrowth.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">Month over month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Target Progress</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">78%</div>
            <p className="text-xs text-muted-foreground">Of monthly goal</p>
          </CardContent>
        </Card>
      </div>
      {/* Monthly Revenue Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Revenue & Average Ticket</CardTitle>
          <CardDescription>Revenue performance and average transaction value</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
              <Legend />
              <Bar yAxisId="left" dataKey="revenue" fill="#3b82f6" name="Revenue" />
              <Line yAxisId="right" type="monotone" dataKey="avgTicket" stroke="#10b981" name="Avg Ticket" strokeWidth={2} />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      {/* Weekly Revenue vs Target */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Revenue vs Target</CardTitle>
          <CardDescription>Track weekly performance against goals</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={weeklyRevenue}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
              <Legend />
              <ReferenceLine y={5000} stroke="#ef4444" strokeDasharray="3 3" label="Target" />
              <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
              <Brush dataKey="week" height={30} stroke="#3b82f6" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <div className="grid gap-6 md:grid-cols-2">
        {/* Revenue by Service */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Service</CardTitle>
            <CardDescription>Top revenue-generating services</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {serviceRevenue.map((service, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{service.service}</span>
                    <Badge variant="outline">
                      #{index + 1}
                    </Badge>
                  </div>
                  <span className="text-sm font-bold">${service.revenue.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        {/* Payment Methods */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Method Distribution</CardTitle>
            <CardDescription>Revenue breakdown by payment type</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={paymentMethods} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="method" type="category" width={80} />
                <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                <Bar dataKey="amount" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}