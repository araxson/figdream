'use client'

import { useMemo } from 'react'
import {
  Users,
  TrendingUp,
  Star,
  AlertTriangle,
  UserX,
  DollarSign,
  Calendar,
  Award,
  Target,
  Zap,
  UserCheck
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import type { CustomerProfileWithRelations } from '../dal/customers-types'

interface CustomerSegmentsProps {
  customers: CustomerProfileWithRelations[]
  onSegmentClick?: (segment: string, customers: CustomerProfileWithRelations[]) => void
}

interface Segment {
  id: string
  name: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  count: number
  percentage: number
  trend?: number
  customers: CustomerProfileWithRelations[]
  metrics?: {
    avgSpend?: number
    avgVisits?: number
    conversionRate?: number
  }
}

export function CustomerSegments({ customers, onSegmentClick }: CustomerSegmentsProps) {
  // Calculate segments
  const segments = useMemo<Segment[]>(() => {
    const total = customers.length
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)

    // New Customers (joined in last 30 days)
    const newCustomers = customers.filter(c =>
      new Date(c.created_at!) > thirtyDaysAgo
    )

    // VIP Customers
    const vipCustomers = customers.filter(c => c.is_vip === true)

    // Regular Customers (3+ visits)
    const regularCustomers = customers.filter(c =>
      (c.visit_count ?? 0) >= 3 && !c.is_vip
    )

    // At-Risk Customers (no visit in 30-60 days)
    const atRiskCustomers = customers.filter(c => {
      if (!c.last_visit) return false
      const lastVisit = new Date(c.last_visit)
      return lastVisit < thirtyDaysAgo && lastVisit > sixtyDaysAgo
    })

    // Churned Customers (no visit in 90+ days)
    const churnedCustomers = customers.filter(c => {
      if (!c.last_visit) return false
      return new Date(c.last_visit) < ninetyDaysAgo
    })

    // High Value Customers (top 20% by spending)
    const sortedBySpend = [...customers].sort((a, b) =>
      (b.total_spent ?? 0) - (a.total_spent ?? 0)
    )
    const highValueThreshold = Math.ceil(total * 0.2)
    const highValueCustomers = sortedBySpend.slice(0, highValueThreshold)

    // Engaged Customers (active in last 7 days)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const engagedCustomers = customers.filter(c =>
      c.last_visit && new Date(c.last_visit) > sevenDaysAgo
    )

    // Loyal Customers (10+ visits)
    const loyalCustomers = customers.filter(c =>
      (c.visit_count ?? 0) >= 10
    )

    // Calculate metrics for each segment
    const calculateMetrics = (segmentCustomers: CustomerProfileWithRelations[]) => {
      if (segmentCustomers.length === 0) {
        return { avgSpend: 0, avgVisits: 0, conversionRate: 0 }
      }

      const totalSpend = segmentCustomers.reduce((sum, c) => sum + (c.total_spent ?? 0), 0)
      const totalVisits = segmentCustomers.reduce((sum, c) => sum + (c.visit_count ?? 0), 0)
      const activeCustomers = segmentCustomers.filter(c => c.is_active !== false).length

      return {
        avgSpend: totalSpend / segmentCustomers.length,
        avgVisits: totalVisits / segmentCustomers.length,
        conversionRate: (activeCustomers / segmentCustomers.length) * 100
      }
    }

    return [
      {
        id: 'new',
        name: 'New Customers',
        description: 'Joined in the last 30 days',
        icon: Users,
        color: 'text-blue-500',
        count: newCustomers.length,
        percentage: total > 0 ? (newCustomers.length / total) * 100 : 0,
        trend: 12,
        customers: newCustomers,
        metrics: calculateMetrics(newCustomers)
      },
      {
        id: 'vip',
        name: 'VIP Customers',
        description: 'Your most valuable customers',
        icon: Star,
        color: 'text-yellow-500',
        count: vipCustomers.length,
        percentage: total > 0 ? (vipCustomers.length / total) * 100 : 0,
        trend: 5,
        customers: vipCustomers,
        metrics: calculateMetrics(vipCustomers)
      },
      {
        id: 'regular',
        name: 'Regular Customers',
        description: '3+ visits',
        icon: UserCheck,
        color: 'text-green-500',
        count: regularCustomers.length,
        percentage: total > 0 ? (regularCustomers.length / total) * 100 : 0,
        customers: regularCustomers,
        metrics: calculateMetrics(regularCustomers)
      },
      {
        id: 'high-value',
        name: 'High Value',
        description: 'Top 20% by spending',
        icon: DollarSign,
        color: 'text-purple-500',
        count: highValueCustomers.length,
        percentage: total > 0 ? (highValueCustomers.length / total) * 100 : 0,
        trend: 8,
        customers: highValueCustomers,
        metrics: calculateMetrics(highValueCustomers)
      },
      {
        id: 'engaged',
        name: 'Engaged',
        description: 'Active in last 7 days',
        icon: Zap,
        color: 'text-cyan-500',
        count: engagedCustomers.length,
        percentage: total > 0 ? (engagedCustomers.length / total) * 100 : 0,
        customers: engagedCustomers,
        metrics: calculateMetrics(engagedCustomers)
      },
      {
        id: 'loyal',
        name: 'Loyal',
        description: '10+ visits',
        icon: Award,
        color: 'text-indigo-500',
        count: loyalCustomers.length,
        percentage: total > 0 ? (loyalCustomers.length / total) * 100 : 0,
        trend: 3,
        customers: loyalCustomers,
        metrics: calculateMetrics(loyalCustomers)
      },
      {
        id: 'at-risk',
        name: 'At Risk',
        description: 'No visit in 30-60 days',
        icon: AlertTriangle,
        color: 'text-orange-500',
        count: atRiskCustomers.length,
        percentage: total > 0 ? (atRiskCustomers.length / total) * 100 : 0,
        trend: -5,
        customers: atRiskCustomers,
        metrics: calculateMetrics(atRiskCustomers)
      },
      {
        id: 'churned',
        name: 'Churned',
        description: 'No visit in 90+ days',
        icon: UserX,
        color: 'text-red-500',
        count: churnedCustomers.length,
        percentage: total > 0 ? (churnedCustomers.length / total) * 100 : 0,
        trend: -10,
        customers: churnedCustomers,
        metrics: calculateMetrics(churnedCustomers)
      }
    ]
  }, [customers])

  // Top performing segment
  const topSegment = segments.reduce((max, segment) =>
    segment.percentage > max.percentage ? segment : max
  , segments[0])

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Customer Segments</CardTitle>
              <CardDescription>
                Analyze your customer base by behavior and value
              </CardDescription>
            </div>
            <Badge variant="outline" className="ml-auto">
              <Target className="h-3 w-3 mr-1" />
              {customers.length} Total Customers
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            {segments.slice(0, 4).map((segment) => {
              const Icon = segment.icon
              return (
                <TooltipProvider key={segment.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Card
                        className="cursor-pointer hover:bg-accent transition-colors"
                        onClick={() => onSegmentClick?.(segment.id, segment.customers)}
                      >
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <Icon className={`h-4 w-4 ${segment.color}`} />
                            {segment.trend && (
                              <span className={`text-xs font-medium ${
                                segment.trend > 0 ? 'text-green-500' : 'text-red-500'
                              }`}>
                                {segment.trend > 0 ? '+' : ''}{segment.trend}%
                              </span>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{segment.count}</div>
                          <p className="text-xs text-muted-foreground">
                            {segment.name}
                          </p>
                          <Progress
                            value={segment.percentage}
                            className="h-1 mt-2"
                          />
                        </CardContent>
                      </Card>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="space-y-2">
                        <p className="font-semibold">{segment.name}</p>
                        <p className="text-xs">{segment.description}</p>
                        {segment.metrics && (
                          <div className="space-y-1 pt-2 border-t">
                            <p className="text-xs">
                              Avg Spend: ${segment.metrics.avgSpend.toFixed(2)}
                            </p>
                            <p className="text-xs">
                              Avg Visits: {segment.metrics.avgVisits.toFixed(1)}
                            </p>
                          </div>
                        )}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Segments */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Engagement Segments */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Engagement Analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {['engaged', 'regular', 'at-risk', 'churned'].map(id => {
              const segment = segments.find(s => s.id === id)!
              const Icon = segment.icon
              return (
                <div
                  key={segment.id}
                  className="flex items-center justify-between cursor-pointer hover:bg-accent p-2 rounded-lg transition-colors"
                  onClick={() => onSegmentClick?.(segment.id, segment.customers)}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`h-4 w-4 ${segment.color}`} />
                    <div>
                      <p className="text-sm font-medium">{segment.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {segment.description}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{segment.count}</p>
                    <p className="text-xs text-muted-foreground">
                      {segment.percentage.toFixed(1)}%
                    </p>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* Value Segments */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Value Analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {['vip', 'high-value', 'loyal', 'new'].map(id => {
              const segment = segments.find(s => s.id === id)!
              const Icon = segment.icon
              return (
                <div
                  key={segment.id}
                  className="flex items-center justify-between cursor-pointer hover:bg-accent p-2 rounded-lg transition-colors"
                  onClick={() => onSegmentClick?.(segment.id, segment.customers)}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`h-4 w-4 ${segment.color}`} />
                    <div>
                      <p className="text-sm font-medium">{segment.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {segment.description}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{segment.count}</p>
                    {segment.metrics && (
                      <p className="text-xs text-muted-foreground">
                        ${segment.metrics.avgSpend.toFixed(0)} avg
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>

      {/* Segment Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recommended Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {segments.find(s => s.id === 'at-risk')!.count > 0 && (
            <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                <div>
                  <p className="text-sm font-medium">Re-engage At-Risk Customers</p>
                  <p className="text-xs text-muted-foreground">
                    {segments.find(s => s.id === 'at-risk')!.count} customers haven't visited in 30-60 days
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const atRisk = segments.find(s => s.id === 'at-risk')!
                  onSegmentClick?.('at-risk', atRisk.customers)
                }}
              >
                Take Action
              </Button>
            </div>
          )}

          {segments.find(s => s.id === 'new')!.count > 0 && (
            <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <div className="flex items-center gap-3">
                <Users className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-sm font-medium">Welcome New Customers</p>
                  <p className="text-xs text-muted-foreground">
                    {segments.find(s => s.id === 'new')!.count} new customers this month
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const newSeg = segments.find(s => s.id === 'new')!
                  onSegmentClick?.('new', newSeg.customers)
                }}
              >
                Send Welcome
              </Button>
            </div>
          )}

          {segments.find(s => s.id === 'vip')!.count > 0 && (
            <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
              <div className="flex items-center gap-3">
                <Star className="h-4 w-4 text-yellow-500" />
                <div>
                  <p className="text-sm font-medium">Reward VIP Customers</p>
                  <p className="text-xs text-muted-foreground">
                    {segments.find(s => s.id === 'vip')!.count} VIP customers deserve special treatment
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const vip = segments.find(s => s.id === 'vip')!
                  onSegmentClick?.('vip', vip.customers)
                }}
              >
                Create Offer
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}