// import { TeamSection } from '@/components/sections/about/team-section'
// import { MissionSection } from '@/components/sections/about/mission-section'
import { Badge } from '@/components/ui/badge'

export default function AboutPage() {
  return (
    <main className="min-h-screen">
        <section className="w-full py-20 md:py-24 bg-gradient-to-br from-primary/10 to-background">
          <div className="container mx-auto max-w-7xl px-4">
            <div className="text-center">
              <Badge className="mb-4">About Us</Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Transforming Beauty Services
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Founded in 2020, FigDream has been connecting beauty enthusiasts with top-tier professionals, making quality services accessible to everyone.
              </p>
            </div>
          </div>
        </section>
        {/* <MissionSection /> */}
        {/* <TeamSection /> */}
    </main>
  )
}