'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { toast } from '@/hooks/use-toast'
import { Loader2 } from 'lucide-react'

interface Service {
  id?: string
  name: string
  description?: string | null
  category?: string
  price?: number
  duration_minutes?: number
  is_active?: boolean
}

interface ServiceFormDialogProps {
  service?: Service
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function ServiceFormDialog({ 
  service, 
  open, 
  onOpenChange, 
  onSuccess 
}: ServiceFormDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: service?.name || '',
    description: service?.description || '',
    category: service?.category || 'Hair',
    price: service?.price || 0,
    duration_minutes: service?.duration_minutes || 30,
    is_active: service?.is_active ?? true
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const url = '/api/services'
      const method = service ? 'PUT' : 'POST'
      const body = service 
        ? JSON.stringify({ id: service.id, ...formData })
        : JSON.stringify(formData)

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body
      })

      if (!response.ok) throw new Error('Failed to save service')

      toast({
        title: 'Success',
        description: `Service ${service ? 'updated' : 'created'} successfully`
      })

      onSuccess?.()
      onOpenChange(false)
    } catch (error) {
      console.error('Error saving service:', error)
      toast({
        title: 'Error',
        description: 'Failed to save service',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!service || !window.confirm('Are you sure you want to delete this service?')) return
    
    setIsLoading(true)
    try {
      const response = await fetch(`/api/services?id=${service.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete service')

      toast({
        title: 'Success',
        description: 'Service deleted successfully'
      })

      onSuccess?.()
      onOpenChange(false)
    } catch (error) {
      console.error('Error deleting service:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete service',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{service ? 'Edit Service' : 'Add New Service'}</DialogTitle>
            <DialogDescription>
              {service ? 'Update the service details below.' : 'Fill in the details for the new service.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Service Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Men's Haircut"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the service"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Hair">Hair</SelectItem>
                    <SelectItem value="Nails">Nails</SelectItem>
                    <SelectItem value="Skin">Skin</SelectItem>
                    <SelectItem value="Massage">Massage</SelectItem>
                    <SelectItem value="Makeup">Makeup</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="price">Price ($)</Label>
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

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  min="15"
                  step="15"
                  value={formData.duration_minutes}
                  onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
                  required
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="active">Active</Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            {service && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={isLoading}
                className="mr-auto"
              >
                Delete
              </Button>
            )}
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {service ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}