"use client"
import { useState } from "react"

import { format, differenceInDays } from "date-fns"
import { MoreVertical, Download, Eye, X, Calendar } from "lucide-react"
import type { Database } from "@/types/database.types"
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
type TimeOffRequest = Database["public"]["Tables"]["time_off_requests"]["Row"]
interface TimeOffHistoryProps {
  staffId: string
  requests: TimeOffRequest[]
  onCancelRequest?: (requestId: string) => void
  onViewDetails?: (request: TimeOffRequest) => void
}
export function TimeOffHistory({
  staffId: _staffId,
  requests,
  onCancelRequest,
  onViewDetails}: TimeOffHistoryProps) {
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected" | "cancelled">("all")
  const filteredRequests = requests.filter((request) => {
    if (filter === "all") return true
    return request.status === filter
  })
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary">Pending</Badge>
      case "approved":
        return <Badge variant="default">Approved</Badge>
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>
      case "cancelled":
        return <Badge variant="outline">Cancelled</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }
  const getTypeBadge = (type: string) => {
    switch (type) {
      case "vacation":
        return <Badge variant="outline">Vacation</Badge>
      case "sick":
        return <Badge variant="outline">Sick Leave</Badge>
      case "personal":
        return <Badge variant="outline">Personal</Badge>
      default:
        return <Badge variant="outline">{type}</Badge>
    }
  }
  const handleExport = () => {
    // Generate CSV content
    const headers = ["Request Date", "Type", "Start Date", "End Date", "Days", "Status", "Reason"]
    const rows = filteredRequests.map((request) => [
      format(new Date(request.created_at), "yyyy-MM-dd"),
      request.request_type,
      request.start_date,
      request.end_date,
      differenceInDays(new Date(request.end_date), new Date(request.start_date)) + 1,
      request.status,
      request.reason || "",
    ])
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n")
    // Download CSV file
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `time-off-history-${format(new Date(), "yyyy-MM-dd")}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }
  const stats = {
    total: requests.length,
    pending: requests.filter((r) => r.status === "pending").length,
    approved: requests.filter((r) => r.status === "approved").length,
    rejected: requests.filter((r) => r.status === "rejected").length,
    totalDaysUsed: requests
      .filter((r) => r.status === "approved")
      .reduce((sum, r) => sum + differenceInDays(new Date(r.end_date), new Date(r.start_date)) + 1, 0)}
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Time Off History</CardTitle>
              <CardDescription>
                View and manage your time off requests
              </CardDescription>
            </div>
            <Button variant="outline" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-sm text-muted-foreground">Total Requests</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                <p className="text-sm text-muted-foreground">Pending</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
                <p className="text-sm text-muted-foreground">Approved</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{stats.totalDaysUsed}</div>
                <p className="text-sm text-muted-foreground">Days Used</p>
              </CardContent>
            </Card>
          </div>
          <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
              <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
              <TabsTrigger value="approved">Approved ({stats.approved})</TabsTrigger>
              <TabsTrigger value="rejected">Rejected ({stats.rejected})</TabsTrigger>
              <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
            </TabsList>
            <TabsContent value={filter}>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Request Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Dates</TableHead>
                      <TableHead>Days</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRequests.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                          <p className="text-muted-foreground">No requests found</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredRequests.map((request) => {
                        const days = differenceInDays(
                          new Date(request.end_date),
                          new Date(request.start_date)
                        ) + 1
                        return (
                          <TableRow key={request.id}>
                            <TableCell>
                              {format(new Date(request.created_at), "MMM d, yyyy")}
                            </TableCell>
                            <TableCell>{getTypeBadge(request.request_type)}</TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="text-sm">
                                  {format(new Date(request.start_date), "MMM d")} -{" "}
                                  {format(new Date(request.end_date), "MMM d, yyyy")}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{days} {days === 1 ? "day" : "days"}</Badge>
                            </TableCell>
                            <TableCell>
                              <div className="max-w-[200px] truncate text-sm text-muted-foreground">
                                {request.reason || "-"}
                              </div>
                            </TableCell>
                            <TableCell>{getStatusBadge(request.status)}</TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => onViewDetails?.(request)}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    View Details
                                  </DropdownMenuItem>
                                  {request.status === "pending" && onCancelRequest && (
                                    <DropdownMenuItem
                                      onClick={() => onCancelRequest(request.id)}
                                      className="text-destructive"
                                    >
                                      <X className="mr-2 h-4 w-4" />
                                      Cancel Request
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        )
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
