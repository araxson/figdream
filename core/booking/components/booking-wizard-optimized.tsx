'use client'

import { useState, useEffect, useTransition, Suspense, lazy } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cache } from '@/core/performance/utils/cache'
import { markPerformance } from '@/core/performance/utils/metrics'
import { FormSkeleton, LoadingSpinner } from '@/core/performance/components/suspense-boundaries'

// Lazy load step components for better initial load
const ServiceSelectionStep = lazy(() => import('./wizard-steps/service-selection-step'))
const StaffSelectionStep = lazy(() => import('./wizard-steps/staff-selection-step'))
const DateTimeSelectionStep = lazy(() => import('./wizard-steps/datetime-selection-step'))
const CustomerInfoStep = lazy(() => import('./wizard-steps/customer-info-step'))
const PaymentStep = lazy(() => import('./wizard-steps/payment-step'))
const ConfirmationStep = lazy(() => import('./wizard-steps/confirmation-step'))

interface BookingData {
  salonId?: string
  serviceId?: string
  staffId?: string
  date?: Date
  time?: string
  customerInfo?: {
    name: string
    email: string
    phone: string
  }
  paymentMethod?: string
  notes?: string
  addons?: string[]
}

interface BookingWizardOptimizedProps {
  salonId: string
  initialStep?: number
  onComplete?: (booking: BookingData) => void
}

const STEPS = [
  { id: 'service', title: 'Select Service', component: ServiceSelectionStep },
  { id: 'staff', title: 'Choose Staff', component: StaffSelectionStep },
  { id: 'datetime', title: 'Pick Date & Time', component: DateTimeSelectionStep },
  { id: 'customer', title: 'Your Information', component: CustomerInfoStep },
  { id: 'payment', title: 'Payment', component: PaymentStep },
  { id: 'confirm', title: 'Confirmation', component: ConfirmationStep }
]

export function BookingWizardOptimized({
  salonId,
  initialStep = 0,
  onComplete
}: BookingWizardOptimizedProps) {
  const [currentStep, setCurrentStep] = useState(initialStep)
  const [bookingData, setBookingData] = useState<BookingData>({ salonId })
  const [isPending, startTransition] = useTransition()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Prefetch data for next steps
  useEffect(() => {
    const prefetchNextStepData = async () => {
      markPerformance('prefetch-start')

      // Prefetch based on current step
      switch (currentStep) {
        case 0: // On service selection, prefetch staff
          await cache.prefetch(
            `/api/staff?salon_id=${salonId}`,
            async () => {
              const res = await fetch(`/api/staff?salon_id=${salonId}`)
              return res.json()
            },
            { ttl: 10 * 60 * 1000, persist: true }
          )
          break

        case 1: // On staff selection, prefetch availability
          if (bookingData.staffId) {
            await cache.prefetch(
              `/api/availability?staff_id=${bookingData.staffId}`,
              async () => {
                const res = await fetch(`/api/availability?staff_id=${bookingData.staffId}`)
                return res.json()
              },
              { ttl: 5 * 60 * 1000 }
            )
          }
          break

        case 2: // On date selection, prefetch payment methods
          await cache.prefetch(
            `/api/payment-methods?salon_id=${salonId}`,
            async () => {
              const res = await fetch(`/api/payment-methods?salon_id=${salonId}`)
              return res.json()
            },
            { ttl: 30 * 60 * 1000, persist: true }
          )
          break
      }

      markPerformance('prefetch-end')
    }

    // Delay prefetch slightly to not block main thread
    const timer = setTimeout(prefetchNextStepData, 300)

    return () => clearTimeout(timer)
  }, [currentStep, salonId, bookingData.staffId])

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      startTransition(() => {
        markPerformance(`step-${currentStep}-complete`)
        setCurrentStep(prev => prev + 1)
      })
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      startTransition(() => {
        setCurrentStep(prev => prev - 1)
      })
    }
  }

  const handleStepComplete = (stepData: Partial<BookingData>) => {
    setBookingData(prev => ({ ...prev, ...stepData }))

    if (currentStep === STEPS.length - 1) {
      handleSubmit()
    } else {
      handleNext()
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    markPerformance('booking-submit-start')

    try {
      // Submit booking with optimistic UI update
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData)
      })

      if (!response.ok) throw new Error('Booking failed')

      const result = await response.json()
      markPerformance('booking-submit-end')

      // Cache the booking for confirmation page
      await cache.fetch(
        `/api/bookings/${result.id}`,
        async () => result,
        { ttl: 30 * 60 * 1000, persist: true }
      )

      if (onComplete) {
        onComplete(bookingData)
      }
    } catch (error) {
      console.error('Booking submission failed:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const CurrentStepComponent = STEPS[currentStep].component

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Progress Indicator */}
      <div className="flex justify-between items-center">
        {STEPS.map((step, index) => (
          <div
            key={step.id}
            className="flex-1 relative"
          >
            <div
              className={`
                h-2 bg-muted rounded-full overflow-hidden
                ${index < STEPS.length - 1 ? 'mr-2' : ''}
              `}
            >
              <div
                className={`
                  h-full bg-primary transition-all duration-300
                  ${index <= currentStep ? 'w-full' : 'w-0'}
                `}
              />
            </div>
            <div
              className={`
                absolute -top-1 -left-1 w-4 h-4 rounded-full
                transition-all duration-300
                ${index <= currentStep
                  ? 'bg-primary scale-100'
                  : 'bg-muted scale-75'
                }
              `}
            />
            <p className="text-xs mt-2 text-center">
              {step.title}
            </p>
          </div>
        ))}
      </div>

      {/* Step Content */}
      <Card className="p-6">
        <Suspense fallback={<FormSkeleton fields={4} />}>
          <CurrentStepComponent
            bookingData={bookingData}
            onComplete={handleStepComplete}
            salonId={salonId}
          />
        </Suspense>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-6 pt-6 border-t">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0 || isPending || isSubmitting}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>

          {currentStep < STEPS.length - 1 ? (
            <Button
              onClick={handleNext}
              disabled={isPending}
            >
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner />
                  Processing...
                </>
              ) : (
                'Complete Booking'
              )}
            </Button>
          )}
        </div>
      </Card>

      {/* Prefetch indicator for dev mode */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-muted-foreground text-center">
          Step {currentStep + 1} of {STEPS.length} |
          {isPending && ' Loading...'}
        </div>
      )}
    </div>
  )
}