'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Button,
  Input,
  Label,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  Checkbox,
  Separator
} from '@/components/ui'
import { Loader2 } from 'lucide-react'
import type { Database } from '@/types/database.types'

type Service = Database['public']['Tables']['services']['Row']

interface StaffFormData {
  email: string
  first_name: string
  last_name: string
  display_name: string
  phone: string
  hire_date: string
  commission_rate: number
  base_salary: number
  is_active: boolean
  can_book_online: boolean
  bio: string
  specialties: string[]
  selected_services: string[]
}

interface StaffFormDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  formData: StaffFormData
  setFormData: (data: StaffFormData) => void
  services: Service[]
  onSubmit: () => void
  isLoading: boolean
  submitText: string
}

export function StaffFormDialog({
  isOpen,
  onOpenChange,
  title,
  description,
  formData,
  setFormData,
  services,
  onSubmit,
  isLoading,
  submitText
}: StaffFormDialogProps) {
  const handleServiceToggle = (serviceId: string, checked: boolean) => {
    setFormData({
      ...formData,
      selected_services: checked 
        ? [...formData.selected_services, serviceId]
        : formData.selected_services.filter(id => id !== serviceId)
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="font-medium">Personal Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="first_name">First Name</Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  placeholder="Enter first name"
                />
              </div>
              <div>
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  placeholder="Enter last name"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="display_name">Display Name</Label>
              <Input
                id="display_name"
                value={formData.display_name}
                onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                placeholder="How should this appear to customers?"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="staff@example.com"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="(555) 123-4567"
              />
            </div>
          </div>

          <Separator />

          {/* Employment Details */}
          <div className="space-y-4">
            <h3 className="font-medium">Employment Details</h3>
            <div>
              <Label htmlFor="hire_date">Hire Date</Label>
              <Input
                id="hire_date"
                type="date"
                value={formData.hire_date}
                onChange={(e) => setFormData({ ...formData, hire_date: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="commission_rate">Commission Rate (%)</Label>
                <Input
                  id="commission_rate"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={formData.commission_rate}
                  onChange={(e) => setFormData({ ...formData, commission_rate: parseFloat(e.target.value) || 0 })}
                  placeholder="0.0"
                />
              </div>
              <div>
                <Label htmlFor="base_salary">Base Salary ($)</Label>
                <Input
                  id="base_salary"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.base_salary}
                  onChange={(e) => setFormData({ ...formData, base_salary: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Settings */}
          <div className="space-y-4">
            <h3 className="font-medium">Settings</h3>
            <div className="flex items-center justify-between">
              <Label htmlFor="is_active">Active Staff Member</Label>
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="can_book_online">Allow Online Booking</Label>
              <Switch
                id="can_book_online"
                checked={formData.can_book_online}
                onCheckedChange={(checked) => setFormData({ ...formData, can_book_online: checked })}
              />
            </div>
          </div>

          <Separator />

          {/* Bio & Services */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Brief bio for customer display..."
                rows={3}
              />
            </div>

            <div>
              <Label>Services</Label>
              <div className="mt-2 space-y-2 max-h-48 overflow-y-auto">
                {services.map((service) => (
                  <div key={service.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`service-${service.id}`}
                      checked={formData.selected_services.includes(service.id)}
                      onCheckedChange={(checked) => 
                        handleServiceToggle(service.id, checked as boolean)
                      }
                    />
                    <Label htmlFor={`service-${service.id}`} className="flex-1">
                      {service.name} - ${service.price}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSubmit} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {submitText === 'Add Staff Member' ? 'Adding...' : 'Updating...'}
              </>
            ) : (
              submitText
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}