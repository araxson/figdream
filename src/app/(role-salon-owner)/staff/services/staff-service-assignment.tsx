'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Button,
  Checkbox,
  Label,
  Input,
  ScrollArea,
  Badge,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui'
import { Edit, Plus, Trash2, Clock, Save } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/database/supabase/client'
import type { Database } from '@/types/database.types'

type Service = Database['public']['Tables']['services']['Row'] & {
  service_categories?: {
    id: string
    name: string
  }
}

type StaffService = Database['public']['Tables']['staff_services']['Row'] & {
  services: Service
}

interface StaffServiceAssignmentProps {
  staffId: string
  staffName: string
  assignedServices: StaffService[]
  allServices: Service[]
}

export function StaffServiceAssignment({ 
  staffId, 
  staffName,
  assignedServices, 
  allServices 
}: StaffServiceAssignmentProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedServices, setSelectedServices] = useState<Set<string>>(
    new Set(assignedServices.map(s => s.service_id))
  )
  const [customDurations, setCustomDurations] = useState<Record<string, number>>(
    assignedServices.reduce((acc, s) => {
      if (s.custom_duration) {
        acc[s.service_id] = s.custom_duration
      }
      return acc
    }, {} as Record<string, number>)
  )

  // Group services by category
  const servicesByCategory = allServices.reduce((acc, service) => {
    const category = service.service_categories?.name || 'General'
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(service)
    return acc
  }, {} as Record<string, Service[]>)

  const handleServiceToggle = (serviceId: string) => {
    const newSelected = new Set(selectedServices)
    if (newSelected.has(serviceId)) {
      newSelected.delete(serviceId)
      delete customDurations[serviceId]
    } else {
      newSelected.add(serviceId)
    }
    setSelectedServices(newSelected)
  }

  const handleDurationChange = (serviceId: string, duration: string) => {
    const value = parseInt(duration)
    if (value > 0) {
      setCustomDurations({
        ...customDurations,
        [serviceId]: value
      })
    } else {
      const newDurations = { ...customDurations }
      delete newDurations[serviceId]
      setCustomDurations(newDurations)
    }
  }

  const handleSelectAll = () => {
    setSelectedServices(new Set(allServices.map(s => s.id)))
  }

  const handleDeselectAll = () => {
    setSelectedServices(new Set())
    setCustomDurations({})
  }

  const handleSaveAssignments = async () => {
    setIsSubmitting(true)
    
    try {
      const supabase = createClient()
      
      // Get current assignments to compare
      const currentServiceIds = new Set(assignedServices.map(s => s.service_id))
      
      // Determine services to add and remove
      const toAdd = Array.from(selectedServices).filter(id => !currentServiceIds.has(id))
      const toRemove = Array.from(currentServiceIds).filter(id => !selectedServices.has(id))
      const toUpdate = Array.from(selectedServices).filter(id => {
        if (!currentServiceIds.has(id)) return false
        const current = assignedServices.find(s => s.service_id === id)
        return current && current.custom_duration !== customDurations[id]
      })
      
      // Remove services
      if (toRemove.length > 0) {
        const { error } = await supabase
          .from('staff_services')
          .delete()
          .eq('staff_id', staffId)
          .in('service_id', toRemove)
        
        if (error) throw error
      }
      
      // Add new services
      if (toAdd.length > 0) {
        const newServices = toAdd.map(serviceId => ({
          staff_id: staffId,
          service_id: serviceId,
          can_perform: true,
          custom_duration: customDurations[serviceId] || null
        }))
        
        const { error } = await supabase
          .from('staff_services')
          .insert(newServices)
        
        if (error) throw error
      }
      
      // Update existing services with new durations
      for (const serviceId of toUpdate) {
        const { error } = await supabase
          .from('staff_services')
          .update({
            custom_duration: customDurations[serviceId] || null
          })
          .eq('staff_id', staffId)
          .eq('service_id', serviceId)
        
        if (error) throw error
      }
      
      toast.success(`Updated services for ${staffName}`)
      setOpen(false)
      router.refresh()
    } catch (error) {
      console.error('Error updating staff services:', error)
      toast.error('Failed to update staff services')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <div className="space-y-3">
        <div className="flex flex-wrap gap-1">
          {assignedServices.slice(0, 3).map((ss) => (
            <Badge key={ss.id} variant="secondary" className="text-xs">
              {ss.services.name}
            </Badge>
          ))}
          {assignedServices.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{assignedServices.length - 3} more
            </Badge>
          )}
          {assignedServices.length === 0 && (
            <p className="text-sm text-muted-foreground">No services assigned</p>
          )}
        </div>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="w-full">
              <Edit className="h-4 w-4 mr-2" />
              Manage Services
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-3xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>Manage Services for {staffName}</DialogTitle>
              <DialogDescription>
                Select which services this staff member can perform and customize durations if needed
              </DialogDescription>
            </DialogHeader>
            
            <div className="flex gap-2 mb-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleSelectAll}
              >
                Select All
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleDeselectAll}
              >
                Deselect All
              </Button>
              <div className="ml-auto">
                <Badge variant="secondary">
                  {selectedServices.size} / {allServices.length} selected
                </Badge>
              </div>
            </div>
            
            <Tabs defaultValue="categories" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="categories">By Category</TabsTrigger>
                <TabsTrigger value="all">All Services</TabsTrigger>
              </TabsList>
              
              <TabsContent value="categories">
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-6">
                    {Object.entries(servicesByCategory).map(([category, services]) => (
                      <div key={category}>
                        <h3 className="font-medium mb-3 flex items-center justify-between">
                          {category}
                          <Badge variant="outline">
                            {services.filter(s => selectedServices.has(s.id)).length}/{services.length}
                          </Badge>
                        </h3>
                        <div className="space-y-3">
                          {services.map((service) => (
                            <div key={service.id} className="flex items-start gap-3 p-3 rounded-lg border">
                              <Checkbox
                                id={`service-${service.id}`}
                                checked={selectedServices.has(service.id)}
                                onCheckedChange={() => handleServiceToggle(service.id)}
                              />
                              <div className="flex-1">
                                <Label 
                                  htmlFor={`service-${service.id}`}
                                  className="cursor-pointer"
                                >
                                  <div className="font-medium">{service.name}</div>
                                  {service.description && (
                                    <p className="text-sm text-muted-foreground">
                                      {service.description}
                                    </p>
                                  )}
                                  <div className="flex items-center gap-4 mt-1">
                                    <span className="text-sm text-muted-foreground">
                                      Default: {service.duration_minutes} min
                                    </span>
                                    <span className="text-sm text-muted-foreground">
                                      ${service.price}
                                    </span>
                                  </div>
                                </Label>
                                
                                {selectedServices.has(service.id) && (
                                  <div className="flex items-center gap-2 mt-2">
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                    <Label htmlFor={`duration-${service.id}`} className="text-sm">
                                      Custom Duration:
                                    </Label>
                                    <Input
                                      id={`duration-${service.id}`}
                                      type="number"
                                      placeholder={service.duration_minutes.toString()}
                                      value={customDurations[service.id] || ''}
                                      onChange={(e) => handleDurationChange(service.id, e.target.value)}
                                      className="w-20 h-8"
                                    />
                                    <span className="text-sm text-muted-foreground">min</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="all">
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-3">
                    {allServices.map((service) => (
                      <div key={service.id} className="flex items-start gap-3 p-3 rounded-lg border">
                        <Checkbox
                          id={`all-service-${service.id}`}
                          checked={selectedServices.has(service.id)}
                          onCheckedChange={() => handleServiceToggle(service.id)}
                        />
                        <div className="flex-1">
                          <Label 
                            htmlFor={`all-service-${service.id}`}
                            className="cursor-pointer"
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{service.name}</span>
                              <Badge variant="outline" className="text-xs">
                                {service.service_categories?.name || 'General'}
                              </Badge>
                            </div>
                            {service.description && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {service.description}
                              </p>
                            )}
                            <div className="flex items-center gap-4 mt-1">
                              <span className="text-sm text-muted-foreground">
                                {service.duration_minutes} min
                              </span>
                              <span className="text-sm text-muted-foreground">
                                ${service.price}
                              </span>
                            </div>
                          </Label>
                          
                          {selectedServices.has(service.id) && (
                            <div className="flex items-center gap-2 mt-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <Label htmlFor={`all-duration-${service.id}`} className="text-sm">
                                Custom Duration:
                              </Label>
                              <Input
                                id={`all-duration-${service.id}`}
                                type="number"
                                placeholder={service.duration_minutes.toString()}
                                value={customDurations[service.id] || ''}
                                onChange={(e) => handleDurationChange(service.id, e.target.value)}
                                className="w-20 h-8"
                              />
                              <span className="text-sm text-muted-foreground">min</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
            
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveAssignments}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>Saving...</>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Assignments
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  )
}