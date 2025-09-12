'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Check, X, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { useToast } from '@/hooks/use-toast'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

interface TimeOffRequest {
  id: string
  staff_id: string
  start_date: string
  end_date: string
  reason: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  rejection_reason?: string
  staff?: {
    user: {
      first_name: string
      last_name: string
      email: string
    }
  }
  approver?: {
    first_name: string
    last_name: string
  }
}

interface TimeOffListProps {
  requests: TimeOffRequest[]
  canManage?: boolean
  currentUserId?: string
}

export function TimeOffList({ requests, canManage = false, currentUserId }: TimeOffListProps) {
  const [selectedRequest, setSelectedRequest] = useState<TimeOffRequest | null>(null)
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'delete' | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleAction = async () => {
    if (!selectedRequest || !actionType) return
    
    setLoading(true)
    
    try {
      if (actionType === 'delete') {
        const response = await fetch(`/api/staff/time-off/${selectedRequest.id}`, {
          method: 'DELETE',
        })
        
        if (!response.ok) {
          throw new Error('Failed to delete request')
        }
        
        toast({
          title: 'Success',
          description: 'Time off request deleted',
        })
      } else {
        const response = await fetch(`/api/staff/time-off/${selectedRequest.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: actionType === 'approve' ? 'approved' : 'rejected',
            rejection_reason: actionType === 'reject' ? rejectionReason : undefined,
          }),
        })
        
        if (!response.ok) {
          throw new Error(`Failed to ${actionType} request`)
        }
        
        toast({
          title: 'Success',
          description: `Time off request ${actionType}d`,
        })
      }
      
      setSelectedRequest(null)
      setActionType(null)
      setRejectionReason('')
      router.refresh()
    } catch (error) {
      console.error('Error processing request:', error)
      toast({
        title: 'Error',
        description: `Failed to ${actionType} request`,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline">Pending</Badge>
      case 'approved':
        return <Badge variant="default" className="bg-green-600">Approved</Badge>
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (requests.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No time off requests found
      </div>
    )
  }

  return (
    <>
      <Table>
        <TableCaption>Time off requests</TableCaption>
        <TableHeader>
          <TableRow>
            {canManage && <TableHead>Staff Member</TableHead>}
            <TableHead>Start Date</TableHead>
            <TableHead>End Date</TableHead>
            <TableHead>Reason</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Requested</TableHead>
            {canManage && <TableHead>Approved By</TableHead>}
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((request) => (
            <TableRow key={request.id}>
              {canManage && (
                <TableCell>
                  {request.staff?.user ? 
                    `${request.staff.user.first_name} ${request.staff.user.last_name}` : 
                    'Unknown'
                  }
                </TableCell>
              )}
              <TableCell>{format(new Date(request.start_date), 'MMM d, yyyy')}</TableCell>
              <TableCell>{format(new Date(request.end_date), 'MMM d, yyyy')}</TableCell>
              <TableCell className="max-w-xs truncate">{request.reason}</TableCell>
              <TableCell>{getStatusBadge(request.status)}</TableCell>
              <TableCell>{format(new Date(request.created_at), 'MMM d, yyyy')}</TableCell>
              {canManage && (
                <TableCell>
                  {request.approver ? 
                    `${request.approver.first_name} ${request.approver.last_name}` : 
                    '-'
                  }
                </TableCell>
              )}
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {canManage && request.status === 'pending' && (
                      <>
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedRequest(request)
                            setActionType('approve')
                          }}
                        >
                          <Check className="mr-2 h-4 w-4" />
                          Approve
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedRequest(request)
                            setActionType('reject')
                          }}
                        >
                          <X className="mr-2 h-4 w-4" />
                          Reject
                        </DropdownMenuItem>
                      </>
                    )}
                    {request.status === 'pending' && (
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedRequest(request)
                          setActionType('delete')
                        }}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <AlertDialog open={!!selectedRequest && !!actionType} onOpenChange={() => {
        setSelectedRequest(null)
        setActionType(null)
        setRejectionReason('')
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionType === 'approve' && 'Approve Time Off Request'}
              {actionType === 'reject' && 'Reject Time Off Request'}
              {actionType === 'delete' && 'Delete Time Off Request'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionType === 'approve' && 'Are you sure you want to approve this time off request?'}
              {actionType === 'reject' && 'Please provide a reason for rejecting this request.'}
              {actionType === 'delete' && 'Are you sure you want to delete this time off request? This action cannot be undone.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {actionType === 'reject' && (
            <div className="grid gap-2 py-4">
              <Label htmlFor="rejection-reason">Rejection Reason</Label>
              <Textarea
                id="rejection-reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Please provide a reason for rejecting this request"
                required
              />
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleAction}
              disabled={loading || (actionType === 'reject' && !rejectionReason)}
            >
              {loading ? 'Processing...' : 'Confirm'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}