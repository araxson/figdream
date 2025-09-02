'use client'

import { useState } from 'react'
import {
  Button,
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui'
import { format } from 'date-fns'
import { Trash2, Edit } from 'lucide-react'
import { Database } from '@/types/database.types'
import { deleteStaffTimeOff } from '@/lib/data-access/timeoff'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

type StaffTimeOff = Database['public']['Tables']['staff_time_off']['Row'] & {
  staff_profiles?: {
    id: string
    full_name: string | null
    email: string | null
  } | null
}

interface TimeOffListProps {
  timeOffData: StaffTimeOff[]
}

export function TimeOffList({ timeOffData }: TimeOffListProps) {
  const router = useRouter()
  const [selectedTimeOff, setSelectedTimeOff] = useState<StaffTimeOff | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!selectedTimeOff) return

    setIsDeleting(true)
    try {
      await deleteStaffTimeOff(selectedTimeOff.id)
      toast.success('Time off deleted successfully')
      router.refresh()
    } catch (error) {
      toast.error('Failed to delete time off')
      console.error(error)
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
      setSelectedTimeOff(null)
    }
  }

  const isCurrentOrFuture = (endDate: string) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return new Date(endDate) >= today
  }

  const sortedTimeOff = [...timeOffData].sort((a, b) => {
    // Sort by start date descending
    return new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
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
              <TableHead>Type</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedTimeOff.length > 0 ? (
              sortedTimeOff.map((timeOff) => {
                const isCurrent = isCurrentOrFuture(timeOff.end_date)
                return (
                  <TableRow key={timeOff.id} className={!isCurrent ? 'opacity-50' : ''}>
                    <TableCell className="font-medium">
                      {timeOff.staff_profiles?.full_name || 'Unknown'}
                    </TableCell>
                    <TableCell>{format(new Date(timeOff.start_date), 'MMM d, yyyy')}</TableCell>
                    <TableCell>{format(new Date(timeOff.end_date), 'MMM d, yyyy')}</TableCell>
                    <TableCell>
                      <Badge variant={timeOff.all_day ? 'default' : 'secondary'}>
                        {timeOff.all_day ? 'All Day' : 'Partial'}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {timeOff.reason || '-'}
                    </TableCell>
                    <TableCell>
                      {isCurrent ? (
                        <Badge variant="outline">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Past</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {isCurrent && (
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              // TODO: Implement edit functionality
                              toast.info('Edit functionality coming soon')
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setSelectedTimeOff(timeOff)
                              setShowDeleteDialog(true)
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  No approved time off found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Time Off</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this time off entry for {selectedTimeOff?.staff_profiles?.full_name}?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}