import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Sparkles, 
  Clock, 
  Shield, 
  CreditCard, 
  MessageSquare, 
  Users 
} from 'lucide-react'

const features = [
  {
    icon: Sparkles,
    title: 'Premium Salons',
    description: 'Access to verified, high-quality salons and experienced professionals.',
    badge: 'Popular'
  },
  {
    icon: Clock,
    title: 'Real-Time Availability',
    description: 'See live availability and book appointments that fit your schedule.',
    badge: null
  },
  {
    icon: Shield,
    title: 'Secure & Safe',
    description: 'Your data is protected with enterprise-grade security measures.',
    badge: null
  },
  {
    icon: CreditCard,
    title: 'Easy Payments',
    description: 'Multiple payment options with secure transaction processing.',
    badge: null
  },
  {
    icon: MessageSquare,
    title: 'Instant Notifications',
    description: 'Get SMS and email reminders for your upcoming appointments.',
    badge: 'New'
  },
  {
    icon: Users,
    title: 'Loyalty Rewards',
    description: 'Earn points with every booking and unlock exclusive discounts.',
    badge: null
  }
]

export function FeaturesSection() {
  return (
    <section className="w-full py-8 md:py-12 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center space-y-4 text-center mb-12">
          <h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-6xl">
            Why Choose FigDream
          </h2>
          <p className="leading-normal text-muted-foreground sm:text-lg sm:leading-7">
            Everything you need for the perfect beauty experience
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => {
          const Icon = feature.icon
          return (
            <Card key={feature.title} className="relative">
              {feature.badge && (
                <Badge className="absolute right-2 top-2" variant="secondary">
                  {feature.badge}
                </Badge>
              )}
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="h-6 w-6" />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{feature.description}</CardDescription>
              </CardContent>
            </Card>
          )
        })}
        </div>
      </div>
    </section>
  )
}