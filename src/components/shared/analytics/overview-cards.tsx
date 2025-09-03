'use client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { TrendingUp, TrendingDown, DollarSign, Users, Calendar, Clock } from 'lucide-react'
interface OverviewCardsProps {
  data?: {
    revenue: {
      current: number
      previous: number
      change: number
    }
    appointments: {
      current: number
      previous: number
      change: number
    }
    customers: {
      current: number
      previous: number
      change: number
    }
    utilization: {
      current: number
      previous: number
      change: number
    }
  }
}
export function OverviewCards({ data }: OverviewCardsProps) {
  const cards = [
    {
      title: 'Total Revenue',
      value: `$${data?.revenue.current.toLocaleString() || 0}`,
      change: data?.revenue.change || 0,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Appointments',
      value: data?.appointments.current || 0,
      change: data?.appointments.change || 0,
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Active Customers',
      value: data?.customers.current || 0,
      change: data?.customers.change || 0,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Staff Utilization',
      value: `${data?.utilization.current || 0}%`,
      change: data?.utilization.change || 0,
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ]
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>{card.title}</CardTitle>
            <div className={`p-2 rounded-full ${card.bgColor}`}>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <div className="flex items-center pt-1">
              {card.change > 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              ) : card.change < 0 ? (
                <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
              ) : null}
              <p className={`text-xs ${card.change > 0 ? 'text-green-600' : card.change < 0 ? 'text-red-600' : 'text-muted-foreground'}`}>
                {card.change > 0 ? '+' : ''}{card.change}% from last period
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}