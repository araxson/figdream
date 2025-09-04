'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Plus, Edit } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { createClient } from '@/lib/database/supabase/client'
import type { Database } from '@/types/database.types'
type Service = Database['public']['Tables']['services']['Row']
type Location = Database['public']['Tables']['salon_locations']['Row']
const serviceCostSchema = z.object({
  service_id: z.string().uuid('Please select a service'),
  location_id: z.string().uuid('Please select a location'),
  base_price: z.coerce.number().positive('Price must be greater than 0'),
  duration_minutes: z.coerce.number().min(15, 'Duration must be at least 15 minutes').max(480, 'Duration cannot exceed 8 hours'),
  is_active: z.boolean(),
  peak_price: z.coerce.number().optional(),
  off_peak_price: z.coerce.number().optional(),
})
type ServiceCostFormData = z.infer<typeof serviceCostSchema>
interface ServiceCostDialogProps {
  services: Service[]
  locations: Location[]
  mode: 'create' | 'edit'
  serviceId?: string
  costId?: string
}
export function ServiceCostDialog({ 
  services, 
  locations, 
  mode, 
  serviceId,
  costId 
}: ServiceCostDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const form = useForm<ServiceCostFormData>({
    resolver: zodResolver(serviceCostSchema),
    defaultValues: {
      service_id: serviceId || '',
      location_id: '',
      base_price: 0,
      duration_minutes: 60,
      is_active: true,
      peak_price: undefined,
      off_peak_price: undefined,
    }
  })
  async function onSubmit(data: ServiceCostFormData) {
    setIsSubmitting(true)
    try {
      const supabase = createClient()
      if (mode === 'create') {
        const { error } = await supabase
          .from('service_costs')
          .insert({
            service_id: data.service_id,
            location_id: data.location_id,
            base_price: data.base_price,
            duration_minutes: data.duration_minutes,
            is_active: data.is_active,
            peak_price: data.peak_price || null,
            off_peak_price: data.off_peak_price || null,
          })
        if (error) throw error
        toast.success('Service cost added successfully')
      } else {
        // Edit mode would update existing cost
        const { error } = await supabase
          .from('service_costs')
          .update({
            base_price: data.base_price,
            duration_minutes: data.duration_minutes,
            is_active: data.is_active,
            peak_price: data.peak_price || null,
            off_peak_price: data.off_peak_price || null,
          })
          .eq('id', costId!)
        if (error) throw error
        toast.success('Service cost updated successfully')
      }
      setOpen(false)
      form.reset()
      router.refresh()
    } catch (_error) {
      toast.error('Failed to save service cost')
    } finally {
      setIsSubmitting(false)
    }
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={mode === 'create' ? 'default' : 'outline'} size={mode === 'create' ? 'default' : 'sm'}>
          {mode === 'create' ? (
            <>
              <Plus className="h-4 w-4 mr-2" />
              Add Service Cost
            </>
          ) : (
            <>
              <Edit className="h-4 w-4 mr-2" />
              Edit Pricing
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Add Service Cost' : 'Edit Service Cost'}
          </DialogTitle>
          <DialogDescription>
            Configure location-specific pricing for services
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {mode === 'create' && (
              <FormField
                control={form.control}
                name="service_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a service" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {services.map((service) => (
                          <SelectItem key={service.id} value={service.id}>
                            {service.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name="location_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a location" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {locations.map((location) => (
                        <SelectItem key={location.id} value={location.id}>
                          {location.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Choose which location this pricing applies to
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="base_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Base Price ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="duration_minutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (minutes)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="60"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="peak_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Peak Price ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Optional"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Premium pricing for busy hours
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="off_peak_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Off-Peak Price ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Optional"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Discounted pricing for slow hours
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Active</FormLabel>
                    <FormDescription>
                      Enable this pricing configuration
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : mode === 'create' ? 'Add Cost' : 'Update Cost'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}