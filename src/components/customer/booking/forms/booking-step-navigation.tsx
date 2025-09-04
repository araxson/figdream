'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  CheckCircle, 
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Loader2,
  Receipt,
  User,
  CalendarIcon,
  MessageSquare,
  Sparkles,
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
      {/* Enhanced Progress Header */}
      <div className="space-y-6">
        {/* Step Pills */}
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const StepIcon = step.icon
            const isActive = index === currentStep
            const isComplete = index < currentStep
            const isUpcoming = index > currentStep
            const isClickable = !disabled && (isComplete || index === currentStep - 1 || index === currentStep + 1)

            return (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center relative">
                  <Button
                    type="button"
                    onClick={() => isClickable && onStepClick(index)}
                    disabled={!isClickable}
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "group h-10 w-10 rounded-full border-2 transition-all duration-300",
                      isActive && "border-primary bg-primary text-primary-foreground scale-110 shadow-lg hover:bg-primary hover:text-primary-foreground",
                      isComplete && "border-primary bg-primary/10 text-primary hover:bg-primary/20",
                      isUpcoming && "border-muted-foreground/30 bg-background text-muted-foreground",
                      isClickable && !isActive && "hover:scale-105",
                      !isClickable && "opacity-50"
                    )}
                  >
                    {isComplete ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <StepIcon className="h-5 w-5" />
                    )}
                  </Button>
                  <span className={cn(
                    "mt-2 text-xs font-medium transition-all duration-300",
                    isActive && "text-primary font-semibold",
                    isComplete && "text-primary",
                    isUpcoming && "text-muted-foreground"
                  )}>
                    {step.title}
                  </span>
                  {isActive && (
                    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2">
                      <Badge variant="secondary" className="text-xs">
                        Current
                      </Badge>
                    </div>
                  )}
                </div>
                {index < steps.length - 1 && (
                  <Separator 
                    className={cn(
                      "flex-1 h-[2px] mx-2 transition-all duration-300",
                      index < currentStep ? "bg-primary" : "bg-muted"
                    )} 
                  />
                )}
              </React.Fragment>
            )
          })}
        </div>

        {/* Progress Bar */}
        <div className="relative mt-8">
          <Progress 
            value={progressPercentage} 
            className="h-2 bg-muted" 
          />
          <div className="flex justify-between mt-2">
            <span className="text-xs text-muted-foreground">
              {currentStep > 0 ? `${currentStep} completed` : 'Getting started'}
            </span>
            <span className="text-xs font-medium text-primary">
              {Math.round(progressPercentage)}% complete
            </span>
          </div>
        </div>
      </div>

      {/* Enhanced Navigation Buttons */}
      {!isLastStep && (
        <div className="flex justify-between pt-8 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onPreviousClick}
            disabled={currentStep === 0 || disabled}
            size="lg"
            className="group"
          >
            <ChevronLeft className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-1" />
            <span>Previous</span>
          </Button>
          
          <div className="flex items-center gap-3">
            {currentStep < steps.length - 1 && (
              <span className="text-sm text-muted-foreground hidden sm:inline">
                {!canProceedToNextStep && 'Complete this step to continue'}
              </span>
            )}
            
            {currentStep === steps.length - 1 ? (
              <Button
                type="submit"
                disabled={!canProceedToNextStep || isSubmitting || disabled}
                size="lg"
                className="min-w-[140px] relative overflow-hidden group"
              >
                <span className="relative z-10 flex items-center">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      <span>Confirming...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      <span>Confirm Booking</span>
                    </>
                  )}
                </span>
                {!isSubmitting && (
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/10 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                )}
              </Button>
            ) : (
              <Button
                type="button"
                onClick={onNextClick}
                disabled={!canProceedToNextStep || disabled}
                size="lg"
                className="group"
              >
                <span>Continue</span>
                <ChevronRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
              </Button>
            )}
          </div>
        </div>
      )}
    </>
  )
}