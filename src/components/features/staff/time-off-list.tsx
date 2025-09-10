'use client'

import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
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
import { formatDate } from '@/lib/utils/format'
import { TimeOffRequest } from './time-off-types'
import { getStatusBadge } from './time-off-status'
import { calculateDays } from './time-off-api'

interface TimeOffListProps {
  requests: TimeOffRequest[]
  cancelingRequest: TimeOffRequest | null
  onCancelRequest: (request: TimeOffRequest) => void
  onConfirmCancel: () => void
  onCancelDialog: () => void
}

export function TimeOffList({ 
  requests, 
  cancelingRequest, 
  onCancelRequest, 
  onConfirmCancel,
  onCancelDialog 
}: TimeOffListProps) {
  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Dates</TableHead>
            <TableHead>Days</TableHead>
            <TableHead>Reason</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Requested</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">
                No time off requests found
              </TableCell>
            </TableRow>
          ) : (
            requests.map((request) => (
              <TableRow key={request.id}>
                <TableCell>
                  <div className="font-medium">
                    {formatDate(request.start_date)} - {formatDate(request.end_date)}
                  </div>
                </TableCell>
                <TableCell>
                  {calculateDays(request.start_date, request.end_date)}
                </TableCell>
                <TableCell className="max-w-[200px] truncate">
                  {request.reason}
                </TableCell>
                <TableCell>
                  {getStatusBadge(request.status)}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(request.created_at)}
                </TableCell>
                <TableCell className="text-right">
                  {request.status === 'pending' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onCancelRequest(request)}
                    >
                      Cancel
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <AlertDialog open={!!cancelingRequest} onOpenChange={() => onCancelDialog()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Time Off Request?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this time off request? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={onCancelDialog}>
              Keep Request
            </AlertDialogCancel>
            <AlertDialogAction onClick={onConfirmCancel}>
              Cancel Request
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}