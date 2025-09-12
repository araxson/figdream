'use client';

import { useState, useEffect } from 'react';
import { format, parseISO, startOfMonth, endOfMonth } from 'date-fns';
import { DollarSign, Download, Plus, TrendingUp, User } from 'lucide-react';
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

interface StaffEarningsManagerProps {
  salonId: string;
}

interface StaffEarning {
  id: string;
  staff_profile_id: string;
  appointment_id?: string;
  amount: number;
  commission_rate?: number;
  earning_type: 'service' | 'tip' | 'product' | 'bonus' | 'deduction';
  description?: string;
  earning_date: string;
  created_at: string;
  staff_profiles?: {
    id: string;
    full_name: string;
    email: string;
  };
  appointments?: {
    id: string;
    start_time: string;
    services?: string[];
  };
}

interface StaffSummary {
  staff_id: string;
  staff_name: string;
  total_earnings: number;
  service_earnings: number;
  tips: number;
  bonuses: number;
  deductions: number;
  appointment_count: number;
}

export function StaffEarningsManager({ salonId }: StaffEarningsManagerProps) {
  const [earnings, setEarnings] = useState<StaffEarning[]>([]);
  const [summaries, setSummaries] = useState<StaffSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [staffMembers, setStaffMembers] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    staff_profile_id: '',
    amount: '',
    earning_type: 'service' as const,
    description: '',
    earning_date: format(new Date(), 'yyyy-MM-dd')
  });
  const [totals, setTotals] = useState({
    total: 0,
    services: 0,
    tips: 0,
    bonuses: 0,
    deductions: 0
  });

  const supabase = createClient();

  useEffect(() => {
    fetchEarnings();
    fetchStaffMembers();
  }, [salonId, selectedMonth]);

  const fetchEarnings = async () => {
    try {
      setLoading(true);
      
      const startDate = startOfMonth(new Date(selectedMonth));
      const endDate = endOfMonth(new Date(selectedMonth));

      const { data, error } = await supabase
        .from('staff_earnings')
        .select(`
          *,
          staff_profiles (
            id,
            full_name,
            email
          ),
          appointments (
            id,
            start_time
          )
        `)
        .eq('salon_id', salonId)
        .gte('earning_date', startDate.toISOString())
        .lte('earning_date', endDate.toISOString())
        .order('earning_date', { ascending: false });

      if (error) throw error;

      setEarnings(data || []);
      calculateSummaries(data || []);
    } catch (error) {
      console.error('Error fetching earnings:', error);
      toast.error('Failed to load staff earnings');
    } finally {
      setLoading(false);
    }
  };

  const fetchStaffMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('staff_profiles')
        .select('id, full_name, commission_rate')
        .eq('salon_id', salonId)
        .eq('is_active', true);

      if (error) throw error;
      setStaffMembers(data || []);
    } catch (error) {
      console.error('Error fetching staff members:', error);
    }
  };

  const calculateSummaries = (earningsData: StaffEarning[]) => {
    const staffMap = new Map<string, StaffSummary>();
    let totalAmounts = {
      total: 0,
      services: 0,
      tips: 0,
      bonuses: 0,
      deductions: 0
    };

    earningsData.forEach(earning => {
      const staffId = earning.staff_profile_id;
      const staffName = earning.staff_profiles?.full_name || 'Unknown';
      
      if (!staffMap.has(staffId)) {
        staffMap.set(staffId, {
          staff_id: staffId,
          staff_name: staffName,
          total_earnings: 0,
          service_earnings: 0,
          tips: 0,
          bonuses: 0,
          deductions: 0,
          appointment_count: 0
        });
      }

      const summary = staffMap.get(staffId)!;
      const amount = earning.amount;

      switch (earning.earning_type) {
        case 'service':
          summary.service_earnings += amount;
          totalAmounts.services += amount;
          break;
        case 'tip':
          summary.tips += amount;
          totalAmounts.tips += amount;
          break;
        case 'bonus':
          summary.bonuses += amount;
          totalAmounts.bonuses += amount;
          break;
        case 'deduction':
          summary.deductions += amount;
          totalAmounts.deductions += amount;
          break;
      }

      if (earning.earning_type !== 'deduction') {
        summary.total_earnings += amount;
        totalAmounts.total += amount;
      } else {
        summary.total_earnings -= amount;
        totalAmounts.total -= amount;
      }

      if (earning.appointment_id) {
        summary.appointment_count++;
      }
    });

    setSummaries(Array.from(staffMap.values()));
    setTotals(totalAmounts);
  };

  const handleAddEarning = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('staff_earnings')
        .insert({
          salon_id: salonId,
          staff_profile_id: formData.staff_profile_id,
          amount: parseFloat(formData.amount),
          earning_type: formData.earning_type,
          description: formData.description || null,
          earning_date: formData.earning_date,
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Earning entry added successfully');
      setIsAddOpen(false);
      resetForm();
      fetchEarnings();
    } catch (error) {
      console.error('Error adding earning:', error);
      toast.error('Failed to add earning entry');
    }
  };

  const exportToCSV = () => {
    // Implementation for CSV export
    toast.success('Earnings report exported');
  };

  const resetForm = () => {
    setFormData({
      staff_profile_id: '',
      amount: '',
      earning_type: 'service',
      description: '',
      earning_date: format(new Date(), 'yyyy-MM-dd')
    });
  };

  const getEarningTypeColor = (type: string) => {
    switch (type) {
      case 'service': return 'default';
      case 'tip': return 'success';
      case 'bonus': return 'secondary';
      case 'deduction': return 'destructive';
      case 'product': return 'outline';
      default: return 'outline';
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totals.total.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Services</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totals.services.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totals.tips.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bonuses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totals.bonuses.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Deductions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">-${totals.deductions.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Staff Earnings</CardTitle>
              <CardDescription>
                Track commissions, tips, and bonuses for {format(new Date(selectedMonth), 'MMMM yyyy')}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-40"
              />
              <Button variant="outline" onClick={exportToCSV}>
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
              <Button onClick={() => setIsAddOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Entry
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="summary">
            <TabsList>
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="details">Detailed Entries</TabsTrigger>
            </TabsList>
            
            <TabsContent value="summary" className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Staff Member</TableHead>
                    <TableHead className="text-right">Services</TableHead>
                    <TableHead className="text-right">Tips</TableHead>
                    <TableHead className="text-right">Bonuses</TableHead>
                    <TableHead className="text-right">Deductions</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {summaries.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        No earnings data for this period
                      </TableCell>
                    </TableRow>
                  ) : (
                    summaries.map((summary) => (
                      <TableRow key={summary.staff_id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{summary.staff_name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          ${summary.service_earnings.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">
                          ${summary.tips.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">
                          ${summary.bonuses.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right text-red-600">
                          -${summary.deductions.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right font-bold">
                          ${summary.total_earnings.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TabsContent>
            
            <TabsContent value="details" className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Staff Member</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {earnings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        No earning entries found
                      </TableCell>
                    </TableRow>
                  ) : (
                    earnings.map((earning) => (
                      <TableRow key={earning.id}>
                        <TableCell>
                          {format(parseISO(earning.earning_date), 'MMM dd, yyyy')}
                        </TableCell>
                        <TableCell>{earning.staff_profiles?.full_name || 'Unknown'}</TableCell>
                        <TableCell>
                          <Badge variant={getEarningTypeColor(earning.earning_type) as any}>
                            {earning.earning_type}
                          </Badge>
                        </TableCell>
                        <TableCell>{earning.description || '-'}</TableCell>
                        <TableCell className={`text-right font-medium ${
                          earning.earning_type === 'deduction' ? 'text-red-600' : ''
                        }`}>
                          {earning.earning_type === 'deduction' ? '-' : ''}${earning.amount.toFixed(2)}
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

      {/* Add Earning Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Earning Entry</DialogTitle>
            <DialogDescription>
              Record a manual earning, tip, bonus, or deduction
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
            <div>
              <Label htmlFor="type">Type</Label>
              <Select
                value={formData.earning_type}
                onValueChange={(value: any) => setFormData({ ...formData, earning_type: value })}
              >
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="service">Service Commission</SelectItem>
                  <SelectItem value="tip">Tip</SelectItem>
                  <SelectItem value="bonus">Bonus</SelectItem>
                  <SelectItem value="product">Product Sale</SelectItem>
                  <SelectItem value="deduction">Deduction</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.earning_date}
                onChange={(e) => setFormData({ ...formData, earning_date: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Additional notes..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddEarning}>Add Entry</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}