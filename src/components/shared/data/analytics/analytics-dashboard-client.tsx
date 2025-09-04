"use client"

import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Download } from "lucide-react"
import { hasPermission } from "@/lib/permissions"
import type { Database } from "@/types/database.types"

type UserRole = Database["public"]["Enums"]["user_role_type"]

interface AnalyticsDashboardClientProps {
  userRole: UserRole
  dateRange?: "today" | "week" | "month" | "quarter" | "year"
  onDateRangeChange?: (range: string) => void
  onExport?: () => void
}

export function AnalyticsDashboardClient({
  userRole,
  dateRange = "month",
  onDateRangeChange,
  onExport,
}: AnalyticsDashboardClientProps) {
  const canExport = hasPermission(userRole, "analytics.export")

  return (
    <div className="flex items-center gap-3">
      <Select value={dateRange} onValueChange={onDateRangeChange}>
        <SelectTrigger className="w-[140px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="today">Today</SelectItem>
          <SelectItem value="week">This Week</SelectItem>
          <SelectItem value="month">This Month</SelectItem>
          <SelectItem value="quarter">This Quarter</SelectItem>
          <SelectItem value="year">This Year</SelectItem>
        </SelectContent>
      </Select>
      {canExport && onExport && (
        <Button variant="outline" onClick={onExport}>
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      )}
    </div>
  )
}