import { Button } from '@/components/ui/button'
import { CheckCircle, Ban, Key, Trash2 } from 'lucide-react'
import type { BulkUserOperation } from '../dal/users-types'

interface UsersBulkActionsProps {
  selectedCount: number
  onBulkAction: (action: BulkUserOperation['action']) => void
}

export function UsersBulkActions({ selectedCount, onBulkAction }: UsersBulkActionsProps) {
  if (selectedCount === 0) return null

  return (
    <div className="flex items-center gap-2 p-2 bg-muted rounded-md mb-4">
      <span className="text-sm font-medium">
        {selectedCount} users selected
      </span>
      <div className="flex gap-2 ml-auto">
        <Button
          size="sm"
          variant="outline"
          onClick={() => onBulkAction('activate')}
        >
          <CheckCircle className="h-4 w-4 mr-1" />
          Activate
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onBulkAction('suspend')}
        >
          <Ban className="h-4 w-4 mr-1" />
          Suspend
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onBulkAction('reset_password')}
        >
          <Key className="h-4 w-4 mr-1" />
          Reset Password
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onBulkAction('delete')}
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Delete
        </Button>
      </div>
    </div>
  )
}