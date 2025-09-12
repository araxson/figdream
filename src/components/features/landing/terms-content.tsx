import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

export function TermsContent() {
  return (
    <>
      <section className="w-full py-20 md:py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge className="mb-4">Legal</Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Terms of Service
            </h1>
            <p className="text-muted-foreground">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </section>
      <section className="w-full py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardContent className="prose prose-gray dark:prose-invert max-w-none p-8">
              <h2>1. Acceptance of Terms</h2>
              <p>By using FigDream, you agree to these terms.</p>
              
              <h2>2. Service Description</h2>
              <p>FigDream provides salon management and booking services.</p>
              
              <h2>3. User Accounts</h2>
              <p>You&apos;re responsible for maintaining account security.</p>
              
              <h2>4. Payment Terms</h2>
              <p>Subscription fees are billed monthly or annually.</p>
              
              <h2>5. Limitation of Liability</h2>
              <p>We&apos;re not liable for indirect or consequential damages.</p>
              
              <h2>6. Termination</h2>
              <p>Either party may terminate with 30 days notice.</p>
              
              <h2>7. Contact</h2>
              <p>Email: legal@figdream.com</p>
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  )
}