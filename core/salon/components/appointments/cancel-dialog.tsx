'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

interface AppointmentCancelDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCancel: (reason: string) => Promise<void>
  isLoading: boolean
}

export function AppointmentCancelDialog({
  open,
  onOpenChange,
  onCancel,
  isLoading
}: AppointmentCancelDialogProps) {
  const [cancellationReason, setCancellationReason] = useState('')

  const handleCancel = async () => {
    await onCancel(cancellationReason)
    setCancellationReason('')
  }

  const handleClose = () => {
    onOpenChange(false)
    setCancellationReason('')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancel Appointment</DialogTitle>
          <DialogDescription>
            Please provide a reason for cancelling this appointment.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Textarea
            placeholder="Cancellation reason..."
            value={cancellationReason}
            onChange={(e) => setCancellationReason(e.target.value)}
            className="resize-none"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Keep Appointment
          </Button>
          <Button
            variant="destructive"
            onClick={handleCancel}
            disabled={!cancellationReason.trim() || isLoading}
          >
            Cancel Appointment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}