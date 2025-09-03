'use client'
import { useState } from 'react'
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui'
import { toast } from 'sonner'
import { Building, Mail, MessageSquare, Phone } from 'lucide-react'
export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000))
    toast.success('Message sent successfully! We&apos;ll get back to you soon.')
    setIsSubmitting(false)
    // Reset form
    const form = e.target as HTMLFormElement
    form.reset()
  }
  return (
    <div className="container mx-auto px-4 py-16 max-w-6xl">
      {/* Header */}
      <section className="text-center mb-16">
        <h1 className="text-4xl font-bold tracking-tight lg:text-5xl mb-4">
          Get in Touch
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Have questions about FigDream? We&apos;re here to help. Reach out to our team and we&apos;ll get back to you as soon as possible.
        </p>
      </section>
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Contact Information */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <Phone className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Phone</CardTitle>
              <CardDescription>
                Monday to Friday, 9AM to 6PM EST
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="font-medium">1-800-FIGDREAM</p>
              <p className="text-sm text-muted-foreground">(1-800-344-3732)</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Mail className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Email</CardTitle>
              <CardDescription>
                We&apos;ll respond within 24 hours
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="font-medium">support@figdream.com</p>
              <p className="text-sm text-muted-foreground">For general inquiries</p>
              <p className="font-medium mt-2">sales@figdream.com</p>
              <p className="text-sm text-muted-foreground">For sales questions</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Building className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Office</CardTitle>
              <CardDescription>
                Visit us at our headquarters
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="font-medium">FigDream Inc.</p>
              <p className="text-sm text-muted-foreground">
                123 Innovation Drive<br />
                Suite 400<br />
                San Francisco, CA 94105
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <MessageSquare className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Live Chat</CardTitle>
              <CardDescription>
                Chat with our support team
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Available Monday to Friday<br />
                9AM to 6PM EST
              </p>
              <Button className="mt-3 w-full" variant="outline">
                Start Chat
              </Button>
            </CardContent>
          </Card>
        </div>
        {/* Contact Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Send us a Message</CardTitle>
            <CardDescription>
              Fill out the form below and we&apos;ll get back to you as soon as possible.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    required
                    placeholder="John"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    required
                    placeholder="Doe"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="john@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone (Optional)</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="(555) 123-4567"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="salonName">Salon Name (Optional)</Label>
                <Input
                  id="salonName"
                  name="salonName"
                  placeholder="Your Salon Name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Select name="subject" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General Inquiry</SelectItem>
                    <SelectItem value="sales">Sales Question</SelectItem>
                    <SelectItem value="support">Technical Support</SelectItem>
                    <SelectItem value="billing">Billing Issue</SelectItem>
                    <SelectItem value="partnership">Partnership Opportunity</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  name="message"
                  required
                  placeholder="Tell us how we can help..."
                  rows={6}
                />
              </div>
              <div className="flex gap-4">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </Button>
                <Button type="button" variant="outline" disabled={isSubmitting}>
                  Schedule a Demo
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
      {/* FAQ Section */}
      <section className="mt-16">
        <h2 className="text-3xl font-bold text-center mb-8">
          Quick Answers
        </h2>
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">How do I get started?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Sign up for a free 14-day trial. No credit card required. Our team will help you set up and import your data.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Do you offer training?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Yes! We provide free onboarding, video tutorials, and live training sessions for all new customers.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Can I import my existing data?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Absolutely. We support data import from most salon software and can help migrate your customer and appointment data.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">What&apos;s your support response time?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Email support responds within 24 hours. Priority support for Professional and Enterprise plans responds within 2 hours.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}