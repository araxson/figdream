"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Tabs, TabsContent, TabsList, TabsTrigger, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Badge, Progress } from "@/components/ui"
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
  Area,
  AreaChart
} from "recharts"
import { 
  DollarSign, 
  Users,
  CreditCard,
  Activity,
  ArrowUpRight
} from "lucide-react"
// import { createClient } from "@/lib/supabase/client"
const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444']
export function GiftCardAnalytics() {
  const [timeRange, setTimeRange] = useState("30d")
  const [_loading] = useState(true)
  // Mock data for demonstration
  const salesData = [
    { month: 'Jan', sold: 4500, redeemed: 3200 },
    { month: 'Feb', sold: 5200, redeemed: 3800 },
    { month: 'Mar', sold: 4800, redeemed: 3500 },
    { month: 'Apr', sold: 6200, redeemed: 4200 },
    { month: 'May', sold: 7500, redeemed: 5100 },
    { month: 'Jun', sold: 8200, redeemed: 5800 },
  ]
  const redemptionPatterns = [
    { day: 'Mon', redemptions: 12 },
    { day: 'Tue', redemptions: 18 },
    { day: 'Wed', redemptions: 15 },
    { day: 'Thu', redemptions: 22 },
    { day: 'Fri', redemptions: 28 },
    { day: 'Sat', redemptions: 35 },
    { day: 'Sun', redemptions: 20 },
  ]
  const popularAmounts = [
    { amount: '$25', count: 45, percentage: 15 },
    { amount: '$50', count: 120, percentage: 40 },
    { amount: '$75', count: 60, percentage: 20 },
    { amount: '$100', count: 50, percentage: 17 },
    { amount: 'Other', count: 25, percentage: 8 },
  ]
  const customerSegments = [
    { name: 'New Customers', value: 35 },
    { name: 'Returning Customers', value: 45 },
    { name: 'VIP Customers', value: 20 },
  ]
  const metrics = {
    totalSold: 52500,
    totalRedeemed: 38600,
    averageValue: 75.50,
    redemptionRate: 73.5,
    monthlyGrowth: 12.5,
    outstandingBalance: 13900,
    expiringThisMonth: 2400,
    newPurchasers: 156
  }
  useEffect(() => {
    fetchAnalytics()
  }, [timeRange])
  async function fetchAnalytics() {
    try {
      // const supabase = createClient()
      // Fetch real analytics data
      setLoading(false)
    } catch (error) {
      console.error("Error fetching analytics:", error)
      setLoading(false)
    }
  }
  return (
    <div className="space-y-6">
      {/* Header with Time Range Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gift Card Analytics</h2>
          <p className="text-muted-foreground">Track performance and insights</p>
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
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sold</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${metrics.totalSold.toLocaleString()}</div>
            <div className="flex items-center text-xs text-green-600">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              {metrics.monthlyGrowth}% from last month
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Redemption Rate</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.redemptionRate}%</div>
            <Progress value={metrics.redemptionRate} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Value</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${metrics.averageValue}</div>
            <p className="text-xs text-muted-foreground">Per gift card</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Purchasers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.newPurchasers}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>
      {/* Charts */}
      <Tabs defaultValue="sales" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sales">Sales & Redemptions</TabsTrigger>
          <TabsTrigger value="patterns">Usage Patterns</TabsTrigger>
          <TabsTrigger value="segments">Customer Segments</TabsTrigger>
        </TabsList>
        <TabsContent value="sales" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sales vs Redemptions</CardTitle>
              <CardDescription>Monthly comparison of gift card sales and redemptions</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${value}`} />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="sold" 
                    stackId="1"
                    stroke="#8b5cf6" 
                    fill="#8b5cf6" 
                    fillOpacity={0.6}
                    name="Sold"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="redeemed" 
                    stackId="2"
                    stroke="#3b82f6" 
                    fill="#3b82f6" 
                    fillOpacity={0.6}
                    name="Redeemed"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Outstanding Balances</CardTitle>
                <CardDescription>Unredeemed gift card value</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Total Outstanding</span>
                    <span className="text-2xl font-bold">${metrics.outstandingBalance.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-destructive">
                    <span className="text-sm">Expiring This Month</span>
                    <span className="font-semibold">${metrics.expiringThisMonth.toLocaleString()}</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span>Active Cards</span>
                      <span>245</span>
                    </div>
                    <Progress value={75} />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Popular Amounts</CardTitle>
                <CardDescription>Most purchased gift card values</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {popularAmounts.map((item) => (
                    <div key={item.amount} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{item.amount}</Badge>
                        <span className="text-sm">{item.count} cards</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={item.percentage} className="w-[60px]" />
                        <span className="text-xs text-muted-foreground w-10 text-right">
                          {item.percentage}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="patterns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Redemption Pattern</CardTitle>
              <CardDescription>Gift card usage by day of week</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={redemptionPatterns}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="redemptions" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Peak Usage Times</CardTitle>
                <CardDescription>When gift cards are most redeemed</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Holidays</span>
                    <Badge>+45%</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Weekends</span>
                    <Badge>+32%</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Month-end</span>
                    <Badge>+18%</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Special Events</span>
                    <Badge>+25%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Redemption Velocity</CardTitle>
                <CardDescription>Average time to first use</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Same Day</span>
                    <span className="font-medium">12%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Within 1 Week</span>
                    <span className="font-medium">35%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Within 1 Month</span>
                    <span className="font-medium">28%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Over 1 Month</span>
                    <span className="font-medium">25%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="segments" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Customer Segments</CardTitle>
                <CardDescription>Gift card purchasers by type</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={customerSegments}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {customerSegments.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Purchase Occasions</CardTitle>
                <CardDescription>Why customers buy gift cards</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Birthdays</span>
                      <span className="text-sm font-medium">35%</span>
                    </div>
                    <Progress value={35} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Holidays</span>
                      <span className="text-sm font-medium">28%</span>
                    </div>
                    <Progress value={28} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Thank You Gifts</span>
                      <span className="text-sm font-medium">20%</span>
                    </div>
                    <Progress value={20} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Corporate Rewards</span>
                      <span className="text-sm font-medium">17%</span>
                    </div>
                    <Progress value={17} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}