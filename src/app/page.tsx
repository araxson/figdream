import { HeroSection } from '@/components/features/landing/hero'
import { FeaturesSection } from '@/components/features/landing/features'
import { StatsSection } from '@/components/features/landing/stats'
import { HowItWorksSection } from '@/components/features/landing/how-it-works'
import { TestimonialsSection } from '@/components/features/landing/testimonials'
import { CTASection } from '@/components/features/landing/cta'

export default function Home() {
  return (
    <main className="min-h-screen mt-16">
      <HeroSection />
      <StatsSection />
      <HowItWorksSection />
      <FeaturesSection />
      <TestimonialsSection />
      <CTASection />
    </main>
  )
}
