import Link from 'next/link'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form'
import { ArrowLeft, Mail, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function ForgotPasswordPage() {
  return (
    <div className="space-y-6">
      {/* Back to Login */}
      <Link href="/login" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to login
      </Link>

      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex justify-center">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full">
            <Mail className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
        <h1 className="text-2xl font-bold">Reset Your Password</h1>
        <p className="text-muted-foreground">
          Enter your email address and we'll send you a link to reset your password
        </p>
      </div>

      {/* Reset Card */}
      <Card>
        <CardHeader>
          <CardTitle>Password Reset</CardTitle>
          <CardDescription>
            We'll send you an email with instructions to reset your password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ForgotPasswordForm />
        </CardContent>
        <CardFooter>
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Password reset links expire after 1 hour. If you don't receive an email within a few minutes, 
              please check your spam folder.
            </AlertDescription>
          </Alert>
        </CardFooter>
      </Card>

      {/* Help Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Need Help?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <p className="text-sm font-medium">Common Issues:</p>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Make sure you're using the email associated with your account</li>
              <li>Check your spam or junk folder for the reset email</li>
              <li>The reset link expires after 1 hour</li>
              <li>You can only request a reset once every 10 minutes</li>
            </ul>
          </div>
          <div className="pt-2">
            <p className="text-sm text-muted-foreground">
              Still having trouble? <Link href="/contact" className="text-primary hover:underline">Contact support</Link>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Login Options */}
      <div className="text-center text-sm text-muted-foreground">
        <p>Remember your password?</p>
        <div className="flex justify-center gap-4 mt-2">
          <Link href="/login/customer" className="text-primary hover:underline">
            Customer Login
          </Link>
          <span>•</span>
          <Link href="/login/staff" className="text-primary hover:underline">
            Staff Login
          </Link>
          <span>•</span>
          <Link href="/login/salon-owner" className="text-primary hover:underline">
            Salon Owner Login
          </Link>
        </div>
      </div>
    </div>
  )
}