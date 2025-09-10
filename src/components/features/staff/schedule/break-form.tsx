'use client'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { BreakFormData } from './schedule-types'

interface BreakFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  formData: BreakFormData
  onFormChange: (data: BreakFormData) => void
  onSave: () => void
}

export function BreakForm({ open, onOpenChange, formData, onFormChange, onSave }: BreakFormProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Break</DialogTitle>
          <DialogDescription>Schedule a break for a specific day</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Date</Label>
            <input
              type="date"
              className="w-full px-3 py-2 border rounded-md"
              value={formData.breakDate}
              onChange={(e) => onFormChange({ ...formData, breakDate: e.target.value })}
            />
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
          <Button onClick={onSave}>Add Break</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}