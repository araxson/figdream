'use client';

import { useState, useEffect } from 'react';
import { CreditCard, Plus, Edit2, Trash2, Check, X, TrendingUp, Users, Zap, Crown, Star } from 'lucide-react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { useSalon } from '@/lib/contexts/salon-context';
import { Skeleton } from '@/components/ui/skeleton';

interface PricingPlan {
  id: string;
  salon_id: string;
  name: string;
  description?: string;
  price: number;
  billing_period: 'monthly' | 'quarterly' | 'yearly' | 'one_time';
  features: string[];
  limitations?: {
    appointments_per_month?: number;
    staff_members?: number;
    locations?: number;
    sms_credits?: number;
    storage_gb?: number;
  };
  is_featured: boolean;
  is_active: boolean;
  trial_days?: number;
  setup_fee?: number;
  discount_percentage?: number;
  stripe_price_id?: string;
  display_order: number;
  created_at: string;
  updated_at: string;
}

interface PlanFeature {
  id: string;
  name: string;
  description: string;
  category: 'core' | 'advanced' | 'premium' | 'addon';
  is_available: boolean;
}

const DEFAULT_FEATURES: PlanFeature[] = [
  { id: 'appointments', name: 'Online Appointments', description: 'Accept bookings online', category: 'core', is_available: true },
  { id: 'staff_management', name: 'Staff Management', description: 'Manage staff schedules', category: 'core', is_available: true },
  { id: 'customer_management', name: 'Customer Management', description: 'Track customer information', category: 'core', is_available: true },
  { id: 'service_menu', name: 'Service Menu', description: 'Create and manage services', category: 'core', is_available: true },
  { id: 'email_reminders', name: 'Email Reminders', description: 'Automated email reminders', category: 'advanced', is_available: true },
  { id: 'sms_reminders', name: 'SMS Reminders', description: 'Automated SMS reminders', category: 'advanced', is_available: true },
  { id: 'marketing_campaigns', name: 'Marketing Campaigns', description: 'Email and SMS campaigns', category: 'advanced', is_available: true },
  { id: 'advanced_analytics', name: 'Advanced Analytics', description: 'Detailed business insights', category: 'premium', is_available: true },
  { id: 'multi_location', name: 'Multi-location Support', description: 'Manage multiple locations', category: 'premium', is_available: true },
  { id: 'api_access', name: 'API Access', description: 'Integrate with other tools', category: 'premium', is_available: true },
  { id: 'white_label', name: 'White Label', description: 'Custom branding', category: 'addon', is_available: true },
  { id: 'priority_support', name: 'Priority Support', description: '24/7 priority support', category: 'addon', is_available: true }
];

const PLAN_TEMPLATES = [
  {
    name: 'Starter',
    description: 'Perfect for individual stylists and small salons',
    price: 29,
    billing_period: 'monthly' as const,
    features: ['appointments', 'customer_management', 'service_menu', 'email_reminders'],
    limitations: {
      appointments_per_month: 100,
      staff_members: 1,
      locations: 1,
      sms_credits: 0,
      storage_gb: 1
    }
  },
  {
    name: 'Professional',
    description: 'Great for growing salons with multiple staff',
    price: 79,
    billing_period: 'monthly' as const,
    features: ['appointments', 'staff_management', 'customer_management', 'service_menu', 'email_reminders', 'sms_reminders', 'marketing_campaigns'],
    limitations: {
      appointments_per_month: 500,
      staff_members: 5,
      locations: 1,
      sms_credits: 100,
      storage_gb: 5
    },
    is_featured: true
  },
  {
    name: 'Enterprise',
    description: 'For large salons and chains',
    price: 199,
    billing_period: 'monthly' as const,
    features: ['appointments', 'staff_management', 'customer_management', 'service_menu', 'email_reminders', 'sms_reminders', 'marketing_campaigns', 'advanced_analytics', 'multi_location', 'api_access', 'priority_support'],
    limitations: {
      appointments_per_month: -1, // Unlimited
      staff_members: -1,
      locations: -1,
      sms_credits: 500,
      storage_gb: 50
    }
  }
];

export function PricingPlansManager() {
  const { currentSalon, isLoading: salonLoading, isAdmin } = useSalon();
  const salonId = currentSalon?.id;
  
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'manage' | 'preview'>('manage');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PricingPlan | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    billing_period: 'monthly' as PricingPlan['billing_period'],
    features: [] as string[],
    is_featured: false,
    is_active: true,
    trial_days: 0,
    setup_fee: 0,
    discount_percentage: 0,
    display_order: 0,
    appointments_limit: -1,
    staff_limit: -1,
    locations_limit: -1,
    sms_credits: 0,
    storage_gb: 1
  });
  const [stats, setStats] = useState({
    totalPlans: 0,
    activePlans: 0,
    totalSubscribers: 0,
    monthlyRevenue: 0
  });

  const supabase = createClient();

  useEffect(() => {
    if (salonId) {
      fetchPlans();
      fetchStats();
    }
  }, [salonId]);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('pricing_plans')
        .select('*')
        .eq('salon_id', salonId)
        .order('display_order');

      if (error) throw error;
      setPlans(data || []);
    } catch (error) {
      console.error('Error fetching pricing plans:', error);
      toast.error('Failed to load pricing plans');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { data: plansData } = await supabase
        .from('pricing_plans')
        .select('*')
        .eq('salon_id', salonId);

      // This would fetch actual subscription data
      const { data: subscriptionsData } = await supabase
        .from('platform_subscriptions')
        .select('*')
        .eq('salon_id', salonId)
        .eq('status', 'active');

      const totalPlans = plansData?.length || 0;
      const activePlans = plansData?.filter(p => p.is_active).length || 0;
      const totalSubscribers = subscriptionsData?.length || 0;
      
      // Calculate monthly revenue
      let monthlyRevenue = 0;
      subscriptionsData?.forEach(sub => {
        const plan = plansData?.find(p => p.id === sub.plan_id);
        if (plan) {
          let monthlyAmount = plan.price;
          if (plan.billing_period === 'yearly') monthlyAmount /= 12;
          else if (plan.billing_period === 'quarterly') monthlyAmount /= 3;
          monthlyRevenue += monthlyAmount;
        }
      });

      setStats({
        totalPlans,
        activePlans,
        totalSubscribers,
        monthlyRevenue
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleSubmit = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const planData = {
        salon_id: salonId,
        name: formData.name,
        description: formData.description || null,
        price: formData.price,
        billing_period: formData.billing_period,
        features: formData.features,
        limitations: {
          appointments_per_month: formData.appointments_limit,
          staff_members: formData.staff_limit,
          locations: formData.locations_limit,
          sms_credits: formData.sms_credits,
          storage_gb: formData.storage_gb
        },
        is_featured: formData.is_featured,
        is_active: formData.is_active,
        trial_days: formData.trial_days || null,
        setup_fee: formData.setup_fee || null,
        discount_percentage: formData.discount_percentage || null,
        display_order: formData.display_order,
        updated_at: new Date().toISOString()
      };

      if (editingPlan) {
        const { error } = await supabase
          .from('pricing_plans')
          .update(planData)
          .eq('id', editingPlan.id);

        if (error) throw error;
        toast.success('Pricing plan updated successfully');
      } else {
        const { error } = await supabase
          .from('pricing_plans')
          .insert({
            ...planData,
            created_at: new Date().toISOString(),
            created_by: user.id
          });

        if (error) throw error;
        toast.success('Pricing plan created successfully');
      }

      setIsDialogOpen(false);
      resetForm();
      fetchPlans();
    } catch (error) {
      console.error('Error saving pricing plan:', error);
      toast.error('Failed to save pricing plan');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this pricing plan? Active subscriptions will not be affected.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('pricing_plans')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Pricing plan deleted successfully');
      fetchPlans();
    } catch (error) {
      console.error('Error deleting pricing plan:', error);
      toast.error('Failed to delete pricing plan');
    }
  };

  const toggleActive = async (plan: PricingPlan) => {
    try {
      const { error } = await supabase
        .from('pricing_plans')
        .update({ is_active: !plan.is_active })
        .eq('id', plan.id);

      if (error) throw error;

      toast.success(`Plan ${plan.is_active ? 'deactivated' : 'activated'}`);
      fetchPlans();
    } catch (error) {
      console.error('Error updating plan:', error);
      toast.error('Failed to update plan');
    }
  };

  const toggleFeatured = async (plan: PricingPlan) => {
    try {
      // Unset other featured plans
      if (!plan.is_featured) {
        await supabase
          .from('pricing_plans')
          .update({ is_featured: false })
          .eq('salon_id', salonId);
      }

      const { error } = await supabase
        .from('pricing_plans')
        .update({ is_featured: !plan.is_featured })
        .eq('id', plan.id);

      if (error) throw error;

      toast.success(`Plan ${plan.is_featured ? 'unfeatured' : 'featured'}`);
      fetchPlans();
    } catch (error) {
      console.error('Error updating plan:', error);
      toast.error('Failed to update plan');
    }
  };

  const useTemplate = (template: typeof PLAN_TEMPLATES[0]) => {
    setFormData({
      name: template.name,
      description: template.description,
      price: template.price,
      billing_period: template.billing_period,
      features: template.features,
      is_featured: template.is_featured || false,
      is_active: true,
      trial_days: 14,
      setup_fee: 0,
      discount_percentage: 0,
      display_order: plans.length,
      appointments_limit: template.limitations.appointments_per_month,
      staff_limit: template.limitations.staff_members,
      locations_limit: template.limitations.locations,
      sms_credits: template.limitations.sms_credits,
      storage_gb: template.limitations.storage_gb
    });
    setIsDialogOpen(true);
  };

  const openDialog = (plan?: PricingPlan) => {
    if (plan) {
      setEditingPlan(plan);
      setFormData({
        name: plan.name,
        description: plan.description || '',
        price: plan.price,
        billing_period: plan.billing_period,
        features: plan.features,
        is_featured: plan.is_featured,
        is_active: plan.is_active,
        trial_days: plan.trial_days || 0,
        setup_fee: plan.setup_fee || 0,
        discount_percentage: plan.discount_percentage || 0,
        display_order: plan.display_order,
        appointments_limit: plan.limitations?.appointments_per_month || -1,
        staff_limit: plan.limitations?.staff_members || -1,
        locations_limit: plan.limitations?.locations || -1,
        sms_credits: plan.limitations?.sms_credits || 0,
        storage_gb: plan.limitations?.storage_gb || 1
      });
    } else {
      setEditingPlan(null);
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: 0,
      billing_period: 'monthly',
      features: [],
      is_featured: false,
      is_active: true,
      trial_days: 0,
      setup_fee: 0,
      discount_percentage: 0,
      display_order: plans.length,
      appointments_limit: -1,
      staff_limit: -1,
      locations_limit: -1,
      sms_credits: 0,
      storage_gb: 1
    });
    setEditingPlan(null);
  };

  const getBillingPeriodLabel = (period: string) => {
    switch (period) {
      case 'monthly': return '/month';
      case 'quarterly': return '/quarter';
      case 'yearly': return '/year';
      case 'one_time': return 'one-time';
      default: return '';
    }
  };

  const getPlanIcon = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('enterprise') || lowerName.includes('premium')) return Crown;
    if (lowerName.includes('professional') || lowerName.includes('pro')) return Zap;
    return Star;
  };

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
              <Skeleton key={i} className="h-48 w-full" />
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
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Plans</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPlans}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activePlans} active
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subscribers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSubscribers}</div>
            <p className="text-xs text-muted-foreground">
              Active subscriptions
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">MRR</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.monthlyRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Monthly recurring revenue
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Value</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.totalSubscribers > 0 ? (stats.monthlyRevenue / stats.totalSubscribers).toFixed(0) : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Per subscriber
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Pricing Plans</CardTitle>
              <CardDescription>
                Manage subscription tiers and pricing
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {plans.length === 0 && (
                <Select onValueChange={(value) => {
                  const template = PLAN_TEMPLATES.find(t => t.name === value);
                  if (template) useTemplate(template);
                }}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Use template" />
                  </SelectTrigger>
                  <SelectContent>
                    {PLAN_TEMPLATES.map((template) => (
                      <SelectItem key={template.name} value={template.name}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <Button onClick={() => openDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                Add Plan
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'manage' | 'preview')}>
            <TabsList className="mb-4">
              <TabsTrigger value="manage">Manage</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>

            <TabsContent value="manage">
              {plans.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CreditCard className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>No pricing plans yet</p>
                  <p className="text-sm mt-2">Create your first plan or use a template</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Plan</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Features</TableHead>
                      <TableHead>Limitations</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {plans.map((plan) => {
                      const Icon = getPlanIcon(plan.name);
                      return (
                        <TableRow key={plan.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4" />
                              <div>
                                <div className="font-medium">{plan.name}</div>
                                {plan.description && (
                                  <div className="text-sm text-muted-foreground">
                                    {plan.description}
                                  </div>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">
                              ${plan.price}{getBillingPeriodLabel(plan.billing_period)}
                            </div>
                            {plan.trial_days && (
                              <div className="text-sm text-muted-foreground">
                                {plan.trial_days} day trial
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {plan.features.length} features
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm space-y-1">
                              {plan.limitations?.appointments_per_month !== -1 && (
                                <div>{plan.limitations?.appointments_per_month} appointments/mo</div>
                              )}
                              {plan.limitations?.staff_members !== -1 && (
                                <div>{plan.limitations?.staff_members} staff</div>
                              )}
                              {plan.limitations?.sms_credits && (
                                <div>{plan.limitations?.sms_credits} SMS credits</div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              {plan.is_active ? (
                                <Badge variant="default">Active</Badge>
                              ) : (
                                <Badge variant="secondary">Inactive</Badge>
                              )}
                              {plan.is_featured && (
                                <Badge variant="default">Featured</Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleActive(plan)}
                              >
                                {plan.is_active ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleFeatured(plan)}
                              >
                                <Star className={`h-4 w-4 ${plan.is_featured ? 'fill-primary' : ''}`} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openDialog(plan)}
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(plan.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </TabsContent>

            <TabsContent value="preview">
              <div className="grid gap-6 md:grid-cols-3">
                {plans
                  .filter(p => p.is_active)
                  .sort((a, b) => a.display_order - b.display_order)
                  .map((plan) => {
                    const Icon = getPlanIcon(plan.name);
                    return (
                      <Card key={plan.id} className={plan.is_featured ? 'border-primary' : ''}>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <Icon className="h-8 w-8 text-primary" />
                            {plan.is_featured && (
                              <Badge variant="default">Most Popular</Badge>
                            )}
                          </div>
                          <CardTitle>{plan.name}</CardTitle>
                          {plan.description && (
                            <CardDescription>{plan.description}</CardDescription>
                          )}
                        </CardHeader>
                        <CardContent>
                          <div className="mb-4">
                            <div className="flex items-baseline">
                              <span className="text-3xl font-bold">${plan.price}</span>
                              <span className="text-muted-foreground ml-1">
                                {getBillingPeriodLabel(plan.billing_period)}
                              </span>
                            </div>
                            {plan.trial_days && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {plan.trial_days} day free trial
                              </p>
                            )}
                          </div>
                          <div className="space-y-2">
                            {DEFAULT_FEATURES.filter(f => plan.features.includes(f.id)).map((feature) => (
                              <div key={feature.id} className="flex items-start gap-2">
                                <Check className="h-4 w-4 text-primary mt-0.5" />
                                <div className="text-sm">
                                  <div>{feature.name}</div>
                                  <div className="text-muted-foreground">
                                    {feature.description}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                          {plan.limitations && (
                            <div className="mt-4 pt-4 border-t space-y-1">
                              {plan.limitations.appointments_per_month !== -1 && (
                                <div className="text-sm text-muted-foreground">
                                  {plan.limitations.appointments_per_month === -1 ? 'Unlimited' : plan.limitations.appointments_per_month} appointments/month
                                </div>
                              )}
                              {plan.limitations.staff_members !== -1 && (
                                <div className="text-sm text-muted-foreground">
                                  {plan.limitations.staff_members === -1 ? 'Unlimited' : plan.limitations.staff_members} staff members
                                </div>
                              )}
                              {plan.limitations.sms_credits && (
                                <div className="text-sm text-muted-foreground">
                                  {plan.limitations.sms_credits} SMS credits
                                </div>
                              )}
                            </div>
                          )}
                        </CardContent>
                        <CardFooter>
                          <Button className="w-full" variant={plan.is_featured ? 'default' : 'outline'}>
                            Get Started
                          </Button>
                        </CardFooter>
                      </Card>
                    );
                  })}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPlan ? 'Edit Pricing Plan' : 'Create Pricing Plan'}
            </DialogTitle>
            <DialogDescription>
              {editingPlan ? 'Update plan details' : 'Set up a new pricing plan'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Tabs defaultValue="basic">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="features">Features</TabsTrigger>
                <TabsTrigger value="limitations">Limitations</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Plan Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Professional"
                    />
                  </div>
                  <div>
                    <Label htmlFor="price">Price</Label>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                      placeholder="79.99"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Perfect for growing salons..."
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="billing">Billing Period</Label>
                    <Select
                      value={formData.billing_period}
                      onValueChange={(value) => setFormData({ 
                        ...formData, 
                        billing_period: value as PricingPlan['billing_period']
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                        <SelectItem value="one_time">One-time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="trial">Trial Days</Label>
                    <Input
                      id="trial"
                      type="number"
                      value={formData.trial_days}
                      onChange={(e) => setFormData({ ...formData, trial_days: parseInt(e.target.value) || 0 })}
                      placeholder="14"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="setup">Setup Fee (Optional)</Label>
                    <Input
                      id="setup"
                      type="number"
                      value={formData.setup_fee}
                      onChange={(e) => setFormData({ ...formData, setup_fee: parseFloat(e.target.value) || 0 })}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="discount">Discount % (Optional)</Label>
                    <Input
                      id="discount"
                      type="number"
                      value={formData.discount_percentage}
                      onChange={(e) => setFormData({ ...formData, discount_percentage: parseFloat(e.target.value) || 0 })}
                      placeholder="0"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="featured"
                      checked={formData.is_featured}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                    />
                    <Label htmlFor="featured">Featured Plan</Label>
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
              </TabsContent>

              <TabsContent value="features" className="space-y-4 mt-4">
                <div>
                  <Label>Select Features</Label>
                  <div className="space-y-4 mt-2">
                    {['core', 'advanced', 'premium', 'addon'].map((category) => (
                      <div key={category}>
                        <h4 className="font-medium mb-2 capitalize">{category} Features</h4>
                        <div className="space-y-2 ml-4">
                          {DEFAULT_FEATURES
                            .filter(f => f.category === category)
                            .map((feature) => (
                              <div key={feature.id} className="flex items-center space-x-2">
                                <Checkbox
                                  id={feature.id}
                                  checked={formData.features.includes(feature.id)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setFormData({
                                        ...formData,
                                        features: [...formData.features, feature.id]
                                      });
                                    } else {
                                      setFormData({
                                        ...formData,
                                        features: formData.features.filter(f => f !== feature.id)
                                      });
                                    }
                                  }}
                                />
                                <Label htmlFor={feature.id} className="text-sm font-normal">
                                  <div>{feature.name}</div>
                                  <div className="text-muted-foreground">{feature.description}</div>
                                </Label>
                              </div>
                            ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="limitations" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="appointments">Appointments per Month</Label>
                    <Input
                      id="appointments"
                      type="number"
                      value={formData.appointments_limit}
                      onChange={(e) => setFormData({ ...formData, appointments_limit: parseInt(e.target.value) || -1 })}
                      placeholder="-1 for unlimited"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Use -1 for unlimited</p>
                  </div>
                  <div>
                    <Label htmlFor="staff">Staff Members</Label>
                    <Input
                      id="staff"
                      type="number"
                      value={formData.staff_limit}
                      onChange={(e) => setFormData({ ...formData, staff_limit: parseInt(e.target.value) || -1 })}
                      placeholder="-1 for unlimited"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Use -1 for unlimited</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="locations">Locations</Label>
                    <Input
                      id="locations"
                      type="number"
                      value={formData.locations_limit}
                      onChange={(e) => setFormData({ ...formData, locations_limit: parseInt(e.target.value) || -1 })}
                      placeholder="-1 for unlimited"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Use -1 for unlimited</p>
                  </div>
                  <div>
                    <Label htmlFor="sms">SMS Credits</Label>
                    <Input
                      id="sms"
                      type="number"
                      value={formData.sms_credits}
                      onChange={(e) => setFormData({ ...formData, sms_credits: parseInt(e.target.value) || 0 })}
                      placeholder="100"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="storage">Storage (GB)</Label>
                  <Input
                    id="storage"
                    type="number"
                    value={formData.storage_gb}
                    onChange={(e) => setFormData({ ...formData, storage_gb: parseInt(e.target.value) || 1 })}
                    placeholder="5"
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {editingPlan ? 'Update' : 'Create'} Plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}