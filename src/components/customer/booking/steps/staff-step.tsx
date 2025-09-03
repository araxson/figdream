'use client'

import { StaffSelector } from '@/components/customer/booking/staff-selector'
import type { StepContentProps } from '@/components/customer/booking/booking-form-types'

export function StaffStep({
  selectedServices,
  selectedStaff,
  setSelectedStaff,
  selectedDate,
  selectedTimeSlot,
  locationId,
  disabled
}: StepContentProps) {
  return (
    <StaffSelector
      locationId={locationId}
      serviceIds={selectedServices.map(s => s.id)}
      selectedDate={selectedDate}
      selectedTime={selectedTimeSlot?.start_time}
      selectedStaff={selectedStaff}
      onStaffSelect={setSelectedStaff}
      allowAnyStaff={true}
      showAvailability={true}
      showRatings={true}
      disabled={disabled}
    />
  )
}