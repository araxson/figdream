'use client'

import { User, Upload } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface BasicInfoStepProps {
  formData: {
    email: string
    display_name: string
    first_name: string
    last_name: string
    avatar_url?: string
  }
  errors: Partial<Record<string, string>>
  onUpdateField: (field: string, value: any) => void
}

export function BasicInfoStep({
  formData,
  errors,
  onUpdateField
}: BasicInfoStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold">Basic Information</h3>
        <p className="text-sm text-muted-foreground">
          Let's start with the customer's basic details
        </p>
      </div>

      {/* Avatar Upload */}
      <div className="flex justify-center">
        <div className="relative">
          <Avatar className="h-20 w-20">
            <AvatarImage src={formData.avatar_url} />
            <AvatarFallback>
              <User className="h-8 w-8" />
            </AvatarFallback>
          </Avatar>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
            onClick={() => {
              // Handle avatar upload
              const input = document.createElement('input')
              input.type = 'file'
              input.accept = 'image/*'
              input.onchange = (e) => {
                const file = (e.target as HTMLInputElement).files?.[0]
                if (file) {
                  // In a real app, upload to a service and get URL
                  const url = URL.createObjectURL(file)
                  onUpdateField('avatar_url', url)
                }
              }
              input.click()
            }}
          >
            <Upload className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="first_name">First Name *</Label>
          <Input
            id="first_name"
            value={formData.first_name}
            onChange={(e) => onUpdateField('first_name', e.target.value)}
            className={errors.first_name ? 'border-red-500' : ''}
          />
          {errors.first_name && (
            <p className="text-sm text-red-500">{errors.first_name}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="last_name">Last Name *</Label>
          <Input
            id="last_name"
            value={formData.last_name}
            onChange={(e) => onUpdateField('last_name', e.target.value)}
            className={errors.last_name ? 'border-red-500' : ''}
          />
          {errors.last_name && (
            <p className="text-sm text-red-500">{errors.last_name}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="display_name">Display Name</Label>
        <Input
          id="display_name"
          value={formData.display_name}
          onChange={(e) => onUpdateField('display_name', e.target.value)}
          placeholder="How should we display this customer's name?"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email Address *</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => onUpdateField('email', e.target.value)}
          className={errors.email ? 'border-red-500' : ''}
        />
        {errors.email && (
          <p className="text-sm text-red-500">{errors.email}</p>
        )}
      </div>
    </div>
  )
}