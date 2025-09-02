'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Label,
  Textarea
} from '@/components/ui'
import { toast } from 'sonner'
import { Check, X, Loader2 } from 'lucide-react'

interface TimeOffApprovalActionsProps {
  requestId: string
  onApproval?: () => void
  onDenial?: () => void
}

export default function TimeOffApprovalActions({
  requestId,
  onApproval,
  onDenial
}: TimeOffApprovalActionsProps) {
  const router = useRouter()
  const [isApproving, setIsApproving] = useState(false)
  const [isDenying, setIsDenying] = useState(false)
  const [showDenialDialog, setShowDenialDialog] = useState(false)
  const [denialReason, setDenialReason] = useState('')

  const handleApprove = async () => {
    setIsApproving(true)

    try {
      const response = await fetch(`/api/timeoff/requests/${requestId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to approve request')
      }

      toast.success('Time-off request approved')
      
      if (onApproval) {
        onApproval()
      } else {
        router.refresh()
      }
    } catch (error) {
      console.error('Error approving request:', error)
      toast.error('Failed to approve request. Please try again.')
    } finally {
      setIsApproving(false)
    }
  }

  const handleDeny = async () => {
    if (!denialReason.trim()) {
      toast.error('Please provide a reason for denial')
      return
    }

    setIsDenying(true)

    try {
      const response = await fetch(`/api/timeoff/requests/${requestId}/deny`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          denial_reason: denialReason.trim()
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to deny request')
      }

      toast.success('Time-off request denied')
      setShowDenialDialog(false)
      setDenialReason('')
      
      if (onDenial) {
        onDenial()
      } else {
        router.refresh()
      }
    } catch (error) {
      console.error('Error denying request:', error)
      toast.error('Failed to deny request. Please try again.')
    } finally {
      setIsDenying(false)
    }
  }

  return (
    <>
      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={handleApprove}
          disabled={isApproving || isDenying}
        >
          {isApproving ? (
            <>
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              Approving...
            </>
          ) : (
            <>
              <Check className="h-4 w-4 mr-1" />
              Approve
            </>
          )}
        </Button>
        <Button
          size="sm"
          variant="destructive"
          onClick={() => setShowDenialDialog(true)}
          disabled={isApproving || isDenying}
        >
          <X className="h-4 w-4 mr-1" />
          Deny
        </Button>
      </div>

      {/* Denial Reason Dialog */}
      <Dialog open={showDenialDialog} onOpenChange={setShowDenialDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deny Time-Off Request</DialogTitle>
            <DialogDescription>
              Please provide a reason for denying this request
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="denial-reason">
                Reason for Denial
              </Label>
              <Textarea
                id="denial-reason"
                placeholder="Enter the reason for denying this request..."
                value={denialReason}
                onChange={(e) => setDenialReason(e.target.value)}
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDenialDialog(false)
                setDenialReason('')
              }}
              disabled={isDenying}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeny}
              disabled={!denialReason.trim() || isDenying}
            >
              {isDenying ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Denying...
                </>
              ) : (
                'Confirm Denial'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}