'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus, Trash2, Clock, DollarSign } from 'lucide-react'
import { toast } from 'sonner'
import { formatCurrency, formatDuration } from '@/lib/utils/format'
import { UserRole } from '@/lib/auth/constants'

interface Service {
  id: string
  name: string
  description: string | null
  duration: number
  price: number
  category_id: string | null
  service_categories?: {
    id: string
    name: string
  } | null
}

interface StaffService {
  id: string
  staff_id: string
  service_id: string
  created_at: string
  services?: Service
}

interface StaffServicesManagementProps {
  staffId: string
  staffName?: string
  salonId: string
  userRole: UserRole
}

export function StaffServicesManagement({ 
  staffId, 
  staffName,
  salonId, 
  userRole 
}: StaffServicesManagementProps) {
  const [staffServices, setStaffServices] = useState<StaffService[]>([])
  const [availableServices, setAvailableServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [selectedServiceId, setSelectedServiceId] = useState<string>('')
  const [submitting, setSubmitting] = useState(false)
  
  const canEdit = ['super_admin', 'salon_owner', 'salon_manager', 'staff'].includes(userRole)
  
  const fetchStaffServices = useCallback(async () => {
    try {
      const response = await fetch(`/api/staff/services?staffId=${staffId}`)
      if (!response.ok) throw new Error('Failed to fetch staff services')
      const data = await response.json()
      setStaffServices(data)
    } catch (error) {
      console.error('Error fetching staff services:', error)
      toast.error('Failed to load staff services')
    } finally {
      setLoading(false)
    }
  }, [staffId])
  
  const fetchAvailableServices = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/staff/services?staffId=${staffId}&salonId=${salonId}&available=true`
      )
      if (!response.ok) throw new Error('Failed to fetch available services')
      const data = await response.json()
      setAvailableServices(data)
    } catch (error) {
      console.error('Error fetching available services:', error)
      toast.error('Failed to load available services')
    }
  }, [staffId, salonId])
  
  useEffect(() => {
    fetchStaffServices()
  }, [fetchStaffServices])
  
  useEffect(() => {
    if (addDialogOpen) {
      fetchAvailableServices()
    }
  }, [addDialogOpen, fetchAvailableServices])
  
  const handleAddService = async () => {
    if (!selectedServiceId) {
      toast.error('Please select a service')
      return
    }
    
    setSubmitting(true)
    try {
      const response = await fetch('/api/staff/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          staff_id: staffId,
          service_id: selectedServiceId
        })
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to add service')
      }
      
      toast.success('Service added successfully')
      setAddDialogOpen(false)
      setSelectedServiceId('')
      fetchStaffServices()
    } catch (error) {
      console.error('Error adding service:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to add service')
    } finally {
      setSubmitting(false)
    }
  }
  
  const handleRemoveService = async (serviceId: string) => {
    if (!confirm('Are you sure you want to remove this service?')) return
    
    try {
      const response = await fetch(`/api/staff/services/${serviceId}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to remove service')
      }
      
      toast.success('Service removed successfully')
      fetchStaffServices()
    } catch (error) {
      console.error('Error removing service:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to remove service')
    }
  }
  
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Staff Services</CardTitle>
          <CardDescription>
            {staffName ? `Services provided by ${staffName}` : 'Manage staff service assignments'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Staff Services</CardTitle>
            <CardDescription>
              {staffName ? `Services provided by ${staffName}` : 'Manage staff service assignments'}
            </CardDescription>
          </div>
          {canEdit && (
            <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Service
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Service</DialogTitle>
                  <DialogDescription>
                    Select a service to add to {staffName || 'this staff member'}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <Select value={selectedServiceId} onValueChange={setSelectedServiceId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a service" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableServices.map((service) => (
                        <SelectItem key={service.id} value={service.id}>
                          <div className="flex items-center justify-between w-full">
                            <span>{service.name}</span>
                            <span className="text-muted-foreground ml-2">
                              {formatCurrency(service.price)}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedServiceId && (
                    <div className="rounded-lg border p-4">
                      {(() => {
                        const service = availableServices.find(s => s.id === selectedServiceId)
                        if (!service) return null
                        return (
                          <div className="space-y-2">
                            <h4 className="font-medium">{service.name}</h4>
                            {service.description && (
                              <p className="text-sm text-muted-foreground">
                                {service.description}
                              </p>
                            )}
                            <div className="flex items-center gap-4 text-sm">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatDuration(service.duration)}
                              </span>
                              <span className="flex items-center gap-1">
                                <DollarSign className="h-3 w-3" />
                                {formatCurrency(service.price)}
                              </span>
                              {service.service_categories && (
                                <Badge variant="secondary">
                                  {service.service_categories.name}
                                </Badge>
                              )}
                            </div>
                          </div>
                        )
                      })()}
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddService} disabled={submitting || !selectedServiceId}>
                    {submitting ? 'Adding...' : 'Add Service'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {staffServices.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No services assigned to this staff member</p>
            {canEdit && (
              <p className="mt-2">Click &quot;Add Service&quot; to get started</p>
            )}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Price</TableHead>
                {canEdit && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {staffServices.map((staffService) => {
                const service = staffService.services
                if (!service) return null
                
                return (
                  <TableRow key={staffService.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{service.name}</p>
                        {service.description && (
                          <p className="text-sm text-muted-foreground">
                            {service.description}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {service.service_categories ? (
                        <Badge variant="secondary">
                          {service.service_categories.name}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>{formatDuration(service.duration)}</TableCell>
                    <TableCell>{formatCurrency(service.price)}</TableCell>
                    {canEdit && (
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveService(staffService.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}