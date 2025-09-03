"use client"
import { useState, useEffect } from "react"
import { TrendingUp, TrendingDown, Users, DollarSign, Activity, CreditCard } from "lucide-react"

import { toast } from "sonner"
import { createClient } from "@/lib/database/supabase/client"
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts"
import { startOfMonth, subMonths, format } from "date-fns"
import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle, Progress, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Skeleton} from "@/components/ui"
interface SubscriptionMetrics {
  totalRevenue: number
  monthlyRecurringRevenue: number
  averageRevenuePerUser: number
  totalSubscribers: number
  activeSubscribers: number
  churnRate: number
  growthRate: number
  trialConversions: number
  planDistribution: { name: string; count: number; revenue: number }[]
  revenueHistory: { month: string; revenue: number; subscribers: number }[]
}
export function SubscriptionAnalytics() {
  const [metrics, setMetrics] = useState<SubscriptionMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<"month" | "quarter" | "year">("quarter")
  useEffect(() => {
    const loadAnalytics = async () => {
      setLoading(true)
      try {
        const supabase = createClient()
        
        // Determine date range
        const now = new Date()
        let startDate = startOfMonth(now)
        
        if (timeRange === "quarter") {
          startDate = subMonths(startDate, 2)
        } else if (timeRange === "year") {
          startDate = subMonths(startDate, 11)
        }
        
        const { data: subscriptions } = await supabase
          .from("platform_subscriptions")
          .select("*, subscription_plans(name, price_monthly)")
          .gte("created_at", startDate.toISOString())
        
        const { data: events } = await supabase
          .from("subscription_events")
          .select("*")
          .gte("event_date", startDate.toISOString())
          .order("event_date", { ascending: true })
        
        setSubscriptions(subscriptions || [])
        setSubscriptionEvents(events || [])
        calculateMetrics(subscriptions || [], events || [])
      } catch (_error) {
        toast.error("Failed to load subscription analytics")
      } finally {
        setLoading(false)
      }
    }
    
    loadAnalytics()
  }, [timeRange])
  
  const calculateMetrics = (subscriptions: Array<{ status: string; subscription_plans?: { name?: string; price_monthly?: number } }>, _events: Array<{ event_type: string; event_date: string }>) => {
    // Calculate metrics
    const activeSubscriptions = subscriptions?.filter(s => s.status === "active") || []
    const totalRevenue = activeSubscriptions.reduce((sum, sub) => {
      return sum + (sub.subscription_plans?.price_monthly || 0)
    }, 0)
    const monthlyRecurringRevenue = totalRevenue
    const averageRevenuePerUser = activeSubscriptions.length > 0
      ? totalRevenue / activeSubscriptions.length
      : 0
    
    // Calculate plan distribution
    const planMap = new Map<string, { name: string; count: number; revenue: number }>()
    activeSubscriptions.forEach((sub) => {
      const planName = sub.subscription_plans?.name || "Unknown"
      const existing = planMap.get(planName) || { name: planName, count: 0, revenue: 0 }
      existing.count += 1
      existing.revenue += sub.subscription_plans?.price_monthly || 0
      planMap.set(planName, existing)
    })
    const planDistribution = Array.from(planMap.values())
    
    // Calculate churn rate (simplified)
    const cancelledCount = subscriptions?.filter(s => s.status === "cancelled").length || 0
    const churnRate = activeSubscriptions.length > 0
      ? (cancelledCount / (activeSubscriptions.length + cancelledCount)) * 100
      : 0
    
    // Calculate growth rate (simplified without async)
    const growthRate = 10 // Placeholder - should be calculated from historical data
    
    // Generate revenue history (mock data for demo)
    const now = new Date()
    const revenueHistory = []
    for (let i = 5; i >= 0; i--) {
      const monthDate = subMonths(now, i)
      revenueHistory.push({
        month: format(monthDate, "MMM"),
        revenue: Math.floor(Math.random() * 50000) + 30000,
        subscribers: Math.floor(Math.random() * 200) + 100
      })
    }
    
    setMetrics({
      totalRevenue,
      monthlyRecurringRevenue,
      averageRevenuePerUser,
      totalSubscribers: subscriptions?.length || 0,
      activeSubscribers: activeSubscriptions.length,
      churnRate,
      growthRate,
      trialConversions: Math.floor(Math.random() * 30) + 10, // Mock data
      planDistribution,
      revenueHistory
    })
  }
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0}).format(amount)
  }
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[300px] w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[300px] w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }
  if (!metrics) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Activity className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No analytics data available</p>
        </CardContent>
      </Card>
    )
  }
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Subscription Analytics</h3>
          <p className="text-sm text-muted-foreground">
            Monitor subscription performance and revenue
          </p>
        </div>
        <Select value={timeRange} onValueChange={(value) => setTimeRange(value)}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="quarter">This Quarter</SelectItem>
            <SelectItem value="year">This Year</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">MRR</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(metrics.monthlyRecurringRevenue)}
            </div>
            <div className="flex items-center gap-1 text-xs">
              {metrics.growthRate > 0 ? (
                <>
                  <TrendingUp className="h-3 w-3 text-green-600" />
                  <span className="text-green-600">
                    +{metrics.growthRate.toFixed(1)}%
                  </span>
                </>
              ) : (
                <>
                  <TrendingDown className="h-3 w-3 text-red-600" />
                  <span className="text-red-600">
                    {metrics.growthRate.toFixed(1)}%
                  </span>
                </>
              )}
              <span className="text-muted-foreground">from last month</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscribers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeSubscribers}</div>
            <Progress 
              value={(metrics.activeSubscribers / metrics.totalSubscribers) * 100} 
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {metrics.totalSubscribers} total subscribers
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ARPU</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(metrics.averageRevenuePerUser)}
            </div>
            <p className="text-xs text-muted-foreground">
              Average revenue per user
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.churnRate.toFixed(1)}%</div>
            <Badge 
              variant={metrics.churnRate < 5 ? "default" : metrics.churnRate < 10 ? "secondary" : "destructive"}
              className="mt-2"
            >
              {metrics.churnRate < 5 ? "Excellent" : metrics.churnRate < 10 ? "Good" : "Needs Attention"}
            </Badge>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
            <CardDescription>Monthly recurring revenue over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={metrics.revenueHistory}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="month" 
                  className="text-xs"
                  tick={{ fill: "currentColor" }}
                />
                <YAxis 
                  className="text-xs"
                  tick={{ fill: "currentColor" }}
                  tickFormatter={(value) => `$${value / 1000}k`}
                />
                <Tooltip 
                  formatter={(value) => typeof value === 'number' ? formatCurrency(value) : value}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Plan Distribution</CardTitle>
            <CardDescription>Subscribers by subscription plan</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={metrics.planDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {metrics.planDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Plan Performance</CardTitle>
          <CardDescription>Revenue breakdown by subscription plan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {metrics.planDistribution.map((plan, index) => (
              <div key={plan.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="h-3 w-3 rounded-full" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="font-medium">{plan.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatCurrency(plan.revenue)}</p>
                    <p className="text-xs text-muted-foreground">
                      {plan.count} subscriber{plan.count !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
                <Progress 
                  value={(plan.revenue / metrics.monthlyRecurringRevenue) * 100} 
                  className="h-2"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
