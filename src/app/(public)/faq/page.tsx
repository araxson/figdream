// import { FAQAccordion } from '@/components/sections/faq/faq-accordion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function FAQPage() {
  return (
    <main className="min-h-screen">
        <section className="w-full py-20 md:py-24 bg-gradient-to-br from-primary/10 to-background">
          <div className="container mx-auto max-w-7xl px-4">
            <div className="text-center">
              <Badge className="mb-4">FAQ</Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Frequently Asked Questions
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
                Find answers to common questions about FigDream
              </p>
              <Link href="/contact">
                <Button variant="outline">
                  Still have questions? Contact us
                </Button>
              </Link>
            </div>
          </div>
        </section>
        {/* <FAQAccordion /> */}
    </main>
  )
}