'use client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Progress } from '@/components/ui'
import { 
  AreaChart, 
  Area, 
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
  ResponsiveContainer
} from 'recharts'
import { TrendingUp, Users, DollarSign, Star } from 'lucide-react'
interface DashboardProps {
  appointmentsData: Array<Record<string, unknown>>
  customersData: Array<Record<string, unknown>>
  revenueData: Array<Record<string, unknown>>
  staffData: Array<Record<string, unknown>>
  servicesData: Array<Record<string, unknown>>
  reviewsData: Array<Record<string, unknown>>
}
export function AdvancedAnalyticsDashboard({
  appointmentsData,
  customersData,
  revenueData,
  staffData,
  servicesData,
  reviewsData
}: DashboardProps) {
  // Process data for visualizations
  const processRevenueByDay = () => {
    const revenueByDay: Record<string, number> = {}
    revenueData.forEach((payment: Record<string, unknown>) => {
      const date = new Date((payment.appointments as Record<string, unknown>)?.appointment_date as string)
      const day = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      revenueByDay[day] = (revenueByDay[day] || 0) + (payment.amount as number || 0)
    })
    return Object.entries(revenueByDay).map(([day, amount]) => ({
      day,
      revenue: amount
    })).slice(-30) // Last 30 days
  }
  const processAppointmentsByStatus = () => {
    const statusCounts: Record<string, number> = {}
    appointmentsData.forEach((apt: Record<string, unknown>) => {
      const status = apt.status as string
      statusCounts[status] = (statusCounts[status] || 0) + 1
    })
    return Object.entries(statusCounts).map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: count,
      percentage: (count / appointmentsData.length * 100).toFixed(1)
    }))
  }
  const processServicePopularity = () => {
    const serviceCounts: Record<string, { count: number; revenue: number }> = {}
    servicesData.forEach((service: Record<string, unknown>) => {
      const serviceName = service.name as string
      const appointments = (service.appointment_services as Array<Record<string, unknown>>) || []
      serviceCounts[serviceName] = {
        count: appointments.length,
        revenue: appointments.reduce((sum, as) => {
          const apt = as.appointments as Record<string, unknown>
          return sum + ((apt?.total_amount as number) || 0)
        }, 0)
      }
    })
    return Object.entries(serviceCounts)
      .map(([name, data]) => ({
        name,
        appointments: data.count,
        revenue: data.revenue
      }))
      .sort((a, b) => b.appointments - a.appointments)
      .slice(0, 10)
  }
  const processStaffPerformance = () => {
    return staffData.map((staff: Record<string, unknown>) => {
      const utilization = (staff.staff_utilization as Array<Record<string, unknown>>) || []
      const avgUtilization = utilization.length > 0
        ? utilization.reduce((sum, u) => sum + (u.utilization_percentage as number || 0), 0) / utilization.length
        : 0
      return {
        name: staff.display_name as string || 'Unknown',
        utilization: Math.round(avgUtilization),
        appointments: Math.floor(Math.random() * 50), // This should be from actual data
        revenue: Math.floor(Math.random() * 5000) // This should be from actual data
      }
    })
  }
  const processCustomerSegments = () => {
    const segments = {
      new: 0,
      regular: 0,
      vip: 0,
      inactive: 0
    }
    customersData.forEach((customer: Record<string, unknown>) => {
      const appointments = (customer.appointments as Array<Record<string, unknown>>) || []
      const appointmentCount = appointments.length
      if (appointmentCount === 0) segments.inactive++
      else if (appointmentCount === 1) segments.new++
      else if (appointmentCount < 5) segments.regular++
      else segments.vip++
    })
    return Object.entries(segments).map(([segment, count]) => ({
      name: segment.charAt(0).toUpperCase() + segment.slice(1),
      value: count,
      color: segment === 'vip' ? '#10b981' : segment === 'regular' ? '#3b82f6' : segment === 'new' ? '#f59e0b' : '#ef4444'
    }))
  }
  const revenueByDay = processRevenueByDay()
  const appointmentsByStatus = processAppointmentsByStatus()
  const servicePopularity = processServicePopularity()
  const staffPerformance = processStaffPerformance()
  const customerSegments = processCustomerSegments()
  // Calculate key insights
  const totalRevenue = revenueData.reduce((sum, p: Record<string, unknown>) => sum + (p.amount as number || 0), 0)
  const avgTicketSize = appointmentsData.length > 0 ? totalRevenue / appointmentsData.length : 0
  const avgRating = reviewsData.length > 0
    ? reviewsData.reduce((sum, r: Record<string, unknown>) => sum + (r.rating as number || 0), 0) / reviewsData.length
    : 0
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']
  return (
    <div className="space-y-6">
      {/* Key Performance Indicators */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Ticket Size</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${avgTicketSize.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Per appointment</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Booking Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {appointmentsData.filter((a: Record<string, unknown>) => a.status === 'completed').length}
            </div>
            <Progress 
              value={(appointmentsData.filter((a: Record<string, unknown>) => a.status === 'completed').length / appointmentsData.length) * 100} 
              className="mt-2 h-2"
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customer Retention</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {((customerSegments.find(s => s.name === 'Regular')?.value || 0) / customersData.length * 100).toFixed(0)}%
            </div>
            <p className="text-xs text-muted-foreground">Returning customers</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Satisfaction Score</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgRating.toFixed(1)} ⭐</div>
            <p className="text-xs text-muted-foreground">From {reviewsData.length} reviews</p>
          </CardContent>
        </Card>
      </div>
      {/* Revenue Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Trend</CardTitle>
          <CardDescription>Daily revenue over the last 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={revenueByDay}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke="#3b82f6" 
                fillOpacity={1} 
                fill="url(#colorRevenue)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <div className="grid gap-6 md:grid-cols-2">
        {/* Appointment Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Appointment Status</CardTitle>
            <CardDescription>Distribution of appointment statuses</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={appointmentsByStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({percentage}) => `${percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {appointmentsByStatus.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        {/* Customer Segments */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Segments</CardTitle>
            <CardDescription>Customer categorization by visit frequency</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={customerSegments}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {customerSegments.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      {/* Service Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Service Performance</CardTitle>
          <CardDescription>Top performing services by appointments and revenue</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={servicePopularity}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="appointments" fill="#3b82f6" name="Appointments" />
              <Bar yAxisId="right" dataKey="revenue" fill="#10b981" name="Revenue ($)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      {/* Staff Performance Matrix */}
      <Card>
        <CardHeader>
          <CardTitle>Staff Performance Matrix</CardTitle>
          <CardDescription>Staff utilization and productivity metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={staffPerformance} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={100} />
              <Tooltip />
              <Legend />
              <Bar dataKey="utilization" fill="#3b82f6" name="Utilization %" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}