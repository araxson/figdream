// Booking hooks for data fetching and mutations
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import type {
  BookingWizardState,
  BookingListItem,
  BookingFilters,
  TimeSlot,
  Service,
  ServiceCategory,
  StaffProfile,
  BookingConfirmation,
  BookingAnalytics,
  CapacityInfo,
  WaitingListEntry,
  RecurringSettings,
  GroupBooking
} from '../types'
import {
  getAvailableServices,
  getServiceCategories,
  getAvailableStaff,
  getAvailableTimeSlots,
  getBookings,
  getBookingById,
  getCapacityInfo,
  getBookingAnalytics,
  getWaitingList,
  createBooking,
  updateBookingStatus,
  rescheduleBooking,
  cancelBooking,
  checkInCustomer,
  completeAppointment,
  addToWaitingList,
  createRecurringBookings,
  createGroupBooking,
  updatePaymentStatus,
  addAppointmentNotes
} from '../dal'

// Hook for fetching services and categories
export function useServices(salonId: string) {
  const [services, setServices] = useState<Service[]>([])
  const [categories, setCategories] = useState<ServiceCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        const [servicesData, categoriesData] = await Promise.all([
          getAvailableServices(salonId),
          getServiceCategories(salonId)
        ])

        setServices(servicesData)
        setCategories(categoriesData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch services')
        toast.error('Failed to load services')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [salonId])

  return { services, categories, loading, error }
}

// Hook for fetching staff members
export function useStaff(salonId: string, serviceIds?: string[]) {
  const [staff, setStaff] = useState<StaffProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        setLoading(true)
        setError(null)

        const staffData = await getAvailableStaff(salonId, serviceIds)
        setStaff(staffData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch staff')
        toast.error('Failed to load staff members')
      } finally {
        setLoading(false)
      }
    }

    fetchStaff()
  }, [salonId, serviceIds?.join(',')])

  return { staff, loading, error }
}

// Hook for fetching available time slots
export function useAvailability(
  salonId: string,
  date: Date | null,
  serviceDuration: number,
  staffId?: string
) {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!date || serviceDuration <= 0) {
      setTimeSlots([])
      return
    }

    const fetchSlots = async () => {
      try {
        setLoading(true)
        setError(null)

        const slots = await getAvailableTimeSlots(salonId, date, serviceDuration, staffId)
        setTimeSlots(slots)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch availability')
        toast.error('Failed to load available times')
      } finally {
        setLoading(false)
      }
    }

    fetchSlots()
  }, [salonId, date?.toDateString(), serviceDuration, staffId])

  return { timeSlots, loading, error }
}

// Hook for managing bookings list
export function useBookingsList(salonId: string, initialFilters?: BookingFilters) {
  const [bookings, setBookings] = useState<BookingListItem[]>([])
  const [filters, setFilters] = useState<BookingFilters>(initialFilters || {})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const bookingsData = await getBookings(salonId, filters)
      setBookings(bookingsData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch bookings')
      toast.error('Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }, [salonId, filters])

  useEffect(() => {
    fetchBookings()
  }, [fetchBookings])

  const refetch = () => fetchBookings()

  return { bookings, filters, setFilters, loading, error, refetch }
}

// Hook for creating a booking
export function useCreateBooking() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const createNewBooking = async (bookingData: BookingWizardState) => {
    try {
      setLoading(true)
      setError(null)

      const appointment = await createBooking(bookingData)

      toast.success('Booking created successfully!')

      // Redirect to confirmation page
      router.push(`/booking/confirmation/${appointment.id}`)

      return appointment
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create booking'
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { createBooking: createNewBooking, loading, error }
}

// Hook for updating booking status
export function useUpdateBookingStatus() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateStatus = async (
    appointmentId: string,
    status: BookingListItem['status'],
    reason?: string
  ) => {
    try {
      setLoading(true)
      setError(null)

      const updated = await updateBookingStatus(appointmentId, status as any, reason)

      toast.success(`Booking ${status}`)

      return updated
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update booking'
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const cancel = (appointmentId: string, reason: string) =>
    updateStatus(appointmentId, 'cancelled', reason)

  const checkIn = (appointmentId: string) =>
    updateStatus(appointmentId, 'checked_in')

  const complete = (appointmentId: string) =>
    updateStatus(appointmentId, 'completed')

  const markNoShow = (appointmentId: string) =>
    updateStatus(appointmentId, 'no_show')

  return {
    updateStatus,
    cancel,
    checkIn,
    complete,
    markNoShow,
    loading,
    error
  }
}

// Hook for rescheduling bookings
export function useRescheduleBooking() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const reschedule = async (
    appointmentId: string,
    newDate: Date,
    newTime: string,
    newStaffId?: string
  ) => {
    try {
      setLoading(true)
      setError(null)

      const updated = await rescheduleBooking(appointmentId, newDate, newTime, newStaffId)

      toast.success('Booking rescheduled successfully')

      return updated
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reschedule booking'
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { reschedule, loading, error }
}

// Hook for booking analytics
export function useBookingAnalytics(
  salonId: string,
  startDate: Date,
  endDate: Date
) {
  const [analytics, setAnalytics] = useState<BookingAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true)
        setError(null)

        const data = await getBookingAnalytics(salonId, startDate, endDate)
        setAnalytics(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch analytics')
        toast.error('Failed to load analytics')
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [salonId, startDate.toDateString(), endDate.toDateString()])

  return { analytics, loading, error }
}

// Hook for capacity information
export function useCapacityInfo(
  salonId: string,
  startDate: Date,
  endDate: Date
) {
  const [capacity, setCapacity] = useState<CapacityInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCapacity = async () => {
      try {
        setLoading(true)
        setError(null)

        const data = await getCapacityInfo(salonId, startDate, endDate)
        setCapacity(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch capacity')
      } finally {
        setLoading(false)
      }
    }

    fetchCapacity()
  }, [salonId, startDate.toDateString(), endDate.toDateString()])

  return { capacity, loading, error }
}

// Hook for waiting list
export function useWaitingList(
  salonId: string,
  filters?: {
    serviceIds?: string[]
    staffId?: string
    dateRange?: { start: Date; end: Date }
  }
) {
  const [waitingList, setWaitingList] = useState<WaitingListEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchWaitingList = async () => {
      try {
        setLoading(true)
        setError(null)

        const data = await getWaitingList(salonId, filters)
        setWaitingList(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch waiting list')
      } finally {
        setLoading(false)
      }
    }

    fetchWaitingList()
  }, [salonId, JSON.stringify(filters)])

  const addEntry = async (entry: Omit<WaitingListEntry, 'id' | 'createdAt' | 'notified' | 'notifiedAt'>) => {
    try {
      await addToWaitingList(entry)
      toast.success('Added to waiting list')
      // Refetch waiting list
      const data = await getWaitingList(salonId, filters)
      setWaitingList(data)
    } catch (err) {
      toast.error('Failed to add to waiting list')
      throw err
    }
  }

  return { waitingList, loading, error, addEntry }
}

// Hook for recurring bookings
export function useRecurringBookings() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createRecurring = async (
    baseBookingData: BookingWizardState,
    recurringSettings: RecurringSettings
  ) => {
    try {
      setLoading(true)
      setError(null)

      const appointments = await createRecurringBookings(baseBookingData, recurringSettings)

      toast.success(`Created ${appointments.length} recurring appointments`)

      return appointments
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create recurring bookings'
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { createRecurring, loading, error }
}

// Hook for group bookings
export function useGroupBooking() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createGroup = async (groupData: GroupBooking) => {
    try {
      setLoading(true)
      setError(null)

      const appointments = await createGroupBooking(groupData)

      toast.success(`Created ${appointments.length} group bookings`)

      return appointments
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create group booking'
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { createGroup, loading, error }
}

// Hook for booking confirmation
export function useBookingConfirmation(appointmentId: string) {
  const [confirmation, setConfirmation] = useState<BookingConfirmation | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchConfirmation = async () => {
      try {
        setLoading(true)
        setError(null)

        const booking = await getBookingById(appointmentId)

        // Transform to confirmation format
        const confirmationData: BookingConfirmation = {
          confirmationCode: booking.confirmation_code!,
          appointment: booking,
          services: booking.appointment_services || [],
          staff: booking.staff,
          salon: booking.salon,
          totalAmount: booking.total_amount || 0,
          depositAmount: booking.deposit_amount,
          cancellationPolicy: '24 hour cancellation policy applies'
        }

        setConfirmation(confirmationData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch booking confirmation')
        toast.error('Failed to load booking confirmation')
      } finally {
        setLoading(false)
      }
    }

    if (appointmentId) {
      fetchConfirmation()
    }
  }, [appointmentId])

  return { confirmation, loading, error }
}