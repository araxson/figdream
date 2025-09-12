'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Calendar, CalendarOff } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface TimeOffRequestFormProps {
  staffId: string
}

export function TimeOffRequestForm({ staffId }: TimeOffRequestFormProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [reason, setReason] = useState('')
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!startDate || !endDate || !reason) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive',
      })
      return
    }
    
    if (new Date(endDate) < new Date(startDate)) {
      toast({
        title: 'Error',
        description: 'End date must be after start date',
        variant: 'destructive',
      })
      return
    }
    
    setLoading(true)
    
    try {
      const response = await fetch('/api/staff/time-off', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          staff_id: staffId,
          start_date: startDate,
          end_date: endDate,
          reason,
        }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to submit time off request')
      }
      
      toast({
        title: 'Success',
        description: 'Time off request submitted successfully',
      })
      
      setOpen(false)
      setStartDate('')
      setEndDate('')
      setReason('')
      router.refresh()
    } catch (error) {
      console.error('Error submitting time off request:', error)
      toast({
        title: 'Error',
        description: 'Failed to submit time off request',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <CalendarOff className="mr-2 h-4 w-4" />
          Request Time Off
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Request Time Off</DialogTitle>
            <DialogDescription>
              Submit a request for time off. Your manager will review and approve it.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="start-date" className="text-right">
                Start Date
              </Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="end-date" className="text-right">
                End Date
              </Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="reason" className="text-right">
                Reason
              </Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Please provide a reason for your time off request"
                className="col-span-3"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Request'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}