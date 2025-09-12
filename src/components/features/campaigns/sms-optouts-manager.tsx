'use client';

import { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { MessageSquareOff, Plus, Search, Trash2, Upload, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { useSalon } from '@/lib/contexts/salon-context';
import { Skeleton } from '@/components/ui/skeleton';

interface SmsOptout {
  id: string;
  phone_number: string;
  customer_id?: string;
  salon_id: string;
  opted_out_at: string;
  reason?: string;
  created_at: string;
  customers?: {
    id: string;
    full_name: string;
    email: string;
  };
}

export function SmsOptoutsManager() {
  const { currentSalon, isLoading: salonLoading, isAdmin } = useSalon();
  const salonId = currentSalon?.id;
  
  const [optouts, setOptouts] = useState<SmsOptout[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [formData, setFormData] = useState({
    phone_number: '',
    reason: ''
  });
  const [importData, setImportData] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    thisMonth: 0,
    lastMonth: 0
  });

  const supabase = createClient();

  useEffect(() => {
    if (salonId) {
      fetchOptouts();
      fetchStats();
    }
  }, [salonId]);

  const fetchOptouts = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('sms_opt_outs')
        .select(`
          *,
          customers (
            id,
            full_name,
            email
          )
        `)
        .eq('salon_id', salonId)
        .order('opted_out_at', { ascending: false });

      if (error) throw error;
      setOptouts(data || []);
    } catch (error) {
      console.error('Error fetching opt-outs:', error);
      toast.error('Failed to load SMS opt-outs');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const now = new Date();
      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

      const { data: allOptouts } = await supabase
        .from('sms_opt_outs')
        .select('opted_out_at')
        .eq('salon_id', salonId);

      const total = allOptouts?.length || 0;
      const thisMonth = allOptouts?.filter(o => 
        new Date(o.opted_out_at) >= thisMonthStart
      ).length || 0;
      const lastMonth = allOptouts?.filter(o => {
        const date = new Date(o.opted_out_at);
        return date >= lastMonthStart && date <= lastMonthEnd;
      }).length || 0;

      setStats({ total, thisMonth, lastMonth });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleAdd = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Check if phone number already opted out
      const { data: existing } = await supabase
        .from('sms_opt_outs')
        .select('id')
        .eq('salon_id', salonId)
        .eq('phone_number', formData.phone_number)
        .single();

      if (existing) {
        toast.error('This phone number is already opted out');
        return;
      }

      const { data, error } = await supabase
        .from('sms_opt_outs')
        .insert({
          salon_id: salonId,
          phone_number: formData.phone_number,
          reason: formData.reason || null,
          opted_out_at: new Date().toISOString(),
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Phone number added to opt-out list');
      setIsAddOpen(false);
      resetForm();
      fetchOptouts();
      fetchStats();
    } catch (error) {
      console.error('Error adding opt-out:', error);
      toast.error('Failed to add opt-out');
    }
  };

  const handleImport = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Parse CSV or newline-separated phone numbers
      const phoneNumbers = importData
        .split(/[,\n]/)
        .map(p => p.trim())
        .filter(p => p.length > 0);

      if (phoneNumbers.length === 0) {
        toast.error('No valid phone numbers found');
        return;
      }

      // Check for existing opt-outs
      const { data: existing } = await supabase
        .from('sms_opt_outs')
        .select('phone_number')
        .eq('salon_id', salonId)
        .in('phone_number', phoneNumbers);

      const existingNumbers = new Set(existing?.map(e => e.phone_number) || []);
      const newNumbers = phoneNumbers.filter(p => !existingNumbers.has(p));

      if (newNumbers.length === 0) {
        toast.info('All phone numbers are already opted out');
        return;
      }

      // Insert new opt-outs
      const optoutsToInsert = newNumbers.map(phone => ({
        salon_id: salonId,
        phone_number: phone,
        reason: 'Bulk import',
        opted_out_at: new Date().toISOString(),
        created_by: user.id
      }));

      const { error } = await supabase
        .from('sms_opt_outs')
        .insert(optoutsToInsert);

      if (error) throw error;

      toast.success(`Added ${newNumbers.length} phone numbers to opt-out list`);
      setIsImportOpen(false);
      setImportData('');
      fetchOptouts();
      fetchStats();
    } catch (error) {
      console.error('Error importing opt-outs:', error);
      toast.error('Failed to import opt-outs');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this opt-out? The customer may receive SMS messages again.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('sms_opt_outs')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Opt-out removed');
      fetchOptouts();
      fetchStats();
    } catch (error) {
      console.error('Error deleting opt-out:', error);
      toast.error('Failed to remove opt-out');
    }
  };

  const exportOptouts = () => {
    const csv = [
      ['Phone Number', 'Customer Name', 'Opted Out Date', 'Reason'],
      ...optouts.map(o => [
        o.phone_number,
        o.customers?.full_name || '',
        format(parseISO(o.opted_out_at), 'yyyy-MM-dd'),
        o.reason || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sms-optouts-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Opt-outs exported');
  };

  const resetForm = () => {
    setFormData({
      phone_number: '',
      reason: ''
    });
  };

  const filteredOptouts = optouts.filter(optout => {
    const searchLower = searchTerm.toLowerCase();
    return (
      optout.phone_number.includes(searchTerm) ||
      (optout.customers?.full_name?.toLowerCase().includes(searchLower)) ||
      (optout.reason?.toLowerCase().includes(searchLower))
    );
  });

  if (salonLoading || loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
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
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Opt-outs</CardTitle>
            <MessageSquareOff className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.thisMonth}</div>
            <p className="text-xs text-muted-foreground">New opt-outs</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.lastMonth}</div>
            <p className="text-xs text-muted-foreground">Opt-outs</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>SMS Opt-out List</CardTitle>
              <CardDescription>
                Manage customer SMS opt-out preferences for compliance
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={exportOptouts}>
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
              <Button variant="outline" onClick={() => setIsImportOpen(true)}>
                <Upload className="mr-2 h-4 w-4" />
                Import
              </Button>
              <Button onClick={() => setIsAddOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Opt-out
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by phone number or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Phone Number</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Opted Out</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOptouts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No SMS opt-outs found
                  </TableCell>
                </TableRow>
              ) : (
                filteredOptouts.map((optout) => (
                  <TableRow key={optout.id}>
                    <TableCell className="font-medium">
                      {optout.phone_number}
                    </TableCell>
                    <TableCell>
                      {optout.customers ? (
                        <div>
                          <div>{optout.customers.full_name}</div>
                          <div className="text-sm text-muted-foreground">
                            {optout.customers.email}
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {optout.reason || <span className="text-muted-foreground">-</span>}
                    </TableCell>
                    <TableCell>
                      {format(parseISO(optout.opted_out_at), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(optout.id)}
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

      {/* Add Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add SMS Opt-out</DialogTitle>
            <DialogDescription>
              Add a phone number to the SMS opt-out list
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                placeholder="+1234567890"
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="reason">Reason (Optional)</Label>
              <Textarea
                id="reason"
                placeholder="Customer requested to opt-out"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAdd}>Add to Opt-out List</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import SMS Opt-outs</DialogTitle>
            <DialogDescription>
              Bulk import phone numbers to opt-out list (CSV or one per line)
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="import">Phone Numbers</Label>
              <Textarea
                id="import"
                placeholder="+1234567890\n+0987654321\n..."
                rows={10}
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsImportOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleImport}>Import</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}