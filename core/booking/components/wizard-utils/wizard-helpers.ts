import type { BookingWizardState, ServiceSelection } from '../../types'

export function calculateTotals(state: BookingWizardState) {
  const allServices = [...state.selectedServices, ...state.selectedAddons]

  const subtotal = allServices.reduce(
    (sum, service) => sum + (service.price * service.quantity),
    0
  )

  const tax = subtotal * 0.1 // 10% tax rate
  const total = subtotal + tax

  const totalDuration = allServices.reduce(
    (sum, service) => sum + (service.duration * service.quantity),
    0
  )

  return {
    subtotal,
    tax,
    total,
    totalDuration
  }
}

export function formatPrice(amount: number): string {
  return `$${amount.toFixed(2)}`
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`
  }
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (mins === 0) {
    return `${hours}h`
  }
  return `${hours}h ${mins}min`
}

export function generateTimeSlots(
  startHour = 9,
  endHour = 19,
  intervalMinutes = 30
) {
  const slots = []
  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += intervalMinutes) {
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
      slots.push({
        time,
        available: Math.random() > 0.3 // This should be replaced with actual availability
      })
    }
  }
  return slots
}