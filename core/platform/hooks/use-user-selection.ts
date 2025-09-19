'use client'

import { useState, useCallback } from 'react'
import { toast } from 'sonner'
import type { ProfileWithRelations, BulkUserOperation } from '../dal/users-types'
import { bulkUserOperationAction } from '../actions'

interface UseUserSelectionProps {
  users: ProfileWithRelations[]
  onRefresh?: () => void
}

export function useUserSelection({ users, onRefresh }: UseUserSelectionProps) {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [showBulkDialog, setShowBulkDialog] = useState(false)
  const [bulkAction, setBulkAction] = useState<BulkUserOperation['action'] | null>(null)
  const [isBulkLoading, setIsBulkLoading] = useState(false)

  // Toggle user selection
  const toggleUserSelection = useCallback((userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }, [])

  // Select all users
  const selectAllUsers = useCallback(() => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([])
    } else {
      setSelectedUsers(users.map(u => u.id))
    }
  }, [selectedUsers.length, users])

  // Clear selection
  const clearSelection = useCallback(() => {
    setSelectedUsers([])
  }, [])

  // Handle bulk operation
  const handleBulkOperation = useCallback(async () => {
    if (!bulkAction || selectedUsers.length === 0) return

    setIsBulkLoading(true)
    try {
      const operation: BulkUserOperation = {
        action: bulkAction,
        userIds: selectedUsers,
        reason: 'Bulk operation performed by admin'
      }

      const result = await bulkUserOperationAction(operation)

      if (result.success) {
        toast.success(`Successfully ${bulkAction.replace('_', ' ')}ed ${selectedUsers.length} users`)
        setSelectedUsers([])
        setShowBulkDialog(false)
        setBulkAction(null)
        onRefresh?.()
      } else {
        throw new Error(result.error || 'Failed to perform bulk operation')
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to perform bulk operation')
    } finally {
      setIsBulkLoading(false)
    }
  }, [bulkAction, selectedUsers, onRefresh])

  // Start bulk operation
  const startBulkOperation = useCallback((action: BulkUserOperation['action']) => {
    setBulkAction(action)
    setShowBulkDialog(true)
  }, [])

  const isAllSelected = selectedUsers.length === users.length && users.length > 0
  const hasSelection = selectedUsers.length > 0

  return {
    selectedUsers,
    showBulkDialog,
    bulkAction,
    isBulkLoading,
    isAllSelected,
    hasSelection,
    toggleUserSelection,
    selectAllUsers,
    clearSelection,
    handleBulkOperation,
    startBulkOperation,
    setShowBulkDialog,
    setBulkAction
  }
}