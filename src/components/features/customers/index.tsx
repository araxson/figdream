'use client'

import { SalonSearch } from './booking/salon-search'
import { ServiceSelection } from './booking/service-selection'
import { TimeSelection } from './booking/time-selection'
import { BookingConfirmation } from './confirmation'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Store, 
  Scissors, 
  Clock, 
  CheckCircle,
} from 'lucide-react'

export type BookingStep = 'salon' | 'service' | 'time' | 'confirm'

interface StepInfo {
  id: BookingStep
  label: string
  description: string
  icon: React.ElementType
}

const steps: StepInfo[] = [
  {
    id: 'salon',
    label: 'Choose Salon',
    description: 'Select your preferred salon location',
    icon: Store
  },
  {
    id: 'service',
    label: 'Select Services',
    description: 'Pick the services you want',
    icon: Scissors
  },
  {
    id: 'time',
    label: 'Pick Time',
    description: 'Choose your appointment time',
    icon: Clock
  },
  {
    id: 'confirm',
    label: 'Confirm',
    description: 'Review and confirm booking',
    icon: CheckCircle
  }
]

export function CustomerBooking() {
  const [currentStep, setCurrentStep] = useState<BookingStep>('salon')
  const [bookingData, setBookingData] = useState({
    salonId: '',
    serviceIds: [] as string[],
    staffId: '',
    date: '',
    time: '',
  })

  const currentStepIndex = steps.findIndex(s => s.id === currentStep)
  const progressPercentage = ((currentStepIndex + 1) / steps.length) * 100

  const renderStep = () => {
    switch (currentStep) {
      case 'salon':
        return (
          <SalonSearch 
            onSalonSelect={(salonId: string) => {
              setBookingData({ ...bookingData, salonId })
              setCurrentStep('service')
            }}
          />
        )
      case 'service':
        return (
          <ServiceSelection
            salonId={bookingData.salonId}
            onSelect={(serviceIds: string[]) => {
              setBookingData({ ...bookingData, serviceIds })
              setCurrentStep('time')
            }}
            onBack={() => setCurrentStep('salon')}
          />
        )
      case 'time':
        return (
          <TimeSelection
            salonId={bookingData.salonId}
            serviceIds={bookingData.serviceIds}
            onSelect={(data) => {
              setBookingData({ ...bookingData, ...data })
              setCurrentStep('confirm')
            }}
            onBack={() => setCurrentStep('service')}
          />
        )
      case 'confirm':
        return (
          <BookingConfirmation
            bookingData={bookingData}
            onConfirm={() => {
              // Handle booking confirmation
            }}
            onBack={() => setCurrentStep('time')}
          />
        )
    }
  }

  return (
    <div className={cn("max-w-6xl mx-auto space-y-8")}>
      {/* Header */}
      <div className={cn("text-center space-y-2")}>
        <h1 className={cn("text-4xl font-bold tracking-tight")}>
          Book Your Appointment
        </h1>
        <p className={cn("text-lg text-muted-foreground")}>
          Follow these simple steps to book your perfect salon experience
        </p>
      </div>

      {/* Progress Bar */}
      <Card className={cn("border-2")}>
        <CardContent className={cn("p-6")}>
          <div className={cn("space-y-4")}>
            {/* Progress Bar */}
            <div className={cn("relative")}>
              <Progress value={progressPercentage} className={cn("h-2")} />
              <div className={cn("absolute inset-0 flex items-center justify-between")}>
                {steps.map((step, index) => {
                  const isActive = step.id === currentStep
                  const isCompleted = index < currentStepIndex
                  const Icon = step.icon
                  
                  return (
                    <div
                      key={step.id}
                      className={cn(
                        "relative flex flex-col items-center",
                        index === 0 && "items-start",
                        index === steps.length - 1 && "items-end"
                      )}
                    >
                      <div
                        className={cn(
                          "absolute -top-7 w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300",
                          "border-4 bg-background",
                          isActive && "border-primary scale-110 shadow-lg",
                          isCompleted && "border-primary bg-primary text-primary-foreground",
                          !isActive && !isCompleted && "border-muted bg-muted"
                        )}
                      >
                        <Icon className={cn("h-6 w-6")} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Step Labels */}
            <div className={cn("grid grid-cols-4 gap-4 mt-12")}>
              {steps.map((step, index) => {
                const isActive = step.id === currentStep
                const isCompleted = index < currentStepIndex
                
                return (
                  <div
                    key={step.id}
                    className={cn(
                      "text-center space-y-1 transition-all duration-300",
                      isActive && "scale-105"
                    )}
                  >
                    <div className={cn("flex items-center justify-center gap-2")}>
                      <h3 className={cn(
                        "font-semibold text-sm",
                        isActive && "text-primary",
                        isCompleted && "text-primary",
                        !isActive && !isCompleted && "text-muted-foreground"
                      )}>
                        {step.label}
                      </h3>
                      {isCompleted && (
                        <Badge variant="default" className={cn("h-5 px-1")}>
                          <CheckCircle className={cn("h-3 w-3")} />
                        </Badge>
                      )}
                      {isActive && (
                        <Badge variant="outline" className={cn("h-5 px-2 text-xs animate-pulse")}>
                          Current
                        </Badge>
                      )}
                    </div>
                    <p className={cn(
                      "text-xs",
                      isActive ? "text-muted-foreground" : "text-muted-foreground/60"
                    )}>
                      {step.description}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      <div className={cn("min-h-[400px] animate-in fade-in-50 duration-300")}>
        {renderStep()}
      </div>

      {/* Mobile Progress - Better for small screens */}
      <div className={cn("fixed bottom-0 left-0 right-0 bg-background border-t p-4 lg:hidden")}>
        <div className={cn("flex items-center justify-between mb-2")}>
          <span className={cn("text-sm font-medium")}>
            Step {currentStepIndex + 1} of {steps.length}
          </span>
          <span className={cn("text-sm text-muted-foreground")}>
            {steps[currentStepIndex].label}
          </span>
        </div>
        <Progress value={progressPercentage} className={cn("h-2")} />
      </div>
    </div>
  )
}