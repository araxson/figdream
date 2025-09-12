'use client'

import { useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Database } from '@/types/database.types'
import { createTeamMemberAction, updateTeamMemberAction } from '@/lib/actions/team-members'
import { toast } from 'sonner'

type TeamMember = Database['public']['Tables']['team_members']['Row']

const teamMemberSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  role: z.string().min(1, 'Role is required'),
  bio: z.string().optional(),
  image_url: z.string().url().optional().or(z.literal('')),
  sort_order: z.number().int().min(0),
  is_active: z.boolean()
})

type TeamMemberFormData = z.infer<typeof teamMemberSchema>

interface TeamMemberDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  member: TeamMember | null
  members: TeamMember[]
  onSuccess: (members: TeamMember[]) => void
}

export function TeamMemberDialog({ 
  open, 
  onOpenChange, 
  member, 
  members,
  onSuccess 
}: TeamMemberDialogProps) {
  const form = useForm<TeamMemberFormData>({
    resolver: zodResolver(teamMemberSchema),
    defaultValues: {
      name: '',
      role: '',
      bio: '',
      image_url: '',
      sort_order: 0,
      is_active: true
    }
  })

  useEffect(() => {
    if (member) {
      form.reset({
        name: member.name,
        role: member.role,
        bio: member.bio || '',
        image_url: member.image_url || '',
        sort_order: member.sort_order,
        is_active: member.is_active ?? true
      })
    } else {
      form.reset({
        name: '',
        role: '',
        bio: '',
        image_url: '',
        sort_order: members.length,
        is_active: true
      })
    }
  }, [member, form, members.length])

  const onSubmit = async (values: TeamMemberFormData) => {
    try {
      if (member) {
        const result = await updateTeamMemberAction(member.id, values)
        if (result.success && result.data) {
          const updatedMembers = members.map(m => 
            m.id === member.id ? result.data : m
          )
          onSuccess(updatedMembers)
          toast.success('Team member updated successfully')
        } else {
          throw new Error(result.error)
        }
      } else {
        const result = await createTeamMemberAction(values)
        if (result.success && result.data) {
          onSuccess([...members, result.data])
          toast.success('Team member added successfully')
        } else {
          throw new Error(result.error)
        }
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save team member')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {member ? 'Edit Team Member' : 'Add Team Member'}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <FormControl>
                    <Input placeholder="CEO" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Brief description..." 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="image_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URL</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="https://example.com/image.jpg" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="sort_order"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sort Order</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      {...field} 
                      onChange={e => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Active
                    </FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {member ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}