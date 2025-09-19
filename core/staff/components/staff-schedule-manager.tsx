"use client"

import { useState, useTransition, useOptimistic, useMemo } from "react"
import {
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  Plus,
  Edit,
  Trash2,
  Copy,
  CalendarRange,
  AlertCircle,
  Check,
  X,
  Coffee,
  Pause,
  Play,
  Settings,
  RefreshCw
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { format, startOfWeek, addDays, addWeeks, subWeeks, isSameDay, isWithinInterval, parseISO } from "date-fns"
import { updateStaffScheduleAction, createTimeOffRequestAction } from "../actions"
import type { StaffProfile, StaffSchedule } from "../dal/staff-types"

interface StaffScheduleManagerProps {
  staff: StaffProfile[]
  salonId?: string
  onScheduleUpdate?: () => void
}

interface TimeSlot {
  id: string
  staffId: string
  staffName: string
  date: Date
  startTime: string
  endTime: string
  type: "work" | "break" | "time-off" | "appointment"
  status?: "confirmed" | "pending" | "cancelled"
  note?: string
}

interface ScheduleConflict {
  staffId: string
  date: Date
  message: string
  severity: "error" | "warning"
}

export function StaffScheduleManager({
  staff,
  salonId,
  onScheduleUpdate
}: StaffScheduleManagerProps) {
  const [isPending, startTransition] = useTransition()
  const [viewMode, setViewMode] = useState<"week" | "month">("week")
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedStaff, setSelectedStaff] = useState<string>("all")
  const [showScheduleDialog, setShowScheduleDialog] = useState(false)
  const [showTimeOffDialog, setShowTimeOffDialog] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState<any>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  // Calculate week start
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  // Filter staff based on selection
  const displayedStaff = selectedStaff === "all"
    ? staff
    : staff.filter(s => s.id === selectedStaff)

  // Mock schedule data (replace with actual data from server)
  const [scheduleData, setScheduleData] = useState<TimeSlot[]>([
    {
      id: "1",
      staffId: staff[0]?.id || "",
      staffName: staff[0]?.display_name || "",
      date: weekDays[0],
      startTime: "09:00",
      endTime: "17:00",
      type: "work"
    },
    {
      id: "2",
      staffId: staff[0]?.id || "",
      staffName: staff[0]?.display_name || "",
      date: weekDays[0],
      startTime: "12:00",
      endTime: "13:00",
      type: "break"
    }
  ])

  // Detect conflicts
  const conflicts = useMemo(() => {
    const detected: ScheduleConflict[] = []

    // Check for overlapping schedules
    scheduleData.forEach((slot, index) => {
      scheduleData.slice(index + 1).forEach(otherSlot => {
        if (
          slot.staffId === otherSlot.staffId &&
          isSameDay(slot.date, otherSlot.date) &&
          slot.type === "work" &&
          otherSlot.type === "work"
        ) {
          // Check time overlap
          if (
            (slot.startTime <= otherSlot.startTime && slot.endTime > otherSlot.startTime) ||
            (otherSlot.startTime <= slot.startTime && otherSlot.endTime > slot.startTime)
          ) {
            detected.push({
              staffId: slot.staffId,
              date: slot.date,
              message: `${slot.staffName} has overlapping schedules`,
              severity: "error"
            })
          }
        }
      })
    })

    return detected
  }, [scheduleData])

  // Navigate weeks
  const handlePreviousWeek = () => {
    setCurrentDate(prev => subWeeks(prev, 1))
  }

  const handleNextWeek = () => {
    setCurrentDate(prev => addWeeks(prev, 1))
  }

  const handleToday = () => {
    setCurrentDate(new Date())
  }

  // Handle schedule updates
  const handleScheduleUpdate = async (staffId: string, schedule: any) => {
    startTransition(async () => {
      const result = await updateStaffScheduleAction(staffId, schedule)
      if (result.success) {
        toast.success("Schedule updated successfully")
        onScheduleUpdate?.()
      } else {
        toast.error(result.error || "Failed to update schedule")
      }
    })
  }

  // Handle drag and drop
  const handleDragStart = (e: React.DragEvent, slot: TimeSlot) => {
    e.dataTransfer.setData("slot", JSON.stringify(slot))
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, date: Date, staffId: string) => {
    e.preventDefault()
    const slotData = JSON.parse(e.dataTransfer.getData("slot"))

    // Update the schedule
    setScheduleData(prev => prev.map(slot =>
      slot.id === slotData.id
        ? { ...slot, date, staffId }
        : slot
    ))

    toast.success("Schedule updated")
  }

  // Copy schedule
  const handleCopyWeek = (staffId: string) => {
    const staffSchedules = scheduleData.filter(s => s.staffId === staffId && s.type === "work")

    // Copy to next week
    const newSchedules = staffSchedules.map(schedule => ({
      ...schedule,
      id: `${schedule.id}-copy-${Date.now()}`,
      date: addWeeks(schedule.date, 1)
    }))

    setScheduleData(prev => [...prev, ...newSchedules])
    toast.success("Schedule copied to next week")
  }

  // Schedule pattern dialog
  const SchedulePatternDialog = () => (
    <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Set Recurring Schedule</DialogTitle>
          <DialogDescription>
            Define a weekly schedule pattern that repeats automatically
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Staff Member</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select staff" />
                </SelectTrigger>
                <SelectContent>
                  {staff.map(member => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.display_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Pattern Type</Label>
              <Select defaultValue="weekly">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="biweekly">Bi-weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Weekly Schedule Grid */}
          <div className="space-y-2">
            <Label>Weekly Schedule</Label>
            <div className="border rounded-lg p-4 space-y-2">
              {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(day => (
                <div key={day} className="flex items-center gap-4">
                  <Switch id={day.toLowerCase()} />
                  <Label htmlFor={day.toLowerCase()} className="w-24">
                    {day}
                  </Label>
                  <Input type="time" defaultValue="09:00" className="w-32" />
                  <span>to</span>
                  <Input type="time" defaultValue="17:00" className="w-32" />
                  <Button variant="outline" size="sm">
                    <Plus className="h-3 w-3 mr-1" />
                    Break
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Start Date</Label>
              <Input type="date" />
            </div>
            <div>
              <Label>End Date (Optional)</Label>
              <Input type="date" />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setShowScheduleDialog(false)}>
            Cancel
          </Button>
          <Button onClick={() => {
            setShowScheduleDialog(false)
            toast.success("Recurring schedule created")
          }}>
            Apply Schedule
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )

  // Time-off request dialog
  const TimeOffRequestDialog = () => (
    <Dialog open={showTimeOffDialog} onOpenChange={setShowTimeOffDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request Time Off</DialogTitle>
          <DialogDescription>
            Submit a time-off request for approval
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Staff Member</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select staff" />
              </SelectTrigger>
              <SelectContent>
                {staff.map(member => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.display_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Start Date</Label>
              <Input type="date" />
            </div>
            <div>
              <Label>End Date</Label>
              <Input type="date" />
            </div>
          </div>

          <div>
            <Label>Type</Label>
            <Select defaultValue="vacation">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vacation">Vacation</SelectItem>
                <SelectItem value="sick">Sick Leave</SelectItem>
                <SelectItem value="personal">Personal</SelectItem>
                <SelectItem value="training">Training</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Reason / Notes</Label>
            <Textarea placeholder="Optional notes..." />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setShowTimeOffDialog(false)}>
            Cancel
          </Button>
          <Button onClick={() => {
            setShowTimeOffDialog(false)
            toast.success("Time-off request submitted")
          }}>
            Submit Request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePreviousWeek}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              onClick={handleToday}
            >
              Today
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleNextWeek}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="text-lg font-semibold">
            {viewMode === "week"
              ? `Week of ${format(weekStart, "MMM d, yyyy")}`
              : format(currentDate, "MMMM yyyy")
            }
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Select value={selectedStaff} onValueChange={setSelectedStaff}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Staff</SelectItem>
              {staff.map(member => (
                <SelectItem key={member.id} value={member.id}>
                  {member.display_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)}>
            <TabsList>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
            </TabsList>
          </Tabs>

          <Button
            variant="outline"
            onClick={() => setShowScheduleDialog(true)}
          >
            <CalendarRange className="h-4 w-4 mr-2" />
            Set Pattern
          </Button>

          <Button onClick={() => setShowTimeOffDialog(true)}>
            <Coffee className="h-4 w-4 mr-2" />
            Time Off
          </Button>
        </div>
      </div>

      {/* Conflict Alerts */}
      {conflicts.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {conflicts.length} scheduling conflict{conflicts.length > 1 ? "s" : ""} detected.
            Please review and resolve.
          </AlertDescription>
        </Alert>
      )}

      {/* Schedule Grid */}
      <Card>
        <CardContent className="p-0">
          <ScrollArea className="h-[600px]">
            <div className="min-w-[800px]">
              {/* Header Row */}
              <div className="grid grid-cols-8 border-b bg-muted/50">
                <div className="p-3 font-medium">Staff</div>
                {weekDays.map(day => (
                  <div
                    key={day.toISOString()}
                    className={`p-3 text-center border-l ${
                      isSameDay(day, new Date())
                        ? "bg-primary/10 font-semibold"
                        : ""
                    }`}
                  >
                    <div className="text-sm text-muted-foreground">
                      {format(day, "EEE")}
                    </div>
                    <div className="text-lg">
                      {format(day, "d")}
                    </div>
                  </div>
                ))}
              </div>

              {/* Staff Rows */}
              {displayedStaff.map(member => (
                <div key={member.id} className="grid grid-cols-8 border-b hover:bg-muted/20">
                  <div className="p-3 flex items-start gap-2">
                    <div>
                      <p className="font-medium">{member.display_name}</p>
                      <p className="text-xs text-muted-foreground">{member.title}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Badge
                          variant={member.status === "available" ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {member.status}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5"
                          onClick={() => handleCopyWeek(member.id)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {weekDays.map(day => {
                    const daySlots = scheduleData.filter(
                      s => s.staffId === member.id && isSameDay(s.date, day)
                    )
                    const workSlot = daySlots.find(s => s.type === "work")
                    const breaks = daySlots.filter(s => s.type === "break")
                    const timeOff = daySlots.find(s => s.type === "time-off")

                    return (
                      <div
                        key={day.toISOString()}
                        className={`p-2 border-l min-h-[100px] ${
                          isSameDay(day, new Date()) ? "bg-primary/5" : ""
                        }`}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, day, member.id)}
                      >
                        {timeOff ? (
                          <div className="bg-gray-100 dark:bg-gray-800 rounded p-2 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">Time Off</span>
                              <X className="h-3 w-3 cursor-pointer" />
                            </div>
                          </div>
                        ) : workSlot ? (
                          <div
                            className="bg-green-100 dark:bg-green-900/30 rounded p-2 text-xs cursor-move"
                            draggable
                            onDragStart={(e) => handleDragStart(e, workSlot)}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium">
                                {workSlot.startTime} - {workSlot.endTime}
                              </span>
                              <Edit className="h-3 w-3 cursor-pointer" />
                            </div>
                            {breaks.map(breakSlot => (
                              <div
                                key={breakSlot.id}
                                className="bg-yellow-100 dark:bg-yellow-900/30 rounded px-1 py-0.5 mt-1"
                              >
                                Break: {breakSlot.startTime} - {breakSlot.endTime}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div
                            className="h-full flex items-center justify-center text-muted-foreground/50 hover:bg-muted/50 rounded cursor-pointer"
                            onClick={() => {
                              setSelectedDate(day)
                              setEditingSchedule({ staffId: member.id, date: day })
                            }}
                          >
                            <Plus className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {displayedStaff.reduce((acc, s) => acc + 40, 0)}
            </div>
            <p className="text-xs text-muted-foreground">This week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Coverage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">92%</div>
            <p className="text-xs text-muted-foreground">All shifts covered</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Time-Off Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Pending approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Overtime</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12h</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      {/* Dialogs */}
      <SchedulePatternDialog />
      <TimeOffRequestDialog />
    </div>
  )
}