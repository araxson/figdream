'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { format } from 'date-fns'
import { Check, X, Clock } from 'lucide-react'
import { Database } from '@/types/database.types'
import { approveTimeOffRequest, rejectTimeOffRequest } from '@/lib/data-access/time-off'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
type TimeOffRequest = Database['public']['Tables']['time_off_requests']['Row'] & {
  staff_profiles?: {
    id: string
    full_name: string | null
    email: string | null
  } | null
}
interface TimeOffRequestsProps {
  requests: TimeOffRequest[]
}
export function TimeOffRequests({ requests }: TimeOffRequestsProps) {
  const router = useRouter()
  const [selectedRequest, setSelectedRequest] = useState<TimeOffRequest | null>(null)
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const handleApprove = async () => {
    if (!selectedRequest) return
    setIsProcessing(true)
    try {
      // Get current user ID - in production, this should come from auth context
      const userId = 'current-user-id' // Replace with actual user ID
      await approveTimeOffRequest(selectedRequest.id, userId)
      toast.success('Time off request approved successfully')
      router.refresh()
    } catch (_error) {
      toast.error('Failed to approve request')
    } finally {
      setIsProcessing(false)
      setSelectedRequest(null)
      setActionType(null)
    }
  }
  const handleReject = async () => {
    if (!selectedRequest) return
    setIsProcessing(true)
    try {
      // Get current user ID - in production, this should come from auth context
      const userId = 'current-user-id' // Replace with actual user ID
      await rejectTimeOffRequest(selectedRequest.id, userId, rejectionReason)
      toast.success('Time off request rejected')
      router.refresh()
    } catch (_error) {
      toast.error('Failed to reject request')
    } finally {
      setIsProcessing(false)
      setSelectedRequest(null)
      setActionType(null)
      setRejectionReason('')
    }
  }
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary"><Clock className="mr-1 h-3 w-3" />Pending</Badge>
      case 'approved':
        return <Badge variant="default"><Check className="mr-1 h-3 w-3" />Approved</Badge>
      case 'rejected':
        return <Badge variant="destructive"><X className="mr-1 h-3 w-3" />Rejected</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }
  const sortedRequests = [...requests].sort((a, b) => {
    // Sort pending first, then by date
    if (a.status === 'pending' && b.status !== 'pending') return -1
    if (a.status !== 'pending' && b.status === 'pending') return 1
    return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
  })
  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Staff Member</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Requested</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedRequests.length > 0 ? (
              sortedRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="font-medium">
                    {request.staff_profiles?.full_name || 'Unknown'}
                  </TableCell>
                  <TableCell>{format(new Date(request.start_date), 'MMM d, yyyy')}</TableCell>
                  <TableCell>{format(new Date(request.end_date), 'MMM d, yyyy')}</TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {request.reason || '-'}
                  </TableCell>
                  <TableCell>{getStatusBadge(request.status)}</TableCell>
                  <TableCell>
                    {request.created_at && format(new Date(request.created_at), 'MMM d')}
                  </TableCell>
                  <TableCell className="text-right">
                    {request.status === 'pending' && (
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedRequest(request)
                            setActionType('approve')
                          }}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedRequest(request)
                            setActionType('reject')
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  No time off requests found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {/* Approve Dialog */}
      <AlertDialog open={actionType === 'approve'} onOpenChange={() => setActionType(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve Time Off Request</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to approve this time off request for {selectedRequest?.staff_profiles?.full_name}?
              <br />
              <br />
              <strong>Dates:</strong> {selectedRequest && format(new Date(selectedRequest.start_date), 'MMM d, yyyy')} - {selectedRequest && format(new Date(selectedRequest.end_date), 'MMM d, yyyy')}
              {selectedRequest?.reason && (
                <>
                  <br />
                  <strong>Reason:</strong> {selectedRequest.reason}
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleApprove} disabled={isProcessing}>
              {isProcessing ? 'Approving...' : 'Approve'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {/* Reject Dialog */}
      <AlertDialog open={actionType === 'reject'} onOpenChange={() => setActionType(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Time Off Request</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reject this time off request for {selectedRequest?.staff_profiles?.full_name}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Label htmlFor="rejection-reason">Rejection Reason (Optional)</Label>
            <Textarea
              id="rejection-reason"
              placeholder="Provide a reason for rejection..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="mt-2"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={isProcessing}
            >
              {isProcessing ? 'Rejecting...' : 'Reject'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}