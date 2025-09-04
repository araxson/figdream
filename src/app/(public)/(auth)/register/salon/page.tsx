import Link from 'next/link'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { RegisterForm } from '@/components/auth/register-form'
import { Building, TrendingUp, Users, BarChart, Zap } from 'lucide-react'
export default function SalonRegistrationPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex justify-center">
          <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full">
            <Building className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
        </div>
        <h1 className="text-2xl font-bold">Grow Your Salon Business</h1>
        <p className="text-muted-foreground">
          Join thousands of salons using FigDream to manage and grow their business
        </p>
      </div>
      {/* Registration Card */}
      <Card>
        <CardHeader>
          <CardTitle>Salon Owner Registration</CardTitle>
          <CardDescription>
            Create your business account to start managing appointments and staff
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RegisterForm 
            role="salon_owner" 
            redirectTo="/salon-owner"
            includePhone={true}
            includeBusinessInfo={true}
          />
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-center text-sm">
            Already have an account?{' '}
            <Link href="/login/salon" className="text-primary">
              Sign in
            </Link>
          </div>
        </CardFooter>
      </Card>
      {/* Benefits Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Why Choose FigDream for Your Salon?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-start space-x-3">
              <Users className="h-5 w-5 text-primary mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Staff Management</p>
                <p className="text-sm text-muted-foreground">
                  Manage schedules, services, and performance for your entire team
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <TrendingUp className="h-5 w-5 text-primary mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Business Growth</p>
                <p className="text-sm text-muted-foreground">
                  Attract new customers and increase revenue with smart tools
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <BarChart className="h-5 w-5 text-primary mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Analytics & Insights</p>
                <p className="text-sm text-muted-foreground">
                  Track performance metrics and make data-driven decisions
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Zap className="h-5 w-5 text-primary mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Automated Operations</p>
                <p className="text-sm text-muted-foreground">
                  Save time with automated bookings, reminders, and payments
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Pricing Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Simple, Transparent Pricing</CardTitle>
          <CardDescription>
            Start with a 30-day free trial, no credit card required
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span>Unlimited appointments</span>
              <span className="text-green-600">✓</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Staff management</span>
              <span className="text-green-600">✓</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Customer database</span>
              <span className="text-green-600">✓</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Analytics dashboard</span>
              <span className="text-green-600">✓</span>
            </div>
            <div className="flex items-center justify-between">
              <span>24/7 support</span>
              <span className="text-green-600">✓</span>
            </div>
          </div>
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <p className="text-sm text-center">
              <span className="font-medium">Free for 30 days</span>, then starting at $49/month
            </p>
          </div>
        </CardContent>
      </Card>
      {/* Other Registration Options */}
      <div className="text-center text-sm text-muted-foreground">
        <p>Different account type?</p>
        <div className="flex justify-center gap-4 mt-2">
          <Link href="/register/customer" className="text-primary">
            Customer
          </Link>
          <span>•</span>
          <Link href="/register/staff" className="text-primary">
            Staff Member
          </Link>
        </div>
      </div>
    </div>
  )
}