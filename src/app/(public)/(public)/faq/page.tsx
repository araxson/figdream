import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Separator,
} from '@/components/ui'
import { HelpCircle, MessageCircle, Phone, Mail } from 'lucide-react'

// FAQ data will be loaded from Supabase when the table is created
const faqData: never[] = [] // Empty array - no mock data allowed
export default function FAQPage() {
  return (
    <div className="container mx-auto py-12 px-4">
      {/* Header Section */}
      <div className="text-center space-y-4 mb-12">
        <div className="flex justify-center">
          <HelpCircle className="h-12 w-12 text-primary mb-4" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight">Frequently Asked Questions</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Find answers to common questions about our services, booking system, and loyalty program.
        </p>
      </div>
      {/* FAQ Sections */}
      <div className="max-w-4xl mx-auto space-y-8">
        {faqData.length > 0 ? (
          // FAQ data will be rendered here when loaded from database
          <></>
        ) : (
          // Empty state - no mock data
          <Card>
            <CardContent className="text-center py-12">
              <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                FAQ content will be loaded from the database when available.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
      <Separator className="my-12" />
      {/* Contact Section */}
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Still have questions?
          </CardTitle>
          <CardDescription>
            Our support team is here to help you with any additional questions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <Phone className="h-4 w-4 text-primary" />
              <div>
                <p className="text-sm font-medium">Call us</p>
                <p className="text-sm text-muted-foreground">Contact info will be loaded from settings</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <Mail className="h-4 w-4 text-primary" />
              <div>
                <p className="text-sm font-medium">Email us</p>
                <p className="text-sm text-muted-foreground">Contact info will be loaded from settings</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}