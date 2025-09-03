"use client"
import { useState, useEffect } from "react"
import { Download, DollarSign, CheckCircle, Clock, XCircle, Calendar } from "lucide-react"

import { toast } from "sonner"
import { createClient } from "@/lib/database/supabase/client"
import { format } from "date-fns"
import type { Database } from "@/types/database.types"
import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Skeleton, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui"
type StaffPayout = Database["public"]["Tables"]["staff_payouts"]["Row"]
interface PayoutHistoryProps {
  staffId: string
}
export function PayoutHistory({ staffId }: PayoutHistoryProps) {
  const [payouts, setPayouts] = useState<StaffPayout[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "completed" | "pending" | "failed">("all")
  const supabase = createClient()
  useEffect(() => {
    loadPayouts()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [staffId, filter])
  const loadPayouts = async () => {
    try {
      setLoading(true)
      let query = supabase
        .from("staff_payouts")
        .select("*")
        .eq("staff_id", staffId)
        .order("payout_date", { ascending: false })
      if (filter !== "all") {
        query = query.eq("status", filter)
      }
      const { data, error } = await query
      if (error) throw error
      setPayouts(data || [])
    } catch (_error) {
      toast.error("Failed to load payout history")
    } finally {
      setLoading(false)
    }
  }
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD"}).format(amount)
  }
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />
      case "failed":
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return null
    }
  }
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "completed":
        return "default" as const
      case "pending":
        return "secondary" as const
      case "failed":
        return "destructive" as const
      default:
        return "outline" as const
    }
  }
  const handleDownloadStatement = async (_payoutId: string) => {
    try {
      // In a real app, this would generate/download a PDF statement
      toast.success("Statement download started")
    } catch (_error) {
      toast.error("Failed to download statement")
    }
  }
  const calculateTotals = () => {
    const totals = payouts.reduce(
      (acc, payout) => {
        if (payout.status === "completed") {
          acc.completed += payout.amount
        } else if (payout.status === "pending") {
          acc.pending += payout.amount
        }
        acc.total += payout.amount
        return acc
      },
      { total: 0, completed: 0, pending: 0 }
    )
    return totals
  }
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payout History</CardTitle>
          <CardDescription>Loading payouts...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </CardContent>
      </Card>
    )
  }
  const totals = calculateTotals()
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Paid Out</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totals.completed)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Payouts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {formatCurrency(totals.pending)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totals.total)}
            </div>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Payout History</CardTitle>
              <CardDescription>
                Your earnings payout records
              </CardDescription>
            </div>
            <Select value={filter} onValueChange={(value) => setFilter(value as "all" | "completed" | "pending" | "failed")}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payouts</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {payouts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <DollarSign className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                No payout history available
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payouts.map((payout) => (
                  <TableRow key={payout.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {format(new Date(payout.payout_date), "MMM dd, yyyy")}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {payout.period_start && payout.period_end
                          ? `${format(new Date(payout.period_start), "MMM dd")} - ${format(
                              new Date(payout.period_end),
                              "MMM dd"
                            )}`
                          : "N/A"}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(payout.amount)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {payout.payment_method || "Bank Transfer"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={getStatusBadgeVariant(payout.status)}
                        className="gap-1"
                      >
                        {getStatusIcon(payout.status)}
                        {payout.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownloadStatement(payout.id)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
