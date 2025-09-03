"use client"
import { useState } from "react"
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Label,
  Textarea,
  Calendar,
  RadioGroup,
  RadioGroupItem,
  Alert,
  AlertDescription
} from "@/components/ui"

import { useToast } from "@/hooks/use-toast"
import { format, differenceInDays, isWeekend, eachDayOfInterval } from "date-fns"
import { CalendarDays, AlertCircle, Clock, Send } from "lucide-react"
import type { Database } from "@/types/database.types"
type TimeOffRequest = Database["public"]["Tables"]["time_off_requests"]["Insert"]
interface TimeOffRequestFormProps {
  staffId: string
  locationId: string
  availableBalance?: {
    vacation: number
    sick: number
    personal: number
  }
  onSubmit?: (request: TimeOffRequest) => void
}
export function TimeOffRequestForm({
  staffId,
  locationId,
  availableBalance = { vacation: 10, sick: 5, personal: 3 },
  onSubmit,
}: TimeOffRequestFormProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined
    to: Date | undefined
  }>({
    from: undefined,
    to: undefined,
  })
  const [requestType, setRequestType] = useState<"vacation" | "sick" | "personal">("vacation")
  const [reason, setReason] = useState("")
  const [conflicts, setConflicts] = useState<string[]>([])
  const handleDateSelect = (dates: { from?: Date; to?: Date } | undefined) => {
    if (dates) {
      setDateRange(dates)
      if (dates.from && dates.to) {
        checkConflicts(dates.from, dates.to)
      }
    }
  }
  const checkConflicts = async (startDate: Date, endDate: Date) => {
    try {
      const response = await fetch(
        `/api/staff/schedule-conflicts?staffId=${staffId}&start=${startDate.toISOString()}&end=${endDate.toISOString()}`
      )
      if (response.ok) {
        const data = await response.json()
        setConflicts(data.conflicts || [])
      }
    } catch (_error) {
    }
  }
  const calculateBusinessDays = (start: Date, end: Date): number => {
    const days = eachDayOfInterval({ start, end })
    return days.filter((day) => !isWeekend(day)).length
  }
  const handleSubmit = async () => {
    if (!dateRange.from || !dateRange.to) {
      toast({
        title: "Invalid dates",
        description: "Please select both start and end dates.",
        variant: "destructive",
      })
      return
    }
    if (!reason.trim()) {
      toast({
        title: "Reason required",
        description: "Please provide a reason for your time off request.",
        variant: "destructive",
      })
      return
    }
    const businessDays = calculateBusinessDays(dateRange.from, dateRange.to)
    const currentBalance = availableBalance[requestType]
    if (businessDays > currentBalance) {
      toast({
        title: "Insufficient balance",
        description: `You only have ${currentBalance} ${requestType} days available.`,
        variant: "destructive",
      })
      return
    }
    setLoading(true)
    try {
      const timeOffRequest: TimeOffRequest = {
        staff_id: staffId,
        location_id: locationId,
        start_date: format(dateRange.from, "yyyy-MM-dd"),
        end_date: format(dateRange.to, "yyyy-MM-dd"),
        reason,
        request_type: requestType,
        status: "pending",
        created_at: new Date().toISOString(),
      }
      const response = await fetch("/api/time-off/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(timeOffRequest),
      })
      if (response.ok) {
        toast({
          title: "Request submitted",
          description: "Your time off request has been submitted for approval.",
        })
        onSubmit?.(timeOffRequest)
        // Reset form
        setDateRange({ from: undefined, to: undefined })
        setReason("")
        setConflicts([])
      } else {
        throw new Error("Failed to submit request")
      }
    } catch (_error) {
      toast({
        title: "Error",
        description: "Failed to submit time off request. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }
  const totalDays = dateRange.from && dateRange.to
    ? differenceInDays(dateRange.to, dateRange.from) + 1
    : 0
  const businessDays = dateRange.from && dateRange.to
    ? calculateBusinessDays(dateRange.from, dateRange.to)
    : 0
  return (
    <Card>
      <CardHeader>
        <CardTitle>Request Time Off</CardTitle>
        <CardDescription>
          Submit a request for vacation, sick leave, or personal time
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Request Type</Label>
          <RadioGroup value={requestType} onValueChange={(v) => setRequestType(v as typeof requestType)}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="vacation" id="vacation" />
              <Label htmlFor="vacation" className="flex items-center gap-2 cursor-pointer">
                Vacation
                <span className="text-sm text-muted-foreground">
                  ({availableBalance.vacation} days available)
                </span>
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="sick" id="sick" />
              <Label htmlFor="sick" className="flex items-center gap-2 cursor-pointer">
                Sick Leave
                <span className="text-sm text-muted-foreground">
                  ({availableBalance.sick} days available)
                </span>
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="personal" id="personal" />
              <Label htmlFor="personal" className="flex items-center gap-2 cursor-pointer">
                Personal Time
                <span className="text-sm text-muted-foreground">
                  ({availableBalance.personal} days available)
                </span>
              </Label>
            </div>
          </RadioGroup>
        </div>
        <div className="space-y-2">
          <Label>Select Dates</Label>
          <div className="rounded-lg border p-4">
            <Calendar
              mode="range"
              selected={dateRange}
              onSelect={handleDateSelect}
              disabled={(date) => date < new Date()}
              className="rounded-md"
            />
          </div>
          {dateRange.from && dateRange.to && (
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <CalendarDays className="h-4 w-4" />
                <span>{totalDays} total days</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{businessDays} business days</span>
              </div>
            </div>
          )}
        </div>
        {conflicts.length > 0 && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Schedule Conflicts:</strong>
              <ul className="mt-2 list-disc list-inside">
                {conflicts.map((conflict, index) => (
                  <li key={index}>{conflict}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}
        <div className="space-y-2">
          <Label htmlFor="reason">Reason</Label>
          <Textarea
            id="reason"
            placeholder="Please provide a reason for your time off request..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
          />
        </div>
        {dateRange.from && dateRange.to && (
          <div className="rounded-lg bg-muted p-4 space-y-2">
            <h4 className="font-medium">Request Summary</h4>
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type:</span>
                <span className="capitalize">{requestType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Start Date:</span>
                <span>{format(dateRange.from, "PPP")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">End Date:</span>
                <span>{format(dateRange.to, "PPP")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Business Days:</span>
                <span>{businessDays}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Remaining Balance:</span>
                <span className={availableBalance[requestType] - businessDays < 0 ? "text-destructive" : ""}>
                  {availableBalance[requestType] - businessDays} days
                </span>
              </div>
            </div>
          </div>
        )}
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setDateRange({ from: undefined, to: undefined })
              setReason("")
              setConflicts([])
            }}
          >
            Clear
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || !dateRange.from || !dateRange.to || !reason.trim()}
          >
            <Send className="mr-2 h-4 w-4" />
            {loading ? "Submitting..." : "Submit Request"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
