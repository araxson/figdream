import { Service, WalkInFormData } from '@/types/features/walk-in-types'

export async function createWalkInAppointment(
  salonId: string,
  formData: WalkInFormData,
  selectedServices: string[],
  services: Service[]
) {
  const response = await fetch('/api/appointments/walk-in', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      salonId,
      formData,
      selectedServices,
      services
    })
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to create walk-in appointment')
  }

  return response.json()
}

export function calculateTotal(selectedServices: string[], services: Service[]): number {
  return selectedServices.reduce((sum, serviceId) => {
    const service = services.find(s => s.id === serviceId)
    return sum + (service?.price || 0)
  }, 0)
}

export function calculateDuration(selectedServices: string[], services: Service[]): number {
  return selectedServices.reduce((sum, serviceId) => {
    const service = services.find(s => s.id === serviceId)
    return sum + (service?.duration_minutes || 0)
  }, 0)
}