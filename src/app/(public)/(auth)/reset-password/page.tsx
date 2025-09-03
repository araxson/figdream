import Link from 'next/link'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, Alert, AlertDescription } from '@/components/ui'
import { ResetPasswordForm } from '@/components/auth/reset-password-form'
import { Lock, AlertTriangle } from 'lucide-react'
export default function ResetPasswordPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex justify-center">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full">
            <Lock className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
        <h1 className="text-2xl font-bold">Set New Password</h1>
        <p className="text-muted-foreground">
          Create a strong password for your account
        </p>
      </div>
      {/* Reset Card */}
      <Card>
        <CardHeader>
          <CardTitle>New Password</CardTitle>
          <CardDescription>
            Enter your new password below. Make sure it&apos;s strong and unique.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResetPasswordForm />
        </CardContent>
        <CardFooter>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              This password reset session is temporary. If it expires, 
              you&apos;ll need to request a new verification code.
            </AlertDescription>
          </Alert>
        </CardFooter>
      </Card>
      {/* Password Requirements */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Password Requirements</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-sm space-y-1">
            <li className="flex items-center space-x-2">
              <span className="text-muted-foreground">•</span>
              <span>At least 8 characters long</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="text-muted-foreground">•</span>
              <span>Include at least one uppercase letter</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="text-muted-foreground">•</span>
              <span>Include at least one lowercase letter</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="text-muted-foreground">•</span>
              <span>Include at least one number</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="text-muted-foreground">•</span>
              <span>Include at least one special character</span>
            </li>
          </ul>
        </CardContent>
      </Card>
      {/* Login Link */}
      <div className="text-center text-sm text-muted-foreground">
        <p>Remember your password?</p>
        <Link href="/login" className="text-primary">
          Back to login
        </Link>
      </div>
    </div>
  )
}