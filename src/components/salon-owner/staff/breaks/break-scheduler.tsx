'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Plus, Coffee, Clock, Trash2, Edit } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { createClient } from '@/lib/database/supabase/client'
import type { Database } from '@/types/database.types'
type StaffBreak = Database['public']['Tables']['staff_breaks']['Row']
const breakSchema = z.object({
  day_of_week: z.coerce.number().min(0).max(6),
  start_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
  end_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
  duration_minutes: z.coerce.number().min(5).max(120),
  break_type: z.enum(['lunch', 'rest', 'other']),
  is_recurring: z.boolean(),
  is_active: z.boolean(),
}).refine((data) => {
  // Ensure end time is after start time
  const start = new Date(`2024-01-01 ${data.start_time}`)
  const end = new Date(`2024-01-01 ${data.end_time}`)
  return end > start
}, {
  message: 'End time must be after start time',
  path: ['end_time']
})
type BreakFormData = z.infer<typeof breakSchema>
interface BreakSchedulerProps {
  staff: {
    id: string
    profiles: {
      full_name: string | null
      avatar_url: string | null
    }
  }
  existingBreaks: StaffBreak[]
  schedules: {
    id: string
    day_of_week: number
    start_time: string
    end_time: string
  }[]
}
const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
export function BreakScheduler({ staff, existingBreaks, schedules }: BreakSchedulerProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingBreak, setEditingBreak] = useState<StaffBreak | null>(null)
  const form = useForm<BreakFormData>({
    resolver: zodResolver(breakSchema),
    defaultValues: {
      day_of_week: 1,
      start_time: '12:00',
      end_time: '13:00',
      duration_minutes: 60,
      break_type: 'lunch',
      is_recurring: true,
      is_active: true,
    }
  })
  const handleSubmit = async (data: BreakFormData) => {
    setIsSubmitting(true)
    try {
      const supabase = createClient()
      if (editingBreak) {
        // Update existing break
        const { error } = await supabase
          .from('staff_breaks')
          .update({
            ...data,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingBreak.id)
        if (error) throw error
        toast.success('Break updated successfully')
      } else {
        // Create new break
        const { error } = await supabase
          .from('staff_breaks')
          .insert({
            staff_id: staff.id,
            ...data
          })
        if (error) throw error
        toast.success('Break scheduled successfully')
      }
      setOpen(false)
      setEditingBreak(null)
      form.reset()
      router.refresh()
    } catch (_error) {
      toast.error('Failed to save break schedule')
    } finally {
      setIsSubmitting(false)
    }
  }
  const handleDeleteBreak = async (breakId: string) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('staff_breaks')
        .delete()
        .eq('id', breakId)
      if (error) throw error
      toast.success('Break removed')
      router.refresh()
    } catch (_error) {
      toast.error('Failed to remove break')
    }
  }
  const handleEditBreak = (brk: StaffBreak) => {
    setEditingBreak(brk)
    form.reset({
      day_of_week: brk.day_of_week,
      start_time: brk.start_time,
      end_time: brk.end_time,
      duration_minutes: brk.duration_minutes || 60,
      break_type: brk.break_type as 'lunch' | 'rest' | 'other',
      is_recurring: brk.is_recurring || false,
      is_active: brk.is_active || true,
    })
    setOpen(true)
  }
  // Group breaks by day
  const breaksByDay = existingBreaks.reduce((acc, brk) => {
    if (!acc[brk.day_of_week]) {
      acc[brk.day_of_week] = []
    }
    acc[brk.day_of_week].push(brk)
    return acc
  }, {} as Record<number, StaffBreak[]>)
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={staff.profiles.avatar_url || ''} />
            <AvatarFallback>
              {staff.profiles.full_name?.split(' ').map(n => n[0]).join('') || 'S'}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{staff.profiles.full_name || 'Staff Member'}</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary">
                <Coffee className="h-3 w-3 mr-1" />
                {existingBreaks.length} breaks
              </Badge>
              <Badge variant="outline">
                {schedules.length} schedules
              </Badge>
            </div>
          </div>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Break
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingBreak ? 'Edit Break' : 'Schedule Break'}
              </DialogTitle>
              <DialogDescription>
                Configure break time for {staff.profiles.full_name}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="day_of_week"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Day of Week</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        defaultValue={field.value.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select day" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {dayNames.map((day, index) => (
                            <SelectItem key={index} value={index.toString()}>
                              {day}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="start_time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Time</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="end_time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Time</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="break_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Break Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="lunch">Lunch Break</SelectItem>
                          <SelectItem value="rest">Rest Break</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="duration_minutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration (minutes)</FormLabel>
                      <FormControl>
                        <Input type="number" min="5" max="120" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="is_recurring"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Recurring</FormLabel>
                        <FormDescription>
                          Apply this break every week
                        </FormDescription>
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
                <FormField
                  control={form.control}
                  name="is_active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Active</FormLabel>
                        <FormDescription>
                          Enable this break schedule
                        </FormDescription>
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
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setOpen(false)
                      setEditingBreak(null)
                      form.reset()
                    }}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : editingBreak ? 'Update' : 'Schedule'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      {/* Break Schedule Display */}
      <div className="mt-4 space-y-2">
        {Object.entries(breaksByDay).map(([day, breaks]) => (
          <div key={day} className="flex items-start gap-2">
            <Badge variant="outline" className="min-w-[80px]">
              {dayNames[parseInt(day)]}
            </Badge>
            <div className="flex-1 space-y-1">
              {breaks.map((brk) => (
                <div key={brk.id} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm">
                      {brk.start_time} - {brk.end_time}
                    </span>
                    <Badge variant="secondary">
                      {brk.break_type}
                    </Badge>
                    {brk.is_recurring && (
                      <Badge variant="outline">
                        Recurring
                      </Badge>
                    )}
                    {!brk.is_active && (
                      <Badge variant="destructive">
                        Inactive
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditBreak(brk)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteBreak(brk.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        {existingBreaks.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-2">
            No breaks scheduled
          </p>
        )}
      </div>
    </Card>
  )
}