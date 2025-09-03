import Link from 'next/link'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, Alert, AlertDescription } from '@/components/ui'
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form'
import { ArrowLeft, Mail, Info } from 'lucide-react'
export default function ForgotPasswordPage() {
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
          <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full">
            <Mail className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
        <h1 className="text-2xl font-bold">Reset Your Password</h1>
        <p className="text-muted-foreground">
          Enter your email address and we&apos;ll send you a verification code to reset your password
        </p>
      </div>
      {/* Reset Card */}
      <Card>
        <CardHeader>
          <CardTitle>Password Reset</CardTitle>
          <CardDescription>
            We&apos;ll send you a 6-digit verification code to confirm your identity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ForgotPasswordForm />
        </CardContent>
        <CardFooter>
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Verification codes expire after 10 minutes. If you don&apos;t receive an email within a few minutes, 
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
              <li>Make sure you&apos;re using the email associated with your account</li>
              <li>Check your spam or junk folder for the verification code</li>
              <li>The verification code expires after 10 minutes</li>
              <li>You can request a new code after 60 seconds</li>
            </ul>
          </div>
          <div className="pt-2">
            <p className="text-sm text-muted-foreground">
              Still having trouble? <Link href="/contact" className="text-primary">Contact support</Link>
            </p>
          </div>
        </CardContent>
      </Card>
      {/* Login Options */}
      <div className="text-center text-sm text-muted-foreground">
        <p>Remember your password?</p>
        <div className="flex justify-center gap-4 mt-2">
          <Link href="/login/customer" className="text-primary">
            Customer Login
          </Link>
          <span>•</span>
          <Link href="/login/staff" className="text-primary">
            Staff Login
          </Link>
          <span>•</span>
          <Link href="/login/salon" className="text-primary">
            Salon Owner Login
          </Link>
        </div>
      </div>
    </div>
  )
}