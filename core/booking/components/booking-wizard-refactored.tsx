'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  ChevronRight,
  ChevronLeft,
  Clock,
  Check,
  User,
  Calendar as CalendarIcon,
  Plus,
  CreditCard,
  AlertCircle
} from 'lucide-react'
import type {
  BookingWizardState,
  BookingStep,
  Service,
  ServiceCategory,
  StaffProfile,
  TimeSlot,
  ServiceSelection
} from '../types'

// Import wizard steps
import { ServiceSelectionStep } from './wizard-steps/service-selection-step'
import { StaffSelectionStep } from './wizard-steps/staff-selection-step'
import { DateTimeSelectionStep } from './wizard-steps/datetime-selection-step'
import { CustomerInfoStep } from './wizard-steps/customer-info-step'
import { AddonsStep } from './wizard-steps/addons-step'
import { PaymentStep } from './wizard-steps/payment-step'
import { ConfirmationStep } from './wizard-steps/confirmation-step'

// Import utilities
import {
  getInitialWizardState,
  validateStep,
  getStepIndex,
  getNextStep,
  getPreviousStep,
  calculateProgress
} from './wizard-utils/wizard-state'
import { calculateTotals } from './wizard-utils/wizard-helpers'
import { BookingSummary } from './booking-summary'
import {
  getMockCategories,
  getMockServices,
  getMockStaff,
  getMockTimeSlots
} from './wizard-utils/mock-data'

interface BookingWizardProps {
  salonId: string
  onCancel?: () => void
}

const STEPS: { id: BookingStep; label: string; icon: React.ElementType }[] = [
  { id: 'service', label: 'Services', icon: Check },
  { id: 'staff', label: 'Staff', icon: User },
  { id: 'datetime', label: 'Date & Time', icon: CalendarIcon },
  { id: 'customer', label: 'Your Info', icon: User },
  { id: 'addons', label: 'Add-ons', icon: Plus },
  { id: 'payment', label: 'Payment', icon: CreditCard },
  { id: 'confirmation', label: 'Confirm', icon: Check }
]

export function BookingWizard({ salonId, onCancel }: BookingWizardProps) {
  const [state, setState] = useState<BookingWizardState>(getInitialWizardState())
  const [categories, setCategories] = useState<ServiceCategory[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [staff, setStaff] = useState<StaffProfile[]>([])
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [serviceQuantities, setServiceQuantities] = useState<Map<string, number>>(new Map())

  const currentStepIndex = getStepIndex(state.currentStep)
  const progress = calculateProgress(state.currentStep)
  const { subtotal, tax, total, totalDuration } = calculateTotals(state)

  const canGoBack = currentStepIndex > 0
  const canGoNext = validateStep(state, state.currentStep)
  const isLastStep = currentStepIndex === STEPS.length - 1

  const updateState = (updates: Partial<BookingWizardState>) => {
    setState(prev => ({ ...prev, ...updates }))
  }

  const goToStep = (step: BookingStep) => {
    setState(prev => ({ ...prev, currentStep: step }))
  }

  const goNext = async () => {
    if (isLastStep) {
      // Handle completion with server action or redirect
      setLoading(true)
      try {
        // TODO: Call server action to create booking
        // After successful booking, redirect to confirmation page
        window.location.href = '/booking/confirmation'
      } catch (err) {
        setError('Failed to complete booking')
      } finally {
        setLoading(false)
      }
    } else {
      const nextStep = getNextStep(state.currentStep)
      if (nextStep) goToStep(nextStep)
    }
  }

  const goBack = () => {
    const prevStep = getPreviousStep(state.currentStep)
    if (prevStep) goToStep(prevStep)
  }

  const toggleService = (service: Service, category: ServiceCategory) => {
    const existing = state.selectedServices.find(s => s.serviceId === service.id)
    if (existing) {
      updateState({
        selectedServices: state.selectedServices.filter(s => s.serviceId !== service.id)
      })
    } else {
      const quantity = serviceQuantities.get(service.id!) || 1
      updateState({
        selectedServices: [...state.selectedServices, {
          serviceId: service.id!,
          serviceName: service.name!,
          categoryId: category.id!,
          categoryName: category.name!,
          duration: service.duration_minutes!,
          price: Number(service.base_price),
          quantity
        }]
      })
    }
  }

  const updateServiceQuantity = (serviceId: string, quantity: number) => {
    if (quantity < 1) return
    setServiceQuantities(prev => new Map(prev.set(serviceId, quantity)))
    updateState({
      selectedServices: state.selectedServices.map(s =>
        s.serviceId === serviceId ? { ...s, quantity } : s
      )
    })
  }

  const renderStepContent = () => {
    const commonProps = {
      state,
      onStateChange: updateState,
      loading,
      error
    }

    switch (state.currentStep) {
      case 'service':
        return (
          <ServiceSelectionStep
            {...commonProps}
            categories={categories}
            services={services}
            serviceQuantities={serviceQuantities}
            onToggleService={toggleService}
            onUpdateQuantity={updateServiceQuantity}
          />
        )
      case 'staff':
        return <StaffSelectionStep {...commonProps} staff={staff} />
      case 'datetime':
        return <DateTimeSelectionStep {...commonProps} timeSlots={timeSlots} />
      case 'customer':
        return <CustomerInfoStep {...commonProps} />
      case 'addons':
        return <AddonsStep {...commonProps} services={services} />
      case 'payment':
        return <PaymentStep {...commonProps} subtotal={subtotal} tax={tax} total={total} />
      case 'confirmation':
        return (
          <ConfirmationStep
            {...commonProps}
            staff={staff}
            totalDuration={totalDuration}
            total={total}
          />
        )
      default:
        return null
    }
  }

  // Load initial data
  useEffect(() => {
    // This would be replaced with actual API calls
    setCategories(getMockCategories(salonId))
    setServices(getMockServices(salonId))
    setStaff(getMockStaff(salonId))
    setTimeSlots(getMockTimeSlots())
  }, [salonId])

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress bar */}
      <div className="space-y-2">
        <Progress value={progress} />
        <div className="flex justify-between">
          {STEPS.map((step, index) => (
            <div
              key={step.id}
              className={`text-xs ${
                index <= currentStepIndex
                  ? 'text-primary font-medium'
                  : 'text-muted-foreground'
              }`}
            >
              {step.label}
            </div>
          ))}
        </div>
      </div>

      {/* Main content */}
      <Card>
        <CardContent className="p-6">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {renderStepContent()}
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={goBack} disabled={!canGoBack}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <Button onClick={goNext} disabled={!canGoNext || loading}>
            {isLastStep ? 'Confirm Booking' : 'Next'}
            {!isLastStep && <ChevronRight className="ml-2 h-4 w-4" />}
          </Button>
        </CardFooter>
      </Card>

      {/* Summary sidebar */}
      {state.selectedServices.length > 0 && (
        <BookingSummary
          state={state}
          total={total}
          totalDuration={totalDuration}
        />
      )}
    </div>
  )
}