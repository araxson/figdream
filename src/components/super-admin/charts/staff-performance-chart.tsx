'use client'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LineChart, Line, BarChart, Bar, RadialBarChart, RadialBar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { fetchStaffPerformanceData } from '@/app/_actions/staff'
import { DollarSign, Clock, Users, Star, Award, Loader2 } from 'lucide-react'
interface PerformanceChartProps {
  staffId: string
}
export function PerformanceChart({ staffId }: PerformanceChartProps) {
  const [performanceData, setPerformanceData] = useState<{
    daily: Array<{ date: string; appointments: number; revenue: number; utilization: number }>
    revenue: { base: number; commission: number; tips: number }
    services: Array<{ name: string; count: number; revenue: number }>
    ratings: { average: number; count: number; distribution: Record<string, number> }
  }>({
    daily: [],
    revenue: { base: 0, commission: 0, tips: 0 },
    services: [],
    ratings: { average: 0, count: 0, distribution: {} }
  })
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    async function loadPerformanceData() {
      try {
        const { metrics, revenue, services } = await fetchStaffPerformanceData(staffId)
        // Transform data for charts
        const dailyData = metrics?.daily?.map(d => ({
          date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          appointments: d.appointments_count || 0,
          revenue: d.total_revenue || 0,
          utilization: d.utilization_percentage || 0
        })) || []
        const revenueData = {
          base: revenue?.total_base || 0,
          commission: revenue?.total_commission || 0,
          tips: revenue?.total_tips || 0
        }
        const serviceData = services?.map(s => ({
          name: s.service_name || 'Unknown',
          count: s.appointment_count || 0,
          revenue: s.total_revenue || 0
        })) || []
        setPerformanceData({
          daily: dailyData,
          revenue: revenueData,
          services: serviceData,
          ratings: metrics?.ratings || { average: 0, count: 0, distribution: {} }
        })
      } catch (_error) {
      } finally {
        setLoading(false)
      }
    }
    loadPerformanceData()
  }, [staffId])
  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-96">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto" />
            <p className="mt-4 text-sm text-muted-foreground">Loading performance data...</p>
          </div>
        </CardContent>
      </Card>
    )
  }
  const revenueChartData = [
    { name: 'Base', value: performanceData.revenue.base, color: '#3b82f6' },
    { name: 'Commission', value: performanceData.revenue.commission, color: '#10b981' },
    { name: 'Tips', value: performanceData.revenue.tips, color: '#f59e0b' }
  ]
  const utilizationData = performanceData.daily.map(d => ({
    date: d.date,
    utilization: d.utilization
  }))
  const RADIAN = Math.PI / 180
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: {
    cx: number
    cy: number
    midAngle: number
    innerRadius: number
    outerRadius: number
    percent: number
  }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)
    return (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Analytics</CardTitle>
        <CardDescription>
          Your performance metrics and insights
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="ratings">Ratings</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Utilization</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {performanceData.daily.length > 0
                      ? Math.round(performanceData.daily.reduce((acc, d) => acc + d.utilization, 0) / performanceData.daily.length)
                      : 0}%
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {performanceData.daily.reduce((acc, d) => acc + d.appointments, 0)}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${(performanceData.revenue.base + performanceData.revenue.commission + performanceData.revenue.tips).toFixed(2)}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {performanceData.ratings.average.toFixed(1)} ⭐
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceData.daily}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="appointments" stroke="#3b82f6" name="Appointments" />
                  <Line yAxisId="right" type="monotone" dataKey="utilization" stroke="#10b981" name="Utilization %" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          <TabsContent value="revenue" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Revenue Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={revenueChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={renderCustomizedLabel}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {revenueChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Daily Revenue Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={performanceData.daily}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                      <Bar dataKey="revenue" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="services" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Service Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={performanceData.services} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={100} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#3b82f6" name="Appointments" />
                    <Bar dataKey="revenue" fill="#10b981" name="Revenue ($)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="ratings" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <CardTitle>Rating Summary</CardTitle>
                  <Award className="h-5 w-5 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Average Rating</span>
                      <span className="text-2xl font-bold">{performanceData.ratings.average.toFixed(1)} ⭐</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Total Reviews</span>
                      <span className="text-lg font-semibold">{performanceData.ratings.count}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Utilization Gauge</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <RadialBarChart 
                      cx="50%" 
                      cy="50%" 
                      innerRadius="60%" 
                      outerRadius="90%" 
                      data={utilizationData.slice(-1)}
                    >
                      <RadialBar
                        dataKey="utilization"
                        cornerRadius={10}
                        fill="#3b82f6"
                        label={{ position: 'center', fill: '#000' }}
                      />
                      <Tooltip />
                    </RadialBarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}