'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils/format'
import { Plus, MoreHorizontal } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export interface Service extends Record<string, unknown> {
  id: string
  name: string
  description?: string | null
  price: number
  duration: number
  category?: string | null
  is_active: boolean
  created_at?: string
  salon_id?: string
}

interface ServicesDataTableProps {
  salonId?: string
  onAddService?: () => void
  onEditService?: (service: Service) => void
  title?: string
  description?: string
}

export function ServicesDataTable({ 
  salonId,
  onAddService,
  onEditService,
  title = "Services",
  description = "Manage your salon services and pricing"
}: ServicesDataTableProps) {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  const fetchServices = useCallback(async () => {
    try {
      setLoading(true)
      const url = salonId 
        ? `/api/services?salonId=${salonId}`
        : '/api/services'
      
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error('Failed to fetch services')
      }
      
      const data = await response.json()
      setServices(data || [])
    } catch (error) {
      console.error('Error fetching services:', error)
    } finally {
      setLoading(false)
    }
  }, [salonId])

  useEffect(() => {
    fetchServices()
  }, [fetchServices])

  const handleToggleStatus = async (service: Service) => {
    try {
      const response = await fetch(`/api/services/${service.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !service.is_active })
      })

      if (!response.ok) throw new Error('Failed to toggle service status')
      await fetchServices()
    } catch (error) {
      console.error('Error toggling service status:', error)
    }
  }

  const handleDuplicate = async (service: Service) => {
    try {
      const { id: _id, created_at: _created_at, ...serviceData } = service
      const response = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...serviceData,
          name: `${service.name} (Copy)`,
        })
      })

      if (!response.ok) throw new Error('Failed to duplicate service')
      await fetchServices()
    } catch (error) {
      console.error('Error duplicating service:', error)
    }
  }

  const handleDelete = async (service: Service) => {
    if (!confirm('Are you sure you want to delete this service?')) return
    
    try {
      const response = await fetch(`/api/services/${service.id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete service')
      }
      
      await fetchServices()
    } catch (error) {
      console.error('Error deleting service:', error)
    }
  }

  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          {onAddService && (
            <Button onClick={onAddService}>
              <Plus className="mr-2 h-4 w-4" />
              Add Service
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Input
            placeholder="Search services..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-8 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredServices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      No services found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredServices.map((service) => (
                    <TableRow key={service.id}>
                      <TableCell className="font-medium">{service.name}</TableCell>
                      <TableCell>{service.category || 'Uncategorized'}</TableCell>
                      <TableCell>{formatCurrency(service.price)}</TableCell>
                      <TableCell>{service.duration} min</TableCell>
                      <TableCell>
                        <Badge variant={service.is_active ? "default" : "secondary"}>
                          {service.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            {onEditService && (
                              <DropdownMenuItem onClick={() => onEditService(service)}>
                                Edit
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => handleDuplicate(service)}>
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleStatus(service)}>
                              {service.is_active ? 'Deactivate' : 'Activate'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDelete(service)}
                              className="text-destructive"
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}