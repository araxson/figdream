'use client'

import { Search, Calendar, CheckCircle } from 'lucide-react'

const steps = [
  {
    number: '1',
    icon: Search,
    title: 'Find Your Salon',
    description: 'Browse salons by location, services, ratings, and availability. Filter by your specific needs.'
  },
  {
    number: '2',
    icon: Calendar,
    title: 'Book Appointment',
    description: 'Select your preferred service, stylist, and time slot. Get instant confirmation.'
  },
  {
    number: '3',
    icon: CheckCircle,
    title: 'Enjoy & Review',
    description: 'Show up for your appointment and enjoy. Leave a review to help others.'
  }
]

export function HowItWorksSection() {
  return (
    <section className="py-24 sm:py-32 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            How It Works
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Book your perfect appointment in three simple steps
          </p>
        </div>
        
        <div className="mx-auto mt-16 max-w-5xl">
          <div className="relative">
            {/* Connection line */}
            <div className="absolute left-1/2 top-0 hidden h-full w-0.5 -translate-x-1/2 bg-border lg:block" />
            
            <div className="space-y-12 lg:space-y-20">
              {steps.map((step, index) => (
                <div
                  key={step.number}
                  className={`flex flex-col lg:flex-row items-center gap-8 animate-in fade-in duration-500 [animation-delay:${index * 200}ms] ${
                    index % 2 === 0 ? 'slide-in-from-left-4' : 'slide-in-from-right-4'
                  } ${
                    index % 2 === 1 ? 'lg:flex-row-reverse' : ''
                  }`}
                >
                  <div className="flex-1 text-center lg:text-left">
                    <div className={`space-y-4 ${index % 2 === 1 ? 'lg:text-right' : ''}`}>
                      <h3 className="text-2xl font-bold">{step.title}</h3>
                      <p className="text-muted-foreground max-w-md mx-auto lg:mx-0">
                        {step.description}
                      </p>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <step.icon className="h-10 w-10" />
                    </div>
                    <div className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-background border-2 border-primary text-sm font-bold">
                      {step.number}
                    </div>
                  </div>
                  
                  <div className="flex-1" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}