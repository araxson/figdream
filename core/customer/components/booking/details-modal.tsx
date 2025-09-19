'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { AlertCircle } from 'lucide-react'
import type { BookingDetailsModalProps } from '../booking-utils/booking-manager-types'
import { formatDateTime } from '../booking-utils/booking-manager-helpers'

interface CancelDialogProps extends BookingDetailsModalProps {
  type: 'cancel' | 'notes'
}

export function BookingCancelDialog({
  booking,
  open,
  onClose,
  onUpdate
}: BookingDetailsModalProps) {
  const [cancelReason, setCancelReason] = useState('')

  const handleCancel = () => {
    onUpdate()
    onClose()
    setCancelReason('')
  }

  if (!booking) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancel Booking</DialogTitle>
          <DialogDescription>
            Are you sure you want to cancel this booking? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="reason">Cancellation Reason</Label>
            <Textarea
              id="reason"
              placeholder="Please provide a reason for cancellation..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            />
          </div>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Booking: {booking.confirmation_code}<br />
              Customer: {booking.customerName}<br />
              Date: {formatDateTime(booking.start_time!).date} at {formatDateTime(booking.start_time!).time}
            </AlertDescription>
          </Alert>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Keep Booking
          </Button>
          <Button variant="destructive" onClick={handleCancel}>
            Cancel Booking
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function BookingNotesDialog({
  booking,
  open,
  onClose,
  onUpdate
}: BookingDetailsModalProps) {
  const [internalNotes, setInternalNotes] = useState('')

  const handleSave = () => {
    onUpdate()
    onClose()
    setInternalNotes('')
  }

  if (!booking) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Notes</DialogTitle>
          <DialogDescription>
            Add internal notes for this booking. These notes are only visible to staff.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="notes">Internal Notes</Label>
            <Textarea
              id="notes"
              placeholder="Add any internal notes about this booking..."
              rows={5}
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Notes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}