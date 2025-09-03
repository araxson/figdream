"use client"
import { useState, useEffect } from "react"
import {
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { 
  DollarSign, AlertCircle, CheckCircle, Clock, CreditCard,
  TrendingUp, FileText, RefreshCw, Download, Loader2
} from "lucide-react"
import { Badge } from "@/components/ui/feedback/badge"
import { Button } from "@/components/ui/form/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/data-display/card"
import { Progress } from "@/components/ui/feedback/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/form/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/data-display/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/navigation/tabs"
interface BillingOverview {
  totalRevenue: number
  outstandingInvoices: number
  failedPayments: number
  upcomingPayments: number
  overdueAmount: number
  collectionRate: number
}
interface Invoice {
  id: string
  salonName: string
  amount: number
  status: 'paid' | 'pending' | 'overdue' | 'failed'
  dueDate: string
  createdDate: string
  paymentMethod: string
}
interface PaymentStatus {
  status: string
  count: number
  amount: number
  percentage: number
  color: string
}
interface RevenueForecast {
  month: string
  confirmed: number
  projected: number
  potential: number
}
export function BillingDashboard() {
  const [timeRange, setTimeRange] = useState("30d")
  const [overview, setOverview] = useState<BillingOverview | null>(null)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus[]>([])
  const [forecast, setForecast] = useState<RevenueForecast[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    fetchBillingData()
  }, [timeRange])
  const fetchBillingData = async () => {
    setLoading(true)
    try {
      // Simulated data - replace with actual API calls
      setOverview({
        totalRevenue: 456789,
        outstandingInvoices: 87,
        failedPayments: 12,
        upcomingPayments: 234,
        overdueAmount: 23456,
        collectionRate: 94.5
      })
      setInvoices([
        { id: "INV-001", salonName: "Elegance Salon", amount: 1299, status: 'paid', dueDate: "2024-06-01", createdDate: "2024-05-01", paymentMethod: "Credit Card" },
        { id: "INV-002", salonName: "Beauty Haven", amount: 899, status: 'pending', dueDate: "2024-06-15", createdDate: "2024-05-15", paymentMethod: "Bank Transfer" },
        { id: "INV-003", salonName: "Style Studio", amount: 1599, status: 'overdue', dueDate: "2024-05-25", createdDate: "2024-04-25", paymentMethod: "Credit Card" },
        { id: "INV-004", salonName: "Glamour Palace", amount: 2199, status: 'failed', dueDate: "2024-06-10", createdDate: "2024-05-10", paymentMethod: "Credit Card" },
        { id: "INV-005", salonName: "Luxe Spa", amount: 3499, status: 'paid', dueDate: "2024-06-05", createdDate: "2024-05-05", paymentMethod: "Bank Transfer" }
      ])
      setPaymentStatus([
        { status: "Paid", count: 412, amount: 378234, percentage: 75, color: "#10b981" },
        { status: "Pending", count: 87, amount: 45678, percentage: 15, color: "#f59e0b" },
        { status: "Overdue", count: 32, amount: 23456, percentage: 7, color: "#ef4444" },
        { status: "Failed", count: 12, amount: 9421, percentage: 3, color: "#6b7280" }
      ])
      setForecast([
        { month: "Jun", confirmed: 380000, projected: 420000, potential: 450000 },
        { month: "Jul", confirmed: 350000, projected: 440000, potential: 480000 },
        { month: "Aug", confirmed: 320000, projected: 460000, potential: 500000 },
        { month: "Sep", confirmed: 300000, projected: 480000, potential: 520000 },
        { month: "Oct", confirmed: 280000, projected: 500000, potential: 550000 },
        { month: "Nov", confirmed: 260000, projected: 520000, potential: 580000 }
      ])
    } catch (error) {
    } finally {
      setLoading(false)
    }
  }
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />
      case 'overdue':
        return <AlertCircle className="h-4 w-4 text-red-600" />
      case 'failed':
        return <RefreshCw className="h-4 w-4 text-gray-600" />
      default:
        return null
    }
  }
  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      paid: "default",
      pending: "secondary",
      overdue: "destructive",
      failed: "outline"
    }
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>
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
          <h1 className="text-3xl font-bold">Billing Dashboard</h1>
          <p className="text-muted-foreground">Invoice management and payment tracking</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
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
      </div>
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${overview?.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12.5%</span> from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview?.outstandingInvoices}</div>
            <p className="text-xs text-muted-foreground">
              ${(overview?.overdueAmount || 0).toLocaleString()} overdue
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Payments</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview?.failedPayments}</div>
            <Badge variant="destructive" className="mt-2">Needs attention</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview?.collectionRate}%</div>
            <Progress value={overview?.collectionRate} className="mt-2" />
          </CardContent>
        </Card>
      </div>
      <Tabs defaultValue="invoices" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="invoices">Recent Invoices</TabsTrigger>
          <TabsTrigger value="status">Payment Status</TabsTrigger>
          <TabsTrigger value="forecast">Revenue Forecast</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        <TabsContent value="invoices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Invoices</CardTitle>
              <CardDescription>Track and manage all invoices</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice ID</TableHead>
                    <TableHead>Salon</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-mono text-sm">{invoice.id}</TableCell>
                      <TableCell>{invoice.salonName}</TableCell>
                      <TableCell className="font-medium">${invoice.amount.toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(invoice.status)}
                          {getStatusBadge(invoice.status)}
                        </div>
                      </TableCell>
                      <TableCell>{invoice.dueDate}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4" />
                          {invoice.paymentMethod}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">View</Button>
                          {invoice.status === 'failed' && (
                            <Button size="sm" variant="default">Retry</Button>
                          )}
                          {invoice.status === 'overdue' && (
                            <Button size="sm" variant="destructive">Send Reminder</Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="status" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment Status Distribution</CardTitle>
              <CardDescription>Overview of payment statuses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={paymentStatus}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="amount"
                      label={(entry) => `${entry.status}: ${entry.percentage}%`}
                    >
                      {paymentStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-4">
                  {paymentStatus.map((status) => (
                    <div key={status.status} className="flex justify-between items-center p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: status.color }} />
                        <div>
                          <p className="font-medium">{status.status}</p>
                          <p className="text-sm text-muted-foreground">{status.count} invoices</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${status.amount.toLocaleString()}</p>
                        <Badge variant="outline">{status.percentage}%</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="forecast" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Forecast</CardTitle>
              <CardDescription>6-month revenue projections</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={forecast}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                  <Legend />
                  <Area type="monotone" dataKey="confirmed" stackId="1" stroke="#10b981" fill="#10b981" name="Confirmed" />
                  <Area type="monotone" dataKey="projected" stackId="1" stroke="#3b82f6" fill="#3b82f6" name="Projected" />
                  <Area type="monotone" dataKey="potential" stackId="1" stroke="#a78bfa" fill="#a78bfa" name="Potential" />
                </AreaChart>
              </ResponsiveContainer>
              <div className="mt-6 grid grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Next Month Confirmed</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl font-bold">$380k</div>
                    <Progress value={85} className="mt-2" />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Q3 Projected</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl font-bold">$1.4M</div>
                    <Badge variant="default" className="mt-2">On track</Badge>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Year-End Target</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl font-bold">$5.8M</div>
                    <p className="text-xs text-muted-foreground">78% achieved</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment Analytics</CardTitle>
              <CardDescription>Detailed payment metrics and trends</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={[
                  { month: "Jan", revenue: 320000, transactions: 412, avgTransaction: 777 },
                  { month: "Feb", revenue: 350000, transactions: 445, avgTransaction: 787 },
                  { month: "Mar", revenue: 380000, transactions: 478, avgTransaction: 795 },
                  { month: "Apr", revenue: 410000, transactions: 512, avgTransaction: 801 },
                  { month: "May", revenue: 440000, transactions: 543, avgTransaction: 810 },
                  { month: "Jun", revenue: 456789, transactions: 567, avgTransaction: 806 }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#8884d8" name="Revenue" />
                  <Line yAxisId="right" type="monotone" dataKey="transactions" stroke="#82ca9d" name="Transactions" />
                  <Line yAxisId="right" type="monotone" dataKey="avgTransaction" stroke="#ffc658" name="Avg Transaction" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}