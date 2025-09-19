'use client'

import { useState } from 'react'
import { useOptimisticBatch, useOptimisticBulkUpdate, useOptimisticBulkDelete } from '@/core/shared/hooks/optimistic'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Users,
  Upload,
  Download,
  Trash2,
  Edit3,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react'
import { toast } from 'sonner'
import type { Database } from '@/types/database.types'

type StaffMember = Database['public']['Tables']['staff_profiles']['Row'] & {
  user?: {
    email: string
    name: string
  }
}

export function StaffBatchOptimistic({
  initialStaff,
  salonId
}: {
  initialStaff: StaffMember[]
  salonId: string
}) {
  const [selectedStaff, setSelectedStaff] = useState<Set<string>>(new Set())
  const [bulkAction, setBulkAction] = useState<string>('')
  const [showProgressDialog, setShowProgressDialog] = useState(false)

  // Batch operations with progress tracking
  const batch = useOptimisticBatch<StaffMember>({
    onProgress: (progress) => {
      // Track batch progress
    },
    onItemComplete: (item, index) => {
      // Item processed successfully
    },
    onItemError: (error, item, index) => {
      console.error(`Failed processing ${item.user?.name}:`, error)
    },
    onComplete: (results) => {
      toast.success('Batch operation completed')
      setShowProgressDialog(false)
      setSelectedStaff(new Set())
      setBulkAction('')
    },
    onError: (error) => {
      toast.error('Batch operation failed')
      setShowProgressDialog(false)
    },
    batchSize: 5,
    delayBetweenBatches: 500,
    showProgressToast: true,
    continueOnError: true
  })

  // Specialized bulk update hook
  const bulkUpdate = useOptimisticBulkUpdate<StaffMember>({
    showProgressToast: false,
    continueOnError: true
  })

  // Specialized bulk delete hook
  const bulkDelete = useOptimisticBulkDelete<StaffMember>({
    showProgressToast: false,
    continueOnError: false
  })

  const handleSelectAll = () => {
    if (selectedStaff.size === initialStaff.length) {
      setSelectedStaff(new Set())
    } else {
      setSelectedStaff(new Set(initialStaff.map(s => s.id)))
    }
  }

  const handleSelectStaff = (staffId: string) => {
    const newSelected = new Set(selectedStaff)
    if (newSelected.has(staffId)) {
      newSelected.delete(staffId)
    } else {
      newSelected.add(staffId)
    }
    setSelectedStaff(newSelected)
  }

  const executeBulkAction = async () => {
    const selectedItems = initialStaff.filter(s => selectedStaff.has(s.id))

    if (selectedItems.length === 0) {
      toast.error('No staff members selected')
      return
    }

    setShowProgressDialog(true)

    switch (bulkAction) {
      case 'activate':
        await batch.actions.processBatch(
          selectedItems.map(s => ({ ...s, is_active: true })),
          async (items) => {
            const { bulkActivateStaffAction } = await import('@/core/staff/actions/staff-actions')
            const result = await bulkActivateStaffAction(items.map(i => i.id))
            if (!result.success) throw new Error(result.error || 'Failed to activate staff')
            return result
          },
          'update'
        )
        break

      case 'deactivate':
        await batch.actions.processBatch(
          selectedItems.map(s => ({ ...s, is_active: false })),
          async (items) => {
            const { bulkDeactivateStaffAction } = await import('@/core/staff/actions/staff-actions')
            const result = await bulkDeactivateStaffAction(items.map(i => i.id))
            if (!result.success) throw new Error(result.error || 'Failed to deactivate staff')
            return result
          },
          'update'
        )
        break

      case 'updateRole':
        const newRole = 'senior_stylist' // This would come from a dialog
        await bulkUpdate.bulkUpdate(
          selectedItems.map(s => ({ ...s, role: newRole })),
          async (items) => {
            const { bulkUpdateStaffRoleAction } = await import('@/core/staff/actions/staff-actions')
            const result = await bulkUpdateStaffRoleAction(items.map(i => i.id), newRole)
            if (!result.success) throw new Error(result.error || 'Failed to update roles')
            return result
          }
        )
        break

      case 'delete':
        await bulkDelete.bulkDelete(
          selectedItems,
          async (ids) => {
            const { bulkDeleteStaffAction } = await import('@/core/staff/actions/staff-actions')
            const result = await bulkDeleteStaffAction(ids)
            if (!result.success) throw new Error(result.error || 'Failed to delete staff')
          }
        )
        break

      case 'export':
        // Export doesn't need optimistic updates
        const csvContent = generateCSV(selectedItems)
        downloadCSV(csvContent, 'staff-export.csv')
        setShowProgressDialog(false)
        break

      default:
        toast.error('Invalid action selected')
        setShowProgressDialog(false)
    }
  }

  const generateCSV = (items: StaffMember[]) => {
    const headers = ['ID', 'Name', 'Email', 'Role', 'Status', 'Commission Rate']
    const rows = items.map(item => [
      item.id,
      item.user?.name || '',
      item.user?.email || '',
      item.role || '',
      item.is_active ? 'Active' : 'Inactive',
      item.commission_rate || '0'
    ])

    return [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n')
  }

  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  const retryFailedOperations = async () => {
    await batch.actions.retry(async (items) => {
      // Retry logic - use the original action type from the failed operation
      const { bulkActivateStaffAction } = await import('@/core/staff/actions/staff-actions')
      const result = await bulkActivateStaffAction(items.map(i => i.id))
      if (!result.success) throw new Error(result.error || 'Retry failed')
      return result
    })
  }

  return (
    <div className="space-y-4">
      {/* Bulk Action Bar */}
      <Card>
        <CardHeader>
          <CardTitle>Bulk Operations</CardTitle>
          <CardDescription>
            Select staff members to perform batch actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Checkbox
              checked={selectedStaff.size === initialStaff.length && initialStaff.length > 0}
              onCheckedChange={handleSelectAll}
            />
            <span className="text-sm text-gray-500">
              {selectedStaff.size} of {initialStaff.length} selected
            </span>

            <Select value={bulkAction} onValueChange={setBulkAction}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select action..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="activate">Activate</SelectItem>
                <SelectItem value="deactivate">Deactivate</SelectItem>
                <SelectItem value="updateRole">Update Role</SelectItem>
                <SelectItem value="export">Export CSV</SelectItem>
                <SelectItem value="delete">Delete</SelectItem>
              </SelectContent>
            </Select>

            <Button
              onClick={executeBulkAction}
              disabled={selectedStaff.size === 0 || !bulkAction || batch.isProcessing}
            >
              {batch.isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Execute'
              )}
            </Button>

            {batch.operations.some(op => op.status === 'failed') && (
              <Button
                variant="outline"
                onClick={retryFailedOperations}
                disabled={batch.isProcessing}
              >
                Retry Failed
              </Button>
            )}

            <Button
              variant="ghost"
              onClick={() => batch.actions.clear()}
              disabled={batch.operations.length === 0}
            >
              Clear History
            </Button>
          </div>

          {/* Operation Status */}
          {batch.operations.length > 0 && (
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Progress: {batch.progress.completed + batch.progress.failed} / {batch.progress.total}</span>
                <span className="text-gray-500">{batch.progress.percentage}%</span>
              </div>
              <Progress value={batch.progress.percentage} className="h-2" />

              {batch.progress.failed > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Errors Occurred</AlertTitle>
                  <AlertDescription>
                    {batch.progress.failed} operations failed. You can retry them or continue.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Staff List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {initialStaff.map(staff => {
          const operation = batch.operations.find(op => op.data.id === staff.id)
          const isSelected = selectedStaff.has(staff.id)
          const isProcessing = operation?.status === 'processing'
          const isCompleted = operation?.status === 'completed'
          const isFailed = operation?.status === 'failed'

          return (
            <Card
              key={staff.id}
              className={`transition-all duration-200 ${
                isSelected ? 'ring-2 ring-primary' : ''
              } ${isProcessing ? 'animate-pulse' : ''}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => handleSelectStaff(staff.id)}
                      disabled={isProcessing}
                    />
                    <div>
                      <h3 className="font-medium">
                        {staff.user?.name || 'Unknown'}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {staff.user?.email}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant={staff.is_active ? 'default' : 'secondary'}>
                          {staff.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                        <Badge variant="outline">
                          {staff.role || 'Staff'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Operation Status Indicator */}
                  {isProcessing && (
                    <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                  )}
                  {isCompleted && (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                  {isFailed && (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                </div>

                {operation?.error && (
                  <p className="text-xs text-red-500 mt-2">
                    Error: {operation.error}
                  </p>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Progress Dialog */}
      <Dialog open={showProgressDialog} onOpenChange={setShowProgressDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Processing Batch Operation</DialogTitle>
            <DialogDescription>
              Please wait while we process your request...
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{batch.progress.percentage}%</span>
              </div>
              <Progress value={batch.progress.percentage} />
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-blue-500">
                  {batch.progress.total}
                </p>
                <p className="text-xs text-gray-500">Total</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-500">
                  {batch.progress.completed}
                </p>
                <p className="text-xs text-gray-500">Completed</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-500">
                  {batch.progress.failed}
                </p>
                <p className="text-xs text-gray-500">Failed</p>
              </div>
            </div>

            {/* Live Operation Feed */}
            <div className="max-h-40 overflow-y-auto space-y-1">
              {batch.operations.map((op, index) => (
                <div
                  key={op.id}
                  className={`text-xs p-1 rounded ${
                    op.status === 'completed'
                      ? 'bg-green-50 text-green-700'
                      : op.status === 'failed'
                      ? 'bg-red-50 text-red-700'
                      : op.status === 'processing'
                      ? 'bg-blue-50 text-blue-700'
                      : 'bg-gray-50 text-gray-700'
                  }`}
                >
                  {op.type} - {op.data.user?.name || `Item ${index + 1}`}: {op.status}
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => batch.actions.cancel()}
              disabled={!batch.isProcessing}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}