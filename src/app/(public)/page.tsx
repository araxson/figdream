import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowRight, 
  Calendar, 
  Users, 
  TrendingUp, 
  Shield, 
  Star, 
  CheckCircle2,
  Clock,
  Sparkles,
  BarChart3,
  Smartphone,
  CreditCard
} from 'lucide-react'

export default function HomePage() {
  const features = [
    {
      icon: Calendar,
      title: 'Smart Scheduling',
      description: 'Automated booking system with intelligent time slot management'
    },
    {
      icon: Users,
      title: 'Team Management',
      description: 'Complete staff scheduling, payroll, and performance tracking'
    },
    {
      icon: TrendingUp,
      title: 'Business Analytics',
      description: 'Real-time insights to grow your salon business'
    },
    {
      icon: CreditCard,
      title: 'Secure Payments',
      description: 'Integrated payment processing with multiple options'
    },
    {
      icon: Smartphone,
      title: 'Mobile Ready',
      description: 'Access your business from anywhere, anytime'
    },
    {
      icon: Shield,
      title: 'Data Security',
      description: 'Enterprise-grade security for your business data'
    }
  ]

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Salon Owner',
      content: 'FigDream transformed how we manage appointments. Our no-shows dropped by 40%!',
      rating: 5
    },
    {
      name: 'Mike Chen',
      role: 'Barbershop Owner',
      content: 'The analytics dashboard helps me make data-driven decisions for my business.',
      rating: 5
    },
    {
      name: 'Emma Williams',
      role: 'Spa Manager',
      content: 'Our clients love the easy booking system and automated reminders.',
      rating: 5
    }
  ]

  const stats = [
    { value: '10K+', label: 'Active Salons' },
    { value: '500K+', label: 'Monthly Bookings' },
    { value: '98%', label: 'Customer Satisfaction' },
    { value: '24/7', label: 'Support Available' }
  ]

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative w-full overflow-hidden py-20 lg:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="mx-auto max-w-4xl text-center">
            <Badge className="mb-4" variant="secondary">
              <Sparkles className="mr-1 h-3 w-3" />
              Trusted by 10,000+ salons worldwide
            </Badge>
            <h1 className="mb-6 text-4xl font-bold tracking-tight lg:text-6xl">
              The Complete Platform for{' '}
              <span className="text-primary">Modern Salons</span>
            </h1>
            <p className="mb-8 text-xl text-muted-foreground">
              Streamline appointments, manage staff, and grow your beauty business with our all-in-one salon management solution.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/register">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/book">
                  Book Appointment
                </Link>
              </Button>
            </div>
          </div>
        </div>
        <div className="absolute inset-0 -z-10 h-full w-full bg-white dark:bg-gray-950">
          <div className="absolute h-full w-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_60%,transparent_100%)]"></div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="w-full py-12 bg-muted/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-bold text-primary">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Everything You Need to Succeed</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed specifically for beauty and wellness businesses
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <Card key={feature.title} className="border-muted">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-20 bg-muted/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-8 lg:p-12">
              <div className="grid lg:grid-cols-2 gap-8 items-center">
                <div>
                  <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Salon?</h2>
                  <p className="text-lg text-muted-foreground mb-6">
                    Join thousands of successful salons using FigDream to streamline operations and boost revenue.
                  </p>
                  <ul className="space-y-2 mb-8">
                    <li className="flex items-center">
                      <CheckCircle2 className="h-5 w-5 text-primary mr-2" />
                      <span>Free 14-day trial</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle2 className="h-5 w-5 text-primary mr-2" />
                      <span>No credit card required</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle2 className="h-5 w-5 text-primary mr-2" />
                      <span>Cancel anytime</span>
                    </li>
                  </ul>
                  <Button size="lg" asChild>
                    <Link href="/register/salon">
                      Start Your Free Trial
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                </div>
                <div className="relative">
                  <Card className="shadow-xl">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>Dashboard Preview</span>
                        <Badge>Live Demo</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <div className="flex items-center space-x-3">
                            <BarChart3 className="h-5 w-5 text-primary" />
                            <span className="text-sm font-medium">Today&apos;s Revenue</span>
                          </div>
                          <span className="text-lg font-bold">$2,847</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Calendar className="h-5 w-5 text-primary" />
                            <span className="text-sm font-medium">Appointments</span>
                          </div>
                          <span className="text-lg font-bold">24</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Clock className="h-5 w-5 text-primary" />
                            <span className="text-sm font-medium">Avg Wait Time</span>
                          </div>
                          <span className="text-lg font-bold">5 min</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="w-full py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Loved by Salon Owners</h2>
            <p className="text-lg text-muted-foreground">
              See what our customers have to say about FigDream
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.name}>
                <CardHeader>
                  <div className="flex mb-2">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <CardDescription>{testimonial.content}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="w-full py-20 bg-primary text-primary-foreground">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Start Growing Your Salon Today</h2>
          <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
            Join the FigDream community and take your salon business to the next level
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/register">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white/10" asChild>
              <Link href="/contact">
                Talk to Sales
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}