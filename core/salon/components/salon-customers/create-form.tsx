'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import {
  User,
  Phone,
  Bell,
  Check,
  ChevronLeft,
  ChevronRight,
  Loader2
} from 'lucide-react'

// UI Components
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'

// Form Step Components
import {
  BasicInfoStep,
  ContactDetailsStep,
  PreferencesStep,
  ReviewStep
} from './form-steps'

// Server Actions
import { createCustomerAction } from '../actions'

// Types
import type { CustomerProfileWithRelations } from '../dal/customers-types'

interface CustomerCreateFormProps {
  open: boolean
  onClose: () => void
  onSuccess: (customer: CustomerProfileWithRelations) => void
}

// Form steps configuration
const FORM_STEPS = [
  { id: 'basic', title: 'Basic Information', icon: User },
  { id: 'contact', title: 'Contact Details', icon: Phone },
  { id: 'preferences', title: 'Preferences', icon: Bell },
  { id: 'review', title: 'Review & Create', icon: Check }
]

interface FormData {
  // Basic Information
  email: string
  display_name: string
  first_name: string
  last_name: string
  avatar_url?: string

  // Contact Details
  phone?: string
  date_of_birth?: string
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say'

  // Preferences
  email_consent: boolean
  sms_consent: boolean
  marketing_consent: boolean
  appointment_reminders: boolean
  promotions: boolean
}

const initialFormData: FormData = {
  email: '',
  display_name: '',
  first_name: '',
  last_name: '',
  phone: '',
  date_of_birth: '',
  gender: undefined,
  email_consent: true,
  sms_consent: false,
  marketing_consent: false,
  appointment_reminders: true,
  promotions: false
}

export function CustomerCreateForm({
  open,
  onClose,
  onSuccess
}: CustomerCreateFormProps) {
  const [isPending, startTransition] = useTransition()
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})

  // Calculate progress
  const progress = ((currentStep + 1) / FORM_STEPS.length) * 100

  // Update form data
  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  // Validate current step
  const validateStep = (step: number): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {}

    switch (step) {
      case 0: // Basic Information
        if (!formData.email) {
          newErrors.email = 'Email is required'
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          newErrors.email = 'Invalid email format'
        }
        if (!formData.first_name) {
          newErrors.first_name = 'First name is required'
        }
        if (!formData.last_name) {
          newErrors.last_name = 'Last name is required'
        }
        break

      case 1: // Contact Details
        if (formData.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/\s/g, ''))) {
          newErrors.phone = 'Invalid phone number format'
        }
        break

      // Steps 2 and 3 don't require validation
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Navigation handlers
  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, FORM_STEPS.length - 1))
    }
  }

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0))
  }

  // Submit handler
  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return

    startTransition(async () => {
      try {
        const result = await createCustomerAction(formData)

        if (result.success && result.data) {
          toast.success('Customer created successfully!')
          onSuccess(result.data)
          handleClose()
        } else {
          toast.error(result.message || 'Failed to create customer')
        }
      } catch (error) {
        console.error('Error creating customer:', error)
        toast.error('An unexpected error occurred')
      }
    })
  }

  // Close handler
  const handleClose = () => {
    setCurrentStep(0)
    setFormData(initialFormData)
    setErrors({})
    onClose()
  }

  // Render current step
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <BasicInfoStep
            formData={formData}
            errors={errors}
            onUpdateField={updateFormData}
          />
        )
      case 1:
        return (
          <ContactDetailsStep
            formData={formData}
            errors={errors}
            onUpdateField={updateFormData}
          />
        )
      case 2:
        return (
          <PreferencesStep
            formData={formData}
            onUpdateField={updateFormData}
          />
        )
      case 3:
        return <ReviewStep formData={formData} />
      default:
        return null
    }
  }

  const isLastStep = currentStep === FORM_STEPS.length - 1
  const isFirstStep = currentStep === 0

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Customer</DialogTitle>
          <DialogDescription>
            Add a new customer to your salon's database
          </DialogDescription>
        </DialogHeader>

        {/* Progress Indicator */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Step {currentStep + 1} of {FORM_STEPS.length}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Indicators */}
        <div className="flex items-center justify-between">
          {FORM_STEPS.map((step, index) => {
            const Icon = step.icon
            const isActive = index === currentStep
            const isCompleted = index < currentStep

            return (
              <div
                key={step.id}
                className={`flex items-center gap-2 ${
                  isActive ? 'text-primary' : isCompleted ? 'text-green-600' : 'text-muted-foreground'
                }`}
              >
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                    isActive
                      ? 'border-primary bg-primary text-primary-foreground'
                      : isCompleted
                      ? 'border-green-600 bg-green-600 text-white'
                      : 'border-muted-foreground'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Icon className="w-4 h-4" />
                  )}
                </div>
                <span className="text-xs font-medium hidden md:block">
                  {step.title}
                </span>
              </div>
            )
          })}
        </div>

        {/* Form Content */}
        <div className="py-6">
          {renderCurrentStep()}
        </div>

        {/* Navigation */}
        <DialogFooter className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={handlePrevious}
            disabled={isFirstStep}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          {isLastStep ? (
            <Button
              onClick={handleSubmit}
              disabled={isPending}
            >
              {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create Customer
            </Button>
          ) : (
            <Button onClick={handleNext}>
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}