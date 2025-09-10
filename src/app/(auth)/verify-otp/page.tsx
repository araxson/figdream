import { Suspense } from 'react'
import { VerifyOTPForm } from '@/components/features/auth/verify-otp-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function VerifyOTPPage() {
  return (
    <div className="container flex items-center justify-center min-h-screen py-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Verify your email</CardTitle>
          <CardDescription>
            Enter the 6-digit code we sent to your email address
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div className="h-32 animate-pulse bg-muted rounded" />}>
            <VerifyOTPForm />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}