'use client'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { TimeOffFormData } from './time-off-types'

interface TimeOffFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  formData: TimeOffFormData
  onFormChange: (data: TimeOffFormData) => void
  onSubmit: () => void
}

export function TimeOffForm({ open, onOpenChange, formData, onFormChange, onSubmit }: TimeOffFormProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request Time Off</DialogTitle>
          <DialogDescription>Submit a new time off request</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <input
                type="date"
                className="w-full px-3 py-2 border rounded-md"
                value={formData.startDate}
                onChange={(e) => onFormChange({ ...formData, startDate: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="space-y-2">
              <Label>End Date</Label>
              <input
                type="date"
                className="w-full px-3 py-2 border rounded-md"
                value={formData.endDate}
                onChange={(e) => onFormChange({ ...formData, endDate: e.target.value })}
                min={formData.startDate || new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Reason</Label>
            <textarea
              className="w-full px-3 py-2 border rounded-md min-h-[100px]"
              value={formData.reason}
              onChange={(e) => onFormChange({ ...formData, reason: e.target.value })}
              placeholder="Please provide a reason for your time off request..."
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSubmit}>Submit Request</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}