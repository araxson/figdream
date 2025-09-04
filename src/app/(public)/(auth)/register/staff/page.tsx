import Link from 'next/link'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { UserCheck, Lock, Info, ArrowLeft, Mail } from 'lucide-react'

export default function StaffRegistrationPage() {
  return (
    <div className="space-y-6">
      {/* Back to Login */}
      <Link href="/login" className="inline-flex items-center text-sm text-muted-foreground">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to login
      </Link>
      
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex justify-center">
          <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-full">
            <Lock className="h-8 w-8 text-purple-600 dark:text-purple-400" />
          </div>
        </div>
        <h1 className="text-2xl font-bold">Staff Registration</h1>
        <p className="text-muted-foreground">
          Invitation Required
        </p>
      </div>

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Staff Registration is Invitation-Only</CardTitle>
          <CardDescription>
            Staff accounts can only be created by salon owners
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              To join as a staff member, you need an invitation from a salon owner or administrator.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-medium">How it works:</h3>
              <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
                <li>A salon owner sends you an invitation via email</li>
                <li>Click the invitation link in your email</li>
                <li>Create your account using the invitation</li>
                <li>Start managing your appointments and clients</li>
              </ol>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium">Already have an invitation?</h3>
              <p className="text-sm text-muted-foreground">
                Check your email for an invitation link from your salon. The link will allow you to create your staff account.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium">Haven&apos;t received an invitation?</h3>
              <p className="text-sm text-muted-foreground">
                Contact your salon owner or manager to request an invitation. They can send you one from their dashboard.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t">
            <div className="flex items-start space-x-3">
              <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Check Your Email</p>
                <p className="text-sm text-muted-foreground">
                  Invitations are sent via email and expire after 7 days. Make sure to check your spam folder.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button asChild variant="outline" className="w-full">
            <Link href="/login/staff">
              <UserCheck className="mr-2 h-4 w-4" />
              Already have an account? Sign in
            </Link>
          </Button>
        </CardFooter>
      </Card>

      {/* Other Registration Options */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Looking for a different account type?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            <Button asChild variant="outline" className="justify-start">
              <Link href="/register/customer">
                Register as a Customer
              </Link>
            </Button>
            <Button asChild variant="outline" className="justify-start">
              <Link href="/register/salon">
                Register as a Salon Owner
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Help Section */}
      <div className="text-center text-sm text-muted-foreground">
        <p>Need help? <Link href="/contact" className="text-primary hover:underline">Contact Support</Link></p>
      </div>
    </div>
  )
}