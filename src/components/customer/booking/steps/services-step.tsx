'use client'

import { ServiceSelector } from '../service-selector'
import type { StepContentProps } from '../booking-form-types'

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