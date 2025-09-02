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
} from '@/components/ui'
import { createClient } from '@/lib/database/supabase/client'
import { toast } from 'sonner'
import { CalendarIcon, Clock } from 'lucide-react'
import type { Database } from '@/types/database.types'

type Staff = Database['public']['Tables']['staff_profiles']['Row'] & {
  profiles?: { full_name: string | null } | null
}

interface CreateBlockedTimeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  salonId: string
  staff?: Staff[]
}

export function CreateBlockedTimeDialog({
  open,
  onOpenChange,
  salonId,
  staff = []
}: CreateBlockedTimeDialogProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    date: '',
    startTime: '',
    endTime: '',
    reason: '',
    staffId: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.date || !formData.startTime || !formData.endTime) {
      toast.error('Please fill in all required fields')
      return
    }

    setLoading(true)
    
    try {
      const supabase = createClient()
      
      const startDatetime = new Date(`${formData.date}T${formData.startTime}`)
      const endDatetime = new Date(`${formData.date}T${formData.endTime}`)
      
      const { error } = await supabase
        .from('blocked_times')
        .insert({
          salon_id: salonId,
          staff_id: formData.staffId || null,
          start_datetime: startDatetime.toISOString(),
          end_datetime: endDatetime.toISOString(),
          reason: formData.reason || null,
          created_by: (await supabase.auth.getUser()).data.user?.id || ''
        })
      
      if (error) throw error
      
      toast.success('Blocked time created successfully')
      onOpenChange(false)
      router.refresh()
      
      // Reset form
      setFormData({
        date: '',
        startTime: '',
        endTime: '',
        reason: '',
        staffId: ''
      })
    } catch (error) {
      console.error('Error creating blocked time:', error)
      toast.error('Failed to create blocked time')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Blocked Time</DialogTitle>
          <DialogDescription>
            Block out time when services cannot be booked
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="pl-10"
                  required
                />
              </div>
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
              placeholder="e.g., Holiday, Staff meeting, Maintenance"
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
              {loading ? 'Creating...' : 'Create Blocked Time'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}