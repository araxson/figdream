'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Form } from '@/components/ui/form'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { CustomerSelection } from './customer-selection'
import { ServiceSelection } from './service-selection'
import { ScheduleSelection } from './schedule-selection'
import { PaymentDetails } from './payment-details'
import { createAppointmentAction, checkAvailabilityAction } from '../../actions/appointments'
import type { Database } from '@/types/database.types'

type Staff = Database['public']['Views']['profiles']['Row']
type Service = Database['public']['Views']['services']['Row']
type Customer = Database['public']['Views']['profiles']['Row']

const formSchema = z.object({
  customer_id: z.string().min(1, 'Please select a customer'),
  services: z.array(z.string()).min(1, 'Please select at least one service'),
  date: z.date({
    required_error: 'Please select a date'
  }),
  time: z.string().min(1, 'Please select a time'),
  staff_id: z.string().min(1, 'Please select a staff member'),
  payment_method: z.enum(['cash', 'card', 'online'], {
    required_error: 'Please select a payment method'
  }),
  notes: z.string().optional()
})

type FormValues = z.infer<typeof formSchema>

interface AppointmentFormProps {
  salonId: string
  customers: Customer[]
  staff: Staff[]
  services: Service[]
  onSuccess?: (appointmentId: string) => void
  onCreateCustomer?: () => void
  taxRate?: number
  depositRequired?: boolean
  depositPercentage?: number
  initialData?: Partial<FormValues>
}

export function AppointmentForm({
  salonId,
  customers = [],
  staff = [],
  services = [],
  onSuccess,
  onCreateCustomer,
  taxRate = 0,
  depositRequired = false,
  depositPercentage = 20,
  initialData
}: AppointmentFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('customer')

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      customer_id: '',
      services: [],
      date: undefined,
      time: '',
      staff_id: '',
      payment_method: 'cash',
      notes: ''
    }
  })

  const checkAvailability = async (date: Date, time: string, staffId: string): Promise<boolean> => {
    try {
      const result = await checkAvailabilityAction({
        salon_id: salonId,
        date: date.toISOString().split('T')[0],
        time,
        staff_id: staffId,
        duration: 60 // Default duration, should be calculated from services
      })
      return result.available
    } catch (error) {
      return false
    }
  }

  const onSubmit = async (data: FormValues) => {
    try {
      setLoading(true)

      // Check availability one more time before booking
      const isAvailable = await checkAvailability(data.date, data.time, data.staff_id)
      if (!isAvailable) {
        toast.error('Selected time slot is no longer available. Please choose a different time.')
        return
      }

      const appointmentData = {
        salon_id: salonId,
        customer_id: data.customer_id,
        staff_id: data.staff_id,
        service_ids: data.services,
        appointment_date: data.date.toISOString().split('T')[0],
        appointment_time: data.time,
        payment_method: data.payment_method,
        notes: data.notes || '',
        status: 'confirmed' as const
      }

      const result = await createAppointmentAction(appointmentData)

      if (result.success && result.appointment) {
        toast.success('Appointment created successfully!')
        onSuccess?.(result.appointment.id)
        form.reset()
      } else {
        toast.error(result.error || 'Failed to create appointment')
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
      console.error('Appointment creation error:', error)
    } finally {
      setLoading(false)
    }
  }

  const isStepValid = (step: string): boolean => {
    const errors = form.formState.errors
    switch (step) {
      case 'customer':
        return !errors.customer_id
      case 'service':
        return !errors.services
      case 'schedule':
        return !errors.date && !errors.time && !errors.staff_id
      case 'payment':
        return !errors.payment_method
      default:
        return true
    }
  }

  const canProceedToNext = (currentTab: string): boolean => {
    const values = form.getValues()
    switch (currentTab) {
      case 'customer':
        return !!values.customer_id
      case 'service':
        return values.services.length > 0
      case 'schedule':
        return !!values.date && !!values.time && !!values.staff_id
      default:
        return true
    }
  }

  const nextTab = () => {
    const tabs = ['customer', 'service', 'schedule', 'payment']
    const currentIndex = tabs.indexOf(activeTab)
    if (currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1])
    }
  }

  const prevTab = () => {
    const tabs = ['customer', 'service', 'schedule', 'payment']
    const currentIndex = tabs.indexOf(activeTab)
    if (currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1])
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger
              value="customer"
              className={isStepValid('customer') ? 'data-[state=active]:bg-green-100' : ''}
            >
              Customer
            </TabsTrigger>
            <TabsTrigger
              value="service"
              className={isStepValid('service') ? 'data-[state=active]:bg-green-100' : ''}
            >
              Service
            </TabsTrigger>
            <TabsTrigger
              value="schedule"
              className={isStepValid('schedule') ? 'data-[state=active]:bg-green-100' : ''}
            >
              Schedule
            </TabsTrigger>
            <TabsTrigger
              value="payment"
              className={isStepValid('payment') ? 'data-[state=active]:bg-green-100' : ''}
            >
              Payment
            </TabsTrigger>
          </TabsList>

          <TabsContent value="customer" className="space-y-4">
            <CustomerSelection
              form={form}
              customers={customers}
              onCreateCustomer={onCreateCustomer}
              loading={loading}
            />
          </TabsContent>

          <TabsContent value="service" className="space-y-4">
            <ServiceSelection
              form={form}
              services={services}
              loading={loading}
            />
          </TabsContent>

          <TabsContent value="schedule" className="space-y-4">
            <ScheduleSelection
              form={form}
              staff={staff}
              loading={loading}
              onCheckAvailability={checkAvailability}
            />
          </TabsContent>

          <TabsContent value="payment" className="space-y-4">
            <PaymentDetails
              form={form}
              services={services}
              taxRate={taxRate}
              depositRequired={depositRequired}
              depositPercentage={depositPercentage}
              loading={loading}
            />
          </TabsContent>
        </Tabs>

        {/* Navigation and Submit */}
        <div className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={prevTab}
            disabled={activeTab === 'customer' || loading}
          >
            Previous
          </Button>

          <div className="flex gap-2">
            {activeTab !== 'payment' ? (
              <Button
                type="button"
                onClick={nextTab}
                disabled={!canProceedToNext(activeTab) || loading}
              >
                Next
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={loading || !form.formState.isValid}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Appointment
              </Button>
            )}
          </div>
        </div>

        {/* Form Errors */}
        {Object.keys(form.formState.errors).length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please fix the errors above before proceeding.
            </AlertDescription>
          </Alert>
        )}
      </form>
    </Form>
  )
}