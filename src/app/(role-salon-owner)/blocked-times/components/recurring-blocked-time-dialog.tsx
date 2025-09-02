'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Button,
  Input,
  Label,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Checkbox,
} from '@/components/ui'
import { createClient } from '@/lib/database/supabase/client'
import { toast } from 'sonner'
import { CalendarIcon, Clock, Repeat } from 'lucide-react'
import { addDays, addWeeks, addMonths } from 'date-fns'
import type { Database } from '@/types/database.types'

type Staff = Database['public']['Tables']['staff_profiles']['Row'] & {
  profiles?: { full_name: string | null } | null
}

interface RecurringBlockedTimeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  salonId: string
  staff?: Staff[]
}

export function RecurringBlockedTimeDialog({
  open,
  onOpenChange,
  salonId,
  staff = []
}: RecurringBlockedTimeDialogProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    reason: '',
    staffId: '',
    frequency: 'weekly',
    daysOfWeek: [] as string[]
  })

  const daysOfWeekOptions = [
    { value: '0', label: 'Sunday' },
    { value: '1', label: 'Monday' },
    { value: '2', label: 'Tuesday' },
    { value: '3', label: 'Wednesday' },
    { value: '4', label: 'Thursday' },
    { value: '5', label: 'Friday' },
    { value: '6', label: 'Saturday' },
  ]

  const handleDayToggle = (day: string) => {
    setFormData({
      ...formData,
      daysOfWeek: formData.daysOfWeek.includes(day)
        ? formData.daysOfWeek.filter(d => d !== day)
        : [...formData.daysOfWeek, day]
    })
  }

  const generateRecurringDates = () => {
    const dates: Date[] = []
    const startDate = new Date(formData.startDate)
    const endDate = new Date(formData.endDate)
    
    if (formData.frequency === 'daily') {
      let currentDate = startDate
      while (currentDate <= endDate) {
        dates.push(new Date(currentDate))
        currentDate = addDays(currentDate, 1)
      }
    } else if (formData.frequency === 'weekly') {
      let currentDate = startDate
      while (currentDate <= endDate) {
        if (formData.daysOfWeek.includes(currentDate.getDay().toString())) {
          dates.push(new Date(currentDate))
        }
        currentDate = addDays(currentDate, 1)
      }
    } else if (formData.frequency === 'monthly') {
      let currentDate = startDate
      while (currentDate <= endDate) {
        dates.push(new Date(currentDate))
        currentDate = addMonths(currentDate, 1)
      }
    }
    
    return dates
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.startDate || !formData.endDate || !formData.startTime || !formData.endTime) {
      toast.error('Please fill in all required fields')
      return
    }

    if (formData.frequency === 'weekly' && formData.daysOfWeek.length === 0) {
      toast.error('Please select at least one day of the week')
      return
    }

    setLoading(true)
    
    try {
      const supabase = createClient()
      const dates = generateRecurringDates()
      
      const blockedTimes = dates.map(date => ({
        salon_id: salonId,
        staff_id: formData.staffId || null,
        start_datetime: new Date(`${date.toISOString().split('T')[0]}T${formData.startTime}`).toISOString(),
        end_datetime: new Date(`${date.toISOString().split('T')[0]}T${formData.endTime}`).toISOString(),
        reason: formData.reason || null,
        created_by: ''
      }))
      
      const user = await supabase.auth.getUser()
      blockedTimes.forEach(bt => bt.created_by = user.data.user?.id || '')
      
      const { error } = await supabase
        .from('blocked_times')
        .insert(blockedTimes)
      
      if (error) throw error
      
      toast.success(`Created ${blockedTimes.length} recurring blocked times`)
      onOpenChange(false)
      router.refresh()
      
      // Reset form
      setFormData({
        startDate: '',
        endDate: '',
        startTime: '',
        endTime: '',
        reason: '',
        staffId: '',
        frequency: 'weekly',
        daysOfWeek: []
      })
    } catch (error) {
      console.error('Error creating recurring blocked times:', error)
      toast.error('Failed to create recurring blocked times')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Recurring Blocked Time</DialogTitle>
          <DialogDescription>
            Set up recurring blocked times for regular events
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="pl-10"
                  required
                />
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="frequency">Frequency</Label>
              <Select 
                value={formData.frequency}
                onValueChange={(value) => setFormData({ ...formData, frequency: value })}
              >
                <SelectTrigger id="frequency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="staff">Staff (Optional)</Label>
              <Select 
                value={formData.staffId}
                onValueChange={(value) => setFormData({ ...formData, staffId: value })}
              >
                <SelectTrigger id="staff">
                  <SelectValue placeholder="All staff" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All staff</SelectItem>
                  {staff.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.profiles?.full_name || `Staff ${s.employee_id}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {formData.frequency === 'weekly' && (
            <div className="space-y-2">
              <Label>Days of Week</Label>
              <div className="grid grid-cols-7 gap-2">
                {daysOfWeekOptions.map((day) => (
                  <div key={day.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={day.value}
                      checked={formData.daysOfWeek.includes(day.value)}
                      onCheckedChange={() => handleDayToggle(day.value)}
                    />
                    <Label
                      htmlFor={day.value}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {day.label.slice(0, 3)}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="endTime">End Time</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="pl-10"
                  required
                />
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="reason">Reason (Optional)</Label>
            <Textarea
              id="reason"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder="e.g., Lunch break, Team meeting, Training"
              rows={3}
            />
          </div>
          
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              <Repeat className="h-4 w-4 mr-2" />
              {loading ? 'Creating...' : 'Create Recurring Blocks'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}