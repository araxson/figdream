'use client'

import { AppointmentList } from '@/components/features/appointments/appointment-list'

interface CustomerAppointmentsProps {
  customerId?: string
}

export function CustomerAppointments({ customerId }: CustomerAppointmentsProps) {
  return (
    <AppointmentList 
      userRole="customer"
      view="all"
      displayMode="card"
      customerId={customerId}
      limit={10}
    />
  )
}