'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { Plus, Trash2, Clock, Calendar, RefreshCw } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database.types'
import { formatTime } from '@/lib/utils/format'
import { toast } from 'sonner'
import { UserRole } from '@/lib/auth/constants'

type StaffBreak = Database['public']['Tables']['staff_breaks']['Row']

const DAYS_OF_WEEK = [
  { value: '0', label: 'Sunday' },
  { value: '1', label: 'Monday' },
  { value: '2', label: 'Tuesday' },
  { value: '3', label: 'Wednesday' },
  { value: '4', label: 'Thursday' },
  { value: '5', label: 'Friday' },
  { value: '6', label: 'Saturday' },
]

const BREAK_TYPES = [
  { value: 'lunch', label: 'Lunch Break' },
  { value: 'break', label: 'Short Break' },
  { value: 'other', label: 'Other' },
]

interface StaffBreaksListProps {
  staffId?: string
  userRole: UserRole
  view?: 'all' | 'recurring' | 'day'
  dayOfWeek?: number
}

export function StaffBreaksList({ staffId, userRole, view = 'all', dayOfWeek }: StaffBreaksListProps) {
  const [breaks, setBreaks] = useState<StaffBreak[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [newBreak, setNewBreak] = useState({
    day_of_week: dayOfWeek?.toString() || '1',
    start_time: '',
    end_time: '',
    break_type: 'break' as 'lunch' | 'break' | 'other',
    is_recurring: true
  })
  const supabase = createClient()

  const canEdit = ['super_admin', 'salon_owner', 'salon_manager', 'staff'].includes(userRole)

  const fetchBreaks = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      let query = supabase
        .from('staff_breaks')
        .select('*')
        .order('day_of_week')
        .order('start_time')

      // Apply staff filter
      if (staffId) {
        query = query.eq('staff_id', staffId)
      } else if (userRole === 'staff') {
        // Staff can only see their own breaks
        const { data: staffProfile } = await supabase
          .from('staff_profiles')
          .select('id')
          .eq('user_id', user.id)
          .single()
        
        if (staffProfile) {
          query = query.eq('staff_id', staffProfile.id)
        }
      }

      // Apply view filter
      if (view === 'recurring') {
        query = query.eq('is_recurring', true)
      } else if (view === 'day' && dayOfWeek !== undefined) {
        query = query.eq('day_of_week', dayOfWeek)
      }

      const { data, error } = await query

      if (error) throw error
      setBreaks(data || [])
    } catch (error) {
      console.error('Error fetching breaks:', error)
      toast.error('Failed to load breaks')
    } finally {
      setLoading(false)
    }
  }, [supabase, staffId, userRole, view, dayOfWeek])

  useEffect(() => {
    fetchBreaks()
  }, [fetchBreaks])

  const handleAddBreak = async () => {
    if (!newBreak.start_time || !newBreak.end_time) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      let breakStaffId = staffId

      if (!breakStaffId && userRole === 'staff') {
        const { data: staffProfile } = await supabase
          .from('staff_profiles')
          .select('id')
          .eq('user_id', user.id)
          .single()
        
        if (staffProfile) {
          breakStaffId = staffProfile.id
        }
      }

      if (!breakStaffId) {
        toast.error('Staff ID is required')
        return
      }

      const { error } = await supabase
        .from('staff_breaks')
        .insert({
          staff_id: breakStaffId,
          day_of_week: newBreak.is_recurring ? parseInt(newBreak.day_of_week) : null,
          start_time: newBreak.start_time,
          end_time: newBreak.end_time,
          break_type: newBreak.break_type,
          is_recurring: newBreak.is_recurring
        })

      if (error) throw error

      toast.success('Break added successfully')
      setDialogOpen(false)
      setNewBreak({
        day_of_week: dayOfWeek?.toString() || '1',
        start_time: '',
        end_time: '',
        break_type: 'break',
        is_recurring: true
      })
      fetchBreaks()
    } catch (error) {
      console.error('Error adding break:', error)
      toast.error('Failed to add break')
    }
  }

  const handleDeleteBreak = async (breakId: string) => {
    if (!confirm('Are you sure you want to delete this break?')) return

    try {
      const { error } = await supabase
        .from('staff_breaks')
        .delete()
        .eq('id', breakId)

      if (error) throw error

      toast.success('Break deleted successfully')
      fetchBreaks()
    } catch (error) {
      console.error('Error deleting break:', error)
      toast.error('Failed to delete break')
    }
  }

  const getDayLabel = (dayOfWeek: number | null) => {
    if (dayOfWeek === null) return 'Non-recurring'
    return DAYS_OF_WEEK.find(d => d.value === dayOfWeek.toString())?.label || ''
  }

  const getBreakTypeLabel = (breakType: string) => {
    return BREAK_TYPES.find(t => t.value === breakType)?.label || breakType
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Staff Breaks</CardTitle>
          <CardDescription>Manage break schedules</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Staff Breaks</CardTitle>
          <CardDescription>
            {view === 'recurring' ? 'Recurring weekly breaks' : view === 'day' ? `Breaks for ${getDayLabel(dayOfWeek || 0)}` : 'All break schedules'}
          </CardDescription>
        </div>
        {canEdit && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Break
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Break</DialogTitle>
                <DialogDescription>
                  Schedule a new break period
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="is_recurring" className="text-right">
                    Recurring
                  </Label>
                  <div className="col-span-3 flex items-center gap-2">
                    <Switch
                      id="is_recurring"
                      checked={newBreak.is_recurring}
                      onCheckedChange={(checked) => setNewBreak({ ...newBreak, is_recurring: checked })}
                    />
                    <Label htmlFor="is_recurring" className="font-normal">
                      {newBreak.is_recurring ? 'Repeats weekly' : 'One-time break'}
                    </Label>
                  </div>
                </div>
                
                {newBreak.is_recurring && (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="day_of_week" className="text-right">
                      Day
                    </Label>
                    <Select
                      value={newBreak.day_of_week}
                      onValueChange={(value) => setNewBreak({ ...newBreak, day_of_week: value })}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select day" />
                      </SelectTrigger>
                      <SelectContent>
                        {DAYS_OF_WEEK.map(day => (
                          <SelectItem key={day.value} value={day.value}>
                            {day.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="break_type" className="text-right">
                    Type
                  </Label>
                  <Select
                    value={newBreak.break_type}
                    onValueChange={(value: 'lunch' | 'break' | 'other') => setNewBreak({ ...newBreak, break_type: value })}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {BREAK_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="start_time" className="text-right">
                    Start Time
                  </Label>
                  <input
                    id="start_time"
                    type="time"
                    value={newBreak.start_time}
                    onChange={(e) => setNewBreak({ ...newBreak, start_time: e.target.value })}
                    className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="end_time" className="text-right">
                    End Time
                  </Label>
                  <input
                    id="end_time"
                    type="time"
                    value={newBreak.end_time}
                    onChange={(e) => setNewBreak({ ...newBreak, end_time: e.target.value })}
                    className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddBreak}>Add Break</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </CardHeader>
      <CardContent>
        {breaks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="mx-auto h-12 w-12 mb-4 opacity-20" />
            <p>No breaks scheduled</p>
            {canEdit && (
              <p className="text-sm mt-2">Click &quot;Add Break&quot; to schedule one</p>
            )}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Day</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Recurring</TableHead>
                {canEdit && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {breaks.map((breakItem) => {
                // Calculate duration
                const [startH, startM] = breakItem.start_time.split(':').map(Number)
                const [endH, endM] = breakItem.end_time.split(':').map(Number)
                const durationMinutes = (endH * 60 + endM) - (startH * 60 + startM)
                
                return (
                  <TableRow key={breakItem.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {getDayLabel(breakItem.day_of_week)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {getBreakTypeLabel(breakItem.break_type)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        {formatTime(breakItem.start_time)} - {formatTime(breakItem.end_time)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {Math.floor(durationMinutes / 60)}h {durationMinutes % 60}m
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {breakItem.is_recurring && (
                        <div className="flex items-center gap-1">
                          <RefreshCw className="h-3 w-3" />
                          <span className="text-sm">Weekly</span>
                        </div>
                      )}
                    </TableCell>
                    {canEdit && (
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteBreak(breakItem.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}