'use client'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScheduleFormData } from '@/types/features/schedule-types'

interface ScheduleFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  formData: ScheduleFormData
  onFormChange: (data: ScheduleFormData) => void
  onSave: () => void
}

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export function ScheduleForm({ open, onOpenChange, formData, onFormChange, onSave }: ScheduleFormProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Set Working Hours</DialogTitle>
          <DialogDescription>Define your regular working hours</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Day of Week</Label>
            <Select 
              value={formData.dayOfWeek.toString()}
              onValueChange={(value) => onFormChange({ ...formData, dayOfWeek: parseInt(value) })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {dayNames.map((day, index) => (
                  <SelectItem key={index} value={index.toString()}>
                    {day}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Time</Label>
              <input
                type="time"
                className="w-full px-3 py-2 border rounded-md"
                value={formData.startTime}
                onChange={(e) => onFormChange({ ...formData, startTime: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>End Time</Label>
              <input
                type="time"
                className="w-full px-3 py-2 border rounded-md"
                value={formData.endTime}
                onChange={(e) => onFormChange({ ...formData, endTime: e.target.value })}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSave}>Save Schedule</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}