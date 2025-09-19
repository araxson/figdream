'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type {
  BookingManagerProps,
  BookingManagerState,
  BookingDialogStates,
  BookingFormState,
  BookingActionsHandlers
} from './booking-utils/booking-manager-types'
import type { BookingListItem, BookingStatus, BookingFilters } from '../types'
import { BookingActionsToolbar } from './booking-sections/booking-actions-toolbar'
import { BookingFiltersSection } from './booking-sections/booking-filters-section'
import { BookingListSection } from './booking-sections/booking-list-section'
import { BookingCancelDialog, BookingNotesDialog } from './booking-sections/booking-details-modal'
import { ITEMS_PER_PAGE } from './booking-utils/booking-manager-helpers'

export function BookingManager({
  salonId,
  initialFilters = {},
  onBookingSelect
}: BookingManagerProps) {
  const [state, setState] = useState<BookingManagerState>({
    bookings: [],
    selectedBooking: null,
    filters: initialFilters,
    searchTerm: '',
    currentPage: 1,
    totalPages: 1,
    loading: false,
    viewMode: 'list',
    showFilters: false
  })

  const [dialogs, setDialogs] = useState<BookingDialogStates>({
    showRescheduleDialog: false,
    showCancelDialog: false,
    showRecurringDialog: false,
    showGroupDialog: false,
    showWaitingListDialog: false,
    showNotesDialog: false
  })

  const [forms, setForms] = useState<BookingFormState>({
    cancelReason: '',
    internalNotes: '',
    recurringSettings: {
      frequency: 'weekly',
      interval: 1
    },
    waitingListEntry: {}
  })

  useEffect(() => {
    loadBookings()
  }, [state.filters, state.searchTerm, state.currentPage])

  const loadBookings = async () => {
    setState(prev => ({ ...prev, loading: true }))
    try {
      const mockBookings: BookingListItem[] = [
        {
          id: '1',
          salon_id: salonId,
          customer_id: 'cust1',
          customerName: 'Jane Smith',
          staff_id: 'staff1',
          staffName: 'Sarah Johnson',
          start_time: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
          end_time: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
          duration_minutes: 60,
          status: 'confirmed',
          confirmation_code: 'BK123456',
          service_count: 2,
          services: ['Haircut & Style', 'Hair Color'],
          subtotal: 200,
          total_amount: 220,
          payment_status: 'pending',
          canReschedule: true,
          canCancel: true
        },
        {
          id: '2',
          salon_id: salonId,
          customer_id: 'cust2',
          customerName: 'John Doe',
          staff_id: 'staff2',
          staffName: 'Mike Chen',
          start_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          end_time: new Date(Date.now() + 24.5 * 60 * 60 * 1000).toISOString(),
          duration_minutes: 30,
          status: 'pending',
          confirmation_code: 'BK789012',
          service_count: 1,
          services: ['Manicure'],
          subtotal: 35,
          total_amount: 38.50,
          payment_status: 'pending',
          canReschedule: true,
          canCancel: true
        },
        {
          id: '3',
          salon_id: salonId,
          customer_id: 'cust3',
          customerName: 'Emily Brown',
          staff_id: 'staff1',
          staffName: 'Sarah Johnson',
          start_time: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          end_time: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString(),
          duration_minutes: 60,
          status: 'completed',
          confirmation_code: 'BK345678',
          service_count: 1,
          services: ['Deep Conditioning Treatment'],
          subtotal: 75,
          total_amount: 82.50,
          payment_status: 'paid',
          paid_at: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString(),
          canReschedule: false,
          canCancel: false
        }
      ]

      let filteredBookings = mockBookings

      if (state.filters.status && state.filters.status.length > 0) {
        filteredBookings = filteredBookings.filter(b =>
          state.filters.status!.includes(b.status as BookingStatus)
        )
      }

      if (state.filters.staffId) {
        filteredBookings = filteredBookings.filter(b => b.staff_id === state.filters.staffId)
      }

      if (state.filters.customerId) {
        filteredBookings = filteredBookings.filter(b => b.customer_id === state.filters.customerId)
      }

      if (state.searchTerm) {
        filteredBookings = filteredBookings.filter(b =>
          b.customerName.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
          b.confirmation_code?.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
          b.services.some(s => s.toLowerCase().includes(state.searchTerm.toLowerCase()))
        )
      }

      const total = filteredBookings.length
      const totalPages = Math.ceil(total / ITEMS_PER_PAGE)
      const start = (state.currentPage - 1) * ITEMS_PER_PAGE
      const end = start + ITEMS_PER_PAGE

      setState(prev => ({
        ...prev,
        bookings: filteredBookings.slice(start, end),
        totalPages,
        loading: false
      }))
    } catch (error) {
      console.error('Error loading bookings:', error)
      setState(prev => ({ ...prev, loading: false }))
    }
  }

  const handlers: BookingActionsHandlers = {
    handleReschedule: async (bookingId: string) => {
      const booking = state.bookings.find(b => b.id === bookingId)
      setState(prev => ({ ...prev, selectedBooking: booking || null }))
      setDialogs(prev => ({ ...prev, showRescheduleDialog: true }))
    },

    handleCancel: async (bookingId: string) => {
      const booking = state.bookings.find(b => b.id === bookingId)
      setState(prev => ({ ...prev, selectedBooking: booking || null }))
      setDialogs(prev => ({ ...prev, showCancelDialog: true }))
    },

    handleCheckIn: async (bookingId: string) => {
      await loadBookings()
    },

    handleMarkNoShow: async (bookingId: string) => {
      await loadBookings()
    },

    handleComplete: async (bookingId: string) => {
      await loadBookings()
    },

    handleAddNotes: async (bookingId: string) => {
      const booking = state.bookings.find(b => b.id === bookingId)
      setState(prev => ({ ...prev, selectedBooking: booking || null }))
      setDialogs(prev => ({ ...prev, showNotesDialog: true }))
    }
  }

  const handleFiltersChange = (filters: BookingFilters) => {
    setState(prev => ({ ...prev, filters, currentPage: 1 }))
  }

  const handleSearchChange = (searchTerm: string) => {
    setState(prev => ({ ...prev, searchTerm, currentPage: 1 }))
  }

  const handleViewModeChange = (viewMode: 'list' | 'grid' | 'calendar') => {
    setState(prev => ({ ...prev, viewMode }))
  }

  const handlePageChange = (page: number) => {
    setState(prev => ({ ...prev, currentPage: page }))
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Bookings</h2>
          <p className="text-muted-foreground">Manage appointments and schedules</p>
        </div>
        <BookingActionsToolbar
          onNewBooking={() => window.location.href = '/booking'}
          onRecurring={() => setDialogs(prev => ({ ...prev, showRecurringDialog: true }))}
          onGroup={() => setDialogs(prev => ({ ...prev, showGroupDialog: true }))}
          onWaitingList={() => setDialogs(prev => ({ ...prev, showWaitingListDialog: true }))}
        />
      </div>

      <BookingFiltersSection
        filters={state.filters}
        searchTerm={state.searchTerm}
        showFilters={state.showFilters}
        viewMode={state.viewMode}
        loading={state.loading}
        onFiltersChange={handleFiltersChange}
        onSearchChange={handleSearchChange}
        onShowFiltersToggle={() => setState(prev => ({ ...prev, showFilters: !prev.showFilters }))}
        onViewModeChange={handleViewModeChange}
        onRefresh={loadBookings}
      />

      <BookingListSection
        bookings={state.bookings}
        loading={state.loading}
        viewMode={state.viewMode}
        searchTerm={state.searchTerm}
        filters={state.filters}
        onBookingSelect={onBookingSelect}
        onNewBooking={() => window.location.href = '/booking'}
        handlers={handlers}
        currentPage={state.currentPage}
        totalPages={state.totalPages}
        onPageChange={handlePageChange}
      />

      {state.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {state.currentPage} of {state.totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(Math.max(1, state.currentPage - 1))}
              disabled={state.currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(Math.min(state.totalPages, state.currentPage + 1))}
              disabled={state.currentPage === state.totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <BookingCancelDialog
        booking={state.selectedBooking}
        open={dialogs.showCancelDialog}
        onClose={() => setDialogs(prev => ({ ...prev, showCancelDialog: false }))}
        onUpdate={loadBookings}
      />

      <BookingNotesDialog
        booking={state.selectedBooking}
        open={dialogs.showNotesDialog}
        onClose={() => setDialogs(prev => ({ ...prev, showNotesDialog: false }))}
        onUpdate={loadBookings}
      />
    </div>
  )
}