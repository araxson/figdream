'use client';

import { useState, useEffect } from 'react';
import { UserPlus, Clock, CheckCircle, XCircle, AlertCircle, Timer, Users, TrendingUp, Calendar, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { useSalon } from '@/lib/contexts/salon-context';
import { Skeleton } from '@/components/ui/skeleton';
import { format, formatDistanceToNow, addMinutes, isAfter, isBefore, startOfDay, endOfDay } from 'date-fns';

interface WalkInAppointment {
  id: string;
  salon_id: string;
  customer_name: string;
  customer_phone?: string;
  customer_email?: string;
  service_id?: string;
  service_name?: string;
  staff_id?: string;
  staff_name?: string;
  status: 'waiting' | 'in_service' | 'completed' | 'cancelled' | 'no_show';
  check_in_time: string;
  service_start_time?: string;
  service_end_time?: string;
  estimated_wait_time: number; // in minutes
  actual_wait_time?: number; // in minutes
  notes?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface Service {
  id: string;
  name: string;
  duration: number;
  price: number;
}

interface Staff {
  id: string;
  full_name: string;
  is_available: boolean;
  current_appointment?: string;
}

interface WaitTimeEstimate {
  staffId: string;
  staffName: string;
  estimatedWait: number;
  queueLength: number;
}

export function WalkInManager() {
  const { currentSalon, isLoading: salonLoading, isAdmin } = useSalon();
  const salonId = currentSalon?.id;
  
  const [walkIns, setWalkIns] = useState<WalkInAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'queue' | 'history'>('queue');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    service_id: '',
    staff_id: '',
    notes: ''
  });
  const [stats, setStats] = useState({
    totalToday: 0,
    currentWaiting: 0,
    averageWaitTime: 0,
    completedToday: 0,
    noShowToday: 0
  });
  const [waitTimeEstimates, setWaitTimeEstimates] = useState<WaitTimeEstimate[]>([]);

  const supabase = createClient();

  useEffect(() => {
    if (salonId) {
      fetchWalkIns();
      fetchServices();
      fetchStaff();
      fetchStats();
      
      // Set up real-time subscription
      const channel = supabase
        .channel('walk-ins')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'walk_in_appointments',
            filter: `salon_id=eq.${salonId}`
          },
          () => {
            fetchWalkIns();
            fetchStats();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [salonId]);

  useEffect(() => {
    if (formData.service_id && staff.length > 0) {
      calculateWaitTimeEstimates();
    }
  }, [formData.service_id, staff, walkIns]);

  const fetchWalkIns = async () => {
    try {
      setLoading(true);
      
      const query = supabase
        .from('walk_in_appointments')
        .select(`
          *,
          service:services(name, duration, price),
          staff:profiles!staff_id(full_name)
        `)
        .eq('salon_id', salonId)
        .order('check_in_time', { ascending: false });

      if (viewMode === 'queue') {
        query.in('status', ['waiting', 'in_service'])
          .gte('check_in_time', startOfDay(new Date()).toISOString());
      } else {
        query.gte('check_in_time', startOfDay(new Date()).toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // Map the data to include service and staff names
      const mappedData = data?.map(item => ({
        ...item,
        service_name: item.service?.name,
        staff_name: item.staff?.full_name
      })) || [];
      
      setWalkIns(mappedData);
    } catch (error) {
      console.error('Error fetching walk-ins:', error);
      toast.error('Failed to load walk-in appointments');
    } finally {
      setLoading(false);
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

  const fetchStaff = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('salon_id', salonId)
        .in('role', ['owner', 'staff'])
        .order('full_name');

      if (error) throw error;
      
      // Check availability based on current appointments
      const staffWithAvailability = await Promise.all(
        (data || []).map(async (member) => {
          const { data: currentApp } = await supabase
            .from('appointments')
            .select('id')
            .eq('staff_id', member.id)
            .eq('status', 'confirmed')
            .lte('start_time', new Date().toISOString())
            .gte('end_time', new Date().toISOString())
            .single();

          return {
            ...member,
            is_available: !currentApp,
            current_appointment: currentApp?.id
          };
        })
      );
      
      setStaff(staffWithAvailability);
    } catch (error) {
      console.error('Error fetching staff:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const today = new Date();
      const startOfToday = startOfDay(today).toISOString();
      const endOfToday = endOfDay(today).toISOString();

      const { data } = await supabase
        .from('walk_in_appointments')
        .select('*')
        .eq('salon_id', salonId)
        .gte('check_in_time', startOfToday)
        .lte('check_in_time', endOfToday);

      if (data) {
        const waiting = data.filter(w => w.status === 'waiting').length;
        const completed = data.filter(w => w.status === 'completed').length;
        const noShow = data.filter(w => w.status === 'no_show').length;
        
        // Calculate average wait time for completed appointments
        const completedWithWaitTime = data.filter(w => w.status === 'completed' && w.actual_wait_time);
        const avgWait = completedWithWaitTime.length > 0
          ? completedWithWaitTime.reduce((sum, w) => sum + (w.actual_wait_time || 0), 0) / completedWithWaitTime.length
          : 0;

        setStats({
          totalToday: data.length,
          currentWaiting: waiting,
          averageWaitTime: Math.round(avgWait),
          completedToday: completed,
          noShowToday: noShow
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const calculateWaitTimeEstimates = () => {
    const service = services.find(s => s.id === formData.service_id);
    if (!service) return;

    const estimates = staff
      .filter(s => s.is_available || s.current_appointment)
      .map(staffMember => {
        // Get waiting customers for this staff member
        const waitingForStaff = walkIns.filter(
          w => w.status === 'waiting' && w.staff_id === staffMember.id
        );
        
        // Calculate total wait time
        let totalWaitMinutes = 0;
        
        // If staff is currently with a customer
        if (!staffMember.is_available) {
          totalWaitMinutes += 15; // Assume 15 minutes remaining
        }
        
        // Add time for customers already waiting
        waitingForStaff.forEach(w => {
          const waitService = services.find(s => s.id === w.service_id);
          totalWaitMinutes += waitService?.duration || 30;
        });
        
        // Add time for the new service
        totalWaitMinutes += service.duration;

        return {
          staffId: staffMember.id,
          staffName: staffMember.full_name,
          estimatedWait: totalWaitMinutes,
          queueLength: waitingForStaff.length
        };
      })
      .sort((a, b) => a.estimatedWait - b.estimatedWait);

    setWaitTimeEstimates(estimates);
  };

  const handleCheckIn = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get estimated wait time
      const estimatedWait = waitTimeEstimates.find(e => e.staffId === formData.staff_id)?.estimatedWait || 30;

      const walkInData = {
        salon_id: salonId,
        customer_name: formData.customer_name,
        customer_phone: formData.customer_phone || null,
        customer_email: formData.customer_email || null,
        service_id: formData.service_id || null,
        staff_id: formData.staff_id || null,
        status: 'waiting',
        check_in_time: new Date().toISOString(),
        estimated_wait_time: estimatedWait,
        notes: formData.notes || null,
        created_by: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('walk_in_appointments')
        .insert(walkInData);

      if (error) throw error;

      toast.success(`${formData.customer_name} checked in successfully`);
      
      // Send notification if phone number provided
      if (formData.customer_phone) {
        toast.success(`Estimated wait time: ${estimatedWait} minutes`);
      }
      
      setIsDialogOpen(false);
      resetForm();
      fetchWalkIns();
      fetchStats();
    } catch (error) {
      console.error('Error checking in walk-in:', error);
      toast.error('Failed to check in customer');
    }
  };

  const handleStatusUpdate = async (walkIn: WalkInAppointment, newStatus: string) => {
    try {
      const updates: any = {
        status: newStatus,
        updated_at: new Date().toISOString()
      };

      // If starting service, record start time
      if (newStatus === 'in_service') {
        updates.service_start_time = new Date().toISOString();
        updates.actual_wait_time = Math.round(
          (new Date().getTime() - new Date(walkIn.check_in_time).getTime()) / 60000
        );
      }
      
      // If completing service, record end time
      if (newStatus === 'completed') {
        updates.service_end_time = new Date().toISOString();
        if (!walkIn.actual_wait_time && walkIn.service_start_time) {
          updates.actual_wait_time = Math.round(
            (new Date(walkIn.service_start_time).getTime() - new Date(walkIn.check_in_time).getTime()) / 60000
          );
        }
      }

      const { error } = await supabase
        .from('walk_in_appointments')
        .update(updates)
        .eq('id', walkIn.id);

      if (error) throw error;

      toast.success(`Status updated to ${newStatus}`);
      fetchWalkIns();
      fetchStats();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const resetForm = () => {
    setFormData({
      customer_name: '',
      customer_phone: '',
      customer_email: '',
      service_id: '',
      staff_id: '',
      notes: ''
    });
    setWaitTimeEstimates([]);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'waiting':
        return <Badge variant="secondary"><Clock className="mr-1 h-3 w-3" /> Waiting</Badge>;
      case 'in_service':
        return <Badge variant="default"><Timer className="mr-1 h-3 w-3" /> In Service</Badge>;
      case 'completed':
        return <Badge variant="outline"><CheckCircle className="mr-1 h-3 w-3" /> Completed</Badge>;
      case 'cancelled':
        return <Badge variant="secondary"><XCircle className="mr-1 h-3 w-3" /> Cancelled</Badge>;
      case 'no_show':
        return <Badge variant="destructive"><AlertCircle className="mr-1 h-3 w-3" /> No Show</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const filteredWalkIns = walkIns.filter(walkIn => {
    const matchesSearch = searchTerm === '' || 
      walkIn.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      walkIn.customer_phone?.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || walkIn.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

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
            {[...Array(3)].map((_, i) => (
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
            <CardTitle className="text-sm font-medium">Today's Walk-ins</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalToday}</div>
            <p className="text-xs text-muted-foreground">
              Total customers
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Currently Waiting</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.currentWaiting}</div>
            <p className="text-xs text-muted-foreground">
              In queue
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Wait Time</CardTitle>
            <Timer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageWaitTime} min</div>
            <p className="text-xs text-muted-foreground">
              Today's average
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedToday}</div>
            <p className="text-xs text-muted-foreground">
              Served today
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">No Shows</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.noShowToday}</div>
            <p className="text-xs text-muted-foreground">
              Didn't show up
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Walk-in Management</CardTitle>
              <CardDescription>
                Manage customers without appointments
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setIsDialogOpen(true)}>
                <UserPlus className="mr-2 h-4 w-4" />
                Check In Customer
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  placeholder="Search by name or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="waiting">Waiting</SelectItem>
                  <SelectItem value="in_service">In Service</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="no_show">No Show</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tabs */}
            <Tabs value={viewMode} onValueChange={(v) => {
              setViewMode(v as 'queue' | 'history');
              fetchWalkIns();
            }}>
              <TabsList>
                <TabsTrigger value="queue">Current Queue</TabsTrigger>
                <TabsTrigger value="history">Today's History</TabsTrigger>
              </TabsList>

              <TabsContent value="queue" className="mt-4">
                {filteredWalkIns.filter(w => ['waiting', 'in_service'].includes(w.status)).length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="mx-auto h-12 w-12 mb-4 opacity-50" />
                    <p>No customers in queue</p>
                    <p className="text-sm mt-2">Check in a walk-in customer to get started</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Customer</TableHead>
                        <TableHead>Service</TableHead>
                        <TableHead>Staff</TableHead>
                        <TableHead>Check-in Time</TableHead>
                        <TableHead>Wait Time</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredWalkIns
                        .filter(w => ['waiting', 'in_service'].includes(w.status))
                        .map((walkIn) => {
                          const waitTime = walkIn.actual_wait_time || 
                            Math.round((new Date().getTime() - new Date(walkIn.check_in_time).getTime()) / 60000);
                          
                          return (
                            <TableRow key={walkIn.id}>
                              <TableCell>
                                <div>
                                  <div className="font-medium">{walkIn.customer_name}</div>
                                  {walkIn.customer_phone && (
                                    <div className="text-sm text-muted-foreground">
                                      {walkIn.customer_phone}
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>{walkIn.service_name || 'Any available'}</TableCell>
                              <TableCell>{walkIn.staff_name || 'Any available'}</TableCell>
                              <TableCell>
                                {format(new Date(walkIn.check_in_time), 'h:mm a')}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <Timer className="h-3 w-3" />
                                  {waitTime} min
                                </div>
                              </TableCell>
                              <TableCell>{getStatusBadge(walkIn.status)}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  {walkIn.status === 'waiting' && (
                                    <>
                                      <Button
                                        size="sm"
                                        onClick={() => handleStatusUpdate(walkIn, 'in_service')}
                                      >
                                        Start Service
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleStatusUpdate(walkIn, 'no_show')}
                                      >
                                        No Show
                                      </Button>
                                    </>
                                  )}
                                  {walkIn.status === 'in_service' && (
                                    <Button
                                      size="sm"
                                      onClick={() => handleStatusUpdate(walkIn, 'completed')}
                                    >
                                      Complete
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>

              <TabsContent value="history" className="mt-4">
                {filteredWalkIns.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="mx-auto h-12 w-12 mb-4 opacity-50" />
                    <p>No walk-ins today</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Customer</TableHead>
                        <TableHead>Service</TableHead>
                        <TableHead>Staff</TableHead>
                        <TableHead>Check-in</TableHead>
                        <TableHead>Wait Time</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Notes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredWalkIns.map((walkIn) => (
                        <TableRow key={walkIn.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{walkIn.customer_name}</div>
                              {walkIn.customer_phone && (
                                <div className="text-sm text-muted-foreground">
                                  {walkIn.customer_phone}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{walkIn.service_name || 'Any available'}</TableCell>
                          <TableCell>{walkIn.staff_name || 'Any available'}</TableCell>
                          <TableCell>
                            {format(new Date(walkIn.check_in_time), 'h:mm a')}
                          </TableCell>
                          <TableCell>
                            {walkIn.actual_wait_time ? `${walkIn.actual_wait_time} min` : '-'}
                          </TableCell>
                          <TableCell>{getStatusBadge(walkIn.status)}</TableCell>
                          <TableCell className="max-w-[200px] truncate">
                            {walkIn.notes || '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* Check In Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Check In Walk-in Customer</DialogTitle>
            <DialogDescription>
              Register a customer without an appointment
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Customer Name *</Label>
                <Input
                  id="name"
                  value={formData.customer_name}
                  onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                  placeholder="John Doe"
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.customer_phone}
                  onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={formData.customer_email}
                onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                placeholder="john@example.com"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="service">Service</Label>
                <Select
                  value={formData.service_id}
                  onValueChange={(value) => setFormData({ ...formData, service_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select service (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map((service) => (
                      <SelectItem key={service.id} value={service.id}>
                        {service.name} ({service.duration} min - ${service.price})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="staff">Preferred Staff</Label>
                <Select
                  value={formData.staff_id}
                  onValueChange={(value) => setFormData({ ...formData, staff_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Any available" />
                  </SelectTrigger>
                  <SelectContent>
                    {staff.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.full_name} {!member.is_available && '(Busy)'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Wait Time Estimates */}
            {waitTimeEstimates.length > 0 && (
              <Alert>
                <Clock className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p className="font-medium">Estimated Wait Times:</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {waitTimeEstimates.slice(0, 4).map((estimate) => (
                        <div key={estimate.staffId} className="flex justify-between">
                          <span>{estimate.staffName}:</span>
                          <span className="font-medium">
                            {estimate.estimatedWait} min
                            {estimate.queueLength > 0 && ` (${estimate.queueLength} waiting)`}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Any special requests or notes..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCheckIn} disabled={!formData.customer_name}>
              Check In Customer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}