import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'
import { CheckCircle, Heart, Shield, Star, Target, Users } from 'lucide-react'
export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-6xl">
      {/* Hero Section */}
      <section className="text-center mb-16">
        <h1 className="text-4xl font-bold tracking-tight lg:text-5xl mb-4">
          About FigDream
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Empowering salons and beauty professionals with innovative technology to the way they manage their business and serve their customers.
        </p>
      </section>
      {/* Mission Section */}
      <section className="mb-16">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
            <p className="text-muted-foreground mb-4">
              At FigDream, we believe that every salon deserves access to powerful, intuitive technology that helps them thrive. Our mission is to streamline salon operations, enhance customer experiences, and drive business growth through our comprehensive platform.
            </p>
            <p className="text-muted-foreground">
              We&apos;re not just building software; we&apos;re creating a community where beauty professionals can focus on what they do best while we handle the rest.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <Target className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">10,000+</CardTitle>
                <CardDescription>Salons Served</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <Users className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">50,000+</CardTitle>
                <CardDescription>Staff Members</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <Star className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">1M+</CardTitle>
                <CardDescription>Bookings Monthly</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <Heart className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">4.9/5</CardTitle>
                <CardDescription>Customer Rating</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>
      {/* Values Section */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-8">Our Core Values</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <Shield className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Trust & Security</CardTitle>
              <CardDescription>
                We prioritize data security and privacy, ensuring your business and customer information is always protected with enterprise-grade security measures.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <Users className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Customer First</CardTitle>
              <CardDescription>
                Every feature we build starts with understanding your needs. We&apos;re committed to delivering solutions that make a real difference in your daily operations.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <Target className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Innovation</CardTitle>
              <CardDescription>
                We continuously evolve our platform with cutting-edge technology, from AI-powered scheduling to predictive analytics, keeping you ahead of the curve.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>
      {/* Story Section */}
      <section className="mb-16">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Our Story</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              FigDream was born from a simple observation: salon owners and beauty professionals were struggling with outdated, fragmented tools that made running their business harder than it needed to be.
            </p>
            <p className="text-muted-foreground">
              Founded in 2020 by a team of technology experts and salon industry veterans, we set out to create a unified platform that would revolutionize how salons operate. We listened to thousands of salon owners, staff members, and customers to understand their pain points and dreams.
            </p>
            <p className="text-muted-foreground">
              Today, FigDream powers thousands of salons across the country, from independent stylists to multi-location chains. We&apos;re proud to be part of their success stories, helping them save time, increase revenue, and deliver exceptional experiences to their customers.
            </p>
          </CardContent>
        </Card>
      </section>
      {/* Team Section */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-8">Why Choose FigDream?</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="flex items-start space-x-3">
            <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h3 className="font-semibold mb-1">Comprehensive Solution</h3>
              <p className="text-sm text-muted-foreground">
                Everything you need in one platform - booking, payments, marketing, analytics, and more.
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h3 className="font-semibold mb-1">24/7 Support</h3>
              <p className="text-sm text-muted-foreground">
                Our dedicated support team is always ready to help you succeed.
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h3 className="font-semibold mb-1">No Hidden Fees</h3>
              <p className="text-sm text-muted-foreground">
                Transparent pricing with no surprises. Pay only for what you use.
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h3 className="font-semibold mb-1">Regular Updates</h3>
              <p className="text-sm text-muted-foreground">
                We continuously improve our platform based on your feedback.
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h3 className="font-semibold mb-1">Industry Expertise</h3>
              <p className="text-sm text-muted-foreground">
                Built by salon professionals, for salon professionals.
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h3 className="font-semibold mb-1">Scalable Platform</h3>
              <p className="text-sm text-muted-foreground">
                Grows with your business, from single chair to multiple locations.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}