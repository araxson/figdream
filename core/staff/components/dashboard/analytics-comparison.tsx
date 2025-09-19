"use client"

import { BarChart3 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import type { PerformanceMetric } from "./types"

interface StaffAnalyticsComparisonProps {
  performanceData: PerformanceMetric[]
  selectedStaffIds: string[]
  onStaffSelectionChange: (ids: string[]) => void
}

export function StaffAnalyticsComparison({
  performanceData,
  selectedStaffIds,
  onStaffSelectionChange
}: StaffAnalyticsComparisonProps) {
  const handleStaffToggle = (staffId: string) => {
    if (selectedStaffIds.includes(staffId)) {
      onStaffSelectionChange(selectedStaffIds.filter(id => id !== staffId))
    } else {
      onStaffSelectionChange([...selectedStaffIds, staffId])
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Performance Comparison</CardTitle>
          <CardDescription>Compare staff members across different metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-4">
              {performanceData.map((staff) => (
                <div key={staff.staffId} className="flex items-center space-x-2">
                  <Checkbox
                    id={staff.staffId}
                    checked={selectedStaffIds.includes(staff.staffId)}
                    onCheckedChange={() => handleStaffToggle(staff.staffId)}
                  />
                  <Label htmlFor={staff.staffId}>{staff.staffName}</Label>
                </div>
              ))}
            </div>

            {/* Comparison Chart Placeholder */}
            <div className="h-[400px] flex items-center justify-center border-2 border-dashed rounded-lg">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">Comparison chart visualization</p>
                {selectedStaffIds.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Select staff members to compare</p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Comparing {selectedStaffIds.length} staff members
                  </p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metric Comparison Cards */}
      {selectedStaffIds.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {["Revenue", "Appointments", "Rating", "Utilization", "Tips", "Rebook Rate"].map((metric) => (
            <Card key={metric}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{metric} Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {performanceData
                    .filter(p => selectedStaffIds.includes(p.staffId))
                    .map(staff => {
                      const value = getMetricValue(staff, metric)
                      return (
                        <div key={staff.staffId} className="flex justify-between items-center">
                          <span className="text-sm">{staff.staffName}</span>
                          <span className="text-sm font-bold">
                            {formatMetricValue(value, metric)}
                          </span>
                        </div>
                      )
                    })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  )
}

function getMetricValue(staff: PerformanceMetric, metric: string): number {
  switch (metric) {
    case "Revenue": return staff.revenue
    case "Appointments": return staff.appointments
    case "Rating": return staff.rating
    case "Utilization": return staff.utilization
    case "Tips": return staff.tips
    case "Rebook Rate": return staff.rebookRate
    default: return 0
  }
}

function formatMetricValue(value: number, metric: string): string {
  switch (metric) {
    case "Revenue":
    case "Tips":
      return `$${value.toLocaleString()}`
    case "Rating":
      return value.toFixed(1)
    case "Utilization":
    case "Rebook Rate":
      return `${value.toFixed(0)}%`
    default:
      return value.toString()
  }
}