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
  AlertDialogTitle,
} from '@/components/ui'
import { format } from 'date-fns'
import { Trash2, Edit, User, Building } from 'lucide-react'
import { Database } from '@/types/database.types'
import { deleteBlockedTime } from '@/lib/data-access/blocked'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

type BlockedTime = Database['public']['Tables']['blocked_times']['Row'] & {
  staff_profiles?: {
    id: string
    full_name: string | null
    email: string | null
  } | null
  salons?: {
    id: string
    name: string | null
  } | null
}

interface BlockedTimesListProps {
  blockedTimes: BlockedTime[]
}

export function BlockedTimesList({ blockedTimes }: BlockedTimesListProps) {
  const router = useRouter()
  const [selectedBlock, setSelectedBlock] = useState<BlockedTime | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!selectedBlock) return

    setIsDeleting(true)
    try {
      await deleteBlockedTime(selectedBlock.id)
      toast.success('Blocked time deleted successfully')
      router.refresh()
    } catch (error) {
      toast.error('Failed to delete blocked time')
      console.error(error)
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
      setSelectedBlock(null)
    }
  }

  const getBlockTypeBadge = (type: string) => {
    const variants: Record<string, any> = {
      'maintenance': { variant: 'destructive', label: 'Maintenance' },
      'break': { variant: 'secondary', label: 'Break' },
      'meeting': { variant: 'default', label: 'Meeting' },
      'holiday': { variant: 'outline', label: 'Holiday' },
      'other': { variant: 'secondary', label: 'Other' }
    }
    const config = variants[type] || variants.other
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const isPastBlock = (endTime: string) => {
    return new Date(endTime) < new Date()
  }

  const sortedBlocks = [...blockedTimes].sort((a, b) => {
    // Sort by start time descending
    return new Date(b.start_time).getTime() - new Date(a.start_time).getTime()
  })

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Applies To</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedBlocks.length > 0 ? (
              sortedBlocks.map((block) => {
                const isPast = isPastBlock(block.end_time)
                return (
                  <TableRow key={block.id} className={isPast ? 'opacity-50' : ''}>
                    <TableCell>
                      {format(new Date(block.start_time), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      {format(new Date(block.start_time), 'h:mm a')} - 
                      {format(new Date(block.end_time), 'h:mm a')}
                    </TableCell>
                    <TableCell>
                      {block.staff_profiles ? (
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span>{block.staff_profiles.full_name}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-muted-foreground" />
                          <span>All Staff</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{getBlockTypeBadge(block.block_type)}</TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {block.reason || '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {isPast ? (
                          <Badge variant="secondary">Past</Badge>
                        ) : (
                          <Badge variant="outline">Active</Badge>
                        )}
                        {block.is_recurring && (
                          <Badge variant="outline">Recurring</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {!isPast && (
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
                              setSelectedBlock(block)
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
                  No blocked times found
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
            <AlertDialogTitle>Delete Blocked Time</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this blocked time? This will make the time slot available for bookings again.
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