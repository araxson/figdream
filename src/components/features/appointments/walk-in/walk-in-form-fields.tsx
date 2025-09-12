'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { WalkInFormData, StaffMember, Service } from '@/types/features/walk-in-types'

interface WalkInFormFieldsProps {
  formData: WalkInFormData
  setFormData: (data: WalkInFormData) => void
  selectedServices: string[]
  handleServiceToggle: (serviceId: string) => void
  staffMembers: StaffMember[]
  services: Service[]
  total: number
}

export function WalkInFormFields({
  formData,
  setFormData,
  selectedServices,
  handleServiceToggle,
  staffMembers,
  services,
  total
}: WalkInFormFieldsProps) {
  return (
    <>
      <div className="grid gap-2">
        <Label htmlFor="customer_name">Customer Name *</Label>
        <Input
          id="customer_name"
          value={formData.customer_name}
          onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
          placeholder="John Doe"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="customer_email">Email (Optional)</Label>
        <Input
          id="customer_email"
          type="email"
          value={formData.customer_email}
          onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
          placeholder="john@example.com"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="customer_phone">Phone (Optional)</Label>
        <Input
          id="customer_phone"
          type="tel"
          value={formData.customer_phone}
          onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
          placeholder="+1 (555) 123-4567"
        />
      </div>

      {staffMembers.length > 0 && (
        <div className="grid gap-2">
          <Label htmlFor="staff">Staff Member</Label>
          <Select
            value={formData.staff_id}
            onValueChange={(value) => setFormData({ ...formData, staff_id: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select staff member" />
            </SelectTrigger>
            <SelectContent>
              {staffMembers.map((staff) => (
                <SelectItem key={staff.id} value={staff.id}>
                  {staff.profiles?.first_name} {staff.profiles?.last_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="grid gap-2">
        <Label>Services *</Label>
        <div className="space-y-2 max-h-[150px] overflow-y-auto border rounded-md p-3">
          {services.map((service) => (
            <div key={service.id} className="flex items-center space-x-2">
              <Checkbox
                id={service.id}
                checked={selectedServices.includes(service.id)}
                onCheckedChange={() => handleServiceToggle(service.id)}
              />
              <label
                htmlFor={service.id}
                className="flex-1 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                <span>{service.name}</span>
                <span className="text-muted-foreground ml-2">
                  ${service.price} • {service.duration_minutes}min
                </span>
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-2">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="collect_payment"
            checked={formData.collect_payment_now}
            onCheckedChange={(checked) => 
              setFormData({ ...formData, collect_payment_now: checked as boolean })
            }
          />
          <Label htmlFor="collect_payment">Collect Payment Now</Label>
        </div>
      </div>

      {formData.collect_payment_now && (
        <div className="grid gap-2">
          <Label htmlFor="payment_method">Payment Method</Label>
          <Select
            value={formData.payment_method}
            onValueChange={(value) => setFormData({ ...formData, payment_method: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cash">Cash</SelectItem>
              <SelectItem value="card">Card</SelectItem>
              <SelectItem value="venmo">Venmo</SelectItem>
              <SelectItem value="zelle">Zelle</SelectItem>
              <SelectItem value="cashapp">Cash App</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {selectedServices.length > 0 && (
        <div className="rounded-lg border p-3 bg-muted/50">
          <div className="flex justify-between text-sm">
            <span>Total:</span>
            <span className="font-semibold">${total.toFixed(2)}</span>
          </div>
        </div>
      )}
    </>
  )
}