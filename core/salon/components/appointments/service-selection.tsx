'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Scissors, DollarSign, Clock } from 'lucide-react'
import { UseFormReturn } from 'react-hook-form'
import type { Database } from '@/types/database.types'

type Service = Database['public']['Views']['services']['Row']
type FormValues = {
  customer_id: string
  services: string[]
  date: Date
  time: string
  staff_id: string
  payment_method: 'cash' | 'card' | 'online'
  notes?: string
}

interface ServiceSelectionProps {
  form: UseFormReturn<FormValues>
  services: Service[]
  loading?: boolean
}

export function ServiceSelection({
  form,
  services = [],
  loading = false
}: ServiceSelectionProps) {
  const selectedServices = form.watch('services') || []
  const selectedServiceObjects = services.filter(s => selectedServices.includes(s.id))

  const totalDuration = selectedServiceObjects.reduce((sum, service) =>
    sum + (service.duration || 0), 0
  )

  const totalPrice = selectedServiceObjects.reduce((sum, service) =>
    sum + (service.price || 0), 0
  )

  const toggleService = (serviceId: string, checked: boolean) => {
    const currentServices = form.getValues('services') || []
    if (checked) {
      form.setValue('services', [...currentServices, serviceId])
    } else {
      form.setValue('services', currentServices.filter(id => id !== serviceId))
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scissors className="h-5 w-5" />
          Service Selection
        </CardTitle>
        <CardDescription>
          Choose one or more services for this appointment
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="services"
          render={() => (
            <FormItem>
              <FormLabel>Available Services</FormLabel>
              <FormControl>
                <div className="space-y-3">
                  {services.map((service) => {
                    const isSelected = selectedServices.includes(service.id)

                    return (
                      <div
                        key={service.id}
                        className={`relative border rounded-lg p-4 cursor-pointer transition-colors ${
                          isSelected
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                        onClick={() => toggleService(service.id, !isSelected)}
                      >
                        <div className="flex items-start gap-3">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) =>
                              toggleService(service.id, !!checked)
                            }
                            disabled={loading}
                            className="mt-1"
                          />

                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Scissors className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">{service.name}</span>
                                <Badge variant="secondary" className="text-xs">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {service.duration} min
                                </Badge>
                              </div>
                              <span className="font-semibold flex items-center gap-1">
                                <DollarSign className="h-4 w-4" />
                                {service.price?.toFixed(2)}
                              </span>
                            </div>
                            {service.description && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {service.description}
                              </p>
                            )}
                            {service.category && (
                              <Badge variant="outline" className="text-xs mt-2">
                                {service.category}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {selectedServices.length === 0 && services.length === 0 && (
          <div className="text-center py-6 text-muted-foreground">
            <Scissors className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No services available</p>
          </div>
        )}

        {selectedServices.length > 0 && (
          <Card className="bg-muted/50">
            <CardContent className="pt-4">
              <div className="space-y-3">
                <div className="font-medium text-sm">Selected Services:</div>

                <div className="space-y-2">
                  {selectedServiceObjects.map((service) => (
                    <div key={service.id} className="flex justify-between items-center text-sm">
                      <span>{service.name}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {service.duration}min
                        </Badge>
                        <span className="font-medium">${service.price?.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-2 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Total Duration:
                    </span>
                    <span className="font-medium">{totalDuration} minutes</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      Subtotal:
                    </span>
                    <span className="font-semibold">${totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  )
}