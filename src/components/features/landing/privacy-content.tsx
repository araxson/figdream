import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

export function PrivacyContent() {
  return (
    <>
      <section className="w-full py-20 md:py-24 bg-gradient-to-br from-primary/10 to-background">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="text-center">
            <Badge className="mb-4">Legal</Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Privacy Policy
            </h1>
            <p className="text-muted-foreground">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </section>
      <section className="w-full py-16 md:py-20">
        <div className="container mx-auto max-w-4xl px-4">
          <Card>
            <CardContent className="prose prose-gray dark:prose-invert max-w-none p-8">
              <h2>1. Information We Collect</h2>
              <p>Personal information, usage data, and device information.</p>
              
              <h2>2. How We Use Information</h2>
              <p>To provide services, improve user experience, and communicate.</p>
              
              <h2>3. Information Sharing</h2>
              <p>We don&apos;t sell data. We share only as necessary for services.</p>
              
              <h2>4. Data Security</h2>
              <p>We implement industry-standard security measures.</p>
              
              <h2>5. Your Rights</h2>
              <p>Access, correct, delete your data. Contact us for requests.</p>
              
              <h2>6. Contact Us</h2>
              <p>Email: privacy@figdream.com</p>
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  )
}