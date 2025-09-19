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
import type { BulkUserOperation } from '../dal/users-types'

interface BulkOperationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  bulkAction: BulkUserOperation['action'] | null
  selectedCount: number
  isLoading: boolean
  onConfirm: () => void
}

export function BulkOperationDialog({
  open,
  onOpenChange,
  bulkAction,
  selectedCount,
  isLoading,
  onConfirm
}: BulkOperationDialogProps) {
  const getActionLabel = (action: BulkUserOperation['action'] | null) => {
    if (!action) return ''
    return action.replace('_', ' ')
  }

  const getActionDescription = (action: BulkUserOperation['action'] | null) => {
    switch (action) {
      case 'activate':
        return 'This will activate all selected users and allow them to access the platform.'
      case 'suspend':
        return 'This will suspend all selected users and prevent them from accessing the platform.'
      case 'reset_password':
        return 'This will send password reset emails to all selected users.'
      case 'delete':
        return 'This will permanently delete all selected users. This action cannot be undone.'
      default:
        return 'This action will be performed on all selected users.'
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm Bulk Operation</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              Are you sure you want to {getActionLabel(bulkAction)} {selectedCount} selected users?
            </p>
            <p className="text-sm">
              {getActionDescription(bulkAction)}
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={isLoading}>
            {isLoading ? 'Processing...' : 'Confirm'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}