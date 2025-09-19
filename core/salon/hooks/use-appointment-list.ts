'use client'

import { useState, useMemo } from 'react'
import type { AppointmentWithRelations, AppointmentStatus, PaymentStatus } from '../types'

type SortField = 'date' | 'customer' | 'staff' | 'status' | 'amount'
type SortOrder = 'asc' | 'desc'

interface UseAppointmentListProps {
  appointments: AppointmentWithRelations[]
}

export function useAppointmentList({ appointments }: UseAppointmentListProps) {
  const [selectedAppointments, setSelectedAppointments] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | 'all'>('all')
  const [paymentFilter, setPaymentFilter] = useState<PaymentStatus | 'all'>('all')
  const [sortField, setSortField] = useState<SortField>('date')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    new Set(['checkbox', 'customer', 'service', 'datetime', 'staff', 'status', 'payment', 'amount', 'actions'])
  )

  // Filter and sort appointments
  const filteredAppointments = useMemo(() => {
    let filtered = [...appointments]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(apt =>
        apt.customer?.first_name?.toLowerCase().includes(query) ||
        apt.customer?.last_name?.toLowerCase().includes(query) ||
        apt.customer?.email?.toLowerCase().includes(query) ||
        apt.confirmation_code?.toLowerCase().includes(query) ||
        apt.services?.some(s => s.service_name.toLowerCase().includes(query))
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(apt => apt.status === statusFilter)
    }

    // Payment filter
    if (paymentFilter !== 'all') {
      filtered = filtered.filter(apt => apt.payment_status === paymentFilter)
    }

    // Sort
    filtered.sort((a, b) => {
      let compareValue = 0

      switch (sortField) {
        case 'date':
          compareValue = new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
          break
        case 'customer':
          compareValue = (a.customer?.last_name || '').localeCompare(b.customer?.last_name || '')
          break
        case 'staff':
          compareValue = (a.staff?.last_name || '').localeCompare(b.staff?.last_name || '')
          break
        case 'status':
          compareValue = (a.status || '').localeCompare(b.status || '')
          break
        case 'amount':
          compareValue = (a.total_amount || 0) - (b.total_amount || 0)
          break
      }

      return sortOrder === 'asc' ? compareValue : -compareValue
    })

    return filtered
  }, [appointments, searchQuery, statusFilter, paymentFilter, sortField, sortOrder])

  // Toggle appointment selection
  const toggleAppointmentSelection = (id: string) => {
    const newSelection = new Set(selectedAppointments)
    if (newSelection.has(id)) {
      newSelection.delete(id)
    } else {
      newSelection.add(id)
    }
    setSelectedAppointments(newSelection)
  }

  // Toggle all appointments selection
  const toggleAllAppointments = () => {
    if (selectedAppointments.size === filteredAppointments.length) {
      setSelectedAppointments(new Set())
    } else {
      setSelectedAppointments(new Set(filteredAppointments.map(apt => apt.id)))
    }
  }

  // Toggle row expansion
  const toggleRowExpansion = (id: string) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedRows(newExpanded)
  }

  // Handle sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  // Clear selection
  const clearSelection = () => {
    setSelectedAppointments(new Set())
  }

  return {
    // State
    selectedAppointments,
    searchQuery,
    statusFilter,
    paymentFilter,
    sortField,
    sortOrder,
    expandedRows,
    visibleColumns,
    filteredAppointments,

    // Actions
    setSearchQuery,
    setStatusFilter,
    setPaymentFilter,
    setVisibleColumns,
    toggleAppointmentSelection,
    toggleAllAppointments,
    toggleRowExpansion,
    handleSort,
    clearSelection,

    // Computed values
    allSelected: selectedAppointments.size === filteredAppointments.length && filteredAppointments.length > 0,
    selectedAppointmentIds: Array.from(selectedAppointments),
  }
}