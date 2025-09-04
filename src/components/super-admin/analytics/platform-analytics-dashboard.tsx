"use client"
import { useState, useEffect } from "react"
import { 
  AreaChart, Area, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Legend
} from 'recharts'
import { 
  Users, Building2, Calendar, DollarSign, Loader2
} from "lucide-react"
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
// ChartConfig type from chart component
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
interface PlatformMetrics {
  totalUsers: number
  totalSalons: number
  totalAppointments: number
  totalRevenue: number
  userGrowthRate: number
  salonGrowthRate: number
  appointmentGrowthRate: number
  revenueGrowthRate: number
}
interface GrowthTrend {
  date: string
  users: number
  salons: number
  appointments: number
  revenue: number
}
interface GeographicDistribution {
  region: string
  users: number
  salons: number
  revenue: number
  percentage: number
}
interface FeatureAdoption {
  feature: string
  adoptionRate: number
  activeUsers: number
  trend: 'up' | 'down' | 'stable'
}

const chartConfig = {
  users: {
    label: 'Users',
    color: 'hsl(var(--chart-1))',
  },
  salons: {
    label: 'Salons',
    color: 'hsl(var(--chart-2))',
  },
  appointments: {
    label: 'Appointments',
    color: 'hsl(var(--chart-3))',
  },
  revenue: {
    label: 'Revenue',
    color: 'hsl(var(--chart-4))',
  },
} satisfies ChartConfig

export function PlatformAnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState("30d")
  const [metrics, setMetrics] = useState<PlatformMetrics | null>(null)
  const [growthTrends, setGrowthTrends] = useState<GrowthTrend[]>([])
  const [geoDistribution, setGeoDistribution] = useState<GeographicDistribution[]>([])
  const [featureAdoption, setFeatureAdoption] = useState<FeatureAdoption[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    fetchAnalytics()
  }, [timeRange])
  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      // Simulated data - replace with actual API calls
      setMetrics({
        totalUsers: 45678,
        totalSalons: 1234,
        totalAppointments: 234567,
        totalRevenue: 1456789,
        userGrowthRate: 12.5,
        salonGrowthRate: 8.3,
        appointmentGrowthRate: 15.7,
        revenueGrowthRate: 18.9
      })
      setGrowthTrends([
        { date: "Jan", users: 35000, salons: 950, appointments: 180000, revenue: 980000 },
        { date: "Feb", users: 37500, salons: 1000, appointments: 195000, revenue: 1050000 },
        { date: "Mar", users: 40000, salons: 1050, appointments: 205000, revenue: 1120000 },
        { date: "Apr", users: 42000, salons: 1100, appointments: 215000, revenue: 1250000 },
        { date: "May", users: 44000, salons: 1180, appointments: 225000, revenue: 1380000 },
        { date: "Jun", users: 45678, salons: 1234, appointments: 234567, revenue: 1456789 }
      ])
      setGeoDistribution([
        { region: "North America", users: 18271, salons: 493, revenue: 582716, percentage: 40 },
        { region: "Europe", users: 13703, salons: 370, revenue: 437037, percentage: 30 },
        { region: "Asia Pacific", users: 9136, salons: 247, revenue: 291358, percentage: 20 },
        { region: "Latin America", users: 3654, salons: 99, revenue: 116543, percentage: 8 },
        { region: "Other", users: 914, salons: 25, revenue: 29135, percentage: 2 }
      ])
      setFeatureAdoption([
        { feature: "Online Booking", adoptionRate: 92, activeUsers: 42023, trend: 'up' },
        { feature: "Loyalty Program", adoptionRate: 67, activeUsers: 30604, trend: 'up' },
        { feature: "SMS Notifications", adoptionRate: 78, activeUsers: 35629, trend: 'stable' },
        { feature: "Staff Management", adoptionRate: 85, activeUsers: 38826, trend: 'up' },
        { feature: "Analytics Dashboard", adoptionRate: 71, activeUsers: 32432, trend: 'up' },
        { feature: "Payment Processing", adoptionRate: 89, activeUsers: 40653, trend: 'stable' }
      ])
    } catch (_error) {
    } finally {
      setLoading(false)
    }
  }
  const regionColors = ['var(--color-users)', 'var(--color-salons)', 'var(--color-appointments)', 'var(--color-revenue)', 'hsl(var(--chart-5))']
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-12 w-12 animate-spin" />
      </div>
    )
  }
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Platform Analytics</h1>
          <p className="text-muted-foreground">Platform-wide metrics and insights</p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="1y">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+{metrics?.userGrowthRate}%</span> from last period
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Salons</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.totalSalons.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+{metrics?.salonGrowthRate}%</span> from last period
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.totalAppointments.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+{metrics?.appointmentGrowthRate}%</span> from last period
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${metrics?.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+{metrics?.revenueGrowthRate}%</span> from last period
            </p>
          </CardContent>
        </Card>
      </div>
      <Tabs defaultValue="growth" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="growth">Growth Trends</TabsTrigger>
          <TabsTrigger value="geographic">Geographic</TabsTrigger>
          <TabsTrigger value="features">Feature Adoption</TabsTrigger>
          <TabsTrigger value="projections">Projections</TabsTrigger>
        </TabsList>
        <TabsContent value="growth" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Growth Trends</CardTitle>
              <CardDescription>Platform growth metrics over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[400px]">
                <LineChart data={growthTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Line type="monotone" dataKey="users" stroke="var(--color-users)" name="Users" />
                  <Line type="monotone" dataKey="salons" stroke="var(--color-salons)" name="Salons" />
                  <Line type="monotone" dataKey="appointments" stroke="var(--color-appointments)" name="Appointments" />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Revenue Growth</CardTitle>
              <CardDescription>Monthly revenue progression</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px]">
                <AreaChart data={growthTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <ChartTooltip 
                    content={<ChartTooltipContent formatter={(value: number) => `$${value.toLocaleString()}`} />}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="var(--color-revenue)" fill="var(--color-revenue)" fillOpacity={0.6} />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="geographic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Geographic Distribution</CardTitle>
              <CardDescription>User and salon distribution by region</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <PieChart>
                    <Pie
                      data={geoDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.region}: ${entry.percentage}%`}
                      outerRadius={80}
                      fill="var(--color-users)"
                      dataKey="percentage"
                    >
                      {geoDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={regionColors[index % regionColors.length]} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ChartContainer>
                <div className="space-y-4">
                  {geoDistribution.map((region) => (
                    <div key={region.region} className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{region.region}</p>
                        <p className="text-sm text-muted-foreground">
                          {region.users.toLocaleString()} users • {region.salons} salons
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${region.revenue.toLocaleString()}</p>
                        <Badge variant="outline">{region.percentage}%</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="features" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Feature Adoption Rates</CardTitle>
              <CardDescription>Platform feature usage and adoption</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[400px]">
                <BarChart data={featureAdoption} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis dataKey="feature" type="category" width={120} />
                  <ChartTooltip 
                    content={<ChartTooltipContent formatter={(value: number) => `${value}%`} />}
                  />
                  <Bar dataKey="adoptionRate" fill="var(--color-users)">
                    {featureAdoption.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={regionColors[index % regionColors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
              <div className="mt-6 space-y-3">
                {featureAdoption.map((feature) => (
                  <div key={feature.feature} className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{feature.feature}</p>
                      <p className="text-sm text-muted-foreground">
                        {feature.activeUsers.toLocaleString()} active users
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={feature.trend === 'up' ? 'default' : feature.trend === 'down' ? 'destructive' : 'secondary'}>
                        {feature.trend === 'up' ? '↑' : feature.trend === 'down' ? '↓' : '→'} {feature.adoptionRate}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="projections" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Growth Projections</CardTitle>
              <CardDescription>Predicted platform growth for the next 6 months</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[400px]">
                <AreaChart data={[
                  ...growthTrends,
                  { date: "Jul", users: 48000, salons: 1300, appointments: 250000, revenue: 1600000 },
                  { date: "Aug", users: 51000, salons: 1380, appointments: 265000, revenue: 1750000 },
                  { date: "Sep", users: 54000, salons: 1450, appointments: 280000, revenue: 1900000 },
                  { date: "Oct", users: 57000, salons: 1520, appointments: 295000, revenue: 2050000 },
                  { date: "Nov", users: 60000, salons: 1600, appointments: 310000, revenue: 2200000 },
                  { date: "Dec", users: 63000, salons: 1680, appointments: 325000, revenue: 2350000 }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Area type="monotone" dataKey="users" stackId="1" stroke="var(--color-users)" fill="var(--color-users)" />
                  <Area type="monotone" dataKey="salons" stackId="2" stroke="var(--color-salons)" fill="var(--color-salons)" />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}