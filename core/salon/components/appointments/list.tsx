'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody } from '@/components/ui/table'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { AppointmentFilters } from './appointment-filters'
import { AppointmentTableHeader } from './appointment-table-header'
import { AppointmentTableRow } from './appointment-table-row'
import { AppointmentRowExpansion } from './appointment-row-expansion'
import { AppointmentBulkActions } from './appointment-bulk-actions'
import { useAppointmentList } from '../hooks/use-appointment-list'
import type { AppointmentWithRelations } from '../types'

interface AppointmentListProps {
  appointments: AppointmentWithRelations[]
  loading?: boolean
  onAppointmentClick?: (appointment: AppointmentWithRelations) => void
  onAppointmentEdit?: (appointment: AppointmentWithRelations) => void
  onAppointmentCancel?: (appointment: AppointmentWithRelations) => void
  onAppointmentCheckIn?: (appointment: AppointmentWithRelations) => void
  onAppointmentComplete?: (appointment: AppointmentWithRelations) => void
  onBulkAction?: (action: string, appointmentIds: string[]) => void
  onExport?: () => void
  showFilters?: boolean
  showBulkActions?: boolean
  viewMode?: 'table' | 'cards'
}

function AppointmentSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4 p-4">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-4 w-[150px]" />
          </div>
          <Skeleton className="h-4 w-[100px]" />
          <Skeleton className="h-4 w-[80px]" />
        </div>
      ))}
    </div>
  )
}

export function AppointmentList({
  appointments,
  loading = false,
  onAppointmentClick,
  onAppointmentEdit,
  onAppointmentCancel,
  onAppointmentCheckIn,
  onAppointmentComplete,
  onBulkAction,
  onExport,
  showFilters = true,
  showBulkActions = true,
  viewMode = 'table',
}: AppointmentListProps) {
  const {
    selectedAppointments,
    searchQuery,
    statusFilter,
    paymentFilter,
    sortField,
    sortOrder,
    expandedRows,
    visibleColumns,
    filteredAppointments,
    setSearchQuery,
    setStatusFilter,
    setPaymentFilter,
    setVisibleColumns,
    toggleAppointmentSelection,
    toggleAllAppointments,
    toggleRowExpansion,
    handleSort,
    clearSelection,
    allSelected,
    selectedAppointmentIds,
  } = useAppointmentList({ appointments })

  const handleBulkAction = (action: string, appointmentIds: string[]) => {
    if (action === 'clear') {
      clearSelection()
    } else {
      onBulkAction?.(action, appointmentIds)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Appointments</CardTitle>
          <CardDescription>Loading appointments...</CardDescription>
        </CardHeader>
        <CardContent>
          <AppointmentSkeleton />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Appointments ({filteredAppointments.length})</CardTitle>
        <CardDescription>
          Manage your salon appointments and bookings
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {showFilters && (
          <AppointmentFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            paymentFilter={paymentFilter}
            onPaymentFilterChange={setPaymentFilter}
            visibleColumns={visibleColumns}
            onVisibleColumnsChange={setVisibleColumns}
            onExport={onExport}
          />
        )}

        {showBulkActions && (
          <AppointmentBulkActions
            selectedCount={selectedAppointments.size}
            onBulkAction={handleBulkAction}
            selectedAppointmentIds={selectedAppointmentIds}
          />
        )}

        <ScrollArea className="h-[600px] w-full">
          <Table>
            <AppointmentTableHeader
              visibleColumns={visibleColumns}
              sortField={sortField}
              sortOrder={sortOrder}
              onSort={handleSort}
              allSelected={allSelected}
              onToggleAll={toggleAllAppointments}
              showBulkActions={showBulkActions}
            />

            <TableBody>
              {filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan={visibleColumns.size} className="text-center py-8 text-muted-foreground">
                    No appointments found matching your criteria
                  </td>
                </tr>
              ) : (
                filteredAppointments.map((appointment) => {
                  const isSelected = selectedAppointments.has(appointment.id)
                  const isExpanded = expandedRows.has(appointment.id)

                  return (
                    <>
                      <AppointmentTableRow
                        key={appointment.id}
                        appointment={appointment}
                        isSelected={isSelected}
                        isExpanded={isExpanded}
                        visibleColumns={visibleColumns}
                        onToggleSelection={toggleAppointmentSelection}
                        onToggleExpansion={toggleRowExpansion}
                        onAppointmentClick={onAppointmentClick}
                        onAppointmentEdit={onAppointmentEdit}
                        onAppointmentCancel={onAppointmentCancel}
                        onAppointmentCheckIn={onAppointmentCheckIn}
                        onAppointmentComplete={onAppointmentComplete}
                        showBulkActions={showBulkActions}
                      />
                      {isExpanded && (
                        <AppointmentRowExpansion
                          appointment={appointment}
                          colSpan={visibleColumns.size}
                        />
                      )}
                    </>
                  )
                })
              )}
            </TableBody>
          </Table>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

// Also export all the new modular components for direct use
export { AppointmentFilters } from './appointment-filters'
export { AppointmentTableHeader } from './appointment-table-header'
export { AppointmentTableRow } from './appointment-table-row'
export { AppointmentRowExpansion } from './appointment-row-expansion'
export { AppointmentBulkActions } from './appointment-bulk-actions'