'use client'

import { useState, useCallback } from 'react'
import { toast } from 'sonner'

// UI Components
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

// Feature Components
import { CustomerMetrics } from './customer-metrics'
import { CustomerFilters } from './customer-filters'
import { CustomerTable } from './customer-table'
import { CustomerPagination } from './customer-pagination'
import { CustomerProfile } from './customer-profile'
import { CustomerCreateForm } from './customer-create-form'

// Hooks
import { useCustomerManagement } from '../hooks/use-customer-management'

// Types
import type { CustomerProfileWithRelations } from '../dal/customers-types'

interface CustomersDashboardProps {
  initialCustomers?: CustomerProfileWithRelations[]
  initialMetrics?: any
  role?: 'admin' | 'owner' | 'manager' | 'staff'
}

export function CustomersDashboard({
  initialCustomers = [],
  initialMetrics,
  role = 'manager'
}: CustomersDashboardProps) {
  // Custom hook for all business logic
  const {
    paginatedCustomers,
    selectedCustomers,
    searchQuery,
    statusFilter,
    segment,
    sortBy,
    sortOrder,
    currentPage,
    totalPages,
    loadingStates,
    isPending,
    metrics,
    filteredCustomers,
    itemsPerPage,
    setSelectedCustomers,
    setSearchQuery,
    setStatusFilter,
    setSegment,
    setSortBy,
    setSortOrder,
    setCurrentPage,
    setOptimisticCustomers,
    handleToggleVIP,
    handleToggleStatus,
    handleDelete
  } = useCustomerManagement({ initialCustomers })

  // Dialog/Modal state
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerProfileWithRelations | null>(null)
  const [showProfile, setShowProfile] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [deleteCustomerId, setDeleteCustomerId] = useState<string | null>(null)


  // Handle customer selection
  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      setSelectedCustomers(new Set(paginatedCustomers.map(c => c.id)))
    } else {
      setSelectedCustomers(new Set())
    }
  }, [paginatedCustomers, setSelectedCustomers])

  const handleSelectCustomer = useCallback((customerId: string, checked: boolean) => {
    setSelectedCustomers(prev => {
      const newSet = new Set(prev)
      if (checked) {
        newSet.add(customerId)
      } else {
        newSet.delete(customerId)
      }
      return newSet
    })
  }, [setSelectedCustomers])

  // Handle delete confirmation
  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteCustomerId) return

    await handleDelete(deleteCustomerId)
    setDeleteCustomerId(null)
  }, [deleteCustomerId, handleDelete])

  // Handle bulk operations
  const handleBulkOperation = useCallback(async (operation: 'delete' | 'export' | 'email') => {
    if (selectedCustomers.size === 0) {
      toast.error('Please select customers first')
      return
    }

    switch (operation) {
      case 'export':
        toast.info('Export functionality coming soon')
        break
      case 'email':
        toast.info('Bulk email functionality coming soon')
        break
      case 'delete':
        toast.info('Bulk delete functionality coming soon')
        break
    }
  }, [selectedCustomers])

  // Handle view profile
  const handleViewProfile = useCallback((customer: CustomerProfileWithRelations) => {
    setSelectedCustomer(customer)
    setShowProfile(true)
  }, [])

  return (
    <>
      <div className="space-y-6">
        {/* Customer Metrics */}
        <CustomerMetrics metrics={metrics} />

        {/* Customer Filters */}
        <CustomerFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          segment={segment}
          onSegmentChange={setSegment}
          sortBy={sortBy}
          onSortByChange={setSortBy}
          sortOrder={sortOrder}
          onSortOrderChange={setSortOrder}
          selectedCount={selectedCustomers.size}
          onBulkOperation={handleBulkOperation}
          onCreateCustomer={() => setShowCreateForm(true)}
        />

        {/* Customer Table */}
        <CustomerTable
          customers={paginatedCustomers}
          selectedCustomers={selectedCustomers}
          onSelectAll={handleSelectAll}
          onSelectCustomer={handleSelectCustomer}
          onToggleVIP={handleToggleVIP}
          onToggleStatus={handleToggleStatus}
          onDeleteCustomer={setDeleteCustomerId}
          onViewProfile={handleViewProfile}
          loadingStates={loadingStates}
          isPending={isPending}
        />

        {/* Pagination */}
        <CustomerPagination
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          totalItems={filteredCustomers.length}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Customer Profile Modal */}
      {selectedCustomer && showProfile && (
        <CustomerProfile
          customer={selectedCustomer}
          open={showProfile}
          onClose={() => {
            setShowProfile(false)
            setSelectedCustomer(null)
          }}
          onUpdate={(updatedCustomer) => {
            setOptimisticCustomers(prev =>
              prev.map(c => c.id === updatedCustomer.id ? updatedCustomer : c)
            )
          }}
        />
      )}

      {/* Create Customer Form */}
      {showCreateForm && (
        <CustomerCreateForm
          open={showCreateForm}
          onClose={() => setShowCreateForm(false)}
          onSuccess={(newCustomer) => {
            setOptimisticCustomers(prev => [newCustomer, ...prev])
            setShowCreateForm(false)
            toast.success('Customer created successfully')
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteCustomerId}
        onOpenChange={() => setDeleteCustomerId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              customer and remove their data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>
              Delete Customer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}