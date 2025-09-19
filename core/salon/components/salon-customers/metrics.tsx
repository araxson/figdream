'use client'

import { Users, UserCheck, Star, TrendingUp } from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface CustomerMetrics {
  total: number
  newCustomers: number
  vipCustomers: number
  activeCustomers: number
  conversionRate: string
}

interface CustomerMetricsProps {
  metrics: CustomerMetrics
}

export function CustomerMetrics({ metrics }: CustomerMetricsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.total}</div>
          <p className="text-xs text-muted-foreground">
            {metrics.newCustomers} new this month
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
          <UserCheck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.activeCustomers}</div>
          <p className="text-xs text-muted-foreground">
            {metrics.conversionRate}% engagement rate
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">VIP Customers</CardTitle>
          <Star className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.vipCustomers}</div>
          <p className="text-xs text-muted-foreground">
            High-value customers
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Growth</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">+{metrics.newCustomers}</div>
          <p className="text-xs text-muted-foreground">
            New customers this month
          </p>
        </CardContent>
      </Card>
    </div>
  )
}