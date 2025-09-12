'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Plus, Edit2, Trash2, DollarSign, Star, ChevronUp, ChevronDown, Check, X } from 'lucide-react';

interface PricingPlan {
  id: string;
  name: string;
  slug: string;
  monthly_price: number;
  yearly_price: number;
  description: string;
  is_popular: boolean;
  sort_order: number;
  savings_text?: string;
  created_at: string;
  updated_at: string;
}

interface PricingFeature {
  id: string;
  plan_id?: string;
  feature_text: string;
  is_included: boolean;
  is_additional: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export function PricingPlansManager() {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [features, setFeatures] = useState<PricingFeature[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreatePlanOpen, setIsCreatePlanOpen] = useState(false);
  const [isManageFeaturesOpen, setIsManageFeaturesOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);
  const [planForm, setPlanForm] = useState<Partial<PricingPlan>>({
    name: '',
    slug: '',
    monthly_price: 0,
    yearly_price: 0,
    description: '',
    is_popular: false,
    sort_order: 0,
    savings_text: ''
  });
  const [featureForm, setFeatureForm] = useState({
    feature_text: '',
    is_included: true,
    is_additional: false,
    sort_order: 0
  });

  useEffect(() => {
    loadPlans();
    loadFeatures();
  }, []);

  const loadPlans = async () => {
    setLoading(true);
    const supabase = createClient();
    
    try {
      const { data, error } = await supabase
        .from('pricing_plans')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setPlans(data || []);
    } catch (error) {
      console.error('Error loading pricing plans:', error);
      toast.error('Failed to load pricing plans');
    } finally {
      setLoading(false);
    }
  };

  const loadFeatures = async () => {
    const supabase = createClient();
    
    try {
      const { data, error } = await supabase
        .from('pricing_features')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setFeatures(data || []);
    } catch (error) {
      console.error('Error loading features:', error);
    }
  };

  const handleCreatePlan = async () => {
    if (!planForm.name || !planForm.slug) return;
    
    const supabase = createClient();
    
    try {
      const planData = {
        ...planForm,
        updated_at: new Date().toISOString()
      };

      if (selectedPlan) {
        const { error } = await supabase
          .from('pricing_plans')
          .update(planData)
          .eq('id', selectedPlan.id);
        
        if (error) throw error;
        toast.success('Pricing plan updated successfully');
      } else {
        const { error } = await supabase
          .from('pricing_plans')
          .insert([{
            ...planData,
            created_at: new Date().toISOString()
          }]);
        
        if (error) throw error;
        toast.success('Pricing plan created successfully');
      }

      setIsCreatePlanOpen(false);
      setSelectedPlan(null);
      setPlanForm({
        name: '',
        slug: '',
        monthly_price: 0,
        yearly_price: 0,
        description: '',
        is_popular: false,
        sort_order: 0,
        savings_text: ''
      });
      loadPlans();
    } catch (error) {
      console.error('Error saving plan:', error);
      toast.error('Failed to save pricing plan');
    }
  };

  const handleDeletePlan = async (id: string) => {
    const supabase = createClient();
    
    try {
      // Delete associated features first
      await supabase
        .from('pricing_features')
        .delete()
        .eq('plan_id', id);

      // Then delete the plan
      const { error } = await supabase
        .from('pricing_plans')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast.success('Pricing plan deleted');
      loadPlans();
      loadFeatures();
    } catch (error) {
      console.error('Error deleting plan:', error);
      toast.error('Failed to delete pricing plan');
    }
  };

  const handleAddFeature = async () => {
    if (!selectedPlan || !featureForm.feature_text) return;
    
    const supabase = createClient();
    
    try {
      const { error } = await supabase
        .from('pricing_features')
        .insert([{
          plan_id: selectedPlan.id,
          feature_text: featureForm.feature_text,
          is_included: featureForm.is_included,
          is_additional: featureForm.is_additional,
          sort_order: featureForm.sort_order,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);
      
      if (error) throw error;
      
      toast.success('Feature added');
      setFeatureForm({
        feature_text: '',
        is_included: true,
        is_additional: false,
        sort_order: 0
      });
      loadFeatures();
    } catch (error) {
      console.error('Error adding feature:', error);
      toast.error('Failed to add feature');
    }
  };

  const handleDeleteFeature = async (id: string) => {
    const supabase = createClient();
    
    try {
      const { error } = await supabase
        .from('pricing_features')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast.success('Feature deleted');
      loadFeatures();
    } catch (error) {
      console.error('Error deleting feature:', error);
      toast.error('Failed to delete feature');
    }
  };

  const handleUpdateSortOrder = async (id: string, direction: 'up' | 'down') => {
    const supabase = createClient();
    const plan = plans.find(p => p.id === id);
    if (!plan) return;
    
    const newOrder = direction === 'up' ? plan.sort_order - 1 : plan.sort_order + 1;
    const swapPlan = plans.find(p => p.sort_order === newOrder);
    
    if (!swapPlan) return;
    
    try {
      await supabase
        .from('pricing_plans')
        .update({ sort_order: newOrder })
        .eq('id', plan.id);
      
      await supabase
        .from('pricing_plans')
        .update({ sort_order: plan.sort_order })
        .eq('id', swapPlan.id);
      
      loadPlans();
    } catch (error) {
      console.error('Error updating sort order:', error);
      toast.error('Failed to update sort order');
    }
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Pricing Plans</h1>
          <p className="text-muted-foreground">Manage subscription plans and features</p>
        </div>
        <Dialog open={isCreatePlanOpen} onOpenChange={setIsCreatePlanOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Plan
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedPlan ? 'Edit Pricing Plan' : 'Create Pricing Plan'}
              </DialogTitle>
              <DialogDescription>
                Set up plan details and pricing
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label>Plan Name</Label>
                <Input
                  value={planForm.name}
                  onChange={(e) => {
                    setPlanForm({ 
                      ...planForm, 
                      name: e.target.value,
                      slug: generateSlug(e.target.value)
                    });
                  }}
                  placeholder="Professional"
                />
              </div>

              <div>
                <Label>Slug</Label>
                <Input
                  value={planForm.slug}
                  onChange={(e) => setPlanForm({ ...planForm, slug: e.target.value })}
                  placeholder="professional"
                />
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={planForm.description}
                  onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })}
                  placeholder="Perfect for growing salons..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Monthly Price (cents)</Label>
                  <Input
                    type="number"
                    value={planForm.monthly_price}
                    onChange={(e) => setPlanForm({ ...planForm, monthly_price: parseInt(e.target.value) })}
                    placeholder="9900"
                  />
                </div>
                <div>
                  <Label>Yearly Price (cents)</Label>
                  <Input
                    type="number"
                    value={planForm.yearly_price}
                    onChange={(e) => setPlanForm({ ...planForm, yearly_price: parseInt(e.target.value) })}
                    placeholder="99900"
                  />
                </div>
              </div>

              <div>
                <Label>Savings Text</Label>
                <Input
                  value={planForm.savings_text}
                  onChange={(e) => setPlanForm({ ...planForm, savings_text: e.target.value })}
                  placeholder="Save 20%"
                />
              </div>

              <div>
                <Label>Sort Order</Label>
                <Input
                  type="number"
                  value={planForm.sort_order}
                  onChange={(e) => setPlanForm({ ...planForm, sort_order: parseInt(e.target.value) })}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={planForm.is_popular}
                  onCheckedChange={(checked) => setPlanForm({ ...planForm, is_popular: checked })}
                />
                <Label>Mark as Popular</Label>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreatePlanOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreatePlan}>
                {selectedPlan ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        {plans.map((plan) => {
          const planFeatures = features.filter(f => f.plan_id === plan.id);
          const monthlyPrice = (plan.monthly_price / 100).toFixed(2);
          const yearlyPrice = (plan.yearly_price / 100).toFixed(2);
          
          return (
            <Card key={plan.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle>{plan.name}</CardTitle>
                      {plan.is_popular && (
                        <Badge variant="default">
                          <Star className="h-3 w-3 mr-1" />
                          Popular
                        </Badge>
                      )}
                    </div>
                    <CardDescription>{plan.description}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleUpdateSortOrder(plan.id, 'up')}
                      disabled={plan.sort_order === 0}
                    >
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleUpdateSortOrder(plan.id, 'down')}
                      disabled={plan.sort_order === plans.length - 1}
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setSelectedPlan(plan);
                        setIsManageFeaturesOpen(true);
                      }}
                    >
                      Features
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setSelectedPlan(plan);
                        setPlanForm(plan);
                        setIsCreatePlanOpen(true);
                      }}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeletePlan(plan.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Monthly</p>
                    <p className="text-2xl font-bold">${monthlyPrice}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Yearly</p>
                    <p className="text-2xl font-bold">${yearlyPrice}</p>
                    {plan.savings_text && (
                      <Badge variant="secondary">{plan.savings_text}</Badge>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Slug</p>
                    <code className="text-sm">{plan.slug}</code>
                  </div>
                </div>

                {planFeatures.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Features</h4>
                    <ul className="space-y-1">
                      {planFeatures.map((feature) => (
                        <li key={feature.id} className="flex items-center gap-2 text-sm">
                          {feature.is_included ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <X className="h-4 w-4 text-red-500" />
                          )}
                          <span>{feature.feature_text}</span>
                          {feature.is_additional && (
                            <Badge variant="outline" className="text-xs">Add-on</Badge>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Manage Features Dialog */}
      <Dialog open={isManageFeaturesOpen} onOpenChange={setIsManageFeaturesOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Manage Features - {selectedPlan?.name}</DialogTitle>
            <DialogDescription>
              Add and manage features for this plan
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Feature text"
                value={featureForm.feature_text}
                onChange={(e) => setFeatureForm({ ...featureForm, feature_text: e.target.value })}
                className="flex-1"
              />
              <Input
                type="number"
                placeholder="Order"
                value={featureForm.sort_order}
                onChange={(e) => setFeatureForm({ ...featureForm, sort_order: parseInt(e.target.value) })}
                className="w-20"
              />
              <Button onClick={handleAddFeature}>Add</Button>
            </div>

            <div className="flex gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={featureForm.is_included}
                  onCheckedChange={(checked) => setFeatureForm({ ...featureForm, is_included: checked })}
                />
                <Label>Included</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={featureForm.is_additional}
                  onCheckedChange={(checked) => setFeatureForm({ ...featureForm, is_additional: checked })}
                />
                <Label>Add-on</Label>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Feature</TableHead>
                  <TableHead>Included</TableHead>
                  <TableHead>Add-on</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {features
                  .filter(f => f.plan_id === selectedPlan?.id)
                  .map((feature) => (
                    <TableRow key={feature.id}>
                      <TableCell>{feature.feature_text}</TableCell>
                      <TableCell>
                        {feature.is_included ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <X className="h-4 w-4 text-red-500" />
                        )}
                      </TableCell>
                      <TableCell>
                        {feature.is_additional && <Badge variant="outline">Yes</Badge>}
                      </TableCell>
                      <TableCell>{feature.sort_order}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteFeature(feature.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>

          <DialogFooter>
            <Button onClick={() => setIsManageFeaturesOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}