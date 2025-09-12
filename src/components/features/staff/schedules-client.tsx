'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar, Clock, Plus, Search, Users, CalendarDays, CalendarCheck, Edit, Trash2, Copy } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

interface StaffMember {
  id: string
  first_name: string
  last_name: string
  email: string
  position: string
  salon?: {
    id: string
    name: string
  }
}

interface StaffSchedule {
  id: string
  staff_id: string
  date: string
  start_time: string
  end_time: string
  break_start_time?: string
  break_end_time?: string
  is_available: boolean
  notes?: string
  created_at: string
  updated_at: string
  staff?: StaffMember
}

interface StaffSchedulesClientProps {
  schedules: StaffSchedule[]
  staffMembers: StaffMember[]
  counts: {
    total: number
    thisWeek: number
    today: number
    activeStaff: number
  }
}

export function StaffSchedulesClient({ schedules, staffMembers, counts }: StaffSchedulesClientProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStaff, setSelectedStaff] = useState<string>('all')
  const [selectedDate, setSelectedDate] = useState<string>('all')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [deleteScheduleId, setDeleteScheduleId] = useState<string | null>(null)
  const [editingSchedule, setEditingSchedule] = useState<StaffSchedule | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState({
    staff_id: '',
    date: '',
    start_time: '',
    end_time: '',
    break_start_time: '',
    break_end_time: '',
    is_available: true,
    notes: ''
  })

  // Filter schedules
  const filteredSchedules = schedules.filter(schedule => {
    const matchesSearch = searchQuery === '' || 
      schedule.staff?.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      schedule.staff?.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      schedule.staff?.email?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStaff = selectedStaff === 'all' || schedule.staff_id === selectedStaff
    
    const matchesDate = selectedDate === 'all' || 
      (selectedDate === 'today' && new Date(schedule.date).toDateString() === new Date().toDateString()) ||
      (selectedDate === 'week' && isThisWeek(new Date(schedule.date)))
    
    return matchesSearch && matchesStaff && matchesDate
  })

  function isThisWeek(date: Date) {
    const now = new Date()
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()))
    const endOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 6))
    return date >= startOfWeek && date <= endOfWeek
  }

  const handleCreate = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/staff/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) throw new Error('Failed to create schedule')

      toast.success('Schedule created successfully')
      setIsCreateOpen(false)
      setFormData({
        staff_id: '',
        date: '',
        start_time: '',
        end_time: '',
        break_start_time: '',
        break_end_time: '',
        is_available: true,
        notes: ''
      })
      window.location.reload()
    } catch (error) {
      toast.error('Failed to create schedule')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdate = async () => {
    if (!editingSchedule) return
    
    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/staff/schedules/${editingSchedule.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) throw new Error('Failed to update schedule')

      toast.success('Schedule updated successfully')
      setIsEditOpen(false)
      setEditingSchedule(null)
      window.location.reload()
    } catch (error) {
      toast.error('Failed to update schedule')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteScheduleId) return
    
    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/staff/schedules/${deleteScheduleId}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete schedule')

      toast.success('Schedule deleted successfully')
      setDeleteScheduleId(null)
      window.location.reload()
    } catch (error) {
      toast.error('Failed to delete schedule')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDuplicate = async (schedule: StaffSchedule) => {
    setFormData({
      staff_id: schedule.staff_id,
      date: '',
      start_time: schedule.start_time,
      end_time: schedule.end_time,
      break_start_time: schedule.break_start_time || '',
      break_end_time: schedule.break_end_time || '',
      is_available: schedule.is_available,
      notes: schedule.notes || ''
    })
    setIsCreateOpen(true)
  }

  const openEditDialog = (schedule: StaffSchedule) => {
    setEditingSchedule(schedule)
    setFormData({
      staff_id: schedule.staff_id,
      date: schedule.date.split('T')[0],
      start_time: schedule.start_time,
      end_time: schedule.end_time,
      break_start_time: schedule.break_start_time || '',
      break_end_time: schedule.break_end_time || '',
      is_available: schedule.is_available,
      notes: schedule.notes || ''
    })
    setIsEditOpen(true)
  }

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
    return `${displayHour}:${minutes} ${ampm}`
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Staff Schedules</h1>
          <p className="text-muted-foreground">Manage staff work schedules and availability</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Schedule
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Staff Schedule</DialogTitle>
              <DialogDescription>
                Add a new work schedule for a staff member
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="staff">Staff Member</Label>
                  <Select value={formData.staff_id} onValueChange={(value) => setFormData({ ...formData, staff_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select staff member" />
                    </SelectTrigger>
                    <SelectContent>
                      {staffMembers.map((staff) => (
                        <SelectItem key={staff.id} value={staff.id}>
                          {staff.first_name} {staff.last_name} - {staff.position}
                          {staff.salon && ` (${staff.salon.name})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_time">Start Time</Label>
                  <Input
                    id="start_time"
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_time">End Time</Label>
                  <Input
                    id="end_time"
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="break_start">Break Start (Optional)</Label>
                  <Input
                    id="break_start"
                    type="time"
                    value={formData.break_start_time}
                    onChange={(e) => setFormData({ ...formData, break_start_time: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="break_end">Break End (Optional)</Label>
                  <Input
                    id="break_end"
                    type="time"
                    value={formData.break_end_time}
                    onChange={(e) => setFormData({ ...formData, break_end_time: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="availability">Availability</Label>
                <Select 
                  value={formData.is_available ? 'available' : 'unavailable'} 
                  onValueChange={(value) => setFormData({ ...formData, is_available: value === 'available' })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available for Appointments</SelectItem>
                    <SelectItem value="unavailable">Not Available</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Input
                  id="notes"
                  placeholder="Any special notes about this schedule"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={isLoading || !formData.staff_id || !formData.date || !formData.start_time || !formData.end_time}>
                {isLoading ? 'Creating...' : 'Create Schedule'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Schedules</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.total}</div>
            <p className="text-xs text-muted-foreground">All time schedules</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.thisWeek}</div>
            <p className="text-xs text-muted-foreground">Current week schedules</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today</CardTitle>
            <CalendarCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.today}</div>
            <p className="text-xs text-muted-foreground">Today's schedules</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Staff</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.activeStaff}</div>
            <p className="text-xs text-muted-foreground">Staff with schedules</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Schedules</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedStaff} onValueChange={setSelectedStaff}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by staff" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Staff</SelectItem>
                {staffMembers.map((staff) => (
                  <SelectItem key={staff.id} value={staff.id}>
                    {staff.first_name} {staff.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedDate} onValueChange={setSelectedDate}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Dates</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Schedules Table */}
      <Card>
        <CardHeader>
          <CardTitle>Schedules</CardTitle>
          <CardDescription>
            {filteredSchedules.length} schedule{filteredSchedules.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Staff Member</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Work Hours</TableHead>
                <TableHead>Break</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSchedules.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No schedules found
                  </TableCell>
                </TableRow>
              ) : (
                filteredSchedules.map((schedule) => (
                  <TableRow key={schedule.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {schedule.staff?.first_name} {schedule.staff?.last_name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {schedule.staff?.position}
                          {schedule.staff?.salon && ` • ${schedule.staff.salon.name}`}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-muted-foreground" />
                        {format(new Date(schedule.date), 'EEE, MMM d, yyyy')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {schedule.break_start_time && schedule.break_end_time ? (
                        <span className="text-sm">
                          {formatTime(schedule.break_start_time)} - {formatTime(schedule.break_end_time)}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">No break</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={schedule.is_available ? 'default' : 'secondary'}>
                        {schedule.is_available ? 'Available' : 'Unavailable'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {schedule.notes || '-'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDuplicate(schedule)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(schedule)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteScheduleId(schedule.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Schedule</DialogTitle>
            <DialogDescription>
              Update the staff member's schedule
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-staff">Staff Member</Label>
                <Select value={formData.staff_id} onValueChange={(value) => setFormData({ ...formData, staff_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select staff member" />
                  </SelectTrigger>
                  <SelectContent>
                    {staffMembers.map((staff) => (
                      <SelectItem key={staff.id} value={staff.id}>
                        {staff.first_name} {staff.last_name} - {staff.position}
                        {staff.salon && ` (${staff.salon.name})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-date">Date</Label>
                <Input
                  id="edit-date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-start">Start Time</Label>
                <Input
                  id="edit-start"
                  type="time"
                  value={formData.start_time}
                  onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-end">End Time</Label>
                <Input
                  id="edit-end"
                  type="time"
                  value={formData.end_time}
                  onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-break-start">Break Start (Optional)</Label>
                <Input
                  id="edit-break-start"
                  type="time"
                  value={formData.break_start_time}
                  onChange={(e) => setFormData({ ...formData, break_start_time: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-break-end">Break End (Optional)</Label>
                <Input
                  id="edit-break-end"
                  type="time"
                  value={formData.break_end_time}
                  onChange={(e) => setFormData({ ...formData, break_end_time: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-availability">Availability</Label>
              <Select 
                value={formData.is_available ? 'available' : 'unavailable'} 
                onValueChange={(value) => setFormData({ ...formData, is_available: value === 'available' })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available for Appointments</SelectItem>
                  <SelectItem value="unavailable">Not Available</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-notes">Notes (Optional)</Label>
              <Input
                id="edit-notes"
                placeholder="Any special notes about this schedule"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={isLoading}>
              {isLoading ? 'Updating...' : 'Update Schedule'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteScheduleId} onOpenChange={() => setDeleteScheduleId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Schedule?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the schedule.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isLoading}>
              {isLoading ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}