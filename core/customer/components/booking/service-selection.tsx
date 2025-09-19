'use client'

import { useState } from 'react'
import { Clock, DollarSign, Info, Plus, Minus } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { ServiceSelectionItem, ServiceVariant } from '../../types'

interface ServiceSelectionProps {
  services: ServiceSelectionItem[]
  selectedServices: ServiceSelectionItem[]
  onServiceToggle: (service: ServiceSelectionItem, isSelected: boolean) => void
  onVariantSelect?: (serviceId: string, variant: ServiceVariant) => void
  onContinue: () => void
  maxServices?: number
}

export function ServiceSelection({
  services,
  selectedServices,
  onServiceToggle,
  onVariantSelect,
  onContinue,
  maxServices = 5
}: ServiceSelectionProps) {
  const [expandedService, setExpandedService] = useState<string | null>(null)

  // Group services by category
  const servicesByCategory = services.reduce((acc, service) => {
    const category = service.category || 'General'
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(service)
    return acc
  }, {} as Record<string, ServiceSelectionItem[]>)

  const totalDuration = selectedServices.reduce((sum, service) => sum + service.duration, 0)
  const totalPrice = selectedServices.reduce((sum, service) => sum + service.price, 0)
  const canAddMore = selectedServices.length < maxServices

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
    }
    return `${mins}m`
  }

  const isServiceSelected = (serviceId: string) => {
    return selectedServices.some(s => s.id === serviceId)
  }

  const handleServiceToggle = (service: ServiceSelectionItem) => {
    const isSelected = isServiceSelected(service.id)

    if (!isSelected && !canAddMore) {
      return // Don't add if max services reached
    }

    onServiceToggle(service, !isSelected)
  }

  const ServiceCard = ({ service }: { service: ServiceSelectionItem }) => {
    const isSelected = isServiceSelected(service.id)
    const isDisabled = !isSelected && !canAddMore

    return (
      <Card className={`cursor-pointer transition-all ${
        isSelected
          ? 'ring-2 ring-primary border-primary'
          : isDisabled
          ? 'opacity-50 cursor-not-allowed'
          : 'hover:shadow-md'
      }`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={isSelected}
                  disabled={isDisabled}
                  onCheckedChange={() => !isDisabled && handleServiceToggle(service)}
                />
                <CardTitle className="text-base">{service.name}</CardTitle>
              </div>
              <CardDescription className="mt-1">
                {service.description}
              </CardDescription>
            </div>
            {service.imageUrl && (
              <div className="w-16 h-16 rounded-md bg-muted overflow-hidden ml-4">
                <img
                  src={service.imageUrl}
                  alt={service.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {formatDuration(service.duration)}
              </div>
              <div className="flex items-center gap-1">
                <DollarSign className="h-4 w-4" />
                ${service.price}
              </div>
            </div>
            {service.variants && service.variants.length > 0 && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                    <Info className="h-4 w-4 mr-1" />
                    Options
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{service.name} Options</DialogTitle>
                    <DialogDescription>
                      Choose from available variants for this service
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-3">
                    {service.variants.map((variant) => (
                      <div
                        key={variant.id}
                        className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-muted"
                        onClick={() => onVariantSelect?.(service.id, variant)}
                      >
                        <div>
                          <div className="font-medium">{variant.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {variant.description}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">${variant.price}</div>
                          <div className="text-sm text-muted-foreground">
                            {formatDuration(variant.duration)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {service.staffRequired && service.staffRequired.length > 0 && (
            <div className="text-xs text-muted-foreground">
              Requires specific staff member
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Select Services</h2>
        <p className="text-muted-foreground">
          Choose up to {maxServices} services for your appointment
        </p>
      </div>

      {/* Selected Services Summary */}
      {selectedServices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Selected Services</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {selectedServices.map((service) => (
                <div key={service.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => onServiceToggle(service, false)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <div>
                      <div className="font-medium">{service.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {formatDuration(service.duration)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">${service.price}</div>
                  </div>
                </div>
              ))}
              <Separator />
              <div className="flex items-center justify-between font-semibold">
                <div>Total ({formatDuration(totalDuration)})</div>
                <div>${totalPrice}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Service Categories */}
      <div className="space-y-4">
        <Accordion type="single" collapsible defaultValue={Object.keys(servicesByCategory)[0]}>
          {Object.entries(servicesByCategory).map(([category, categoryServices]) => (
            <AccordionItem key={category} value={category}>
              <AccordionTrigger className="text-lg font-semibold">
                {category} ({categoryServices.length})
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid gap-4 mt-4">
                  {categoryServices.map((service) => (
                    <ServiceCard key={service.id} service={service} />
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      {/* Max Services Warning */}
      {!canAddMore && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-orange-600" />
              <span className="text-sm text-orange-800">
                Maximum of {maxServices} services selected. Remove a service to add another.
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Continue Button */}
      <div className="flex justify-between items-center pt-4">
        <div className="text-sm text-muted-foreground">
          {selectedServices.length} of {maxServices} services selected
        </div>
        <Button
          onClick={onContinue}
          disabled={selectedServices.length === 0}
          className="min-w-32"
        >
          Continue
          {selectedServices.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              ${totalPrice}
            </Badge>
          )}
        </Button>
      </div>
    </div>
  )
}