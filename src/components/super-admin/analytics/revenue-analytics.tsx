"use client"
import { useState, useEffect } from "react"
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { 
  DollarSign, Users, CreditCard, 
  Target, AlertTriangle, ArrowUpRight, ArrowDownRight, Loader2
} from "lucide-react"
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
interface RevenueMetrics {
  mrr: number // Monthly Recurring Revenue
  arr: number // Annual Recurring Revenue
  ltv: number // Lifetime Value
  cac: number // Customer Acquisition Cost
  arpu: number // Average Revenue Per User
  churnRate: number
  growthRate: number
  paybackPeriod: number
}
interface RevenueByTier {
  tier: string
  revenue: number
  customers: number
  percentage: number
  color: string
}
interface ChurnAnalysis {
  month: string
  newCustomers: number
  churnedCustomers: number
  netGrowth: number
  churnRate: number
}
interface PaymentMethodBreakdown {
  method: string
  revenue: number
  transactions: number
  avgTransaction: number
  percentage: number
}
interface RevenueProjection {
  month: string
  actual?: number
  projected: number
  optimistic: number
  pessimistic: number
}
export function RevenueAnalytics() {
  const [timeRange, setTimeRange] = useState("30d")
  const [metrics, setMetrics] = useState<RevenueMetrics | null>(null)
  const [revenueByTier, setRevenueByTier] = useState<RevenueByTier[]>([])
  const [churnAnalysis, setChurnAnalysis] = useState<ChurnAnalysis[]>([])
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodBreakdown[]>([])
  const [projections, setProjections] = useState<RevenueProjection[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    fetchRevenueData()
  }, [timeRange])
  const fetchRevenueData = async () => {
    setLoading(true)
    try {
      // Simulated data - replace with actual API calls
      setMetrics({
        mrr: 156789,
        arr: 1881468,
        ltv: 2450,
        cac: 185,
        arpu: 78.50,
        churnRate: 5.2,
        growthRate: 12.8,
        paybackPeriod: 2.4
      })
      setRevenueByTier([
        { tier: "Enterprise", revenue: 62715, customers: 45, percentage: 40, color: "hsl(var(--chart-1))" },
        { tier: "Professional", revenue: 47037, customers: 234, percentage: 30, color: "hsl(var(--chart-2))" },
        { tier: "Standard", revenue: 31358, customers: 567, percentage: 20, color: "hsl(var(--chart-3))" },
        { tier: "Basic", revenue: 15679, customers: 388, percentage: 10, color: "hsl(var(--chart-4))" }
      ])
      setChurnAnalysis([
        { month: "Jan", newCustomers: 120, churnedCustomers: 45, netGrowth: 75, churnRate: 4.8 },
        { month: "Feb", newCustomers: 135, churnedCustomers: 48, netGrowth: 87, churnRate: 4.9 },
        { month: "Mar", newCustomers: 150, churnedCustomers: 52, netGrowth: 98, churnRate: 5.0 },
        { month: "Apr", newCustomers: 165, churnedCustomers: 55, netGrowth: 110, churnRate: 5.1 },
        { month: "May", newCustomers: 180, churnedCustomers: 58, netGrowth: 122, churnRate: 5.2 },
        { month: "Jun", newCustomers: 195, churnedCustomers: 60, netGrowth: 135, churnRate: 5.2 }
      ])
      setPaymentMethods([
        { method: "Credit Card", revenue: 94073, transactions: 2456, avgTransaction: 38.32, percentage: 60 },
        { method: "Bank Transfer", revenue: 39197, transactions: 234, avgTransaction: 167.51, percentage: 25 },
        { method: "PayPal", revenue: 15679, transactions: 567, avgTransaction: 27.65, percentage: 10 },
        { method: "Other", revenue: 7840, transactions: 188, avgTransaction: 41.70, percentage: 5 }
      ])
      setProjections([
        { month: "Jan", actual: 135000, projected: 135000, optimistic: 135000, pessimistic: 135000 },
        { month: "Feb", actual: 142000, projected: 142000, optimistic: 142000, pessimistic: 142000 },
        { month: "Mar", actual: 148000, projected: 148000, optimistic: 148000, pessimistic: 148000 },
        { month: "Apr", actual: 153000, projected: 153000, optimistic: 153000, pessimistic: 153000 },
        { month: "May", actual: 156789, projected: 156789, optimistic: 156789, pessimistic: 156789 },
        { month: "Jun", actual: 160000, projected: 160000, optimistic: 160000, pessimistic: 160000 },
        { month: "Jul", projected: 168000, optimistic: 175000, pessimistic: 162000 },
        { month: "Aug", projected: 176000, optimistic: 185000, pessimistic: 168000 },
        { month: "Sep", projected: 185000, optimistic: 196000, pessimistic: 175000 },
        { month: "Oct", projected: 194000, optimistic: 208000, pessimistic: 182000 },
        { month: "Nov", projected: 204000, optimistic: 220000, pessimistic: 190000 },
        { month: "Dec", projected: 215000, optimistic: 235000, pessimistic: 198000 }
      ])
    } catch (_error) {
    } finally {
      setLoading(false)
    }
  }
  const calculateLTVtoCACRatio = () => {
    if (!metrics) return 0
    return (metrics.ltv / metrics.cac).toFixed(2)
  }
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
          <h1 className="text-3xl font-bold">Revenue Analytics</h1>
          <p className="text-muted-foreground">Financial metrics and revenue insights</p>
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
            <CardTitle className="text-sm font-medium">MRR</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${metrics?.mrr.toLocaleString()}</div>
            <div className="flex items-center mt-2">
              <ArrowUpRight className="h-4 w-4 text-primary mr-1" />
              <span className="text-sm text-primary">+{metrics?.growthRate}%</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ARR</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${metrics?.arr.toLocaleString()}</div>
            <Progress value={75} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">75% of annual target</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">LTV:CAC Ratio</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{calculateLTVtoCACRatio()}:1</div>
            <Badge variant="default" className="mt-2">
              {Number(calculateLTVtoCACRatio()) > 3 ? 'Healthy' : 'Needs Improvement'}
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.churnRate}%</div>
            <div className="flex items-center mt-2">
              <ArrowDownRight className="h-4 w-4 text-destructive mr-1" />
              <span className="text-sm text-destructive">+0.3% from last month</span>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Additional Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Customer LTV</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">${metrics?.ltv.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Average lifetime value</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Customer CAC</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">${metrics?.cac}</div>
            <p className="text-xs text-muted-foreground">Acquisition cost</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Payback Period</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{metrics?.paybackPeriod} months</div>
            <p className="text-xs text-muted-foreground">Time to recover CAC</p>
          </CardContent>
        </Card>
      </div>
      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="revenue">Revenue by Tier</TabsTrigger>
          <TabsTrigger value="churn">Churn Analysis</TabsTrigger>
          <TabsTrigger value="payments">Payment Methods</TabsTrigger>
          <TabsTrigger value="projections">Projections</TabsTrigger>
        </TabsList>
        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Distribution by Tier</CardTitle>
              <CardDescription>Monthly recurring revenue breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={revenueByTier}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="hsl(var(--primary))"
                      dataKey="revenue"
                      label={(entry) => `${entry.tier}: $${(entry.revenue / 1000).toFixed(0)}k`}
                    >
                      {revenueByTier.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-4">
                  {revenueByTier.map((tier) => (
                    <div key={tier.tier} className="flex justify-between items-center p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-primary" />
                        <div>
                          <p className="font-medium">{tier.tier}</p>
                          <p className="text-sm text-muted-foreground">{tier.customers} customers</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${tier.revenue.toLocaleString()}</p>
                        <Badge variant="outline">{tier.percentage}%</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="churn" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Customer Churn Analysis</CardTitle>
              <CardDescription>New vs churned customers over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={churnAnalysis}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="newCustomers" fill="hsl(var(--chart-2))" name="New Customers" />
                  <Bar dataKey="churnedCustomers" fill="hsl(var(--destructive))" name="Churned Customers" />
                  <Line type="monotone" dataKey="netGrowth" stroke="hsl(var(--chart-1))" name="Net Growth" />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-6 grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Average Churn Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl font-bold">{metrics?.churnRate}%</div>
                    <Progress value={100 - (metrics?.churnRate || 0) * 10} className="mt-2" />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Net Revenue Retention</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl font-bold">108%</div>
                    <Badge variant="default" className="mt-2">Expanding</Badge>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment Method Breakdown</CardTitle>
              <CardDescription>Revenue distribution by payment type</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={paymentMethods} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="method" type="category" width={100} />
                  <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                  <Bar dataKey="revenue" fill="hsl(var(--chart-1))" />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-6 space-y-3">
                {paymentMethods.map((method) => (
                  <div key={method.method} className="flex justify-between items-center p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <CreditCard className="h-4 w-4" />
                      <div>
                        <p className="font-medium">{method.method}</p>
                        <p className="text-sm text-muted-foreground">
                          {method.transactions} transactions
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${method.revenue.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">
                        Avg: ${method.avgTransaction.toFixed(2)}
                      </p>
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
              <CardTitle>Revenue Projections</CardTitle>
              <CardDescription>12-month revenue forecast with scenarios</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={projections}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                  <Legend />
                  <Area type="monotone" dataKey="actual" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1))" fillOpacity={0.8} name="Actual" />
                  <Area type="monotone" dataKey="projected" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2))" fillOpacity={0.6} name="Projected" />
                  <Area type="monotone" dataKey="optimistic" stroke="hsl(var(--chart-3))" fill="hsl(var(--chart-3))" fillOpacity={0.3} name="Optimistic" />
                  <Area type="monotone" dataKey="pessimistic" stroke="hsl(var(--chart-4))" fill="hsl(var(--chart-4))" fillOpacity={0.3} name="Pessimistic" />
                </AreaChart>
              </ResponsiveContainer>
              <div className="mt-6 grid grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Projected EOY MRR</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl font-bold">$215k</div>
                    <p className="text-xs text-muted-foreground">+37% growth</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Best Case EOY</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl font-bold">$235k</div>
                    <p className="text-xs text-muted-foreground">+50% growth</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Worst Case EOY</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl font-bold">$198k</div>
                    <p className="text-xs text-muted-foreground">+26% growth</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}