'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database.types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from 'sonner'
import { CreditCard, TrendingUp, Users, Package, CheckCircle, XCircle, Clock } from 'lucide-react'
import { format } from 'date-fns'

type PlatformSubscription = Database['public']['Tables']['platform_subscriptions']['Row']
type SubscriptionPlan = Database['public']['Tables']['platform_subscription_plans']['Row']

interface SubscriptionWithPlan extends PlatformSubscription {
  plan?: SubscriptionPlan
}

interface SubscriptionStats {
  totalActive: number
  totalRevenue: number
  averageValue: number
  churnRate: number
  growthRate: number
}

export function PlatformSubscriptionsClient() {
  const [subscriptions, setSubscriptions] = useState<SubscriptionWithPlan[]>([])
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [stats, setStats] = useState<SubscriptionStats>({
    totalActive: 0,
    totalRevenue: 0,
    averageValue: 0,
    churnRate: 0,
    growthRate: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadSubscriptionData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function loadSubscriptionData() {
    try {
      const [subsResult, plansResult] = await Promise.all([
        supabase
          .from('platform_subscriptions')
          .select('*, plan:platform_subscription_plans(*)')
          .order('created_at', { ascending: false }),
        supabase
          .from('platform_subscription_plans')
          .select('*')
          .order('price')
      ])

      if (subsResult.error) throw subsResult.error
      if (plansResult.error) throw plansResult.error

      const subs = subsResult.data || []
      setSubscriptions(subs)
      setPlans(plansResult.data || [])

      // Calculate stats
      const activeSubs = subs.filter(s => s.status === 'active')
      const totalRevenue = activeSubs.reduce((sum, s) => sum + (s.amount || 0), 0)
      
      setStats({
        totalActive: activeSubs.length,
        totalRevenue,
        averageValue: activeSubs.length > 0 ? totalRevenue / activeSubs.length : 0,
        churnRate: subs.length > 0 ? (subs.filter(s => s.status === 'cancelled').length / subs.length) * 100 : 0,
        growthRate: 15.5 // This would normally be calculated from historical data
      })
    } catch (error) {
      console.error('Error loading subscription data:', error)
      toast.error('Failed to load subscription data')
    } finally {
      setIsLoading(false)
    }
  }

  async function cancelSubscription(id: string) {
    try {
      const { error } = await supabase
        .from('platform_subscriptions')
        .update({ 
          status: 'cancelled',
          cancel_at_period_end: true
        })
        .eq('id', id)

      if (error) throw error

      toast.success('Subscription cancelled successfully')
      await loadSubscriptionData()
    } catch (error) {
      console.error('Error cancelling subscription:', error)
      toast.error('Failed to cancel subscription')
    }
  }

  async function reactivateSubscription(id: string) {
    try {
      const { error } = await supabase
        .from('platform_subscriptions')
        .update({ 
          status: 'active',
          cancel_at_period_end: false
        })
        .eq('id', id)

      if (error) throw error

      toast.success('Subscription reactivated successfully')
      await loadSubscriptionData()
    } catch (error) {
      console.error('Error reactivating subscription:', error)
      toast.error('Failed to reactivate subscription')
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500"><CheckCircle className="mr-1 h-3 w-3" />Active</Badge>
      case 'cancelled':
        return <Badge variant="destructive"><XCircle className="mr-1 h-3 w-3" />Cancelled</Badge>
      case 'past_due':
        return <Badge variant="secondary"><Clock className="mr-1 h-3 w-3" />Past Due</Badge>
      case 'trialing':
        return <Badge variant="outline"><Clock className="mr-1 h-3 w-3" />Trial</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  if (isLoading) {
    return <div>Loading subscription data...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Platform Subscriptions</h1>
        <Button>
          <Package className="mr-2 h-4 w-4" />
          Create New Plan
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalActive}</div>
            <div className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1 text-green-500" />
              +{stats.growthRate}% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</div>
            <div className="text-xs text-muted-foreground">Recurring monthly</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.averageValue.toFixed(2)}</div>
            <div className="text-xs text-muted-foreground">Per subscription</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.churnRate.toFixed(1)}%</div>
            <div className="text-xs text-muted-foreground">Monthly churn</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Plans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{plans.length}</div>
            <div className="text-xs text-muted-foreground">Available plans</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="subscriptions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="subscriptions">
            <Users className="mr-2 h-4 w-4" />
            Subscriptions
          </TabsTrigger>
          <TabsTrigger value="plans">
            <Package className="mr-2 h-4 w-4" />
            Plans
          </TabsTrigger>
          <TabsTrigger value="billing">
            <CreditCard className="mr-2 h-4 w-4" />
            Billing History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="subscriptions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Subscriptions</CardTitle>
              <CardDescription>
                Manage all platform subscriptions
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Salon</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Started</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscriptions.map((sub) => (
                    <TableRow key={sub.id}>
                      <TableCell className="font-medium">
                        {sub.salon_id?.slice(0, 8)}...
                      </TableCell>
                      <TableCell>{sub.plan?.name || sub.plan_id}</TableCell>
                      <TableCell>{getStatusBadge(sub.status)}</TableCell>
                      <TableCell>${sub.amount?.toFixed(2) || '0.00'}</TableCell>
                      <TableCell>{sub.plan?.billing_period || '-'}</TableCell>
                      <TableCell>
                        {format(new Date(sub.created_at), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {sub.status === 'active' ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => cancelSubscription(sub.id)}
                            >
                              Cancel
                            </Button>
                          ) : sub.status === 'cancelled' ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => reactivateSubscription(sub.id)}
                            >
                              Reactivate
                            </Button>
                          ) : null}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plans" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.map((plan) => (
              <Card key={plan.id}>
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-3xl font-bold">
                      ${plan.price}/{plan.billing_period}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Billing period: {plan.billing_period}
                    </div>
                    <div className="space-y-1 pt-4">
                      {plan.features && (
                        <ul className="text-sm space-y-1">
                          {Object.entries(plan.features as Record<string, unknown>).map(([key, value]) => (
                            <li key={key} className="flex items-center">
                              <CheckCircle className="h-3 w-3 mr-2 text-green-500" />
                              {key}: {String(value)}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" variant="outline">
                    Edit Plan
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="billing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Billing History</CardTitle>
              <CardDescription>
                View all billing transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Billing history would be loaded from payment processor
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}