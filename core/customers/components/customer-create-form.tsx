'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Bell,
  ChevronLeft,
  ChevronRight,
  Check,
  Upload,
  AlertCircle,
  Loader2
} from 'lucide-react'

// UI Components
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Badge } from '@/components/ui/badge'

// Server Actions
import { createCustomerAction } from '../actions'

// Types
import type { CustomerProfileWithRelations } from '../dal/customers-types'

interface CustomerCreateFormProps {
  open: boolean
  onClose: () => void
  onSuccess: (customer: CustomerProfileWithRelations) => void
}

// Form steps
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
  const [isSubmitting, setIsSubmitting] = useState(false)

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
        if (!formData.display_name) {
          // Auto-generate display name if not set
          formData.display_name = `${formData.first_name} ${formData.last_name}`.trim()
        }
        break

      case 1: // Contact Details
        if (formData.phone && !/^[\d\s\-\+\(\)]+$/.test(formData.phone)) {
          newErrors.phone = 'Invalid phone number format'
        }
        if (formData.date_of_birth) {
          const dob = new Date(formData.date_of_birth)
          const now = new Date()
          if (dob > now) {
            newErrors.date_of_birth = 'Date of birth cannot be in the future'
          }
          const age = Math.floor((now.getTime() - dob.getTime()) / (1000 * 60 * 60 * 24 * 365.25))
          if (age < 13) {
            newErrors.date_of_birth = 'Customer must be at least 13 years old'
          }
        }
        break

      case 2: // Preferences
        // No validation required for preferences
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle step navigation
  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < FORM_STEPS.length - 1) {
        setCurrentStep(prev => prev + 1)
      }
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  // Handle form submission
  const handleSubmit = async () => {
    // Validate all steps
    for (let i = 0; i < FORM_STEPS.length - 1; i++) {
      if (!validateStep(i)) {
        setCurrentStep(i)
        toast.error('Please fix the errors before submitting')
        return
      }
    }

    setIsSubmitting(true)

    startTransition(async () => {
      try {
        const result = await createCustomerAction({
          email: formData.email,
          display_name: formData.display_name,
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone: formData.phone || undefined,
          date_of_birth: formData.date_of_birth || undefined,
          gender: formData.gender,
          email_consent: formData.email_consent,
          sms_consent: formData.sms_consent,
          marketing_consent: formData.marketing_consent
        })

        if (result.success && result.data) {
          // Create a mock customer object for the success callback
          const newCustomer: CustomerProfileWithRelations = {
            id: result.data.id,
            email: formData.email,
            display_name: formData.display_name,
            first_name: formData.first_name,
            last_name: formData.last_name,
            phone: formData.phone,
            date_of_birth: formData.date_of_birth,
            gender: formData.gender,
            email_consent: formData.email_consent,
            sms_consent: formData.sms_consent,
            marketing_consent: formData.marketing_consent,
            is_active: true,
            is_vip: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            visit_count: 0,
            total_spent: 0,
            preferences: null,
            favorites: [],
            notes: [],
            appointments: []
          }

          onSuccess(newCustomer)
          toast.success('Customer created successfully!')

          // Reset form
          setFormData(initialFormData)
          setCurrentStep(0)
        } else {
          toast.error(result.error || 'Failed to create customer')

          // Handle field errors
          if (result.fieldErrors) {
            setErrors(result.fieldErrors as any)
            // Navigate to first step with error
            for (let i = 0; i < FORM_STEPS.length; i++) {
              if (!validateStep(i)) {
                setCurrentStep(i)
                break
              }
            }
          }
        }
      } catch (error) {
        console.error('Error creating customer:', error)
        toast.error('An unexpected error occurred')
      } finally {
        setIsSubmitting(false)
      }
    })
  }

  // Handle close
  const handleClose = () => {
    if (isSubmitting) return

    // Reset form when closing
    setFormData(initialFormData)
    setCurrentStep(0)
    setErrors({})
    onClose()
  }

  // Generate initials for avatar
  const getInitials = () => {
    const names = [formData.first_name, formData.last_name].filter(Boolean)
    return names.map(n => n[0]).join('').toUpperCase() || 'NC'
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Customer</DialogTitle>
          <DialogDescription>
            Add a new customer to your database. Fill in their information step by step.
          </DialogDescription>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            {FORM_STEPS.map((step, index) => (
              <span
                key={step.id}
                className={index <= currentStep ? 'text-foreground font-medium' : ''}
              >
                {step.title}
              </span>
            ))}
          </div>
        </div>

        <Separator className="my-4" />

        {/* Step Content */}
        <div className="min-h-[350px]">
          {/* Step 0: Basic Information */}
          {currentStep === 0 && (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <Avatar className="h-20 w-20 mx-auto">
                  <AvatarImage src={formData.avatar_url} />
                  <AvatarFallback>{getInitials()}</AvatarFallback>
                </Avatar>
              </div>

              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">
                      First Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="first_name"
                      value={formData.first_name}
                      onChange={(e) => updateFormData('first_name', e.target.value)}
                      placeholder="John"
                      className={errors.first_name ? 'border-red-500' : ''}
                    />
                    {errors.first_name && (
                      <p className="text-xs text-red-500">{errors.first_name}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="last_name">
                      Last Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="last_name"
                      value={formData.last_name}
                      onChange={(e) => updateFormData('last_name', e.target.value)}
                      placeholder="Doe"
                      className={errors.last_name ? 'border-red-500' : ''}
                    />
                    {errors.last_name && (
                      <p className="text-xs text-red-500">{errors.last_name}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="display_name">Display Name</Label>
                  <Input
                    id="display_name"
                    value={formData.display_name}
                    onChange={(e) => updateFormData('display_name', e.target.value)}
                    placeholder="John Doe (auto-generated if empty)"
                  />
                  <p className="text-xs text-muted-foreground">
                    How the customer's name will appear in the system
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">
                    Email Address <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateFormData('email', e.target.value)}
                    placeholder="john.doe@example.com"
                    className={errors.email ? 'border-red-500' : ''}
                  />
                  {errors.email && (
                    <p className="text-xs text-red-500">{errors.email}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Contact Details */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => updateFormData('phone', e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className={errors.phone ? 'border-red-500' : ''}
                  />
                  {errors.phone && (
                    <p className="text-xs text-red-500">{errors.phone}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date_of_birth">Date of Birth</Label>
                  <Input
                    id="date_of_birth"
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => updateFormData('date_of_birth', e.target.value)}
                    className={errors.date_of_birth ? 'border-red-500' : ''}
                  />
                  {errors.date_of_birth && (
                    <p className="text-xs text-red-500">{errors.date_of_birth}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Used for birthday promotions and age verification
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Gender</Label>
                  <RadioGroup
                    value={formData.gender}
                    onValueChange={(value) => updateFormData('gender', value)}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="male" id="male" />
                      <Label htmlFor="male">Male</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="female" id="female" />
                      <Label htmlFor="female">Female</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="other" id="other" />
                      <Label htmlFor="other">Other</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="prefer_not_to_say" id="prefer_not_to_say" />
                      <Label htmlFor="prefer_not_to_say">Prefer not to say</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Preferences */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Communication Preferences</CardTitle>
                  <CardDescription>
                    Choose how this customer would like to receive updates
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="email_consent">Email Communications</Label>
                      <p className="text-xs text-muted-foreground">
                        Receive updates via email
                      </p>
                    </div>
                    <Switch
                      id="email_consent"
                      checked={formData.email_consent}
                      onCheckedChange={(checked) => updateFormData('email_consent', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="sms_consent">SMS Notifications</Label>
                      <p className="text-xs text-muted-foreground">
                        Receive text message updates
                      </p>
                    </div>
                    <Switch
                      id="sms_consent"
                      checked={formData.sms_consent}
                      onCheckedChange={(checked) => updateFormData('sms_consent', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="marketing_consent">Marketing Messages</Label>
                      <p className="text-xs text-muted-foreground">
                        Receive promotions and special offers
                      </p>
                    </div>
                    <Switch
                      id="marketing_consent"
                      checked={formData.marketing_consent}
                      onCheckedChange={(checked) => updateFormData('marketing_consent', checked)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Notification Settings</CardTitle>
                  <CardDescription>
                    What types of notifications should be sent
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="appointment_reminders">Appointment Reminders</Label>
                      <p className="text-xs text-muted-foreground">
                        Get reminders before appointments
                      </p>
                    </div>
                    <Switch
                      id="appointment_reminders"
                      checked={formData.appointment_reminders}
                      onCheckedChange={(checked) => updateFormData('appointment_reminders', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="promotions">Promotional Offers</Label>
                      <p className="text-xs text-muted-foreground">
                        Receive exclusive deals and discounts
                      </p>
                    </div>
                    <Switch
                      id="promotions"
                      checked={formData.promotions}
                      onCheckedChange={(checked) => updateFormData('promotions', checked)}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 3: Review & Create */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Review Customer Information</AlertTitle>
                <AlertDescription>
                  Please review the information below before creating the customer.
                </AlertDescription>
              </Alert>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Customer Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={formData.avatar_url} />
                      <AvatarFallback>{getInitials()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {formData.display_name || `${formData.first_name} ${formData.last_name}`}
                      </p>
                      <p className="text-sm text-muted-foreground">{formData.email}</p>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">First Name</p>
                      <p className="font-medium">{formData.first_name}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Last Name</p>
                      <p className="font-medium">{formData.last_name}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Phone</p>
                      <p className="font-medium">{formData.phone || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Date of Birth</p>
                      <p className="font-medium">
                        {formData.date_of_birth
                          ? new Date(formData.date_of_birth).toLocaleDateString()
                          : 'Not provided'}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Gender</p>
                      <p className="font-medium">
                        {formData.gender?.replace('_', ' ') || 'Not specified'}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <p className="text-sm font-medium">Communication Preferences</p>
                    <div className="flex flex-wrap gap-2">
                      {formData.email_consent && (
                        <Badge variant="secondary">Email</Badge>
                      )}
                      {formData.sms_consent && (
                        <Badge variant="secondary">SMS</Badge>
                      )}
                      {formData.marketing_consent && (
                        <Badge variant="secondary">Marketing</Badge>
                      )}
                      {formData.appointment_reminders && (
                        <Badge variant="secondary">Appointment Reminders</Badge>
                      )}
                      {formData.promotions && (
                        <Badge variant="secondary">Promotions</Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        <DialogFooter>
          <div className="flex justify-between w-full">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0 || isSubmitting}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>

              {currentStep < FORM_STEPS.length - 1 ? (
                <Button onClick={handleNext} disabled={isSubmitting}>
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || isPending}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Create Customer
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}