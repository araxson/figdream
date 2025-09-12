import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowRight, Calendar, MapPin, Star, Sparkles, TrendingUp, Users } from 'lucide-react'

export function HeroSection() {
  return (
    <section className="w-full py-8 md:py-12 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex gap-2 mb-4">
            <Badge variant="secondary">New</Badge>
            <Badge variant="outline">AI-Powered Recommendations</Badge>
          </div>
          
          <h1 className="font-heading text-3xl sm:text-5xl md:text-6xl lg:text-7xl">
            Book Your Perfect Beauty Experience
          </h1>
          
          <p className="max-w-3xl leading-normal text-muted-foreground sm:text-xl sm:leading-8">
            Discover and book appointments at top-rated salons and spas near you. 
            From haircuts to full spa treatments, find your perfect beauty match.
          </p>
          
          <Alert className="max-w-3xl w-full">
            <Sparkles className="h-4 w-4" />
            <AlertDescription>
              <strong>Limited Time Offer:</strong> Get 20% off your first booking with code WELCOME20
            </AlertDescription>
          </Alert>
          
          <div className="flex flex-wrap gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/customer/book">
                Book Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/customer/book">
                Browse Salons
              </Link>
            </Button>
            <Button size="lg" variant="ghost" asChild>
              <Link href="/register">
                For Businesses
              </Link>
            </Button>
          </div>
        </div>

        <Tabs defaultValue="customers" className="mt-12">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="customers">For Customers</TabsTrigger>
          <TabsTrigger value="salons">For Salons</TabsTrigger>
          <TabsTrigger value="features">Key Features</TabsTrigger>
        </TabsList>
        
        <TabsContent value="customers" className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <MapPin className="h-8 w-8 text-primary" />
                <Badge>Popular</Badge>
              </div>
              <CardTitle>Find Nearby</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Discover salons in your area with real-time availability
              </CardDescription>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Calendar className="h-8 w-8 text-primary" />
                <Badge variant="secondary">Easy</Badge>
              </div>
              <CardTitle>Easy Booking</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Book appointments instantly with just a few clicks
              </CardDescription>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Star className="h-8 w-8 text-primary" />
                <Badge variant="outline">Verified</Badge>
              </div>
              <CardTitle>Trusted Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Read verified reviews from real customers
              </CardDescription>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="salons" className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <TrendingUp className="h-8 w-8 text-primary" />
                <Badge>Growth</Badge>
              </div>
              <CardTitle>Increase Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Boost your bookings by up to 40% with our platform
              </CardDescription>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Users className="h-8 w-8 text-primary" />
                <Badge variant="secondary">Manage</Badge>
              </div>
              <CardTitle>Staff Management</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Efficiently manage your team's schedules and services
              </CardDescription>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Sparkles className="h-8 w-8 text-primary" />
                <Badge variant="outline">AI</Badge>
              </div>
              <CardTitle>Smart Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Get insights to optimize your business performance
              </CardDescription>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="features" className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Real-time Availability</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                See live appointment slots and book instantly
              </CardDescription>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Mobile Friendly</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Book on the go with our responsive design
              </CardDescription>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Secure Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Safe and secure payment processing
              </CardDescription>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </section>
  )
}