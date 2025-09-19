import type { BookingWizardState, BookingStep } from '../../types'
import { WIZARD_STEPS } from './wizard-types'

export function getInitialWizardState(): BookingWizardState {
  return {
    currentStep: 'service',
    selectedServices: [],
    selectedStaff: null,
    selectedDate: null,
    selectedTime: null,
    customerInfo: null,
    selectedAddons: [],
    paymentMethod: null,
    bookingSource: 'online'
  }
}

export function validateStep(state: BookingWizardState, step: BookingStep): boolean {
  switch (step) {
    case 'service':
      return state.selectedServices.length > 0
    case 'staff':
      return true // Staff is optional
    case 'datetime':
      return state.selectedDate !== null && state.selectedTime !== null
    case 'customer':
      return state.customerInfo !== null &&
             state.customerInfo.firstName !== '' &&
             state.customerInfo.lastName !== '' &&
             state.customerInfo.email !== '' &&
             state.customerInfo.phone !== ''
    case 'addons':
      return true // Add-ons are optional
    case 'payment':
      return state.paymentMethod !== null
    case 'confirmation':
      return true
    default:
      return false
  }
}

export function getStepIndex(step: BookingStep): number {
  return WIZARD_STEPS.findIndex(s => s.id === step)
}

export function getNextStep(currentStep: BookingStep): BookingStep | null {
  const currentIndex = getStepIndex(currentStep)
  if (currentIndex < WIZARD_STEPS.length - 1) {
    return WIZARD_STEPS[currentIndex + 1].id
  }
  return null
}

export function getPreviousStep(currentStep: BookingStep): BookingStep | null {
  const currentIndex = getStepIndex(currentStep)
  if (currentIndex > 0) {
    return WIZARD_STEPS[currentIndex - 1].id
  }
  return null
}

export function calculateProgress(currentStep: BookingStep): number {
  const currentIndex = getStepIndex(currentStep)
  return ((currentIndex + 1) / WIZARD_STEPS.length) * 100
}