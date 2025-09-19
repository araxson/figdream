'use client'

import { Phone, Calendar } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface ContactDetailsStepProps {
  formData: {
    phone?: string
    date_of_birth?: string
    gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say'
  }
  errors: Partial<Record<string, string>>
  onUpdateField: (field: string, value: any) => void
}

export function ContactDetailsStep({
  formData,
  errors,
  onUpdateField
}: ContactDetailsStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold">Contact Details</h3>
        <p className="text-sm text-muted-foreground">
          Additional contact information and personal details
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="phone"
              type="tel"
              value={formData.phone || ''}
              onChange={(e) => onUpdateField('phone', e.target.value)}
              className={`pl-10 ${errors.phone ? 'border-red-500' : ''}`}
              placeholder="+1 (555) 123-4567"
            />
          </div>
          {errors.phone && (
            <p className="text-sm text-red-500">{errors.phone}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="date_of_birth">Date of Birth</Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="date_of_birth"
              type="date"
              value={formData.date_of_birth || ''}
              onChange={(e) => onUpdateField('date_of_birth', e.target.value)}
              className={`pl-10 ${errors.date_of_birth ? 'border-red-500' : ''}`}
            />
          </div>
          {errors.date_of_birth && (
            <p className="text-sm text-red-500">{errors.date_of_birth}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Used for birthday promotions and age-appropriate services
          </p>
        </div>

        <div className="space-y-2">
          <Label>Gender</Label>
          <Select
            value={formData.gender || ''}
            onValueChange={(value) => onUpdateField('gender', value)}
          >
            <SelectTrigger className={errors.gender ? 'border-red-500' : ''}>
              <SelectValue placeholder="Select gender (optional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Other</SelectItem>
              <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
            </SelectContent>
          </Select>
          {errors.gender && (
            <p className="text-sm text-red-500">{errors.gender}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Optional - helps us provide personalized service recommendations
          </p>
        </div>
      </div>
    </div>
  )
}