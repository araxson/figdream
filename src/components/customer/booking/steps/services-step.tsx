'use client'

import { ServiceSelector } from '@/components/customer/booking/service-selector'
import type { StepContentProps } from '@/components/customer/booking/booking-form-types'

export function ServicesStep({
  selectedServices,
  setSelectedServices,
  selectedStaff,
  locationId,
  disabled
}: StepContentProps) {
  return (
    <ServiceSelector
      locationId={locationId}
      staffId={selectedStaff?.id}
      selectedServices={selectedServices}
      onServiceSelect={setSelectedServices}
      allowMultiple={true}
      showCategories={true}
      showSearch={true}
      disabled={disabled}
    />
  )
}