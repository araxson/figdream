import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Badge,
  Separator,
} from '@/components/ui'
import { HelpCircle, MessageCircle, Phone, Mail } from 'lucide-react'

const faqData = [
  {
    category: "Getting Started",
    questions: [
      {
        question: "How do I book my first appointment?",
        answer: "To book your first appointment, simply navigate to our booking page, select your preferred salon location, choose your service, pick a staff member (or let us choose for you), and select your preferred date and time. You'll need to create an account or log in to complete the booking."
      },
      {
        question: "What information do I need to provide?",
        answer: "You'll need to provide basic information such as your name, email address, phone number, and any specific preferences or allergies. This helps us provide you with the best possible service."
      },
      {
        question: "Can I modify or cancel my appointment?",
        answer: "Yes, you can modify or cancel your appointment up to 24 hours before your scheduled time through your customer dashboard or by contacting the salon directly."
      }
    ]
  },
  {
    category: "Services & Pricing",
    questions: [
      {
        question: "What services do you offer?",
        answer: "We offer a comprehensive range of beauty services including haircuts, styling, coloring, treatments, manicures, pedicures, facials, and spa treatments. Each salon location may have slightly different service offerings."
      },
      {
        question: "How much do services cost?",
        answer: "Pricing varies by service, staff experience level, and location. You can view detailed pricing for each service during the booking process or on our services page."
      },
      {
        question: "Do you offer package deals?",
        answer: "Yes, we offer various package deals and loyalty programs. Check your customer dashboard for current promotions and consider joining our loyalty program for exclusive discounts."
      }
    ]
  },
  {
    category: "Loyalty Program",
    questions: [
      {
        question: "How does the loyalty program work?",
        answer: "Our loyalty program rewards you with points for every service. Points can be redeemed for discounts on future services, exclusive treatments, or gift cards. You'll also receive special member pricing and early access to promotions."
      },
      {
        question: "How do I earn points?",
        answer: "You earn points automatically with every completed service, referrals, reviews, and special promotional activities. Points are credited to your account within 24 hours of service completion."
      },
      {
        question: "When do my points expire?",
        answer: "Loyalty points are valid for 12 months from the date they're earned. We'll send you reminders before your points expire so you don't miss out on rewards."
      }
    ]
  },
  {
    category: "Technical Support",
    questions: [
      {
        question: "I'm having trouble with the booking system",
        answer: "If you're experiencing issues with booking, try refreshing your browser or clearing your cache. If problems persist, contact our technical support team who can assist you with the booking process."
      },
      {
        question: "How do I reset my password?",
        answer: "Click on 'Forgot Password' on the login page, enter your email address, and follow the instructions in the reset email we send you. If you don't receive the email, check your spam folder."
      },
      {
        question: "Can I book appointments through mobile?",
        answer: "Yes, our platform is fully optimized for mobile devices. You can book, modify, and manage your appointments seamlessly from any smartphone or tablet."
      }
    ]
  }
]

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
        {faqData.map((section, sectionIndex) => (
          <Card key={sectionIndex}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {section.category}
                <Badge variant="secondary">{section.questions.length} questions</Badge>
              </CardTitle>
              <CardDescription>
                Common questions about {section.category.toLowerCase()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {section.questions.map((faq, questionIndex) => (
                  <AccordionItem key={questionIndex} value={`${sectionIndex}-${questionIndex}`}>
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
        ))}
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
                <p className="text-sm text-muted-foreground">(555) 123-4567</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <Mail className="h-4 w-4 text-primary" />
              <div>
                <p className="text-sm font-medium">Email us</p>
                <p className="text-sm text-muted-foreground">support@figdream.com</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}