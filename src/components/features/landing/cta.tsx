import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  ArrowRight, 
  Sparkles, 
  CheckCircle, 
  Gift,
  Zap,
  Shield,
  Clock,
  CreditCard
} from 'lucide-react'

const benefits = [
  { icon: CheckCircle, text: 'No credit card required' },
  { icon: Zap, text: 'Instant booking confirmation' },
  { icon: Shield, text: '100% secure platform' },
  { icon: Clock, text: '24/7 customer support' }
]

export function CTASection() {
  return (
    <section className="w-full py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="relative overflow-hidden border-2">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-background" />
          
          <CardHeader className="relative text-center pb-4">
            <div className="flex justify-center gap-2 mb-4">
              <Badge variant="default" className="px-3 py-1">
                <Gift className="mr-1 h-3 w-3" />
                Limited Offer
              </Badge>
              <Badge variant="secondary" className="px-3 py-1">
                <Sparkles className="mr-1 h-3 w-3" />
                20% OFF First Booking
              </Badge>
            </div>
            
            <CardTitle className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Ready to Transform Your Beauty Routine?
            </CardTitle>
            
            <CardDescription className="text-lg mt-4 max-w-2xl mx-auto">
              Join thousands of satisfied customers and start booking your perfect appointments today
            </CardDescription>
          </CardHeader>
          
          <CardContent className="relative space-y-8">
            <Alert className="max-w-2xl mx-auto border-primary/20 bg-primary/5">
              <Sparkles className="h-4 w-4 text-primary" />
              <AlertDescription className="text-sm">
                <strong>Special Launch Offer:</strong> Sign up now and get exclusive access to premium features free for 3 months!
              </AlertDescription>
            </Alert>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="group" asChild>
                <Link href="/register">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              
              <Button size="lg" variant="outline" asChild>
                <Link href="/customer/book">
                  Browse Salons
                </Link>
              </Button>
              
              <Button size="lg" variant="ghost" asChild>
                <Link href="/pricing">
                  View Pricing
                </Link>
              </Button>
            </div>
            
            <Separator className="my-8" />
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {benefits.map((benefit) => (
                <div key={benefit.text} className="flex flex-col items-center text-center space-y-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <benefit.icon className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-xs text-muted-foreground">{benefit.text}</span>
                </div>
              ))}
            </div>
          </CardContent>
          
          <CardFooter className="relative justify-center pb-8">
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <CreditCard className="h-4 w-4" />
                <span>Secure payments</span>
              </div>
              <Separator orientation="vertical" className="h-4" />
              <span>Cancel anytime</span>
              <Separator orientation="vertical" className="h-4" />
              <span>No hidden fees</span>
            </div>
          </CardFooter>
        </Card>
        
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Trusted by over <strong>250,000+ customers</strong> and <strong>5,000+ salons</strong> worldwide
          </p>
        </div>
      </div>
    </section>
  )
}