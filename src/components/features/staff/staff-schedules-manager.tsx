'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, Plus, Edit2, Trash2, Copy, Users, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { useSalon } from '@/lib/contexts/salon-context';
import { Skeleton } from '@/components/ui/skeleton';
import { format, parseISO, addDays, startOfWeek, endOfWeek } from 'date-fns';

interface StaffSchedule {
  id: string;
  staff_id: string;
  salon_id: string;
  day_of_week: number; // 0-6 (Sunday-Saturday)
  start_time: string;
  end_time: string;
  break_start?: string;
  break_end?: string;
  is_available: boolean;
  effective_from: string;
  effective_until?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  staff?: {
    id: string;
    full_name: string;
    email: string;
    avatar_url?: string;
    role?: string;
  };
}

interface ScheduleTemplate {
  name: string;
  schedules: Partial<StaffSchedule>[];
}

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday', short: 'Sun' },
  { value: 1, label: 'Monday', short: 'Mon' },
  { value: 2, label: 'Tuesday', short: 'Tue' },
  { value: 3, label: 'Wednesday', short: 'Wed' },
  { value: 4, label: 'Thursday', short: 'Thu' },
  { value: 5, label: 'Friday', short: 'Fri' },
  { value: 6, label: 'Saturday', short: 'Sat' }
];

const SCHEDULE_TEMPLATES: ScheduleTemplate[] = [
  {
    name: 'Full Time (9-5)',
    schedules: [
      { day_of_week: 1, start_time: '09:00', end_time: '17:00', break_start: '12:00', break_end: '13:00' },
      { day_of_week: 2, start_time: '09:00', end_time: '17:00', break_start: '12:00', break_end: '13:00' },
      { day_of_week: 3, start_time: '09:00', end_time: '17:00', break_start: '12:00', break_end: '13:00' },
      { day_of_week: 4, start_time: '09:00', end_time: '17:00', break_start: '12:00', break_end: '13:00' },
      { day_of_week: 5, start_time: '09:00', end_time: '17:00', break_start: '12:00', break_end: '13:00' }
    ]
  },
  {
    name: 'Part Time (Morning)',
    schedules: [
      { day_of_week: 1, start_time: '08:00', end_time: '13:00' },
      { day_of_week: 2, start_time: '08:00', end_time: '13:00' },
      { day_of_week: 3, start_time: '08:00', end_time: '13:00' },
      { day_of_week: 4, start_time: '08:00', end_time: '13:00' },
      { day_of_week: 5, start_time: '08:00', end_time: '13:00' }
    ]
  },
  {
    name: 'Part Time (Evening)',
    schedules: [
      { day_of_week: 1, start_time: '14:00', end_time: '20:00' },
      { day_of_week: 2, start_time: '14:00', end_time: '20:00' },
      { day_of_week: 3, start_time: '14:00', end_time: '20:00' },
      { day_of_week: 4, start_time: '14:00', end_time: '20:00' },
      { day_of_week: 5, start_time: '14:00', end_time: '20:00' }
    ]
  }
];

export function StaffSchedulesManager() {
  const { currentSalon, isLoading: salonLoading, isAdmin } = useSalon();
  const salonId = currentSalon?.id;
  
  const [schedules, setSchedules] = useState<StaffSchedule[]>([]);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<StaffSchedule | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'list' | 'week'>('list');
  const [formData, setFormData] = useState({
    staff_id: '',
    day_of_week: 1,
    start_time: '09:00',
    end_time: '17:00',
    break_start: '',
    break_end: '',
    is_available: true,
    effective_from: format(new Date(), 'yyyy-MM-dd'),
    effective_until: '',
    notes: ''
  });

  const supabase = createClient();

  useEffect(() => {
    if (salonId) {
      fetchSchedules();
      fetchStaff();
    }
  }, [salonId]);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('staff_schedules')
        .select(`
          *,
          staff (
            id,
            full_name,
            email,
            avatar_url,
            role
          )
        `)
        .eq('salon_id', salonId)
        .order('staff_id')
        .order('day_of_week');

      if (error) throw error;
      setSchedules(data || []);
    } catch (error) {
      console.error('Error fetching schedules:', error);
      toast.error('Failed to load staff schedules');
    } finally {
      setLoading(false);
    }
  };

  const fetchStaff = async () => {
    try {
      const { data, error } = await supabase
        .from('staff')
        .select('id, full_name')
        .eq('salon_id', salonId)
        .eq('is_active', true);

      if (error) throw error;
      setStaffList(data || []);
    } catch (error) {
      console.error('Error fetching staff:', error);
    }
  };

  const handleSubmit = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const scheduleData = {
        salon_id: salonId,
        staff_id: formData.staff_id,
        day_of_week: formData.day_of_week,
        start_time: formData.start_time,
        end_time: formData.end_time,
        break_start: formData.break_start || null,
        break_end: formData.break_end || null,
        is_available: formData.is_available,
        effective_from: formData.effective_from,
        effective_until: formData.effective_until || null,
        notes: formData.notes || null,
        updated_at: new Date().toISOString(),
        updated_by: user.id
      };

      if (editingSchedule) {
        const { error } = await supabase
          .from('staff_schedules')
          .update(scheduleData)
          .eq('id', editingSchedule.id);

        if (error) throw error;
        toast.success('Schedule updated successfully');
      } else {
        // Check for existing schedule
        const { data: existing } = await supabase
          .from('staff_schedules')
          .select('id')
          .eq('salon_id', salonId)
          .eq('staff_id', formData.staff_id)
          .eq('day_of_week', formData.day_of_week)
          .single();

        if (existing) {
          toast.error('Schedule already exists for this staff member and day');
          return;
        }

        const { error } = await supabase
          .from('staff_schedules')
          .insert({
            ...scheduleData,
            created_at: new Date().toISOString(),
            created_by: user.id
          });

        if (error) throw error;
        toast.success('Schedule added successfully');
      }

      setIsDialogOpen(false);
      resetForm();
      fetchSchedules();
    } catch (error) {
      console.error('Error saving schedule:', error);
      toast.error('Failed to save schedule');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this schedule?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('staff_schedules')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Schedule deleted successfully');
      fetchSchedules();
    } catch (error) {
      console.error('Error deleting schedule:', error);
      toast.error('Failed to delete schedule');
    }
  };

  const applyTemplate = async (staffId: string, template: ScheduleTemplate) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Delete existing schedules for this staff member
      await supabase
        .from('staff_schedules')
        .delete()
        .eq('salon_id', salonId)
        .eq('staff_id', staffId);

      // Insert new schedules from template
      const schedulesToInsert = template.schedules.map(schedule => ({
        salon_id: salonId,
        staff_id: staffId,
        ...schedule,
        is_available: true,
        effective_from: format(new Date(), 'yyyy-MM-dd'),
        created_at: new Date().toISOString(),
        created_by: user.id
      }));

      const { error } = await supabase
        .from('staff_schedules')
        .insert(schedulesToInsert);

      if (error) throw error;

      toast.success(`Applied ${template.name} template`);
      fetchSchedules();
    } catch (error) {
      console.error('Error applying template:', error);
      toast.error('Failed to apply template');
    }
  };

  const copySchedule = async (fromStaffId: string, toStaffId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get schedules from source staff
      const { data: sourceSchedules, error: fetchError } = await supabase
        .from('staff_schedules')
        .select('*')
        .eq('salon_id', salonId)
        .eq('staff_id', fromStaffId);

      if (fetchError) throw fetchError;
      if (!sourceSchedules || sourceSchedules.length === 0) {
        toast.error('No schedules to copy');
        return;
      }

      // Delete existing schedules for target staff
      await supabase
        .from('staff_schedules')
        .delete()
        .eq('salon_id', salonId)
        .eq('staff_id', toStaffId);

      // Copy schedules to target staff
      const schedulesToInsert = sourceSchedules.map(schedule => ({
        salon_id: salonId,
        staff_id: toStaffId,
        day_of_week: schedule.day_of_week,
        start_time: schedule.start_time,
        end_time: schedule.end_time,
        break_start: schedule.break_start,
        break_end: schedule.break_end,
        is_available: schedule.is_available,
        effective_from: format(new Date(), 'yyyy-MM-dd'),
        notes: `Copied from another staff member`,
        created_at: new Date().toISOString(),
        created_by: user.id
      }));

      const { error } = await supabase
        .from('staff_schedules')
        .insert(schedulesToInsert);

      if (error) throw error;

      toast.success('Schedule copied successfully');
      fetchSchedules();
    } catch (error) {
      console.error('Error copying schedule:', error);
      toast.error('Failed to copy schedule');
    }
  };

  const openDialog = (schedule?: StaffSchedule) => {
    if (schedule) {
      setEditingSchedule(schedule);
      setFormData({
        staff_id: schedule.staff_id,
        day_of_week: schedule.day_of_week,
        start_time: schedule.start_time,
        end_time: schedule.end_time,
        break_start: schedule.break_start || '',
        break_end: schedule.break_end || '',
        is_available: schedule.is_available,
        effective_from: schedule.effective_from,
        effective_until: schedule.effective_until || '',
        notes: schedule.notes || ''
      });
    } else {
      setEditingSchedule(null);
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      staff_id: '',
      day_of_week: 1,
      start_time: '09:00',
      end_time: '17:00',
      break_start: '',
      break_end: '',
      is_available: true,
      effective_from: format(new Date(), 'yyyy-MM-dd'),
      effective_until: '',
      notes: ''
    });
    setEditingSchedule(null);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const filteredSchedules = selectedStaff === 'all' 
    ? schedules 
    : schedules.filter(s => s.staff_id === selectedStaff);

  const groupedByStaff = filteredSchedules.reduce((acc, schedule) => {
    if (!acc[schedule.staff_id]) {
      acc[schedule.staff_id] = {
        staff: schedule.staff,
        schedules: []
      };
    }
    acc[schedule.staff_id].schedules.push(schedule);
    return acc;
  }, {} as Record<string, { staff: any; schedules: StaffSchedule[] }>);

  if (salonLoading || loading) {
    return (
      <div className="space-y-6">
        <Card className="p-6">
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </Card>
      </div>
    );
  }

  if (!currentSalon) {
    return (
      <Card className="p-6">
        <p className="text-center text-muted-foreground">
          {isAdmin ? 'Please select a salon from the dropdown above' : 'No salon found'}
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Staff Schedules</CardTitle>
              <CardDescription>
                Manage staff working hours and availability
              </CardDescription>
            </div>
            <Button onClick={() => openDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Add Schedule
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <Select value={selectedStaff} onValueChange={setSelectedStaff}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by staff" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Staff</SelectItem>
                {staffList.map((staff) => (
                  <SelectItem key={staff.id} value={staff.id}>
                    {staff.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'list' | 'week')}>
              <TabsList>
                <TabsTrigger value="list">List View</TabsTrigger>
                <TabsTrigger value="week">Week View</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {viewMode === 'list' ? (
            <div className="space-y-6">
              {Object.values(groupedByStaff).length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>No schedules found</p>
                  <p className="text-sm mt-2">Add staff schedules to manage availability</p>
                </div>
              ) : (
                Object.values(groupedByStaff).map(({ staff, schedules }) => (
                  <Card key={staff?.id || 'unknown'}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={staff?.avatar_url} />
                            <AvatarFallback>
                              {staff?.full_name ? getInitials(staff.full_name) : 'S'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{staff?.full_name || 'Unknown'}</div>
                            <div className="text-sm text-muted-foreground">{staff?.role}</div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Select
                            onValueChange={(templateName) => {
                              const template = SCHEDULE_TEMPLATES.find(t => t.name === templateName);
                              if (template && staff?.id) {
                                applyTemplate(staff.id, template);
                              }
                            }}
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Apply template" />
                            </SelectTrigger>
                            <SelectContent>
                              {SCHEDULE_TEMPLATES.map((template) => (
                                <SelectItem key={template.name} value={template.name}>
                                  {template.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Day</TableHead>
                            <TableHead>Working Hours</TableHead>
                            <TableHead>Break</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {DAYS_OF_WEEK.map((day) => {
                            const daySchedule = schedules.find(s => s.day_of_week === day.value);
                            return (
                              <TableRow key={day.value}>
                                <TableCell className="font-medium">{day.label}</TableCell>
                                <TableCell>
                                  {daySchedule ? (
                                    <div className="flex items-center gap-2">
                                      <Clock className="h-4 w-4 text-muted-foreground" />
                                      {daySchedule.start_time} - {daySchedule.end_time}
                                    </div>
                                  ) : (
                                    <span className="text-muted-foreground">Not scheduled</span>
                                  )}
                                </TableCell>
                                <TableCell>
                                  {daySchedule?.break_start && daySchedule?.break_end ? (
                                    <span className="text-sm">
                                      {daySchedule.break_start} - {daySchedule.break_end}
                                    </span>
                                  ) : (
                                    <span className="text-muted-foreground">-</span>
                                  )}
                                </TableCell>
                                <TableCell>
                                  {daySchedule ? (
                                    <Badge variant={daySchedule.is_available ? 'default' : 'secondary'}>
                                      {daySchedule.is_available ? 'Available' : 'Unavailable'}
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline">Off</Badge>
                                  )}
                                </TableCell>
                                <TableCell className="text-right">
                                  {daySchedule ? (
                                    <div className="flex justify-end gap-2">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => openDialog(daySchedule)}
                                      >
                                        <Edit2 className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDelete(daySchedule.id)}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  ) : (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        setFormData({ ...formData, staff_id: staff?.id || '', day_of_week: day.value });
                                        setIsDialogOpen(true);
                                      }}
                                    >
                                      <Plus className="h-4 w-4" />
                                    </Button>
                                  )}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="sticky left-0 bg-background">Staff</TableHead>
                    {DAYS_OF_WEEK.map((day) => (
                      <TableHead key={day.value} className="text-center">
                        {day.short}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.values(groupedByStaff).map(({ staff, schedules }) => (
                    <TableRow key={staff?.id || 'unknown'}>
                      <TableCell className="sticky left-0 bg-background">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={staff?.avatar_url} />
                            <AvatarFallback className="text-xs">
                              {staff?.full_name ? getInitials(staff.full_name) : 'S'}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{staff?.full_name || 'Unknown'}</span>
                        </div>
                      </TableCell>
                      {DAYS_OF_WEEK.map((day) => {
                        const daySchedule = schedules.find(s => s.day_of_week === day.value);
                        return (
                          <TableCell key={day.value} className="text-center">
                            {daySchedule ? (
                              <div className="text-xs">
                                <div>{daySchedule.start_time}</div>
                                <div>-</div>
                                <div>{daySchedule.end_time}</div>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingSchedule ? 'Edit Schedule' : 'Add Staff Schedule'}
            </DialogTitle>
            <DialogDescription>
              {editingSchedule ? 'Update schedule details' : 'Add a new schedule for a staff member'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="staff">Staff Member</Label>
                <Select
                  value={formData.staff_id}
                  onValueChange={(value) => setFormData({ ...formData, staff_id: value })}
                  disabled={!!editingSchedule}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select staff member" />
                  </SelectTrigger>
                  <SelectContent>
                    {staffList.map((staff) => (
                      <SelectItem key={staff.id} value={staff.id}>
                        {staff.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="day">Day of Week</Label>
                <Select
                  value={formData.day_of_week.toString()}
                  onValueChange={(value) => setFormData({ ...formData, day_of_week: parseInt(value) })}
                  disabled={!!editingSchedule}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DAYS_OF_WEEK.map((day) => (
                      <SelectItem key={day.value} value={day.value.toString()}>
                        {day.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start">Start Time</Label>
                <Input
                  id="start"
                  type="time"
                  value={formData.start_time}
                  onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="end">End Time</Label>
                <Input
                  id="end"
                  type="time"
                  value={formData.end_time}
                  onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="break-start">Break Start (Optional)</Label>
                <Input
                  id="break-start"
                  type="time"
                  value={formData.break_start}
                  onChange={(e) => setFormData({ ...formData, break_start: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="break-end">Break End (Optional)</Label>
                <Input
                  id="break-end"
                  type="time"
                  value={formData.break_end}
                  onChange={(e) => setFormData({ ...formData, break_end: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="from">Effective From</Label>
                <Input
                  id="from"
                  type="date"
                  value={formData.effective_from}
                  onChange={(e) => setFormData({ ...formData, effective_from: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="until">Effective Until (Optional)</Label>
                <Input
                  id="until"
                  type="date"
                  value={formData.effective_until}
                  onChange={(e) => setFormData({ ...formData, effective_until: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Input
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="e.g., Modified schedule for holiday season"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="available"
                checked={formData.is_available}
                onCheckedChange={(checked) => setFormData({ ...formData, is_available: checked })}
              />
              <Label htmlFor="available">Available for appointments</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {editingSchedule ? 'Update' : 'Add'} Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}