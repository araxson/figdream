'use client';

import { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { Plus, Calendar, Trash2, Edit } from 'lucide-react';
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
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { useSalon } from '@/lib/contexts/salon-context';
import { Skeleton } from '@/components/ui/skeleton';

export function BlockedTimesManager() {
  const { currentSalon, isLoading: salonLoading, isAdmin } = useSalon();
  const salonId = currentSalon?.id;
  const [blockedTimes, setBlockedTimes] = useState<any[]>([]);
  const [staffMembers, setStaffMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [formData, setFormData] = useState({
    staff_profile_id: '',
    start_time: '',
    end_time: '',
    reason: '',
    is_recurring: false,
    recurrence_pattern: ''
  });

  const supabase = createClient();

  useEffect(() => {
    if (salonId) {
      fetchData();
    }
  }, [salonId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch blocked times
      const { data: blocked, error: blockedError } = await supabase
        .from('blocked_times')
        .select(`
          *,
          staff_profiles (
            id,
            full_name
          )
        `)
        .eq('salon_id', salonId)
        .order('start_time', { ascending: false });

      if (blockedError) throw blockedError;

      // Fetch staff members
      const { data: staff, error: staffError } = await supabase
        .from('staff_profiles')
        .select('id, full_name')
        .eq('salon_id', salonId)
        .eq('is_active', true);

      if (staffError) throw staffError;

      setBlockedTimes(blocked || []);
      setStaffMembers(staff || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load blocked times');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('blocked_times')
        .insert({
          salon_id: salonId,
          staff_profile_id: formData.staff_profile_id || null,
          start_time: new Date(formData.start_time).toISOString(),
          end_time: new Date(formData.end_time).toISOString(),
          reason: formData.reason,
          is_recurring: formData.is_recurring,
          recurrence_pattern: formData.recurrence_pattern || null,
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Blocked time created successfully');
      setIsCreateOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error creating blocked time:', error);
      toast.error('Failed to create blocked time');
    }
  };

  const handleUpdate = async () => {
    if (!selectedItem) return;

    try {
      const { error } = await supabase
        .from('blocked_times')
        .update({
          start_time: new Date(formData.start_time).toISOString(),
          end_time: new Date(formData.end_time).toISOString(),
          reason: formData.reason,
          is_recurring: formData.is_recurring,
          recurrence_pattern: formData.recurrence_pattern || null
        })
        .eq('id', selectedItem.id);

      if (error) throw error;

      toast.success('Blocked time updated successfully');
      setIsEditOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error updating blocked time:', error);
      toast.error('Failed to update blocked time');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this blocked time?')) return;

    try {
      const { error } = await supabase
        .from('blocked_times')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Blocked time deleted successfully');
      fetchData();
    } catch (error) {
      console.error('Error deleting blocked time:', error);
      toast.error('Failed to delete blocked time');
    }
  };

  const resetForm = () => {
    setFormData({
      staff_profile_id: '',
      start_time: '',
      end_time: '',
      reason: '',
      is_recurring: false,
      recurrence_pattern: ''
    });
    setSelectedItem(null);
  };

  const openEditDialog = (item: any) => {
    setSelectedItem(item);
    setFormData({
      staff_profile_id: item.staff_profile_id || '',
      start_time: format(parseISO(item.start_time), "yyyy-MM-dd'T'HH:mm"),
      end_time: format(parseISO(item.end_time), "yyyy-MM-dd'T'HH:mm"),
      reason: item.reason,
      is_recurring: item.is_recurring,
      recurrence_pattern: item.recurrence_pattern || ''
    });
    setIsEditOpen(true);
  };

  if (salonLoading || loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
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
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Blocked Times</CardTitle>
              <CardDescription>
                Manage time periods when appointments cannot be scheduled
              </CardDescription>
            </div>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Blocked Time
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date & Time</TableHead>
                <TableHead>Staff</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {blockedTimes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No blocked times configured
                  </TableCell>
                </TableRow>
              ) : (
                blockedTimes.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">
                            {format(parseISO(item.start_time), 'MMM dd, yyyy')}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {format(parseISO(item.start_time), 'HH:mm')} - 
                            {format(parseISO(item.end_time), 'HH:mm')}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {item.staff_profiles?.full_name || 'All Staff'}
                    </TableCell>
                    <TableCell>{item.reason}</TableCell>
                    <TableCell>
                      <Badge variant={item.is_recurring ? 'secondary' : 'outline'}>
                        {item.is_recurring ? 'Recurring' : 'One-time'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(item)}
                        className="mr-2"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Blocked Time</DialogTitle>
            <DialogDescription>
              Block a time period to prevent appointments
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
                  <SelectValue placeholder="All staff" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Staff</SelectItem>
                  {staffMembers.map(staff => (
                    <SelectItem key={staff.id} value={staff.id}>
                      {staff.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="start">Start Time</Label>
              <Input
                id="start"
                type="datetime-local"
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="end">End Time</Label>
              <Input
                id="end"
                type="datetime-local"
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="reason">Reason</Label>
              <Textarea
                id="reason"
                placeholder="e.g., Holiday, Maintenance, Staff meeting"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="recurring"
                checked={formData.is_recurring}
                onCheckedChange={(checked) => setFormData({ ...formData, is_recurring: checked })}
              />
              <Label htmlFor="recurring">Recurring</Label>
            </div>
            {formData.is_recurring && (
              <div>
                <Label htmlFor="pattern">Recurrence Pattern</Label>
                <Input
                  id="pattern"
                  placeholder="e.g., Weekly, Monthly"
                  value={formData.recurrence_pattern}
                  onChange={(e) => setFormData({ ...formData, recurrence_pattern: e.target.value })}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Blocked Time</DialogTitle>
            <DialogDescription>
              Update blocked time details
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="edit-start">Start Time</Label>
              <Input
                id="edit-start"
                type="datetime-local"
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-end">End Time</Label>
              <Input
                id="edit-end"
                type="datetime-local"
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-reason">Reason</Label>
              <Textarea
                id="edit-reason"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-recurring"
                checked={formData.is_recurring}
                onCheckedChange={(checked) => setFormData({ ...formData, is_recurring: checked })}
              />
              <Label htmlFor="edit-recurring">Recurring</Label>
            </div>
            {formData.is_recurring && (
              <div>
                <Label htmlFor="edit-pattern">Recurrence Pattern</Label>
                <Input
                  id="edit-pattern"
                  value={formData.recurrence_pattern}
                  onChange={(e) => setFormData({ ...formData, recurrence_pattern: e.target.value })}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate}>Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}