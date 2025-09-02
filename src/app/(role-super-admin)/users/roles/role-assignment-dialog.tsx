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
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Alert,
  AlertDescription,
} from '@/components/ui'
import { Plus, Shield, AlertTriangle } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { createClient } from '@/lib/database/supabase/client'
import type { Database } from '@/types/database.types'

type UserRole = Database['public']['Tables']['user_roles']['Row']
type UserRoleType = Database['public']['Enums']['user_role_type']

const roleAssignmentSchema = z.object({
  user_email: z.string().email('Please enter a valid email').optional(),
  role: z.enum(['super_admin', 'salon_owner', 'location_manager', 'staff', 'customer'] as const),
  salon_id: z.string().uuid().optional(),
  location_id: z.string().uuid().optional(),
}).refine((data) => {
  // Salon owner and staff require salon_id
  if ((data.role === 'salon_owner' || data.role === 'staff') && !data.salon_id) {
    return false
  }
  // Location manager requires location_id
  if (data.role === 'location_manager' && !data.location_id) {
    return false
  }
  return true
}, {
  message: 'Please select required salon or location for this role',
  path: ['salon_id']
})

type RoleAssignmentFormData = z.infer<typeof roleAssignmentSchema>

interface Salon {
  id: string
  name: string
}

interface RoleAssignmentDialogProps {
  userId?: string
  userName?: string
  currentRoles?: UserRole[]
  salons: Salon[]
  mode: 'create' | 'edit'
  trigger?: React.ReactNode
}

export function RoleAssignmentDialog({
  userId,
  userName,
  currentRoles = [],
  salons,
  mode,
  trigger
}: RoleAssignmentDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [locations, setLocations] = useState<Salon[]>([])

  const form = useForm<RoleAssignmentFormData>({
    resolver: zodResolver(roleAssignmentSchema),
    defaultValues: {
      user_email: '',
      role: 'customer',
      salon_id: '',
      location_id: '',
    }
  })

  const selectedRole = form.watch('role')
  const selectedSalon = form.watch('salon_id')

  // Fetch locations when salon is selected
  const fetchLocations = async (salonId: string) => {
    const supabase = createClient()
    const { data } = await supabase
      .from('salon_locations')
      .select('id, name')
      .eq('salon_id', salonId)
      .eq('is_active', true)
    
    setLocations(data || [])
  }

  // Handle salon selection
  const handleSalonChange = (salonId: string) => {
    form.setValue('salon_id', salonId)
    form.setValue('location_id', '')
    if (salonId) {
      fetchLocations(salonId)
    } else {
      setLocations([])
    }
  }

  const handleSubmit = async (data: RoleAssignmentFormData) => {
    setIsSubmitting(true)
    
    try {
      const supabase = createClient()
      
      if (mode === 'create') {
        // Find user by email
        const { data: userProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', data.user_email!)
          .single()
        
        if (!userProfile) {
          throw new Error('User not found with this email')
        }
        
        // Create new role assignment
        const { error } = await supabase
          .from('user_roles')
          .insert({
            user_id: userProfile.id,
            role: data.role,
            salon_id: data.salon_id || null,
            location_id: data.location_id || null,
          })
        
        if (error) throw error
        
        toast.success('Role assigned successfully')
      } else {
        // Remove existing roles for this user
        const { error: deleteError } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', userId!)
        
        if (deleteError) throw deleteError
        
        // Add new role
        const { error: insertError } = await supabase
          .from('user_roles')
          .insert({
            user_id: userId!,
            role: data.role,
            salon_id: data.salon_id || null,
            location_id: data.location_id || null,
          })
        
        if (insertError) throw insertError
        
        toast.success('Role updated successfully')
      }
      
      setOpen(false)
      form.reset()
      router.refresh()
    } catch (error: any) {
      console.error('Error assigning role:', error)
      toast.error(error.message || 'Failed to assign role')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Assign Role
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Assign User Role' : `Edit Role for ${userName}`}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'Assign a role to a user by their email address'
              : 'Update the role and permissions for this user'
            }
          </DialogDescription>
        </DialogHeader>
        
        {selectedRole === 'super_admin' && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Super Admin role grants full system access. Assign with caution.
            </AlertDescription>
          </Alert>
        )}
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {mode === 'create' && (
              <FormField
                control={form.control}
                name="user_email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>User Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="user@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Enter the email address of the user
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="super_admin">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-purple-500" />
                          Super Admin
                        </div>
                      </SelectItem>
                      <SelectItem value="salon_owner">
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-blue-500" />
                          Salon Owner
                        </div>
                      </SelectItem>
                      <SelectItem value="location_manager">
                        <div className="flex items-center gap-2">
                          <Store className="h-4 w-4 text-green-500" />
                          Location Manager
                        </div>
                      </SelectItem>
                      <SelectItem value="staff">
                        <div className="flex items-center gap-2">
                          <UserCheck className="h-4 w-4 text-orange-500" />
                          Staff
                        </div>
                      </SelectItem>
                      <SelectItem value="customer">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-gray-500" />
                          Customer
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {(selectedRole === 'salon_owner' || 
              selectedRole === 'staff' || 
              selectedRole === 'location_manager') && (
              <FormField
                control={form.control}
                name="salon_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Salon</FormLabel>
                    <Select 
                      onValueChange={(value) => handleSalonChange(value)} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a salon" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {salons.map((salon) => (
                          <SelectItem key={salon.id} value={salon.id}>
                            {salon.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Select the salon this user will be associated with
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            {selectedRole === 'location_manager' && selectedSalon && (
              <FormField
                control={form.control}
                name="location_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a location" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {locations.map((location) => (
                          <SelectItem key={location.id} value={location.id}>
                            {location.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Select the specific location to manage
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : mode === 'create' ? 'Assign Role' : 'Update Role'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

// Add missing imports
import { Building, Store, UserCheck } from 'lucide-react'
import { Input } from '@/components/ui'