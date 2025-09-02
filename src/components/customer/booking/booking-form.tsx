'use client'

import * as React from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Textarea,
  Separator,
  Badge,
  Alert,
  AlertDescription,
  Checkbox,
  RadioGroup,
  RadioGroupItem,
  Label,
  Progress,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui'
import { 
  CalendarIcon, 
  Clock, 
  User, 
  CreditCard, 
  CheckCircle, 
  AlertCircle, 
  ChevronRight,
  ChevronLeft,
  Loader2,
  Receipt,
  Phone,
  HelpCircle,
  Mail,
  MessageSquare
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format, addMinutes } from 'date-fns'
import type { Database } from '@/types/database.types'

// Import our booking components
import { ServiceSelector, type SelectedService } from './service-selector'
import { StaffSelector, type StaffMember } from './staff-selector'
import { TimeSlotPicker, type TimeSlot } from './time-slot-picker'
import { TimePicker } from '@/components/shared/time-picker'

type Appointment = Database['public']['Tables']['appointments']['Row']

// Booking form validation schema
const bookingFormSchema = z.object({
  // Customer information (for walk-ins or guests)
  customer: z.object({
    first_name: z.string().min(1, 'First name is required').max(50),
    last_name: z.string().min(1, 'Last name is required').max(50),
    email: z.string().email('Invalid email address'),
    phone: z.string().min(10, 'Phone number must be at least 10 digits').max(20),
  }).optional(),
  
  // Booking details
  booking_date: z.string().min(1, 'Date is required'),
  start_time: z.string().min(1, 'Start time is required'),
  end_time: z.string().min(1, 'End time is required'),
  location_id: z.string().min(1, 'Location is required'),
  staff_id: z.string().optional(),
  
  // Services
  services: z.array(z.string()).min(1, 'At least one service must be selected'),
  
  // Additional details
  notes: z.string().max(500, 'Notes must be less than 500 characters').optional(),
  special_requests: z.string().max(500, 'Special requests must be less than 500 characters').optional(),
  
  // Preferences
  send_reminders: z.boolean().default(true),
  marketing_consent: z.boolean().default(false),
  
  // Payment (for deposits)
  deposit_required: z.boolean().default(false),
  deposit_amount: z.number().optional(),
  payment_method: z.enum(['cash', 'card', 'online']).optional(),
})

type BookingFormData = z.infer<typeof bookingFormSchema>

export interface BookingFormProps {
  locationId: string
  className?: string
  onBookingSuccess?: (booking: Appointment) => void
  onBookingError?: (error: string) => void
  initialDate?: Date
  initialServices?: SelectedService[]
  initialStaff?: StaffMember
  isWalkIn?: boolean
  currentUser?: {
    id: string
    first_name: string
    last_name: string
    email: string
    phone: string | null
  } | null
  businessRules?: {
    require_deposit: boolean
    deposit_percentage: number
    min_advance_hours: number
    max_advance_days: number
    allow_walk_ins: boolean
  }
  disabled?: boolean
}

const steps = [
  { id: 'services', title: 'Services', icon: Receipt },
  { id: 'staff', title: 'Staff', icon: User },
  { id: 'datetime', title: 'Date & Time', icon: CalendarIcon },
  { id: 'details', title: 'Details', icon: MessageSquare },
  { id: 'confirm', title: 'Confirm', icon: CheckCircle },
]

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
  const [currentStep, setCurrentStep] = React.useState(0)
  const [selectedServices, setSelectedServices] = React.useState<SelectedService[]>(initialServices)
  const [selectedStaff, setSelectedStaff] = React.useState<StaffMember | null>(initialStaff || null)
  const [selectedDate, setSelectedDate] = React.useState<Date>(initialDate || new Date())
  const [selectedTimeSlot, setSelectedTimeSlot] = React.useState<TimeSlot | null>(null)
  const [customStartTime, setCustomStartTime] = React.useState<string>('')
  const [timeSelectionMethod, setTimeSelectionMethod] = React.useState<'slots' | 'custom'>('slots')
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [submitError, setSubmitError] = React.useState<string | null>(null)

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
  const totals = React.useMemo(() => {
    const totalPrice = selectedServices.reduce((sum, service) => sum + service.total_price, 0)
    const totalDuration = selectedServices.reduce((sum, service) => sum + service.total_duration, 0)
    const depositAmount = businessRules.require_deposit ? Math.round(totalPrice * businessRules.deposit_percentage / 100) : 0

    return {
      totalPrice,
      totalDuration,
      depositAmount,
      finalAmount: totalPrice - depositAmount
    }
  }, [selectedServices, businessRules])

  // Calculate end time for custom time selection
  const calculateEndTime = (startTime: string, durationMinutes: number): string => {
    if (!startTime) return ''
    const [hours, minutes] = startTime.split(':').map(Number)
    const startDate = new Date()
    startDate.setHours(hours, minutes, 0, 0)
    const endDate = addMinutes(startDate, durationMinutes)
    return format(endDate, 'HH:mm:ss')
  }

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
  }, [selectedServices, selectedDate, selectedTimeSlot, customStartTime, timeSelectionMethod, selectedStaff, totals.depositAmount, totals.totalDuration, businessRules.require_deposit, form])

  // Navigate between steps
  const nextStep = () => {
    if (currentStep < steps.length - 1) {
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
        return selectedStaff !== null || !selectedServices.some(s => s.id) // Some services might not require specific staff
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

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Services
        return (
          <ServiceSelector
            locationId={locationId}
            staffId={selectedStaff?.id}
            selectedServices={selectedServices}
            onServiceSelect={setSelectedServices}
            allowMultiple={true}
            showCategories={true}
            showSearch={true}
            disabled={disabled}
          />
        )

      case 1: // Staff
        return (
          <StaffSelector
            locationId={locationId}
            serviceIds={selectedServices.map(s => s.id)}
            selectedDate={selectedDate}
            selectedTime={selectedTimeSlot?.start_time}
            selectedStaff={selectedStaff}
            onStaffSelect={setSelectedStaff}
            allowAnyStaff={true}
            showAvailability={true}
            showRatings={true}
            disabled={disabled}
          />
        )

      case 2: // Date & Time
        return (
          <div className="space-y-6">
            {/* Date Selection Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5" />
                  Select Date
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Calendar component would go here */}
                <div className="text-center p-8 text-muted-foreground">
                  <CalendarIcon className="h-12 w-12 mx-auto mb-2" />
                  <p>Calendar component placeholder</p>
                  <p className="text-sm">Selected: {format(selectedDate, 'EEEE, MMMM d, yyyy')}</p>
                </div>
              </CardContent>
            </Card>

            {/* Time Selection Method */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Choose Time Selection Method
                </CardTitle>
                <CardDescription>
                  Select from available time slots or specify a custom time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={timeSelectionMethod}
                  onValueChange={(value) => {
                    setTimeSelectionMethod(value as 'slots' | 'custom')
                    // Reset selections when switching methods
                    setSelectedTimeSlot(null)
                    setCustomStartTime('')
                  }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  disabled={disabled}
                >
                  <Card className="flex items-center space-x-2">
                    <CardContent className="p-4 flex items-center space-x-2 w-full">
                      <RadioGroupItem value="slots" id="slots" />
                      <div className="flex-1">
                        <Label htmlFor="slots" className="font-medium">Available Time Slots</Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          Choose from staff availability ({selectedStaff ? 'with selected staff' : 'any staff'})
                        </p>
                      </div>
                      <Badge variant="outline" className="ml-auto">
                        {selectedStaff ? 'Staff-specific' : 'Flexible'}
                      </Badge>
                    </CardContent>
                  </Card>
                  
                  <Card className="flex items-center space-x-2">
                    <CardContent className="p-4 flex items-center space-x-2 w-full">
                      <RadioGroupItem value="custom" id="custom" />
                      <div className="flex-1">
                        <Label htmlFor="custom" className="font-medium">Custom Time</Label>
                        <p className="text-sm text-muted-foreground mt-1">
                        Select any time (subject to availability confirmation)
                      </p>
                    </div>
                    <Badge variant="secondary" className="ml-auto">
                      Flexible
                    </Badge>
                    </CardContent>
                  </Card>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Time Slot Selection */}
            {timeSelectionMethod === 'slots' && selectedStaff && (
              <TimeSlotPicker
                staffId={selectedStaff.id}
                locationId={locationId}
                selectedDate={selectedDate}
                serviceDurationMinutes={totals.totalDuration}
                onTimeSlotSelect={setSelectedTimeSlot}
                selectedTimeSlot={selectedTimeSlot}
                minAdvanceHours={businessRules.min_advance_hours}
                disabled={disabled}
              />
            )}

            {/* Custom Time Selection */}
            {timeSelectionMethod === 'custom' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Select Custom Time
                  </CardTitle>
                  <CardDescription>
                    Choose your preferred start time. Duration: {totals.totalDuration} minutes
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <TimePicker
                      label="Start Time"
                      placeholder="Select start time"
                      value={customStartTime}
                      onChange={setCustomStartTime}
                      minTime="08:00"
                      maxTime="20:00"
                      interval={15}
                      disabled={disabled}
                    />
                    
                    <div className="space-y-2">
                      <Label>End Time (Calculated)</Label>
                      <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {customStartTime 
                            ? (() => {
                                const endTime = calculateEndTime(customStartTime + ':00', totals.totalDuration)
                                const [hour, minute] = endTime.split(':').map(Number)
                                const period = hour >= 12 ? 'PM' : 'AM'
                                const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
                                return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`
                              })()
                            : 'Select start time first'
                          }
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Automatically calculated based on service duration
                      </p>
                    </div>
                  </div>

                  {customStartTime && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Note:</strong> Custom time selections are subject to staff availability. 
                        We'll confirm your appointment time and notify you of any necessary adjustments.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            )}

            {/* No Staff Selected Message */}
            {timeSelectionMethod === 'slots' && !selectedStaff && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Please select a staff member first to see available time slots, or choose the custom time option.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )

      case 3: // Details
        return (
          <div className="space-y-6">
            {/* Customer Information (for walk-ins or non-authenticated users) */}
            {(!currentUser || isWalkIn) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Customer Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="customer.first_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="John" {...field} disabled={disabled} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="customer.last_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Doe" {...field} disabled={disabled} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="customer.email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email *</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="john@example.com" {...field} disabled={disabled} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="customer.phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone *</FormLabel>
                        <FormControl>
                          <Input type="tel" placeholder="(555) 123-4567" {...field} disabled={disabled} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            )}

            {/* Booking Notes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Additional Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Any additional notes for your appointment..."
                          className="min-h-20"
                          {...field}
                          disabled={disabled}
                        />
                      </FormControl>
                      <FormDescription>
                        Optional notes about your appointment
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="special_requests"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        Special Requests
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-4 w-4">
                              <HelpCircle className="h-3 w-3" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-80">
                            <div className="space-y-2">
                              <h4 className="font-medium">Special Requests Guide</h4>
                              <p className="text-sm text-muted-foreground">
                                Use this field to communicate any specific needs:
                              </p>
                              <ul className="text-sm space-y-1">
                                <li>• Accessibility requirements</li>
                                <li>• Allergies or sensitivities</li>
                                <li>• Preferred products or techniques</li>
                                <li>• Styling preferences</li>
                                <li>• Time constraints</li>
                              </ul>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Any special requests or accommodations needed..."
                          className="min-h-20"
                          {...field}
                          disabled={disabled}
                        />
                      </FormControl>
                      <FormDescription>
                        Let us know if you have any special needs or requests
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Preferences */}
            <Card>
              <CardHeader>
                <CardTitle>Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="send_reminders"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={disabled}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Send appointment reminders</FormLabel>
                        <FormDescription>
                          We'll send you email and SMS reminders about your appointment
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="marketing_consent"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={disabled}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Receive promotional offers</FormLabel>
                        <FormDescription>
                          Get exclusive deals and promotions (you can unsubscribe anytime)
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Payment Information (if deposit required) */}
            {businessRules.require_deposit && totals.depositAmount > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Deposit Required
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      A deposit of ${totals.depositAmount} ({businessRules.deposit_percentage}%) is required to secure your booking.
                      The remaining ${totals.finalAmount} will be due at the time of service.
                    </AlertDescription>
                  </Alert>

                  <FormField
                    control={form.control}
                    name="payment_method"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Payment Method</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            value={field.value}
                            className="flex flex-col space-y-2"
                            disabled={disabled}
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="online" id="online" />
                              <Label htmlFor="online">Pay online now</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="card" id="card" />
                              <Label htmlFor="card">Pay with card at location</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="cash" id="cash" />
                              <Label htmlFor="cash">Pay with cash at location</Label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            )}
          </div>
        )

      case 4: // Confirm
        return (
          <div className="space-y-6">
            {/* Booking Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Booking Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Services */}
                <div>
                  <h4 className="font-medium mb-2">Services</h4>
                  <div className="space-y-2">
                    {selectedServices.map(service => (
                      <div key={service.id} className="flex justify-between items-center">
                        <div>
                          <span className="font-medium">{service.name}</span>
                          {service.quantity > 1 && (
                            <span className="text-muted-foreground ml-1">× {service.quantity}</span>
                          )}
                          <div className="text-sm text-muted-foreground">
                            {service.total_duration} minutes
                          </div>
                        </div>
                        <span className="font-medium">${service.total_price}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Staff */}
                <div>
                  <h4 className="font-medium mb-2">Staff</h4>
                  <p className="text-sm">
                    {selectedStaff 
                      ? `${selectedStaff.first_name} ${selectedStaff.last_name} - ${selectedStaff.role}`
                      : 'Any available staff member'
                    }
                  </p>
                </div>

                <Separator />

                {/* Date & Time */}
                <div>
                  <h4 className="font-medium mb-2">Date & Time</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-1 text-sm">
                      <CalendarIcon className="h-4 w-4" />
                      <span>{format(selectedDate, 'EEEE, MMMM d, yyyy')}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      <Clock className="h-4 w-4" />
                      {timeSelectionMethod === 'slots' && selectedTimeSlot ? (
                        <span>{selectedTimeSlot.start_time.slice(0, 5)} - {selectedTimeSlot.end_time.slice(0, 5)}</span>
                      ) : timeSelectionMethod === 'custom' && customStartTime ? (
                        <span>
                          {(() => {
                            const startTime = customStartTime + ':00'
                            const endTime = calculateEndTime(startTime, totals.totalDuration)
                            return `${startTime.slice(0, 5)} - ${endTime.slice(0, 5)}`
                          })()}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">Time not selected</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Badge variant="outline" className="text-xs">
                        {timeSelectionMethod === 'slots' ? 'Available Slot' : 'Custom Time'}
                      </Badge>
                      {timeSelectionMethod === 'custom' && (
                        <span className="ml-2">Subject to availability confirmation</span>
                      )}
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Pricing */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span>Subtotal</span>
                    <span>${totals.totalPrice}</span>
                  </div>
                  {businessRules.require_deposit && totals.depositAmount > 0 && (
                    <>
                      <div className="flex justify-between items-center text-sm text-muted-foreground">
                        <span>Deposit ({businessRules.deposit_percentage}%)</span>
                        <span>-${totals.depositAmount}</span>
                      </div>
                      <Separator className="my-2" />
                      <div className="flex justify-between items-center font-medium pt-2">
                        <span>Due at service</span>
                        <span>${totals.finalAmount}</span>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Error Display */}
            {submitError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{submitError}</AlertDescription>
              </Alert>
            )}

            {/* Terms and Conditions */}
            <Card>
              <CardContent>
                <div className="text-sm text-muted-foreground space-y-2">
                  <p>By confirming this booking, you agree to our terms and conditions:</p>
                  <ul className="list-disc ml-4 space-y-1">
                    <li>Cancellations must be made at least 24 hours in advance</li>
                    <li>No-shows may be charged the full service amount</li>
                    <li>Rescheduling is subject to availability</li>
                    {businessRules.require_deposit && (
                      <li>Deposits are non-refundable but can be applied to rescheduled appointments</li>
                    )}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      default:
        return null
    }
  }

  // Calculate progress percentage
  const progressPercentage = ((currentStep + 1) / steps.length) * 100

  return (
    <div className={cn("space-y-6", className)}>
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
                  onClick={() => !isDisabled && goToStep(index)}
                  disabled={isDisabled}
                  variant={isActive ? "default" : isComplete ? "secondary" : "ghost"}
                  size="sm"
                  className={cn(
                    "gap-2",
                    isActive && "pointer-events-none",
                    !isActive && !isComplete && "text-muted-foreground hover:text-foreground"
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
              {currentStep === steps.length - 1 ? (
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

      {/* Summary Sidebar (visible on larger screens) */}
      {selectedServices.length > 0 && currentStep < steps.length - 1 && (
        <div className="hidden lg:block fixed right-6 top-1/2 transform -translate-y-1/2 w-80">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Booking Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {/* Selected Services */}
              <div>
                <h5 className="font-medium mb-2">Services</h5>
                {selectedServices.slice(0, 2).map(service => (
                  <div key={service.id} className="flex justify-between">
                    <span>{service.name}</span>
                    <span>${service.total_price}</span>
                  </div>
                ))}
                {selectedServices.length > 2 && (
                  <div className="text-muted-foreground">
                    +{selectedServices.length - 2} more services
                  </div>
                )}
              </div>

              {/* Selected Staff */}
              {selectedStaff && (
                <div>
                  <h5 className="font-medium mb-1">Staff</h5>
                  <p className="text-muted-foreground">
                    {selectedStaff.first_name} {selectedStaff.last_name}
                  </p>
                </div>
              )}

              {/* Selected Date/Time */}
              {((timeSelectionMethod === 'slots' && selectedTimeSlot) || (timeSelectionMethod === 'custom' && customStartTime)) && (
                <div>
                  <h5 className="font-medium mb-1">Date & Time</h5>
                  <p className="text-muted-foreground">
                    {format(selectedDate, 'MMM d')} at {
                      timeSelectionMethod === 'slots' && selectedTimeSlot
                        ? selectedTimeSlot.start_time.slice(0, 5)
                        : timeSelectionMethod === 'custom' && customStartTime
                          ? customStartTime
                          : 'Not set'
                    }
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {timeSelectionMethod === 'custom' && 'Custom time (pending confirmation)'}
                  </p>
                </div>
              )}

              <Separator />

              {/* Total */}
              <div className="flex justify-between font-medium">
                <span>Total</span>
                <span>${totals.totalPrice}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}