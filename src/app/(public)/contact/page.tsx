// import { ContactForm } from '@/components/sections/contact/contact-form'
import { Badge } from '@/components/ui/badge'

export default function ContactPage() {
  return (
    <main className="min-h-screen">
        <section className="w-full py-20 md:py-24 bg-gradient-to-br from-primary/10 to-background">
          <div className="container mx-auto max-w-7xl px-4">
            <div className="text-center">
              <Badge className="mb-4">Contact</Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Let&apos;s Connect
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Have questions about our services? We&apos;re here to help and answer 
                any questions you might have.
              </p>
            </div>
          </div>
        </section>
        {/* <ContactForm /> */}
    </main>
  )
}