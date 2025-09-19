"use client"

import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface StaffAnalyticsHeaderProps {
  selectedPeriod: string
  onPeriodChange: (value: string) => void
  comparisonMode: boolean
  onComparisonToggle: () => void
  onExport: (format: "csv" | "pdf") => void
}

export function StaffAnalyticsHeader({
  selectedPeriod,
  onPeriodChange,
  comparisonMode,
  onComparisonToggle,
  onExport
}: StaffAnalyticsHeaderProps) {
  return (
    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
      <div>
        <h3 className="text-xl font-bold">Performance Analytics</h3>
        <p className="text-sm text-muted-foreground">
          Track and analyze staff performance metrics
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Select value={selectedPeriod} onValueChange={onPeriodChange}>
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
          onClick={onComparisonToggle}
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
            <DropdownMenuItem onClick={() => onExport("csv")}>
              Export as CSV
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onExport("pdf")}>
              Export as PDF
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}