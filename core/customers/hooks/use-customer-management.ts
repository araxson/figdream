import { useState, useTransition, useOptimistic, useCallback, useMemo } from 'react'
import { toast } from 'sonner'

import {
  toggleVIPStatusAction,
  toggleCustomerStatusAction,
  deleteCustomerAction,
  getCustomersAction
} from '../actions'

import type {
  CustomerProfileWithRelations,
  CustomerFilters,
  CustomerStatus
} from '../dal/customers-types'

type CustomerSegment = 'all' | 'new' | 'regular' | 'vip' | 'at-risk' | 'inactive'
type SortBy = 'name' | 'created' | 'visits' | 'spent'
type SortOrder = 'asc' | 'desc'

interface UseCustomerManagementProps {
  initialCustomers: CustomerProfileWithRelations[]
}

export function useCustomerManagement({ initialCustomers }: UseCustomerManagementProps) {
  const [isPending, startTransition] = useTransition()

  // State management
  const [customers, setOptimisticCustomers] = useOptimistic(initialCustomers)
  const [selectedCustomers, setSelectedCustomers] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<CustomerStatus | 'all'>('all')
  const [segment, setSegment] = useState<CustomerSegment>('all')
  const [sortBy, setSortBy] = useState<SortBy>('name')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({})

  // Filter customers based on search and filters
  const filteredCustomers = useMemo(() => {
    let filtered = [...customers]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(c =>
        c.display_name?.toLowerCase().includes(query) ||
        c.email?.toLowerCase().includes(query) ||
        c.phone?.toLowerCase().includes(query)
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(c => {
        const isActive = c.is_active ?? true
        if (statusFilter === 'active') return isActive
        if (statusFilter === 'inactive') return !isActive
        return true
      })
    }

    // Segment filter
    if (segment !== 'all') {
      const now = new Date()
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

      filtered = filtered.filter(c => {
        switch (segment) {
          case 'new':
            return new Date(c.created_at!) > thirtyDaysAgo
          case 'vip':
            return c.is_vip === true
          case 'regular':
            return (c.visit_count ?? 0) >= 3
          case 'at-risk':
            return c.last_visit && new Date(c.last_visit) < thirtyDaysAgo
          case 'inactive':
            return !c.is_active
          default:
            return true
        }
      })
    }

    // Sorting
    filtered.sort((a, b) => {
      let compareValue = 0

      switch (sortBy) {
        case 'name':
          compareValue = (a.display_name ?? '').localeCompare(b.display_name ?? '')
          break
        case 'created':
          compareValue = new Date(a.created_at ?? 0).getTime() - new Date(b.created_at ?? 0).getTime()
          break
        case 'visits':
          compareValue = (a.visit_count ?? 0) - (b.visit_count ?? 0)
          break
        case 'spent':
          compareValue = (a.total_spent ?? 0) - (b.total_spent ?? 0)
          break
      }

      return sortOrder === 'asc' ? compareValue : -compareValue
    })

    return filtered
  }, [customers, searchQuery, statusFilter, segment, sortBy, sortOrder])

  // Paginated customers
  const paginatedCustomers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredCustomers.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredCustomers, currentPage, itemsPerPage])

  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage)

  // Metrics calculations
  const metrics = useMemo(() => {
    const total = customers.length
    const newCustomers = customers.filter(c => {
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      return new Date(c.created_at!) > thirtyDaysAgo
    }).length
    const vipCustomers = customers.filter(c => c.is_vip).length
    const activeCustomers = customers.filter(c => c.is_active !== false).length

    return {
      total,
      newCustomers,
      vipCustomers,
      activeCustomers,
      conversionRate: total > 0 ? ((activeCustomers / total) * 100).toFixed(1) : '0'
    }
  }, [customers])

  // Handle VIP toggle with optimistic update
  const handleToggleVIP = useCallback(async (customer: CustomerProfileWithRelations) => {
    setLoadingStates(prev => ({ ...prev, [`vip-${customer.id}`]: true }))

    // Optimistic update
    setOptimisticCustomers(prev =>
      prev.map(c => c.id === customer.id ? { ...c, is_vip: !c.is_vip } : c)
    )

    startTransition(async () => {
      const result = await toggleVIPStatusAction(customer.id)

      if (result.success) {
        toast.success(result.message)
      } else {
        // Revert optimistic update on error
        setOptimisticCustomers(prev =>
          prev.map(c => c.id === customer.id ? { ...c, is_vip: customer.is_vip } : c)
        )
        toast.error(result.error || 'Failed to update VIP status')
      }

      setLoadingStates(prev => ({ ...prev, [`vip-${customer.id}`]: false }))
    })
  }, [setOptimisticCustomers])

  // Handle status toggle with optimistic update
  const handleToggleStatus = useCallback(async (customer: CustomerProfileWithRelations) => {
    setLoadingStates(prev => ({ ...prev, [`status-${customer.id}`]: true }))

    // Optimistic update
    setOptimisticCustomers(prev =>
      prev.map(c => c.id === customer.id ? { ...c, is_active: !(c.is_active ?? true) } : c)
    )

    startTransition(async () => {
      const result = await toggleCustomerStatusAction(customer.id)

      if (result.success) {
        toast.success(result.message)
      } else {
        // Revert optimistic update on error
        setOptimisticCustomers(prev =>
          prev.map(c => c.id === customer.id ? { ...c, is_active: customer.is_active } : c)
        )
        toast.error(result.error || 'Failed to update status')
      }

      setLoadingStates(prev => ({ ...prev, [`status-${customer.id}`]: false }))
    })
  }, [setOptimisticCustomers])

  // Handle delete with optimistic update
  const handleDelete = useCallback(async (customerId: string) => {
    setLoadingStates(prev => ({ ...prev, [`delete-${customerId}`]: true }))

    // Optimistic update - remove from list
    setOptimisticCustomers(prev => prev.filter(c => c.id !== customerId))

    startTransition(async () => {
      const result = await deleteCustomerAction(customerId)

      if (result.success) {
        toast.success(result.message)
      } else {
        // Revert optimistic update on error
        const customer = customers.find(c => c.id === customerId)
        if (customer) {
          setOptimisticCustomers(prev => [...prev, customer])
        }
        toast.error(result.error || 'Failed to delete customer')
      }

      setLoadingStates(prev => ({ ...prev, [`delete-${customerId}`]: false }))
    })
  }, [customers, setOptimisticCustomers])

  return {
    // State
    customers,
    filteredCustomers,
    paginatedCustomers,
    selectedCustomers,
    searchQuery,
    statusFilter,
    segment,
    sortBy,
    sortOrder,
    currentPage,
    itemsPerPage,
    totalPages,
    loadingStates,
    isPending,
    metrics,

    // Setters
    setSelectedCustomers,
    setSearchQuery,
    setStatusFilter,
    setSegment,
    setSortBy,
    setSortOrder,
    setCurrentPage,
    setOptimisticCustomers,

    // Handlers
    handleToggleVIP,
    handleToggleStatus,
    handleDelete
  }
}