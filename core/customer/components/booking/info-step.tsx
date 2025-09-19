'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import type { CustomerStepProps } from '../wizard-utils/wizard-types'
import type { CustomerInfo } from '../../types'

export function CustomerInfoStep({ state, onStateChange }: CustomerStepProps) {
  const updateCustomerInfo = (field: keyof CustomerInfo, value: any) => {
    onStateChange({
      customerInfo: {
        ...state.customerInfo,
        [field]: value,
        isNewCustomer: true
      } as CustomerInfo
    })
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-medium mb-2">Your Information</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Please provide your contact details
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name *</Label>
          <Input
            id="firstName"
            placeholder="John"
            value={state.customerInfo?.firstName || ''}
            onChange={(e) => updateCustomerInfo('firstName', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name *</Label>
          <Input
            id="lastName"
            placeholder="Doe"
            value={state.customerInfo?.lastName || ''}
            onChange={(e) => updateCustomerInfo('lastName', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            placeholder="john@example.com"
            value={state.customerInfo?.email || ''}
            onChange={(e) => updateCustomerInfo('email', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone *</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="(555) 123-4567"
            value={state.customerInfo?.phone || ''}
            onChange={(e) => updateCustomerInfo('phone', e.target.value)}
          />
        </div>

        <div className="col-span-2 space-y-2">
          <Label htmlFor="notes">Special Requests (Optional)</Label>
          <Textarea
            id="notes"
            placeholder="Any special requests or notes for your appointment..."
            value={state.specialRequests || ''}
            onChange={(e) => onStateChange({ specialRequests: e.target.value })}
          />
        </div>

        <div className="col-span-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="marketing"
              checked={state.customerInfo?.marketingOptIn || false}
              onCheckedChange={(checked) =>
                updateCustomerInfo('marketingOptIn', checked as boolean)
              }
            />
            <Label htmlFor="marketing" className="text-sm font-normal">
              I'd like to receive promotional emails and special offers
            </Label>
          </div>
        </div>
      </div>
    </div>
  )
}