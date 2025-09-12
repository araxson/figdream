import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { TrendingUp, Users, Star, Clock } from 'lucide-react'

const stats = [
  {
    value: 5000,
    suffix: '+',
    label: 'Partner Salons',
    description: 'Trusted beauty professionals',
    progress: 85,
    icon: Users,
    badge: 'Growing'
  },
  {
    value: 250000,
    suffix: '+',
    label: 'Happy Customers',
    description: 'And counting every day',
    progress: 92,
    icon: TrendingUp,
    badge: 'Top Rated'
  },
  {
    value: 98,
    suffix: '%',
    label: 'Satisfaction Rate',
    description: 'Based on customer reviews',
    progress: 98,
    icon: Star,
    badge: 'Excellent'
  },
  {
    value: 24,
    suffix: '/7',
    label: 'Online Booking',
    description: 'Available anytime, anywhere',
    progress: 100,
    icon: Clock,
    badge: 'Always On'
  }
]

export function StatsSection() {
  return (
    <section className="w-full py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-4">
          <Badge variant="outline" className="mb-4">Our Impact</Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Trusted by Thousands
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Join the fastest growing beauty booking platform
          </p>
        </div>
        
        <Separator className="my-8" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <Card key={stat.label} className="relative overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <stat.icon className="h-8 w-8 text-muted-foreground" />
                  <Badge variant="secondary">{stat.badge}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-3xl font-bold">
                    {stat.value.toLocaleString()}{stat.suffix}
                  </div>
                  <CardTitle className="text-base mt-1">{stat.label}</CardTitle>
                  <CardDescription className="text-sm mt-1">
                    {stat.description}
                  </CardDescription>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Achievement</span>
                    <span className="font-medium">{stat.progress}%</span>
                  </div>
                  <Progress value={stat.progress} className="h-2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}