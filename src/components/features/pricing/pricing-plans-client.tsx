'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { 
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  DollarSign,
  Users,
  Package,
  TrendingUp,
  Check,
  X,
  Sparkles
} from 'lucide-react'
import { toast } from 'sonner'
import { formatCurrency } from '@/lib/utils'

interface PricingFeature {
  id: string
  plan_id: string
  feature_name: string
  feature_value: string | boolean | number
  display_order: number
}

interface PricingPlan {
  id: string
  name: string
  description: string | null
  price: number
  billing_period: 'monthly' | 'yearly' | 'one-time'
  features?: PricingFeature[]
  is_active: boolean
  is_featured: boolean
  display_order: number
  created_at: string
  subscriptionCount?: number
}

interface PricingPlansClientProps {
  plans: PricingPlan[]
  counts: {
    total: number
    active: number
    subscriptions: number
    monthlyRevenue: number
  }
}

export function PricingPlansClient({ 
  plans: initialPlans, 
  counts
}: PricingPlansClientProps) {
  const [plans, setPlans] = useState(initialPlans)
  const [searchQuery, setSearchQuery] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [featuresDialogOpen, setFeaturesDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    billing_period: 'monthly' as const,
    is_active: true,
    is_featured: false,
    display_order: 0
  })
  const [features, setFeatures] = useState<Array<{ name: string; value: string }>>([
    { name: '', value: '' }
  ])

  // Filter plans
  const filteredPlans = plans.filter(plan => {
    const matchesSearch = !searchQuery || 
      plan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plan.description?.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesSearch
  })

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const url = selectedPlan 
        ? `/api/admin/pricing/${selectedPlan.id}`
        : '/api/admin/pricing'
      
      const response = await fetch(url, {
        method: selectedPlan ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          features: features.filter(f => f.name && f.value)
        })
      })
      
      if (!response.ok) throw new Error('Failed to save pricing plan')
      
      const { plan } = await response.json()
      
      if (selectedPlan) {
        setPlans(prev => prev.map(p => p.id === plan.id ? plan : p))
        toast.success('Pricing plan updated successfully')
      } else {
        setPlans(prev => [...prev, plan].sort((a, b) => a.display_order - b.display_order))
        toast.success('Pricing plan created successfully')
      }
      
      setDialogOpen(false)
      resetForm()
    } catch (error) {
      console.error('Error saving pricing plan:', error)
      toast.error('Failed to save pricing plan')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (plan: PricingPlan) => {
    setSelectedPlan(plan)
    setFormData({
      name: plan.name,
      description: plan.description || '',
      price: plan.price,
      billing_period: plan.billing_period,
      is_active: plan.is_active,
      is_featured: plan.is_featured,
      display_order: plan.display_order
    })
    setFeatures(
      plan.features?.map(f => ({ name: f.feature_name, value: String(f.feature_value) })) || 
      [{ name: '', value: '' }]
    )
    setDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!selectedPlan) return
    
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/pricing/${selectedPlan.id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) throw new Error('Failed to delete pricing plan')
      
      setPlans(prev => prev.filter(p => p.id !== selectedPlan.id))
      toast.success('Pricing plan deleted successfully')
    } catch (error) {
      console.error('Error deleting pricing plan:', error)
      toast.error('Failed to delete pricing plan')
    } finally {
      setLoading(false)
      setDeleteDialogOpen(false)
      setSelectedPlan(null)
    }
  }

  const addFeature = () => {
    setFeatures([...features, { name: '', value: '' }])
  }

  const removeFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index))
  }

  const updateFeature = (index: number, field: 'name' | 'value', value: string) => {
    const updated = [...features]
    updated[index][field] = value
    setFeatures(updated)
  }

  const resetForm = () => {
    setSelectedPlan(null)
    setFormData({
      name: '',
      description: '',
      price: 0,
      billing_period: 'monthly',
      is_active: true,
      is_featured: false,
      display_order: plans.length
    })
    setFeatures([{ name: '', value: '' }])
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pricing Plans</h1>
          <p className="text-muted-foreground">
            Manage subscription plans and pricing tiers
          </p>
        </div>
        <Button onClick={() => {
          resetForm()
          setDialogOpen(true)
        }}>
          <Plus className="mr-2 h-4 w-4" />
          Add Plan
        </Button>
      </div>
      
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Plans</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Plans</CardTitle>
            <Sparkles className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.active}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.subscriptions}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(counts.monthlyRevenue)}</div>
          </CardContent>
        </Card>
      </div>
      
      {/* Pricing Plans Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredPlans.map((plan) => (
          <Card key={plan.id} className={plan.is_featured ? 'border-primary' : ''}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  {plan.is_featured && (
                    <Badge className="mb-2" variant="default">
                      <Sparkles className="mr-1 h-3 w-3" />
                      Featured
                    </Badge>
                  )}
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleEdit(plan)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Plan
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {
                      setSelectedPlan(plan)
                      setFeaturesDialogOpen(true)
                    }}>
                      <Package className="mr-2 h-4 w-4" />
                      Manage Features
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="text-destructive"
                      onClick={() => {
                        setSelectedPlan(plan)
                        setDeleteDialogOpen(true)
                      }}
                      disabled={plan.subscriptionCount && plan.subscriptionCount > 0}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold">
                    {formatCurrency(plan.price)}
                  </span>
                  <span className="text-muted-foreground">
                    /{plan.billing_period}
                  </span>
                </div>
                
                {plan.features && plan.features.length > 0 && (
                  <ul className="space-y-2">
                    {plan.features.slice(0, 5).map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        {typeof feature.feature_value === 'boolean' ? (
                          feature.feature_value ? (
                            <Check className="h-4 w-4 text-green-500 mt-0.5" />
                          ) : (
                            <X className="h-4 w-4 text-red-500 mt-0.5" />
                          )
                        ) : (
                          <Check className="h-4 w-4 text-green-500 mt-0.5" />
                        )}
                        <span className="text-sm">
                          {feature.feature_name}: {
                            typeof feature.feature_value === 'boolean' 
                              ? '' 
                              : feature.feature_value
                          }
                        </span>
                      </li>
                    ))}
                    {plan.features.length > 5 && (
                      <li className="text-sm text-muted-foreground">
                        +{plan.features.length - 5} more features
                      </li>
                    )}
                  </ul>
                )}
                
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <Badge variant={plan.is_active ? 'default' : 'secondary'}>
                      {plan.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {plan.subscriptionCount || 0} subscribers
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create/Edit Plan Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedPlan ? 'Edit Pricing Plan' : 'Create Pricing Plan'}
            </DialogTitle>
            <DialogDescription>
              {selectedPlan 
                ? 'Update the pricing plan details'
                : 'Add a new pricing plan to your platform'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Plan Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Professional"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="price">Price *</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of this plan"
                rows={2}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="billing_period">Billing Period</Label>
              <select
                id="billing_period"
                className="w-full p-2 border rounded"
                value={formData.billing_period}
                onChange={(e) => setFormData({ ...formData, billing_period: e.target.value as any })}
              >
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
                <option value="one-time">One-time</option>
              </select>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Features</Label>
                <Button type="button" size="sm" variant="outline" onClick={addFeature}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Feature
                </Button>
              </div>
              {features.map((feature, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder="Feature name"
                    value={feature.name}
                    onChange={(e) => updateFeature(index, 'name', e.target.value)}
                  />
                  <Input
                    placeholder="Value"
                    value={feature.value}
                    onChange={(e) => updateFeature(index, 'value', e.target.value)}
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={() => removeFeature(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="is_active">Active Status</Label>
                <p className="text-sm text-muted-foreground">
                  Make this plan available for purchase
                </p>
              </div>
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="is_featured">Featured Plan</Label>
                <p className="text-sm text-muted-foreground">
                  Highlight this as a recommended plan
                </p>
              </div>
              <Switch
                id="is_featured"
                checked={formData.is_featured}
                onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading || !formData.name}>
              {loading ? 'Saving...' : selectedPlan ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Pricing Plan?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedPlan?.name}"? 
              {selectedPlan?.subscriptionCount ? (
                <span className="block mt-2 font-semibold text-destructive">
                  This plan has {selectedPlan.subscriptionCount} active subscribers and cannot be deleted.
                </span>
              ) : (
                ' This action cannot be undone.'
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={loading || (selectedPlan?.subscriptionCount && selectedPlan.subscriptionCount > 0)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Plan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}