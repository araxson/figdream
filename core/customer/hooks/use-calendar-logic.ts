import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import type {
  TimeSlot,
  DailyAvailability,
  StaffAvailability,
  StaffProfile,
  Service,
  BookingConflict,
  CapacityInfo
} from '../types'

interface UseCalendarLogicProps {
  salonId: string
  initialDate?: Date
  onSlotSelect?: (date: Date, time: string, staffId?: string) => void
}

export function useCalendarLogic({
  salonId,
  initialDate = new Date(),
  onSlotSelect
}: UseCalendarLogicProps) {
  const [selectedDate, setSelectedDate] = useState(initialDate)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [availability, setAvailability] = useState<DailyAvailability[]>([])
  const [staffAvailability, setStaffAvailability] = useState<StaffAvailability[]>([])
  const [conflicts, setConflicts] = useState<BookingConflict[]>([])
  const [capacityInfo, setCapacityInfo] = useState<CapacityInfo[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [staff, setStaff] = useState<StaffProfile[]>([])
  const [selectedService, setSelectedService] = useState<Service | undefined>()
  const [selectedStaff, setSelectedStaff] = useState<StaffProfile | undefined>()
  const [selectedTime, setSelectedTime] = useState<string | undefined>()

  // Generate time slots for the day
  const generateTimeSlots = useCallback((date: Date): TimeSlot[] => {
    const slots: TimeSlot[] = []
    const start = 9 // 9 AM
    const end = 18 // 6 PM
    const interval = 30 // 30 minutes

    for (let hour = start; hour < end; hour++) {
      for (let minute = 0; minute < 60; minute += interval) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`

        // Mock availability logic
        const slotTime = new Date(`${date.toDateString()} ${time}`)
        const isAvailable = slotTime > new Date() && Math.random() > 0.3

        slots.push({
          time,
          available: isAvailable,
          capacity: {
            available: isAvailable ? Math.floor(Math.random() * 3) + 1 : 0,
            total: 3
          },
          staffId: selectedStaff?.id,
          staffName: selectedStaff?.name
        })
      }
    }

    return slots
  }, [selectedStaff])

  // Load availability data
  const loadAvailability = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Mock API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 500))

      // Generate mock data for a week
      const startDate = new Date(selectedDate)
      startDate.setDate(selectedDate.getDate() - selectedDate.getDay())

      const dailyData: DailyAvailability[] = []

      for (let i = 0; i < 7; i++) {
        const date = new Date(startDate)
        date.setDate(startDate.getDate() + i)

        const slots = generateTimeSlots(date)
        const availableSlots = slots.filter(s => s.available)

        dailyData.push({
          date,
          slots,
          isFullyBooked: availableSlots.length === 0,
          availableCount: availableSlots.length,
          totalCount: slots.length
        })
      }

      setAvailability(dailyData)

      // Mock staff availability
      if (staff.length > 0) {
        const staffData: StaffAvailability[] = staff.map(member => ({
          id: member.id,
          name: member.name,
          role: member.role,
          avatar: member.avatar,
          availableSlots: Math.floor(Math.random() * 10) + 1,
          totalSlots: 16,
          nextAvailableSlot: '10:30 AM',
          specialties: member.specialties || []
        }))
        setStaffAvailability(staffData)
      }

      // Mock capacity info
      const capacityData: CapacityInfo[] = dailyData.map(day => ({
        date: day.date,
        totalCapacity: day.totalCount * 3,
        bookedCapacity: (day.totalCount - day.availableCount) * 3,
        utilizationPercentage: Math.round(((day.totalCount - day.availableCount) / day.totalCount) * 100)
      }))
      setCapacityInfo(capacityData)

    } catch (err) {
      setError('Failed to load availability data')
      toast.error('Failed to load availability data')
    } finally {
      setLoading(false)
    }
  }, [selectedDate, generateTimeSlots, staff])

  // Auto-refresh every 5 minutes
  useEffect(() => {
    loadAvailability()

    const interval = setInterval(loadAvailability, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [loadAvailability])

  // Check for booking conflicts
  const checkConflicts = useCallback((date: Date, time: string, staffId?: string) => {
    const conflicts: BookingConflict[] = []

    // Mock conflict detection
    if (Math.random() > 0.7) {
      conflicts.push({
        type: 'staff_unavailable',
        severity: 'high',
        description: 'Selected staff member is not available at this time',
        details: 'Staff member has a break scheduled during this time slot',
        affectedBooking: {
          date: date.toLocaleDateString(),
          time,
          staffName: selectedStaff?.name
        },
        suggestedAlternatives: [
          { time: '10:30', staffId, staffName: selectedStaff?.name },
          { time: '11:00', staffId, staffName: selectedStaff?.name }
        ]
      })
    }

    setConflicts(conflicts)
    return conflicts
  }, [selectedStaff])

  // Handle slot selection
  const handleSlotSelect = useCallback((date: Date, time: string, staffId?: string) => {
    const detectedConflicts = checkConflicts(date, time, staffId)

    if (detectedConflicts.length === 0) {
      setSelectedTime(time)
      onSlotSelect?.(date, time, staffId)
    } else {
      toast.error('Booking conflicts detected. Please resolve them first.')
    }
  }, [checkConflicts, onSlotSelect])

  // Get availability for a specific date
  const getAvailabilityForDate = useCallback((date: Date) => {
    return availability.find(a =>
      a.date.toDateString() === date.toDateString()
    )
  }, [availability])

  // Handle service selection
  const handleServiceSelect = useCallback((service: Service | undefined) => {
    setSelectedService(service)
    // Reload availability based on service requirements
    loadAvailability()
  }, [loadAvailability])

  // Handle staff selection
  const handleStaffSelect = useCallback((staffMember: StaffProfile | undefined) => {
    setSelectedStaff(staffMember)
    // Reload availability based on staff selection
    loadAvailability()
  }, [loadAvailability])

  // Resolve conflicts
  const resolveConflict = useCallback((conflictIndex: number, resolution: any) => {
    const updatedConflicts = [...conflicts]
    updatedConflicts.splice(conflictIndex, 1)
    setConflicts(updatedConflicts)

    toast.success('Conflict resolved successfully')
  }, [conflicts])

  return {
    // State
    selectedDate,
    loading,
    error,
    availability,
    staffAvailability,
    conflicts,
    capacityInfo,
    services,
    staff,
    selectedService,
    selectedStaff,
    selectedTime,

    // Actions
    setSelectedDate,
    loadAvailability,
    handleSlotSelect,
    getAvailabilityForDate,
    handleServiceSelect,
    handleStaffSelect,
    resolveConflict,
    checkConflicts
  }
}