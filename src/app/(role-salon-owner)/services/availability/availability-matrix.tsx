'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Card,
  Badge,
  Button,
  Switch,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui'
import { CheckCircle, XCircle, AlertCircle, Save, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/database/supabase/client'
import type { Database } from '@/types/database.types'

type Service = Database['public']['Tables']['services']['Row']
type Location = Database['public']['Tables']['salon_locations']['Row']
type ServiceAvailability = Database['public']['Tables']['service_location_availability']['Row']

interface AvailabilityMatrixProps {
  services: Service[]
  locations: Location[]
  availabilityMap: Record<string, ServiceAvailability>
}

export function AvailabilityMatrix({
  services,
  locations,
  availabilityMap: initialMap
}: AvailabilityMatrixProps) {
  const router = useRouter()
  const [availabilityMap, setAvailabilityMap] = useState(initialMap)
  const [pendingChanges, setPendingChanges] = useState<Record<string, boolean>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [bulkActionDialog, setBulkActionDialog] = useState<{
    open: boolean
    type: 'enable-all' | 'disable-all' | 'enable-service' | 'disable-service' | 'enable-location' | 'disable-location' | null
    targetId: string | null
  }>({ open: false, type: null, targetId: null })

  const handleToggle = (serviceId: string, locationId: string) => {
    const key = `${serviceId}-${locationId}`
    const currentState = availabilityMap[key]?.is_available || false
    const newState = !currentState

    // Update local state
    setAvailabilityMap(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        is_available: newState,
        service_id: serviceId,
        location_id: locationId,
      } as ServiceAvailability
    }))

    // Track pending changes
    setPendingChanges(prev => ({
      ...prev,
      [key]: newState
    }))
  }

  const handleSaveChanges = async () => {
    if (Object.keys(pendingChanges).length === 0) {
      toast.info('No changes to save')
      return
    }

    setIsSaving(true)

    try {
      const supabase = createClient()
      
      // Prepare upsert data
      const upsertData = Object.entries(pendingChanges).map(([key, isAvailable]) => {
        const [service_id, location_id] = key.split('-')
        return {
          service_id,
          location_id,
          is_available: isAvailable,
          updated_at: new Date().toISOString()
        }
      })

      const { error } = await supabase
        .from('service_location_availability')
        .upsert(upsertData, {
          onConflict: 'service_id,location_id'
        })

      if (error) throw error

      toast.success(`Updated ${Object.keys(pendingChanges).length} availability settings`)
      setPendingChanges({})
      router.refresh()
    } catch (error) {
      console.error('Error saving availability:', error)
      toast.error('Failed to save availability changes')
    } finally {
      setIsSaving(false)
    }
  }

  const handleBulkAction = async () => {
    const { type, targetId } = bulkActionDialog
    if (!type) return

    setIsSaving(true)
    const updates: Record<string, boolean> = {}

    try {
      switch (type) {
        case 'enable-all':
          services.forEach(service => {
            locations.forEach(location => {
              const key = `${service.id}-${location.id}`
              updates[key] = true
            })
          })
          break

        case 'disable-all':
          services.forEach(service => {
            locations.forEach(location => {
              const key = `${service.id}-${location.id}`
              updates[key] = false
            })
          })
          break

        case 'enable-service':
          if (targetId) {
            locations.forEach(location => {
              const key = `${targetId}-${location.id}`
              updates[key] = true
            })
          }
          break

        case 'disable-service':
          if (targetId) {
            locations.forEach(location => {
              const key = `${targetId}-${location.id}`
              updates[key] = false
            })
          }
          break

        case 'enable-location':
          if (targetId) {
            services.forEach(service => {
              const key = `${service.id}-${targetId}`
              updates[key] = true
            })
          }
          break

        case 'disable-location':
          if (targetId) {
            services.forEach(service => {
              const key = `${service.id}-${targetId}`
              updates[key] = false
            })
          }
          break
      }

      // Apply updates to local state
      setAvailabilityMap(prev => {
        const newMap = { ...prev }
        Object.entries(updates).forEach(([key, value]) => {
          const [service_id, location_id] = key.split('-')
          newMap[key] = {
            ...newMap[key],
            is_available: value,
            service_id,
            location_id,
          } as ServiceAvailability
        })
        return newMap
      })

      setPendingChanges(prev => ({ ...prev, ...updates }))
      setBulkActionDialog({ open: false, type: null, targetId: null })
      toast.success(`Bulk action applied to ${Object.keys(updates).length} items`)
    } catch (error) {
      console.error('Error applying bulk action:', error)
      toast.error('Failed to apply bulk action')
    } finally {
      setIsSaving(false)
    }
  }

  const hasChanges = Object.keys(pendingChanges).length > 0

  return (
    <div className="space-y-4">
      {/* Action Bar */}
      <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-sm">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <XCircle className="h-4 w-4 text-gray-300" />
            <span className="text-sm">Unavailable</span>
          </div>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-yellow-500" />
            <span className="text-sm">Modified</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {hasChanges && (
            <>
              <Badge variant="secondary">
                {Object.keys(pendingChanges).length} pending changes
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setAvailabilityMap(initialMap)
                  setPendingChanges({})
                }}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset
              </Button>
              <Button
                size="sm"
                onClick={handleSaveChanges}
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Bulk Actions */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setBulkActionDialog({ open: true, type: 'enable-all', targetId: null })}
        >
          Enable All
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setBulkActionDialog({ open: true, type: 'disable-all', targetId: null })}
        >
          Disable All
        </Button>
      </div>

      {/* Matrix Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 bg-background border p-2 text-left">
                Service / Location
              </th>
              {locations.map((location) => (
                <th key={location.id} className="border p-2 min-w-[120px]">
                  <div className="space-y-1">
                    <p className="font-medium text-sm">{location.name}</p>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs"
                        onClick={() => setBulkActionDialog({ 
                          open: true, 
                          type: 'enable-location', 
                          targetId: location.id 
                        })}
                      >
                        Enable
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs"
                        onClick={() => setBulkActionDialog({ 
                          open: true, 
                          type: 'disable-location', 
                          targetId: location.id 
                        })}
                      >
                        Disable
                      </Button>
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {services.map((service) => (
              <tr key={service.id}>
                <td className="sticky left-0 z-10 bg-background border p-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{service.name}</p>
                      <p className="text-xs text-muted-foreground">
                        ${service.base_price} • {service.duration_minutes}min
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs"
                        onClick={() => setBulkActionDialog({ 
                          open: true, 
                          type: 'enable-service', 
                          targetId: service.id 
                        })}
                      >
                        All
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs"
                        onClick={() => setBulkActionDialog({ 
                          open: true, 
                          type: 'disable-service', 
                          targetId: service.id 
                        })}
                      >
                        None
                      </Button>
                    </div>
                  </div>
                </td>
                {locations.map((location) => {
                  const key = `${service.id}-${location.id}`
                  const isAvailable = availabilityMap[key]?.is_available || false
                  const hasChange = key in pendingChanges

                  return (
                    <td key={location.id} className="border p-2 text-center">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex justify-center">
                              <button
                                onClick={() => handleToggle(service.id, location.id)}
                                className="p-2 rounded-lg hover:bg-muted transition-colors"
                              >
                                {hasChange ? (
                                  <AlertCircle className="h-5 w-5 text-yellow-500" />
                                ) : isAvailable ? (
                                  <CheckCircle className="h-5 w-5 text-green-500" />
                                ) : (
                                  <XCircle className="h-5 w-5 text-gray-300" />
                                )}
                              </button>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Click to toggle availability</p>
                            <p className="text-xs text-muted-foreground">
                              Currently: {isAvailable ? 'Available' : 'Unavailable'}
                              {hasChange && ' (modified)'}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bulk Action Confirmation Dialog */}
      <Dialog open={bulkActionDialog.open} onOpenChange={(open) => 
        setBulkActionDialog({ ...bulkActionDialog, open })
      }>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Bulk Action</DialogTitle>
            <DialogDescription>
              {bulkActionDialog.type === 'enable-all' && 
                'This will enable all services at all locations. Are you sure?'}
              {bulkActionDialog.type === 'disable-all' && 
                'This will disable all services at all locations. Are you sure?'}
              {bulkActionDialog.type === 'enable-service' && 
                'This will enable this service at all locations. Are you sure?'}
              {bulkActionDialog.type === 'disable-service' && 
                'This will disable this service at all locations. Are you sure?'}
              {bulkActionDialog.type === 'enable-location' && 
                'This will enable all services at this location. Are you sure?'}
              {bulkActionDialog.type === 'disable-location' && 
                'This will disable all services at this location. Are you sure?'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setBulkActionDialog({ open: false, type: null, targetId: null })}
            >
              Cancel
            </Button>
            <Button onClick={handleBulkAction} disabled={isSaving}>
              {isSaving ? 'Applying...' : 'Confirm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}