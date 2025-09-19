"use client"

import { useState, useMemo } from "react"
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Calendar,
  Star,
  Clock,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Award,
  AlertCircle,
  Download,
  Filter
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns"
import type { StaffProfile } from "../dal/staff-types"

interface StaffAnalyticsProps {
  staff: StaffProfile[]
  salonId?: string
  dateRange?: {
    from: Date
    to: Date
  }
}

interface PerformanceMetric {
  staffId: string
  staffName: string
  revenue: number
  appointments: number
  rating: number
  utilization: number
  tips: number
  rebookRate: number
  avgServiceTime: number
  clientRetention: number
}

export function StaffAnalytics({
  staff,
  salonId,
  dateRange = {
    from: subDays(new Date(), 30),
    to: new Date()
  }
}: StaffAnalyticsProps) {
  const [selectedPeriod, setSelectedPeriod] = useState("month")
  const [selectedMetric, setSelectedMetric] = useState("revenue")
  const [comparisonMode, setComparisonMode] = useState(false)
  const [selectedStaffIds, setSelectedStaffIds] = useState<string[]>([])

  // Mock performance data (replace with actual data from server)
  const performanceData: PerformanceMetric[] = staff.map(member => ({
    staffId: member.id,
    staffName: member.display_name || "",
    revenue: Math.floor(Math.random() * 10000) + 5000,
    appointments: Math.floor(Math.random() * 100) + 50,
    rating: Math.random() * 2 + 3,
    utilization: Math.random() * 40 + 60,
    tips: Math.floor(Math.random() * 1000) + 500,
    rebookRate: Math.random() * 30 + 70,
    avgServiceTime: Math.floor(Math.random() * 30) + 45,
    clientRetention: Math.random() * 20 + 80
  }))

  // Calculate team averages
  const teamAverages = useMemo(() => {
    const total = performanceData.length
    return {
      revenue: performanceData.reduce((sum, p) => sum + p.revenue, 0) / total,
      appointments: performanceData.reduce((sum, p) => sum + p.appointments, 0) / total,
      rating: performanceData.reduce((sum, p) => sum + p.rating, 0) / total,
      utilization: performanceData.reduce((sum, p) => sum + p.utilization, 0) / total,
      tips: performanceData.reduce((sum, p) => sum + p.tips, 0) / total,
      rebookRate: performanceData.reduce((sum, p) => sum + p.rebookRate, 0) / total,
      clientRetention: performanceData.reduce((sum, p) => sum + p.clientRetention, 0) / total
    }
  }, [performanceData])

  // Top performers by metric
  const topPerformers = useMemo(() => {
    return {
      revenue: [...performanceData].sort((a, b) => b.revenue - a.revenue).slice(0, 3),
      rating: [...performanceData].sort((a, b) => b.rating - a.rating).slice(0, 3),
      appointments: [...performanceData].sort((a, b) => b.appointments - a.appointments).slice(0, 3),
      utilization: [...performanceData].sort((a, b) => b.utilization - a.utilization).slice(0, 3)
    }
  }, [performanceData])

  // Performance trends (mock data)
  const trendData = {
    revenue: [
      { month: "Jan", value: 45000 },
      { month: "Feb", value: 48000 },
      { month: "Mar", value: 52000 },
      { month: "Apr", value: 49000 },
      { month: "May", value: 55000 },
      { month: "Jun", value: 58000 }
    ],
    appointments: [
      { month: "Jan", value: 320 },
      { month: "Feb", value: 340 },
      { month: "Mar", value: 380 },
      { month: "Apr", value: 350 },
      { month: "May", value: 390 },
      { month: "Jun", value: 410 }
    ]
  }

  const handleExport = (format: "csv" | "pdf") => {
    // TODO: Implement export functionality
  }

  const MetricCard = ({
    title,
    value,
    change,
    icon: Icon,
    format: formatType = "number"
  }: {
    title: string
    value: number
    change?: number
    icon: any
    format?: "number" | "currency" | "percent"
  }) => {
    const formattedValue = formatType === "currency"
      ? `$${value.toLocaleString()}`
      : formatType === "percent"
      ? `${value.toFixed(1)}%`
      : value.toLocaleString()

    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formattedValue}</div>
          {change !== undefined && (
            <div className="flex items-center text-xs mt-1">
              {change > 0 ? (
                <>
                  <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                  <span className="text-green-500">+{change.toFixed(1)}%</span>
                </>
              ) : (
                <>
                  <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                  <span className="text-red-500">{change.toFixed(1)}%</span>
                </>
              )}
              <span className="text-muted-foreground ml-1">vs last period</span>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h3 className="text-xl font-bold">Performance Analytics</h3>
          <p className="text-sm text-muted-foreground">
            Track and analyze staff performance metrics
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant={comparisonMode ? "default" : "outline"}
            size="sm"
            onClick={() => setComparisonMode(!comparisonMode)}
          >
            Compare
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleExport("csv")}>
                Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("pdf")}>
                Export as PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Revenue"
          value={performanceData.reduce((sum, p) => sum + p.revenue, 0)}
          change={12.5}
          icon={DollarSign}
          format="currency"
        />
        <MetricCard
          title="Total Appointments"
          value={performanceData.reduce((sum, p) => sum + p.appointments, 0)}
          change={8.2}
          icon={Calendar}
        />
        <MetricCard
          title="Average Rating"
          value={teamAverages.rating}
          change={2.1}
          icon={Star}
        />
        <MetricCard
          title="Team Utilization"
          value={teamAverages.utilization}
          change={-3.5}
          icon={Activity}
          format="percent"
        />
      </div>

      {/* Performance Tabs */}
      <Tabs defaultValue="individual" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="individual">Individual</TabsTrigger>
          <TabsTrigger value="comparison">Comparison</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="individual" className="space-y-4">
          {/* Performance Table */}
          <Card>
            <CardHeader>
              <CardTitle>Individual Performance</CardTitle>
              <CardDescription>Detailed metrics for each staff member</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Staff Member</TableHead>
                      <TableHead className="text-right">Revenue</TableHead>
                      <TableHead className="text-center">Appointments</TableHead>
                      <TableHead className="text-center">Rating</TableHead>
                      <TableHead className="text-center">Utilization</TableHead>
                      <TableHead className="text-right">Tips</TableHead>
                      <TableHead className="text-center">Rebook Rate</TableHead>
                      <TableHead className="text-center">Performance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {performanceData.map((metric) => {
                      const performanceScore =
                        (metric.revenue / teamAverages.revenue) * 0.3 +
                        (metric.appointments / teamAverages.appointments) * 0.2 +
                        (metric.rating / teamAverages.rating) * 0.3 +
                        (metric.utilization / teamAverages.utilization) * 0.2

                      return (
                        <TableRow key={metric.staffId}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="text-xs">
                                  {metric.staffName.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium">{metric.staffName}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            ${metric.revenue.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-center">
                            {metric.appointments}
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-1">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              {metric.rating.toFixed(1)}
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-2">
                              <Progress value={metric.utilization} className="w-16" />
                              <span className="text-xs">{metric.utilization.toFixed(0)}%</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            ${metric.tips.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-center">
                            {metric.rebookRate.toFixed(0)}%
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge
                              variant={
                                performanceScore > 1.1 ? "default" :
                                performanceScore > 0.9 ? "secondary" :
                                "destructive"
                              }
                            >
                              {performanceScore > 1.1 ? "Excellent" :
                               performanceScore > 0.9 ? "Good" :
                               "Needs Improvement"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Top Performers */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Top Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {topPerformers.revenue.map((performer, index) => (
                    <div key={performer.staffId} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {index + 1}. {performer.staffName}
                        </span>
                      </div>
                      <span className="text-sm font-bold">
                        ${performer.revenue.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Top Rated</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {topPerformers.rating.map((performer, index) => (
                    <div key={performer.staffId} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {index + 1}. {performer.staffName}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-bold">
                          {performer.rating.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Most Appointments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {topPerformers.appointments.map((performer, index) => (
                    <div key={performer.staffId} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {index + 1}. {performer.staffName}
                        </span>
                      </div>
                      <span className="text-sm font-bold">
                        {performer.appointments}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Highest Utilization</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {topPerformers.utilization.map((performer, index) => (
                    <div key={performer.staffId} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {index + 1}. {performer.staffName}
                        </span>
                      </div>
                      <span className="text-sm font-bold">
                        {performer.utilization.toFixed(0)}%
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Comparison</CardTitle>
              <CardDescription>Compare staff members across different metrics</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Comparison Chart Placeholder */}
              <div className="h-[400px] flex items-center justify-center border-2 border-dashed rounded-lg">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">Comparison chart visualization</p>
                  <p className="text-sm text-muted-foreground">Select staff members to compare</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Metric Comparison Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Revenue Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {performanceData.slice(0, 5).map((metric) => {
                    const percentage = (metric.revenue / performanceData.reduce((sum, p) => sum + p.revenue, 0)) * 100
                    return (
                      <div key={metric.staffId}>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{metric.staffName}</span>
                          <span>{percentage.toFixed(1)}%</span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Service Efficiency</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {performanceData.slice(0, 5).map((metric) => (
                    <div key={metric.staffId} className="flex justify-between items-center">
                      <span className="text-sm">{metric.staffName}</span>
                      <div className="text-right">
                        <p className="text-sm font-medium">{metric.avgServiceTime} min</p>
                        <p className="text-xs text-muted-foreground">avg service time</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Trends</CardTitle>
              <CardDescription>Track performance over time</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Trend Chart Placeholder */}
              <div className="h-[400px] flex items-center justify-center border-2 border-dashed rounded-lg">
                <div className="text-center">
                  <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">Trend chart visualization</p>
                  <p className="text-sm text-muted-foreground">
                    Revenue and appointments over the last 6 months
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Trend Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Revenue Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-2xl font-bold">+15.3%</p>
                    <p className="text-xs text-muted-foreground">vs last month</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Booking Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-2xl font-bold">+8.7%</p>
                    <p className="text-xs text-muted-foreground">vs last month</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Customer Satisfaction</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-5 w-5 text-red-500" />
                  <div>
                    <p className="text-2xl font-bold">-2.1%</p>
                    <p className="text-xs text-muted-foreground">vs last month</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          {/* AI Insights */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Key Insights:</strong> Based on current performance data
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Performance Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2">
                  <Award className="h-4 w-4 text-green-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">High Performers</p>
                    <p className="text-xs text-muted-foreground">
                      3 staff members consistently exceed targets by 20% or more
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Target className="h-4 w-4 text-yellow-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Improvement Opportunities</p>
                    <p className="text-xs text-muted-foreground">
                      2 staff members could benefit from additional training
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Clock className="h-4 w-4 text-blue-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Scheduling Optimization</p>
                    <p className="text-xs text-muted-foreground">
                      Tuesday afternoons show 35% lower utilization
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Recommendations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-muted rounded">
                    <span className="text-sm">Schedule optimization</span>
                    <Badge variant="outline" className="text-xs">High Impact</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-muted rounded">
                    <span className="text-sm">Skills training program</span>
                    <Badge variant="outline" className="text-xs">Medium Impact</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-muted rounded">
                    <span className="text-sm">Performance incentives</span>
                    <Badge variant="outline" className="text-xs">High Impact</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-muted rounded">
                    <span className="text-sm">Client feedback system</span>
                    <Badge variant="outline" className="text-xs">Low Impact</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Goals & Targets */}
          <Card>
            <CardHeader>
              <CardTitle>Goals & Target Achievement</CardTitle>
              <CardDescription>Track progress towards performance goals</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">Monthly Revenue Target</span>
                    <span className="text-sm font-medium">$85,000 / $100,000</span>
                  </div>
                  <Progress value={85} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">Customer Satisfaction</span>
                    <span className="text-sm font-medium">4.6 / 5.0</span>
                  </div>
                  <Progress value={92} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">Team Utilization</span>
                    <span className="text-sm font-medium">78% / 85%</span>
                  </div>
                  <Progress value={78} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">Rebook Rate</span>
                    <span className="text-sm font-medium">72% / 80%</span>
                  </div>
                  <Progress value={72} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}