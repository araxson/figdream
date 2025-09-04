"use client"
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Save } from 'lucide-react'
import type { Database } from '@/types/database.types'
import { serviceSchema, ServiceFormData } from './service-form-schema'
import { BasicInfoTab } from './service-form-basic'
import { PricingTab } from './service-form-pricing'
import { BookingTab } from './service-form-booking'
import { AdvancedTab } from './service-form-advanced'

type Service = Database['public']['Tables']['services']['Row']
type Category = Database['public']['Tables']['service_categories']['Row']

interface ServiceFormProps {
  service?: Service
  categories: Category[]
  addons?: Service[]
  onSubmit?: (data: ServiceFormData) => Promise<void>
  onCancel?: () => void
}

export function ServiceForm({ 
  service, 
  categories, 
  addons = [],
  onSubmit,
  onCancel 
}: ServiceFormProps) {
  const [loading, setLoading] = useState(false)

  const form = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: service?.name || '',
      description: service?.description || '',
      category_id: service?.category_id || '',
      service_type: service?.service_type || 'standard',
      price: service?.price || 0,
      duration: service?.duration || 60,
      max_capacity: service?.max_capacity || 1,
      buffer_time: service?.buffer_time || 15,
      advance_booking_days: service?.advance_booking_days || 30,
      max_bookings_per_day: service?.max_bookings_per_day || undefined,
      requires_deposit: service?.requires_deposit || false,
      deposit_amount: service?.deposit_amount || 0,
      deposit_percentage: service?.deposit_percentage || 20,
      is_active: service?.is_active ?? true,
      available_online: service?.available_online ?? true,
      available_for_walkins: service?.available_for_walkins ?? false,
      available_days: service?.available_days || ['mon', 'tue', 'wed', 'thu', 'fri'],
      allow_addons: service?.allow_addons || false,
      addon_ids: service?.addon_ids || [],
      enable_dynamic_pricing: service?.enable_dynamic_pricing || false,
      peak_price_multiplier: service?.peak_price_multiplier || 1.5,
      off_peak_discount: service?.off_peak_discount || 10,
      preparation_time: service?.preparation_time || 0,
      cleanup_time: service?.cleanup_time || 0,
      special_equipment: service?.special_equipment || [],
      prerequisites: service?.prerequisites || [],
    },
  })

  const handleSubmit = async (data: ServiceFormData) => {
    setLoading(true)
    try {
      await onSubmit?.(data)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
            <TabsTrigger value="booking">Booking</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <BasicInfoTab form={form} categories={categories} />
          </TabsContent>

          <TabsContent value="pricing" className="space-y-4">
            <PricingTab form={form} />
          </TabsContent>

          <TabsContent value="booking" className="space-y-4">
            <BookingTab form={form} />
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4">
            <AdvancedTab form={form} addons={addons} />
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            <Save className="mr-2 h-4 w-4" />
            {service ? 'Update Service' : 'Create Service'}
          </Button>
        </div>
      </form>
    </Form>
  )
}