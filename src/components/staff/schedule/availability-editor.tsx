"use client"
import { useState } from "react"

import { useToast } from "@/hooks/use-toast"
import { Clock, Save } from "lucide-react"
import type { Database } from "@/types/database.types"
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Label, Switch } from "@/components/ui"
type Schedule = Database["public"]["Tables"]["staff_schedules"]["Row"]
interface AvailabilityEditorProps {
  staffId: string
  locationId: string
  existingSchedules?: Schedule[]
  onSave?: (schedules: Partial<Schedule>[]) => void
}
interface DayAvailability {
  day: string
  enabled: boolean
  startTime: string
  endTime: string
  breakStart?: string
  breakDuration?: number
}
const DAYS_OF_WEEK = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
]
export function AvailabilityEditor({
  staffId,
  locationId,
  existingSchedules = [],
  onSave,
}: AvailabilityEditorProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [copyFromDay, setCopyFromDay] = useState<string | null>(null)
  const initializeAvailability = (): DayAvailability[] => {
    return DAYS_OF_WEEK.map((day) => {
      const existing = existingSchedules.find((s) => s.day_of_week === day)
      return {
        day,
        enabled: !!existing,
        startTime: existing?.start_time || "09:00",
        endTime: existing?.end_time || "17:00",
        breakStart: existing?.break_start || "12:00",
        breakDuration: existing?.break_duration || 30,
      }
    })
  }
  const [availability, setAvailability] = useState<DayAvailability[]>(initializeAvailability())
  const handleToggleDay = (dayIndex: number) => {
    const updated = [...availability]
    updated[dayIndex].enabled = !updated[dayIndex].enabled
    setAvailability(updated)
  }
  const handleTimeChange = (
    dayIndex: number,
    field: keyof DayAvailability,
    value: string | number
  ) => {
    const updated = [...availability]
    updated[dayIndex] = { ...updated[dayIndex], [field]: value }
    setAvailability(updated)
  }
  const handleCopySchedule = (fromDayIndex: number) => {
    const sourceDay = availability[fromDayIndex]
    if (!sourceDay.enabled) {
      toast({
        title: "Cannot copy",
        description: "The selected day is not enabled.",
        variant: "destructive",
      })
      return
    }
    setCopyFromDay(sourceDay.day)
  }
  const handlePasteSchedule = (toDayIndex: number) => {
    if (!copyFromDay) return
    const sourceDay = availability.find((d) => d.day === copyFromDay)
    if (!sourceDay) return
    const updated = [...availability]
    updated[toDayIndex] = {
      ...updated[toDayIndex],
      enabled: true,
      startTime: sourceDay.startTime,
      endTime: sourceDay.endTime,
      breakStart: sourceDay.breakStart,
      breakDuration: sourceDay.breakDuration,
    }
    setAvailability(updated)
    setCopyFromDay(null)
    toast({
      title: "Schedule copied",
      description: `Schedule from ${copyFromDay} has been applied.`,
    })
  }
  const handleApplyToAll = (dayIndex: number) => {
    const sourceDay = availability[dayIndex]
    if (!sourceDay.enabled) {
      toast({
        title: "Cannot apply",
        description: "The selected day is not enabled.",
        variant: "destructive",
      })
      return
    }
    const updated = availability.map((day) => ({
      ...day,
      enabled: true,
      startTime: sourceDay.startTime,
      endTime: sourceDay.endTime,
      breakStart: sourceDay.breakStart,
      breakDuration: sourceDay.breakDuration,
    }))
    setAvailability(updated)
    toast({
      title: "Applied to all days",
      description: "The schedule has been applied to all days of the week.",
    })
  }
  const handleSave = async () => {
    setLoading(true)
    try {
      const schedulesToSave = availability
        .filter((day) => day.enabled)
        .map((day) => ({
          staff_id: staffId,
          location_id: locationId,
          day_of_week: day.day,
          start_time: day.startTime,
          end_time: day.endTime,
          break_start: day.breakStart,
          break_duration: day.breakDuration,
          is_recurring: true,
        }))
      const response = await fetch("/api/staff/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          staffId,
          locationId,
          schedules: schedulesToSave,
        }),
      })
      if (response.ok) {
        toast({
          title: "Availability saved",
          description: "Your availability has been updated successfully.",
        })
        onSave?.(schedulesToSave)
      } else {
        throw new Error("Failed to save availability")
      }
    } catch (_error) {
      toast({
        title: "Error",
        description: "Failed to save availability. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }
  const getWorkingHours = () => {
    const enabledDays = availability.filter((d) => d.enabled)
    if (enabledDays.length === 0) return "No days selected"
    const totalHours = enabledDays.reduce((sum, day) => {
      const start = new Date(`2024-01-01T${day.startTime}`)
      const end = new Date(`2024-01-01T${day.endTime}`)
      const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
      const breakHours = (day.breakDuration || 0) / 60
      return sum + hours - breakHours
    }, 0)
    return `${totalHours.toFixed(1)} hours per week`
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Availability</CardTitle>
        <CardDescription>
          Set your regular working hours for each day of the week
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="rounded-lg bg-muted p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Total Working Hours</span>
            <span className="text-sm text-muted-foreground">{getWorkingHours()}</span>
          </div>
        </div>
        <div className="space-y-4">
          {availability.map((day, index) => (
            <div
              key={day.day}
              className={`space-y-3 rounded-lg border p-4 ${
                day.enabled ? "bg-card" : "bg-muted/50"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Switch
                    checked={day.enabled}
                    onCheckedChange={() => handleToggleDay(index)}
                  />
                  <Label className="capitalize font-medium">
                    {day.day}
                  </Label>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleCopySchedule(index)}
                    disabled={!day.enabled}
                  >
                    Copy
                  </Button>
                  {copyFromDay && copyFromDay !== day.day && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handlePasteSchedule(index)}
                    >
                      Paste
                    </Button>
                  )}
                  {index === 0 && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleApplyToAll(index)}
                      disabled={!day.enabled}
                    >
                      Apply to All
                    </Button>
                  )}
                </div>
              </div>
              {day.enabled && (
                <div className="grid grid-cols-2 gap-4 pl-10">
                  <div className="space-y-2">
                    <Label className="text-sm">Start Time</Label>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <input
                        type="time"
                        value={day.startTime}
                        onChange={(e) =>
                          handleTimeChange(index, "startTime", e.target.value)
                        }
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">End Time</Label>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <input
                        type="time"
                        value={day.endTime}
                        onChange={(e) =>
                          handleTimeChange(index, "endTime", e.target.value)
                        }
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Break Start</Label>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <input
                        type="time"
                        value={day.breakStart}
                        onChange={(e) =>
                          handleTimeChange(index, "breakStart", e.target.value)
                        }
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Break Duration (minutes)</Label>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <input
                        type="number"
                        min="0"
                        max="120"
                        value={day.breakDuration}
                        onChange={(e) =>
                          handleTimeChange(index, "breakDuration", parseInt(e.target.value))
                        }
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={loading}>
            <Save className="mr-2 h-4 w-4" />
            {loading ? "Saving..." : "Save Availability"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
