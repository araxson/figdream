import Link from 'next/link'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui'
import { RegisterForm } from '@/components/auth/register-form'
import { UserCheck, Clock, Calendar, TrendingUp, Shield, Award } from 'lucide-react'

export default function StaffRegistrationPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex justify-center">
          <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-full">
            <UserCheck className="h-8 w-8 text-purple-600 dark:text-purple-400" />
          </div>
        </div>
        <h1 className="text-2xl font-bold">Join as a Staff Member</h1>
        <p className="text-muted-foreground">
          Start your career with leading salons in your area
        </p>
      </div>

      {/* Registration Card */}
      <Card>
        <CardHeader>
          <CardTitle>Staff Registration</CardTitle>
          <CardDescription>
            Create your professional account to manage appointments and grow your clientele
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RegisterForm 
            role="staff" 
            redirectTo="/staff"
            includePhone={true}
          />
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-center text-sm">
            Already have an account?{' '}
            <Link href="/login/staff" className="text-primary hover:underline">
              Sign in
            </Link>
          </div>
        </CardFooter>
      </Card>

      {/* Benefits Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Why Join FigDream as Staff?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-start space-x-3">
              <Calendar className="h-5 w-5 text-primary mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Flexible Scheduling</p>
                <p className="text-sm text-muted-foreground">
                  Manage your own calendar and availability
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Clock className="h-5 w-5 text-primary mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Time Management</p>
                <p className="text-sm text-muted-foreground">
                  Efficient booking system saves you time
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <TrendingUp className="h-5 w-5 text-primary mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Performance Tracking</p>
                <p className="text-sm text-muted-foreground">
                  Monitor your earnings and growth metrics
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Award className="h-5 w-5 text-primary mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Build Your Reputation</p>
                <p className="text-sm text-muted-foreground">
                  Collect reviews and showcase your expertise
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Process Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Next Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3 text-sm">
            <li className="flex items-start">
              <span className="font-medium mr-2">1.</span>
              <span>Complete your registration</span>
            </li>
            <li className="flex items-start">
              <span className="font-medium mr-2">2.</span>
              <span>Verify your email address</span>
            </li>
            <li className="flex items-start">
              <span className="font-medium mr-2">3.</span>
              <span>Wait for salon owner to add you to their team</span>
            </li>
            <li className="flex items-start">
              <span className="font-medium mr-2">4.</span>
              <span>Complete your profile and start accepting appointments</span>
            </li>
          </ol>
        </CardContent>
      </Card>

      {/* Other Registration Options */}
      <div className="text-center text-sm text-muted-foreground">
        <p>Different account type?</p>
        <div className="flex justify-center gap-4 mt-2">
          <Link href="/register/customer" className="text-primary hover:underline">
            Customer
          </Link>
          <span>•</span>
          <Link href="/register/salon" className="text-primary hover:underline">
            Salon Owner
          </Link>
        </div>
      </div>
    </div>
  )
}