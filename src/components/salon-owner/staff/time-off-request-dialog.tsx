'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Button,
  Calendar,
  Label,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui'
import { toast } from 'sonner'
import { Loader2, CalendarDays } from 'lucide-react'
import { format, differenceInDays } from 'date-fns'
interface TimeOffRequestDialogProps {
  children?: React.ReactNode
  staffId?: string
  onSuccess?: () => void
}
export default function TimeOffRequestDialog({ 
  children, 
  staffId,
  onSuccess 
}: TimeOffRequestDialogProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [requestType, setRequestType] = useState<string>('vacation')
  const [reason, setReason] = useState('')
  const handleSubmit = async () => {
    if (!startDate || !endDate) {
      toast.error('Please select both start and end dates')
      return
    }
    if (endDate < startDate) {
      toast.error('End date must be after start date')
      return
    }
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/timeoff/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          staff_id: staffId,
          start_date: format(startDate, 'yyyy-MM-dd'),
          end_date: format(endDate, 'yyyy-MM-dd'),
          request_type: requestType,
          reason: reason.trim(),
          status: 'pending'
        }),
      })
      if (!response.ok) {
        throw new Error('Failed to submit request')
      }
      toast.success('Time-off request submitted successfully')
      setIsOpen(false)
      // Reset form
      setStartDate(undefined)
      setEndDate(undefined)
      setRequestType('vacation')
      setReason('')
      if (onSuccess) {
        onSuccess()
      } else {
        router.refresh()
      }
    } catch (_error) {
      toast.error('Failed to submit request. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }
  const getDaysCount = () => {
    if (!startDate || !endDate) return 0
    return differenceInDays(endDate, startDate) + 1
  }
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button>
            <CalendarDays className="h-4 w-4 mr-2" />
            Request Time Off
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Request Time Off</DialogTitle>
          <DialogDescription>
            Submit a time-off request for approval
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {/* Request Type */}
          <div className="space-y-2">
            <Label htmlFor="type">Request Type</Label>
            <Select value={requestType} onValueChange={setRequestType}>
              <SelectTrigger id="type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vacation">Vacation</SelectItem>
                <SelectItem value="sick">Sick Leave</SelectItem>
                <SelectItem value="personal">Personal Leave</SelectItem>
                <SelectItem value="emergency">Emergency Leave</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* Date Selection */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={setStartDate}
                disabled={(date) => date < new Date()}
                initialFocus
                className="rounded-md border"
              />
            </div>
            <div className="space-y-2">
              <Label>End Date</Label>
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={setEndDate}
                disabled={(date) => date < (startDate || new Date())}
                className="rounded-md border"
              />
            </div>
          </div>
          {/* Days Count */}
          {startDate && endDate && (
            <div className="bg-muted p-3 rounded-lg">
              <p className="text-sm">
                <span className="font-medium">Total Days:</span> {getDaysCount()} day(s)
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {format(startDate, 'MMM dd, yyyy')} - {format(endDate, 'MMM dd, yyyy')}
              </p>
            </div>
          )}
          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">
              Reason / Notes (Optional)
            </Label>
            <Textarea
              id="reason"
              placeholder="Provide additional details about your time-off request..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!startDate || !endDate || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Request'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}