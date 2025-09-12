'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Clock, DollarSign, ArrowLeft, ArrowRight } from 'lucide-react'
import { useState, useEffect } from 'react'
import { formatCurrency, formatDuration } from '@/lib/utils/format'
import { cn } from '@/lib/utils'
import { LoadingCard } from '@/components/shared/ui-helpers/loading-states'
import { EmptyState } from '@/components/shared/ui-helpers/empty-states'
import { useApi } from '@/hooks/use-api'

interface ServiceData {
  id: string
  name: string
  description?: string | null
  base_price: number
  duration_minutes: number
  category_id?: string | null
}

interface ServiceSelectionProps {
  salonId?: string
  onSelect?: (serviceIds: string[]) => void
  onBack?: () => void
}

export function ServiceSelection({ salonId, onSelect, onBack }: ServiceSelectionProps) {
  const [services, setServices] = useState<ServiceData[]>([])
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const { loading, get } = useApi<ServiceData[]>()

  useEffect(() => {
    const loadServices = async () => {
      if (salonId) {
        const data = await get(`/api/services?salonId=${salonId}`)
        if (data) {
          setServices(data)
        }
      }
    }
    loadServices()
  }, [salonId, get])


  const toggleService = (serviceId: string) => {
    setSelectedServices(prev =>
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    )
  }

  const getTotalPrice = () => {
    return selectedServices.reduce((total, id) => {
      const service = services.find(s => s.id === id)
      return total + (service?.base_price || 0)
    }, 0)
  }

  const getTotalDuration = () => {
    return selectedServices.reduce((total, id) => {
      const service = services.find(s => s.id === id)
      return total + (service?.duration_minutes || 0)
    }, 0)
  }

  const handleContinue = () => {
    if (selectedServices.length > 0) {
      onSelect?.(selectedServices)
    }
  }

  // Group services by category
  const servicesByCategory = services.reduce((acc, service) => {
    const category = service.category_id || 'Other'
    if (!acc[category]) acc[category] = []
    acc[category].push(service)
    return acc
  }, {} as Record<string, ServiceData[]>)

  if (loading) {
    return <LoadingCard title="Loading Services" message="Fetching available services..." />
  }

  if (services.length === 0) {
    return (
      <EmptyState
        title="No services available"
        description="This salon hasn&apos;t added any services yet"
        action={onBack ? { label: 'Go Back', onClick: onBack } : undefined}
      />
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Select Services</CardTitle>
          <CardDescription>
            Choose the services you'd like to book
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {Object.entries(servicesByCategory).map(([category, categoryServices]) => (
              <div key={category} className="space-y-3">
                <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
                  {category}
                </h3>
                <div className="space-y-2">
                  {categoryServices.map((service) => (
                    <div
                      key={service.id}
                      className={cn(
                        "flex items-start space-x-3 p-4 rounded-lg border transition-colors",
                        selectedServices.includes(service.id)
                          ? "bg-primary/5 border-primary"
                          : "hover:bg-muted/50"
                      )}
                    >
                      <Checkbox
                        id={service.id}
                        checked={selectedServices.includes(service.id)}
                        onCheckedChange={() => toggleService(service.id)}
                        className="mt-1"
                      />
                      <Label
                        htmlFor={service.id}
                        className="flex-1 cursor-pointer space-y-1"
                      >
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <p className="font-medium">{service.name}</p>
                            {service.description && (
                              <p className="text-sm text-muted-foreground">
                                {service.description}
                              </p>
                            )}
                          </div>
                          <div className="text-right ml-4">
                            <p className="font-medium">
                              {formatCurrency(service.base_price)}
                            </p>
                            <p className="text-sm text-muted-foreground flex items-center justify-end gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDuration(service.duration_minutes)}
                            </p>
                          </div>
                        </div>
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      {selectedServices.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {selectedServices.length} service{selectedServices.length !== 1 ? 's' : ''} selected
                </p>
                <div className="flex items-center gap-4 mt-1">
                  <p className="font-medium flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    Total: {formatCurrency(getTotalPrice())}
                  </p>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {formatDuration(getTotalDuration())}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex justify-between">
        {onBack && (
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        )}
        <Button
          onClick={handleContinue}
          disabled={selectedServices.length === 0}
          className="ml-auto"
        >
          Continue
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}