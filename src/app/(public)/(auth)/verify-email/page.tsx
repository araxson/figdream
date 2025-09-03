import Link from 'next/link'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, Alert, AlertDescription } from '@/components/ui'
import { VerifyEmailForm } from '@/components/auth/verify-email-form'
import { Mail, Info } from 'lucide-react'
export default function VerifyEmailPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex justify-center">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full">
            <Mail className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
        <h1 className="text-2xl font-bold">Verify Your Email</h1>
        <p className="text-muted-foreground">
          We sent a verification code to your email address
        </p>
      </div>
      {/* Verification Card */}
      <Card>
        <CardHeader>
          <CardTitle>Email Verification</CardTitle>
          <CardDescription>
            Enter the 6-digit code we sent to your email or click the link in the email
          </CardDescription>
        </CardHeader>
        <CardContent>
          <VerifyEmailForm />
        </CardContent>
        <CardFooter>
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Didn&apos;t receive the email? Check your spam folder or request a new verification code. 
              Verification codes expire after 10 minutes.
            </AlertDescription>
          </Alert>
        </CardFooter>
      </Card>
      {/* Help Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Verification Tips</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <p className="text-sm font-medium">Why verify your email?</p>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Secure your account and protect your data</li>
              <li>Receive important notifications about appointments</li>
              <li>Reset your password when needed</li>
              <li>Get exclusive offers and updates</li>
            </ul>
          </div>
          <div className="pt-2">
            <p className="text-sm text-muted-foreground">
              Having trouble? <Link href="/contact" className="text-primary">Contact support</Link>
            </p>
          </div>
        </CardContent>
      </Card>
      {/* Login Link */}
      <div className="text-center text-sm text-muted-foreground">
        <p>Already verified?</p>
        <Link href="/login" className="text-primary">
          Sign in to your account
        </Link>
      </div>
    </div>
  )
}