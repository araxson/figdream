"use client"
import { useState, useEffect } from "react"
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Skeleton
} from "@/components/ui"

import { toast } from "sonner"
import { createClient } from "@/lib/database/supabase/client"
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval } from "date-fns"
import type { Database } from "@/types/database.types"
type StaffEarnings = Database["public"]["Tables"]["staff_earnings"]["Row"]
interface EarningsChartProps {
  staffId: string
  dateRange: { start: Date; end: Date }
}
interface ChartData {
  date: string
  total: number
  base: number
  commission: number
  tips: number
  appointments: number
}
export function EarningsChart({ staffId, dateRange }: EarningsChartProps) {
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [viewType, setViewType] = useState<"daily" | "weekly" | "monthly">("daily")
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  useEffect(() => {
    loadChartData()
  }, [staffId, dateRange, viewType])
  const loadChartData = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("staff_earnings")
        .select("*")
        .eq("staff_id", staffId)
        .gte("earning_date", dateRange.start.toISOString())
        .lte("earning_date", dateRange.end.toISOString())
        .order("earning_date", { ascending: true })
      if (error) throw error
      const processedData = processDataByViewType(data || [], viewType)
      setChartData(processedData)
    } catch (error) {
      console.error("Error loading chart data:", error)
      toast.error("Failed to load earnings chart")
    } finally {
      setLoading(false)
    }
  }
  const processDataByViewType = (
    earnings: StaffEarnings[],
    type: "daily" | "weekly" | "monthly"
  ): ChartData[] => {
    const dataMap = new Map<string, ChartData>()
    // Initialize date intervals based on view type
    let intervals: Date[] = []
    if (type === "daily") {
      intervals = eachDayOfInterval({ start: dateRange.start, end: dateRange.end })
    } else if (type === "weekly") {
      intervals = eachWeekOfInterval({ start: dateRange.start, end: dateRange.end })
    } else {
      intervals = eachMonthOfInterval({ start: dateRange.start, end: dateRange.end })
    }
    // Initialize all intervals with zero values
    intervals.forEach(date => {
      const key = formatDateKey(date, type)
      dataMap.set(key, {
        date: key,
        total: 0,
        base: 0,
        commission: 0,
        tips: 0,
        appointments: 0,
      })
    })
    // Aggregate earnings data
    earnings.forEach(earning => {
      const date = new Date(earning.earning_date)
      const key = formatDateKey(date, type)
      const existing = dataMap.get(key)
      if (existing) {
        existing.total += earning.total_amount || 0
        existing.base += earning.base_amount || 0
        existing.commission += earning.commission_amount || 0
        existing.tips += earning.tip_amount || 0
        existing.appointments += 1
      }
    })
    return Array.from(dataMap.values())
  }
  const formatDateKey = (date: Date, type: "daily" | "weekly" | "monthly"): string => {
    if (type === "daily") {
      return format(date, "MMM dd")
    } else if (type === "weekly") {
      return `Week of ${format(date, "MMM dd")}`
    } else {
      return format(date, "MMM yyyy")
    }
  }
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border bg-background p-3 shadow-sm">
          <p className="font-medium">{label}</p>
          <div className="mt-2 space-y-1">
            {payload.map((entry: any, index: number) => (
              <div key={index} className="flex items-center justify-between gap-4 text-sm">
                <span style={{ color: entry.color }}>{entry.name}:</span>
                <span className="font-medium">{formatCurrency(entry.value)}</span>
              </div>
            ))}
          </div>
          {payload[0]?.payload?.appointments && (
            <p className="mt-2 text-xs text-muted-foreground">
              {payload[0].payload.appointments} appointment(s)
            </p>
          )}
        </div>
      )
    }
    return null
  }
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Earnings Trend</CardTitle>
          <CardDescription>Loading chart...</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    )
  }
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Earnings Trend</CardTitle>
            <CardDescription>
              Visualize your earnings over time
            </CardDescription>
          </div>
          <Tabs value={viewType} onValueChange={(v: any) => setViewType(v)}>
            <TabsList>
              <TabsTrigger value="daily">Daily</TabsTrigger>
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="line" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="line">Line Chart</TabsTrigger>
            <TabsTrigger value="bar">Bar Chart</TabsTrigger>
          </TabsList>
          <TabsContent value="line" className="space-y-4">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="date" 
                  className="text-xs"
                  tick={{ fill: "currentColor" }}
                />
                <YAxis 
                  className="text-xs"
                  tick={{ fill: "currentColor" }}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="total"
                  name="Total"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="commission"
                  name="Commission"
                  stroke="hsl(var(--chart-2))"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="tips"
                  name="Tips"
                  stroke="hsl(var(--chart-3))"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>
          <TabsContent value="bar" className="space-y-4">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="date" 
                  className="text-xs"
                  tick={{ fill: "currentColor" }}
                />
                <YAxis 
                  className="text-xs"
                  tick={{ fill: "currentColor" }}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar
                  dataKey="base"
                  name="Base"
                  fill="hsl(var(--chart-1))"
                  stackId="a"
                />
                <Bar
                  dataKey="commission"
                  name="Commission"
                  fill="hsl(var(--chart-2))"
                  stackId="a"
                />
                <Bar
                  dataKey="tips"
                  name="Tips"
                  fill="hsl(var(--chart-3))"
                  stackId="a"
                />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
