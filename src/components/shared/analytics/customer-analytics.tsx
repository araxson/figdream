'use client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'
import { 
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ScatterChart,
  Scatter
} from 'recharts'
import { Users, UserPlus, TrendingUp, Star } from 'lucide-react'
interface CustomerAnalyticsProps {
  customersData: Array<Record<string, unknown>>
  appointmentsData: Array<Record<string, unknown>>
  reviewsData: Array<Record<string, unknown>>
}
export function CustomerAnalytics({ customersData, appointmentsData: _appointmentsData, reviewsData }: CustomerAnalyticsProps) {
  // Process customer segments
  const processCustomerSegments = () => {
    const segments = {
      vip: 0,
      regular: 0,
      occasional: 0,
      new: 0,
      inactive: 0
    }
    customersData.forEach((customer: Record<string, unknown>) => {
      const customerAppointments = (customer.appointments as Array<Record<string, unknown>>) || []
      const appointmentCount = customerAppointments.length
      const totalSpent = customerAppointments.reduce((sum, apt) => sum + (apt.total_amount as number || 0), 0)
      if (appointmentCount === 0) segments.inactive++
      else if (appointmentCount === 1) segments.new++
      else if (appointmentCount < 5) segments.occasional++
      else if (totalSpent > 1000) segments.vip++
      else segments.regular++
    })
    return Object.entries(segments).map(([segment, count]) => ({
      name: segment.charAt(0).toUpperCase() + segment.slice(1),
      value: count,
      percentage: ((count / customersData.length) * 100).toFixed(1)
    }))
  }
  // Process retention data
  const processRetentionData = () => {
    const monthlyRetention: Record<string, { new: number; returning: number }> = {}
    customersData.forEach((customer: Record<string, unknown>) => {
      const appointments = (customer.appointments as Array<Record<string, unknown>>) || []
      if (appointments.length > 0) {
        const firstAppointment = new Date(appointments[0].appointment_date as string)
        const monthKey = firstAppointment.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
        if (!monthlyRetention[monthKey]) {
          monthlyRetention[monthKey] = { new: 0, returning: 0 }
        }
        if (appointments.length === 1) {
          monthlyRetention[monthKey].new++
        } else {
          monthlyRetention[monthKey].returning++
        }
      }
    })
    return Object.entries(monthlyRetention)
      .map(([month, data]) => ({
        month,
        new: data.new,
        returning: data.returning,
        retentionRate: data.new > 0 ? ((data.returning / (data.new + data.returning)) * 100).toFixed(1) : 0
      }))
      .slice(-12)
  }
  // Process customer lifetime value
  const processLifetimeValue = () => {
    return customersData.map((customer: Record<string, unknown>) => {
      const appointments = (customer.appointments as Array<Record<string, unknown>>) || []
      const totalSpent = appointments.reduce((sum, apt) => sum + (apt.total_amount as number || 0), 0)
      const appointmentCount = appointments.length
      return {
        appointments: appointmentCount,
        totalSpent,
        avgSpent: appointmentCount > 0 ? totalSpent / appointmentCount : 0
      }
    }).filter(c => c.appointments > 0)
  }
  // Process satisfaction scores
  const processSatisfactionScores = () => {
    const ratingDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    reviewsData.forEach((review: Record<string, unknown>) => {
      const rating = review.rating as number
      if (rating >= 1 && rating <= 5) {
        ratingDistribution[rating]++
      }
    })
    return Object.entries(ratingDistribution).map(([rating, count]) => ({
      rating: `${rating} Star`,
      count,
      percentage: reviewsData.length > 0 ? ((count / reviewsData.length) * 100).toFixed(1) : 0
    }))
  }
  const segments = processCustomerSegments()
  const retentionData = processRetentionData()
  const lifetimeValues = processLifetimeValue()
  const satisfactionScores = processSatisfactionScores()
  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#6b7280']
  // Calculate metrics
  const avgLifetimeValue = lifetimeValues.length > 0
    ? lifetimeValues.reduce((sum, c) => sum + c.totalSpent, 0) / lifetimeValues.length
    : 0
  const avgRetentionRate = retentionData.length > 0
    ? retentionData.reduce((sum, r) => sum + parseFloat(r.retentionRate as string), 0) / retentionData.length
    : 0
  const avgRating = reviewsData.length > 0
    ? reviewsData.reduce((sum, r: Record<string, unknown>) => sum + (r.rating as number || 0), 0) / reviewsData.length
    : 0
  return (
    <div className="space-y-6">
      {/* Customer KPIs */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customersData.length}</div>
            <p className="text-xs text-muted-foreground">Active in system</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Avg Lifetime Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${avgLifetimeValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Per customer</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Retention Rate</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgRetentionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Return customers</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Satisfaction</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgRating.toFixed(1)} ⭐</div>
            <p className="text-xs text-muted-foreground">{reviewsData.length} reviews</p>
          </CardContent>
        </Card>
      </div>
      {/* Customer Segments */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Segmentation</CardTitle>
          <CardDescription>Breakdown by engagement level</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={segments}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                fill="#8884d8"
                paddingAngle={2}
                dataKey="value"
              >
                {segments.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number, name: string) => [`${value} (${segments.find(s => s.name === name)?.percentage}%)`, name]} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      {/* Retention Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Retention Trend</CardTitle>
          <CardDescription>New vs returning customers by month</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={retentionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="new" stackId="a" fill="#f59e0b" name="New Customers" />
              <Bar dataKey="returning" stackId="a" fill="#10b981" name="Returning Customers" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <div className="grid gap-6 md:grid-cols-2">
        {/* Lifetime Value Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Lifetime Value Distribution</CardTitle>
            <CardDescription>Customer value vs visit frequency</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="appointments" name="Visits" />
                <YAxis dataKey="totalSpent" name="Total Spent" />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Scatter name="Customers" data={lifetimeValues.slice(0, 100)} fill="#3b82f6" />
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        {/* Satisfaction Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Satisfaction</CardTitle>
            <CardDescription>Rating distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={satisfactionScores}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="rating" />
                <YAxis />
                <Tooltip formatter={(value: number) => [`${value} reviews`, 'Count']} />
                <Bar dataKey="count" fill="#f59e0b">
                  {satisfactionScores.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={index >= 3 ? '#10b981' : index >= 2 ? '#f59e0b' : '#ef4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}