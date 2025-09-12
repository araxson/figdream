'use client';

import { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { Calendar, Check, Clock, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface TimeOffRequestsManagerProps {
  salonId: string;
}

interface TimeOffRequest {
  id: string;
  staff_profile_id: string;
  start_date: string;
  end_date: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  approved_by?: string;
  approved_at?: string;
  notes?: string;
  created_at: string;
  staff_profiles?: {
    id: string;
    full_name: string;
    email: string;
  };
}

export function TimeOffRequestsManager({ salonId }: TimeOffRequestsManagerProps) {
  const [requests, setRequests] = useState<TimeOffRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<TimeOffRequest | null>(null);
  const [staffMembers, setStaffMembers] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    staff_profile_id: '',
    start_date: '',
    end_date: '',
    reason: '',
    notes: ''
  });

  const supabase = createClient();

  useEffect(() => {
    fetchRequests();
    fetchStaffMembers();
  }, [salonId, activeTab]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('time_off_requests')
        .select(`
          *,
          staff_profiles (
            id,
            full_name,
            email
          )
        `)
        .eq('salon_id', salonId)
        .order('created_at', { ascending: false });

      if (activeTab !== 'all') {
        query = query.eq('status', activeTab);
      }

      const { data, error } = await query;

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching time off requests:', error);
      toast.error('Failed to load time off requests');
    } finally {
      setLoading(false);
    }
  };

  const fetchStaffMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('staff_profiles')
        .select('id, full_name')
        .eq('salon_id', salonId)
        .eq('is_active', true);

      if (error) throw error;
      setStaffMembers(data || []);
    } catch (error) {
      console.error('Error fetching staff members:', error);
    }
  };

  const handleCreate = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('time_off_requests')
        .insert({
          salon_id: salonId,
          staff_profile_id: formData.staff_profile_id,
          start_date: formData.start_date,
          end_date: formData.end_date,
          reason: formData.reason,
          notes: formData.notes,
          status: 'pending',
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Time off request created successfully');
      setIsCreateOpen(false);
      resetForm();
      fetchRequests();
    } catch (error) {
      console.error('Error creating time off request:', error);
      toast.error('Failed to create time off request');
    }
  };

  const handleApprove = async (requestId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('time_off_requests')
        .update({
          status: 'approved',
          approved_by: user.id,
          approved_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (error) throw error;

      toast.success('Time off request approved');
      fetchRequests();
    } catch (error) {
      console.error('Error approving request:', error);
      toast.error('Failed to approve request');
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('time_off_requests')
        .update({
          status: 'rejected',
          approved_by: user.id,
          approved_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (error) throw error;

      toast.success('Time off request rejected');
      fetchRequests();
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast.error('Failed to reject request');
    }
  };

  const resetForm = () => {
    setFormData({
      staff_profile_id: '',
      start_date: '',
      end_date: '',
      reason: '',
      notes: ''
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'success';
      case 'rejected': return 'destructive';
      case 'pending': return 'secondary';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <Check className="h-4 w-4" />;
      case 'rejected': return <X className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      default: return null;
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Time Off Requests</CardTitle>
              <CardDescription>
                Manage staff vacation and time off requests
              </CardDescription>
            </div>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Request
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
              <TabsTrigger value="all">All</TabsTrigger>
            </TabsList>
            <TabsContent value={activeTab} className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Staff Member</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Requested</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        No time off requests found
                      </TableCell>
                    </TableRow>
                  ) : (
                    requests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {request.staff_profiles?.full_name || 'Unknown'}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {request.staff_profiles?.email}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div className="font-medium">
                                {format(parseISO(request.start_date), 'MMM dd')} - 
                                {format(parseISO(request.end_date), 'MMM dd, yyyy')}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{request.reason}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusColor(request.status) as any}>
                            <span className="flex items-center gap-1">
                              {getStatusIcon(request.status)}
                              {request.status}
                            </span>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {format(parseISO(request.created_at), 'MMM dd, yyyy')}
                        </TableCell>
                        <TableCell className="text-right">
                          {request.status === 'pending' && (
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleApprove(request.id)}
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleReject(request.id)}
                              >
                                Reject
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Time Off Request</DialogTitle>
            <DialogDescription>
              Create a new time off request for a staff member
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="staff">Staff Member</Label>
              <Select
                value={formData.staff_profile_id}
                onValueChange={(value) => setFormData({ ...formData, staff_profile_id: value })}
              >
                <SelectTrigger id="staff">
                  <SelectValue placeholder="Select staff member" />
                </SelectTrigger>
                <SelectContent>
                  {staffMembers.map(staff => (
                    <SelectItem key={staff.id} value={staff.id}>
                      {staff.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start">Start Date</Label>
                <Input
                  id="start"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="end">End Date</Label>
                <Input
                  id="end"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="reason">Reason</Label>
              <Select
                value={formData.reason}
                onValueChange={(value) => setFormData({ ...formData, reason: value })}
              >
                <SelectTrigger id="reason">
                  <SelectValue placeholder="Select reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vacation">Vacation</SelectItem>
                  <SelectItem value="sick">Sick Leave</SelectItem>
                  <SelectItem value="personal">Personal</SelectItem>
                  <SelectItem value="family">Family Emergency</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Additional notes..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate}>Create Request</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}