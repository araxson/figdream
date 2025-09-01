'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { 
  Search, 
  Clock, 
  DollarSign, 
  AlertCircle,
  CheckCircle,
  Plus,
  Minus,
  Filter,
  Tag
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Database } from '@/types/database.types'

// Use proper database types
type Service = Database['public']['Tables']['services']['Row']
type ServiceCategory = Database['public']['Tables']['service_categories']['Row']
type ServiceCost = Database['public']['Tables']['service_costs']['Row']

// Extended service type with relationships and computed fields
export type ServiceWithCategory = Service & {
  service_categories?: ServiceCategory | null
  service_costs?: ServiceCost[] | null
  custom_price?: number | null
  custom_duration?: number | null
}

// Selected service type with additional booking context
export type SelectedService = ServiceWithCategory & {
  quantity: number
  total_duration: number
  total_price: number
}

// Category with its services
export type CategoryWithServices = ServiceCategory & {
  services?: ServiceWithCategory[]
}

export interface ServiceSelectorProps {
  locationId: string
  staffId?: string
  className?: string
  onServiceSelect?: (services: SelectedService[]) => void
  selectedServices?: SelectedService[]
  allowMultiple?: boolean
  showCategories?: boolean
  showSearch?: boolean
  showFilters?: boolean
  disabled?: boolean
  maxServices?: number
  requiredCategories?: string[]
}

export function ServiceSelector({
  locationId,
  staffId,
  className,
  onServiceSelect,
  selectedServices = [],
  allowMultiple = true,
  showCategories = true,
  showSearch = true,
  showFilters = true,
  disabled = false,
  maxServices,
  requiredCategories = []
}: ServiceSelectorProps) {
  const [services, setServices] = React.useState<Service[]>([])
  const [categories, setCategories] = React.useState<ServiceCategory[]>([])
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [searchQuery, setSearchQuery] = React.useState('')
  const [selectedCategory, setSelectedCategory] = React.useState<string>('all')
  const [priceRange, setPriceRange] = React.useState<'all' | 'low' | 'medium' | 'high'>('all')
  const [durationRange, setDurationRange] = React.useState<'all' | 'short' | 'medium' | 'long'>('all')
  const [sortBy, setSortBy] = React.useState<'name' | 'price' | 'duration'>('name')
  const [internalSelectedServices, setInternalSelectedServices] = React.useState<SelectedService[]>(selectedServices)

  // Load services for location/staff
  const loadServices = React.useCallback(async () => {
    if (!locationId) return

    setLoading(true)
    setError(null)

    try {
      let url = `/api/services/location/${locationId}`
      
      if (staffId) {
        url += `?staff_id=${staffId}`
      }

      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error('Failed to load services')
      }

      const data = await response.json()
      setServices(data.services || [])

      // Group services by category if categories should be shown
      if (showCategories) {
        const categoriesResponse = await fetch(`/api/categories/location/${locationId}`)
        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json()
          
          const categorizedServices: ServiceCategory[] = []
          const servicesByCategory = new Map<string, Service[]>()

          // Group services by category
          data.services?.forEach((service: Service) => {
            const categoryId = service.category_id || 'uncategorized'
            if (!servicesByCategory.has(categoryId)) {
              servicesByCategory.set(categoryId, [])
            }
            servicesByCategory.get(categoryId)?.push(service)
          })

          // Create category objects
          categoriesData.categories?.forEach((category: any) => {
            const categoryServices = servicesByCategory.get(category.id) || []
            if (categoryServices.length > 0) {
              categorizedServices.push({
                id: category.id,
                name: category.name,
                description: category.description,
                services: categoryServices
              })
            }
          })

          // Add uncategorized services if any
          const uncategorizedServices = servicesByCategory.get('uncategorized') || []
          if (uncategorizedServices.length > 0) {
            categorizedServices.push({
              id: 'uncategorized',
              name: 'Other Services',
              description: 'Services without a category',
              services: uncategorizedServices
            })
          }

          setCategories(categorizedServices)
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load services')
    } finally {
      setLoading(false)
    }
  }, [locationId, staffId, showCategories])

  // Effect to load services
  React.useEffect(() => {
    loadServices()
  }, [loadServices])

  // Sync internal state with props
  React.useEffect(() => {
    setInternalSelectedServices(selectedServices)
  }, [selectedServices])

  // Filter and sort services
  const filteredServices = React.useMemo(() => {
    let filtered = services

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(service =>
        service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(service => service.category_id === selectedCategory)
    }

    // Filter by price range
    if (priceRange !== 'all') {
      const price = (service: Service) => service.custom_price || service.price
      switch (priceRange) {
        case 'low':
          filtered = filtered.filter(service => price(service) < 50)
          break
        case 'medium':
          filtered = filtered.filter(service => price(service) >= 50 && price(service) < 100)
          break
        case 'high':
          filtered = filtered.filter(service => price(service) >= 100)
          break
      }
    }

    // Filter by duration range
    if (durationRange !== 'all') {
      const duration = (service: Service) => service.custom_duration || service.duration_minutes
      switch (durationRange) {
        case 'short':
          filtered = filtered.filter(service => duration(service) <= 30)
          break
        case 'medium':
          filtered = filtered.filter(service => duration(service) > 30 && duration(service) <= 90)
          break
        case 'long':
          filtered = filtered.filter(service => duration(service) > 90)
          break
      }
    }

    // Sort services
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price':
          const priceA = a.custom_price || a.price
          const priceB = b.custom_price || b.price
          return priceA - priceB
        case 'duration':
          const durationA = a.custom_duration || a.duration_minutes
          const durationB = b.custom_duration || b.duration_minutes
          return durationA - durationB
        case 'name':
        default:
          return a.name.localeCompare(b.name)
      }
    })

    return filtered
  }, [services, searchQuery, selectedCategory, priceRange, durationRange, sortBy])

  // Filter categories for display
  const filteredCategories = React.useMemo(() => {
    if (!showCategories) return []

    return categories.map(category => ({
      ...category,
      services: category.services.filter(service => filteredServices.includes(service))
    })).filter(category => category.services.length > 0)
  }, [categories, filteredServices, showCategories])

  // Handle service selection
  const handleServiceToggle = (service: Service) => {
    if (disabled) return

    const existing = internalSelectedServices.find(s => s.id === service.id)
    let newSelectedServices: SelectedService[]

    if (existing) {
      // Remove service if already selected
      newSelectedServices = internalSelectedServices.filter(s => s.id !== service.id)
    } else {
      // Add service
      if (!allowMultiple && internalSelectedServices.length > 0) {
        // Replace existing selection
        newSelectedServices = [createSelectedService(service)]
      } else if (maxServices && internalSelectedServices.length >= maxServices) {
        // Don't add if max reached
        return
      } else {
        // Add to selection
        newSelectedServices = [...internalSelectedServices, createSelectedService(service)]
      }
    }

    setInternalSelectedServices(newSelectedServices)
    onServiceSelect?.(newSelectedServices)
  }

  // Handle service quantity change
  const handleQuantityChange = (serviceId: string, delta: number) => {
    if (disabled) return

    const updated = internalSelectedServices.map(service => {
      if (service.id === serviceId) {
        const newQuantity = Math.max(1, service.quantity + delta)
        return {
          ...service,
          quantity: newQuantity,
          total_duration: service.duration_minutes * newQuantity,
          total_price: (service.custom_price || service.price) * newQuantity
        }
      }
      return service
    })

    setInternalSelectedServices(updated)
    onServiceSelect?.(updated)
  }

  // Create selected service object
  const createSelectedService = (service: Service): SelectedService => {
    const price = service.custom_price || service.price
    const duration = service.custom_duration || service.duration_minutes
    
    return {
      ...service,
      quantity: 1,
      total_duration: duration,
      total_price: price
    }
  }

  // Check if service is selected
  const isServiceSelected = (serviceId: string) => {
    return internalSelectedServices.some(s => s.id === serviceId)
  }

  // Get selected service quantity
  const getServiceQuantity = (serviceId: string) => {
    return internalSelectedServices.find(s => s.id === serviceId)?.quantity || 0
  }

  // Calculate totals
  const totals = React.useMemo(() => {
    return internalSelectedServices.reduce(
      (acc, service) => ({
        totalPrice: acc.totalPrice + service.total_price,
        totalDuration: acc.totalDuration + service.total_duration,
        totalServices: acc.totalServices + service.quantity
      }),
      { totalPrice: 0, totalDuration: 0, totalServices: 0 }
    )
  }, [internalSelectedServices])

  // Render service item
  const renderServiceItem = (service: Service) => {
    const selected = isServiceSelected(service.id)
    const quantity = getServiceQuantity(service.id)
    const price = service.custom_price || service.price
    const duration = service.custom_duration || service.duration_minutes

    return (
      <Card 
        key={service.id}
        className={cn(
          "cursor-pointer transition-all hover:shadow-md",
          selected && "ring-2 ring-primary border-primary",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        onClick={() => !disabled && handleServiceToggle(service)}
      >
        <CardContent>
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <Checkbox 
                  checked={selected}
                  readOnly
                  className="pointer-events-none"
                />
                <h4 className="font-medium truncate">{service.name}</h4>
                {service.category && (
                  <Badge variant="outline" className="text-xs">
                    {service.category.name}
                  </Badge>
                )}
              </div>
              
              {service.description && (
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {service.description}
                </p>
              )}
              
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{duration} min</span>
                </div>
                <div className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">${price}</span>
                  {service.custom_price && service.price !== service.custom_price && (
                    <span className="text-xs text-muted-foreground line-through">
                      ${service.price}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {selected && allowMultiple && (
              <div className="flex items-center gap-2 ml-4" onMouseDown={(e) => e.stopPropagation()}>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleQuantityChange(service.id, -1)}
                  disabled={disabled || quantity <= 1}
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="font-medium min-w-6 text-center">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleQuantityChange(service.id, 1)}
                  disabled={disabled}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Tag className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Select Services</h3>
          {maxServices && (
            <Badge variant="outline">
              {internalSelectedServices.length}/{maxServices}
            </Badge>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      {(showSearch || showFilters) && (
        <div className="space-y-3">
          {showSearch && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                disabled={disabled}
              />
            </div>
          )}

          {showFilters && (
            <div className="flex flex-wrap items-center gap-2">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-auto min-w-32">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={priceRange} onValueChange={(value: any) => setPriceRange(value)}>
                <SelectTrigger className="w-auto min-w-24">
                  <SelectValue placeholder="Price" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Price</SelectItem>
                  <SelectItem value="low">Under $50</SelectItem>
                  <SelectItem value="medium">$50 - $100</SelectItem>
                  <SelectItem value="high">$100+</SelectItem>
                </SelectContent>
              </Select>

              <Select value={durationRange} onValueChange={(value: any) => setDurationRange(value)}>
                <SelectTrigger className="w-auto min-w-24">
                  <SelectValue placeholder="Duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Duration</SelectItem>
                  <SelectItem value="short">≤ 30 min</SelectItem>
                  <SelectItem value="medium">31-90 min</SelectItem>
                  <SelectItem value="long">90+ min</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="w-auto min-w-24">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="price">Price</SelectItem>
                  <SelectItem value="duration">Duration</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Services List */}
      <div className="space-y-6">
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        ) : showCategories && filteredCategories.length > 0 ? (
          // Categorized view
          filteredCategories.map(category => (
            <div key={category.id} className="space-y-3">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-lg">{category.name}</h4>
                <Badge variant="secondary" className="text-xs">
                  {category.services.length}
                </Badge>
              </div>
              {category.description && (
                <p className="text-sm text-muted-foreground mb-4">
                  {category.description}
                </p>
              )}
              <div className="grid gap-3">
                {category.services.map(renderServiceItem)}
              </div>
              <Separator />
            </div>
          ))
        ) : (
          // Flat view
          <ScrollArea className="h-96">
            <div className="grid gap-3">
              {filteredServices.length === 0 ? (
                <div className="text-center py-8">
                  <Tag className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h4 className="text-lg font-medium mb-2">No services found</h4>
                  <p className="text-muted-foreground">
                    {searchQuery.trim() 
                      ? "Try adjusting your search or filters"
                      : "No services available for this location"}
                  </p>
                </div>
              ) : (
                filteredServices.map(renderServiceItem)
              )}
            </div>
          </ScrollArea>
        )}
      </div>

      {/* Selected Services Summary */}
      {internalSelectedServices.length > 0 && (
        <Card className="border-primary">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <CheckCircle className="h-5 w-5 text-primary" />
              Selected Services ({totals.totalServices})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {internalSelectedServices.map(service => (
              <div key={service.id} className="flex items-center justify-between text-sm">
                <div>
                  <span className="font-medium">{service.name}</span>
                  {service.quantity > 1 && (
                    <span className="text-muted-foreground"> × {service.quantity}</span>
                  )}
                </div>
                <div className="text-right">
                  <div className="font-medium">${service.total_price}</div>
                  <div className="text-xs text-muted-foreground">
                    {service.total_duration} min
                  </div>
                </div>
              </div>
            ))}
            
            <Separator />
            
            <div className="flex items-center justify-between font-medium">
              <div>Total</div>
              <div className="text-right">
                <div>${totals.totalPrice}</div>
                <div className="text-sm text-muted-foreground">
                  {totals.totalDuration} minutes
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Help Text */}
      <div className="text-xs text-muted-foreground text-center">
        {allowMultiple 
          ? "Select one or more services for your appointment"
          : "Select one service for your appointment"
        }
        {maxServices && ` (max ${maxServices})`}
      </div>
    </div>
  )
}