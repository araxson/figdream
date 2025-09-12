'use client';

import { useState, useEffect } from 'react';
import { Gift, Users, TrendingUp, Copy, Share2, DollarSign, Award, Link, QrCode, Mail, MessageSquare, Plus, Edit2, Trash2, CheckCircle } from 'lucide-react';
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
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { useSalon } from '@/lib/contexts/salon-context';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

interface ReferralProgram {
  id: string;
  salon_id: string;
  name: string;
  description?: string;
  reward_type: 'percentage' | 'fixed' | 'service' | 'points';
  referrer_reward: number;
  referee_reward: number;
  minimum_purchase?: number;
  maximum_uses_per_customer?: number;
  valid_from: string;
  valid_until?: string;
  is_active: boolean;
  terms_conditions?: string;
  created_at: string;
  updated_at: string;
}

interface ReferralCode {
  id: string;
  program_id: string;
  customer_id: string;
  customer_name?: string;
  code: string;
  uses_count: number;
  total_earned: number;
  status: 'active' | 'expired' | 'maxed_out';
  created_at: string;
  last_used_at?: string;
}

interface ReferralRedemption {
  id: string;
  referral_code_id: string;
  referee_customer_id: string;
  referee_name?: string;
  appointment_id?: string;
  reward_amount: number;
  status: 'pending' | 'approved' | 'paid' | 'cancelled';
  redeemed_at: string;
}

export function ReferralProgramsManager() {
  const { currentSalon, isLoading: salonLoading, isAdmin } = useSalon();
  const salonId = currentSalon?.id;
  
  const [programs, setPrograms] = useState<ReferralProgram[]>([]);
  const [referralCodes, setReferralCodes] = useState<ReferralCode[]>([]);
  const [redemptions, setRedemptions] = useState<ReferralRedemption[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'programs' | 'codes' | 'redemptions'>('programs');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<ReferralProgram | null>(null);
  const [selectedProgram, setSelectedProgram] = useState<ReferralProgram | null>(null);
  const [isCodeDialogOpen, setIsCodeDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    reward_type: 'percentage' as ReferralProgram['reward_type'],
    referrer_reward: 10,
    referee_reward: 10,
    minimum_purchase: 0,
    maximum_uses_per_customer: 0,
    valid_from: format(new Date(), 'yyyy-MM-dd'),
    valid_until: '',
    is_active: true,
    terms_conditions: ''
  });
  const [codeFormData, setCodeFormData] = useState({
    customer_email: '',
    customer_name: '',
    custom_code: ''
  });
  const [stats, setStats] = useState({
    totalPrograms: 0,
    activePrograms: 0,
    totalCodes: 0,
    totalRedemptions: 0,
    totalRewards: 0,
    conversionRate: 0
  });

  const supabase = createClient();

  useEffect(() => {
    if (salonId) {
      fetchPrograms();
      fetchReferralCodes();
      fetchRedemptions();
      fetchStats();
    }
  }, [salonId]);

  const fetchPrograms = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('referral_programs')
        .select('*')
        .eq('salon_id', salonId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPrograms(data || []);
    } catch (error) {
      console.error('Error fetching referral programs:', error);
      toast.error('Failed to load referral programs');
    } finally {
      setLoading(false);
    }
  };

  const fetchReferralCodes = async () => {
    try {
      const { data, error } = await supabase
        .from('referral_codes')
        .select(`
          *,
          program:referral_programs(name),
          customer:profiles!customer_id(full_name, email)
        `)
        .eq('program.salon_id', salonId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const mappedData = data?.map(item => ({
        ...item,
        customer_name: item.customer?.full_name
      })) || [];
      
      setReferralCodes(mappedData);
    } catch (error) {
      console.error('Error fetching referral codes:', error);
    }
  };

  const fetchRedemptions = async () => {
    try {
      const { data, error } = await supabase
        .from('referral_redemptions')
        .select(`
          *,
          referral_code:referral_codes(
            code,
            program:referral_programs(name)
          ),
          referee:profiles!referee_customer_id(full_name)
        `)
        .order('redeemed_at', { ascending: false });

      if (error) throw error;
      
      const mappedData = data?.map(item => ({
        ...item,
        referee_name: item.referee?.full_name
      })) || [];
      
      setRedemptions(mappedData);
    } catch (error) {
      console.error('Error fetching redemptions:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const totalPrograms = programs.length;
      const activePrograms = programs.filter(p => p.is_active).length;
      const totalCodes = referralCodes.length;
      const totalRedemptions = redemptions.filter(r => r.status === 'paid').length;
      const totalRewards = redemptions
        .filter(r => r.status === 'paid')
        .reduce((sum, r) => sum + r.reward_amount, 0);
      
      const conversionRate = totalCodes > 0 
        ? (referralCodes.filter(c => c.uses_count > 0).length / totalCodes) * 100
        : 0;

      setStats({
        totalPrograms,
        activePrograms,
        totalCodes,
        totalRedemptions,
        totalRewards,
        conversionRate
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleSubmit = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const programData = {
        salon_id: salonId,
        name: formData.name,
        description: formData.description || null,
        reward_type: formData.reward_type,
        referrer_reward: formData.referrer_reward,
        referee_reward: formData.referee_reward,
        minimum_purchase: formData.minimum_purchase || null,
        maximum_uses_per_customer: formData.maximum_uses_per_customer || null,
        valid_from: formData.valid_from,
        valid_until: formData.valid_until || null,
        is_active: formData.is_active,
        terms_conditions: formData.terms_conditions || null,
        updated_at: new Date().toISOString()
      };

      if (editingProgram) {
        const { error } = await supabase
          .from('referral_programs')
          .update(programData)
          .eq('id', editingProgram.id);

        if (error) throw error;
        toast.success('Referral program updated successfully');
      } else {
        const { error } = await supabase
          .from('referral_programs')
          .insert({
            ...programData,
            created_at: new Date().toISOString(),
            created_by: user.id
          });

        if (error) throw error;
        toast.success('Referral program created successfully');
      }

      setIsDialogOpen(false);
      resetForm();
      fetchPrograms();
      fetchStats();
    } catch (error) {
      console.error('Error saving referral program:', error);
      toast.error('Failed to save referral program');
    }
  };

  const handleGenerateCode = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      if (!selectedProgram) throw new Error('No program selected');

      // Find or create customer
      let customerId = '';
      const { data: existingCustomer } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', codeFormData.customer_email)
        .single();

      if (existingCustomer) {
        customerId = existingCustomer.id;
      } else {
        // Create new customer profile
        const { data: newCustomer, error: createError } = await supabase
          .from('profiles')
          .insert({
            email: codeFormData.customer_email,
            full_name: codeFormData.customer_name,
            role: 'customer',
            salon_id: salonId,
            created_at: new Date().toISOString()
          })
          .select()
          .single();

        if (createError) throw createError;
        customerId = newCustomer.id;
      }

      // Generate unique code
      const code = codeFormData.custom_code || 
        `${codeFormData.customer_name.split(' ')[0].toUpperCase()}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

      const { error } = await supabase
        .from('referral_codes')
        .insert({
          program_id: selectedProgram.id,
          customer_id: customerId,
          code,
          uses_count: 0,
          total_earned: 0,
          status: 'active',
          created_at: new Date().toISOString()
        });

      if (error) throw error;

      toast.success(`Referral code ${code} generated successfully`);
      setIsCodeDialogOpen(false);
      resetCodeForm();
      fetchReferralCodes();
    } catch (error) {
      console.error('Error generating referral code:', error);
      toast.error('Failed to generate referral code');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this referral program? Existing codes will remain valid.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('referral_programs')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Referral program deleted successfully');
      fetchPrograms();
      fetchStats();
    } catch (error) {
      console.error('Error deleting referral program:', error);
      toast.error('Failed to delete referral program');
    }
  };

  const toggleActive = async (program: ReferralProgram) => {
    try {
      const { error } = await supabase
        .from('referral_programs')
        .update({ is_active: !program.is_active })
        .eq('id', program.id);

      if (error) throw error;

      toast.success(`Program ${program.is_active ? 'deactivated' : 'activated'}`);
      fetchPrograms();
    } catch (error) {
      console.error('Error updating program:', error);
      toast.error('Failed to update program');
    }
  };

  const handleApproveRedemption = async (redemption: ReferralRedemption) => {
    try {
      const { error } = await supabase
        .from('referral_redemptions')
        .update({ 
          status: 'approved',
          updated_at: new Date().toISOString()
        })
        .eq('id', redemption.id);

      if (error) throw error;

      toast.success('Redemption approved');
      fetchRedemptions();
    } catch (error) {
      console.error('Error approving redemption:', error);
      toast.error('Failed to approve redemption');
    }
  };

  const copyReferralLink = (code: string) => {
    const link = `${window.location.origin}/refer/${code}`;
    navigator.clipboard.writeText(link);
    toast.success('Referral link copied to clipboard');
  };

  const openDialog = (program?: ReferralProgram) => {
    if (program) {
      setEditingProgram(program);
      setFormData({
        name: program.name,
        description: program.description || '',
        reward_type: program.reward_type,
        referrer_reward: program.referrer_reward,
        referee_reward: program.referee_reward,
        minimum_purchase: program.minimum_purchase || 0,
        maximum_uses_per_customer: program.maximum_uses_per_customer || 0,
        valid_from: program.valid_from.split('T')[0],
        valid_until: program.valid_until ? program.valid_until.split('T')[0] : '',
        is_active: program.is_active,
        terms_conditions: program.terms_conditions || ''
      });
    } else {
      setEditingProgram(null);
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      reward_type: 'percentage',
      referrer_reward: 10,
      referee_reward: 10,
      minimum_purchase: 0,
      maximum_uses_per_customer: 0,
      valid_from: format(new Date(), 'yyyy-MM-dd'),
      valid_until: '',
      is_active: true,
      terms_conditions: ''
    });
    setEditingProgram(null);
  };

  const resetCodeForm = () => {
    setCodeFormData({
      customer_email: '',
      customer_name: '',
      custom_code: ''
    });
    setSelectedProgram(null);
  };

  const getRewardLabel = (type: string, amount: number) => {
    switch (type) {
      case 'percentage':
        return `${amount}% off`;
      case 'fixed':
        return `$${amount} off`;
      case 'points':
        return `${amount} points`;
      case 'service':
        return 'Free service';
      default:
        return amount.toString();
    }
  };

  const filteredCodes = referralCodes.filter(code => {
    return searchTerm === '' || 
      code.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      code.customer_name?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (salonLoading || loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Card className="p-6">
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
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
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Programs</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPrograms}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activePrograms} active
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Referral Codes</CardTitle>
            <Link className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCodes}</div>
            <p className="text-xs text-muted-foreground">
              Generated
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Redemptions</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRedemptions}</div>
            <p className="text-xs text-muted-foreground">
              Successful
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Rewards</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.totalRewards.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Paid out
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.conversionRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Code usage rate
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Value</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.totalRedemptions > 0 ? (stats.totalRewards / stats.totalRedemptions).toFixed(0) : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Per redemption
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Referral Programs</CardTitle>
              <CardDescription>
                Manage customer referral rewards and tracking
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => openDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                Create Program
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)}>
            <TabsList>
              <TabsTrigger value="programs">Programs</TabsTrigger>
              <TabsTrigger value="codes">Referral Codes</TabsTrigger>
              <TabsTrigger value="redemptions">Redemptions</TabsTrigger>
            </TabsList>

            <TabsContent value="programs" className="mt-4">
              {programs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Gift className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>No referral programs yet</p>
                  <p className="text-sm mt-2">Create your first program to start rewarding referrals</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Program</TableHead>
                      <TableHead>Rewards</TableHead>
                      <TableHead>Limits</TableHead>
                      <TableHead>Valid Period</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {programs.map((program) => (
                      <TableRow key={program.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{program.name}</div>
                            {program.description && (
                              <div className="text-sm text-muted-foreground">
                                {program.description}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm space-y-1">
                            <div>Referrer: {getRewardLabel(program.reward_type, program.referrer_reward)}</div>
                            <div>Referee: {getRewardLabel(program.reward_type, program.referee_reward)}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm space-y-1">
                            {program.minimum_purchase && (
                              <div>Min: ${program.minimum_purchase}</div>
                            )}
                            {program.maximum_uses_per_customer && (
                              <div>Max uses: {program.maximum_uses_per_customer}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>From: {format(new Date(program.valid_from), 'MMM d, yyyy')}</div>
                            {program.valid_until && (
                              <div>Until: {format(new Date(program.valid_until), 'MMM d, yyyy')}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {program.is_active ? (
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
                              onClick={() => toggleActive(program)}
                            >
                              {program.is_active ? 'Deactivate' : 'Activate'}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedProgram(program);
                                setIsCodeDialogOpen(true);
                              }}
                            >
                              Generate Code
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openDialog(program)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(program.id)}
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

            <TabsContent value="codes" className="mt-4">
              <div className="space-y-4">
                <Input
                  placeholder="Search codes or customers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
                
                {filteredCodes.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <QrCode className="mx-auto h-12 w-12 mb-4 opacity-50" />
                    <p>No referral codes generated</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Code</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Program</TableHead>
                        <TableHead>Uses</TableHead>
                        <TableHead>Earned</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCodes.map((code) => (
                        <TableRow key={code.id}>
                          <TableCell>
                            <div className="font-mono font-medium">
                              {code.code}
                            </div>
                          </TableCell>
                          <TableCell>{code.customer_name || '-'}</TableCell>
                          <TableCell>
                            {programs.find(p => p.id === code.program_id)?.name || '-'}
                          </TableCell>
                          <TableCell>{code.uses_count}</TableCell>
                          <TableCell>${code.total_earned}</TableCell>
                          <TableCell>
                            <Badge variant={code.status === 'active' ? 'default' : 'secondary'}>
                              {code.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyReferralLink(code.code)}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                              >
                                <Share2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </TabsContent>

            <TabsContent value="redemptions" className="mt-4">
              {redemptions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Award className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>No redemptions yet</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Referee</TableHead>
                      <TableHead>Reward</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {redemptions.map((redemption) => (
                      <TableRow key={redemption.id}>
                        <TableCell>
                          {format(new Date(redemption.redeemed_at), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell className="font-mono">
                          {referralCodes.find(c => c.id === redemption.referral_code_id)?.code || '-'}
                        </TableCell>
                        <TableCell>{redemption.referee_name || '-'}</TableCell>
                        <TableCell>${redemption.reward_amount}</TableCell>
                        <TableCell>
                          <Badge variant={
                            redemption.status === 'paid' ? 'default' :
                            redemption.status === 'approved' ? 'secondary' :
                            redemption.status === 'pending' ? 'outline' :
                            'destructive'
                          }>
                            {redemption.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {redemption.status === 'pending' && (
                            <Button
                              size="sm"
                              onClick={() => handleApproveRedemption(redemption)}
                            >
                              Approve
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Create/Edit Program Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingProgram ? 'Edit Referral Program' : 'Create Referral Program'}
            </DialogTitle>
            <DialogDescription>
              Set up rewards for customer referrals
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Program Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Friends & Family"
                />
              </div>
              <div>
                <Label htmlFor="type">Reward Type</Label>
                <Select
                  value={formData.reward_type}
                  onValueChange={(value) => setFormData({ 
                    ...formData, 
                    reward_type: value as ReferralProgram['reward_type']
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage Discount</SelectItem>
                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                    <SelectItem value="points">Loyalty Points</SelectItem>
                    <SelectItem value="service">Free Service</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Refer a friend and both get rewards!"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="referrer">Referrer Reward</Label>
                <Input
                  id="referrer"
                  type="number"
                  value={formData.referrer_reward}
                  onChange={(e) => setFormData({ ...formData, referrer_reward: parseFloat(e.target.value) || 0 })}
                  placeholder="10"
                />
              </div>
              <div>
                <Label htmlFor="referee">Referee Reward</Label>
                <Input
                  id="referee"
                  type="number"
                  value={formData.referee_reward}
                  onChange={(e) => setFormData({ ...formData, referee_reward: parseFloat(e.target.value) || 0 })}
                  placeholder="10"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="minimum">Minimum Purchase</Label>
                <Input
                  id="minimum"
                  type="number"
                  value={formData.minimum_purchase}
                  onChange={(e) => setFormData({ ...formData, minimum_purchase: parseFloat(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="max-uses">Max Uses Per Customer</Label>
                <Input
                  id="max-uses"
                  type="number"
                  value={formData.maximum_uses_per_customer}
                  onChange={(e) => setFormData({ ...formData, maximum_uses_per_customer: parseInt(e.target.value) || 0 })}
                  placeholder="0 for unlimited"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="valid-from">Valid From</Label>
                <Input
                  id="valid-from"
                  type="date"
                  value={formData.valid_from}
                  onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="valid-until">Valid Until (Optional)</Label>
                <Input
                  id="valid-until"
                  type="date"
                  value={formData.valid_until}
                  onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="terms">Terms & Conditions</Label>
              <Textarea
                id="terms"
                value={formData.terms_conditions}
                onChange={(e) => setFormData({ ...formData, terms_conditions: e.target.value })}
                placeholder="Enter any terms and conditions..."
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor="active">Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {editingProgram ? 'Update' : 'Create'} Program
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Generate Code Dialog */}
      <Dialog open={isCodeDialogOpen} onOpenChange={setIsCodeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate Referral Code</DialogTitle>
            <DialogDescription>
              Create a unique referral code for {selectedProgram?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="customer-email">Customer Email</Label>
              <Input
                id="customer-email"
                type="email"
                value={codeFormData.customer_email}
                onChange={(e) => setCodeFormData({ ...codeFormData, customer_email: e.target.value })}
                placeholder="customer@example.com"
                required
              />
            </div>
            <div>
              <Label htmlFor="customer-name">Customer Name</Label>
              <Input
                id="customer-name"
                value={codeFormData.customer_name}
                onChange={(e) => setCodeFormData({ ...codeFormData, customer_name: e.target.value })}
                placeholder="John Doe"
                required
              />
            </div>
            <div>
              <Label htmlFor="custom-code">Custom Code (Optional)</Label>
              <Input
                id="custom-code"
                value={codeFormData.custom_code}
                onChange={(e) => setCodeFormData({ ...codeFormData, custom_code: e.target.value.toUpperCase() })}
                placeholder="Leave blank to auto-generate"
              />
            </div>
            
            {selectedProgram && (
              <Alert>
                <Gift className="h-4 w-4" />
                <AlertDescription>
                  This code will provide:
                  <ul className="mt-2 space-y-1">
                    <li>• Referrer: {getRewardLabel(selectedProgram.reward_type, selectedProgram.referrer_reward)}</li>
                    <li>• Referee: {getRewardLabel(selectedProgram.reward_type, selectedProgram.referee_reward)}</li>
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCodeDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleGenerateCode}
              disabled={!codeFormData.customer_email || !codeFormData.customer_name}
            >
              Generate Code
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}