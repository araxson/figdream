"use client"

import { useState, useTransition } from "react"
import { ChevronRight, ChevronLeft, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"
import { createStaffMemberAction } from "../../actions"
import { PersonalInfoStep } from "./personal-info-step"
import { ProfessionalStep } from "./professional-step"
import { SkillsStep } from "./skills-step"
import { CompensationStep } from "./compensation-step"
import { ScheduleStep } from "./schedule-step"
import { ServicesStep } from "./services-step"
import { DocumentsStep } from "./documents-step"
import { AccessStep } from "./access-step"
import { ReviewStep } from "./review-step"
import { DEFAULT_ONBOARDING_DATA, ONBOARDING_STEPS } from "./types"
import type { OnboardingData } from "./types"

interface StaffOnboardingProps {
  onComplete: (staffId: string) => void
  onCancel: () => void
  salonId?: string
}

export function StaffOnboarding({ onComplete, onCancel, salonId }: StaffOnboardingProps) {
  const [isPending, startTransition] = useTransition()
  const [currentStep, setCurrentStep] = useState(1)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [data, setData] = useState<OnboardingData>(DEFAULT_ONBOARDING_DATA)

  const handleDataChange = (updates: Partial<OnboardingData>) => {
    setData(prev => ({ ...prev, ...updates }))
    // Clear errors for updated fields
    const errorKeys = Object.keys(updates)
    if (errorKeys.length > 0) {
      setErrors(prev => {
        const newErrors = { ...prev }
        errorKeys.forEach(key => delete newErrors[key])
        return newErrors
      })
    }
  }

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {}

    switch (step) {
      case 1: // Personal Info
        if (!data.first_name) newErrors.first_name = "First name is required"
        if (!data.last_name) newErrors.last_name = "Last name is required"
        if (!data.email) newErrors.email = "Email is required"
        if (!data.phone) newErrors.phone = "Phone is required"
        break
      case 2: // Professional
        if (!data.title) newErrors.title = "Job title is required"
        break
      case 4: // Compensation
        if (data.commission_rate < 0 || data.commission_rate > 100) {
          newErrors.commission_rate = "Commission must be between 0-100%"
        }
        break
      case 8: // Access
        if (!data.terms_accepted) {
          newErrors.terms_accepted = "You must accept the terms"
        }
        if (!data.handbook_acknowledged) {
          newErrors.handbook_acknowledged = "You must acknowledge the handbook"
        }
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (!validateStep(currentStep)) {
      toast.error("Please fix the errors before continuing")
      return
    }
    setCurrentStep(prev => Math.min(prev + 1, ONBOARDING_STEPS.length))
  }

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) {
      toast.error("Please fix all errors before submitting")
      return
    }

    startTransition(async () => {
      try {
        const result = await createStaffMemberAction({
          ...data,
          salon_id: salonId
        })

        if (result.success && result.data) {
          toast.success("Staff member onboarded successfully!")
          onComplete(result.data.id)
        } else {
          toast.error(result.error || "Failed to onboard staff member")
        }
      } catch (error) {
        console.error("Onboarding error:", error)
        toast.error("An unexpected error occurred")
      }
    })
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <PersonalInfoStep data={data} errors={errors} onChange={handleDataChange} />
      case 2:
        return <ProfessionalStep data={data} errors={errors} onChange={handleDataChange} />
      case 3:
        return <SkillsStep data={data} errors={errors} onChange={handleDataChange} />
      case 4:
        return <CompensationStep data={data} errors={errors} onChange={handleDataChange} />
      case 5:
        return <ScheduleStep data={data} errors={errors} onChange={handleDataChange} />
      case 6:
        return <ServicesStep data={data} errors={errors} onChange={handleDataChange} />
      case 7:
        return <DocumentsStep data={data} errors={errors} onChange={handleDataChange} />
      case 8:
        return <AccessStep data={data} errors={errors} onChange={handleDataChange} />
      case 9:
        return <ReviewStep data={data} />
      default:
        return null
    }
  }

  const progress = (currentStep / ONBOARDING_STEPS.length) * 100

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Step {currentStep} of {ONBOARDING_STEPS.length}</span>
          <span>{ONBOARDING_STEPS[currentStep - 1].title}</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Step Content */}
      {renderStep()}

      {/* Navigation */}
      <div className="flex justify-between">
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isPending}
          >
            Cancel
          </Button>
          {currentStep > 1 && (
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={isPending}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>
          )}
        </div>

        <div className="flex gap-2">
          {currentStep < ONBOARDING_STEPS.length ? (
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
              disabled={isPending || !data.terms_accepted || !data.handbook_acknowledged}
            >
              <Check className="mr-2 h-4 w-4" />
              Complete Onboarding
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}