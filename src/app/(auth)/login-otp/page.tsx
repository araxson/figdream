import { Suspense } from 'react'
import { LoginOTPForm } from '@/components/features/auth/login-otp-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function LoginOTPPage() {
  return (
    <div className="container flex items-center justify-center min-h-screen py-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign in with code</CardTitle>
          <CardDescription>
            We&apos;ll send a verification code to your email address
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={
            <div className="space-y-3">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          }>
            <LoginOTPForm />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}