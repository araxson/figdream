'use client';

import { useState, useEffect } from 'react';
import { Trophy, Star, Gift, Users, TrendingUp, Award, Zap, Crown, Plus, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
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
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { useSalon } from '@/lib/contexts/salon-context';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

interface LoyaltyProgram {
  id: string;
  salon_id: string;
  name: string;
  description?: string;
  type: 'points' | 'visits' | 'spending' | 'tiered';
  is_active: boolean;
  earning_rules: {
    points_per_dollar?: number;
    points_per_visit?: number;
    bonus_points?: Record<string, number>; // service-specific bonuses
    multiplier_events?: Array<{ name: string; multiplier: number; dates: string[] }>;
  };
  redemption_rules: {
    min_points_to_redeem?: number;
    points_to_dollar_ratio?: number;
    max_redemption_percentage?: number;
    excluded_services?: string[];
  };
  tiers?: Array<{
    name: string;
    min_points: number;
    benefits: string[];
    multiplier: number;
    badge_color: string;
  }>;
  expiry_rules?: {
    points_expire: boolean;
    expiry_months: number;
    warning_days: number;
  };
  created_at: string;
  updated_at: string;
}

interface LoyaltyMember {
  id: string;
  program_id: string;
  customer_id: string;
  customer_name?: string;
  customer_email?: string;
  points_balance: number;
  lifetime_points: number;
  current_tier?: string;
  visits_count: number;
  total_spent: number;
  last_activity?: string;
  joined_at: string;
  status: 'active' | 'inactive' | 'suspended';
}

interface PointsTransaction {
  id: string;
  member_id: string;
  type: 'earned' | 'redeemed' | 'expired' | 'adjusted';
  points: number;
  description: string;
  reference_id?: string; // appointment or order id
  created_at: string;
}

const TIER_COLORS = [
  { name: 'Bronze', color: 'bg-orange-500' },
  { name: 'Silver', color: 'bg-gray-400' },
  { name: 'Gold', color: 'bg-yellow-500' },
  { name: 'Platinum', color: 'bg-purple-500' },
  { name: 'Diamond', color: 'bg-blue-500' }
];

export function LoyaltyProgramsManager() {
  const { currentSalon, isLoading: salonLoading, isAdmin } = useSalon();
  const salonId = currentSalon?.id;
  
  const [programs, setPrograms] = useState<LoyaltyProgram[]>([]);
  const [members, setMembers] = useState<LoyaltyMember[]>([]);
  const [transactions, setTransactions] = useState<PointsTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'programs' | 'members' | 'transactions'>('programs');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPointsDialogOpen, setIsPointsDialogOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<LoyaltyProgram | null>(null);
  const [selectedMember, setSelectedMember] = useState<LoyaltyMember | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'points' as LoyaltyProgram['type'],
    is_active: true,
    points_per_dollar: 1,
    points_per_visit: 10,
    min_points_to_redeem: 100,
    points_to_dollar_ratio: 100, // 100 points = $1
    max_redemption_percentage: 50,
    points_expire: true,
    expiry_months: 12,
    warning_days: 30,
    enable_tiers: false,
    tiers: [
      { name: 'Bronze', min_points: 0, benefits: ['5% off services'], multiplier: 1, badge_color: 'bg-orange-500' },
      { name: 'Silver', min_points: 500, benefits: ['10% off services', 'Priority booking'], multiplier: 1.5, badge_color: 'bg-gray-400' },
      { name: 'Gold', min_points: 1500, benefits: ['15% off services', 'Free birthday service'], multiplier: 2, badge_color: 'bg-yellow-500' }
    ]
  });
  const [pointsAdjustment, setPointsAdjustment] = useState({
    type: 'earned' as PointsTransaction['type'],
    points: 0,
    description: ''
  });
  const [stats, setStats] = useState({
    totalPrograms: 0,
    activeMembers: 0,
    totalPointsIssued: 0,
    totalPointsRedeemed: 0,
    averageBalance: 0,
    engagementRate: 0
  });

  const supabase = createClient();

  useEffect(() => {
    if (salonId) {
      fetchPrograms();
      fetchMembers();
      fetchTransactions();
      fetchStats();
    }
  }, [salonId]);

  const fetchPrograms = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('loyalty_programs')
        .select('*')
        .eq('salon_id', salonId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPrograms(data || []);
    } catch (error) {
      console.error('Error fetching loyalty programs:', error);
      toast.error('Failed to load loyalty programs');
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('loyalty_members')
        .select(`
          *,
          customer:profiles!customer_id(full_name, email)
        `)
        .order('lifetime_points', { ascending: false });

      if (error) throw error;
      
      const mappedData = data?.map(item => ({
        ...item,
        customer_name: item.customer?.full_name,
        customer_email: item.customer?.email
      })) || [];
      
      setMembers(mappedData);
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('points_transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const totalPrograms = programs.filter(p => p.is_active).length;
      const activeMembers = members.filter(m => m.status === 'active').length;
      const totalPointsIssued = transactions
        .filter(t => t.type === 'earned')
        .reduce((sum, t) => sum + t.points, 0);
      const totalPointsRedeemed = transactions
        .filter(t => t.type === 'redeemed')
        .reduce((sum, t) => sum + Math.abs(t.points), 0);
      const averageBalance = members.length > 0
        ? members.reduce((sum, m) => sum + m.points_balance, 0) / members.length
        : 0;
      const engagementRate = members.length > 0
        ? (members.filter(m => m.last_activity && 
            new Date(m.last_activity) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          ).length / members.length) * 100
        : 0;

      setStats({
        totalPrograms,
        activeMembers,
        totalPointsIssued,
        totalPointsRedeemed,
        averageBalance,
        engagementRate
      });
    } catch (error) {
      console.error('Error calculating stats:', error);
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
        type: formData.type,
        is_active: formData.is_active,
        earning_rules: {
          points_per_dollar: formData.points_per_dollar,
          points_per_visit: formData.points_per_visit
        },
        redemption_rules: {
          min_points_to_redeem: formData.min_points_to_redeem,
          points_to_dollar_ratio: formData.points_to_dollar_ratio,
          max_redemption_percentage: formData.max_redemption_percentage
        },
        tiers: formData.enable_tiers ? formData.tiers : null,
        expiry_rules: formData.points_expire ? {
          points_expire: true,
          expiry_months: formData.expiry_months,
          warning_days: formData.warning_days
        } : null,
        updated_at: new Date().toISOString()
      };

      if (editingProgram) {
        const { error } = await supabase
          .from('loyalty_programs')
          .update(programData)
          .eq('id', editingProgram.id);

        if (error) throw error;
        toast.success('Loyalty program updated successfully');
      } else {
        const { error } = await supabase
          .from('loyalty_programs')
          .insert({
            ...programData,
            created_at: new Date().toISOString(),
            created_by: user.id
          });

        if (error) throw error;
        toast.success('Loyalty program created successfully');
      }

      setIsDialogOpen(false);
      resetForm();
      fetchPrograms();
      fetchStats();
    } catch (error) {
      console.error('Error saving loyalty program:', error);
      toast.error('Failed to save loyalty program');
    }
  };

  const handlePointsAdjustment = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      if (!selectedMember) return;

      // Calculate new balance
      let newBalance = selectedMember.points_balance;
      if (pointsAdjustment.type === 'earned' || pointsAdjustment.type === 'adjusted') {
        newBalance += pointsAdjustment.points;
      } else {
        newBalance -= pointsAdjustment.points;
      }

      // Update member balance
      const { error: updateError } = await supabase
        .from('loyalty_members')
        .update({ 
          points_balance: newBalance,
          lifetime_points: selectedMember.lifetime_points + 
            (pointsAdjustment.type === 'earned' ? pointsAdjustment.points : 0),
          last_activity: new Date().toISOString()
        })
        .eq('id', selectedMember.id);

      if (updateError) throw updateError;

      // Record transaction
      const { error: transactionError } = await supabase
        .from('points_transactions')
        .insert({
          member_id: selectedMember.id,
          type: pointsAdjustment.type,
          points: pointsAdjustment.points,
          description: pointsAdjustment.description,
          created_at: new Date().toISOString(),
          created_by: user.id
        });

      if (transactionError) throw transactionError;

      toast.success('Points adjusted successfully');
      setIsPointsDialogOpen(false);
      resetPointsForm();
      fetchMembers();
      fetchTransactions();
      fetchStats();
    } catch (error) {
      console.error('Error adjusting points:', error);
      toast.error('Failed to adjust points');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this loyalty program? Member data will be preserved.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('loyalty_programs')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Loyalty program deleted successfully');
      fetchPrograms();
      fetchStats();
    } catch (error) {
      console.error('Error deleting loyalty program:', error);
      toast.error('Failed to delete loyalty program');
    }
  };

  const toggleActive = async (program: LoyaltyProgram) => {
    try {
      const { error } = await supabase
        .from('loyalty_programs')
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

  const openDialog = (program?: LoyaltyProgram) => {
    if (program) {
      setEditingProgram(program);
      setFormData({
        name: program.name,
        description: program.description || '',
        type: program.type,
        is_active: program.is_active,
        points_per_dollar: program.earning_rules?.points_per_dollar || 1,
        points_per_visit: program.earning_rules?.points_per_visit || 10,
        min_points_to_redeem: program.redemption_rules?.min_points_to_redeem || 100,
        points_to_dollar_ratio: program.redemption_rules?.points_to_dollar_ratio || 100,
        max_redemption_percentage: program.redemption_rules?.max_redemption_percentage || 50,
        points_expire: !!program.expiry_rules?.points_expire,
        expiry_months: program.expiry_rules?.expiry_months || 12,
        warning_days: program.expiry_rules?.warning_days || 30,
        enable_tiers: !!program.tiers,
        tiers: program.tiers || formData.tiers
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
      type: 'points',
      is_active: true,
      points_per_dollar: 1,
      points_per_visit: 10,
      min_points_to_redeem: 100,
      points_to_dollar_ratio: 100,
      max_redemption_percentage: 50,
      points_expire: true,
      expiry_months: 12,
      warning_days: 30,
      enable_tiers: false,
      tiers: [
        { name: 'Bronze', min_points: 0, benefits: ['5% off services'], multiplier: 1, badge_color: 'bg-orange-500' },
        { name: 'Silver', min_points: 500, benefits: ['10% off services', 'Priority booking'], multiplier: 1.5, badge_color: 'bg-gray-400' },
        { name: 'Gold', min_points: 1500, benefits: ['15% off services', 'Free birthday service'], multiplier: 2, badge_color: 'bg-yellow-500' }
      ]
    });
    setEditingProgram(null);
  };

  const resetPointsForm = () => {
    setPointsAdjustment({
      type: 'earned',
      points: 0,
      description: ''
    });
    setSelectedMember(null);
  };

  const getMemberTier = (member: LoyaltyMember) => {
    const program = programs.find(p => p.id === member.program_id);
    if (!program?.tiers) return null;
    
    const tier = [...program.tiers]
      .sort((a, b) => b.min_points - a.min_points)
      .find(t => member.lifetime_points >= t.min_points);
    
    return tier;
  };

  const filteredMembers = members.filter(member => {
    return searchTerm === '' || 
      member.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.customer_email?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (salonLoading || loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-6">
          {[...Array(6)].map((_, i) => (
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
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPrograms}</div>
            <p className="text-xs text-muted-foreground">
              Active programs
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeMembers}</div>
            <p className="text-xs text-muted-foreground">
              Active members
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Points Issued</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalPointsIssued.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Total earned
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Points Redeemed</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalPointsRedeemed.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Total spent
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Balance</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(stats.averageBalance)}
            </div>
            <p className="text-xs text-muted-foreground">
              Points per member
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.engagementRate.toFixed(0)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Active in 30 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Loyalty Programs</CardTitle>
              <CardDescription>
                Manage customer loyalty rewards and tiers
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
              <TabsTrigger value="members">Members</TabsTrigger>
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
            </TabsList>

            <TabsContent value="programs" className="mt-4">
              {programs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Trophy className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>No loyalty programs yet</p>
                  <p className="text-sm mt-2">Create your first program to start rewarding customers</p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {programs.map((program) => (
                    <Card key={program.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg">{program.name}</CardTitle>
                            {program.description && (
                              <CardDescription>{program.description}</CardDescription>
                            )}
                          </div>
                          <Badge variant={program.is_active ? 'default' : 'secondary'}>
                            {program.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Type</p>
                            <p className="font-medium capitalize">{program.type}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Earning Rate</p>
                            <p className="font-medium">
                              {program.earning_rules?.points_per_dollar} pts/$
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Redemption</p>
                            <p className="font-medium">
                              {program.redemption_rules?.points_to_dollar_ratio} pts = $1
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Min Points</p>
                            <p className="font-medium">
                              {program.redemption_rules?.min_points_to_redeem}
                            </p>
                          </div>
                        </div>
                        
                        {program.tiers && (
                          <div>
                            <p className="text-sm font-medium mb-2">Tiers</p>
                            <div className="flex gap-2">
                              {program.tiers.map((tier) => (
                                <Badge key={tier.name} className={tier.badge_color}>
                                  {tier.name}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                      <CardFooter className="flex justify-end gap-2">
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
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="members" className="mt-4">
              <div className="space-y-4">
                <Input
                  placeholder="Search members..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
                
                {filteredMembers.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="mx-auto h-12 w-12 mb-4 opacity-50" />
                    <p>No loyalty members yet</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Member</TableHead>
                        <TableHead>Tier</TableHead>
                        <TableHead>Points Balance</TableHead>
                        <TableHead>Lifetime Points</TableHead>
                        <TableHead>Visits</TableHead>
                        <TableHead>Total Spent</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredMembers.map((member) => {
                        const tier = getMemberTier(member);
                        return (
                          <TableRow key={member.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{member.customer_name || 'Unknown'}</div>
                                <div className="text-sm text-muted-foreground">
                                  {member.customer_email}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {tier && (
                                <Badge className={tier.badge_color}>
                                  {tier.name}
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="font-medium">
                              {member.points_balance.toLocaleString()}
                            </TableCell>
                            <TableCell>
                              {member.lifetime_points.toLocaleString()}
                            </TableCell>
                            <TableCell>{member.visits_count}</TableCell>
                            <TableCell>${member.total_spent.toFixed(2)}</TableCell>
                            <TableCell>
                              <Badge variant={
                                member.status === 'active' ? 'default' :
                                member.status === 'suspended' ? 'destructive' :
                                'secondary'
                              }>
                                {member.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedMember(member);
                                  setIsPointsDialogOpen(true);
                                }}
                              >
                                Adjust Points
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </div>
            </TabsContent>

            <TabsContent value="transactions" className="mt-4">
              {transactions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Zap className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>No transactions yet</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Member</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Points</TableHead>
                      <TableHead>Description</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.slice(0, 50).map((transaction) => {
                      const member = members.find(m => m.id === transaction.member_id);
                      return (
                        <TableRow key={transaction.id}>
                          <TableCell>
                            {format(new Date(transaction.created_at), 'MMM d, yyyy h:mm a')}
                          </TableCell>
                          <TableCell>{member?.customer_name || '-'}</TableCell>
                          <TableCell>
                            <Badge variant={
                              transaction.type === 'earned' ? 'default' :
                              transaction.type === 'redeemed' ? 'secondary' :
                              transaction.type === 'expired' ? 'destructive' :
                              'outline'
                            }>
                              {transaction.type}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">
                            {transaction.type === 'earned' ? '+' : '-'}
                            {Math.abs(transaction.points)}
                          </TableCell>
                          <TableCell>{transaction.description}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Create/Edit Program Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProgram ? 'Edit Loyalty Program' : 'Create Loyalty Program'}
            </DialogTitle>
            <DialogDescription>
              Set up rewards and benefits for loyal customers
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Tabs defaultValue="basic">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">Basic</TabsTrigger>
                <TabsTrigger value="earning">Earning</TabsTrigger>
                <TabsTrigger value="redemption">Redemption</TabsTrigger>
                <TabsTrigger value="tiers">Tiers</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="name">Program Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="VIP Rewards"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Earn points on every visit and redeem for discounts"
                    rows={2}
                  />
                </div>
                <div>
                  <Label htmlFor="type">Program Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData({ 
                      ...formData, 
                      type: value as LoyaltyProgram['type']
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="points">Points Based</SelectItem>
                      <SelectItem value="visits">Visit Based</SelectItem>
                      <SelectItem value="spending">Spending Based</SelectItem>
                      <SelectItem value="tiered">Tiered Program</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label htmlFor="active">Active</Label>
                </div>
              </TabsContent>

              <TabsContent value="earning" className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="ppd">Points per Dollar Spent</Label>
                  <Slider
                    id="ppd"
                    min={0.5}
                    max={5}
                    step={0.5}
                    value={[formData.points_per_dollar]}
                    onValueChange={(value) => setFormData({ ...formData, points_per_dollar: value[0] })}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    {formData.points_per_dollar} points per $1 spent
                  </p>
                </div>
                <div>
                  <Label htmlFor="ppv">Points per Visit</Label>
                  <Input
                    id="ppv"
                    type="number"
                    value={formData.points_per_visit}
                    onChange={(e) => setFormData({ ...formData, points_per_visit: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="expire"
                      checked={formData.points_expire}
                      onCheckedChange={(checked) => setFormData({ ...formData, points_expire: checked })}
                    />
                    <Label htmlFor="expire">Points Expire</Label>
                  </div>
                  {formData.points_expire && (
                    <div className="grid grid-cols-2 gap-4 ml-6">
                      <div>
                        <Label htmlFor="expiry-months">Expiry Period (months)</Label>
                        <Input
                          id="expiry-months"
                          type="number"
                          value={formData.expiry_months}
                          onChange={(e) => setFormData({ ...formData, expiry_months: parseInt(e.target.value) || 12 })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="warning">Warning Days</Label>
                        <Input
                          id="warning"
                          type="number"
                          value={formData.warning_days}
                          onChange={(e) => setFormData({ ...formData, warning_days: parseInt(e.target.value) || 30 })}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="redemption" className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="min-redeem">Minimum Points to Redeem</Label>
                  <Input
                    id="min-redeem"
                    type="number"
                    value={formData.min_points_to_redeem}
                    onChange={(e) => setFormData({ ...formData, min_points_to_redeem: parseInt(e.target.value) || 100 })}
                  />
                </div>
                <div>
                  <Label htmlFor="ratio">Points to Dollar Ratio</Label>
                  <Input
                    id="ratio"
                    type="number"
                    value={formData.points_to_dollar_ratio}
                    onChange={(e) => setFormData({ ...formData, points_to_dollar_ratio: parseInt(e.target.value) || 100 })}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    {formData.points_to_dollar_ratio} points = $1 discount
                  </p>
                </div>
                <div>
                  <Label htmlFor="max-redeem">Max Redemption % per Transaction</Label>
                  <Slider
                    id="max-redeem"
                    min={10}
                    max={100}
                    step={10}
                    value={[formData.max_redemption_percentage]}
                    onValueChange={(value) => setFormData({ ...formData, max_redemption_percentage: value[0] })}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Up to {formData.max_redemption_percentage}% of total can be paid with points
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="tiers" className="space-y-4 mt-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="enable-tiers"
                    checked={formData.enable_tiers}
                    onCheckedChange={(checked) => setFormData({ ...formData, enable_tiers: checked })}
                  />
                  <Label htmlFor="enable-tiers">Enable Membership Tiers</Label>
                </div>
                
                {formData.enable_tiers && (
                  <div className="space-y-4">
                    {formData.tiers.map((tier, index) => (
                      <Card key={index}>
                        <CardHeader>
                          <CardTitle className="text-base flex items-center gap-2">
                            <Badge className={tier.badge_color}>{tier.name}</Badge>
                            Tier {index + 1}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div>
                            <Label>Minimum Points</Label>
                            <Input
                              type="number"
                              value={tier.min_points}
                              onChange={(e) => {
                                const newTiers = [...formData.tiers];
                                newTiers[index].min_points = parseInt(e.target.value) || 0;
                                setFormData({ ...formData, tiers: newTiers });
                              }}
                            />
                          </div>
                          <div>
                            <Label>Points Multiplier</Label>
                            <Input
                              type="number"
                              step="0.5"
                              value={tier.multiplier}
                              onChange={(e) => {
                                const newTiers = [...formData.tiers];
                                newTiers[index].multiplier = parseFloat(e.target.value) || 1;
                                setFormData({ ...formData, tiers: newTiers });
                              }}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
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

      {/* Points Adjustment Dialog */}
      <Dialog open={isPointsDialogOpen} onOpenChange={setIsPointsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adjust Points</DialogTitle>
            <DialogDescription>
              Manually adjust points for {selectedMember?.customer_name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {selectedMember && (
              <Alert>
                <Star className="h-4 w-4" />
                <AlertDescription>
                  Current Balance: {selectedMember.points_balance} points
                </AlertDescription>
              </Alert>
            )}
            <div>
              <Label htmlFor="adjustment-type">Adjustment Type</Label>
              <Select
                value={pointsAdjustment.type}
                onValueChange={(value) => setPointsAdjustment({ 
                  ...pointsAdjustment, 
                  type: value as PointsTransaction['type']
                })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="earned">Add Points</SelectItem>
                  <SelectItem value="redeemed">Deduct Points</SelectItem>
                  <SelectItem value="adjusted">Adjustment</SelectItem>
                  <SelectItem value="expired">Expire Points</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="points">Points</Label>
              <Input
                id="points"
                type="number"
                min="1"
                value={pointsAdjustment.points}
                onChange={(e) => setPointsAdjustment({ ...pointsAdjustment, points: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label htmlFor="reason">Reason</Label>
              <Textarea
                id="reason"
                value={pointsAdjustment.description}
                onChange={(e) => setPointsAdjustment({ ...pointsAdjustment, description: e.target.value })}
                placeholder="Reason for adjustment..."
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPointsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handlePointsAdjustment}>
              Adjust Points
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}