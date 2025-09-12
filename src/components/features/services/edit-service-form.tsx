'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

interface EditServiceFormProps {
  serviceId: string
}

export function EditServiceForm({ serviceId }: EditServiceFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [loadingService, setLoadingService] = useState(true)
  const [salons, setSalons] = useState<Array<{ id: string; name: string }>>([])
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([])
  const [formData, setFormData] = useState({
    salon_id: '',
    category_id: '',
    name: '',
    description: '',
    duration_minutes: 60,
    price: 0,
    is_addon: false,
    requires_consultation: false,
    is_active: true,
    has_special_requirements: false,
    has_equipment_needed: false
  })

  useEffect(() => {
    Promise.all([fetchService(), fetchOptions()])
  }, [serviceId])

  const fetchService = async () => {
    try {
      const response = await fetch(`/api/admin/services/${serviceId}`)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch service')
      }
      
      const service = data.service
      setFormData({
        salon_id: service.salon_id || '',
        category_id: service.category_id || '',
        name: service.name || '',
        description: service.description || '',
        duration_minutes: service.duration_minutes || 60,
        price: service.price || 0,
        is_addon: service.is_addon || false,
        requires_consultation: service.requires_consultation || false,
        is_active: service.is_active ?? true,
        has_special_requirements: service.has_special_requirements || false,
        has_equipment_needed: service.has_equipment_needed || false
      })
    } catch (error) {
      console.error('Error fetching service:', error)
      toast.error('Failed to load service data')
      router.push('/admin/services')
    } finally {
      setLoadingService(false)
    }
  }

  const fetchOptions = async () => {
    try {
      // Fetch salons
      const salonsResponse = await fetch('/api/salons')
      if (salonsResponse.ok) {
        const salonsData = await salonsResponse.json()
        setSalons(salonsData.salons || [])
      }

      // Fetch categories
      const categoriesResponse = await fetch('/api/services/categories')
      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json()
        setCategories(categoriesData.categories || [])
      }
    } catch (error) {
      console.error('Error fetching options:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/admin/services/${serviceId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          category_id: formData.category_id || null
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update service')
      }

      toast.success('Service updated successfully')
      router.push('/admin/services')
      router.refresh()
    } catch (error) {
      console.error('Error updating service:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update service')
    } finally {
      setLoading(false)
    }
  }

  if (loadingService) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Service Information</CardTitle>
        <CardDescription>
          Update the service details
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Service Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Hair Cut & Style"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="salon_id">Salon *</Label>
              <Select
                value={formData.salon_id}
                onValueChange={(value) => setFormData({ ...formData, salon_id: value })}
              >
                <SelectTrigger id="salon_id">
                  <SelectValue placeholder="Select a salon" />
                </SelectTrigger>
                <SelectContent>
                  {salons.length === 0 ? (
                    <SelectItem value="placeholder" disabled>
                      No salons available
                    </SelectItem>
                  ) : (
                    salons.map((salon) => (
                      <SelectItem key={salon.id} value={salon.id}>
                        {salon.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the service..."
              rows={3}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="category_id">Category</Label>
              <Select
                value={formData.category_id}
                onValueChange={(value) => setFormData({ ...formData, category_id: value })}
              >
                <SelectTrigger id="category_id">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="duration_minutes">Duration (minutes) *</Label>
              <Input
                id="duration_minutes"
                type="number"
                min="15"
                step="15"
                value={formData.duration_minutes}
                onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="price">Price ($) *</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                required
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="is_active">Active Status</Label>
                <p className="text-sm text-muted-foreground">
                  Make this service available for booking
                </p>
              </div>
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="is_addon">Add-on Service</Label>
                <p className="text-sm text-muted-foreground">
                  This service can only be booked with another service
                </p>
              </div>
              <Switch
                id="is_addon"
                checked={formData.is_addon}
                onCheckedChange={(checked) => setFormData({ ...formData, is_addon: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="requires_consultation">Requires Consultation</Label>
                <p className="text-sm text-muted-foreground">
                  Customer must have a consultation before booking
                </p>
              </div>
              <Switch
                id="requires_consultation"
                checked={formData.requires_consultation}
                onCheckedChange={(checked) => setFormData({ ...formData, requires_consultation: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="has_special_requirements">Special Requirements</Label>
                <p className="text-sm text-muted-foreground">
                  This service has special requirements or preparations
                </p>
              </div>
              <Switch
                id="has_special_requirements"
                checked={formData.has_special_requirements}
                onCheckedChange={(checked) => setFormData({ ...formData, has_special_requirements: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="has_equipment_needed">Equipment Needed</Label>
                <p className="text-sm text-muted-foreground">
                  Special equipment is required for this service
                </p>
              </div>
              <Switch
                id="has_equipment_needed"
                checked={formData.has_equipment_needed}
                onCheckedChange={(checked) => setFormData({ ...formData, has_equipment_needed: checked })}
              />
            </div>
          </div>

          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={loading || !formData.salon_id || !formData.name}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Service
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/admin/services')}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}