'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Clock, DollarSign, AlertCircle, RefreshCw } from 'lucide-react'
import { useEffect, useCallback, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database.types'
import { formatCurrency, formatDuration } from '@/lib/utils/format'
import { useToast } from '@/hooks/ui/use-toast'
import { cn } from '@/lib/utils'

type Service = Database['public']['Tables']['services']['Row'] & {
  service_categories?: Database['public']['Tables']['service_categories']['Row'] | null
}

interface ServiceSelectionProps {
  salonId?: string
  onServicesChange?: (services: string[]) => void
  onSelect?: (services: string[]) => void
  onBack?: () => void
}

export function ServiceSelection({ salonId, onServicesChange, onSelect, onBack }: ServiceSelectionProps) {
  const [services, setServices] = useState<Service[]>([])
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const supabase = createClient()
  const toast = useToast()
  const maxRetries = 3

  const fetchServices = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Check authentication first
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('Please sign in to view services')
      }
      
      let query = supabase
        .from('services')
        .select(`
          *,
          service_categories(*)
        `)
        .eq('is_active', true)
      
      // Filter by salon if provided
      if (salonId) {
        query = query.eq('salon_id', salonId)
      }
      
      query = query.order('name')

      const { data, error } = await query

      if (error) throw error
      
      setServices(data || [])
      setRetryCount(0) // Reset retry count on success
      
      if (data && data.length === 0) {
        toast.info('No services available', salonId ? 'This salon has no services available at the moment' : 'No services found')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load services'
      setError(errorMessage)
      
      // Show error toast
      toast.error('Failed to load services', errorMessage)
      
      console.error('Error fetching services:', error)
    } finally {
      setLoading(false)
    }
  }, [salonId, supabase, toast])
   
  useEffect(() => {
    fetchServices()
  }, [fetchServices])

  const handleRetry = async () => {
    if (retryCount < maxRetries) {
      setRetryCount(prev => prev + 1)
      await fetchServices()
    } else {
      toast.error('Max retries reached', 'Please check your connection and try again later')
    }
  }

  function toggleService(serviceId: string) {
    const newSelection = selectedServices.includes(serviceId) 
      ? selectedServices.filter(id => id !== serviceId)
      : [...selectedServices, serviceId]
    
    setSelectedServices(newSelection)
    onServicesChange?.(newSelection)
    onSelect?.(newSelection)
  }

  const getTotalPrice = () => {
    return selectedServices.reduce((total, id) => {
      const service = services.find(s => s.id === id)
      return total + (service?.price || 0)
    }, 0)
  }

  const getTotalDuration = () => {
    return selectedServices.reduce((total, id) => {
      const service = services.find(s => s.id === id)
      return total + (service?.duration_minutes || 0)
    }, 0)
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Select Services</CardTitle>
          <CardDescription>Choose the services you&apos;d like to book</CardDescription>
        </CardHeader>
        <CardContent>
          <div className={cn("flex items-center justify-center py-8")}>
            <RefreshCw className={cn("h-4 w-4 mr-2 animate-spin")} />
            Loading services...
          </div>
        </CardContent>
      </Card>
    )
  }
  
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Select Services</CardTitle>
          <CardDescription>Choose the services you&apos;d like to book</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className={cn("h-4 w-4")} />
            <AlertDescription className={cn("flex items-center justify-between")}>
              <span>{error}</span>
              {retryCount < maxRetries && (
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={handleRetry}
                  className={cn("ml-4")}
                >
                  <RefreshCw className={cn("h-3 w-3 mr-1")} />
                  Retry ({maxRetries - retryCount} left)
                </Button>
              )}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  // Group services by category
  const servicesByCategory = services.reduce((acc, service) => {
    const category = service.service_categories?.name || 'Other'
    if (!acc[category]) acc[category] = []
    acc[category].push(service)
    return acc
  }, {} as Record<string, Service[]>)

  return (
    <Card>
      <CardHeader>
        <div className={cn("flex items-center justify-between")}>
          <div>
            <CardTitle>Select Services</CardTitle>
            <CardDescription>Choose the services you&apos;d like to book</CardDescription>
          </div>
          {selectedServices.length > 0 && (
            <div className={cn("text-right")}>
              <p className={cn("text-sm text-muted-foreground")}>Total</p>
              <p className={cn("font-semibold")}>{formatCurrency(getTotalPrice())}</p>
              <p className={cn("text-sm text-muted-foreground")}>{formatDuration(getTotalDuration())}</p>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className={cn("space-y-6")}>
          {Object.entries(servicesByCategory).map(([category, categoryServices]) => (
            <div key={category} className={cn("space-y-3")}>
              <h3 className={cn("font-medium text-sm text-muted-foreground")}>{category}</h3>
              <div className={cn("space-y-3")}>
                {categoryServices.map((service) => (
                  <div key={service.id} className={cn("flex items-start space-x-3")}>
                    <Checkbox 
                      id={service.id}
                      checked={selectedServices.includes(service.id)}
                      onCheckedChange={() => toggleService(service.id)}
                    />
                    <Label htmlFor={service.id} className={cn("flex-1 cursor-pointer")}>
                      <div className={cn("space-y-1")}>
                        <div className={cn("flex items-center justify-between")}>
                          <span className={cn("font-medium")}>{service.name}</span>
                          <div className={cn("flex items-center gap-3")}>
                            <div className={cn("flex items-center gap-1 text-sm")}>
                              <Clock className={cn("h-3 w-3")} />
                              <span>{formatDuration(service.duration_minutes)}</span>
                            </div>
                            <div className={cn("flex items-center gap-1 text-sm font-medium")}>
                              <DollarSign className={cn("h-3 w-3")} />
                              <span>{service.price}</span>
                            </div>
                          </div>
                        </div>
                        {service.description && (
                          <p className={cn("text-sm text-muted-foreground")}>{service.description}</p>
                        )}
                        {service.requires_consultation && (
                          <Badge variant="outline" className={cn("text-xs")}>Consultation Required</Badge>
                        )}
                      </div>
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        {selectedServices.length > 0 && (
          <div className={cn("flex justify-between pt-4 border-t")}>
            <Button variant="outline" onClick={onBack}>
              Back
            </Button>
            <Button onClick={() => onSelect?.(selectedServices)}>
              Continue with {selectedServices.length} service{selectedServices.length !== 1 ? 's' : ''}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}