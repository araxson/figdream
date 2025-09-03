'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import {
  Button,
  Progress,
} from '@/components/ui'
import { 
  CheckCircle, 
  ChevronRight,
  ChevronLeft,
  Loader2,
  Receipt,
  User,
  CalendarIcon,
  MessageSquare,
} from 'lucide-react'
import type { BookingStep } from './booking-form-types'

interface BookingStepNavigationProps {
  currentStep: number
  steps: BookingStep[]
  onStepClick: (stepIndex: number) => void
  onNextClick?: () => void
  onPreviousClick: () => void
  canProceedToNextStep: boolean
  isSubmitting: boolean
  disabled: boolean
  isLastStep?: boolean
}

export const BOOKING_STEPS: BookingStep[] = [
  { id: 'services', title: 'Services', icon: Receipt },
  { id: 'staff', title: 'Staff', icon: User },
  { id: 'datetime', title: 'Date & Time', icon: CalendarIcon },
  { id: 'details', title: 'Details', icon: MessageSquare },
  { id: 'confirm', title: 'Confirm', icon: CheckCircle },
]

export function BookingStepNavigation({
  currentStep,
  steps,
  onStepClick,
  onNextClick,
  onPreviousClick,
  canProceedToNextStep,
  isSubmitting,
  disabled,
  isLastStep = false
}: BookingStepNavigationProps) {
  const progressPercentage = ((currentStep + 1) / steps.length) * 100

  return (
    <>
      {/* Progress Header */}
      <div className="space-y-4">
        <Progress value={progressPercentage} className="w-full" />
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4 overflow-x-auto">
            {steps.map((step, index) => {
              const StepIcon = step.icon
              const isActive = index === currentStep
              const isComplete = index < currentStep
              const isDisabled = disabled

              return (
                <Button
                  key={step.id}
                  onClick={() => !isDisabled && onStepClick(index)}
                  disabled={isDisabled}
                  variant={isActive ? "default" : isComplete ? "secondary" : "ghost"}
                  size="sm"
                  className={cn(
                    "gap-2",
                    isActive && "pointer-events-none",
                    !isActive && !isComplete && "text-muted-foreground"
                  )}
                >
                  <StepIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">{step.title}</span>
                  {isComplete && <CheckCircle className="h-3 w-3" />}
                </Button>
              )
            })}
          </div>
          <div className="text-sm text-muted-foreground">
            Step {currentStep + 1} of {steps.length}
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      {!isLastStep && (
        <div className="flex justify-between pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={onPreviousClick}
            disabled={currentStep === 0 || disabled}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          <div className="flex gap-2">
            {currentStep === steps.length - 1 ? (
              <Button
                type="submit"
                disabled={!canProceedToNextStep || isSubmitting || disabled}
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
                onClick={onNextClick}
                disabled={!canProceedToNextStep || disabled}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      )}
    </>
  )
}