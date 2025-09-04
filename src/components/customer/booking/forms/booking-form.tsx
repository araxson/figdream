'use client'

import * as React from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { Form } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { 
  CheckCircle, 
  ChevronRight,
  ChevronLeft,
  Loader2,
} from 'lucide-react'
import type { SelectedService, StaffMember, TimeSlot } from './booking-types'
import {
  bookingFormSchema,
  type BookingFormData,
  type BookingFormProps,
} from './booking-form-types'
import { calculateTotals, calculateEndTime } from './booking-form-utils'
import {
  ServicesStep,
  StaffStep,
  DateTimeStep,
  DetailsStep,
  ConfirmStep,
} from '../steps'
import { BookingStepNavigation, BOOKING_STEPS } from './booking-step-navigation'
import { BookingSummarySidebar } from './booking-summary-sidebar'

export function BookingForm({
  locationId,
  className,
  onBookingSuccess,
  onBookingError,
  initialDate,
  initialServices = [],
  initialStaff,
  isWalkIn = false,
  currentUser,
  businessRules = {
    require_deposit: false,
    deposit_percentage: 0,
    min_advance_hours: 1,
    max_advance_days: 90,
    allow_walk_ins: true
  },
  disabled = false
}: BookingFormProps) {
  // State management
  const [currentStep, setCurrentStep] = React.useState(0)
  const [selectedServices, setSelectedServices] = React.useState<SelectedService[]>(initialServices)
  const [selectedStaff, setSelectedStaff] = React.useState<StaffMember | null>(initialStaff || null)
  const [selectedDate, setSelectedDate] = React.useState<Date>(initialDate || new Date())
  const [selectedTimeSlot, setSelectedTimeSlot] = React.useState<TimeSlot | null>(null)
  const [customStartTime, setCustomStartTime] = React.useState<string>('')
  const [timeSelectionMethod, setTimeSelectionMethod] = React.useState<'slots' | 'custom'>('slots')
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [submitError, setSubmitError] = React.useState<string | null>(null)

  // Form setup
  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      location_id: locationId,
      booking_date: format(selectedDate, 'yyyy-MM-dd'),
      services: selectedServices.map(s => s.id),
      send_reminders: true,
      marketing_consent: false,
      deposit_required: businessRules.require_deposit,
      customer: !currentUser ? {
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
      } : undefined,
    },
  })

  // Calculate totals
  const totals = React.useMemo(() => 
    calculateTotals(selectedServices, businessRules),
    [selectedServices, businessRules]
  )

  // Update form when selections change
  React.useEffect(() => {
    form.setValue('services', selectedServices.map(s => s.id))
    form.setValue('booking_date', format(selectedDate, 'yyyy-MM-dd'))
    
    // Handle time selection based on method
    if (timeSelectionMethod === 'slots' && selectedTimeSlot) {
      form.setValue('start_time', selectedTimeSlot.start_time)
      form.setValue('end_time', selectedTimeSlot.end_time)
    } else if (timeSelectionMethod === 'custom' && customStartTime) {
      const endTime = calculateEndTime(customStartTime + ':00', totals.totalDuration)
      form.setValue('start_time', customStartTime + ':00')
      form.setValue('end_time', endTime)
    }
    
    if (selectedStaff) {
      form.setValue('staff_id', selectedStaff.id)
    }
    
    if (businessRules.require_deposit) {
      form.setValue('deposit_amount', totals.depositAmount)
    }
  }, [
    selectedServices, 
    selectedDate, 
    selectedTimeSlot, 
    customStartTime, 
    timeSelectionMethod, 
    selectedStaff, 
    totals.depositAmount, 
    totals.totalDuration, 
    businessRules.require_deposit, 
    form
  ])

  // Navigation handlers
  const nextStep = () => {
    if (currentStep < BOOKING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const goToStep = (stepIndex: number) => {
    setCurrentStep(stepIndex)
  }

  // Validate current step
  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 0: // Services
        return selectedServices.length > 0
      case 1: // Staff
        return selectedStaff !== null || !selectedServices.some(s => s.id)
      case 2: // Date & Time
        return timeSelectionMethod === 'slots' ? selectedTimeSlot !== null : customStartTime !== ''
      case 3: // Details
        return true // Details are optional
      case 4: // Confirm
        return true
      default:
        return false
    }
  }

  // Handle form submission
  const onSubmit = async (data: BookingFormData) => {
    setIsSubmitting(true)
    setSubmitError(null)
    
    try {
      const bookingData = {
        ...data,
        total_price: totals.totalPrice,
        service_details: selectedServices,
        staff_details: selectedStaff,
        is_walk_in: isWalkIn,
      }
      
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create booking')
      }
      
      const result = await response.json()
      onBookingSuccess?.(result.booking)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create booking'
      setSubmitError(errorMessage)
      onBookingError?.(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Props for step components
  const stepProps = {
    form,
    selectedServices,
    setSelectedServices,
    selectedStaff,
    setSelectedStaff,
    selectedDate,
    setSelectedDate,
    selectedTimeSlot,
    setSelectedTimeSlot,
    customStartTime,
    setCustomStartTime,
    timeSelectionMethod,
    setTimeSelectionMethod,
    locationId,
    totals,
    businessRules,
    isWalkIn,
    currentUser,
    disabled,
    submitError
  }

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return <ServicesStep {...stepProps} />
      case 1:
        return <StaffStep {...stepProps} />
      case 2:
        return <DateTimeStep {...stepProps} />
      case 3:
        return <DetailsStep {...stepProps} />
      case 4:
        return <ConfirmStep {...stepProps} />
      default:
        return null
    }
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Step Progress Header */}
      <BookingStepNavigation
        currentStep={currentStep}
        steps={BOOKING_STEPS}
        onStepClick={goToStep}
        onNextClick={nextStep}
        onPreviousClick={previousStep}
        canProceedToNextStep={canProceedToNextStep()}
        isSubmitting={isSubmitting}
        disabled={disabled}
        isLastStep={true} // Only show progress header, not buttons
      />

      {/* Step Content */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="min-h-96">
            {renderStepContent()}
          </div>
          
          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={previousStep}
              disabled={currentStep === 0 || disabled}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            <div className="flex gap-2">
              {currentStep === BOOKING_STEPS.length - 1 ? (
                <Button
                  type="submit"
                  disabled={!canProceedToNextStep() || isSubmitting || disabled}
                  className="min-w-32"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Booking...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Confirm Booking
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={nextStep}
                  disabled={!canProceedToNextStep() || disabled}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </form>
      </Form>

      {/* Summary Sidebar */}
      <BookingSummarySidebar
        selectedServices={selectedServices}
        selectedStaff={selectedStaff}
        selectedDate={selectedDate}
        selectedTimeSlot={selectedTimeSlot}
        customStartTime={customStartTime}
        timeSelectionMethod={timeSelectionMethod}
        totals={totals}
        currentStep={currentStep}
        totalSteps={BOOKING_STEPS.length}
      />
    </div>
  )
}