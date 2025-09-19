'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowUpIcon, ArrowDownIcon, DollarSign, Calendar, Users, Star } from 'lucide-react'
import type { DashboardMetrics } from '../types'

interface MetricsCardsProps {
  metrics: DashboardMetrics | null
  loading?: boolean
}

export function MetricsCards({ metrics, loading }: MetricsCardsProps) {
  if (loading || !metrics) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-24 bg-muted animate-pulse rounded" />
              <div className="h-8 w-8 bg-muted animate-pulse rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-7 w-32 bg-muted animate-pulse rounded mb-1" />
              <div className="h-3 w-20 bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const cards = [
    {
      title: 'Total Revenue',
      value: `$${metrics.totalRevenue.toLocaleString()}`,
      change: metrics.revenueGrowth,
      icon: DollarSign,
      description: 'This month'
    },
    {
      title: 'Appointments',
      value: metrics.totalAppointments.toLocaleString(),
      change: metrics.appointmentGrowth,
      icon: Calendar,
      description: 'This month'
    },
    {
      title: 'Active Customers',
      value: metrics.totalCustomers.toLocaleString(),
      change: metrics.customerGrowth,
      icon: Users,
      description: 'Unique customers'
    },
    {
      title: 'Average Rating',
      value: metrics.averageRating.toFixed(1),
      change: 0,
      icon: Star,
      description: `${metrics.totalStaff} staff members`
    }
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => {
        const Icon = card.icon
        const isPositive = card.change > 0
        const isNeutral = card.change === 0

        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                {!isNeutral && (
                  <>
                    {isPositive ? (
                      <ArrowUpIcon className="mr-1 h-3 w-3 text-green-500" />
                    ) : (
                      <ArrowDownIcon className="mr-1 h-3 w-3 text-red-500" />
                    )}
                    <span className={isPositive ? 'text-green-500' : 'text-red-500'}>
                      {Math.abs(card.change).toFixed(1)}%
                    </span>
                    <span className="ml-1">from last month</span>
                  </>
                )}
                {isNeutral && <span>{card.description}</span>}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}