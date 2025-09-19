import { useOptimistic, useTransition, useCallback, useEffect } from 'react'
import { toast } from 'sonner'
import type { CustomerProfileWithRelations } from '../dal/customers-types'
import {
  getCustomersAction,
  updateCustomerAction,
  deleteCustomerAction,
  toggleVIPStatusAction,
  toggleCustomerStatusAction
} from '../actions'

interface UseCustomersOptimisticOptions {
  initialCustomers?: CustomerProfileWithRelations[]
  autoRefresh?: boolean
  refreshInterval?: number
  onUpdate?: (customers: CustomerProfileWithRelations[]) => void
  onError?: (error: string) => void
}

export function useCustomersOptimistic({
  initialCustomers = [],
  autoRefresh = true,
  refreshInterval = 30000, // 30 seconds
  onUpdate,
  onError
}: UseCustomersOptimisticOptions = {}) {
  const [isPending, startTransition] = useTransition()
  const [customers, setOptimisticCustomers] = useOptimistic(initialCustomers)

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(async () => {
      const result = await getCustomersAction()
      if (result.success && result.data) {
        setOptimisticCustomers(result.data.customers)
        onUpdate?.(result.data.customers)
      }
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, setOptimisticCustomers, onUpdate])

  // Refresh on window focus
  useEffect(() => {
    if (!autoRefresh) return

    const handleFocus = async () => {
      const result = await getCustomersAction()
      if (result.success && result.data) {
        setOptimisticCustomers(result.data.customers)
        onUpdate?.(result.data.customers)
      }
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [autoRefresh, setOptimisticCustomers, onUpdate])

  // Update customer with optimistic UI
  const updateCustomer = useCallback(
    async (customerId: string, updates: Partial<CustomerProfileWithRelations>) => {
      // Store original state for rollback
      const originalCustomers = customers

      // Optimistic update
      setOptimisticCustomers(prev =>
        prev.map(c => c.id === customerId ? { ...c, ...updates } : c)
      )

      startTransition(async () => {
        const result = await updateCustomerAction(customerId, updates as any)

        if (result.success) {
          toast.success('Customer updated successfully')
          if (result.data) {
            setOptimisticCustomers(prev =>
              prev.map(c => c.id === customerId ? result.data : c)
            )
            onUpdate?.(customers)
          }
        } else {
          // Rollback on error
          setOptimisticCustomers(originalCustomers)
          const errorMessage = result.error || 'Failed to update customer'
          toast.error(errorMessage)
          onError?.(errorMessage)
        }
      })
    },
    [customers, setOptimisticCustomers, onUpdate, onError]
  )

  // Delete customer with optimistic UI
  const deleteCustomer = useCallback(
    async (customerId: string) => {
      // Store original state for rollback
      const originalCustomers = customers
      const customerToDelete = customers.find(c => c.id === customerId)

      if (!customerToDelete) {
        toast.error('Customer not found')
        return
      }

      // Optimistic update - remove from list
      setOptimisticCustomers(prev => prev.filter(c => c.id !== customerId))
      toast.info('Deleting customer...')

      startTransition(async () => {
        const result = await deleteCustomerAction(customerId)

        if (result.success) {
          toast.success('Customer deleted successfully')
          onUpdate?.(customers.filter(c => c.id !== customerId))
        } else {
          // Rollback on error
          setOptimisticCustomers(originalCustomers)
          const errorMessage = result.error || 'Failed to delete customer'
          toast.error(errorMessage)
          onError?.(errorMessage)
        }
      })
    },
    [customers, setOptimisticCustomers, onUpdate, onError]
  )

  // Toggle VIP status with optimistic UI
  const toggleVIP = useCallback(
    async (customerId: string) => {
      const customer = customers.find(c => c.id === customerId)
      if (!customer) {
        toast.error('Customer not found')
        return
      }

      // Optimistic update
      setOptimisticCustomers(prev =>
        prev.map(c => c.id === customerId ? { ...c, is_vip: !c.is_vip } : c)
      )

      startTransition(async () => {
        const result = await toggleVIPStatusAction(customerId)

        if (result.success) {
          toast.success(result.message || 'VIP status updated')
          if (result.data) {
            setOptimisticCustomers(prev =>
              prev.map(c => c.id === customerId ? result.data : c)
            )
            onUpdate?.(customers)
          }
        } else {
          // Rollback on error
          setOptimisticCustomers(prev =>
            prev.map(c => c.id === customerId ? customer : c)
          )
          const errorMessage = result.error || 'Failed to update VIP status'
          toast.error(errorMessage)
          onError?.(errorMessage)
        }
      })
    },
    [customers, setOptimisticCustomers, onUpdate, onError]
  )

  // Toggle active status with optimistic UI
  const toggleStatus = useCallback(
    async (customerId: string) => {
      const customer = customers.find(c => c.id === customerId)
      if (!customer) {
        toast.error('Customer not found')
        return
      }

      const currentStatus = customer.is_active ?? true

      // Optimistic update
      setOptimisticCustomers(prev =>
        prev.map(c => c.id === customerId ? { ...c, is_active: !currentStatus } : c)
      )

      startTransition(async () => {
        const result = await toggleCustomerStatusAction(customerId)

        if (result.success) {
          toast.success(result.message || 'Status updated')
          if (result.data) {
            setOptimisticCustomers(prev =>
              prev.map(c => c.id === customerId ? result.data : c)
            )
            onUpdate?.(customers)
          }
        } else {
          // Rollback on error
          setOptimisticCustomers(prev =>
            prev.map(c => c.id === customerId ? customer : c)
          )
          const errorMessage = result.error || 'Failed to update status'
          toast.error(errorMessage)
          onError?.(errorMessage)
        }
      })
    },
    [customers, setOptimisticCustomers, onUpdate, onError]
  )

  // Batch operations
  const batchUpdate = useCallback(
    async (customerIds: string[], updates: Partial<CustomerProfileWithRelations>) => {
      // Store original state for rollback
      const originalCustomers = customers

      // Optimistic update for all selected customers
      setOptimisticCustomers(prev =>
        prev.map(c => customerIds.includes(c.id) ? { ...c, ...updates } : c)
      )

      startTransition(async () => {
        const results = await Promise.allSettled(
          customerIds.map(id => updateCustomerAction(id, updates as any))
        )

        const succeeded = results.filter(r => r.status === 'fulfilled' && r.value.success)
        const failed = results.filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.success))

        if (succeeded.length > 0) {
          toast.success(`Updated ${succeeded.length} customers`)
        }

        if (failed.length > 0) {
          // Partial rollback for failed updates
          const failedIds = customerIds.slice(succeeded.length)
          setOptimisticCustomers(prev =>
            prev.map(c => {
              if (failedIds.includes(c.id)) {
                const original = originalCustomers.find(o => o.id === c.id)
                return original || c
              }
              return c
            })
          )
          toast.error(`Failed to update ${failed.length} customers`)
        }

        onUpdate?.(customers)
      })
    },
    [customers, setOptimisticCustomers, onUpdate]
  )

  // Manual refresh
  const refresh = useCallback(async () => {
    startTransition(async () => {
      const result = await getCustomersAction()
      if (result.success && result.data) {
        setOptimisticCustomers(result.data.customers)
        onUpdate?.(result.data.customers)
        toast.success('Customers refreshed')
      } else {
        const errorMessage = result.error || 'Failed to refresh customers'
        toast.error(errorMessage)
        onError?.(errorMessage)
      }
    })
  }, [setOptimisticCustomers, onUpdate, onError])

  return {
    customers,
    isPending,
    updateCustomer,
    deleteCustomer,
    toggleVIP,
    toggleStatus,
    batchUpdate,
    refresh,
    // Utility functions
    findCustomer: (id: string) => customers.find(c => c.id === id),
    filterCustomers: (predicate: (customer: CustomerProfileWithRelations) => boolean) =>
      customers.filter(predicate),
    sortCustomers: (compareFn: (a: CustomerProfileWithRelations, b: CustomerProfileWithRelations) => number) =>
      [...customers].sort(compareFn)
  }
}