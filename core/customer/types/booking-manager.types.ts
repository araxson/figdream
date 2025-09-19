import type {
  BookingListItem,
  BookingStatus,
  BookingFilters,
  RecurringSettings,
  GroupBooking,
  WaitingListEntry
} from '../../types'

export interface BookingManagerProps {
  salonId: string
  initialFilters?: BookingFilters
  onBookingSelect?: (bookingId: string) => void
}

export interface BookingManagerState {
  bookings: BookingListItem[]
  selectedBooking: BookingListItem | null
  filters: BookingFilters
  searchTerm: string
  currentPage: number
  totalPages: number
  loading: boolean
  viewMode: 'list' | 'grid' | 'calendar'
  showFilters: boolean
}

export interface BookingDialogStates {
  showRescheduleDialog: boolean
  showCancelDialog: boolean
  showRecurringDialog: boolean
  showGroupDialog: boolean
  showWaitingListDialog: boolean
  showNotesDialog: boolean
}

export interface BookingFormState {
  cancelReason: string
  internalNotes: string
  recurringSettings: RecurringSettings
  waitingListEntry: Partial<WaitingListEntry>
}

export interface BookingActionsHandlers {
  handleReschedule: (bookingId: string) => Promise<void>
  handleCancel: (bookingId: string) => Promise<void>
  handleCheckIn: (bookingId: string) => Promise<void>
  handleMarkNoShow: (bookingId: string) => Promise<void>
  handleComplete: (bookingId: string) => Promise<void>
  handleAddNotes: (bookingId: string) => Promise<void>
}

export interface BookingListSectionProps {
  bookings: BookingListItem[]
  loading: boolean
  viewMode: 'list' | 'grid' | 'calendar'
  searchTerm: string
  filters: BookingFilters
  onBookingSelect?: (bookingId: string) => void
  onNewBooking?: () => void
  handlers: BookingActionsHandlers
}

export interface BookingFiltersSectionProps {
  filters: BookingFilters
  searchTerm: string
  showFilters: boolean
  viewMode: 'list' | 'grid' | 'calendar'
  loading: boolean
  onFiltersChange: (filters: BookingFilters) => void
  onSearchChange: (term: string) => void
  onShowFiltersToggle: () => void
  onViewModeChange: (mode: 'list' | 'grid' | 'calendar') => void
  onRefresh: () => void
}

export interface BookingDetailsModalProps {
  booking: BookingListItem | null
  open: boolean
  onClose: () => void
  onUpdate: () => void
}

export interface BookingActionsToolbarProps {
  onNewBooking?: () => void
  onRecurring: () => void
  onGroup: () => void
  onWaitingList: () => void
}

export interface BookingStatsCardsProps {
  stats: {
    total: number
    confirmed: number
    pending: number
    completed: number
    cancelled: number
    revenue: number
  }
}