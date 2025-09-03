"use client"
import { useState, useEffect } from "react"
import { DollarSign, TrendingUp, TrendingDown, Calendar } from "lucide-react"
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
  Badge
} from "@/components/ui"

import { toast } from "sonner"
import { createClient } from "@/lib/database/supabase/client"
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, subMonths, format } from "date-fns"
import type { Database } from "@/types/database.types"
type StaffEarnings = Database["public"]["Tables"]["staff_earnings"]["Row"]
interface EarningsDashboardProps {
  staffId: string
}
interface EarningsSummary {
  totalEarnings: number
  baseEarnings: number
  commissions: number
  tips: number
  bonuses: number
  appointmentCount: number
  averagePerAppointment: number
  percentageChange: number
}
export function EarningsDashboard({ staffId }: EarningsDashboardProps) {
  const [period, setPeriod] = useState<"week" | "month" | "quarter" | "year">("month")
  const [summary, setSummary] = useState<EarningsSummary | null>(null)
  const [previousSummary, setPreviousSummary] = useState<EarningsSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  useEffect(() => {
    loadEarnings()
  }, [staffId, period])
  const getDateRange = (period: string, offset = 0) => {
    const now = new Date()
    let start: Date, end: Date
    switch (period) {
      case "week":
        start = startOfWeek(new Date(now.setDate(now.getDate() - (offset * 7))))
        end = endOfWeek(start)
        break
      case "month":
        start = startOfMonth(subMonths(now, offset))
        end = endOfMonth(start)
        break
      case "quarter":
        const quarterMonth = Math.floor(now.getMonth() / 3) * 3
        start = new Date(now.getFullYear(), quarterMonth - (offset * 3), 1)
        end = new Date(now.getFullYear(), quarterMonth + 3 - (offset * 3), 0)
        break
      case "year":
        start = new Date(now.getFullYear() - offset, 0, 1)
        end = new Date(now.getFullYear() - offset, 11, 31)
        break
      default:
        start = startOfMonth(now)
        end = endOfMonth(now)
    }
    return { start, end }
  }
  const loadEarnings = async () => {
    try {
      setLoading(true)
      const { start: currentStart, end: currentEnd } = getDateRange(period, 0)
      const { start: previousStart, end: previousEnd } = getDateRange(period, 1)
      // Fetch current period earnings
      const { data: currentData, error: currentError } = await supabase
        .from("staff_earnings")
        .select("*")
        .eq("staff_id", staffId)
        .gte("earning_date", currentStart.toISOString())
        .lte("earning_date", currentEnd.toISOString())
      if (currentError) throw currentError
      // Fetch previous period earnings for comparison
      const { data: previousData, error: previousError } = await supabase
        .from("staff_earnings")
        .select("*")
        .eq("staff_id", staffId)
        .gte("earning_date", previousStart.toISOString())
        .lte("earning_date", previousEnd.toISOString())
      if (previousError) throw previousError
      // Calculate summaries
      const currentSummary = calculateSummary(currentData || [])
      const prevSummary = calculateSummary(previousData || [])
      // Calculate percentage change
      const percentageChange = prevSummary.totalEarnings > 0
        ? ((currentSummary.totalEarnings - prevSummary.totalEarnings) / prevSummary.totalEarnings) * 100
        : 0
      setSummary({ ...currentSummary, percentageChange })
      setPreviousSummary(prevSummary)
    } catch (error) {
      console.error("Error loading earnings:", error)
      toast.error("Failed to load earnings data")
    } finally {
      setLoading(false)
    }
  }
  const calculateSummary = (earnings: StaffEarnings[]): EarningsSummary => {
    const summary = earnings.reduce(
      (acc, earning) => ({
        totalEarnings: acc.totalEarnings + (earning.total_amount || 0),
        baseEarnings: acc.baseEarnings + (earning.base_amount || 0),
        commissions: acc.commissions + (earning.commission_amount || 0),
        tips: acc.tips + (earning.tip_amount || 0),
        bonuses: acc.bonuses + (earning.bonus_amount || 0),
        appointmentCount: acc.appointmentCount + 1,
        averagePerAppointment: 0,
        percentageChange: 0,
      }),
      {
        totalEarnings: 0,
        baseEarnings: 0,
        commissions: 0,
        tips: 0,
        bonuses: 0,
        appointmentCount: 0,
        averagePerAppointment: 0,
        percentageChange: 0,
      }
    )
    summary.averagePerAppointment = 
      summary.appointmentCount > 0 
        ? summary.totalEarnings / summary.appointmentCount 
        : 0
    return summary
  }
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-4 w-20 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }
  if (!summary) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <DollarSign className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No earnings data available</p>
        </CardContent>
      </Card>
    )
  }
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Earnings Overview</h3>
          <p className="text-sm text-muted-foreground">
            Track your income and performance
          </p>
        </div>
        <Select value={period} onValueChange={(value: any) => setPeriod(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="quarter">This Quarter</SelectItem>
            <SelectItem value="year">This Year</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(summary.totalEarnings)}
            </div>
            <div className="flex items-center gap-1 text-xs">
              {summary.percentageChange > 0 ? (
                <>
                  <TrendingUp className="h-3 w-3 text-green-600" />
                  <span className="text-green-600">
                    +{summary.percentageChange.toFixed(1)}%
                  </span>
                </>
              ) : summary.percentageChange < 0 ? (
                <>
                  <TrendingDown className="h-3 w-3 text-red-600" />
                  <span className="text-red-600">
                    {summary.percentageChange.toFixed(1)}%
                  </span>
                </>
              ) : (
                <span className="text-muted-foreground">No change</span>
              )}
              <span className="text-muted-foreground">from last {period}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commissions</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(summary.commissions)}
            </div>
            <p className="text-xs text-muted-foreground">
              {((summary.commissions / summary.totalEarnings) * 100).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tips</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(summary.tips)}
            </div>
            <p className="text-xs text-muted-foreground">
              {summary.appointmentCount} appointments
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg per Service</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(summary.averagePerAppointment)}
            </div>
            <p className="text-xs text-muted-foreground">
              Per appointment
            </p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Earnings Breakdown</CardTitle>
          <CardDescription>
            Detailed breakdown of your earnings components
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Base Earnings</span>
              <span className="text-sm font-bold">
                {formatCurrency(summary.baseEarnings)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Commissions</span>
              <span className="text-sm font-bold">
                {formatCurrency(summary.commissions)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Tips</span>
              <span className="text-sm font-bold">
                {formatCurrency(summary.tips)}
              </span>
            </div>
            {summary.bonuses > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Bonuses</span>
                <span className="text-sm font-bold">
                  {formatCurrency(summary.bonuses)}
                </span>
              </div>
            )}
            <div className="border-t pt-3">
              <div className="flex items-center justify-between">
                <span className="text-base font-semibold">Total</span>
                <span className="text-base font-bold text-primary">
                  {formatCurrency(summary.totalEarnings)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
