import { format, addMinutes } from 'date-fns'
import type { SelectedService } from './booking-types'
import type { BookingTotals } from './booking-form-types'

export const calculateEndTime = (startTime: string, durationMinutes: number): string => {
  if (!startTime) return ''
  const [hours, minutes] = startTime.split(':').map(Number)
  const startDate = new Date()
  startDate.setHours(hours, minutes, 0, 0)
  const endDate = addMinutes(startDate, durationMinutes)
  return format(endDate, 'HH:mm:ss')
}

export const calculateTotals = (
  selectedServices: SelectedService[],
  businessRules: {
    require_deposit: boolean
    deposit_percentage: number
  }
): BookingTotals => {
  const totalPrice = selectedServices.reduce((sum, service) => sum + service.total_price, 0)
  const totalDuration = selectedServices.reduce((sum, service) => sum + service.total_duration, 0)
  const depositAmount = businessRules.require_deposit 
    ? Math.round(totalPrice * businessRules.deposit_percentage / 100) 
    : 0
    
  return {
    totalPrice,
    totalDuration,
    depositAmount,
    finalAmount: totalPrice - depositAmount
  }
}

export const formatTimeDisplay = (time: string): string => {
  const [hour, minute] = time.split(':').map(Number)
  const period = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
  return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`
}