import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign, Users, Calendar, TrendingUp, Store, Star } from 'lucide-react'

export function PlatformMetrics() {
  const metrics = [
    {
      title: 'Total Revenue',
      value: '$124,560',
      change: '+18.2%',
      description: 'vs last month',
      icon: DollarSign,
    },
    {
      title: 'Active Users',
      value: '8,456',
      change: '+12.5%',
      description: 'vs last month',
      icon: Users,
    },
    {
      title: 'Total Bookings',
      value: '3,245',
      change: '+23.1%',
      description: 'vs last month',
      icon: Calendar,
    },
    {
      title: 'Active Salons',
      value: '156',
      change: '+8.3%',
      description: 'vs last month',
      icon: Store,
    },
    {
      title: 'Avg Rating',
      value: '4.8',
      change: '+0.2',
      description: 'vs last month',
      icon: Star,
    },
    {
      title: 'Growth Rate',
      value: '15.7%',
      change: '+3.2%',
      description: 'vs last month',
      icon: TrendingUp,
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
      {metrics.map((metric) => (
        <Card key={metric.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {metric.title}
            </CardTitle>
            <metric.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metric.value}</div>
            <div className="flex items-center gap-1 text-xs">
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">{metric.change}</span>
              <span className="text-muted-foreground">{metric.description}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}