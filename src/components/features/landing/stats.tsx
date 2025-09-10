'use client'

import CountUp from 'react-countup'

const stats = [
  {
    value: 5000,
    suffix: '+',
    label: 'Partner Salons',
    description: 'Trusted beauty professionals'
  },
  {
    value: 250000,
    suffix: '+',
    label: 'Happy Customers',
    description: 'And counting every day'
  },
  {
    value: 98,
    suffix: '%',
    label: 'Satisfaction Rate',
    description: 'Based on customer reviews'
  },
  {
    value: 24,
    suffix: '/7',
    label: 'Online Booking',
    description: 'Available anytime, anywhere'
  }
]

export function StatsSection() {
  return (
    <section className="py-24 sm:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className={`text-center animate-in fade-in slide-in-from-bottom-4 duration-500 [animation-delay:${index * 100}ms]`}
              >
                <div className="text-4xl font-bold text-primary sm:text-5xl">
                  <CountUp
                    end={stat.value}
                    duration={2.5}
                    enableScrollSpy
                    scrollSpyOnce
                  />
                  <span>{stat.suffix}</span>
                </div>
                <div className="mt-2 text-lg font-semibold">{stat.label}</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  {stat.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}