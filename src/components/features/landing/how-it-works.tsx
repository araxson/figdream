import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Search, Calendar, CheckCircle, MapPin, Clock, CreditCard, Bell, Star, Shield } from 'lucide-react'

const steps = [
  {
    id: 'find',
    icon: Search,
    title: 'Find Your Salon',
    shortDesc: 'Discover salons near you',
    description: 'Browse salons by location, services, ratings, and availability. Filter by your specific needs.',
    details: [
      'Search by location or service type',
      'View real-time availability',
      'Compare prices and services',
      'Read verified customer reviews'
    ]
  },
  {
    id: 'book',
    icon: Calendar,
    title: 'Book Appointment',
    shortDesc: 'Reserve your slot instantly',
    description: 'Select your preferred service, stylist, and time slot. Get instant confirmation.',
    details: [
      'Choose from available time slots',
      'Select your preferred stylist',
      'Add multiple services',
      'Receive instant confirmation'
    ]
  },
  {
    id: 'enjoy',
    icon: CheckCircle,
    title: 'Enjoy & Review',
    shortDesc: 'Experience and share',
    description: 'Show up for your appointment and enjoy. Leave a review to help others.',
    details: [
      'Get reminders before appointment',
      'Check-in easily at salon',
      'Make secure payments',
      'Share your experience'
    ]
  }
]

const faqs = [
  {
    question: 'How do I find salons near me?',
    answer: 'Simply enter your location or enable location services. Our platform will show you all available salons within your preferred distance, along with their services, prices, and real-time availability.'
  },
  {
    question: 'Can I book multiple services at once?',
    answer: 'Yes! You can add multiple services to your booking and our system will automatically calculate the total duration and cost. You can also book services with different stylists if needed.'
  },
  {
    question: 'What if I need to cancel or reschedule?',
    answer: 'You can cancel or reschedule your appointment up to 24 hours before the scheduled time through your dashboard. Some salons may have different cancellation policies which will be shown during booking.'
  },
  {
    question: 'How do payments work?',
    answer: 'Payments can be made securely through our platform or directly at the salon. We support all major credit cards, digital wallets, and some salons also accept cash payments.'
  },
  {
    question: 'Are the reviews verified?',
    answer: 'Yes, all reviews are from verified customers who have actually booked and attended appointments through our platform. This ensures authentic and reliable feedback.'
  }
]

export function HowItWorksSection() {
  return (
    <section className="w-full py-24 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4">How It Works</Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Book in 3 Simple Steps
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Your perfect appointment is just a few clicks away
          </p>
        </div>
        
        <div>
          <Tabs defaultValue="overview" className="space-y-8">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="overview">Step by Step</TabsTrigger>
              <TabsTrigger value="faq">Frequently Asked</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-8">
              <div className="grid gap-6 md:grid-cols-3">
                {steps.map((step, index) => (
                  <Card key={step.id} className="relative overflow-hidden">
                    <div className="absolute top-4 right-4">
                      <Badge variant="secondary">{`Step ${index + 1}`}</Badge>
                    </div>
                    <CardHeader>
                      <div className="mb-4">
                        <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                          <step.icon className="h-6 w-6 text-primary" />
                        </div>
                      </div>
                      <CardTitle>{step.title}</CardTitle>
                      <CardDescription>{step.shortDesc}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        {step.description}
                      </p>
                      <ul className="space-y-2">
                        {step.details.map((detail) => (
                          <li key={detail} className="flex items-start gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                            <span className="text-muted-foreground">{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  <strong>100% Secure:</strong> Your personal information and payment details are protected with enterprise-grade security.
                </AlertDescription>
              </Alert>
            </TabsContent>
            
            <TabsContent value="faq" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Frequently Asked Questions</CardTitle>
                  <CardDescription>
                    Everything you need to know about booking appointments
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {faqs.map((faq, index) => (
                      <AccordionItem key={index} value={`item-${index}`}>
                        <AccordionTrigger className="text-left">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
              
              <div className="grid gap-4 sm:grid-cols-3">
                <Card className="text-center">
                  <CardContent className="pt-6">
                    <Clock className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <div className="text-2xl font-bold">24/7</div>
                    <p className="text-sm text-muted-foreground">Online Booking</p>
                  </CardContent>
                </Card>
                
                <Card className="text-center">
                  <CardContent className="pt-6">
                    <Bell className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <div className="text-2xl font-bold">Instant</div>
                    <p className="text-sm text-muted-foreground">Confirmations</p>
                  </CardContent>
                </Card>
                
                <Card className="text-center">
                  <CardContent className="pt-6">
                    <Star className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <div className="text-2xl font-bold">5000+</div>
                    <p className="text-sm text-muted-foreground">Partner Salons</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </section>
  )
}