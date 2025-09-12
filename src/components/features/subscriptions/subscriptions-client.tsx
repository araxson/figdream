'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  CreditCard,
  X,
  DollarSign,
  Users,
  TrendingUp,
  Calendar,
  Check,
  AlertTriangle,
  Building,
  RefreshCw,
  FileText,
  Download,
  Ban
} from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { formatCurrency } from '@/lib/utils'

interface Salon {
  id: string
  name: string
  slug: string
  owner_id?: string
}

interface PricingPlan {
  id: string
  name: string
  price: number
  billing_period: 'monthly' | 'yearly' | 'one-time'
  features?: any[]
}

interface Subscription {
  id: string
  salon_id: string
  plan_id: string
  status: string
  current_period_start: string
  current_period_end: string
  cancel_at_period_end: boolean
  amount: number
  created_at: string
  updated_at: string
  stripe_subscription_id?: string | null
  stripe_customer_id?: string | null
  stripe_status?: string | null
  salon?: Salon
  plan?: PricingPlan
}

interface SubscriptionsClientProps {
  subscriptions: Subscription[]
  salons: Salon[]
  plans: PricingPlan[]
  counts: {
    total: number
    active: number
    cancelled: number
    mrr: number
  }
  currentSalonId?: string
}

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  trialing: 'bg-blue-100 text-blue-800',
  past_due: 'bg-yellow-100 text-yellow-800',
  cancelled: 'bg-gray-100 text-gray-800',
  incomplete: 'bg-orange-100 text-orange-800',
  incomplete_expired: 'bg-red-100 text-red-800',
  unpaid: 'bg-red-100 text-red-800'
}

export function SubscriptionsClient({ 
  subscriptions: initialSubscriptions, 
  salons,
  plans,
  counts,
  currentSalonId
}: SubscriptionsClientProps) {
  const router = useRouter()
  const [subscriptions, setSubscriptions] = useState(initialSubscriptions)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSalon, setSelectedSalon] = useState(currentSalonId || '')
  const [selectedStatus, setSelectedStatus] = useState<string>('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    salon_id: '',
    plan_id: '',
    status: 'active'
  })

  // Filter subscriptions
  const filteredSubscriptions = subscriptions.filter(subscription => {
    const matchesSearch = !searchQuery || 
      subscription.salon?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subscription.plan?.name.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesSalon = !selectedSalon || subscription.salon_id === selectedSalon
    const matchesStatus = !selectedStatus || subscription.status === selectedStatus
    
    return matchesSearch && matchesSalon && matchesStatus
  })

  const handleSubmit = async () => {
    if (!formData.salon_id || !formData.plan_id) {
      toast.error('Please select a salon and plan')
      return
    }

    setLoading(true)
    try {
      const url = selectedSubscription 
        ? `/api/admin/subscriptions/${selectedSubscription.id}`
        : '/api/admin/subscriptions'
      
      const selectedPlan = plans.find(p => p.id === formData.plan_id)
      const payload = {
        salon_id: formData.salon_id,
        plan_id: formData.plan_id,
        status: formData.status,
        amount: selectedPlan?.price || 0
      }
      
      const response = await fetch(url, {
        method: selectedSubscription ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save subscription')
      }
      
      const { subscription } = await response.json()
      
      if (selectedSubscription) {
        setSubscriptions(prev => prev.map(s => s.id === subscription.id ? subscription : s))
        toast.success('Subscription updated successfully')
      } else {
        setSubscriptions(prev => [subscription, ...prev])
        toast.success('Subscription created successfully')
      }
      
      setDialogOpen(false)
      resetForm()
    } catch (error) {
      console.error('Error saving subscription:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to save subscription')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (subscription: Subscription) => {
    setSelectedSubscription(subscription)
    setFormData({
      salon_id: subscription.salon_id,
      plan_id: subscription.plan_id,
      status: subscription.status
    })
    setDialogOpen(true)
  }

  const handleCancelSubscription = async () => {
    if (!selectedSubscription) return
    
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/subscriptions/${selectedSubscription.id}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cancel_immediately: false // Cancel at period end
        })
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to cancel subscription')
      }
      
      const { subscription } = await response.json()
      
      setSubscriptions(prev => prev.map(s => 
        s.id === subscription.id ? subscription : s
      ))
      
      toast.success('Subscription will be cancelled at period end')
    } catch (error) {
      console.error('Error cancelling subscription:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to cancel subscription')
    } finally {
      setLoading(false)
      setCancelDialogOpen(false)
      setSelectedSubscription(null)
    }
  }

  const handleReactivateSubscription = async (subscription: Subscription) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/subscriptions/${subscription.id}/reactivate`, {
        method: 'POST'
      })
      
      if (!response.ok) throw new Error('Failed to reactivate subscription')
      
      const { subscription: updated } = await response.json()
      
      setSubscriptions(prev => prev.map(s => 
        s.id === updated.id ? updated : s
      ))
      
      toast.success('Subscription reactivated successfully')
    } catch (error) {
      console.error('Error reactivating subscription:', error)
      toast.error('Failed to reactivate subscription')
    } finally {
      setLoading(false)
    }
  }

  const handleRefundSubscription = async (subscription: Subscription) => {
    if (!confirm('Are you sure you want to issue a refund for this subscription?')) return
    
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/subscriptions/${subscription.id}/refund`, {
        method: 'POST'
      })
      
      if (!response.ok) throw new Error('Failed to process refund')
      
      toast.success('Refund processed successfully')
      router.refresh()
    } catch (error) {
      console.error('Error processing refund:', error)
      toast.error('Failed to process refund')
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadInvoice = async (subscription: Subscription) => {
    try {
      const response = await fetch(`/api/admin/subscriptions/${subscription.id}/invoice`)
      
      if (!response.ok) throw new Error('Failed to download invoice')
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `invoice-${subscription.id}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error downloading invoice:', error)
      toast.error('Failed to download invoice')
    }
  }

  const resetForm = () => {
    setSelectedSubscription(null)
    setFormData({
      salon_id: '',
      plan_id: '',
      status: 'active'
    })
  }

  const formatDate = (date: string) => {
    return format(new Date(date), 'MMM d, yyyy')
  }

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate)
    const now = new Date()
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return diff
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Subscriptions</h1>
          <p className="text-muted-foreground">
            Manage platform subscriptions and billing
          </p>
        </div>
        <Button onClick={() => {
          resetForm()
          setDialogOpen(true)
        }}>
          <Plus className="mr-2 h-4 w-4" />
          New Subscription
        </Button>
      </div>
      
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Subscriptions</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.active}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
            <X className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.cancelled}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(counts.mrr)}</div>
            <p className="text-xs text-muted-foreground">MRR</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search subscriptions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        
        {!currentSalonId && (
          <Select value={selectedSalon} onValueChange={setSelectedSalon}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="All Salons" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Salons</SelectItem>
              {salons.map(salon => (
                <SelectItem key={salon.id} value={salon.id}>
                  {salon.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="trialing">Trialing</SelectItem>
            <SelectItem value="past_due">Past Due</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="unpaid">Unpaid</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Subscriptions Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Salon</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Current Period</TableHead>
              <TableHead>Next Billing</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSubscriptions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <p className="text-muted-foreground">No subscriptions found</p>
                </TableCell>
              </TableRow>
            ) : (
              filteredSubscriptions.map((subscription) => {
                const daysRemaining = getDaysRemaining(subscription.current_period_end)
                const isExpiringSoon = daysRemaining <= 7 && daysRemaining > 0
                
                return (
                  <TableRow key={subscription.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{subscription.salon?.name}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{subscription.plan?.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {subscription.plan?.billing_period}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge className={STATUS_COLORS[subscription.status] || 'bg-gray-100 text-gray-800'}>
                          {subscription.status}
                        </Badge>
                        {subscription.cancel_at_period_end && (
                          <Badge variant="outline" className="gap-1">
                            <Ban className="h-3 w-3" />
                            Cancelling
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {formatCurrency(subscription.amount)}
                        <span className="text-sm text-muted-foreground">
                          /{subscription.plan?.billing_period === 'yearly' ? 'yr' : 'mo'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{formatDate(subscription.current_period_start)}</p>
                        <p className="text-muted-foreground">
                          to {formatDate(subscription.current_period_end)}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {subscription.status === 'active' && !subscription.cancel_at_period_end ? (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">
                            {formatDate(subscription.current_period_end)}
                          </span>
                          {isExpiringSoon && (
                            <AlertTriangle className="h-3 w-3 text-yellow-500" />
                          )}
                        </div>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {subscription.status === 'active' && (
                            <>
                              <DropdownMenuItem onClick={() => handleEdit(subscription)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Subscription
                              </DropdownMenuItem>
                              {!subscription.cancel_at_period_end && (
                                <DropdownMenuItem onClick={() => {
                                  setSelectedSubscription(subscription)
                                  setCancelDialogOpen(true)
                                }}>
                                  <X className="mr-2 h-4 w-4" />
                                  Cancel Subscription
                                </DropdownMenuItem>
                              )}
                            </>
                          )}
                          {subscription.cancel_at_period_end && (
                            <DropdownMenuItem onClick={() => handleReactivateSubscription(subscription)}>
                              <RefreshCw className="mr-2 h-4 w-4" />
                              Reactivate
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => handleDownloadInvoice(subscription)}>
                            <Download className="mr-2 h-4 w-4" />
                            Download Invoice
                          </DropdownMenuItem>
                          {subscription.status === 'active' && (
                            <DropdownMenuItem onClick={() => handleRefundSubscription(subscription)}>
                              <DollarSign className="mr-2 h-4 w-4" />
                              Issue Refund
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedSubscription ? 'Edit Subscription' : 'Create Subscription'}
            </DialogTitle>
            <DialogDescription>
              {selectedSubscription 
                ? 'Update the subscription details'
                : 'Create a new subscription for a salon'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {!selectedSubscription && (
              <div className="space-y-2">
                <Label htmlFor="salon_id">Salon *</Label>
                <Select
                  value={formData.salon_id}
                  onValueChange={(value) => setFormData({ ...formData, salon_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a salon" />
                  </SelectTrigger>
                  <SelectContent>
                    {salons.map(salon => (
                      <SelectItem key={salon.id} value={salon.id}>
                        {salon.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="plan_id">Plan *</Label>
              <Select
                value={formData.plan_id}
                onValueChange={(value) => setFormData({ ...formData, plan_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a plan" />
                </SelectTrigger>
                <SelectContent>
                  {plans.map(plan => (
                    <SelectItem key={plan.id} value={plan.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{plan.name}</span>
                        <span className="ml-2 text-muted-foreground">
                          {formatCurrency(plan.price)}/{plan.billing_period}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {selectedSubscription && (
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="trialing">Trialing</SelectItem>
                    <SelectItem value="past_due">Past Due</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={loading || !formData.salon_id || !formData.plan_id}
            >
              {loading ? 'Saving...' : selectedSubscription ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Confirmation */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Subscription?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this subscription for {selectedSubscription?.salon?.name}? 
              The subscription will remain active until the end of the current billing period.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelSubscription}
              disabled={loading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Cancel Subscription
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}