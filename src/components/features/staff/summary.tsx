import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign, TrendingUp, Calendar, Award } from 'lucide-react'

export function TipsSummary() {
  const stats = [
    {
      title: 'Today\'s Tips',
      value: '$65',
      description: '5 customers',
      icon: DollarSign,
      trend: '+20%',
    },
    {
      title: 'This Week',
      value: '$425',
      description: '32 customers',
      icon: Calendar,
      trend: '+15%',
    },
    {
      title: 'This Month',
      value: '$1,850',
      description: '156 customers',
      icon: TrendingUp,
      trend: '+8%',
    },
    {
      title: 'Best Day',
      value: '$125',
      description: 'Last Saturday',
      icon: Award,
      trend: 'Record',
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {stat.title}
            </CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
              <span className="text-xs text-green-600 font-medium">
                {stat.trend}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}