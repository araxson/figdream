'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

const inviteSchema = z.object({
  email: z.string().email('Invalid email address'),
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  role: z.enum(['staff', 'salon_manager']),
  commission_rate: z.number().min(0).max(100).optional(),
})

type InviteFormData = z.infer<typeof inviteSchema>

interface StaffInviteFormProps {
  onSuccess?: () => void
}

export function StaffInviteForm({ onSuccess }: StaffInviteFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<InviteFormData>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      role: 'staff',
    },
  })

  const onSubmit = async (data: InviteFormData) => {
    setIsLoading(true)
    try {
      const { data: user } = await supabase.auth.getUser()
      if (!user?.user) throw new Error('Not authenticated')

      // First try to get salon_id from staff_profiles
      const { data: staffProfile } = await supabase
        .from('staff_profiles')
        .select('salon_id')
        .eq('user_id', user.user.id)
        .single()

      let salonId = staffProfile?.salon_id

      // If not found in staff_profiles, try user_roles
      if (!salonId) {
        const { data: userRole } = await supabase
          .from('user_roles')
          .select('salon_id')
          .eq('user_id', user.user.id)
          .eq('is_active', true)
          .single()
        
        salonId = userRole?.salon_id
      }

      if (!salonId) throw new Error('No salon found for current user')

      const { error } = await supabase.from('staff_invitations').insert({
        email: data.email,
        role: data.role,
        salon_id: salonId,
        invited_by: user.user.id,
        metadata: {
          first_name: data.first_name,
          last_name: data.last_name,
          commission_rate: data.commission_rate,
        },
      })

      if (error) throw error

      toast.success('Invitation sent successfully')
      onSuccess?.()
    } catch (error) {
      console.error('Error sending invitation:', error)
      toast.error('Failed to send invitation')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="first_name">First Name</Label>
          <Input
            id="first_name"
            {...register('first_name')}
            disabled={isLoading}
          />
          {errors.first_name && (
            <p className="text-sm text-destructive">{errors.first_name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="last_name">Last Name</Label>
          <Input
            id="last_name"
            {...register('last_name')}
            disabled={isLoading}
          />
          {errors.last_name && (
            <p className="text-sm text-destructive">{errors.last_name.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          {...register('email')}
          disabled={isLoading}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">Role</Label>
        <Select
          defaultValue="staff"
          onValueChange={(value) => setValue('role', value as 'staff' | 'salon_manager')}
          disabled={isLoading}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="staff">Staff Member</SelectItem>
            <SelectItem value="salon_manager">Salon Manager</SelectItem>
          </SelectContent>
        </Select>
        {errors.role && (
          <p className="text-sm text-destructive">{errors.role.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="commission_rate">Commission Rate (%)</Label>
        <Input
          id="commission_rate"
          type="number"
          min="0"
          max="100"
          {...register('commission_rate', { valueAsNumber: true })}
          disabled={isLoading}
        />
        {errors.commission_rate && (
          <p className="text-sm text-destructive">{errors.commission_rate.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Sending...' : 'Send Invitation'}
      </Button>
    </form>
  )
}