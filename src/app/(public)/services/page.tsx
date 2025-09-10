// import { ServicesGrid } from '@/components/sections/services/services-grid'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function ServicesPage() {
  return (
    <main className="min-h-screen">
      <section className="w-full py-20 md:py-24 bg-gradient-to-br from-primary/10 to-background">
          <div className="container mx-auto max-w-7xl px-4">
            <div className="text-center">
              <Badge className="mb-4">Services</Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Professional Beauty Services
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
                Discover our wide range of beauty and wellness services delivered 
                by experienced professionals.
              </p>
              <Link href="/book">
                <Button size="lg">Book Now</Button>
              </Link>
            </div>
          </div>
        </section>
        {/* <ServicesGrid /> */}
    </main>
  )
}