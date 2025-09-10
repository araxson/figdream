'use client'

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
    description: 'Access to verified, high-quality salons and experienced professionals.'
  },
  {
    icon: Clock,
    title: 'Real-Time Availability',
    description: 'See live availability and book appointments that fit your schedule.'
  },
  {
    icon: Shield,
    title: 'Secure & Safe',
    description: 'Your data is protected with enterprise-grade security measures.'
  },
  {
    icon: CreditCard,
    title: 'Easy Payments',
    description: 'Multiple payment options with secure transaction processing.'
  },
  {
    icon: MessageSquare,
    title: 'Instant Notifications',
    description: 'Get SMS and email reminders for your upcoming appointments.'
  },
  {
    icon: Users,
    title: 'Loyalty Rewards',
    description: 'Earn points with every booking and unlock exclusive discounts.'
  }
]

export function FeaturesSection() {
  return (
    <section className="py-24 sm:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Everything You Need for Perfect Beauty Care
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Our platform makes it easy to discover, book, and manage your beauty appointments
          </p>
        </div>
        
        <div className="mx-auto mt-16 max-w-7xl">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className={`relative rounded-2xl border bg-card p-8 shadow-sm transition-shadow hover:shadow-md animate-in fade-in slide-in-from-bottom-4 duration-500 [animation-delay:${index * 100}ms]`}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-6 text-lg font-semibold">{feature.title}</h3>
                <p className="mt-2 text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}