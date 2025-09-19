'use client'

import { CheckCircle, X, Download, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface AppointmentBulkActionsProps {
  selectedCount: number
  onBulkAction?: (action: string, appointmentIds: string[]) => void
  selectedAppointmentIds: string[]
}

const BULK_ACTIONS = [
  { id: 'confirm', label: 'Confirm Selected', icon: CheckCircle },
  { id: 'cancel', label: 'Cancel Selected', icon: X, variant: 'destructive' },
  { id: 'export', label: 'Export Selected', icon: Download },
  { id: 'delete', label: 'Delete Selected', icon: Trash2, variant: 'destructive' },
]

export function AppointmentBulkActions({
  selectedCount,
  onBulkAction,
  selectedAppointmentIds,
}: AppointmentBulkActionsProps) {
  if (selectedCount === 0) {
    return null
  }

  const handleBulkAction = (actionId: string) => {
    onBulkAction?.(actionId, selectedAppointmentIds)
  }

  return (
    <div className="flex items-center gap-2 p-3 bg-muted/50 border rounded-lg mb-4">
      <span className="text-sm font-medium">
        {selectedCount} appointment{selectedCount !== 1 ? 's' : ''} selected
      </span>

      <div className="flex items-center gap-1 ml-auto">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              Bulk Actions
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {BULK_ACTIONS.map((action, index) => {
              const Icon = action.icon
              return (
                <div key={action.id}>
                  {index > 0 && action.variant === 'destructive' && <DropdownMenuSeparator />}
                  <DropdownMenuItem
                    onClick={() => handleBulkAction(action.id)}
                    className={action.variant === 'destructive' ? 'text-destructive' : ''}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {action.label}
                  </DropdownMenuItem>
                </div>
              )
            })}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="outline"
          size="sm"
          onClick={() => handleBulkAction('clear')}
        >
          Clear Selection
        </Button>
      </div>
    </div>
  )
}