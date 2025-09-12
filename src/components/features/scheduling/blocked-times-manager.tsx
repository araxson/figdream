'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, Ban, Plus, Edit2, Trash2, AlertCircle, CalendarOff, Repeat, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { useSalon } from '@/lib/contexts/salon-context';
import { Skeleton } from '@/components/ui/skeleton';
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, isWithinInterval, parseISO } from 'date-fns';

interface BlockedTime {
  id: string;
  salon_id: string;
  location_id?: string;
  staff_id?: string;
  staff_name?: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  is_recurring: boolean;
  recurrence_pattern?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    interval: number;
    days_of_week?: number[];
    end_date?: string;
  };
  block_type: 'full' | 'partial' | 'staff' | 'location';
  reason: 'holiday' | 'maintenance' | 'training' | 'meeting' | 'break' | 'other';
  affected_services?: string[];
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

const BLOCK_REASONS = [
  { value: 'holiday', label: 'Holiday', color: 'bg-blue-500' },
  { value: 'maintenance', label: 'Maintenance', color: 'bg-orange-500' },
  { value: 'training', label: 'Training', color: 'bg-purple-500' },
  { value: 'meeting', label: 'Meeting', color: 'bg-green-500' },
  { value: 'break', label: 'Break', color: 'bg-yellow-500' },
  { value: 'other', label: 'Other', color: 'bg-gray-500' }
];

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' }
];

export function BlockedTimesManager() {
  const { currentSalon, isLoading: salonLoading, isAdmin } = useSalon();
  const salonId = currentSalon?.id;
  
  const [blockedTimes, setBlockedTimes] = useState<BlockedTime[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState<BlockedTime | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [staff, setStaff] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_date: format(new Date(), 'yyyy-MM-dd'),
    start_time: '09:00',
    end_date: format(new Date(), 'yyyy-MM-dd'),
    end_time: '17:00',
    is_recurring: false,
    frequency: 'weekly' as 'daily' | 'weekly' | 'monthly',
    interval: 1,
    days_of_week: [] as number[],
    recurrence_end_date: '',
    block_type: 'full' as BlockedTime['block_type'],
    reason: 'other' as BlockedTime['reason'],
    staff_id: '',
    location_id: '',
    affected_services: [] as string[],
    is_active: true
  });
  const [stats, setStats] = useState({
    totalBlocks: 0,
    activeBlocks: 0,
    todayBlocks: 0,
    upcomingBlocks: 0,
    recurringBlocks: 0
  });

  const supabase = createClient();

  useEffect(() => {
    if (salonId) {
      fetchBlockedTimes();
      fetchStaff();
      fetchLocations();
      fetchServices();
      fetchStats();
    }
  }, [salonId]);

  const fetchBlockedTimes = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('blocked_times')
        .select(`
          *,
          staff:profiles!staff_id(full_name),
          location:salon_locations!location_id(name)
        `)
        .eq('salon_id', salonId)
        .order('start_time', { ascending: true });

      if (error) throw error;
      
      const mappedData = data?.map(item => ({
        ...item,
        staff_name: item.staff?.full_name
      })) || [];
      
      setBlockedTimes(mappedData);
    } catch (error) {
      console.error('Error fetching blocked times:', error);
      toast.error('Failed to load blocked times');
    } finally {
      setLoading(false);
    }
  };

  const fetchStaff = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('salon_id', salonId)
        .in('role', ['owner', 'staff'])
        .order('full_name');

      if (error) throw error;
      setStaff(data || []);
    } catch (error) {
      console.error('Error fetching staff:', error);
    }
  };

  const fetchLocations = async () => {
    try {
      const { data, error } = await supabase
        .from('salon_locations')
        .select('*')
        .eq('salon_id', salonId)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setLocations(data || []);
    } catch (error) {
      console.error('Error fetching locations:', error);
    }
  };

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('salon_id', salonId)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const today = new Date();
      const todayStart = new Date(today.setHours(0, 0, 0, 0));
      const todayEnd = new Date(today.setHours(23, 59, 59, 999));
      
      const totalBlocks = blockedTimes.length;
      const activeBlocks = blockedTimes.filter(b => b.is_active).length;
      const todayBlocks = blockedTimes.filter(b => {
        const start = new Date(b.start_time);
        return start >= todayStart && start <= todayEnd;
      }).length;
      const upcomingBlocks = blockedTimes.filter(b => {
        const start = new Date(b.start_time);
        return start > todayEnd && b.is_active;
      }).length;
      const recurringBlocks = blockedTimes.filter(b => b.is_recurring).length;

      setStats({
        totalBlocks,
        activeBlocks,
        todayBlocks,
        upcomingBlocks,
        recurringBlocks
      });
    } catch (error) {
      console.error('Error calculating stats:', error);
    }
  };

  const handleSubmit = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const blockData = {
        salon_id: salonId,
        title: formData.title,
        description: formData.description || null,
        start_time: `${formData.start_date}T${formData.start_time}:00`,
        end_time: `${formData.end_date}T${formData.end_time}:00`,
        is_recurring: formData.is_recurring,
        recurrence_pattern: formData.is_recurring ? {
          frequency: formData.frequency,
          interval: formData.interval,
          days_of_week: formData.days_of_week.length > 0 ? formData.days_of_week : null,
          end_date: formData.recurrence_end_date || null
        } : null,
        block_type: formData.block_type,
        reason: formData.reason,
        staff_id: formData.staff_id || null,
        location_id: formData.location_id || null,
        affected_services: formData.affected_services.length > 0 ? formData.affected_services : null,
        is_active: formData.is_active,
        updated_at: new Date().toISOString()
      };

      if (editingBlock) {
        const { error } = await supabase
          .from('blocked_times')
          .update(blockData)
          .eq('id', editingBlock.id);

        if (error) throw error;
        toast.success('Blocked time updated successfully');
      } else {
        const { error } = await supabase
          .from('blocked_times')
          .insert({
            ...blockData,
            created_by: user.id,
            created_at: new Date().toISOString()
          });

        if (error) throw error;
        toast.success('Blocked time created successfully');
      }

      setIsDialogOpen(false);
      resetForm();
      fetchBlockedTimes();
      fetchStats();
    } catch (error) {
      console.error('Error saving blocked time:', error);
      toast.error('Failed to save blocked time');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this blocked time?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('blocked_times')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Blocked time deleted successfully');
      fetchBlockedTimes();
      fetchStats();
    } catch (error) {
      console.error('Error deleting blocked time:', error);
      toast.error('Failed to delete blocked time');
    }
  };

  const toggleActive = async (block: BlockedTime) => {
    try {
      const { error } = await supabase
        .from('blocked_times')
        .update({ is_active: !block.is_active })
        .eq('id', block.id);

      if (error) throw error;

      toast.success(`Block ${block.is_active ? 'deactivated' : 'activated'}`);
      fetchBlockedTimes();
      fetchStats();
    } catch (error) {
      console.error('Error updating block:', error);
      toast.error('Failed to update block');
    }
  };

  const openDialog = (block?: BlockedTime) => {
    if (block) {
      setEditingBlock(block);
      const startDate = new Date(block.start_time);
      const endDate = new Date(block.end_time);
      
      setFormData({
        title: block.title,
        description: block.description || '',
        start_date: format(startDate, 'yyyy-MM-dd'),
        start_time: format(startDate, 'HH:mm'),
        end_date: format(endDate, 'yyyy-MM-dd'),
        end_time: format(endDate, 'HH:mm'),
        is_recurring: block.is_recurring,
        frequency: block.recurrence_pattern?.frequency || 'weekly',
        interval: block.recurrence_pattern?.interval || 1,
        days_of_week: block.recurrence_pattern?.days_of_week || [],
        recurrence_end_date: block.recurrence_pattern?.end_date ? format(parseISO(block.recurrence_pattern.end_date), 'yyyy-MM-dd') : '',
        block_type: block.block_type,
        reason: block.reason,
        staff_id: block.staff_id || '',
        location_id: block.location_id || '',
        affected_services: block.affected_services || [],
        is_active: block.is_active
      });
    } else {
      setEditingBlock(null);
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      start_date: format(new Date(), 'yyyy-MM-dd'),
      start_time: '09:00',
      end_date: format(new Date(), 'yyyy-MM-dd'),
      end_time: '17:00',
      is_recurring: false,
      frequency: 'weekly',
      interval: 1,
      days_of_week: [],
      recurrence_end_date: '',
      block_type: 'full',
      reason: 'other',
      staff_id: '',
      location_id: '',
      affected_services: [],
      is_active: true
    });
    setEditingBlock(null);
  };

  const getReasonBadge = (reason: string) => {
    const reasonConfig = BLOCK_REASONS.find(r => r.value === reason);
    return (
      <Badge className={reasonConfig?.color}>
        {reasonConfig?.label || reason}
      </Badge>
    );
  };

  const getBlockTypeBadge = (type: string) => {
    switch (type) {
      case 'full':
        return <Badge variant="destructive">Full Block</Badge>;
      case 'partial':
        return <Badge variant="outline">Partial</Badge>;
      case 'staff':
        return <Badge variant="secondary">Staff Only</Badge>;
      case 'location':
        return <Badge variant="default">Location</Badge>;
      default:
        return <Badge>{type}</Badge>;
    }
  };

  // Calendar view helpers
  const getWeekDays = () => {
    const start = startOfWeek(selectedDate);
    const end = endOfWeek(selectedDate);
    return eachDayOfInterval({ start, end });
  };

  const getBlocksForDay = (date: Date) => {
    return blockedTimes.filter(block => {
      const blockStart = new Date(block.start_time);
      const blockEnd = new Date(block.end_time);
      
      // Check if block spans this day
      if (isSameDay(blockStart, date) || isSameDay(blockEnd, date) ||
          (blockStart < date && blockEnd > date)) {
        return true;
      }
      
      // Check recurring blocks
      if (block.is_recurring && block.recurrence_pattern) {
        // Simplified recurring check - would need more complex logic in production
        const dayOfWeek = date.getDay();
        return block.recurrence_pattern.days_of_week?.includes(dayOfWeek);
      }
      
      return false;
    });
  };

  if (salonLoading || loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-5">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Card className="p-6">
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
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
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Blocks</CardTitle>
            <Ban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBlocks}</div>
            <p className="text-xs text-muted-foreground">
              All time blocks
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Blocks</CardTitle>
            <CalendarOff className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeBlocks}</div>
            <p className="text-xs text-muted-foreground">
              Currently active
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Blocks</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayBlocks}</div>
            <p className="text-xs text-muted-foreground">
              Affecting today
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcomingBlocks}</div>
            <p className="text-xs text-muted-foreground">
              Future blocks
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recurring</CardTitle>
            <Repeat className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recurringBlocks}</div>
            <p className="text-xs text-muted-foreground">
              Repeat blocks
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {stats.todayBlocks > 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You have {stats.todayBlocks} blocked time{stats.todayBlocks > 1 ? 's' : ''} affecting today's schedule.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Blocked Times</CardTitle>
              <CardDescription>
                Manage salon availability and blocked periods
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => openDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                Add Block
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'list' | 'calendar')}>
            <TabsList>
              <TabsTrigger value="list">List View</TabsTrigger>
              <TabsTrigger value="calendar">Calendar View</TabsTrigger>
            </TabsList>

            <TabsContent value="list" className="mt-4">
              {blockedTimes.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Ban className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>No blocked times configured</p>
                  <p className="text-sm mt-2">Add blocked times for holidays, maintenance, or other unavailable periods</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Affected</TableHead>
                      <TableHead>Recurring</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {blockedTimes.map((block) => (
                      <TableRow key={block.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{block.title}</div>
                            {block.description && (
                              <div className="text-sm text-muted-foreground">
                                {block.description}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{format(new Date(block.start_time), 'MMM d, yyyy')}</div>
                            <div className="text-muted-foreground">
                              {format(new Date(block.start_time), 'h:mm a')} - 
                              {format(new Date(block.end_time), 'h:mm a')}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getBlockTypeBadge(block.block_type)}</TableCell>
                        <TableCell>{getReasonBadge(block.reason)}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {block.staff_name && <div>Staff: {block.staff_name}</div>}
                            {block.location_id && <div>Location specific</div>}
                            {block.affected_services && block.affected_services.length > 0 && (
                              <div>{block.affected_services.length} services</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {block.is_recurring ? (
                            <Badge variant="outline">
                              <Repeat className="mr-1 h-3 w-3" />
                              {block.recurrence_pattern?.frequency}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {block.is_active ? (
                            <Badge variant="default">Active</Badge>
                          ) : (
                            <Badge variant="secondary">Inactive</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleActive(block)}
                            >
                              {block.is_active ? 'Deactivate' : 'Activate'}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openDialog(block)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(block.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>

            <TabsContent value="calendar" className="mt-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedDate(addDays(selectedDate, -7))}
                    >
                      Previous Week
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedDate(new Date())}
                    >
                      Today
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedDate(addDays(selectedDate, 7))}
                    >
                      Next Week
                    </Button>
                  </div>
                  <div className="text-sm font-medium">
                    {format(startOfWeek(selectedDate), 'MMM d')} - {format(endOfWeek(selectedDate), 'MMM d, yyyy')}
                  </div>
                </div>
                
                <div className="grid grid-cols-7 gap-2">
                  {getWeekDays().map((day) => {
                    const blocks = getBlocksForDay(day);
                    const isToday = isSameDay(day, new Date());
                    
                    return (
                      <Card key={day.toString()} className={isToday ? 'border-primary' : ''}>
                        <CardHeader className="p-3">
                          <div className="text-sm font-medium">
                            {format(day, 'EEE')}
                          </div>
                          <div className="text-lg">
                            {format(day, 'd')}
                          </div>
                        </CardHeader>
                        <CardContent className="p-3 pt-0">
                          {blocks.length === 0 ? (
                            <div className="text-xs text-muted-foreground">No blocks</div>
                          ) : (
                            <div className="space-y-1">
                              {blocks.slice(0, 3).map((block) => (
                                <div
                                  key={block.id}
                                  className="text-xs p-1 rounded bg-muted cursor-pointer hover:bg-muted/80"
                                  onClick={() => openDialog(block)}
                                >
                                  <div className="font-medium truncate">{block.title}</div>
                                  <div className="text-muted-foreground">
                                    {format(new Date(block.start_time), 'h:mm a')}
                                  </div>
                                </div>
                              ))}
                              {blocks.length > 3 && (
                                <div className="text-xs text-muted-foreground">
                                  +{blocks.length - 3} more
                                </div>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingBlock ? 'Edit Blocked Time' : 'Add Blocked Time'}
            </DialogTitle>
            <DialogDescription>
              Block time slots from being available for appointments
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Tabs defaultValue="basic">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="schedule">Schedule</TabsTrigger>
                <TabsTrigger value="affected">Affected Areas</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Holiday Closure"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Optional description..."
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="type">Block Type</Label>
                    <Select
                      value={formData.block_type}
                      onValueChange={(value) => setFormData({ 
                        ...formData, 
                        block_type: value as BlockedTime['block_type']
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full">Full Block (No appointments)</SelectItem>
                        <SelectItem value="partial">Partial (Some services)</SelectItem>
                        <SelectItem value="staff">Staff Specific</SelectItem>
                        <SelectItem value="location">Location Specific</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="reason">Reason</Label>
                    <Select
                      value={formData.reason}
                      onValueChange={(value) => setFormData({ 
                        ...formData, 
                        reason: value as BlockedTime['reason']
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {BLOCK_REASONS.map(reason => (
                          <SelectItem key={reason.value} value={reason.value}>
                            {reason.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="schedule" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start-date">Start Date</Label>
                    <Input
                      id="start-date"
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="start-time">Start Time</Label>
                    <Input
                      id="start-time"
                      type="time"
                      value={formData.start_time}
                      onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="end-date">End Date</Label>
                    <Input
                      id="end-date"
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="end-time">End Time</Label>
                    <Input
                      id="end-time"
                      type="time"
                      value={formData.end_time}
                      onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="recurring"
                      checked={formData.is_recurring}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_recurring: checked })}
                    />
                    <Label htmlFor="recurring">Recurring Block</Label>
                  </div>
                  
                  {formData.is_recurring && (
                    <div className="space-y-4 ml-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="frequency">Frequency</Label>
                          <Select
                            value={formData.frequency}
                            onValueChange={(value) => setFormData({ 
                              ...formData, 
                              frequency: value as 'daily' | 'weekly' | 'monthly'
                            })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="daily">Daily</SelectItem>
                              <SelectItem value="weekly">Weekly</SelectItem>
                              <SelectItem value="monthly">Monthly</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="interval">Repeat Every</Label>
                          <Input
                            id="interval"
                            type="number"
                            min="1"
                            value={formData.interval}
                            onChange={(e) => setFormData({ ...formData, interval: parseInt(e.target.value) || 1 })}
                          />
                        </div>
                      </div>
                      
                      {formData.frequency === 'weekly' && (
                        <div>
                          <Label>Days of Week</Label>
                          <div className="grid grid-cols-7 gap-2 mt-2">
                            {DAYS_OF_WEEK.map(day => (
                              <div key={day.value} className="flex items-center space-x-1">
                                <Checkbox
                                  id={`day-${day.value}`}
                                  checked={formData.days_of_week.includes(day.value)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setFormData({
                                        ...formData,
                                        days_of_week: [...formData.days_of_week, day.value]
                                      });
                                    } else {
                                      setFormData({
                                        ...formData,
                                        days_of_week: formData.days_of_week.filter(d => d !== day.value)
                                      });
                                    }
                                  }}
                                />
                                <Label htmlFor={`day-${day.value}`} className="text-xs">
                                  {day.label.slice(0, 3)}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div>
                        <Label htmlFor="end-recurrence">End Recurrence (Optional)</Label>
                        <Input
                          id="end-recurrence"
                          type="date"
                          value={formData.recurrence_end_date}
                          onChange={(e) => setFormData({ ...formData, recurrence_end_date: e.target.value })}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="affected" className="space-y-4 mt-4">
                {formData.block_type === 'staff' && (
                  <div>
                    <Label htmlFor="staff">Staff Member</Label>
                    <Select
                      value={formData.staff_id}
                      onValueChange={(value) => setFormData({ ...formData, staff_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select staff member" />
                      </SelectTrigger>
                      <SelectContent>
                        {staff.map(member => (
                          <SelectItem key={member.id} value={member.id}>
                            {member.full_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                {formData.block_type === 'location' && locations.length > 0 && (
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Select
                      value={formData.location_id}
                      onValueChange={(value) => setFormData({ ...formData, location_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                      <SelectContent>
                        {locations.map(location => (
                          <SelectItem key={location.id} value={location.id}>
                            {location.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                {formData.block_type === 'partial' && (
                  <div>
                    <Label>Affected Services</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2 max-h-48 overflow-y-auto">
                      {services.map(service => (
                        <div key={service.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`service-${service.id}`}
                            checked={formData.affected_services.includes(service.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setFormData({
                                  ...formData,
                                  affected_services: [...formData.affected_services, service.id]
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  affected_services: formData.affected_services.filter(s => s !== service.id)
                                });
                              }
                            }}
                          />
                          <Label htmlFor={`service-${service.id}`} className="text-sm">
                            {service.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label htmlFor="active">Active</Label>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {editingBlock ? 'Update' : 'Create'} Block
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}